const Joi = require("joi");
const { BadRequestError } = require("../utils/errors.js");
const { validateId } = require("./idSchema.js");
const {
  dateRangeSchema,
  createRequiredDateValidation,
} = require("./dateSchema");

// Esquema para dispositivo
const deviceSchema = Joi.object({
  serial: Joi.string().required().messages({
    "string.empty": 'El campo "serial" no puede estar vacío.',
    "any.required": 'El campo "serial" es obligatorio.',
  }),
  apikey: Joi.string().required().messages({
    "string.empty": 'El campo "apikey" no puede estar vacío.',
    "any.required": 'El campo "apikey" es obligatorio.',
  }),
  lastCommunication: Joi.date().iso().required().messages({
    "date.base": 'El campo "lastCommunication" debe ser una fecha válida.',
    "date.format": 'El campo "lastCommunication" debe estar en formato ISO.',
    "any.required": 'El campo "lastCommunication" es obligatorio.',
  }),
  serverId: Joi.number().integer().positive().required().messages({
    "number.base": 'El campo "serverId" debe ser un número.',
    "number.integer": 'El campo "serverId" debe ser un número entero.',
    "number.positive": 'El campo "serverId" debe ser un número positivo.',
    "any.required": 'El campo "serverId" es obligatorio.',
  }),
});

// Esquema para actualización parcial
const partialDeviceSchema = deviceSchema
  .fork(["serial", "apikey", "lastCommunication", "serverId"], (schema) =>
    schema.optional()
  )
  .min(1)
  .messages({
    "object.min": "Se requiere al menos un campo para actualizar.",
  });

// Esquema para reporte de actividad de dispositivos
const deviceActivityReportSchema = Joi.object({
  serverIds: Joi.array()
    .items(Joi.number().integer().positive())
    .required()
    .messages({
      "array.base": 'El campo "serverIds" debe ser un array.',
      "number.base": "Los IDs de servidor deben ser números.",
      "number.integer": "Los IDs de servidor deben ser números enteros.",
      "number.positive": "Los IDs de servidor deben ser números positivos.",
      "any.required": 'El campo "serverIds" es obligatorio.',
    }),
  ...dateRangeSchema,
  page: Joi.number().integer().positive().default(1).messages({
    "number.base": 'El campo "page" debe ser un número entero.',
    "number.positive": 'El campo "page" debe ser un número positivo.',
  }),
  limit: Joi.number().integer().positive().max(1000).default(50).messages({
    "number.base": 'El campo "limit" debe ser un número entero.',
    "number.positive": 'El campo "limit" debe ser un número positivo.',
    "number.max": 'El campo "limit" no puede ser mayor a 1000.',
  }),
}).concat(createRequiredDateValidation());

//* Función para validar todos los campos del dispositivo
function validateDevice(data) {
  const { error, value } = deviceSchema.validate(data);
  if (error) {
    throw new BadRequestError(error.details[0].message);
  }
  return value;
}

//* Función para validar actualización parcial
function validatePartialDevice(data) {
  const { error, value } = partialDeviceSchema.validate(data);
  if (error) {
    throw new BadRequestError(error.details[0].message);
  }
  return value;
}

//* Función para validar solo el ID del dispositivo
function validateDeviceId(id) {
  return validateId(id);
}

//* Función para validar el serial
function validateSerial(serial) {
  const schema = Joi.string().required().messages({
    "string.empty": 'El "serial" no puede estar vacío.',
    "any.required": 'El "serial" es obligatorio.',
  });
  const { error, value } = schema.validate(serial);
  if (error) {
    throw new BadRequestError(error.details[0].message);
  }
  return value;
}

//* Función para validar los parámetros del reporte de actividad
function validateActivityReportParams(data) {
  const { error, value } = deviceActivityReportSchema.validate(data);
  if (error) {
    throw new BadRequestError(error.details[0].message);
  }
  return value;
}

module.exports = {
  validateDevice,
  validateDeviceId,
  validatePartialDevice,
  validateSerial,
  validateActivityReportParams,
};
