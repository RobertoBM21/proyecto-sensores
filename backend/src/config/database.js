const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,

    logging: false, //* Muestra las consultas SQL en la consola para debuggear
    logQueryParameters: false, //* Muestra los parámetros de las consultas SQL
  }
);

module.exports = sequelize;
