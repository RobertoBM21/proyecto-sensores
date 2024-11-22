const Joi = require("joi");
const { BadRequestError } = require("../utils/errors.js");
const { validateId } = require("./idSchema.js");

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

// Rangos de fecha válidos
const validDateRanges = [
  "today",
  "yesterday",
  "last_5_minutes",
  "last_15_minutes",
  "last_30_minutes",
  "last_hour",
  "last_24_hours",
  "last_week",
  "last_month",
  "last_year",
];

// Esquema para validar los parámetros de búsqueda
const messageSearchSchema = Joi.object({
  serial: Joi.string(),
  apikey: Joi.string(),
  serverId: Joi.number().integer().positive().messages({
    "number.base": 'El campo "serverId" debe ser un número entero.',
    "number.positive": 'El campo "serverId" debe ser un número positivo.',
  }),
  startDate: Joi.date().iso().messages({
    "date.base": 'El campo "startDate" debe ser una fecha válida.',
    "date.format": 'El campo "startDate" debe estar en formato ISO.',
  }),
  endDate: Joi.date().iso().messages({
    "date.base": 'El campo "endDate" debe ser una fecha válida.',
    "date.format": 'El campo "endDate" debe estar en formato ISO.',
  }),
  dateRange: Joi.string()
    .valid(...validDateRanges)
    .messages({
      "any.only": `El campo "dateRange" debe ser uno de los siguientes valores: ${validDateRanges.join(
        ", "
      )}.`,
    }),
  page: Joi.number().integer().positive().default(1).messages({
    "number.base": 'El campo "page" debe ser un número entero.',
    "number.positive": 'El campo "page" debe ser un número positivo.',
  }),
  limit: Joi.number().integer().positive().max(1000).default(50).messages({
    "number.base": 'El campo "limit" debe ser un número entero.',
    "number.positive": 'El campo "limit" debe ser un número positivo.',
    "number.max": 'El campo "limit" no puede ser mayor a 1000.',
  }),
})
  .and("startDate", "endDate") // Si se proporciona un campo, también debe estar el otro
  .custom((value, helpers) => {
    // Validar que startDate sea anterior a endDate
    if (value.startDate && value.endDate && value.startDate > value.endDate) {
      return helpers.message(
        'El campo "startDate" debe ser anterior a "endDate".'
      );
    }
    return value;
  });

//* Función para validar todos los campos del mensaje
function validateMessage(data) {
  const { error, value } = messageSchema.validate(data);
  if (error) {
    throw new BadRequestError(error.details[0].message);
  }
  return value; // Datos validados
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
  return value; // Datos validados
}

module.exports = { validateMessageId, validateMessage, validateSearchParams };
