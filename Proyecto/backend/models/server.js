const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Server = sequelize.define("Server", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.STRING,
    endpoint: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
  });
  return Server;
};
