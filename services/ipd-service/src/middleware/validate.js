'use strict';

const { BadRequest } = require('../utils/errors');

module.exports = (schema, source = 'body') => (req, _res, next) => {
  const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true, convert: true });
  if (error) return next(BadRequest('validation failed', error.details.map((d) => d.message)));
  req[source] = value;
  next();
};
