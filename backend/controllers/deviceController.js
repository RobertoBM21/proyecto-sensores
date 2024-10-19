const { Device } = require("../models");

exports.getAllDevices = async (req, res) => {
  try {
    const devices = await Device.findAll();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los dispositivos" });
  }
};

exports.getDeviceById = async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);
    if (device) {
      res.json(device);
    } else {
      res.status(404).json({ error: "Dispositivo no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el dispositivo" });
  }
};

exports.getDeviceBySerial = async (req, res) => {
  try {
    const device = await Device.findOne({
      where: { serial: req.params.serial },
    });
    if (device) {
      res.json(device);
    } else {
      res.status(404).json({ error: "Dispositivo no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el dispositivo" });
  }
};

exports.createDevice = async (req, res) => {
  try {
    const device = await Device.create(req.body);
    res.status(201).json(device);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el dispositivo" });
  }
};

exports.updateDevice = async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);
    if (device) {
      await device.update(req.body);
      res.json(device);
    } else {
      res.status(404).json({ error: "Dispositivo no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el dispositivo" });
  }
};

exports.updateDevicePartial = async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);
    if (device) {
      await device.update(req.body, { fields: Object.keys(req.body) });
      res.json(device);
    } else {
      res.status(404).json({ error: "Dispositivo no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el dispositivo" });
  }
};

exports.deleteDevice = async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);
    if (device) {
      await device.destroy();
      res.json({ message: "Dispositivo eliminado correctamente" });
    } else {
      res.status(404).json({ error: "Dispositivo no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el dispositivo" });
  }
};
