const express = require("express");
const { Message } = require("..");

const router = express.Router();

router.get("/", async (req, res) => {
  const messages = await Message.findAll({
    where: { serial: req.query.serial },
  });
  res.json(messages);
});

router.post("/", async (req, res) => {
  const message = await Message.create(req.body);
  res.status(201).json(message);
});

module.exports = router;
