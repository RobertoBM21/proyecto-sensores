const Joi = require("joi");
const { BadRequestError } = require("../utils/errors.js");
const { validateId } = require("./idSchema.js");
const {
  dateRangeSchema,
  createOptionalDateValidation,
} = require("./dateSchema");

// Esquema para mensaje
const messageSchema = Joi.object({
  serial: Joi.string().required().messages({
    "string.empty": 'El campo "serial" no puede estar vacío.',
    "any.required": 'El campo "serial" es obligatorio.',
  }),
  timestamp: Joi.date().iso().required().messages({
    "date.base": 'El campo "timestamp" debe ser una fecha válida.',
    "date.format": 'El campo "timestamp" debe estar en formato ISO.',
    "any.required": 'El campo "timestamp" es obligatorio.',
  }),
  topic: Joi.string().required().messages({
    "string.empty": 'El campo "topic" no puede estar vacío.',
    "any.required": 'El campo "topic" es obligatorio.',
  }),
  content: Joi.object().required().messages({
    "object.base": 'El campo "content" debe ser un objeto.',
    "any.required": 'El campo "content" es obligatorio.',
  }),
});

// Esquema base para búsqueda de mensajes
const baseSearchSchema = Joi.object({
  serial: Joi.string(),
  apikey: Joi.string(),
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
}).concat(createOptionalDateValidation());

// Esquema extendido para búsqueda paginada
const messageSearchSchema = baseSearchSchema.keys({
  page: Joi.number().integer().positive().default(1).messages({
    "number.base": 'El campo "page" debe ser un número entero.',
    "number.positive": 'El campo "page" debe ser un número positivo.',
  }),
  limit: Joi.number().integer().positive().max(1000).default(50).messages({
    "number.base": 'El campo "limit" debe ser un número entero.',
    "number.positive": 'El campo "limit" debe ser un número positivo.',
    "number.max": 'El campo "limit" no puede ser mayor a 1000.',
  }),
});

// Esquema para estadísticas (sin paginación)
const messageStatsSchema = baseSearchSchema;

//* Función para validar todos los campos del mensaje
function validateMessage(data) {
  const { error, value } = messageSchema.validate(data);
  if (error) {
    throw new BadRequestError(error.details[0].message);
  }
  return value;
}

//* Función para validar solo el ID del mensaje
function validateMessageId(id) {
  return validateId(id);
}

//* Función para validar los parámetros de búsqueda
function validateSearchParams(data) {
  const { error, value } = messageSearchSchema.validate(data);
  if (error) {
    throw new BadRequestError(error.details[0].message);
  }
  return value;
}

function validateStatsParams(data) {
  const { error, value } = messageStatsSchema.validate(data);
  if (error) {
    throw new BadRequestError(error.details[0].message);
  }
  return value;
}

module.exports = {
  validateMessageId,
  validateMessage,
  validateSearchParams,
  validateStatsParams,
};
