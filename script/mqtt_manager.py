# Importaciones de la biblioteca estándar
import os
import sys
import signal
import argparse
import threading
import subprocess
from typing import Dict
from datetime import datetime, timedelta

# Importaciones de terceros
import psutil
import requests
from dotenv import load_dotenv

# Carga las variables de entorno, si no estamos en Docker cargamos desde .env
if os.environ.get('DOCKER_ENV', None) is None:
    load_dotenv()


# Variables de entorno y valores por defecto
ENV_VARS = {
    'API_URL': 'http://localhost:3000',
    'LOGS_DIR': 'logs',
    'REFRESH_INTERVAL': '60',  # Segundos de refresco automático
    'LOG_RETENTION_DAYS': '7',  # Días a mantener logs
}

# Constantes internas
PROCESS_WAIT_TIME = 1       # Tiempo de espera para verificación de arranque de proceso (segundos)
TIMEOUT = 5                 # Tiempo de espera para comprobar si el proceso se detiene (segundos)
LOG_DATE_FORMAT = '%Y%m%d'  # Formato de fecha para archivos de log


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
        print(f"Error: Faltan las siguientes variables de entorno requeridas: {', '.join(missing_vars)}")
        sys.exit(1)
    
    return config

# Funciones de configuración
def parse_arguments():
    """Procesa los argumentos de línea de comandos"""
    parser = argparse.ArgumentParser(description='Gestor de Clientes MQTT')
    parser.add_argument('-r', '--refresh',
                       type=int,
                       metavar='<segundos>',
                       help='Intervalo de refresco en segundos')
    parser.add_argument('-d', '--retention',
                       type=int,
                       metavar='<días>',
                       help='Días a mantener los logs')
    return parser.parse_args()

