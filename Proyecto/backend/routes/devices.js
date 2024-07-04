const express = require("express");
const { Device } = require("..");

const router = express.Router();

router.get("/", async (req, res) => {
  const devices = await Device.findAll();
  res.json(devices);
});

router.post("/", async (req, res) => {
  const device = await Device.create(req.body);
  res.status(201).json(device);
});

router.patch("/:serial", async (req, res) => {
  const device = await Device.findByPk(req.params.serial);
  await device.update(req.body);
  res.json(device);
});

module.exports = router;
