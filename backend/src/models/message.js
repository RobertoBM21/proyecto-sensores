const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

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
    // Los indices se nombran así por convención
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
