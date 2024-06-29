const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const queryString = require("query-string");

server.use(middlewares);

// Middleware para manejar consultas de fechas
server.use((req, res, next) => {
  const query = queryString.parse(req._parsedUrl.query);

  // Verificar si los parámetros de fecha están presentes en la consulta
  if (query.lastCommunication_gte || query.lastCommunication_lte) {
    const lastCommunication_gte = query.lastCommunication_gte
      ? new Date(query.lastCommunication_gte)
      : null;
    const lastCommunication_lte = query.lastCommunication_lte
      ? new Date(query.lastCommunication_lte)
      : null;

    // Filtrar los dispositivos basados en la comparación de fechas
    const filteredDevices = router.db
      .get("devices")
      .filter((device) => {
        const lastCommunication = new Date(device.lastCommunication);
        return (
          (!lastCommunication_gte ||
            lastCommunication >= lastCommunication_gte) &&
          (!lastCommunication_lte || lastCommunication <= lastCommunication_lte)
        );
      })
      .value();

    // Responder con los dispositivos filtrados
    res.json(filteredDevices);
  } else {
    next(); // Pasar al siguiente middleware si no hay parámetros de fecha
  }
});

server.use(router);

server.listen(3000, () => {
  console.log("JSON Server is running");
});
