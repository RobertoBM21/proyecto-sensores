const Joi = require("joi");

// Rangos de fecha válidos
const validDateRanges = [
  "last_5_minutes",
  "last_15_minutes",
  "last_30_minutes",
  "last_hour",
  "last_24_hours",
  "today",
  "yesterday",
  "last_week",
  "last_month",
  "last_year",
];

// Schema base para validación de fechas
const dateRangeSchema = {
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
};

// Función base para validación de fechas
function createBaseDateValidation() {
  return Joi.object(dateRangeSchema).custom((value, helpers) => {
    // Si tiene dateRange, no debe tener startDate ni endDate
    if (value.dateRange && (value.startDate || value.endDate)) {
      return helpers.message(
        "No se puede proporcionar dateRange junto con startDate o endDate"
      );
    }

    // Si tiene uno de startDate o endDate, debe tener ambos
    if (
      (value.startDate && !value.endDate) ||
      (!value.startDate && value.endDate)
    ) {
      return helpers.message(
        "Se deben proporcionar tanto startDate como endDate juntos"
      );
    }

    // Validar que startDate sea anterior a endDate si ambos están presentes
    if (value.startDate && value.endDate && value.startDate >= value.endDate) {
      return helpers.message(
        "El campo 'startDate' debe ser anterior a 'endDate'"
      );
    }

    return value;
  });
}

//* Función para validar fechas (requeridas)
function createRequiredDateValidation() {
  return createBaseDateValidation().custom((value, helpers) => {
    // Si no tiene ni dateRange ni el par startDate/endDate
    if (!value.dateRange && !value.startDate && !value.endDate) {
      return helpers.message(
        "Se debe proporcionar dateRange o el par startDate-endDate"
      );
    }
    return value;
  });
}

//* Función para validar fechas (opcionales)
function createOptionalDateValidation() {
  return createBaseDateValidation();
}

module.exports = {
  validDateRanges,
  dateRangeSchema,
  createOptionalDateValidation,
  createRequiredDateValidation,
};
