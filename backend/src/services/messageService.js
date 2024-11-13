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

    // Configurar condiciones de consulta (WHERE)
    const where = {};

    // Busca cualquier serial que comience con el patrón proporcionado
    if (serial) {
      where.serial = {
        [Op.like]: `${serial}%`,
      };
    }

    // Filtrar por rango de fecha
    if (startDate || endDate || dateRange) {
      where.timestamp = {};

      if (dateRange) {
        const { start, end } = getDateRange(dateRange);
        where.timestamp[Op.between] = [start, end];
      } else {
        if (startDate) where.timestamp[Op.gte] = startDate;
        if (endDate) where.timestamp[Op.lte] = endDate;
      }
    }

    if (serverId) where["$Device.serverId$"] = serverId;

    // Configurar opciones de consulta de numero de dispositivos únicos
    const deviceQueryOptions = {
      where,
      include: [
        {
          model: Device,
          attributes: [],
        },
      ],
      distinct: true,
      col: "serial",
    };

    //* Consulta para contar dispositivos únicos
    const deviceCount = await Message.count(deviceQueryOptions);

    // Configurar opciones de consulta de mensajes
    const messageQueryOptions = {
      where,
      include: [
        {
          model: Device,
          attributes: [],
        },
      ],
      order: [["timestamp", "DESC"]],
      limit: limit,
      offset: (page - 1) * limit,
    };

    //* Consulta para obtener mensajes
    const { count: messageCount, rows: messages } =
      await Message.findAndCountAll(messageQueryOptions);

    if (messageCount === 0) {
      throw new NotFoundError("No se encontraron mensajes");
    }

    return {
      messages,
      totalItems: messageCount,
      totalDevices: deviceCount,
      page,
      totalPages: Math.ceil(messageCount / limit),
    };
  }
}

module.exports = new MessageService();
