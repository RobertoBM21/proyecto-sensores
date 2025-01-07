const messageController = require("../controllers/messageController.js");
const { authMiddleware } = require("../middleware/auth.js");
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
router.get("/", authMiddleware, messageController.getAllMessages);

/**
 * @swagger
 * /messages/search:
 *   get:
 *     summary: Obtiene una lista de mensajes paginada según los filtros aplicados
 *     tags: [Messages]
 *     parameters:
 *       - in: query
 *         name: serial
 *         schema:
 *           type: string
 *         description: Serial del dispositivo
 *       - in: query
 *         name: apikey
 *         schema:
 *           type: string
 *         description: API Key del dispositivo
 *       - in: query
 *         name: serverIds
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: integer
 *         style: form
 *         explode: false
 *         description: |
 *           Array de IDs de servidores a consultar.
 *           Formato: serverIds=1,2,3
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
 *           enum: [last_5_minutes, last_15_minutes, last_30_minutes, last_hour, last_24_hours, today, yesterday, last_week, last_month, last_year]
 *         description: Rango de fecha predefinido
 *     description: |
 *       Los parámetros de fecha son opcionales, pero si se proporcionan deben cumplir una de estas condiciones:
 *       1. Proporcionar solo dateRange
 *       2. Proporcionar tanto startDate como endDate juntos
 *
 *       No se permite mezclar dateRange con startDate/endDate
 *     responses:
 *       200:
 *         description: Lista de mensajes paginada
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
 *                 itemsPerPage:
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
 *        description: Mensajes no encontrados para los filtros proporcionados
 */
router.get("/search", authMiddleware, messageController.searchMessages);

/**
 * @swagger
 * /messages/stats:
 *   get:
 *     summary: Obtiene estadísticas temporales de mensajes según los filtros aplicados
 *     tags: [Messages]
 *     parameters:
 *       - in: query
 *         name: serial
 *         schema:
 *           type: string
 *         description: Serial del dispositivo
 *       - in: query
 *         name: apikey
 *         schema:
 *           type: string
 *         description: API Key del dispositivo
 *       - in: query
 *         name: serverIds
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: integer
 *         style: form
 *         explode: false
 *         description: |
 *           Array de IDs de servidores a consultar.
 *           Formato: serverIds=1,2,3
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
 *           enum: [last_5_minutes, last_15_minutes, last_30_minutes, last_hour, last_24_hours, today, yesterday, last_week, last_month, last_year]
 *         description: Rango de fecha predefinido
 *     description: |
 *       Los parámetros de fecha son opcionales, pero si se proporcionan deben cumplir una de estas condiciones:
 *       1. Proporcionar solo dateRange
 *       2. Proporcionar tanto startDate como endDate juntos
 *
 *       No se permite mezclar dateRange con startDate/endDate
 *     responses:
 *       200:
 *         description: Estadísticas de mensajes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Parámetros inválidos
 *       404:
 *         description: No se encontraron mensajes
 */
router.get("/stats", authMiddleware, messageController.getMessagesStats);

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
router.get("/:id", authMiddleware, messageController.getMessageById);

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
router.post("/", authMiddleware, messageController.createMessage);

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
router.put("/:id", authMiddleware, messageController.updateMessage);

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
router.delete("/:id", authMiddleware, messageController.deleteMessage);

module.exports = router;
