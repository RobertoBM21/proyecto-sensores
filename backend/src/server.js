//? Cargamos las variables de entorno (prioridad absoluta)
process.loadEnvFile("./.env");

const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log("Conexión a la base de datos establecida correctamente.");

    // Sincronizar los modelos con la base de datos
    await sequelize.sync({ force: true }); //! En producción, eliminar el parámetro
    console.log("Tablas sincronizadas.");

    // Arrancar el servidor
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
      console.log(
        `Swagger docs are available at http://localhost:${PORT}/api-docs`
      );
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
  }
}

//* Inicia el servidor
startServer();
