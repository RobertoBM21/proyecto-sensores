import subprocess
import requests
import os
import json
from typing import Dict
import psutil
from datetime import datetime
import threading
import argparse

API_URL = "http://localhost:3000"
PROCESSES_FILE = "mqtt_processes.json"
LOGS_DIR = "logs" 
REFRESH_INTERVAL = 30  # Intervalo de refresco en segundos

class MQTTManager:
    """Gestor de procesos para clientes MQTT"""
    def __init__(self, refresh_interval=REFRESH_INTERVAL):
        self.refresh_interval = refresh_interval  # Añadir el intervalo como atributo
        self.processes: Dict[str, int] = {} # Diccionario para almacenar PIDs de procesos
        if not os.path.exists(LOGS_DIR):    # Crear directorio de logs si no existe
            os.makedirs(LOGS_DIR)
        self.load_processes()
        self._setup_auto_refresh()
        self.blocked_servers = set()  # Conjunto para almacenar IDs de servidores bloqueados

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
            if psutil.pid_exists(pid)
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

    def start_client(self, server_id, verbose=True):
        """
        Inicia un nuevo cliente MQTT para un servidor específico.
        Verifica la existencia del servidor y crea un archivo de log para el proceso.
        Args:
            server_id: ID del servidor
            verbose (bool): Si es True, muestra mensajes en consola
        """
        # Remover del conjunto de bloqueados si existe
        self.blocked_servers.discard(str(server_id))
        
        servers = self.get_servers()
        server_exists = any(str(server['id']) == str(server_id) for server in servers)
        
        if not server_exists:
            if verbose: print(f"No existe ningún servidor con ID {server_id}")
            return False

        if server_id in self.processes and psutil.pid_exists(self.processes[server_id]):
            if verbose: print(f"El cliente para el servidor {server_id} ya está en ejecución")
            return False

        try:
            # Crear nombre de archivo de log con timestamp
            timestamp = datetime.now().strftime('%Y%m%d')
            log_file = os.path.join(LOGS_DIR, f"mqtt_client_{server_id}_{timestamp}.log")
            
            # Abrir archivo de log en modo 'append' y redirigir stdout y stderr
            with open(log_file, 'a') as f:
                f.write(f"\n--- Nueva sesión iniciada {datetime.now()} ---\n")
                process = subprocess.Popen(
                    ['python', 'mqtt_client.py', str(server_id)],
                    stdout=f,
                    stderr=subprocess.STDOUT,   # Redirigir stderr a stdout
                    text=True
                )
            
            self.processes[server_id] = process.pid
            if verbose:
                print(f"Cliente MQTT iniciado para servidor {server_id} con PID {process.pid}")
                print(f"Logs disponibles en: {log_file}")
            self.save_processes()
            return True
        except Exception as e:
            if verbose: print(f"Error al iniciar cliente para servidor {server_id}: {e}")
            return False

    def stop_client(self, server_id, verbose=True, block=True):
        """
        Detiene un cliente MQTT específico
        Args:
            server_id: ID del servidor
            verbose (bool): Si es True, muestra mensajes en consola
            block (bool): Si es True, evita que el servidor se reinicie automáticamente
        """
        if server_id not in self.processes:
            if verbose: print(f"No se encontró cliente para el servidor {server_id}")
            return False

        pid = self.processes[server_id]
        try:
            process = psutil.Process(pid)
            if process.is_running():
                process.terminate() # Intenta terminar el proceso de forma segura
                try:
                    process.wait(timeout=5) # Espera hasta 5 segundos por seguridad
                except psutil.TimeoutExpired:
                    process.kill()  # Si no responde, se mata forzosamente
                if verbose: print(f"Cliente MQTT detenido para servidor {server_id}")
            else:
                if verbose: print(f"El proceso con PID {pid} no está activo")
        except psutil.NoSuchProcess:
            if verbose: print(f"El proceso con PID {pid} no existe")
        except Exception as e:
            if verbose: print(f"Error al detener cliente para servidor {server_id}: {e}")
            return False

        del self.processes[server_id]
        if block:
            self.blocked_servers.add(str(server_id))
            if verbose: print(f"Servidor {server_id} bloqueado para reinicios automáticos")
        self.save_processes()
        return True

    def check_status(self, verbose=True):
        """
        Verifica y actualiza el estado de todos los clientes MQTT.
        Args:
            verbose (bool): Si es True, muestra mensajes en consola
        """
        if verbose:
            print("\nVerificando estado de los clientes MQTT...")
            print("----------------------------------------")
        
        servers = self.get_servers()
        server_ids = {str(server['id']) for server in servers}
        
        if verbose:
            print("1. Verificando clientes que deben detenerse...")
        for server_id in list(self.processes.keys()):
            if server_id not in server_ids:
                if verbose:
                    print(f"  → Deteniendo cliente {self.processes[server_id]} (servidor {server_id} ya no existe)")
                self.stop_client(server_id, verbose=verbose)
        
        if verbose:
            print("\n2. Verificando clientes que deben iniciarse o reiniciarse...")
        for server in servers:
            server_id = str(server['id'])
            if server_id in self.blocked_servers:
                if verbose:
                    print(f"  → Omitiendo servidor {server_id} (bloqueado por usuario)")
                continue
            
            if server_id not in self.processes:
                if verbose:
                    print(f"  → Iniciando nuevo cliente para servidor {server_id} ({server['name']})")
                self.start_client(server_id, verbose=verbose)
            elif not psutil.pid_exists(self.processes[server_id]):
                if verbose:
                    print(f"  → Reiniciando cliente caído para servidor {server_id} ({server['name']})")
                self.stop_client(server_id, verbose=verbose, block=False)
                self.start_client(server_id, verbose=verbose)
        
        if verbose:
            print("\n3. Actualización completada.")
            print("----------------------------------------")

    def show_status(self):
        """Muestra el estado actual de todos los procesos"""
        servers = self.get_servers()
        server_map = {str(server['id']): server for server in servers}
        
        print("\nEstado de los clientes MQTT:")
        print("-" * 100) 
        print(f"{'ID':^5} | {'Nombre':^20} | {'Estado':^15} | {'PID':^10} | {'Log':^30}")
        print("-" * 100)
        
        # Mostrar servidores activos
        for server_id, pid in self.processes.items():
            server = server_map.get(server_id, {'name': 'Desconocido'})
            is_running = psutil.pid_exists(pid)
            status = "Activo" if is_running else "Detenido"
            if not is_running and str(server_id) in self.blocked_servers:
                status += " (Bloq.)"  # Solo mostrar bloqueado si está detenido
            
            log_file = self._get_latest_log(server_id)
            log_name = os.path.basename(log_file) if log_file else '-'
            
            print(f"{server_id:^5} | {server['name'][:20]:^20} | {status:^15} | {pid:^10} | {log_name[:30]:^30}")
        
        # Mostrar servidores sin proceso
        for server in servers:
            server_id = str(server['id'])
            if server_id not in self.processes:
                status = "Detenido" + (" (Bloq.)" if server_id in self.blocked_servers else "")
                print(f"{server_id:^5} | {server['name'][:20]:^20} | {status:^15} | {'-':^10} | {'-':^30}")
        print("-" * 100)

    def _get_latest_log(self, server_id):
        """Obtiene el archivo de log más reciente para un servidor específico"""
        if not os.path.exists(LOGS_DIR):
            return None
            
        logs = [f for f in os.listdir(LOGS_DIR) if f.startswith(f"mqtt_client_{server_id}_")]
        if not logs:
            return None
            
        return max([os.path.join(LOGS_DIR, f) for f in logs], key=os.path.getctime)

    def _setup_auto_refresh(self):
        """Configura el refresco automático usando un temporizador"""
        def timer_thread():
            while True:
                self.check_status(verbose=False)  # Llamada silenciosa
                threading.Event().wait(self.refresh_interval)
        
        # Iniciar el hilo del temporizador
        thread = threading.Thread(target=timer_thread, daemon=True)
        thread.start()

def main():
    # Configurar el parser de argumentos
    parser = argparse.ArgumentParser(description='Gestor de Clientes MQTT')
    parser.add_argument('-r', '--refresh', 
                       type=int, 
                       metavar='SEGUNDOS',  
                       default=REFRESH_INTERVAL,
                       help=f'Intervalo de refresco en segundos (por defecto: {REFRESH_INTERVAL})')
    args = parser.parse_args()

    # Crear el gestor con el intervalo especificado
    manager = MQTTManager(refresh_interval=args.refresh)
    
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
                manager.stop_client(server_id)  # Bloquear reinicio automático
            
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
