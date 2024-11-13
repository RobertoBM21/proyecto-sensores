const { Server } = require("../models");
const { NotFoundError, ConflictError } = require("../utils/errors.js");
const { encrypt } = require("../utils/crypto.js");

class ServerService {
  //* Obtener todos los servidores
  async getAllServers() {
    return await Server.findAll();
  }

  //* Obtener un servidor por ID
  async getServerById(id) {
    const server = await Server.findByPk(id);
    if (!server) {
      throw new NotFoundError("Servidor no encontrado");
    }
    return server;
  }

  //* Crear un nuevo servidor
  async createServer(data) {
    const { name, endpoint, username, password } = data;

    // Comprobar si ya existe un servidor con el mismo endpoint
    const existingServer = await Server.findOne({ where: { endpoint } });
    if (existingServer) {
      throw new ConflictError("Ya existe un servidor con ese endpoint");
    }

    const server = await Server.create({
      name,
      endpoint,
      username,
      password: encrypt(password),
    });

    return server;
  }

  //* Actualizar un servidor existente
  async updateServer(id, data) {
    const server = await this.getServerById(id);

    const { name, endpoint, username, password } = data;

    // Comprobar si ya existe otro servidor con el mismo endpoint
    const existingServer = await Server.findOne({ where: { endpoint } });
    if (existingServer && existingServer.id !== id) {
      throw new ConflictError("Ya existe un servidor con ese endpoint");
    }

    await server.update({
      name,
      endpoint,
      username,
      password: encrypt(password),
    });

    return server;
  }

  //* Eliminar un servidor
  async deleteServer(id) {
    const server = await this.getServerById(id);
    await server.destroy();
    return { message: "Servidor eliminado correctamente" };
  }
}

module.exports = new ServerService();
