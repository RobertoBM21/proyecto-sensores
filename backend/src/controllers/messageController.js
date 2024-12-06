const messageService = require("../services/messageService.js");
const {
  validateMessageId,
  validateMessage,
  validateSearchParams,
  validateStatsParams,
} = require("../schemas/messageSchema.js");

// Obtener todos los mensajes
exports.getAllMessages = async (req, res) => {
  const messages = await messageService.getAllMessages();
  res.json(messages);
};

// Obtener un mensaje por ID
exports.getMessageById = async (req, res) => {
  const id = validateMessageId(req.params.id); //* Validación
  const message = await messageService.getMessageById(id);
  res.json(message);
};

// Crear un nuevo mensaje
exports.createMessage = async (req, res) => {
  const data = validateMessage(req.body); //* Validación
  const message = await messageService.createMessage(data);
  res.status(201).json(message);
};

// Actualizar un mensaje existente
exports.updateMessage = async (req, res) => {
  const id = validateMessageId(req.params.id); //* Validación
  const data = validateMessage(req.body); //* Validación
  const updatedMessage = await messageService.updateMessage(id, data);
  res.json(updatedMessage);
};

// Eliminar un mensaje
exports.deleteMessage = async (req, res) => {
  const id = validateMessageId(req.params.id); //* Validación
  const result = await messageService.deleteMessage(id);
  res.json(result);
};

// Buscar mensajes mediante filtros
exports.searchMessages = async (req, res) => {
  //? Parsear serverIds solo si existe, ya que aun no se ha validado en el schema, pero se tiene que hacer antes para evitar errores
  const query = {
    ...req.query,
    serverIds: req.query.serverIds
      ? Array.isArray(req.query.serverIds)
        ? req.query.serverIds
        : req.query.serverIds.split(",").map(Number)
      : undefined,
  };

  const params = validateSearchParams(query); //* Validación
  const messages = await messageService.searchMessages(params);
  res.json(messages);
};

// Obtener estadísticas de mensajes
exports.getMessagesStats = async (req, res) => {
  const query = {
    ...req.query,
    serverIds: req.query.serverIds
      ? Array.isArray(req.query.serverIds)
        ? req.query.serverIds
        : req.query.serverIds.split(",").map(Number)
      : undefined,
  };

  const params = validateStatsParams(query); //* Validación
  const stats = await messageService.getMessagesStats(params);
  res.json(stats);
};
