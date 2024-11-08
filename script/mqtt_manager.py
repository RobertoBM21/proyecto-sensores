import subprocess
import requests
import signal
import sys
import os
import json
import time
from typing import Dict

API_URL = "http://localhost:3000"
PROCESSES_FILE = "mqtt_processes.json"

class MQTTManager:
    def __init__(self):
        self.processes: Dict[str, subprocess.Popen] = {}
        self.load_processes()

    def load_processes(self):
        """Carga los PIDs guardados de procesos anteriores y verifica si siguen activos"""
        if os.path.exists(PROCESSES_FILE):
            with open(PROCESSES_FILE, 'r') as f:
                saved_processes = json.load(f)
                for server_id, pid in saved_processes.items():
                    try:
                        # Verifica si el proceso existe
                        os.kill(pid, 0)
                        # Si existe, recreamos el objeto Popen
                        self.processes[server_id] = subprocess.Popen(['_dummy_'], pid=pid)
                    except OSError:
                        # El proceso ya no existe
                        pass

    def save_processes(self):
        """Guarda los PIDs de los procesos actuales"""
        processes_dict = {
            server_id: process.pid 
            for server_id, process in self.processes.items()
            if process.poll() is None  # Solo guarda procesos activos
        }
        with open(PROCESSES_FILE, 'w') as f:
            json.dump(processes_dict, f)

    def get_servers(self):
        """Obtiene la lista de servidores desde la API"""
        try:
            response = requests.get(f"{API_URL}/servers")
            if response.status_code == 200:
                return response.json()
        except requests.RequestException as e:
            print(f"Error al obtener servidores: {e}")
        return []

    def start_client(self, server_id):
        """Inicia un nuevo cliente MQTT para un servidor específico"""
        if server_id in self.processes and self.processes[server_id].poll() is None:
            print(f"El cliente para el servidor {server_id} ya está en ejecución")
            return False

        try:
            process = subprocess.Popen(
                ['python', 'mqtt_client.py', str(server_id)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            self.processes[server_id] = process
            print(f"Cliente MQTT iniciado para servidor {server_id} con PID {process.pid}")
            self.save_processes()
            return True
        except Exception as e:
            print(f"Error al iniciar cliente para servidor {server_id}: {e}")
            return False

    def stop_client(self, server_id):
        """Detiene un cliente MQTT específico"""
        if server_id not in self.processes:
            print(f"No se encontró cliente para el servidor {server_id}")
            return False

        process = self.processes[server_id]
        if process.poll() is None:  # El proceso está en ejecución
            try:
                process.send_signal(signal.SIGTERM)
                process.wait(timeout=5)
                print(f"Cliente MQTT detenido para servidor {server_id}")
                del self.processes[server_id]
                self.save_processes()
                return True
            except subprocess.TimeoutExpired:
                process.kill() # Forzar la terminación
                print(f"Cliente MQTT terminado forzosamente para servidor {server_id}")
                del self.processes[server_id]
                self.save_processes()
                return True
            except Exception as e:
                print(f"Error al detener cliente para servidor {server_id}: {e}")
                return False
        else:
            del self.processes[server_id]
            self.save_processes()
            return True

    def check_status(self):
        """Verifica el estado de todos los procesos"""
        servers = self.get_servers()
        server_ids = {str(server['id']) for server in servers}
        
        # Verificar procesos que deberían detenerse
        for server_id in list(self.processes.keys()):
            if server_id not in server_ids:
                print(f"Deteniendo cliente para servidor {server_id} (servidor ya no existe)")
                self.stop_client(server_id)
        
        # Verificar procesos que deberían iniciarse
        for server in servers:
            server_id = str(server['id'])
            if server_id not in self.processes:
                print(f"Iniciando nuevo cliente para servidor {server_id}")
                self.start_client(server_id)
            elif self.processes[server_id].poll() is not None:
                print(f"Reiniciando cliente caído para servidor {server_id}")
                self.stop_client(server_id)
                self.start_client(server_id)

    def show_status(self):
        """Muestra el estado actual de todos los procesos"""
        servers = self.get_servers()
        server_map = {str(server['id']): server for server in servers}
        
        print("\nEstado de los clientes MQTT:")
        print("-" * 60)
        print(f"{'ID':^5} | {'Nombre':^20} | {'Estado':^10} | {'PID':^10}")
        print("-" * 60)
        
        # Mostrar servidores activos
        for server_id, process in self.processes.items():
            server = server_map.get(server_id, {'name': 'Desconocido'})
            status = "Activo" if process.poll() is None else "Detenido"
            print(f"{server_id:^5} | {server['name'][:20]:^20} | {status:^10} | {process.pid:^10}")
        
        # Mostrar servidores sin proceso
        for server in servers:
            server_id = str(server['id'])
            if server_id not in self.processes:
                print(f"{server_id:^5} | {server['name'][:20]:^20} | {'Detenido':^10} | {'-':^10}")
        print("-" * 60)

def main():
    manager = MQTTManager()
    
    while True:
        print("\nGestor de Clientes MQTT")
        print("1. Mostrar estado")
        print("2. Iniciar cliente")
        print("3. Detener cliente")
        print("4. Verificar y actualizar estado")
        print("5. Salir")
        
        try:
            option = input("\nSeleccione una opción: ")
            
            if option == '1':
                manager.show_status()
            
            elif option == '2':
                server_id = input("Ingrese el ID del servidor: ")
                manager.start_client(server_id)
            
            elif option == '3':
                server_id = input("Ingrese el ID del servidor: ")
                manager.stop_client(server_id)
            
            elif option == '4':
                manager.check_status()
                manager.show_status()
            
            elif option == '5':
                print("Deteniendo todos los clientes...")
                for server_id in list(manager.processes.keys()):
                    manager.stop_client(server_id)
                break
            
            else:
                print("Opción no válida")
                
        except KeyboardInterrupt:
            print("\nDeteniendo el gestor...")
            for server_id in list(manager.processes.keys()):
                manager.stop_client(server_id)
            break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()
