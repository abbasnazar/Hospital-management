'use strict';

class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status  = status;
    this.code    = code;
    this.details = details;
  }
}

const BadRequest   = (msg, details) => new HttpError(400, 'BAD_REQUEST',   msg, details);
const Unauthorized = (msg)          => new HttpError(401, 'UNAUTHORIZED',  msg);
const Forbidden    = (msg)          => new HttpError(403, 'FORBIDDEN',     msg);
const NotFound     = (msg)          => new HttpError(404, 'NOT_FOUND',     msg);
const Conflict     = (msg)          => new HttpError(409, 'CONFLICT',      msg);
const Locked       = (msg)          => new HttpError(423, 'LOCKED',        msg);

module.exports = { HttpError, BadRequest, Unauthorized, Forbidden, NotFound, Conflict, Locked };
