const swaggerJSDoc = require("swagger-jsdoc");

// Opciones para la configuración de Swagger
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Sistema de Monitoreo de Sensores",
      version: "1.0.0",
      description:
        "Documentación de la API para el proyecto de monitoreo de IoT",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/models/*.js"],
};

// Documentación en formato JSON
const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
