const messageController = require("../controllers/messageController.js");
const express = require("express");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Gestión de mensajes
 */

/**
 * @swagger
 * /messages:
 *   get:
 *     summary: Obtiene todos los mensajes
 *     tags: [Messages]
 *     responses:
 *       200:
 *         description: Lista de mensajes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 */
router.get("/", messageController.getAllMessages);

/**
 * @swagger
 * /messages/search:
 *   get:
 *     summary: Busca mensajes mediante filtros
 *     tags: [Messages]
 *     parameters:
 *       - in: query
 *         name: serial
 *         schema:
 *           type: string
 *         description: Serial del dispositivo
 *       - in: query
 *         name: serverId
 *         schema:
 *           type: integer
 *         description: ID del servidor
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de inicio en formato ISO
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de fin en formato ISO
 *       - in: query
 *         name: dateRange
 *         schema:
 *           type: string
 *           enum: [today, yesterday, last_5_minutes, last_15_minutes, last_30_minutes, last_hour, last_24_hours, last_week, last_month, last_year]
 *         description: Rango de fecha predefinido
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Cantidad de mensajes por página
 *     responses:
 *       200:
 *         description: Resultado de búsqueda paginado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 totalItems:
 *                   type: integer
 *                   description: Total de mensajes encontrados
 *                 totalDevices:
 *                   type: integer
 *                   description: Total de dispositivos únicos encontrados
 *                 page:
 *                   type: integer
 *                   description: Página actual
 *                 totalPages:
 *                   type: integer
 *                   description: Total de páginas
 *                 limit:
 *                   type: integer
 *                   description: Cantidad de items por página
 *                 hasNextPage:
 *                   type: boolean
 *                   description: Indica si hay más páginas después
 *                 hasPreviousPage:
 *                   type: boolean
 *                   description: Indica si hay páginas anteriores
 *       400:
 *         description: Parámetros inválidos
 *       404:
 *        description: Mensajes no encontrados
 */
router.get("/search", messageController.searchMessages);

/**
 * @swagger
 * /messages/{id}:
 *   get:
 *     summary: Obtiene un mensaje por ID
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del mensaje a obtener
 *     responses:
 *       200:
 *         description: Mensaje obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Mensaje no encontrado
 */
router.get("/:id", messageController.getMessageById);

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Crea un nuevo mensaje
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *     responses:
 *       201:
 *         description: Mensaje creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Error en la solicitud
 */
router.post("/", messageController.createMessage);

/**
 * @swagger
 * /messages/{id}:
 *   put:
 *     summary: Actualiza un mensaje existente
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del mensaje a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *     responses:
 *       200:
 *         description: Mensaje actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Error en la solicitud
 *       404:
 *         description: Mensaje no encontrado
 */
router.put("/:id", messageController.updateMessage);

/**
 * @swagger
 * /messages/{id}:
 *   delete:
 *     summary: Elimina un mensaje
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del mensaje a eliminar
 *     responses:
 *       200:
 *         description: Mensaje eliminado exitosamente
 *       404:
 *         description: Mensaje no encontrado
 */
router.delete("/:id", messageController.deleteMessage);

module.exports = router;
