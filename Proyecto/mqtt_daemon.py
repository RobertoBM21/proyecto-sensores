import paho.mqtt.client as mqtt
import requests
import json
from datetime import datetime
import threading

# PROBLEMA: NO MUERE CON CTRL+C

# Configuración de los servidores MQTT
SERVERS = [
    {"broker": "agriculture-dev.odins.es", "port": 11883, "username": "8hHjQnvZ9TnZ3QVgrzkhnF2G4xunJW", "password": "9xPkYtJ8eMBvJYNMXRd6kkMhFdZVhz"},
    # Si tengo mas brokers los añado aquí
]

# URL del json-server
JSON_SERVER_URL = "http://localhost:3000/messages"
TOPIC = "#" # Para suscribirse a todos los topics

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
        "timestamp": datetime.now().isoformat(),
        "messageType": "attrs",
        "content": json.loads(msg.payload.decode())
    }

    # Enviar el mensaje a json-server
    response = requests.post(JSON_SERVER_URL, json=message)
    if response.status_code == 201:
        print("Mensaje enviado a json-server")
    else:
        print(f"Error al enviar el mensaje a json-server: {response.status_code}")

def start_client(broker, port, username, password):
    client = mqtt.Client()
    client.username_pw_set(username, password)
    client.on_connect = on_connect
    client.on_message = on_message

    client.connect(broker, port, 60)
    client.loop_forever()

# Crear y arrancar un hilo por cada servidor MQTT
threads = []
for server in SERVERS:
    thread = threading.Thread(target=start_client, args=(server["broker"], server["port"], server["username"], server["password"]))
    threads.append(thread)
    thread.start()
