'use strict';

class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status; this.code = code; this.details = details;
  }
}
module.exports = {
  HttpError,
  BadRequest:   (m, d) => new HttpError(400, 'BAD_REQUEST', m, d),
  Unauthorized: (m)    => new HttpError(401, 'UNAUTHORIZED', m),
  Forbidden:    (m)    => new HttpError(403, 'FORBIDDEN', m),
  NotFound:     (m)    => new HttpError(404, 'NOT_FOUND', m),
  Conflict:     (m)    => new HttpError(409, 'CONFLICT', m),
};