class MQTTManager:
    """Gestor de procesos para clientes MQTT"""
    
    # Inicialización y configuración básica
    def __init__(self, refresh_interval, retention_days):
        # Cargar configuración de entorno
        self.config = validate_environment()
        
        # Configuración inicial
        self.refresh_interval = refresh_interval or int(self.config['REFRESH_INTERVAL'])
        self.retention_days = retention_days or int(self.config['LOG_RETENTION_DAYS'])
        self.processes: Dict[str, int] = {}
        self.paused_servers = set()
        
        # Inicialización del directorio de logs y carga de procesos
        if not os.path.exists(self.config['LOGS_DIR']):
            os.makedirs(self.config['LOGS_DIR'])
            
        self._setup_auto_refresh()

    def _setup_auto_refresh(self):
        """Configura el refresco automático y la ejecución diaria"""
        
        def get_seconds_until_midnight():
            tomorrow = datetime.now() + timedelta(days=1)
            midnight = datetime(year=tomorrow.year, month=tomorrow.month, 
                             day=tomorrow.day, hour=0, minute=0, second=0)
            return (midnight - datetime.now()).total_seconds()

        
        def daily_thread():
            while True:
                wait_seconds = get_seconds_until_midnight()
                threading.Event().wait(wait_seconds)
                self.daily_task()
        
        def timer_thread():
            while True:
                self.check_status(verbose=False)
                threading.Event().wait(self.refresh_interval)
        
        # Iniciar ambos hilos
        refresh_thread = threading.Thread(target=timer_thread, daemon=True)
        daily_thread = threading.Thread(target=daily_thread, daemon=True)
        refresh_thread.start()
        daily_thread.start()

    def cleanup_old_logs(self):
        """Elimina logs más antiguos que retention_days"""
        cutoff_date = datetime.now() - timedelta(days=self.retention_days)
        
        log_dir = self.config['LOGS_DIR']
        for filename in os.listdir(log_dir):
            if not filename.startswith('mqtt_client_'):
                continue
            
            try:
                date_str = filename.split('_')[-1].split('.')[0]
                file_date = datetime.strptime(date_str, LOG_DATE_FORMAT)
                
                if file_date < cutoff_date:
                    file_path = os.path.join(log_dir, filename)
                    os.remove(file_path)
            except Exception:
                continue

    def daily_task(self):
        """Tarea que se ejecutará diariamente a medianoche"""
        # 1. Limpiar logs antiguos
        self.cleanup_old_logs()
        
        # 2. Reiniciar clientes uno a uno
        active_servers = list(self.processes.keys())
        for server_id in active_servers:
            if server_id not in self.paused_servers:
                self.stop_client(server_id, pause=False, verbose=False)
                self.start_client(server_id, verbose=False)

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
            else:
                print(f"Error al obtener servidores: {response.status_code} - {response.text}")
        except requests.exceptions.RequestException as e:
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
        # Remover del conjunto de pausados si existe
        self.paused_servers.discard(str(server_id))
        
        servers = self.get_servers()
        server_exists = any(str(server['id']) == str(server_id) for server in servers)
        
        if not server_exists:
            if verbose: print(f"Error: No existe ningún servidor con ID {server_id}")
            return False

        if server_id in self.processes and psutil.pid_exists(self.processes[server_id]):
            if verbose: print(f"Error: El cliente para el servidor {server_id} ya está en ejecución")
            return False

        try:
            # Crear nombre de archivo de log con timestamp
            timestamp = datetime.now().strftime(LOG_DATE_FORMAT)
            log_file = os.path.join(self.config['LOGS_DIR'], f"mqtt_client_{server_id}_{timestamp}.log")
            
            # Abrir archivo de log en modo 'append' y redirigir stdout y stderr
            creationflags = 0
            if os.name == 'nt':
                creationflags = subprocess.CREATE_NEW_PROCESS_GROUP  # Solo en Windows
            with open(log_file, 'a', encoding='utf-8') as f:
                f.write(f"\n--- Nueva sesión iniciada {datetime.now()} ---\n")
                process = subprocess.Popen(
                    ['python', 'mqtt_client.py', str(server_id)],
                    stdout=f,
                    stderr=subprocess.STDOUT,   # Redirigir stderr a stdout
                    text=True,
                    creationflags=creationflags  # Usar variable
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
            return True
        except Exception as e:
            if verbose: print(f"Error al iniciar cliente para servidor {server_id}: {e}")
            return False

    def stop_client(self, server_id, verbose=True, pause=True):
        """
        Detiene un cliente MQTT específico
        Args:
            server_id: ID del servidor
            verbose (bool): Si es True, muestra mensajes en consola
            pause (bool): Si es True, evita que el servidor se reinicie automáticamente
        """
        if server_id not in self.processes:
            if verbose: print(f"No se encontró cliente para el servidor {server_id}")
            return False

        pid = self.processes[server_id]
        process_stopped = False
        
        try:
            process = psutil.Process(pid)
            if process.is_running():
                signal_sent = False
                if os.name == 'nt':
                    # En Windows, enviar CTRL_BREAK_EVENT
                    process.send_signal(signal.CTRL_BREAK_EVENT)
                    signal_sent = True
                elif os.name == 'posix':
                    # En Unix, enviar SIGTERM
                    process.send_signal(signal.SIGTERM)
                    signal_sent = True
                else:
                    if verbose:
                        print(f"No se puede enviar señal para el sistema operativo {os.name}")
                        
                if signal_sent:
                    try:
                        process.wait(timeout=TIMEOUT)
                        process_stopped = True
                    except psutil.TimeoutExpired:
                        if verbose: print(f"El proceso {pid} no respondió a la señal, forzando la terminación...")
                        process.kill()  # Si no responde, se mata forzosamente
                        process_stopped = True
                else:
                    # Si no se pudo enviar la señal, matar directamente
                    if verbose: print(f"Señal no enviada para el proceso {pid}, forzando la terminación...")
                    process.kill()
                    process_stopped = True
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
            if pause:
                self.paused_servers.add(str(server_id))
                if verbose: print(f"Servidor {server_id} pausado para reinicios automáticos")
            if verbose: print(f"Cliente MQTT detenido para servidor {server_id}")
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
        
        servers = self.get_servers()
        server_ids = {str(server['id']) for server in servers}
        
        if verbose:
            print("1. Verificando clientes que deben detenerse...")
        for server_id in list(self.processes.keys()):
            if server_id not in server_ids:
                if verbose:
                    print(f"  → Deteniendo cliente {self.processes[server_id]} (servidor {server_id} ya no existe)")
                self.stop_client(server_id, verbose=verbose, pause=False)
        
        if verbose:
            print("\n2. Verificando clientes que deben iniciarse o reiniciarse...")
        for server in servers:
            server_id = str(server['id'])
            if server_id in self.paused_servers:
                if verbose:
                    print(f"\n  → Omitiendo servidor {server_id} (pausado por usuario)")
                continue
            
            if server_id not in self.processes:
                if verbose:
                    print(f"\n  → Iniciando nuevo cliente para servidor {server_id} ({server['name']})")
                self.start_client(server_id, verbose=verbose)
            elif not psutil.pid_exists(self.processes[server_id]):
                if verbose:
                    print(f"\n  → Reiniciando cliente caído para servidor {server_id} ({server['name']})")
                self.stop_client(server_id, verbose=verbose, pause=False)
                self.start_client(server_id, verbose=verbose)
        
        if verbose:
            print("\n3. Actualización completada.")
            print("----------------------------------------")

    def show_status(self):
        """Muestra el estado actual de todos los procesos"""
        servers = self.get_servers()
        server_map = {str(server['id']): server for server in servers}
        
        # Definir anchos de columnas
        col_widths = {
            'id': 5,
            'name': 20,
            'status': 10,
            'pid': 10,
            'log': 30
        }
        
        # Calcular ancho total (suma de anchos + 3 por cada separador)
        total_width = sum(col_widths.values()) + (len(col_widths) - 1) * 3
        
        print("\nEstado de los clientes MQTT:")
        print("-" * total_width)
        print(f"{'ID':^{col_widths['id']}} | {'Nombre':^{col_widths['name']}} | {'Estado':^{col_widths['status']}} | {'PID':^{col_widths['pid']}} | {'Log':^{col_widths['log']}}")
        print("-" * total_width)
        
        # Mostrar servidores activos
        for server_id, pid in self.processes.items():
            server = server_map.get(server_id, {'name': 'Desconocido'})
            is_running = psutil.pid_exists(pid)
            status = "Activo" if is_running else "Detenido"
            if not is_running and str(server_id) in self.paused_servers:
                status = "Pausado"
            
            log_file = self._get_latest_log(server_id)
            log_name = os.path.basename(log_file) if log_file else '-'
            
            print(f"{server_id:^{col_widths['id']}} | {server['name'][:col_widths['name']]:^{col_widths['name']}} | {status:^{col_widths['status']}} | {pid:^{col_widths['pid']}} | {log_name[:col_widths['log']]:^{col_widths['log']}}")
        
        # Mostrar servidores sin proceso
        for server in servers:
            server_id = str(server['id'])
            if server_id not in self.processes:
                status = "Pausado" if server_id in self.paused_servers else "Detenido"
                print(f"{server_id:^{col_widths['id']}} | {server['name'][:col_widths['name']]:^{col_widths['name']}} | {status:^{col_widths['status']}} | {'-':^{col_widths['pid']}} | {'-':^{col_widths['log']}}")
        print("-" * total_width)

def main():
    """Función principal del gestor"""
    # Procesar argumentos
    args = parse_arguments()

    # Crear y configurar el gestor
    manager = MQTTManager(
        refresh_interval=args.refresh,
        retention_days=args.retention
    )
    
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
                manager.stop_client(server_id)
            
            elif option == '4':
                print("\nIniciando verificación completa del sistema...")
                manager.check_status()
                print("\nMostrando estado actual después de la actualización:")
                manager.show_status()
            
            elif option == '5':
                print("Deteniendo todos los clientes...")
                for server_id in list(manager.processes.keys()):
                    manager.stop_client(server_id, pause=False)
                break
            
            else:
                print("Opción no válida")
                
        except KeyboardInterrupt:
            print("\nDeteniendo solicitada por el usuario...")
            for server_id in list(manager.processes.keys()):
                manager.stop_client(server_id, pause=False)
            break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()
