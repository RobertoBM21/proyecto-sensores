# Proyecto Sensores

Este proyecto es una aplicación para gestionar los mensajes enviados por dispositivos IoT a través del protocolo MQTT. La aplicación recoge, estructura, almacena y muestra los servidores, dispositivos y mensajes. El backend está desarrollado utilizando **Node.js** con **Express** y **MySQL**. El frontend está desarrollado en **Vue.js**. Además, cuenta con documentación de API utilizando **Swagger**.

Incluye scripts en Python para la gestión de conexiones MQTT y una interfaz web para monitorizar el estado de las conexiones.

## Tabla de Contenidos

- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Configuración](#instalación-y-configuración)
  - [Requisitos Previos](#requisitos-previos)
  - [Configuración de Variables de Entorno y Base de datos](#configuración-de-variables-de-entorno-y-base-de-datos)
    - [Configurar la Base de Datos](#configurar-la-base-de-datos)
    - [Configurar las Variables de Entorno](#configurar-las-variables-de-entorno)
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
    ├── mqtt_client.py      # Cliente MQTT individual
    ├── mqtt_manager.py     # Gestor de clientes MQTT
    └── mqtt_processes.json # Estado de los procesos MQTT
```

---

## Instalación y Configuración

### Requisitos Previos

- **Node.js** v22.11.0 o superior.
- **MySQL** instalado y en ejecución.
- **Python 3.x**
- **Pip** para instalar las dependencias de Python.
- **npm**/**pnpm**/**yarn** como gestor de paquetes

### Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto `backend/` con el siguiente contenido:

```env
DB_NAME=tu_nombre_de_base_de_datos
DB_USER=tu_usuario_de_mysql
DB_PASSWORD=tu_contraseña_de_mysql
DB_HOST=localhost
DB_DIALECT=mysql
DB_PORT=3306

PORT=3000
```

Asegúrate de reemplazar los valores con tus credenciales y configuración de tu base de datos MySQL.

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

- paho-mqtt: version **2.1.0**
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

El proyecto utiliza un sistema de gestión de clientes MQTT que consiste en:

1. **Gestor de Clientes MQTT**:

   ```bash
   python mqtt_manager.py
   ```

   Proporciona una interfaz de línea de comandos para:

   - Mostrar el estado de todos los clientes MQTT
   - Iniciar/detener clientes individuales
   - Verificar y actualizar automáticamente el estado de las conexiones
   - Persistencia de estado entre reinicios

2. **Cliente MQTT Individual**:
   Este script es gestionado automáticamente por el gestor y también puede ejecutarse manualmente proporcionando el id del servidor.

El sistema:

- Mantiene conexiones MQTT independientes para cada servidor
- Gestiona automáticamente la reconexión y recuperación de fallos
- Registra y actualiza dispositivos en la base de datos
- Procesa mensajes con formato de topic: `/apikey/serial/...`
- Almacena todos los mensajes recibidos

## Documentación API

La documentación Swagger de la API está disponible en:
`http://localhost:3000/api-docs`

## Contacto

Si tienes preguntas o necesitas más información, puedes contactarme a través de:

- **Correo electrónico**: roberto.burruezom@um.es
- **Github**: [RobertoBM21](https://github.com/RobertoBM21)
