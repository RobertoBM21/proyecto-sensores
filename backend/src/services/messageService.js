const { Message, Device } = require("../models");
const { NotFoundError, BadRequestError } = require("../utils/errors.js");
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

    if (serial) where.serial = serial;

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

    // Configurar opciones de consulta (LIMIT, OFFSET, ORDER)
    const options = {
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

    // Ejecutar la consulta
    const { count, rows: messages } = await Message.findAndCountAll(options);

    if (count === 0) {
      throw new NotFoundError("No se encontraron mensajes");
    }

    return {
      messages,
      totalItems: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }
}

//* Función auxiliar para calcular rangos de fecha predefinidos
function getDateRange(range) {
  const now = new Date();
  let start,
    end = now;

  switch (range) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      break;
    case "yesterday":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "last_5_minutes":
      start = new Date(now.getTime() - 5 * 60 * 1000);
      break;
    case "last_15_minutes":
      start = new Date(now.getTime() - 15 * 60 * 1000);
      break;
    case "last_30_minutes":
      start = new Date(now.getTime() - 30 * 60 * 1000);
      break;
    case "last_hour":
      start = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case "last_24_hours":
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "last_week":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case "last_month":
      start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case "last_year":
      start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    default:
      throw new BadRequestError("Rango de fecha no válido");
  }

  return { start, end };
}

module.exports = new MessageService();
