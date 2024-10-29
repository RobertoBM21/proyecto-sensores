const serverService = require("../services/serverService.js");
const {
  validateServer,
  validateServerId,
} = require("../schemas/serverSchema.js");

exports.getAllServers = async (req, res) => {
  const servers = await serverService.getAllServers();
  res.json(servers);
};

exports.getServerById = async (req, res) => {
  const id = validateServerId(req.params.id);
  const server = await serverService.getServerById(id);
  res.json(server);
};

exports.createServer = async (req, res) => {
  const data = validateServer(req.body);
  const server = await serverService.createServer(data);
  res.status(201).json(server);
};

exports.updateServer = async (req, res) => {
  const id = validateServerId(req.params.id);
  const data = validateServer(req.body);
  const updatedServer = await serverService.updateServer(id, data);
  res.json(updatedServer);
};

exports.deleteServer = async (req, res) => {
  const id = validateServerId(req.params.id);
  const result = await serverService.deleteServer(id);
  res.json(result);
};
