const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Device = sequelize.define("Device", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  serial: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, //* Se indexa automáticamente, no es necesario definirlo en el modelo
  },
  apikey: {
    type: DataTypes.STRING,
  },
  lastCommunication: {
    type: DataTypes.DATE,
  },
});

module.exports = Device;
