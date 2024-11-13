# Importaciones de la biblioteca estándar
import os
import sys
import json
import signal
import logging
from datetime import datetime, timezone
from binascii import unhexlify

# Importaciones de terceros
import paho.mqtt.client as mqtt
import requests
from dotenv import load_dotenv
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend

# Cargar variables de entorno al inicio
load_dotenv()

# Configuración del logging y constantes
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Usar variables de entorno
API_URL = os.getenv('API_URL', 'http://localhost:3000')
TOPIC = os.getenv('MQTT_TOPIC', '#')
ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY')

# Funciones de utilidad
def decrypt(encrypted_text):
    """Descifra un texto cifrado con AES-CBC."""
    encrypted, iv_hex = encrypted_text.split(':')
    key = unhexlify(ENCRYPTION_KEY)
    iv = unhexlify(iv_hex)
    ciphertext = unhexlify(encrypted)
    
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    decrypted = decryptor.update(ciphertext) + decryptor.finalize()
    
    unpadder = padding.PKCS7(128).unpadder()
    data = unpadder.update(decrypted) + unpadder.finalize()
    
    return data.decode('utf-8')

def signal_handler(sig, frame):
    """Manejador de señales para un cierre limpio."""
    logging.info("Cerrando cliente MQTT...")
    sys.exit(0)

# Configuración de señales
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

# Funciones de API
def get_server(server_id):
    try:
        response = requests.get(f"{API_URL}/servers/{server_id}")
        if response.status_code == 200:
            server = response.json()
            if not server:
                logging.error(f"No se encontró el servidor con ID {server_id}")
                return None
            return server
        else:
            logging.error(f"Error al obtener el servidor {server_id}: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        logging.error(f"Excepción al obtener el servidor {server_id}: {e}")
        return None

def update_or_create_device(serial, apikey, last_communication, server_id):
    try:
        response = requests.get(f"{API_URL}/devices/serial/{serial}")
        if response.status_code == 200 and response.json():
            device = response.json()
            update_payload = {"lastCommunication": last_communication}
            patch_response = requests.patch(f"{API_URL}/devices/{device['id']}", json=update_payload)
            if patch_response.status_code == 200:
                logging.info(f"Dispositivo {serial} actualizado en la base de datos")
            else:
                logging.error(f"Error al actualizar el dispositivo {serial} en la base de datos: {patch_response.status_code} - {patch_response.text}")
        else:
            new_device = {
                "serial": serial,
                "apikey": apikey,
                "lastCommunication": last_communication,
                "serverId": server_id
            }
            post_response = requests.post(f"{API_URL}/devices", json=new_device)
            if post_response.status_code == 201:
                logging.info(f"Dispositivo {serial} guardado en la base de datos")
            else:
                logging.error(f"Error al guardar el dispositivo {serial} en la base de datos: {post_response.status_code} - {post_response.text}")
    except requests.exceptions.RequestException as e:
        logging.error(f"Excepción al actualizar/crear dispositivo {serial}: {e}")

# Callbacks MQTT
def on_connect(client, userdata, flags, reasonCode, properties=None):
    if reasonCode == mqtt.CONNACK_ACCEPTED:
        logging.info(f"Conectado a {client._host}")
        client.subscribe(TOPIC)
    else:
        reason = mqtt.reason_codes.ConnectReasonCode.to_str(reasonCode)
        logging.error(f"Error en la conexión a {client._host}: {reasonCode} - {reason}")
        
def on_disconnect(client, userdata, reasonCode, properties=None):
    """Callback para manejar desconexiones"""
    if reasonCode == 0:
        logging.info("Desconexión limpia del broker")
    else:
        logging.warning(f"Desconexión inesperada del broker, código: {reasonCode}")

def on_message(client, userdata, msg):
    """
    Procesa los mensajes MQTT recibidos.
    Formato esperado del topic: /apikey/serial/...
    """
    logging.info(f"Mensaje recibido desde {client._host} con topic: {msg.topic}, y contenido: {msg.payload}")

    parts = msg.topic.split('/')
    if len(parts) >= 3 and parts[0] == '' and parts[1] and parts[2]:
        apikey = parts[1]
        serial = parts[2]
        topic = '/'.join(parts[3:])

        try:
            content = json.loads(msg.payload.decode())
        except json.JSONDecodeError as e:
            logging.error(f"Error al decodificar JSON: {e}")
            return

        message = {
            "serial": serial,
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "topic": topic,
            "content": content
        }
        logging.info(f"Timestamp: {message['timestamp']}")
    else:
        logging.warning(f"Mensaje descartado. Topic con formato inválido: {msg.topic}")
        return

    # Actualizar/crear dispositivo
    if 'serial' in message and message['serial']:
        update_or_create_device(message['serial'], apikey, message["timestamp"], userdata["server_id"])

    # Enviar mensaje a la API
    try:
        response = requests.post(f"{API_URL}/messages", json=message)
        if response.status_code == 201:
            logging.info("Mensaje guardado en la base de datos")
        else:
            logging.error(f"Error al guardar el mensaje en la base de datos: {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as e:
        logging.error(f"Excepción al enviar mensaje a la API: {e}")

# Configuración y ejecución
def setup_client(server):
    """
    Configura y conecta un cliente MQTT para el servidor especificado.
    Devuelve el cliente configurado o termina el programa si hay error.
    """
    try:
        broker, port = server["endpoint"].split(':')
        port = int(port)
    except ValueError:
        logging.error(f"Endpoint inválido: {server['endpoint']}")
        sys.exit(1)

    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    try:
        decrypted_password = decrypt(server["password"])
        client.username_pw_set(server["username"], decrypted_password)
    except Exception as e:
        logging.error(f"Error al desencriptar la contraseña: {e}")
        sys.exit(1)
    
    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.on_message = on_message
    client.user_data_set({"server_id": server["id"]})
    
    try:
        client.connect(broker, port, 60)
        logging.info(f"Iniciando cliente para servidor: {server['name']} ({server['endpoint']})")
        return client
    except Exception as e:
        logging.error(f"Error de conexión: {e}")
        sys.exit(1)

def main():
    # Verificar todas las variables de entorno necesarias
    required_env_vars = ['ENCRYPTION_KEY']
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    
    if missing_vars:
        logging.error(f"Faltan las siguientes variables de entorno: {', '.join(missing_vars)}")
        sys.exit(1)
        
    if len(sys.argv) != 2:
        logging.error("Uso: python mqtt_client.py <server_id>")
        sys.exit(1)

    server_id = sys.argv[1]
    server = get_server(server_id)
    
    if not server:
        logging.error(f"No se pudo obtener el servidor {server_id}")
        sys.exit(1)

    client = setup_client(server)
    client.loop_forever(retry_first_connection=True)

if __name__ == "__main__":
    main()
