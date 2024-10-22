const serverService = require("../services/serverService");

exports.getAllServers = async (req, res, next) => {
  try {
    const servers = await serverService.getAllServers();
    res.json(servers);
  } catch (error) {
    next(error);
  }
};

exports.getServerById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const server = await serverService.getServerById(id);
    res.json(server);
  } catch (error) {
    next(error);
  }
};

exports.createServer = async (req, res, next) => {
  try {
    const server = await serverService.createServer(req.body);
    res.status(201).json(server);
  } catch (error) {
    next(error);
  }
};

exports.updateServer = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedServer = await serverService.updateServer(id, req.body);
    res.json(updatedServer);
  } catch (error) {
    next(error);
  }
};

exports.deleteServer = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await serverService.deleteServer(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
