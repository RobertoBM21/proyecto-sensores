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
├── backend/                 # Servidor Node.js/Express
│   ├── src/
│   │   ├── config/         # Configuración de la base de datos
│   │   ├── controllers/    # Controladores de la API
│   │   ├── docs/          # Configuración de Swagger
│   │   ├── middleware/    # Middleware de Express
│   │   ├── models/        # Modelos Sequelize
│   │   ├── routes/        # Rutas de la API
│   │   ├── services/      # Servicios de negocio
│   │   └── utils/         # Utilidades
├── frontend/               # Aplicación Vue.js
│   ├── public/
│   └── src/
│       ├── assets/
│       └── components/
└── script/                 # Scripts Python MQTT
    ├── mqtt_client.py     # Cliente MQTT individual
    ├── mqtt_daemon.py     # Cliente MQTT múltiple (legacy)
    └── monitor.html       # Interfaz de monitorización
```

---

## Instalación y Configuración

### Requisitos Previos

- **Node.js** (LTS recomendado)
- **MySQL** instalado y en ejecución
- **Python 3.x**
- **npm** o **yarn** como gestor de paquetes

### Configuración de Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```env
DB_NAME=tu_nombre_de_base_de_datos
DB_USER=tu_usuario_de_mysql
DB_PASSWORD=tu_contraseña_de_mysql
DB_HOST=localhost
DB_DIALECT=mysql
DB_PORT=3306

PORT=3000
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
pip install paho-mqtt requests
```

Requisitos Python:
- paho-mqtt
- requests
- json (incluido en Python)
- datetime (incluido en Python)
- logging (incluido en Python)

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

El servidor se ejecutará en `http://localhost:3000`

### Frontend

```bash
cd frontend
npm run serve
```

La aplicación estará disponible en `http://localhost:8080`

### Clientes MQTT

El proyecto ofrece dos formas de gestionar las conexiones MQTT:

1. **Cliente Individual** (Recomendado):
   ```bash
   python mqtt_client.py <server_id>
   ```
   Este script se conecta a un único servidor MQTT, permitiendo una gestión más granular y eficiente de las conexiones.

2. **Monitor Web**:
   Abre `script/monitor.html` en tu navegador para acceder a la interfaz de monitorización, donde podrás:
   - Ver el estado de todos los servidores MQTT
   - Iniciar/detener conexiones individuales
   - Monitorizar el estado de las conexiones en tiempo real

El cliente MQTT:
- Se conectará al servidor MQTT especificado
- Se suscribirá al topic "#" (todos los topics)
- Procesará mensajes con formato de topic: `/apikey/serial/...`
- Registrará dispositivos nuevos y actualizará la última comunicación
- Almacenará todos los mensajes recibidos

## Documentación API

La documentación Swagger de la API está disponible en:
`http://localhost:3000/api-docs`

## Contacto

Si tienes preguntas o necesitas más información, puedes contactarme a través de:

- **Correo electrónico**: roberto.burruezom@um.es
- **Github**: [RobertoBM21](https://github.com/RobertoBM21)
