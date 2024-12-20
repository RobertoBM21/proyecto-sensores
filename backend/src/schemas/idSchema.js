const Joi = require("joi");
const { BadRequestError } = require("../utils/errors.js");

//* Función común para validar IDs de la base de datos
function validateId(id) {
  const schema = Joi.number().integer().positive().required().messages({
    "number.base": "El ID debe ser un número.",
    "number.integer": "El ID debe ser un número entero.",
    "number.positive": "El ID debe ser un número positivo.",
    "any.required": "El ID es obligatorio.",
  });

  const { error, value } = schema.validate(id);
  if (error) {
    throw new BadRequestError(`ID inválido: ${error.details[0].message}`);
  }
  return value;
}

module.exports = { validateId };
