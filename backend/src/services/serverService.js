const { Server } = require("../models");
const deviceService = require("./deviceService.js");
const messageService = require("./messageService.js");
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
    const { name, endpoint, username, password, topicFormat } = data;

    // Comprobar si ya existe un servidor con el mismo endpoint y username
    const existingServer = await Server.findOne({
      where: {
        endpoint,
        username,
      },
    });

    if (existingServer) {
      throw new ConflictError("Ya existe el usuario en el servidor");
    }

    const server = await Server.create({
      name,
      endpoint,
      username,
      password: encrypt(password),
      ...(topicFormat && { topicFormat }), // Solo incluir el formato si se proporciona, sino se usa el valor por defecto
    });

    return server;
  }

  //* Actualizar un servidor existente
  async updateServer(id, data) {
    const server = await this.getServerById(id);

    const { name, endpoint, username, password, topicFormat } = data;

    // Comprobar si ya existe otro servidor con el mismo endpoint y username
    const existingServer = await Server.findOne({
      where: {
        endpoint,
        username,
      },
    });

    if (existingServer && existingServer.id !== id) {
      throw new ConflictError("Ya existe el usuario en el servidor");
    }

    await server.update({
      name,
      endpoint,
      username,
      password: encrypt(password),
      ...(topicFormat && { topicFormat }), // Solo incluir si se proporciona, sino se usa el valor actual
    });

    return server;
  }

  //* Eliminar un servidor
  async deleteServer(id) {
    const server = await this.getServerById(id);
    await server.destroy();
    return { message: "Servidor eliminado correctamente" };
  }

  //* Obtener estadísticas generales
  async getGeneralStats() {
    const servers = await this.getAllServers();
    const serverIds = servers.map((server) => server.id);

    // Función auxiliar para manejar cada promesa y mantener consistencia de errores
    const handlePromise = async (promise) => {
      try {
        const result = await promise;
        return { data: result, error: null };
      } catch (error) {
        return {
          data: null,
          error: {
            name: error.name || "Error",
            message: error.message,
          },
        };
      }
    };

    const [activeDevicesResult, recentMessagesResult, weeklyStatsResult] =
      await Promise.all([
        handlePromise(
          deviceService.getDeviceActivityReport({
            serverIds,
            dateRange: "last_hour",
          })
        ),
        handlePromise(
          messageService.searchMessages({
            serverIds,
            dateRange: "last_24_hours",
          })
        ),
        handlePromise(
          deviceService.getDeviceActivityReport({
            serverIds,
            dateRange: "last_week",
          })
        ),
      ]);

    return {
      activeDevices: activeDevicesResult.data?.totalItems ?? null,
      recentMessages: recentMessagesResult.data?.totalItems ?? null,
      weeklyStats: weeklyStatsResult.data
        ? {
            totalDevices: weeklyStatsResult.data.totalDevices,
            totalItems: weeklyStatsResult.data.totalItems,
          }
        : null,
      errors: {
        activeDevices: activeDevicesResult.error,
        recentMessages: recentMessagesResult.error,
        weeklyStats: weeklyStatsResult.error,
      },
    };
  }
}

module.exports = new ServerService();
