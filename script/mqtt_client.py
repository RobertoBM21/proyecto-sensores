import paho.mqtt.client as mqtt
import requests
import json
from datetime import datetime, timezone
import logging
import sys
import signal

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# URL de la API
API_URL = "http://localhost:3000"
TOPIC = "#"  # Suscrición a todos los topics

def signal_handler(sig, frame):
    logging.info("Cerrando cliente MQTT...")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

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
    logging.info(f"Mensaje recibido desde {client._host} con topic: {msg.topic}, y contenido: {msg.payload}")

    # Procesar el topic para conseguir el apikey y serial
    parts = msg.topic.split('/')

    # Comprobar si el topic tiene el formato esperado: /apikey/serial/...
    if len(parts) >= 3 and parts[0] == '' and parts[1] and parts[2]:
        apikey = parts[1]
        serial = parts[2]
        topic = '/'.join(parts[3:])

        try:
            content = json.loads(msg.payload.decode())
        except json.JSONDecodeError as e:
            logging.error(f"Error al decodificar el contenido JSON: {e}")
            return

        message = {
            "serial": serial,
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "topic": topic,
            "content": content
        }
        logging.info(f"Timestamp: {message['timestamp']}")
    else:
        #! Si el formato del topic no es correcto, descartamos el mensaje al no poder identificar el dispositivo
        logging.warning("Formato de topic incorrecto. Mensaje descartado.") 
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

def setup_client(server):
    # Configura y retorna un cliente MQTT para el servidor especificado
    try:
        broker, port = server["endpoint"].split(':')
        port = int(port)
    except ValueError:
        logging.error(f"Formato de endpoint inválido: {server['endpoint']}")
        sys.exit(1)

    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.username_pw_set(server["username"], server["password"])   
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
    if len(sys.argv) != 2:
        print("Uso: python mqtt_client.py <server_id>")
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
