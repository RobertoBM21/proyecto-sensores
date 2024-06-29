import paho.mqtt.client as mqtt
import requests
import json
from datetime import datetime
import threading

# URL del json-server
JSON_SERVER_URL = "http://localhost:3000"
TOPIC = "#"  # Para suscribirse a todos los topics
USERNAME = "8hHjQnvZ9TnZ3QVgrzkhnF2G4xunJW"
PASSWORD = "9xPkYtJ8eMBvJYNMXRd6kkMhFdZVhz" # Credenciales de prueba

def get_servers():
    response = requests.get(f"{JSON_SERVER_URL}/servers")
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
    apikey = parts[1]
    serial = parts[2]

    # Crear el objeto de mensaje
    message = {
        "serial": serial,
        "timestamp": datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
        "messageType": parts[3],
        "content": json.loads(msg.payload.decode())
    }

    # Enviar el mensaje a json-server
    response = requests.post(f"{JSON_SERVER_URL}/messages", json=message)
    if response.status_code == 201:
        print("Mensaje enviado a json-server")
    else:
        print(f"Error al enviar el mensaje a json-server: {response.status_code}")

    # Comprobar y actualizar/crear el dispositivo en la base de datos
    update_or_create_device(serial, apikey, message["timestamp"], userdata["server_id"])

def update_or_create_device(serial, apikey, last_communication, server_id):
    # Verificar si el dispositivo ya existe
    response = requests.get(f"{JSON_SERVER_URL}/devices?serial={serial}")
    if response.status_code == 200 and response.json():
        # El dispositivo existe, actualizar lastCommunication
        device = response.json()[0]
        update_payload = {"lastCommunication": last_communication}
        response = requests.patch(f"{JSON_SERVER_URL}/devices/{device['id']}", json=update_payload)
        if response.status_code == 200:
            print("Dispositivo actualizado en json-server")
        else:
            print(f"Error al actualizar el dispositivo en json-server: {response.status_code}")
    else:
        # El dispositivo no existe, crear uno nuevo
        new_device = {
            "serial": serial,
            "apikey": apikey,
            "lastCommunication": last_communication,
            "serverId": server_id
        }
        response = requests.post(f"{JSON_SERVER_URL}/devices", json=new_device)
        if response.status_code == 201:
            print("Dispositivo creado en json-server")
        else:
            print(f"Error al crear el dispositivo en json-server: {response.status_code}")

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
        thread = threading.Thread(target=start_client, args=(server["endpoint"], USERNAME, PASSWORD, server["serverId"]))
        threads.append(thread)
        thread.start()

if __name__ == "__main__":
    main()
