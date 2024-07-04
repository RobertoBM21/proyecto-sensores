const express = require("express");
const bodyParser = require("body-parser");
const serverRoutes = require("./routes/servers");
const deviceRoutes = require("./routes/devices");
const messageRoutes = require("./routes/messages");
const { sequelize } = require("./index");

const app = express();

app.use(bodyParser.json());
app.use("/servers", serverRoutes);
app.use("/devices", deviceRoutes);
app.use("/messages", messageRoutes);

const PORT = 3000;

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
