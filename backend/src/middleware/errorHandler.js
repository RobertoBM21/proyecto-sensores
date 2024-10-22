const errorHandler = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.message = error.message || "Error interno del servidor";
  res.status(error.statusCode).json({ error: error.message });
};

module.exports = errorHandler;
