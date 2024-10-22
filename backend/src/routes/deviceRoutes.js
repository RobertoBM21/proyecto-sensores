const express = require("express");
const router = express.Router();
const deviceController = require("../controllers/deviceController");

router.get("/", deviceController.getAllDevices);
router.get("/serial/", deviceController.invalidSerial); //! Ruta para tratar el serial vacío
router.get("/serial/:serial", deviceController.getDeviceBySerial); // La ruta con serial se coloca antes de la ruta con id para evitar conflictos
router.get("/:id", deviceController.getDeviceById);
router.post("/", deviceController.createDevice);
router.put("/:id", deviceController.updateDevice);
router.patch("/:id", deviceController.updateDevicePartial);
router.delete("/:id", deviceController.deleteDevice);

module.exports = router;
