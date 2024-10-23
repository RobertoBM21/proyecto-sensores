const swaggerJSDoc = require("swagger-jsdoc");

// Options for the swagger docs
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

// Docs in JSON format
const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
