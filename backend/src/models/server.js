const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");

/**
 * @swagger
 * components:
 *   schemas:
 *     Server:
 *       type: object
 *       required:
 *         - name
 *         - endpoint
 *         - username
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del servidor
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre del servidor
 *           example: "Servidor de Murcia"
 *         endpoint:
 *           type: string
 *           description: URL del endpoint del servidor
 *           example: "agriculture-dev.odins.es:11883"
 *         username:
 *           type: string
 *           description: Nombre de usuario para autenticación
 *           example: "usuario_1"
 *         password:
 *           type: string
 *           description: Contraseña para autenticación
 *           example: "contraseña_1"
 *         topicFormat:
 *           type: string
 *           description: Formato del topic MQTT (usando {variable})
 *           example: "/{apikey}/{serial}/{type}"
 *       example:
 *         name: "OdinS"
 *         endpoint: "agriculture-dev.odins.es:11883"
 *         username: "usuario_1"
 *         password: "contraseña_1"
 *         topicFormat: "/{apikey}/{serial}/{type}"
 */
const Server = sequelize.define("Server", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  endpoint: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
  },
  topicFormat: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "/{apikey}/{serial}/{type}",
  },
});

module.exports = Server;
