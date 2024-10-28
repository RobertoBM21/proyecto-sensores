const messageService = require("../services/messageService");

exports.getAllMessages = async (req, res) => {
  const messages = await messageService.getAllMessages();
  res.json(messages);
};

exports.getMessageById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const message = await messageService.getMessageById(id);
  res.json(message);
};

exports.createMessage = async (req, res) => {
  const message = await messageService.createMessage(req.body);
  res.status(201).json(message);
};

exports.updateMessage = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const updatedMessage = await messageService.updateMessage(id, req.body);
  res.json(updatedMessage);
};

exports.deleteMessage = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const result = await messageService.deleteMessage(id);
  res.json(result);
};
