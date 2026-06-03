'use strict';

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const err = new Error(error.details.map(d => d.message).join('; '));
    err.status = 400;
    return next(err);
  }
  req.validatedBody = value;
  next();
};

module.exports = validate;
