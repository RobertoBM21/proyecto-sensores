const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Message = sequelize.define("Message", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    serial: DataTypes.STRING,
    timestamp: DataTypes.DATE,
    topic: DataTypes.STRING,
    content: DataTypes.JSON,
  });
  return Message;
};
