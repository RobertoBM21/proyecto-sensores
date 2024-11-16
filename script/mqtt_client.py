# Importaciones de la biblioteca estándar
import os
import sys
import json
import signal
import logging
import argparse
from datetime import datetime, timezone
from binascii import unhexlify

# Importaciones de terceros
import paho.mqtt.client as mqtt
import requests
from dotenv import load_dotenv
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend

# Carga las variables de entorno
load_dotenv()

# Variables de entorno y valores por defecto
ENV_VARS = {
    'API_URL': 'http://localhost:3000',
    'MQTT_TOPIC': '#',
    'ENCRYPTION_KEY': None,  # Requerida, sin valor por defecto
    'LOG_LEVEL': 'INFO'      # Se puede sobrescribir con --debug
}

# Variables globales
client = None  # Cliente MQTT (para manejo de señales)
config = None  # Configuración validada de variables de entorno

# Funciones de configuración y logging
def setup_logging():
    """Configura el sistema de logging según variables de entorno"""
    log_level = os.environ.get('LOG_LEVEL', ENV_VARS['LOG_LEVEL'])
    logging.basicConfig(
        level=getattr(logging, log_level),
        format='%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

def validate_environment():
    """Valida y devuelve la configuración de variables de entorno"""
    config = {}
    missing_vars = []
    
    for var_name, default_value in ENV_VARS.items():
        value = os.getenv(var_name, default_value)
        if value is None:
            missing_vars.append(var_name)
        config[var_name] = value
            
    if missing_vars:
        print(f"ERROR: Faltan las siguientes variables de entorno requeridas: {', '.join(missing_vars)}")
        sys.exit(1)
    
    return config

def parse_arguments():
    """Procesa los argumentos de línea de comandos"""
    parser = argparse.ArgumentParser(
        description='Cliente MQTT para recolección de datos de sensores',
        epilog='Ejemplo: python mqtt_client.py 1 --debug'
    )
    parser.add_argument('server_id', 
                       type=int,
                       help='ID del servidor MQTT al que conectarse')
    parser.add_argument('--debug', 
                       action='store_true',
                       help='Activa el modo debug (sobrescribe LOG_LEVEL)')
    return parser.parse_args()

# Funciones de utilidad
def decrypt(encrypted_text):
    """Descifra un texto cifrado con AES-CBC."""
    encrypted, iv_hex = encrypted_text.split(':')
    key = unhexlify(config['ENCRYPTION_KEY'])
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
    global client
    if client:
        try:
            logging.info("Cerrando cliente MQTT...")
            client.loop_stop() 
            client.disconnect()
        except Exception as e:
            logging.error(f"Error al cerrar el cliente MQTT: {e}")
    logging.info("Saliendo del programa...")
    logging.shutdown()
    sys.exit(0)

#! Configuración de señales
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)
if os.name == 'nt':
    # En Windows, manejar SIGBREAK
    signal.signal(signal.SIGBREAK, signal_handler)

# Funciones de API
def get_server(server_id):
    """Obtiene la configuración de un servidor MQTT desde la API."""
    try:
        response = requests.get(f"{config['API_URL']}/servers/{server_id}")
        if response.status_code == 200:
            server = response.json()
            if not server:
                logging.error(f"No se encontró el servidor con ID {server_id}")
                return None
            return server
        else:
            logging.error(f"Error al obtener el servidor {server_id}: {response.status_code}")
    except requests.exceptions.RequestException as e:
        logging.error(f"Excepción al obtener el servidor {server_id}: {e}")
    return None

def update_or_create_device(serial, apikey, last_communication, server_id):
    """Actualiza o crea un dispositivo en la base de datos."""
    try:
        response = requests.get(f"{config['API_URL']}/devices/serial/{serial}")
        if response.status_code == 200 and response.json():
            device = response.json()
            update_payload = {"lastCommunication": last_communication}
            patch_response = requests.patch(f"{config['API_URL']}/devices/{device['id']}", json=update_payload)
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
            post_response = requests.post(f"{config['API_URL']}/devices", json=new_device)
            if post_response.status_code == 201:
                logging.info(f"Dispositivo {serial} guardado en la base de datos")
            else:
                logging.error(f"Error al guardar el dispositivo {serial} en la base de datos: {post_response.status_code} - {post_response.text}")
    except requests.exceptions.RequestException as e:
        logging.error(f"Excepción al actualizar/crear dispositivo {serial}: {e}")

# Callbacks MQTT
def on_connect(client, userdata, flags, reasonCode, properties=None):
    """Callback de conexión MQTT."""
    if reasonCode == mqtt.CONNACK_ACCEPTED:
        logging.info(f"Conectado a {client._host}")
        client.subscribe(config['MQTT_TOPIC'])
    else:
        reason = mqtt.connack_string(reasonCode)
        logging.error(f"Error en la conexión a {client._host}: {reasonCode} - {reason}")

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
        response = requests.post(f"{config['API_URL']}/messages", json=message)
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
    """Función principal con mejor manejo de configuración"""
    # Procesar argumentos
    args = parse_arguments()
    
    # Establecer configuración global
    if args.debug:
        os.environ['LOG_LEVEL'] = 'DEBUG'
    
    global config
    config = validate_environment()
    
    # Configurar logging
    setup_logging()
        
    # Obtener configuración del servidor
    server = get_server(args.server_id)
    if not server:
        logging.error(f"No se pudo obtener el servidor {args.server_id}")
        sys.exit(1)

    # Configurar y ejecutar cliente
    global client
    client = setup_client(server)    
    logging.info("Cliente MQTT iniciado correctamente")
    client.loop_forever(retry_first_connection=True)

if __name__ == "__main__":
    main()
