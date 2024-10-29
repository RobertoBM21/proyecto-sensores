const serverController = require("../controllers/serverController.js");
const express = require("express");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Servers
 *   description: Gestión de servidores
 */

/**
 * @swagger
 * /servers:
 *   get:
 *     summary: Obtiene todos los servidores
 *     tags: [Servers]
 *     responses:
 *       200:
 *         description: Lista de servidores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Server'
 */
router.get("/", serverController.getAllServers);

/**
 * @swagger
 * /servers/{id}:
 *   get:
 *     summary: Obtiene un servidor por ID
 *     tags: [Servers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del servidor a obtener
 *     responses:
 *       200:
 *         description: Servidor obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Server'
 *       400:
 *        description: ID inválido
 *       404:
 *         description: Servidor no encontrado
 */
router.get("/:id", serverController.getServerById);

/**
 * @swagger
 * /servers:
 *   post:
 *     summary: Crea un nuevo servidor
 *     tags: [Servers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Server'
 *     responses:
 *       201:
 *         description: Servidor creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Server'
 *       400:
 *         description: Error en la solicitud
 *       409:
 *         description: Ya existe un servidor con ese endpoint
 */
router.post("/", serverController.createServer);

/**
 * @swagger
 * /servers/{id}:
 *   put:
 *     summary: Actualiza un servidor existente
 *     tags: [Servers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del servidor a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Server'
 *     responses:
 *       200:
 *         description: Servidor actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Server'
 *       400:
 *         description: Error en la solicitud
 *       404:
 *         description: Servidor no encontrado
 *       409:
 *         description: Ya existe un servidor con ese endpoint
 */
router.put("/:id", serverController.updateServer);

/**
 * @swagger
 * /servers/{id}:
 *   delete:
 *     summary: Elimina un servidor
 *     tags: [Servers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del servidor a eliminar
 *     responses:
 *       200:
 *         description: Servidor eliminado exitosamente
 *       404:
 *         description: Servidor no encontrado
 */
router.delete("/:id", serverController.deleteServer);

module.exports = router;
