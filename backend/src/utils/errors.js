const createErrorFactory = (name, statusCode) => {
  return class CustomError extends Error {
    constructor(message) {
      super(message);
      this.name = name;
      this.statusCode = statusCode;
    }
  };
};

const NotFoundError = createErrorFactory("NotFoundError", 404);
const BadRequestError = createErrorFactory("BadRequestError", 400);
const ConflictError = createErrorFactory("ConflictError", 409);

module.exports = {
  NotFoundError,
  BadRequestError,
  ConflictError,
};
