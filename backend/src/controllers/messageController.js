const messageService = require("../services/messageService.js");
const {
  validateMessageId,
  validateMessage,
} = require("../schemas/messageSchema.js");

exports.getAllMessages = async (req, res) => {
  const messages = await messageService.getAllMessages();
  res.json(messages);
};

exports.getMessageById = async (req, res) => {
  const id = validateMessageId(req.params.id);
  const message = await messageService.getMessageById(id);
  res.json(message);
};

exports.createMessage = async (req, res) => {
  const data = validateMessage(req.body);
  const message = await messageService.createMessage(data);
  res.status(201).json(message);
};

exports.updateMessage = async (req, res) => {
  const id = validateMessageId(req.params.id);
  const data = validateMessage(req.body);
  const updatedMessage = await messageService.updateMessage(id, data);
  res.json(updatedMessage);
};

exports.deleteMessage = async (req, res) => {
  const id = validateMessageId(req.params.id);
  const result = await messageService.deleteMessage(id);
  res.json(result);
};
