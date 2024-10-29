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

// Función para validar todos los campos del mensaje
function validateMessage(data) {
  const { error, value } = messageSchema.validate(data);
  if (error) {
    throw new BadRequestError(error.details[0].message);
  }
  return value; // Datos validados
}

// Función para validar solo el ID del mensaje
function validateMessageId(id) {
  return validateId(id);
}

module.exports = { validateMessageId, validateMessage };
