const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const serverRoutes = require("./routes/serverRoutes.js");
const deviceRoutes = require("./routes/deviceRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swaggerConfig.js");
const errorHandler = require("./middleware/errorHandler.js");

// Crear la aplicación de Express
const app = express();

// Middleware de seguridad
app.use(cors());
app.use(helmet());

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
