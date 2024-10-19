const express = require("express");
const serverRoutes = require("./routes/serverRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

// Middleware
app.use(express.json());

// Configuración de rutas
app.use("/servers", serverRoutes);
app.use("/devices", deviceRoutes);
app.use("/messages", messageRoutes);

// TODO: Use Swagger to document the API (https://swagger.io/)

module.exports = app;
