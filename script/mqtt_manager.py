import subprocess
import requests
import os
import json
from typing import Dict
import psutil
from datetime import datetime

API_URL = "http://localhost:3000"
PROCESSES_FILE = "mqtt_processes.json"
LOGS_DIR = "logs"  # Nueva constante para el directorio de logs

class MQTTManager:
    def __init__(self):
        self.processes: Dict[str, int] = {}  # Almacenamos PIDs en lugar de objetos Popen
        # Crear directorio de logs si no existe
        if not os.path.exists(LOGS_DIR):
            os.makedirs(LOGS_DIR)
        self.load_processes()

    def load_processes(self):
        """Carga los PIDs guardados de procesos anteriores y verifica si siguen activos"""
        if os.path.exists(PROCESSES_FILE):
            with open(PROCESSES_FILE, 'r') as f:
                saved_processes = json.load(f)
                for server_id, pid in saved_processes.items():
                    if psutil.pid_exists(pid):
                        self.processes[server_id] = pid  # Almacenamos el PID si el proceso sigue activo

    def save_processes(self):
        """Guarda los PIDs de los procesos actuales"""
        processes_dict = {
            server_id: pid
            for server_id, pid in self.processes.items()
            if psutil.pid_exists(pid)  # Solo guardamos PIDs de procesos activos
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
        # Primero verificamos si el servidor existe
        servers = self.get_servers()
        server_exists = any(str(server['id']) == str(server_id) for server in servers)
        
        if not server_exists:
            print(f"No existe ningún servidor con ID {server_id}")
            return False

        if server_id in self.processes and psutil.pid_exists(self.processes[server_id]):
            print(f"El cliente para el servidor {server_id} ya está en ejecución")
            return False

        try:
            # Crear nombre de archivo de log con timestamp
            timestamp = datetime.now().strftime('%Y%m%d')
            log_file = os.path.join(LOGS_DIR, f"mqtt_client_{server_id}_{timestamp}.log")
            
            # Abrir archivo de log
            with open(log_file, 'a') as f:
                f.write(f"\n--- Nueva sesión iniciada {datetime.now()} ---\n")
                process = subprocess.Popen(
                    ['python', 'mqtt_client.py', str(server_id)],
                    stdout=f,
                    stderr=subprocess.STDOUT,  # Redirigir stderr a stdout
                    text=True
                )
            
            self.processes[server_id] = process.pid  # Guardamos el PID del proceso iniciado
            print(f"Cliente MQTT iniciado para servidor {server_id} con PID {process.pid}")
            print(f"Logs disponibles en: {log_file}")
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

        pid = self.processes[server_id]
        try:
            process = psutil.Process(pid)
            if process.is_running():
                process.terminate()  # Intenta terminar el proceso de forma segura
                try:
                    process.wait(timeout=5)  # Espera hasta 5 segundos
                except psutil.TimeoutExpired:
                    process.kill()  # Si no responde, lo mata forzosamente
                print(f"Cliente MQTT detenido para servidor {server_id}")
            else:
                print(f"El proceso con PID {pid} no está activo")
        except psutil.NoSuchProcess:
            print(f"El proceso con PID {pid} no existe")
        except Exception as e:
            print(f"Error al detener cliente para servidor {server_id}: {e}")
            return False

        del self.processes[server_id]
        self.save_processes()
        return True

    def check_status(self):
        """Verifica y actualiza el estado de todos los clientes MQTT"""
        print("\nComprobando estado de los clientes MQTT...")
        print("----------------------------------------")
        
        servers = self.get_servers()
        server_ids = {str(server['id']) for server in servers}
        
        print("1. Verificando clientes que deben detenerse...")
        for server_id in list(self.processes.keys()):
            if server_id not in server_ids:
                print(f"  → Deteniendo cliente {self.processes[server_id]} (servidor {server_id} ya no existe)")
                self.stop_client(server_id)
        
        print("\n2. Verificando clientes que deben iniciarse o reiniciarse...")
        for server in servers:
            server_id = str(server['id'])
            if server_id not in self.processes:
                print(f"  → Iniciando nuevo cliente para servidor {server_id} ({server['name']})")
                self.start_client(server_id)
            elif not psutil.pid_exists(self.processes[server_id]):
                print(f"  → Reiniciando cliente caído para servidor {server_id} ({server['name']})")
                self.stop_client(server_id)
                self.start_client(server_id)
        
        print("\n3. Actualización completada.")
        print("----------------------------------------")

    def show_status(self):
        """Muestra el estado actual de todos los procesos"""
        servers = self.get_servers()
        server_map = {str(server['id']): server for server in servers}
        
        print("\nEstado de los clientes MQTT:")
        print("-" * 90)  # Aumentado para acomodar la nueva columna
        print(f"{'ID':^5} | {'Nombre':^20} | {'Estado':^10} | {'PID':^10} | {'Log':^30}")
        print("-" * 90)
        
        # Mostrar servidores activos
        for server_id, pid in self.processes.items():
            server = server_map.get(server_id, {'name': 'Desconocido'})
            status = "Activo" if psutil.pid_exists(pid) else "Detenido"
            
            # Buscar el archivo de log más reciente para este servidor
            log_file = self._get_latest_log(server_id)
            log_name = os.path.basename(log_file) if log_file else '-'
            
            print(f"{server_id:^5} | {server['name'][:20]:^20} | {status:^10} | {pid:^10} | {log_name[:30]:^30}")
        
        # Mostrar servidores sin proceso
        for server in servers:
            server_id = str(server['id'])
            if server_id not in self.processes:
                print(f"{server_id:^5} | {server['name'][:20]:^20} | {'Detenido':^10} | {'-':^10} | {'-':^30}")
        print("-" * 90)

    def _get_latest_log(self, server_id):
        """Obtiene el archivo de log más reciente para un servidor específico"""
        if not os.path.exists(LOGS_DIR):
            return None
            
        logs = [f for f in os.listdir(LOGS_DIR) if f.startswith(f"mqtt_client_{server_id}_")]
        if not logs:
            return None
            
        return max([os.path.join(LOGS_DIR, f) for f in logs], key=os.path.getctime)

def main():
    manager = MQTTManager()
    
    while True:
        print("\nGestor de Clientes MQTT")
        print("1. Mostrar estado")
        print("2. Iniciar cliente")
        print("3. Detener cliente")
        print("4. Verificar y actualizar procesos")
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
                print("\nIniciando verificación completa del sistema...")
                manager.check_status()
                print("\nMostrando estado actual después de la actualización:")
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
