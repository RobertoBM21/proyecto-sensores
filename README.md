# Sistema de Monitoreo de Sensores

Este proyecto es una aplicación para gestionar los mensajes enviados por dispositivos IoT a través del protocolo MQTT. La aplicación recoge, estructura, almacena y muestra los servidores, dispositivos y mensajes. El backend está desarrollado utilizando **Node.js** con **Express** y **MySQL** y cuenta con documentación de API utilizando **Swagger**. El frontend está desarrollado en **Vue.js** con **Vite** y **TailwindCSS**. Los scripts están desarrollados con **Python**. El proyecto en su conjunto se despliega con **Docker**.

## Tabla de Contenidos

- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos](#requisitos)
- [Configuración](#configuración)
  - [Variables de Entorno](#variables-de-entorno)
- [Ejecución con Docker](#ejecución-con-docker)
  - [Inicio Rápido](#inicio-rápido)
  - [Gestión del Script MQTT](#gestión-del-script-mqtt)
- [Desarrollo Local](#desarrollo-local)
  - [Instalación de Dependencias](#instalación-de-dependencias)
  - [Ejecución en Desarrollo](#ejecución-en-desarrollo)
- [Contacto](#contacto)

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

## Requisitos

Para ejecutar con Docker:

- **Docker** y **Docker Compose**

Para desarrollo local:

- **Node.js** v22.11.0 o superior
- **Python** 3.x
- **MySQL** 8.0
- **npm**/**pnpm**/**yarn**

## Configuración

### Variables de Entorno

El proyecto requiere un archivo de variables de entorno:

- Para Docker: `.env`
- Para desarrollo local: `.env.local`

Variables necesarias:

```env
# Configuración de Base de Datos
DB_NAME=sensores
DB_USER=tu_usuario_de_mysql
DB_PASSWORD=tu_contraseña_de_mysql
DB_HOST=db                      # Para Docker usar 'db', para desarrollo local usar 'localhost'
DB_DIALECT=mysql
DB_PORT=3306

# Configuración de seguridad
ENCRYPTION_KEY=tu_clave_de_encriptación_de_64_caracteres_en_hexadecimal
KC_BOOTSTRAP_ADMIN_PASSWORD     # En desarrollo local omitir esta variable

# Configuración MQTT
API_URL=http://backend:3000     # Para Docker usar 'backend', para desarrollo local usar 'localhost'
VITE_API_URL=http://localhost:3000
```

## Ejecución con Docker

### Inicio Rápido

```bash
cd proyecto-sensores

# Crear y configurar .env.docker con los valores necesarios (ver sección Variables de Entorno)
touch .env.docker

# Construir y ejecutar
docker compose up -d --build
```

Los servicios estarán disponibles en:

- Frontend: http://localhost:80
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/api-docs

### Gestión del Script MQTT

Para ejecutar el gestor MQTT tienes dos opciones:

1. **Usando Docker CLI**:

```bash
docker exec -it proyecto-sensores-mqtt-manager-1 python mqtt_manager.py
```

2. **Usando Docker Desktop**:
   - Abre Docker Desktop
   - Ve a la pestaña "Containers"
   - Accede al contenedor "proyecto-sensores-mqtt-manager-1"
   - Haz clic en el botón "Exec"
   - Ejecuta: `python mqtt_manager.py`

El script proporcionará una interfaz interactiva para gestionar las conexiones MQTT.

## Desarrollo Local

Si prefieres desarrollar sin Docker, sigue estas instrucciones:

### Instalación de Dependencias

**Backend**

```bash
cd backend
npm/pnpm/yarn install
```

**Frontend**

```bash
cd frontend
npm/pnpm/yarn install
```

**Script MQTT**

```bash
cd script
pip install -r requirements.txt
```

### Ejecución en Desarrollo

**Backend**

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

**Frontend**

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

**Clientes MQTT**

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

## Contacto

Si tienes preguntas o necesitas más información, puedes contactarme a través de:

- **Correo electrónico**: roberto.burruezom@gmail.com
- **Github**: [RobertoBM21](https://github.com/RobertoBM21)
