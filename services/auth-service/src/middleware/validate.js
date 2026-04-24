'use strict';

const { BadRequest } = require('../utils/errors');

const validate = (schema) => (req, _res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return next(BadRequest('validation failed', error.details.map((d) => d.message)));
  }
  req.body = value;
  next();
};

module.exports = validate;
