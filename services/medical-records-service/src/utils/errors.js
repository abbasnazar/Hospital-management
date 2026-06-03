'use strict';

module.exports = {
  NotFound: (msg) => {
    const err = new Error(msg);
    err.status = 404;
    return err;
  },
  BadRequest: (msg) => {
    const err = new Error(msg);
    err.status = 400;
    return err;
  },
  Unauthorized: (msg) => {
    const err = new Error(msg);
    err.status = 401;
    return err;
  },
  Forbidden: (msg) => {
    const err = new Error(msg);
    err.status = 403;
    return err;
  },
};
