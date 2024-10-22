const sequelize = require("../config/database");
const Server = require("./server");
const Device = require("./device");
const Message = require("./message");

// Relaciones entre las tablas
Server.hasMany(Device, { foreignKey: "serverId" });
Device.belongsTo(Server, { foreignKey: "serverId" });

Device.hasMany(Message, { foreignKey: "serial", sourceKey: "serial" });
Message.belongsTo(Device, { foreignKey: "serial", targetKey: "serial" });

module.exports = {
  sequelize,
  Server,
  Device,
  Message,
};
