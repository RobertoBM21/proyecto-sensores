const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Device = sequelize.define("Device", {
    serial: { type: DataTypes.STRING, primaryKey: true },
    apikey: DataTypes.STRING,
    lastCommunication: DataTypes.DATE,
    serverId: DataTypes.INTEGER,
  });
  return Device;
};
