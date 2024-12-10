const { BadRequestError } = require("./errors.js");
const { Op } = require("sequelize");

function getDateRange(range) {
  const now = new Date();
  let start,
    end = now;

  switch (range) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      break;
    case "yesterday":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "last_5_minutes":
      start = new Date(now.getTime() - 5 * 60 * 1000);
      break;
    case "last_15_minutes":
      start = new Date(now.getTime() - 15 * 60 * 1000);
      break;
    case "last_30_minutes":
      start = new Date(now.getTime() - 30 * 60 * 1000);
      break;
    case "last_hour":
      start = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case "last_24_hours":
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "last_week":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case "last_month":
      start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case "last_year":
      start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    default:
      throw new BadRequestError("Rango de fecha no válido");
  }

  return { start, end };
}

function buildBaseWhere(params, dateField = "timestamp") {
  const { serial, apikey, serverIds, startDate, endDate, dateRange } = params;
  const baseWhere = {};

  baseWhere["$Device.serverId$"] = { [Op.in]: serverIds };

  if (serial) {
    baseWhere.serial = { [Op.like]: `${serial}%` };
  }
  if (apikey) {
    baseWhere["$Device.apikey$"] = apikey;
  }
  if (startDate || endDate || dateRange) {
    if (dateRange) {
      const { start, end } = getDateRange(dateRange);
      baseWhere[dateField] = { [Op.between]: [start, end] };
    } else if (startDate && endDate) {
      baseWhere[dateField] = { [Op.between]: [startDate, endDate] };
    }
  }

  return baseWhere;
}

module.exports = { getDateRange, buildBaseWhere };
