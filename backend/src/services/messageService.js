const { Message, Device } = require("../models");
const { NotFoundError, BadRequestError } = require("../utils/errors.js");
const { getDateRange } = require("../utils/dateUtils.js");
const { Op } = require("sequelize");

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
    const {
      serial,
      serverId,
      startDate,
      endDate,
      dateRange,
      page = 1,
      limit = 50,
    } = params;

    // Filtros de búsqueda
    const baseWhere = {};

    if (serial) {
      baseWhere.serial = { [Op.like]: `${serial}%` };
    }
    if (serverId) baseWhere["$Device.serverId$"] = serverId;
    if (startDate || endDate || dateRange) {
      baseWhere.timestamp = {};
      if (dateRange) {
        const { start, end } = getDateRange(dateRange);
        baseWhere.timestamp[Op.between] = [start, end];
      } else {
        if (startDate) baseWhere.timestamp[Op.gte] = startDate;
        if (endDate) baseWhere.timestamp[Op.lte] = endDate;
      }
    }

    // Consulta base
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
      throw new NotFoundError("No se encontraron mensajes");
    }

    return {
      messages,
      totalItems: messageCount,
      totalDevices: deviceCount,
      page,
      totalPages: Math.ceil(messageCount / limit),
      limit,
      hasNextPage: page < Math.ceil(messageCount / limit),
      hasPreviousPage: page > 1,
    };
  }
}

module.exports = new MessageService();
