const serverController = require("../controllers/serverController.js");
const { authMiddleware, ROLES } = require("../middleware/auth.js");
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
router.get("/", authMiddleware(), serverController.getAllServers);

/**
 * @swagger
 * /servers/stats:
 *   get:
 *     summary: Obtiene las estadísticas generales del sistema
 *     tags: [Servers]
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activeDevices:
 *                   type: integer
 *                   nullable: true
 *                   description: Número de dispositivos que han enviado datos en la última hora
 *                 recentMessages:
 *                   type: integer
 *                   nullable: true
 *                   description: Número de mensajes recibidos en las últimas 24 horas
 *                 weeklyStats:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     totalDevices:
 *                       type: integer
 *                       description: Total de dispositivos detectados en la última semana
 *                     totalItems:
 *                       type: integer
 *                       description: Total de mensajes recibidos en la última semana
 *                 errors:
 *                   type: object
 *                   properties:
 *                     activeDevices:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         name:
 *                           type: string
 *                           enum: [NotFoundError, Error]
 *                         message:
 *                           type: string
 *                     recentMessages:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         name:
 *                           type: string
 *                           enum: [NotFoundError, Error]
 *                         message:
 *                           type: string
 *                     weeklyStats:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         name:
 *                           type: string
 *                           enum: [NotFoundError, Error]
 *                         message:
 *                           type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/stats", serverController.getGeneralStats);

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
router.get("/:id", authMiddleware(), serverController.getServerById);

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
 *         description: Ya existe el usuario en el servidor
 */
router.post("/", authMiddleware(ROLES.ADMIN), serverController.createServer);

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
 *         description: Ya existe el usuario en el servidor
 */
router.put("/:id", authMiddleware(ROLES.ADMIN), serverController.updateServer);

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
router.delete(
  "/:id",
  authMiddleware(ROLES.ADMIN),
  serverController.deleteServer
);

module.exports = router;
