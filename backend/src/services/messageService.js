const { Message, Device } = require("../models");
const { NotFoundError, BadRequestError } = require("../utils/errors.js");

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
}

module.exports = new MessageService();
