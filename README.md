# Sistema de Monitoreo de Sensores

Este proyecto es una aplicación para gestionar los mensajes enviados por dispositivos IoT a través del protocolo MQTT. La aplicación recoge, estructura, almacena y muestra los servidores, dispositivos y mensajes. El backend está desarrollado utilizando **Node.js** con **Express** y **MySQL**. El frontend está desarrollado en **Vue.js** con **Vite** y **TailwindCSS**. Además, cuenta con documentación de API utilizando **Swagger**.

Incluye scripts en Python para la gestión y monitorización de las conexiones MQTT.

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
├── backend/               ## Servidor Node.js/Express
│   ├── src/
│   │   ├── config/        # Configuración de la base de datos
│   │   ├── controllers/   # Controladores de la API
│   │   ├── docs/          # Configuración de Swagger
│   │   ├── middleware/    # Middleware de Express
│   │   ├── models/        # Modelos Sequelize
│   │   ├── routes/        # Rutas de la API
│   │   ├── services/      # Servicios de negocio
│   │   └── utils/         # Utilidades
├── frontend/              ## Aplicación Vue.js
│   ├── public/           # Archivos estáticos públicos (favicon)
│   └── src/
│       ├── assets/       # Recursos estáticos (imágenes, iconos, fuentes)
│       ├── components/   # Componentes Vue reutilizables
│       │   └── ui/       # Componentes shadcn-vue reutilizables
│       ├── lib/          # Utilidades y funciones auxiliares
│       ├── router/       # Configuración de rutas de Vue Router
│       ├── stores/       # Gestión de estado con Pinia
│       └── views/        # Componentes de página/vista completa
├── script/                 ## Scripts Python MQTT
│   ├── mqtt_client.py      # Cliente MQTT individual
│   ├── mqtt_manager.py     # Gestor de clientes MQTT
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
Los valores de ciertas variables vienen condicionadas sobre si se lanza el proyecto con Docker o no.

Las variables se dividen en **requeridas** y **opcionales**:

**Requeridas**

```env
# Configuración del servidor
PORT=tu_puerto

# Configuración de Base de Datos
DB_NAME=sensores
DB_USER=tu_usuario_de_mysql
DB_PASSWORD=tu_contraseña_de_mysql
DB_HOST=localhost o db (Docker)
DB_DIALECT=mysql
DB_PORT=3306

# Configuración de seguridad
ENCRYPTION_KEY=tu_clave_de_encriptación_de_64_caracteres_en_hexadecimal

# Configuración MQTT
API_URL=http://localhost:tu_puerto o http://backend:tu_puerto (Docker)
VITE_API_URL=http://localhost:tu_puerto
```

**Opcionales**

```env
# Configuración MQTT
MQTT_TOPIC=formato_de_topic
LOGS_DIR=tu_carpeta_para_almacenar_logs
```

### Instalación de Dependencias

**Backend**

```bash
cd backend
npm/pnpm/yarn install
```

Principales dependencias:

- Express v5 (API RESTFUL)
- Sequelize (ORM)
- Joi (Validación)
- Swagger (Documentación API)

**Frontend**

```bash
cd frontend
npm/pnpm/yarn install
```

Principales dependencias:

- Vue v3
- Pinia (Manejo del estado)
- TailwindCSS (Estilos)
- Vite (Herramienta de construcción)

**Script MQTT**

```bash
cd script
pip install -r requirements.txt
```

Principales dependencias:

- paho-mqtt: **2.1.0** (Conexión MQTT)
- requests (Manejo HTTP)
- python-dotenv (Variables de entorno)
- psutil (Manejo de procesos)
- cryptography (Encriptación)

## Ejecución del Proyecto

### Docker

Para ejecutar el proyecto puedes usar simplemente Docker e ignorar el resto de secciones de este apartado.

```bash
`docker compose up -d --build`
```

### Backend

Para desarrollo con recarga automática:

```bash
cd backend
node --run dev
```

Para producción:

```bash
cd backend
node --run start
```

El servidor se ejecutará en `http://localhost:3000` por defecto.

### Frontend

Para desarrollo con recarga automática:

```bash
cd frontend
node --run dev
```

La aplicación estará disponible en `http://localhost:5173` por defecto.

Para producción hay que construir la aplicación, si quieres previsualizarlo localmente emplea el comando `preview`:

```bash
cd frontend
node --run build # Genera archivos estáticos en /dist
node --run preview # Ejecuta un servidor locar para previsualizar producción
```

Si usas preview, el servidor local estará disponible en `http://localhost:4173` por defecto.

### Clientes MQTT

El proyecto utiliza un sistema de gestión de clientes MQTT que consiste en:

1. **Gestor de Clientes MQTT**:

   ```bash
   # Ejecutar con configuración por defecto
   python mqtt_manager.py

   # Personalizar intervalo de refresco y retención de logs
   python mqtt_manager.py -r <segundos> -d <días>
   ```

   **Características principales:**

   - **Interfaz interactiva** con opciones para:
     - Mostrar estado actual de clientes y conexiones
     - Iniciar/detener clientes individuales
     - Pausar reinicio automático de clientes detenidos manualmente
     - Verificar y actualizar estado de todas las conexiones
   - **Mantenimiento automático**:
     - Refresco de clientes periódico configurable (`-r/--refresh`)
     - Rotación diaria de logs con retención configurable (`-d/--retention`)

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
   - **Procesamiento flexible de mensajes MQTT**:
     - Formato de topic configurable por servidor
     - Solo se requiere la presencia de un identificador `serial` y un `apikey` en el topic
     - Formato por defecto: `/{apikey}/{serial}/{type}`
     - Soporta variables personalizadas mediante plantillas (ej: `/{cliente}/{serial}/{sensor}/...`)
   - **Actualización y creación** de dispositivos en la base de datos.
   - **Almacenamiento de mensajes** recibidos en el backend.
   - **Gestión de reconexión automática** y recuperación ante fallos.
   - **Manejo de logs detallados**, con opción de nivel de log dinámico mediante el argumento `--debug`.

## Documentación API

La documentación Swagger de la API está disponible en:
`API_URL/api-docs`

## Contacto

Si tienes preguntas o necesitas más información, puedes contactarme a través de:

- **Correo electrónico**: roberto.burruezom@gmail.com
- **Github**: [RobertoBM21](https://github.com/RobertoBM21)
