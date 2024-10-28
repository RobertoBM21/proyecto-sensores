const express = require("express");
const serverRoutes = require("./routes/serverRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const messageRoutes = require("./routes/messageRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swaggerConfig");
const errorHandler = require("./middleware/errorHandler");

// Crear la aplicación de Express
const app = express();

// Configuración para no mostrar información sensible
app.disable("x-powered-by");

// Middleware para parsear el cuerpo de las peticiones
app.use(express.json());

// Configuración de rutas
app.use("/servers", serverRoutes);
app.use("/devices", deviceRoutes);
app.use("/messages", messageRoutes);

// Middleware para la documentación de la API
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Middleware de error
app.use(errorHandler);

module.exports = app;
