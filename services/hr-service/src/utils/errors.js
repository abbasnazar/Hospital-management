class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

const Unauthorized = (msg) => new AppError(msg, 401);
const Forbidden = (msg) => new AppError(msg, 403);
const NotFound = (msg) => new AppError(msg, 404);
const BadRequest = (msg) => new AppError(msg, 400);

module.exports = { AppError, Unauthorized, Forbidden, NotFound, BadRequest };
