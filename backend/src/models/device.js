const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * @swagger
 * components:
 *   schemas:
 *     Device:
 *       type: object
 *       required:
 *         - serial
 *         - apikey
 *         - lastCommunication
 *         - serverId
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del dispositivo
 *           example: 1
 *         serial:
 *           type: string
 *           description: Serial único del dispositivo
 *           example: "IC0104E17000800012"
 *         apikey:
 *           type: string
 *           description: Clave API del dispositivo
 *           example: "odins"
 *         lastCommunication:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la última comunicación
 *           example: "2023-10-15T12:00:00Z"
 *         serverId:
 *           type: integer
 *           description: ID del servidor asociado
 *           example: 1
 *       example:
 *         serial: "IC0104E17000800012"
 *         apikey: "odins"
 *         lastCommunication: "2024-10-21T13:46:11"
 *         serverId: 1
 */
const Device = sequelize.define("Device", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  serial: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, //* Se indexa automáticamente, no es necesario hacerlo en el modelo
  },
  apikey: {
    type: DataTypes.STRING,
  },
  lastCommunication: {
    type: DataTypes.DATE,
  },
});

module.exports = Device;
