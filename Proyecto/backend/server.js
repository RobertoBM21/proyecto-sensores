const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// Middleware para usar IDs personalizados
server.use((req, res, next) => {
  const collectionsWithCustomID = {
    servers: "serverId",
    devices: "serial",
    users: "name",
  };

  const collection = req.url.split("/")[1];

  if (
    collectionsWithCustomID[collection] &&
    (req.method === "POST" || req.method === "PUT" || req.method === "PATCH")
  ) {
    req.body.id = req.body[collectionsWithCustomID[collection]];
  }

  next();
});

server.use(middlewares);
server.use(router);

server.listen(3000, () => {
  console.log("JSON Server is running");
});
