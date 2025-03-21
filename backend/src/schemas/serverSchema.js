const Joi = require("joi");
const { BadRequestError } = require("../utils/errors.js");
const { validateId } = require("./idSchema.js");

// Expresión regular para validar el formato de la URL y el puerto
const pattern =
  /^[a-zA-Z0-9.-]+:(6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]\d{0,4})$/;

// Esquema para servidor
const serverSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": 'El campo "name" no puede estar vacío.',
    "any.required": 'El campo "name" es obligatorio.',
  }),
  endpoint: Joi.string().pattern(pattern).required().messages({
    "string.empty": 'El campo "endpoint" no puede estar vacío.',
    "any.required": 'El campo "endpoint" es obligatorio.',
    "string.pattern.base":
      'El campo "endpoint" debe estar en formato "url:puerto".',
  }),
  username: Joi.string().required().messages({
    "string.empty": 'El campo "username" no puede estar vacío.',
    "any.required": 'El campo "username" es obligatorio.',
  }),
  password: Joi.string().required().messages({
    "string.empty": 'El campo "password" no puede estar vacío.',
    "any.required": 'El campo "password" es obligatorio.',
  }),
  topicFormat: Joi.string()
    .pattern(
      /^\/(\{[a-zA-Z_][a-zA-Z0-9_]*\}|\w+)(\/(\{[a-zA-Z_][a-zA-Z0-9_]*\}|\w+))*$/
    )
    .custom((value, helpers) => {
      if (!value.includes("{apikey}") || !value.includes("{serial}")) {
        return helpers.message(
          'El campo "topicFormat" debe contener "apikey" y "serial".'
        );
      }
      return value;
    })
    .messages({
      "string.pattern.base":
        'El campo "topicFormat" debe tener un formato válido (ej: "/{{apikey}}/{{serial}}/{{type}}")',
    }),
});

//* Función para validar todos los campos del servidor
function validateServer(data) {
  const { error, value } = serverSchema.validate(data);
  if (error) {
    throw new BadRequestError(error.details[0].message);
  }
  return value;
}

//* Función para validar solo el ID del servidor
function validateServerId(id) {
  return validateId(id);
}

module.exports = { validateServer, validateServerId };
