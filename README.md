# Proyecto Sensores

Este proyecto es una aplicación para gestionar los mensajes enviados por dispositivos IoT a través del protocolo MQTT. La aplicación recoge, estructura, almacena y muestra los servidores, dispositivos y mensajes. El backend está desarrollado utilizando **Node.js** con **Express** y **MySQL**. El frontend está desarrollado en **Vue.js**. Además, cuenta con documentación de API utilizando **Swagger**.

Incluye scripts en Python para la gestión de conexiones MQTT y una interfaz web para monitorizar el estado de las conexiones.

## Tabla de Contenidos

- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Configuración](#instalación-y-configuración)
  - [Requisitos Previos](#requisitos-previos)
  - [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
  - [Instalación de Dependencias](#instalación-de-dependencias)
- [Ejecución del Proyecto](#ejecución-del-proyecto)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Clientes MQTT](#clientes-mqtt)
- [Documentación API](#documentación-api)
- [Contacto](#contacto)

---

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

```
proyecto-sensores/
├── backend/               # Servidor Node.js/Express
│   ├── src/
│   │   ├── config/        # Configuración de la base de datos
│   │   ├── controllers/   # Controladores de la API
│   │   ├── docs/          # Configuración de Swagger
│   │   ├── middleware/    # Middleware de Express
│   │   ├── models/        # Modelos Sequelize
│   │   ├── routes/        # Rutas de la API
│   │   ├── services/      # Servicios de negocio
│   │   └── utils/         # Utilidades
├── frontend/              # Aplicación Vue.js
│   ├── public/
│   └── src/
│       ├── assets/
│       └── components/
├── script/                 # Scripts Python MQTT
│   ├── mqtt_client.py      # Cliente MQTT individual
│   ├── mqtt_manager.py     # Gestor de clientes MQTT
│   ├── mqtt_processes.json # Estado de los procesos MQTT
│   └── logs/               # Carpeta para logs de MQTT
```

---

## Instalación y Configuración

### Requisitos Previos

- **Node.js** v22.11.0 o superior.
- **MySQL** instalado y en ejecución.
- **Python 3.x**.
- **npm**/**pnpm**/**yarn** como gestor de paquetes de Node.
- **Pip** para instalar las dependencias de Python.

### Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto. Asegúrate de reemplazar los valores con tus credenciales y configuración.

Las variables se dividen en **requeridas** y **opcionales**:

**Requeridas**

```env
# Configuración del servidor
PORT=tu_puerto

# Configuración de Base de Datos
DB_NAME=tu_nombre_de_base_de_datos
DB_USER=tu_usuario_de_mysql
DB_PASSWORD=tu_contraseña_de_mysql
DB_HOST=localhost
DB_DIALECT=mysql
DB_PORT=3306

# Configuración de seguridad
ENCRYPTION_KEY=tu_clave_de_encriptación_de_64_caracteres_en_hexadecimal

# Configuración MQTT
API_URL=url_del_backend (url:PORT)
```

**Opcionales**

```env
# Configuración MQTT
MQTT_TOPIC=formato_de_topic
LOGS_DIR=tu_carpeta_para_almacenar_logs
PROCESSES_FILE=tu_json_con_procesos_activos
```

### Instalación de Dependencias

**Backend**

```bash
cd backend
npm install
```

Principales dependencias:

- express: ^4.21.1
- mysql2: ^3.11.3
- sequelize: ^6.37.4
- swagger-jsdoc: ^6.2.8
- swagger-ui-express: ^5.0.1

**Frontend**

```bash
cd frontend
npm install
```

Principales dependencias:

- vue: ^3.2.13
- bootstrap: ^5.1.3
- bootstrap-icons: ^1.11.3

**Script MQTT**

```bash
cd script
pip install <dependencia>
```

Requisitos Python:

- paho-mqtt: **2.1.0**
- requests
- python-dotenv
- psutil
- cryptography

Debes instalar todas las dependencias.

## Ejecución del Proyecto

### Backend

Para desarrollo con recarga automática:

```bash
cd backend
npm run dev
```

Para producción:

```bash
cd backend
npm start
```

El servidor se ejecutará en `http://localhost:3000` por defecto

### Frontend

```bash
cd frontend
npm run serve
```

La aplicación estará disponible en `http://localhost:8080` por defecto

### Clientes MQTT

El proyecto utiliza un sistema de gestión de clientes MQTT que consiste en:

1. **Gestor de Clientes MQTT**:

   ```bash
   # Ejecutar con intervalo de refresco por defecto (60 segundos)
   python mqtt_manager.py

   # Ejecutar con intervalo personalizado (ejemplo: 10 segundos)
   python mqtt_manager.py -r 10
   ```

   **Características:**

   - **Interfaz interactiva** por línea de comandos para:
     - Mostrar el estado de todos los clientes MQTT.
     - Iniciar y detener clientes individuales.
     - Verificar y actualizar automáticamente el estado de las conexiones.
     - Bloquear y desbloquear reinicio automático de clientes detenidos manualmente.
   - **Persistencia del estado** de los procesos entre reinicios.
   - **Refresco automático configurable** mediante el argumento `-r` o `--refresh`.
   - **Logs independientes** para cada cliente y sesión almacenados en el directorio logs.

2. **Cliente MQTT Individual**:

   Este script se encarga de conectarse a un servidor MQTT específico y procesar los mensajes recibidos.

   ```bash
   # Ejecutar el cliente MQTT para un servidor específico
   python mqtt_client.py <server_id> [--debug]
   ```

   - `<server_id>` es el ID del servidor MQTT al que deseas conectarte.
   - La opción `--debug` activa el modo debug para obtener información más detallada en los logs.

   **Características:**

   - **Conexión** a un servidor MQTT utilizando credenciales almacenadas en la base de datos.
   - **Procesamiento de mensajes** con formato de topic: `/apikey/serial/....`
   - **Actualización y creación** de dispositivos en la base de datos.
   - **Almacenamiento de mensajes** recibidos en el backend.
   - **Gestión de reconexión automática** y recuperación ante fallos.
   - **Manejo de logs detallados**, con opción de nivel de log dinámico mediante el argumento `--debug`.

## Documentación API

La documentación Swagger de la API está disponible en:
`http://localhost:3000/api-docs`

## Contacto

Si tienes preguntas o necesitas más información, puedes contactarme a través de:

- **Correo electrónico**: roberto.burruezom@um.es
- **Github**: [RobertoBM21](https://github.com/RobertoBM21)
