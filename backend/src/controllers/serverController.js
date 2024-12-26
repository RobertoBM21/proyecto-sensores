const serverService = require("../services/serverService.js");
const {
  validateServer,
  validateServerId,
} = require("../schemas/serverSchema.js");

// Obtener todos los servidores
exports.getAllServers = async (_req, res) => {
  const servers = await serverService.getAllServers();
  res.json(servers);
};

// Obtener un servidor por ID
exports.getServerById = async (req, res) => {
  const id = validateServerId(req.params.id); //* Validación
  const server = await serverService.getServerById(id);
  res.json(server);
};

// Obtener estadísticas generales
exports.getGeneralStats = async (_req, res) => {
  const stats = await serverService.getGeneralStats();
  res.json(stats);
};

// Crear un nuevo servidor
exports.createServer = async (req, res) => {
  const data = validateServer(req.body); //* Validación
  const server = await serverService.createServer(data);
  res.status(201).json(server);
};

// Actualizar un servidor existente
exports.updateServer = async (req, res) => {
  const id = validateServerId(req.params.id); //* Validación
  const data = validateServer(req.body); //* Validación
  const updatedServer = await serverService.updateServer(id, data);
  res.json(updatedServer);
};

// Eliminar un servidor
exports.deleteServer = async (req, res) => {
  const id = validateServerId(req.params.id); //* Validación
  const result = await serverService.deleteServer(id);
  res.json(result);
};
