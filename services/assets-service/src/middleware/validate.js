module.exports = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false });
    if (error) return res.status(400).json({ errors: error.details.map(e => e.message) });
    Object.assign(req[source], value);
    next();
  };
};
