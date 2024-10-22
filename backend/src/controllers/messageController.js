const messageService = require("../services/messageService");

exports.getAllMessages = async (req, res, next) => {
  try {
    const messages = await messageService.getAllMessages();
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

exports.getMessageById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const message = await messageService.getMessageById(id);
    res.json(message);
  } catch (error) {
    next(error);
  }
};

exports.createMessage = async (req, res, next) => {
  try {
    const message = await messageService.createMessage(req.body);
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

exports.updateMessage = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedMessage = await messageService.updateMessage(id, req.body);
    res.json(updatedMessage);
  } catch (error) {
    next(error);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await messageService.deleteMessage(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
