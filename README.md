# Sistema de Monitoreo de Sensores

Este proyecto es una aplicación para gestionar los mensajes enviados por dispositivos IoT a través del protocolo MQTT. La aplicación recoge, estructura, almacena y muestra los servidores, dispositivos y mensajes. El backend está desarrollado utilizando **Node.js** con **Express** y **MySQL** y cuenta con documentación de API utilizando **Swagger**. El frontend está desarrollado en **Vue.js** con **Vite** y **TailwindCSS**. Los scripts están desarrollados con **Python**. El proyecto en su conjunto se despliega con **Docker**.

## Tabla de Contenidos

- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos](#requisitos)
- [Configuración](#configuración)
  - [Variables de Entorno](#variables-de-entorno)
- [Ejecución](#ejecución)
  - [Inicio Rápido](#inicio-rápido)
  - [Script MQTT](#script-mqtt)
- [Gestión de Clientes MQTT](#gestión-de-clientes-mqtt)
  - [Gestor Principal MQTT](#gestor-principal-mqtt)
  - [Cliente MQTT Individual](#cliente-mqtt-individual)
- [Contacto](#contacto)

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

```
proyecto-sensores/
├── backend/               ## Servidor Node.js/Express
│   ├── src/
│   │   ├── config/         # Configuración de la base de datos
│   │   ├── controllers/    # Controladores de la API
│   │   ├── docs/           # Configuración de Swagger
│   │   ├── middleware/     # Middleware de Express
│   │   ├── models/         # Modelos Sequelize
│   │   ├── routes/         # Rutas de la API
│   │   ├── services/       # Servicios de negocio
│   │   └── utils/          # Utilidades
├── frontend/              ## Aplicación Vue.js
│   ├── public/             # Archivos estáticos públicos (favicon)
│   └── src/
│       ├── assets/         # Recursos estáticos (imágenes, iconos, fuentes)
│       ├── components/     # Componentes Vue reutilizables
│       │   └── ui/          # Componentes shadcn-vue reutilizables
│       ├── lib/            # Utilidades y funciones auxiliares
│       ├── router/         # Configuración de rutas de Vue Router
│       ├── stores/         # Gestión de estado con Pinia
│       └── views/          # Componentes de página/vista completa
├── script/                ## Scripts Python MQTT
│   ├── mqtt_client.py      # Cliente MQTT individual
│   ├── mqtt_manager.py     # Gestor de clientes MQTT
│   └── logs/               # Carpeta para logs de MQTT
```

## Requisitos

Para ejecutar con Docker:

- **Docker** y **Docker Compose**

## Configuración

### Variables de Entorno

El proyecto requiere un archivo de variables de entorno `.env`. Puedes crear una copia del archivo `.env.example` proporcionado y ajustar los valores según tus necesidades:

Variables necesarias:

```env
# Configuración del servidor
PORT=3000

# Configuración de Base de Datos
DB_NAME=sensores
DB_USER=tu_usuario_de_mysql
DB_PASSWORD=tu_contraseña_de_mysql
DB_HOST=db
DB_DIALECT=mysql
DB_PORT=3306

# Configuración de seguridad
ENCRYPTION_KEY=tu_clave_de_encriptación_de_64_caracteres_en_hexadecimal

# Configuración API Script y Frontend
API_URL=http://backend:3000
VITE_API_URL=http://localhost:3000

#Configuración ruta Frontend
VITE_FRONTEND_URL=http://localhost:80

# Configuración Backend (Keycloak)
KEYCLOAK_URL=http://keycloak:8080/
KEYCLOAK_REALM=sensores

# Configuración Keycloak
VITE_KEYCLOAK_URL=http://localhost:8080/
VITE_KEYCLOAK_REALM=sensores
VITE_KEYCLOAK_CLIENT_ID=app-sensores
```

## Ejecución

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

### Script MQTT

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

## Gestión de Clientes MQTT

El proyecto implementa un sistema de gestión de conexiones MQTT que consta de dos componentes principales: un gestor central y clientes individuales.

### Gestor Principal MQTT

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

### Cliente MQTT Individual

```bash
# Ejecutar el cliente MQTT para un servidor específico
python mqtt_client.py <server_id> [--debug]
```

**Características:**

- **Conexión** a un servidor MQTT utilizando credenciales almacenadas en la base de datos
- **Procesamiento flexible de mensajes MQTT**:
  - Formato de topic configurable por servidor
  - Solo se requiere la presencia de un identificador `serial` y un `apikey` en el topic
  - Formato por defecto: `/{apikey}/{serial}/{type}`
  - Soporta variables personalizadas mediante plantillas (ej: `/{cliente}/{serial}/{sensor}/...`)
- **Actualización y creación** de dispositivos en la base de datos
- **Almacenamiento de mensajes** recibidos en el backend
- **Gestión de reconexión automática** y recuperación ante fallos
- **Manejo de logs detallados**, con opción de nivel de log dinámico mediante el argumento `--debug`

## Contacto

Si tienes preguntas o necesitas más información, puedes contactarme a través de:

- **Correo electrónico**: roberto.burruezom@gmail.com
- **Github**: [RobertoBM21](https://github.com/RobertoBM21)
