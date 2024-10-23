const deviceService = require("../services/deviceService");
const { BadRequestError } = require("../utils/errors");

exports.getAllDevices = async (req, res, next) => {
  try {
    const devices = await deviceService.getAllDevices();
    res.json(devices);
  } catch (error) {
    next(error);
  }
};

exports.getDeviceById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const device = await deviceService.getDeviceById(id);
    res.json(device);
  } catch (error) {
    next(error);
  }
};

exports.getDeviceBySerial = async (req, res, next) => {
  try {
    const device = await deviceService.getDeviceBySerial(req.params.serial);
    res.json(device);
  } catch (error) {
    next(error);
  }
};

exports.createDevice = async (req, res, next) => {
  try {
    const device = await deviceService.createDevice(req.body);
    res.status(201).json(device);
  } catch (error) {
    next(error);
  }
};

exports.updateDevice = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedDevice = await deviceService.updateDevice(id, req.body);
    res.json(updatedDevice);
  } catch (error) {
    next(error);
  }
};

exports.updateDevicePartial = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedDevice = await deviceService.updateDevicePartial(id, req.body);
    res.json(updatedDevice);
  } catch (error) {
    next(error);
  }
};

exports.deleteDevice = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await deviceService.deleteDevice(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
