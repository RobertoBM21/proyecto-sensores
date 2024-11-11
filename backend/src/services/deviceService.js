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

    // Consulta base con filtro de servidores
    const baseQuery = {
      where: {
        serverId: { [Op.in]: serverIds },
      },
      attributes: ["serial"],
      distinct: true,
    };

    // Preparar queries para cada rango de tiempo
    const queries = [];

    if (beforeDate) {
      queries.push(
        Device.findAndCountAll({
          ...baseQuery,
          where: {
            ...baseQuery.where,
            lastCommunication: { [Op.lt]: beforeDate },
          },
        }).then((result) => ({
          type: "before",
          count: result.count,
          serials: result.rows.map((d) => d.serial),
        }))
      );
    }

    if (afterDate) {
      queries.push(
        Device.findAndCountAll({
          ...baseQuery,
          where: {
            ...baseQuery.where,
            lastCommunication: { [Op.gt]: afterDate },
          },
        }).then((result) => ({
          type: "after",
          count: result.count,
          serials: result.rows.map((d) => d.serial),
        }))
      );
    }

    if (beforeDate && afterDate) {
      queries.push(
        Device.findAndCountAll({
          ...baseQuery,
          where: {
            ...baseQuery.where,
            lastCommunication: { [Op.between]: [afterDate, beforeDate] },
          },
        }).then((result) => ({
          type: "between",
          count: result.count,
          serials: result.rows.map((d) => d.serial),
        }))
      );
    }

    // Ejecutar todas las consultas en paralelo
    const results = await Promise.all(queries);

    // Procesar resultados
    const summary = {
      devicesBeforeCount: 0,
      devicesAfterCount: 0,
      devicesBetweenCount: 0,
    };

    const devices = {
      before: [],
      after: [],
      between: [],
    };

    results.forEach((result) => {
      switch (result.type) {
        case "before":
          summary.devicesBeforeCount = result.count;
          devices.before = result.serials;
          break;
        case "after":
          summary.devicesAfterCount = result.count;
          devices.after = result.serials;
          break;
        case "between":
          summary.devicesBetweenCount = result.count;
          devices.between = result.serials;
          break;
      }
    });

    return { summary, devices };
  }
}

module.exports = new DeviceService();
