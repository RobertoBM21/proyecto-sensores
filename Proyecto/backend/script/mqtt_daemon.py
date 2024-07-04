import paho.mqtt.client as mqtt
import requests
import json
from datetime import datetime
import threading

# URL de la API hecha con Express
API_URL = "http://localhost:3000"
TOPIC = "#"  # Para suscribirse a todos los topics

def get_servers():
    response = requests.get(f"{API_URL}/servers")
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error al obtener servidores: {response.status_code}")
        return []

def on_connect(client, userdata, flags, rc):
    print(f"Conectado con código {rc} a {client._host}")
    client.subscribe(TOPIC)

def on_message(client, userdata, msg):
    print(f"Mensaje recibido en {client._host}: {msg.topic} {msg.payload}")

    # Procesar el topic para conseguir el apikey y serial
    parts = msg.topic.split('/')
    
    # Comprobar si el topic tiene el formato esperado: /apikey/serial/...
    if len(parts) >= 3 and parts[0] == '' and parts[1] and parts[2]:
        apikey = parts[1]
        serial = parts[2]
        
        # Construir el resto del topic después del serial
        topic = '/'.join(parts[3:])
        
        # Crear el objeto de mensaje con apikey, serial y el resto del topic
        message = {
            "serial": serial,
            "timestamp": datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
            "topic": topic,
            "content": json.loads(msg.payload.decode())
        }
    else:
        # Si el formato no es /apikey/serial/..., guardar el topic entero
        message = {
            "serial": "",
            "timestamp": datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
            "topic": msg.topic,
            "content": json.loads(msg.payload.decode())
        }

    # Enviar el mensaje a la API
    response = requests.post(f"{API_URL}/messages", json=message)
    if response.status_code == 201:
        print("Mensaje enviado a la API")
    else:
        print(f"Error al enviar el mensaje a la API: {response.status_code}")

    # Comprobar y actualizar/crear el dispositivo en la base de datos solo si hay serial
    if 'serial' in message:
        update_or_create_device(serial, apikey, message["timestamp"], userdata["server_id"])

def update_or_create_device(serial, apikey, last_communication, server_id):
    # Verificar si el dispositivo ya existe
    response = requests.get(f"{API_URL}/devices?serial={serial}")
    if response.status_code == 200 and response.json():
        # El dispositivo existe, actualizar lastCommunication
        device = response.json()[0]
        update_payload = {"lastCommunication": last_communication}
        response = requests.patch(f"{API_URL}/devices/{device['serial']}", json=update_payload)
        if response.status_code == 200:
            print("Dispositivo actualizado en la API")
        else:
            print(f"Error al actualizar el dispositivo en la API: {response.status_code}")
    else:
        # El dispositivo no existe, crear uno nuevo
        new_device = {
            "serial": serial,
            "apikey": apikey,
            "lastCommunication": last_communication,
            "serverId": server_id
        }
        response = requests.post(f"{API_URL}/devices", json=new_device)
        if response.status_code == 201:
            print("Dispositivo creado en la API")
        else:
            print(f"Error al crear el dispositivo en la API: {response.status_code}")

def start_client(endpoint, username, password, server_id):
    broker, port = endpoint.split(':')
    port = int(port)
    client = mqtt.Client()
    client.username_pw_set(username, password)
    client.on_connect = on_connect
    client.on_message = on_message

    # Almacenar el ID del servidor en userdata para acceder a él en el callback
    client.user_data_set({"server_id": server_id})

    client.connect(broker, port, 60)
    client.loop_forever()

def main():
    servers = get_servers()
    if not servers:
        print("No se encontraron servidores en la base de datos")
        return

    # Crear y arrancar un hilo por cada servidor MQTT
    threads = []
    for server in servers:
        thread = threading.Thread(target=start_client, args=(server["endpoint"], server["username"], server["password"], server["id"]))
        threads.append(thread)
        thread.start()

if __name__ == "__main__":
    main()
