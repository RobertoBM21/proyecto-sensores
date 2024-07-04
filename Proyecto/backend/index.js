const { Sequelize } = require("sequelize");
const config = require("./config");

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
  }
);

const Server = require("./models/server")(sequelize);
const Device = require("./models/device")(sequelize);
const Message = require("./models/message")(sequelize);

Server.hasMany(Device, { foreignKey: "serverId" });
Device.belongsTo(Server, { foreignKey: "serverId" });

Device.hasMany(Message, { foreignKey: "serial", sourceKey: "serial" });
Message.belongsTo(Device, { foreignKey: "serial", targetKey: "serial" });

sequelize.sync();

module.exports = {
  sequelize,
  Server,
  Device,
  Message,
};
