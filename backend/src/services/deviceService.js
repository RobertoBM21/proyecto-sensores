const { Device, Server } = require("../models");
const {
  NotFoundError,
  BadRequestError,
  ConflictError,
} = require("../utils/errors.js");
const { Op } = require("sequelize");

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
    const { serverIds, beforeDate, afterDate } = params;

    // Verificar que los servidores existen
    const servers = await Server.findAll({
      where: { id: { [Op.in]: serverIds } },
    });

    if (servers.length !== serverIds.length) {
      const existingIds = servers.map((s) => s.id);
      const missingIds = serverIds.filter((id) => !existingIds.includes(id));
      throw new NotFoundError(
        `No se encontraron los servidores con IDs: ${missingIds.join(", ")}`
      );
    }

    // Query base
    const baseQuery = {
      where: { serverId: { [Op.in]: serverIds } },
      attributes: ["serial", "lastCommunication"],
      order: [["lastCommunication", "DESC"]],
      distinct: true,
    };

    // Ejecutar consultas en paralelo con promesas
    const [beforeResults, afterResults, betweenResults] = await Promise.all([
      beforeDate
        ? Device.findAndCountAll({
            ...baseQuery,
            where: {
              ...baseQuery.where,
              lastCommunication: { [Op.lt]: beforeDate },
            },
          })
        : Promise.resolve({ count: 0, rows: [] }),
      afterDate
        ? Device.findAndCountAll({
            ...baseQuery,
            where: {
              ...baseQuery.where,
              lastCommunication: { [Op.gt]: afterDate },
            },
          })
        : Promise.resolve({ count: 0, rows: [] }),
      beforeDate && afterDate
        ? Device.findAndCountAll({
            ...baseQuery,
            where: {
              ...baseQuery.where,
              lastCommunication: { [Op.between]: [beforeDate, afterDate] },
            },
          })
        : Promise.resolve({ count: 0, rows: [] }),
    ]);

    return {
      summary: {
        devicesBeforeCount: beforeResults.count,
        devicesAfterCount: afterResults.count,
        devicesBetweenCount: betweenResults.count,
      },
      devices: {
        before: beforeResults.rows.map((d) => ({
          serial: d.serial,
          lastCommunication: d.lastCommunication,
        })),
        after: afterResults.rows.map((d) => ({
          serial: d.serial,
          lastCommunication: d.lastCommunication,
        })),
        between: betweenResults.rows.map((d) => ({
          serial: d.serial,
          lastCommunication: d.lastCommunication,
        })),
      },
    };
  }
}

module.exports = new DeviceService();
