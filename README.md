# Overview

La aplicación aún se encuentra en una etapa temprana de desarrollo.

El objetivo de este proyecto es crear una página/app que centralice la recepción y consulta de mensajes MQTT enviados por los dispositivos de la empresa.
De esta manera, los técnicos tendrán una platarforma en la que consultar de manera sencilla si el dispositivo que han instalado está funcionando correctamente, así como un histórico de los datos enviados por cualquier dispositivo.

Este proyecto está enfocado en ser presentado como un TFG.

# Organization

Esta sección detalla como esta organizado tanto el código del proyecto como los archivos relevantes del mismo. Existen dos carpetas principales: Diseño y Proyecto.

- `Diseño/`: contiene aclaraciones, conceptos y referencias que son claves para el desarrollo de la aplicación. Una vez haya concluido el desarrollo de este proyecto ya no será necesario.

- `Proyecto/`: el código de la aplicacion se encuentra organizado dentro de esta carpeta, dividiendose en frontend y backend.

- `frontend/`: está compuesto por los archivos que constituyen el frontend de la aplicación.

- `index.html`: es la página de inicio, en ella se pueden realizar las búsquedas con filtros de los dispositvos buscados. Se apoya en styles.css y app.js para completar su funcionalidad.

- `device.html`: la información y mensajes de cada dispositivo se muestra y organiza gracias a esta página.

- `backend/`: está compuesto por los archivos que constituyen el backend de la aplicación.

- `mqtt_daemon.py`: se trata de un demonio que se conecta a los brokers MQTT. Su funcionalidad consiste en realizar la conexión a cada broker, recibir mensajes, y almacenarlos de forma estructura en la base de datos.

- `db.json`: base de datos basada en json-server en la que se almacenan los servidores/brokers, dispositivos y mensajes. Depende de `package.json` para su ejecución.

- `package.json`: define la configuración de ejecución de json-server.

# Dependencies & Requirements

La versión de Node empleada es 20.13.1.

Para lanzar correctamente la aplicación es necesario instalar varias dependencias. Tal como se menciona en el apartado anterior, para el backend con **npm install** sería suficiente, ya que la dependencia a json-server está definida en el archivo package.json.

Para ejecutar el frontend necesitarás o instalar _http-server_ en tu ordenador a través del comando **npm install --global http-server** o descargando la extensión _Live Server_ en VSCode.

# Building & Running

- Para lanzar la aplicación primero hay que ejecutar los siguientes comandos en las carpetas que contienen los archivos correspondientes.

  - Primera ejecución. Instalar dependencias:
    ```bash
    npm install
    ```
  - Base de datos:

    ```bash
    npm start
    ```

  - Script Python:
    ```bash
    python mqtt_daemon.py
    ```

- Para el frontend mencionaré dos alternativas, con http-server o con la extensión Live Server de VSCode.

  - Http-Server:

    ```bash
    http-server -o
    ```

    - Live Server (combinación de teclas): _Alt + L_ y, a continuación, _Alt + O_

# Known Issues

Dado que aún quedan muchos cambios tanto de arquitectura como de tecnologías por hacer esta sección será actualizada cuando el proyecto se encuentre en una fase más avanzada de desarrollo.

# References

Http-Server information: https://www.npmjs.com/package/http-server  
Json-Server information: https://www.npmjs.com/package/json-server

# Authors

- Roberto Burruezo Martínez \<roberto.burruezom@um.es\>

# TODO

- Pasar el frontend a Vue.js para poder usar plantillas y reestructurar el código

- Hacer el backend con express y conectarlo con la base de datos correspondiente

- Cambiar a otra base de datos (MySQL, SQLite o MongoDB)

- Crear una API REST

- Muchos cambios en el diseño y funcionamiento del frontend
