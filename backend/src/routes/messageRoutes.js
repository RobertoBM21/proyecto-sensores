const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

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
