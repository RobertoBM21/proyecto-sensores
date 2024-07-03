# Overview

La aplicación aún se encuentra en una etapa temprana de desarrollo.

El objetivo de este proyecto es crear una página/app que centralice la recepción y consulta de mensajes MQTT enviados por los dispositivos de la empresa.
De esta manera, los técnicos tendrán una platarforma en la que consultar de manera sencilla si el dispositivo que han instalado está funcionando correctamente, así como un histórico de los datos enviados por cualquier dispositivo.

Las tecnologias empleadas para este proyecto son Vue para el frontend y, más adelante, Express junto a MySQL para el backend. Por ahora el backend emplea json-server.

Este proyecto está enfocado en ser presentado como un TFG.

# Organization

Esta sección detalla como esta organizado tanto el código del proyecto como los archivos relevantes del mismo. Existen dos carpetas principales: Diseño y Proyecto.

- `Diseño/`: contiene aclaraciones, conceptos y referencias que son claves para el desarrollo de la aplicación. Una vez haya concluido el desarrollo de este proyecto ya no será necesario.

- `Proyecto/`: el código de la aplicacion se encuentra organizado dentro de esta carpeta, dividiendose en frontend y backend.

- `frontend/`: está compuesto por los archivos que constituyen el frontend de la aplicación. Se trata de un proyecto Vue.

  - `public/`: contiene los archivos estáticos del proyecto, siendo estos `index.html` y `favicon.ico`. El archivo `index.html` es donde se inyecta el código de la aplicación y el `favicon.ico` corresponde al icono que se muestra en lapestaña del navegador.

  - `src/`: incluye todo el código de la aplicación Vue.

    - `assets/`: en esta carpeta se almacenan las imágenes y recursos empleados por los componentes de la aplicación.

    - `components`: contiene todos los componentes que forman parte del proyecto. Destacando `SearchComponent.vue`, que contiene la página del buscador.

    - `App.vue`: componente raíz de la aplicación. Define la estructura de la página mostrada.

    - `main.js`: punto de entrada de la aplicación. Crea la app.

    - `styles.css`: estilos globales de todos los componentes.

    - `package.json`: define la configuración y dependencias del frontend.

- `backend/`: está compuesto por los archivos que constituyen el backend de la aplicación.

  - `mqtt_daemon.py`: se trata de un demonio que se conecta a los brokers MQTT. Su funcionalidad consiste en realizar la conexión a cada broker, recibir mensajes, y almacenarlos de forma estructura en la base de datos.

  - `db.json`: base de datos basada en json-server en la que se almacenan los servidores/brokers, dispositivos y mensajes. Depende de `package.json` para su ejecución.

  - `package.json`: define la configuración y dependencias de ejecución de json-server.

# Dependencies & Requirements

La versión de Node empleada es 20.13.1.

Para lanzar correctamente la aplicación es necesario instalar varias dependencias. Tal como se menciona en el apartado anterior, para el backend con **npm install** sería suficiente, ya que la dependencia a json-server está definida en el archivo package.json.

Para ejecutar el frontend también es necesario instalar varias dependencias. Tal como ocurre antes esto se consigue con **npm install** gracias al archivo package.json.

# Building & Running

- Para lanzar la aplicación primero hay que ejecutar los siguientes comandos en las carpetas que contienen los archivos correspondientes.

  - Primera ejecución. Instalar dependencias tanto en frontend como en backend:

    ```bash
    cd /Proyecto/frontend
    npm install
    cd ../backend
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

  - Frontend:

    ```bash
    npm start
    ```

# Known Issues

Dado que aún quedan muchos cambios tanto de arquitectura como de tecnologías por hacer esta sección será actualizada cuando el proyecto se encuentre en una fase más avanzada de desarrollo.

# References

Vue.js: https://vuejs.org/guide/introduction.html  
Http-Server: https://www.npmjs.com/package/http-server  
Json-Server: https://www.npmjs.com/package/json-server

# Authors

- Roberto Burruezo Martínez \<roberto.burruezom@um.es\>

# TODO

- Hacer el backend con express y conectarlo con la base de datos correspondiente

- Cambiar a otra base de datos (MySQL, SQLite o MongoDB)

- Crear una API REST

- Muchos cambios en el diseño y funcionamiento del frontend
