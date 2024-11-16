const deviceService = require("../services/deviceService.js");
const {
  validateDevice,
  validateDeviceId,
  validatePartialDevice,
  validateSerial,
  validateActivityReportParams,
} = require("../schemas/deviceSchema.js");

// Obtener todos los dispositivos
exports.getAllDevices = async (req, res) => {
  const devices = await deviceService.getAllDevices();
  res.json(devices);
};

// Obtener un dispositivo por ID
exports.getDeviceById = async (req, res) => {
  const id = validateDeviceId(req.params.id); //* Validación
  const device = await deviceService.getDeviceById(id);
  res.json(device);
};

// Obtener un dispositivo por serial
exports.getDeviceBySerial = async (req, res) => {
  const serial = validateSerial(req.params.serial); //* Validación
  const device = await deviceService.getDeviceBySerial(serial);
  res.json(device);
};

// Crear un nuevo dispositivo
exports.createDevice = async (req, res) => {
  const data = validateDevice(req.body); //* Validación
  const device = await deviceService.createDevice(data);
  res.status(201).json(device);
};

// Actualizar un dispositivo existente
exports.updateDevice = async (req, res) => {
  const id = validateDeviceId(req.params.id); //* Validación
  const data = validateDevice(req.body); //* Validación
  const updatedDevice = await deviceService.updateDevice(id, data);
  res.json(updatedDevice);
};

// Actualizar parcialmente un dispositivo existente
exports.updateDevicePartial = async (req, res) => {
  const id = validateDeviceId(req.params.id); //* Validación
  const data = validatePartialDevice(req.body); //* Validación
  const updatedDevice = await deviceService.updateDevicePartial(id, data);
  res.json(updatedDevice);
};

// Eliminar un dispositivo
exports.deleteDevice = async (req, res) => {
  const id = validateDeviceId(req.params.id); //* Validación
  const result = await deviceService.deleteDevice(id);
  res.json(result);
};

// Obtener reporte de actividad de dispositivos
exports.getDeviceActivityReport = async (req, res) => {
  // Parsear serverIds solo si existe
  const query = {
    ...req.query,
    serverIds: req.query.serverIds
      ? Array.isArray(req.query.serverIds)
        ? req.query.serverIds
        : req.query.serverIds.split(",").map(Number)
      : undefined,
  };
  const params = validateActivityReportParams(query); //* Validación
  const report = await deviceService.getDeviceActivityReport(params);
  res.json(report);
};
