const express = require("express");
const serverRoutes = require("./routes/serverRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const messageRoutes = require("./routes/messageRoutes");
const errorHandler = require("./middleware/errorHandler");

// Crear la aplicación de Express
const app = express();

// Middleware para parsear el cuerpo de las peticiones
app.use(express.json());

// Configuración de rutas
app.use("/servers", serverRoutes);
app.use("/devices", deviceRoutes);
app.use("/messages", messageRoutes);

// Middleware de error
app.use(errorHandler);

module.exports = app;
