const { Server } = require("../models");

exports.getAllServers = async (req, res) => {
  try {
    const servers = await Server.findAll();
    res.json(servers);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los servidores" });
  }
};

exports.getServerById = async (req, res) => {
  try {
    const server = await Server.findByPk(req.params.id);
    if (server) {
      res.json(server);
    } else {
      res.status(404).json({ error: "Servidor no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el servidor" });
  }
};

exports.createServer = async (req, res) => {
  try {
    const server = await Server.create(req.body);
    res.status(201).json(server);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el servidor" });
  }
};

exports.updateServer = async (req, res) => {
  try {
    const server = await Server.findByPk(req.params.id);
    if (server) {
      await server.update(req.body);
      res.json(server);
    } else {
      res.status(404).json({ error: "Servidor no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el servidor" });
  }
};

exports.deleteServer = async (req, res) => {
  try {
    const server = await Server.findByPk(req.params.id);
    if (server) {
      await server.destroy();
      res.json({ message: "Servidor eliminado correctamente" });
    } else {
      res.status(404).json({ error: "Servidor no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el servidor" });
  }
};
