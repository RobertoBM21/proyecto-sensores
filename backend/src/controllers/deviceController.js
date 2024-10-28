const deviceService = require("../services/deviceService");

exports.getAllDevices = async (req, res) => {
  const devices = await deviceService.getAllDevices();
  res.json(devices);
};

exports.getDeviceById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const device = await deviceService.getDeviceById(id);
  res.json(device);
};

exports.getDeviceBySerial = async (req, res) => {
  const device = await deviceService.getDeviceBySerial(req.params.serial);
  res.json(device);
};

exports.createDevice = async (req, res) => {
  const device = await deviceService.createDevice(req.body);
  res.status(201).json(device);
};

exports.updateDevice = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const updatedDevice = await deviceService.updateDevice(id, req.body);
  res.json(updatedDevice);
};

exports.updateDevicePartial = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const updatedDevice = await deviceService.updateDevicePartial(id, req.body);
  res.json(updatedDevice);
};

exports.deleteDevice = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const result = await deviceService.deleteDevice(id);
  res.json(result);
};
