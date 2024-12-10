const { Message, Device, Server } = require("../models");
const { NotFoundError, BadRequestError } = require("../utils/errors.js");
const { Op } = require("sequelize");
const { buildBaseWhere } = require("../utils/queryUtils.js");

class MessageService {
  //* Obtener todos los mensajes
  async getAllMessages() {
    return await Message.findAll();
  }

  //* Obtener un mensaje por ID
  async getMessageById(id) {
    const message = await Message.findByPk(id);
    if (!message) {
      throw new NotFoundError("Mensaje no encontrado");
    }
    return message;
  }

  //* Crear un nuevo mensaje
  async createMessage(data) {
    const { serial, timestamp, topic, content } = data;

    // Comprobar si el dispositivo existe
    const device = await Device.findOne({ where: { serial } });
    if (!device) {
      throw new BadRequestError("No existe un dispositivo con ese serial");
    }

    const message = await Message.create({ serial, timestamp, topic, content });
    return message;
  }

  //* Actualizar un mensaje existente
  async updateMessage(id, data) {
    const message = await this.getMessageById(id);

    const { serial, timestamp, topic, content } = data;

    // Comprobar si el dispositivo existe
    const device = await Device.findOne({ where: { serial } });
    if (!device) {
      throw new BadRequestError("No existe un dispositivo con ese serial");
    }

    await message.update({ serial, timestamp, topic, content });
    return message;
  }

  //* Eliminar un mensaje
  async deleteMessage(id) {
    const message = await this.getMessageById(id);
    await message.destroy();
    return { message: "Mensaje eliminado correctamente" };
  }

  //* Buscar mensajes mediante filtros
  async searchMessages(params) {
    const { serverIds, page = 1, limit = 50 } = params;

    // Verificar que los servidores existen
    const servers = await Server.findAll({
      where: { id: { [Op.in]: serverIds } },
    });

    if (servers.length !== serverIds.length) {
      const existingIds = servers.map((s) => s.id);
      const missingIds = serverIds.filter((id) => !existingIds.includes(id));
      throw new BadRequestError(
        `Los siguientes servidores no existen: ${missingIds.join(", ")}`
      );
    }

    const baseWhere = buildBaseWhere(params);
    const baseOptions = {
      where: baseWhere,
      include: [{ model: Device, attributes: [] }],
    };

    // Ejecutar consultas en paralelo con promesas
    const [{ count: messageCount, rows: messages }, deviceCount] =
      await Promise.all([
        Message.findAndCountAll({
          ...baseOptions,
          order: [["timestamp", "DESC"]],
          limit,
          offset: (page - 1) * limit,
        }),
        Message.count({
          ...baseOptions,
          distinct: true,
          col: "serial",
        }),
      ]);

    if (messageCount === 0) {
      throw new NotFoundError(
        "No se encontraron mensajes para los filtros proporcionados"
      );
    }

    const totalPages = Math.ceil(messageCount / limit);

    return {
      messages,
      totalItems: messageCount,
      totalDevices: deviceCount,
      page,
      totalPages,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  //* Obtener estadísticas de mensajes (para la gráfica)
  async getMessagesStats(params) {
    const { serverIds } = params;

    // Verificar que los servidores existen
    const servers = await Server.findAll({
      where: { id: { [Op.in]: serverIds } },
    });

    if (servers.length !== serverIds.length) {
      const existingIds = servers.map((s) => s.id);
      const missingIds = serverIds.filter((id) => !existingIds.includes(id));
      throw new BadRequestError(
        `Los siguientes servidores no existen: ${missingIds.join(", ")}`
      );
    }

    const baseWhere = buildBaseWhere(params);

    const messages = await Message.findAll({
      where: baseWhere,
      include: [{ model: Device, attributes: [] }],
      attributes: ["id", "timestamp"],
      order: [["timestamp", "ASC"]],
    });

    if (messages.length === 0) {
      throw new NotFoundError("No se encontraron mensajes");
    }

    return messages;
  }
}

module.exports = new MessageService();
