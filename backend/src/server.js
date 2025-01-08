const app = require("./app.js");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log("Conexión a la base de datos establecida correctamente.");

    // Sincronizar los modelos con la base de datos
    await sequelize.sync();
    console.log("Tablas sincronizadas.");

    // Arrancar el servidor
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
      console.log(
        `Documentación Swagger de la API disponible en http://localhost:${PORT}/api-docs`
      );
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
  }
}

//* Inicia el servidor
startServer();
