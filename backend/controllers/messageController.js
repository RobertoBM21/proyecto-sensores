const { Message } = require("../models");

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.findAll();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los mensajes" });
  }
};

exports.getMessageById = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (message) {
      res.json(message);
    } else {
      res.status(404).json({ error: "Mensaje no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el mensaje" });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const message = await Message.create(req.body);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el mensaje" });
  }
};

exports.updateMessage = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (message) {
      await message.update(req.body);
      res.json(message);
    } else {
      res.status(404).json({ error: "Mensaje no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el mensaje" });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (message) {
      await message.destroy();
      res.json({ message: "Mensaje eliminado correctamente" });
    } else {
      res.status(404).json({ error: "Mensaje no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el mensaje" });
  }
};
