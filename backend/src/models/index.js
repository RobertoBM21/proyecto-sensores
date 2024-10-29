const sequelize = require("../config/database.js");
const Server = require("./server.js");
const Device = require("./device.js");
const Message = require("./message.js");

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
