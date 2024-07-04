const express = require("express");
const { Server } = require("..");

const router = express.Router();

router.get("/", async (req, res) => {
  const servers = await Server.findAll();
  res.json(servers);
});

router.post("/", async (req, res) => {
  const server = await Server.create(req.body);
  res.status(201).json(server);
});

module.exports = router;
