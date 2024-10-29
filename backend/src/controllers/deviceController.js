const deviceService = require("../services/deviceService.js");
const {
  validateDevice,
  validateDeviceId,
  validatePartialDevice,
  validateSerial,
} = require("../schemas/deviceSchema.js");

exports.getAllDevices = async (req, res) => {
  const devices = await deviceService.getAllDevices();
  res.json(devices);
};

exports.getDeviceById = async (req, res) => {
  const id = validateDeviceId(req.params.id);
  const device = await deviceService.getDeviceById(id);
  res.json(device);
};

exports.getDeviceBySerial = async (req, res) => {
  const serial = validateSerial(req.params.serial);
  const device = await deviceService.getDeviceBySerial(serial);
  res.json(device);
};

exports.createDevice = async (req, res) => {
  const data = validateDevice(req.body);
  const device = await deviceService.createDevice(data);
  res.status(201).json(device);
};

exports.updateDevice = async (req, res) => {
  const id = validateDeviceId(req.params.id);
  const data = validateDevice(req.body);
  const updatedDevice = await deviceService.updateDevice(id, data);
  res.json(updatedDevice);
};

exports.updateDevicePartial = async (req, res) => {
  const id = validateDeviceId(req.params.id);
  const data = validatePartialDevice(req.body);
  const updatedDevice = await deviceService.updateDevicePartial(id, data);
  res.json(updatedDevice);
};

exports.deleteDevice = async (req, res) => {
  const id = validateDeviceId(req.params.id);
  const result = await deviceService.deleteDevice(id);
  res.json(result);
};
