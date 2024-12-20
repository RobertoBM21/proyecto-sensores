const swaggerJSDoc = require("swagger-jsdoc");

// Opciones para la configuración de Swagger
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Projecto-Sensores",
      version: "1.0.0",
      description: "Documentación de la API para el proyecto de sensores MQTT",
    },
  },
  apis: ["./src/routes/*.js", "./src/models/*.js"],
};

// Documentación en formato JSON
const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
