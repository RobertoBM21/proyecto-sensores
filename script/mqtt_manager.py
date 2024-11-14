# Importaciones de la biblioteca estándar
import os
import sys
import json
import signal
import argparse
import threading
import subprocess
from typing import Dict
from datetime import datetime

# Importaciones de terceros
import psutil
import requests
from dotenv import load_dotenv

# Carga las variables de entorno
load_dotenv()

# Variables de entorno y valores por defecto
ENV_VARS = {
    'API_URL': 'http://localhost:3000',
    'LOGS_DIR': 'logs',
    'PROCESSES_FILE': 'mqtt_processes.json',
    'REFRESH_INTERVAL': '60',  # En segundos
}

# Constantes internas
PROCESS_WAIT_TIME = 1  # Tiempo de espera para verificación de proceso (segundos)

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

# Funciones de configuración
def parse_arguments():
    """Procesa los argumentos de línea de comandos"""
    parser = argparse.ArgumentParser(description='Gestor de Clientes MQTT')
    parser.add_argument('-r', '--refresh',
                       type=int,
                       metavar='SEGUNDOS',
                       help='Intervalo de refresco en segundos')
    return parser.parse_args()

class MQTTManager:
    """Gestor de procesos para clientes MQTT"""
    
    # Inicialización y configuración básica
    def __init__(self, refresh_interval):
        # Cargar configuración de entorno
        self.config = validate_environment()
        
        # Configuración inicial
        self.refresh_interval = refresh_interval or int(self.config['REFRESH_INTERVAL'])
        self.processes: Dict[str, int] = {}
        self.blocked_servers = set()
        
        # Inicialización del directorio de logs y carga de procesos
        if not os.path.exists(self.config['LOGS_DIR']):
            os.makedirs(self.config['LOGS_DIR'])
            
        self.load_processes()
        self._setup_auto_refresh()

    def _setup_auto_refresh(self):
        """Configura el refresco automático usando un temporizador"""
        def timer_thread():
            while True:
                self.check_status(verbose=False)  # Llamada silenciosa
                threading.Event().wait(self.refresh_interval)
        
        # Iniciar el hilo del temporizador
        thread = threading.Thread(target=timer_thread, daemon=True)
        thread.start()

    # Funciones de gestión de procesos
    def load_processes(self):
        """Carga los PIDs guardados de procesos anteriores y verifica si siguen activos"""
        if os.path.exists(self.config['PROCESSES_FILE']):
            with open(self.config['PROCESSES_FILE'], 'r') as f:
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
        with open(self.config['PROCESSES_FILE'], 'w') as f:
            json.dump(processes_dict, f)

    def _get_latest_log(self, server_id):
        """Obtiene el archivo de log más reciente para un servidor específico"""
        if not os.path.exists(self.config['LOGS_DIR']):
            return None
            
        logs = [f for f in os.listdir(self.config['LOGS_DIR']) if f.startswith(f"mqtt_client_{server_id}_")]
        if not logs:
            return None
            
        return max([os.path.join(self.config['LOGS_DIR'], f) for f in logs], key=os.path.getctime)

    # Funciones de API
    def get_servers(self):
        """Obtiene la lista de servidores desde la API"""
        try:
            response = requests.get(f"{self.config['API_URL']}/servers")
            if response.status_code == 200:
                return response.json()
        except requests.RequestException as e:
            print(f"Error al obtener servidores: {e}")
        return []

    # Funciones principales de gestión de clientes
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
            log_file = os.path.join(self.config['LOGS_DIR'], f"mqtt_client_{server_id}_{timestamp}.log")
            
            # Abrir archivo de log en modo 'append' y redirigir stdout y stderr
            with open(log_file, 'a') as f:
                f.write(f"\n--- Nueva sesión iniciada {datetime.now()} ---\n")
                process = subprocess.Popen(
                    ['python', 'mqtt_client.py', str(server_id)],
                    stdout=f,
                    stderr=subprocess.STDOUT,   # Redirigir stderr a stdout
                    text=True
                )
                
            # Esperar y verificar el proceso
            threading.Event().wait(PROCESS_WAIT_TIME)
            if not psutil.pid_exists(process.pid) or process.poll() is not None:
                if verbose:
                    print(f"El cliente para servidor {server_id} falló al iniciar")
                return False
            
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
        process_stopped = False
        
        try:
            process = psutil.Process(pid)
            if process.is_running():
                # Enviar SIGTERM al proceso
                process.send_signal(signal.SIGTERM)
                try:
                    process.wait(timeout=5) # Espera hasta 5 segundos a que el proceso termine
                    process_stopped = True
                except psutil.TimeoutExpired:
                    if verbose: print(f"El proceso {pid} no respondió a SIGTERM, forzando terminación")
                    process.kill()  # Si no responde, se mata forzosamente
                    process_stopped = True
                if verbose: print(f"Cliente MQTT detenido para servidor {server_id}")
            else:
                if verbose: print(f"El proceso con PID {pid} no está activo")
                process_stopped = True
        except psutil.NoSuchProcess:
            if verbose: print(f"El proceso con PID {pid} no existe")
            process_stopped = True
        except Exception as e:
            if verbose: print(f"Error al detener cliente para servidor {server_id}: {e}")
        
        # Siempre eliminar el proceso del diccionario si se detuvo o no existe
        if process_stopped:
            del self.processes[server_id]
            if block:
                self.blocked_servers.add(str(server_id))
                if verbose: print(f"Servidor {server_id} bloqueado para reinicios automáticos")
            self.save_processes()
            return True
        
        return False

    # Funciones de monitoreo y estado
    def check_status(self, verbose=True):
        """
        Verifica y actualiza el estado de todos los clientes MQTT.
        Args:
            verbose (bool): Si es True, muestra mensajes en consola
        """
        if verbose:
            print("\nVerificando estado de los clientes MQTT...")
            print("----------------------------------------")
        
        # Primero, limpiar procesos muertos del diccionario
        dead_processes = [
            server_id for server_id, pid in self.processes.items()
            if not psutil.pid_exists(pid)
        ]
        for server_id in dead_processes:
            if verbose:
                print(f"Removiendo proceso muerto {self.processes[server_id]} del servidor {server_id}")
            del self.processes[server_id]
        
        # Actualizar archivo JSON después de limpiar procesos muertos
        self.save_processes()
        
        servers = self.get_servers()
        server_ids = {str(server['id']) for server in servers}
        
        if verbose:
            print("1. Verificando clientes que deben detenerse...")
        for server_id in list(self.processes.keys()):
            if server_id not in server_ids:
                if verbose:
                    print(f"  → Deteniendo cliente {self.processes[server_id]} (servidor {server_id} ya no existe)")
                self.stop_client(server_id, verbose=verbose, block=False)
        
        if verbose:
            print("\n2. Verificando clientes que deben iniciarse o reiniciarse...")
        for server in servers:
            server_id = str(server['id'])
            if server_id in self.blocked_servers:
                if verbose:
                    print(f"\n  → Omitiendo servidor {server_id} (bloqueado por usuario)")
                continue
            
            if server_id not in self.processes:
                if verbose:
                    print(f"\n  → Iniciando nuevo cliente para servidor {server_id} ({server['name']})")
                self.start_client(server_id, verbose=verbose)
            elif not psutil.pid_exists(self.processes[server_id]):
                if verbose:
                    print(f"\n  → Reiniciando cliente caído para servidor {server_id} ({server['name']})")
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

def main():
    """Función principal del gestor"""
    # Procesar argumentos
    args = parse_arguments()

    # Crear y configurar el gestor
    manager = MQTTManager(refresh_interval=args.refresh)
    
    # Menú principal
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
                    manager.stop_client(server_id, block=False)
                break
            
            else:
                print("Opción no válida")
                
        except KeyboardInterrupt:
            print("\nDeteniendo solicitada por el usuario...")
            for server_id in list(manager.processes.keys()):
                manager.stop_client(server_id)
            break
        except Exception as e:
            print(f"Error inesperado: {e}")

if __name__ == "__main__":
    main()
