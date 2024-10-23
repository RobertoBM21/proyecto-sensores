const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - serial
 *         - timestamp
 *         - topic
 *         - content
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del mensaje
 *           example: 1
 *         serial:
 *           type: string
 *           description: Serial único del dispositivo asociado
 *           example: "IC0104E17000800012"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora en que se generó el mensaje
 *           example: "2024-10-21T13:46:11"
 *         topic:
 *           type: string
 *           description: Tema o categoría del mensaje
 *           example: "attrs"
 *         content:
 *           type: object
 *           description: Contenido del mensaje en formato JSON
 *           example: { "powfail": "1" }
 *       example:
 *         serial: "IC0104E17000800012"
 *         timestamp: "2024-10-21T13:46:11"
 *         topic: "attrs"
 *         content: { "powfail": "1" }
 */
const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    serial: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    topic: {
      type: DataTypes.STRING,
    },
    content: {
      type: DataTypes.JSON,
    },
  },
  {
    // Los índices se nombran así por convención
    indexes: [
      {
        name: "idx_serial",
        fields: ["serial"],
      },
      {
        name: "idx_timestamp",
        fields: ["timestamp"],
      },
    ],
  }
);

module.exports = Message;
