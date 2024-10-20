import paho.mqtt.client as mqtt
import requests
import json
from datetime import datetime
import threading
import logging

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,  # Nivel mínimo de mensajes a capturar
    format='%(asctime)s - %(levelname)s - %(message)s',  # Formato de los mensajes
    datefmt='%Y-%m-%d %H:%M:%S'  # Formato de la fecha y hora
)

# URL de la API
API_URL = "http://localhost:3000"
TOPIC = "#"  # Suscrición a todos los topics

def get_servers():
    try:
        response = requests.get(f"{API_URL}/servers")
        if response.status_code == 200:
            servers = response.json()
            if not servers:
                logging.info("GET /servers - Respuesta exitosa pero sin servidores.")
            return servers
        else:
            logging.error(f"Error al obtener servidores: {response.status_code}")
            return []
    except requests.exceptions.RequestException as e:
        logging.error(f"Excepción al obtener servidores: {e}")
        return []

def on_connect(client, userdata, flags, reasonCode, properties=None):
    if reasonCode == mqtt.CONNACK_ACCEPTED:
        logging.info(f"Conectado a {client._host}")
        client.subscribe(TOPIC)
    else:
        reason = mqtt.reason_codes.ConnectReasonCode.to_str(reasonCode)
        logging.error(f"Error en la conexión a {client.host}: {reasonCode} - {reason}")

def on_message(client, userdata, msg):
    logging.info(f"Mensaje recibido desde {client._host} con topic: {msg.topic}, y contenido: {msg.payload}")

    # Procesar el topic para conseguir el apikey y serial
    parts = msg.topic.split('/')

    # Comprobar si el topic tiene el formato esperado: /apikey/serial/...
    if len(parts) >= 3 and parts[0] == '' and parts[1] and parts[2]:
        apikey = parts[1]
        serial = parts[2]

        # Construir el resto del topic después del serial
        topic = '/'.join(parts[3:])

        # Crear el objeto de mensaje con apikey, serial y el resto del topic
        try:
            content = json.loads(msg.payload.decode())
        except json.JSONDecodeError as e:
            logging.error(f"Error al decodificar el contenido JSON: {e}")
            return

        message = {
            "serial": serial,
            "timestamp": datetime.now().isoformat(),
            "topic": topic,
            "content": content
        }
    else:
        #! Si el formato del topic no es correcto, descartamos el mensaje al no poder identificar el dispositivo
        logging.warning("Formato de topic incorrecto. Mensaje descartado.") 
        return

    # Comprobar y actualizar/crear el dispositivo en la base de datos solo si hay serial
    if 'serial' in message and message['serial']:
        update_or_create_device(message['serial'], apikey, message["timestamp"], userdata["server_id"])

    # Enviar el mensaje a la API
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
        # Verificar si el dispositivo ya existe
        response = requests.get(f"{API_URL}/devices/serial/{serial}")
        if response.status_code == 200 and response.json():
            # El dispositivo existe, actualizar lastCommunication
            device = response.json()
            update_payload = {"lastCommunication": last_communication}
            patch_response = requests.patch(f"{API_URL}/devices/{device['id']}", json=update_payload)
            if patch_response.status_code == 200:
                logging.info(f"Dispositivo {serial} actualizado en la base de datos")
            else:
                logging.error(f"Error al actualizar el dispositivo {serial} en la base de datos: {patch_response.status_code} - {patch_response.text}")
        else:
            # El dispositivo no existe, crear uno nuevo
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

def start_client(endpoint, username, password, server_id):
    try:
        broker, port = endpoint.split(':')
        port = int(port)
    except ValueError:
        logging.error(f"Formato de endpoint inválido: {endpoint}")
        return

    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.username_pw_set(username, password)
    client.on_connect = on_connect
    client.on_message = on_message

    # Almacenar el ID del servidor en userdata para acceder a él en el callback
    client.user_data_set({"server_id": server_id})
    
    try:
        client.connect(broker, port, 60)
    except Exception as e:
        logging.error(f"Error al conectar al broker {broker}:{port} - {e}")

    client.loop_forever(retry_first_connection=True)

def main():
    servers = get_servers()
    if not servers:
        logging.info("No se encontraron servidores en la base de datos")
        return

    # Crear y arrancar un hilo por cada servidor MQTT
    threads = []
    for server in servers:
        thread = threading.Thread(target=start_client, args=(server["endpoint"], server.get("username"), server.get("password"), server["id"]))
        threads.append(thread)
        thread.start()
        logging.info(f"Hilo iniciado para el servidor MQTT: {server['name']}")

if __name__ == "__main__":
    main()
