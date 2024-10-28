const serverService = require("../services/serverService");

exports.getAllServers = async (req, res) => {
  const servers = await serverService.getAllServers();
  res.json(servers);
};

exports.getServerById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const server = await serverService.getServerById(id);
  res.json(server);
};

exports.createServer = async (req, res) => {
  const server = await serverService.createServer(req.body);
  res.status(201).json(server);
};

exports.updateServer = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const updatedServer = await serverService.updateServer(id, req.body);
  res.json(updatedServer);
};

exports.deleteServer = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const result = await serverService.deleteServer(id);
  res.json(result);
};
