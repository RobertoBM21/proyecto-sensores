# Proyecto Sensores

Este proyecto es una aplicación para gestionar los mensajes enviados por dispositivos IoT a través del protocolo MQTT. La aplicación recoge, estructura, almacena y muestra los servidores, dispositivos y mensajes. El backend está desarrollado utilizando **Node.js** con **Express** y **MySQL**. El frontend está desarrollado en **Vue.js**. Además, cuenta con documentación de API utilizando **Swagger**.

Incluye un script en Python (`mqtt_daemon.py`) que se encarga de conectarse a los brokers MQTT, suscribirse a los topics y enviar los mensajes al backend.

De esta manera, los técnicos tendrán una plataforma en la que consultar de manera sencilla si el dispositivo que han instalado está funcionando correctamente.

## Tabla de Contenidos

- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Configuración](#instalación-y-configuración)
  - [Requisitos Previos](#requisitos-previos)
  - [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
  - [Instalación de Dependencias](#instalación-de-dependencias)
- [Ejecución del Proyecto](#ejecución-del-proyecto)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Script](#script)
- [Contacto](#contacto)

---

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

- **backend/**: Contiene el código fuente del backend, desarrollado con Node.js, Express y MySQL. Incluye las rutas, controladores, modelos y la configuración de la base de datos.

- **frontend/**: Contiene el código fuente del frontend, desarrollado con Vue.js. Incluye los componentes, vistas y la lógica necesaria para interactuar con el backend.

- **script/**: Contiene el script `mqtt_daemon.py`, escrito en Python. Este script se encarga de conectarse a los brokers MQTT, suscribirse a los topics y enviar los mensajes al backend para su procesamiento y almacenamiento.

---

## Instalación y Configuración

### Requisitos Previos

- **Node.js** v22.10.0 o superior.
- **MySQL** instalado y en ejecución.
- **Python 3** para ejecutar el script MQTT Daemon.

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

Desde la carpeta `backend/`, ejecuta:

```bash
npm install
```

**Frontend**

Desde la carpeta `frontend/`, ejecuta:

```bash
npm install
```

**Script**

Desde la carpeta `script/`, instala las dependencias de Python:

```bash
pip install paho-mqtt requests
```

## Ejecución del Proyecto

### Backend

Para iniciar el servidor en modo desarrollo, desde la carpeta `backend/`, ejecuta:

```bash
node --run dev
```

O utilizando npm:

```bash
npm run dev
```

Personalmente recomiendo la primera opción, ya que se ejecuta más rápido y es independiente del gestor de paquetes usado.

Si quieres ejecutar el proyecto en modo normal sustituye `dev` por `start`.

El servidor se ejecutará en el puerto especificado en el archivo `.env` (por defecto, 3000).

### Frontend

Para lanzar la web, desde la carpeta `frontend/`, ejecuta:

```bash
npm run serve
```

O también:

```bash
npm start
```

### Script

Para ejecutar el script, desde la carpeta `script/`, ejecuta:

```bash
python mqtt_daemon.py
```

El backend debe estar en ejecución antes de iniciar el script.

Para el correcto funcionamiento del script es necesario tener al menos un servidor almacenado en la base de datos.

## Contacto

Si tienes preguntas o necesitas más información, puedes contactarme a través de:

- **Correo electrónico**: roberto.burruezom@um.es
- **Github**: [RobertoBM21](https://github.com/RobertoBM21)
