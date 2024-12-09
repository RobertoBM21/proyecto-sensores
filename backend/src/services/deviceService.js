const { Device, Server } = require("../models");
const { sequelize } = require("../models");
const {
  NotFoundError,
  BadRequestError,
  ConflictError,
} = require("../utils/errors.js");
const { Op } = require("sequelize");
const { buildBaseWhere } = require("../utils/queryUtils.js");

class DeviceService {
  //* Obtener todos los dispositivos
  async getAllDevices() {
    return await Device.findAll();
  }

  //* Obtener un dispositivo por ID
  async getDeviceById(id) {
    const device = await Device.findByPk(id);
    if (!device) {
      throw new NotFoundError("Dispositivo no encontrado");
    }
    return device;
  }

  //* Obtener un dispositivo por Serial
  async getDeviceBySerial(serial) {
    const device = await Device.findOne({ where: { serial: serial } });
    if (!device) {
      throw new NotFoundError("Dispositivo no encontrado");
    }
    return device;
  }

  //* Crear un nuevo dispositivo
  async createDevice(data) {
    const { serial, apikey, lastCommunication, serverId } = data;

    // Comprobar si ya existe un dispositivo con el mismo serial
    const existingDevice = await Device.findOne({ where: { serial } });
    if (existingDevice) {
      throw new ConflictError("Ya existe un dispositivo con ese serial");
    }

    // Comprobar si el servidor existe
    const server = await Server.findByPk(serverId);
    if (!server) {
      throw new BadRequestError("No existe un servidor con ese ID");
    }

    const device = await Device.create({
      serial,
      apikey,
      lastCommunication,
      serverId,
    });
    return device;
  }

  //* Actualizar un dispositivo existente
  async updateDevice(id, data) {
    const device = await this.getDeviceById(id);

    const { serial, apikey, lastCommunication, serverId } = data;

    // Comprobar si ya existe otro dispositivo con el mismo serial
    const existingDevice = await Device.findOne({ where: { serial } });
    if (existingDevice && existingDevice.id !== id) {
      throw new ConflictError("Ya existe un dispositivo con ese serial");
    }

    // Comprobar si el servidor existe
    const server = await Server.findByPk(serverId);
    if (!server) {
      throw new BadRequestError("No existe un servidor con ese ID");
    }

    await device.update({ serial, apikey, lastCommunication, serverId });
    return device;
  }

  //* Actualizar parcialmente un dispositivo
  async updateDevicePartial(id, data) {
    const device = await this.getDeviceById(id);

    const fields = Object.keys(data);

    // Si se está actualizando el serial
    if (fields.includes("serial")) {
      const { serial } = data;
      const existingDevice = await Device.findOne({ where: { serial } });
      if (existingDevice && existingDevice.id !== id) {
        throw new ConflictError("Ya existe un dispositivo con ese serial");
      }
    }

    // Si se está actualizando el serverId
    if (fields.includes("serverId")) {
      const { serverId } = data;
      const server = await Server.findByPk(serverId);
      if (!server) {
        throw new BadRequestError("No existe un servidor con ese ID");
      }
    }

    await device.update(data, { fields: Object.keys(data) });
    return device;
  }

  //* Eliminar un dispositivo
  async deleteDevice(id) {
    const device = await this.getDeviceById(id);
    await device.destroy();
    return { message: "Dispositivo eliminado correctamente" };
  }

  //* Analizar estado de comunicación de los dispositivos
  async getDeviceActivityReport(params) {
    const { serverIds, page = 1, limit = 50 } = params;

    // Verificar que los servidores existen
    const servers = await Server.findAll({
      where: { id: { [Op.in]: serverIds } },
    });

    if (servers.length !== serverIds.length) {
      const existingIds = servers.map((s) => s.id);
      const missingIds = serverIds.filter((id) => !existingIds.includes(id));
      throw new BadRequestError(
        `Los siguientes servidores no existen: ${missingIds.join(", ")}`
      );
    }

    const baseWhere = buildBaseWhere(params, "lastCommunication");

    // Ejecutar consultas en paralelo con promesas
    const [{ count: totalItems, rows: devices }, totalDevices] =
      await Promise.all([
        Device.findAndCountAll({
          where: baseWhere,
          attributes: [
            "serial",
            "lastCommunication",
            [
              sequelize.literal(`(
            SELECT COUNT(*)
            FROM messages AS message
            WHERE message.serial = Device.serial
            AND message.timestamp >= '${baseWhere.lastCommunication[
              Op.between
            ][0].toISOString()}'
            AND message.timestamp <= '${baseWhere.lastCommunication[
              Op.between
            ][1].toISOString()}'
          )`),
              "messageCount",
            ],
          ],
          order: [["lastCommunication", "DESC"]],
          limit,
          offset: (page - 1) * limit,
          distinct: true,
        }),
        Device.count(),
      ]);

    if (totalItems === 0) {
      throw new NotFoundError(
        "No se encontraron dispositivos para los filtros proporcionados"
      );
    }

    const totalPages = Math.ceil(totalItems / limit);

    return {
      devices: devices.map((d) => ({
        serial: d.serial,
        lastCommunication: d.lastCommunication,
        messageCount: parseInt(d.getDataValue("messageCount")),
      })),
      totalItems,
      totalDevices,
      page,
      totalPages,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}

module.exports = new DeviceService();
