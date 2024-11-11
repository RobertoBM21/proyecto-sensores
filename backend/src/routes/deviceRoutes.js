const deviceController = require("../controllers/deviceController.js");
const express = require("express");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Devices
 *   description: Gestión de dispositivos
 */

/**
 * @swagger
 * /devices:
 *   get:
 *     summary: Obtiene todos los dispositivos
 *     tags: [Devices]
 *     responses:
 *       200:
 *         description: Lista de dispositivos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Device'
 */
router.get("/", deviceController.getAllDevices);

/**
 * @swagger
 * /devices:
 *   post:
 *     summary: Crea un nuevo dispositivo
 *     tags: [Devices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Device'
 *     responses:
 *       201:
 *         description: Dispositivo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Device'
 *       400:
 *         description: Error en la solicitud
 *       409:
 *         description: Ya existe un dispositivo con ese serial
 */
router.post("/", deviceController.createDevice);

/**
 * @swagger
 * /devices/activity:
 *   get:
 *     summary: Obtiene un reporte de los dispositivos que han comunicado dado un rango de fechas
 *     tags: [Devices]
 *     parameters:
 *       - in: query
 *         name: serverIds
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: integer
 *         style: form
 *         explode: false
 *         description: Array de IDs de servidores a consultar
 *       - in: query
 *         name: beforeDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha límite superior (debe ser posterior a afterDate)
 *       - in: query
 *         name: afterDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha límite inferior (debe ser anterior a beforeDate)
 *     responses:
 *       200:
 *         description: Reporte de actividad obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     devicesBeforeCount:
 *                       type: integer
 *                       description: Número de dispositivos que comunicaron antes de beforeDate
 *                     devicesAfterCount:
 *                       type: integer
 *                       description: Número de dispositivos que comunicaron después de afterDate
 *                     devicesBetweenCount:
 *                       type: integer
 *                       description: Número de dispositivos que comunicaron entre las fechas
 *                 devices:
 *                   type: object
 *                   properties:
 *                     before:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Seriales de dispositivos que comunicaron antes de beforeDate
 *                     after:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Seriales de dispositivos que comunicaron después de afterDate
 *                     between:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Seriales de dispositivos que comunicaron entre las fechas
 *       400:
 *         description: Parámetros inválidos
 *       404:
 *         description: Uno o más servidores especificados no fueron encontrados
 */
router.get("/activity", deviceController.getDeviceActivityReport);

/**
 * @swagger
 * /devices/serial/{serial}:
 *   get:
 *     summary: Obtiene un dispositivo por su serial
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: serial
 *         schema:
 *           type: string
 *         required: true
 *         description: Serial único del dispositivo a obtener
 *     responses:
 *       200:
 *         description: Dispositivo obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Device'
 *       400:
 *         description: Serial inválido
 *       404:
 *         description: Dispositivo no encontrado
 */

//? La ruta se coloca antes de la ruta /:id para que se procese correctamente
router.get("/serial/:serial", deviceController.getDeviceBySerial);

/**
 * @swagger
 * /devices/{id}:
 *   get:
 *     summary: Obtiene un dispositivo por ID
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del dispositivo a obtener
 *     responses:
 *       200:
 *         description: Dispositivo obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Device'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Dispositivo no encontrado
 */
router.get("/:id", deviceController.getDeviceById);

/**
 * @swagger
 * /devices/{id}:
 *   put:
 *     summary: Actualiza un dispositivo existente
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del dispositivo a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Device'
 *     responses:
 *       200:
 *         description: Dispositivo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Device'
 *       400:
 *         description: Error en la solicitud
 *       404:
 *         description: Dispositivo no encontrado
 *       409:
 *         description: Conflicto, el dispositivo ya existe
 */
router.put("/:id", deviceController.updateDevice);

/**
 * @swagger
 * /devices/{id}:
 *   patch:
 *     summary: Actualiza parcialmente un dispositivo
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del dispositivo a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serial:
 *                 type: string
 *               apikey:
 *                 type: string
 *               lastCommunication:
 *                 type: string
 *                 format: date-time
 *               serverId:
 *                 type: integer
 *             example:
 *               serial: "IC0104E17000800012"
 *               apikey: "odins"
 *     responses:
 *       200:
 *         description: Dispositivo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Device'
 *       400:
 *         description: Error en la solicitud
 *       404:
 *         description: Dispositivo no encontrado
 *       409:
 *         description: Ya existe un dispositivo con ese serial
 */
router.patch("/:id", deviceController.updateDevicePartial);

/**
 * @swagger
 * /devices/{id}:
 *   delete:
 *     summary: Elimina un dispositivo
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del dispositivo a eliminar
 *     responses:
 *       200:
 *         description: Dispositivo eliminado exitosamente
 *       404:
 *         description: Dispositivo no encontrado
 */
router.delete("/:id", deviceController.deleteDevice);

module.exports = router;
