const express = require("express");
const router = express.Router();
const serverController = require("../controllers/serverController");

router.get("/", serverController.getAllServers);
router.get("/:id", serverController.getServerById);
router.post("/", serverController.createServer);
router.put("/:id", serverController.updateServer);
router.delete("/:id", serverController.deleteServer);

module.exports = router;
