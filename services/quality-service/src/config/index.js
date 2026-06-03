module.exports = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3307', 10),
    name: process.env.DB_NAME || 'hmis',
    user: process.env.DB_USER || 'hmis',
    pass: process.env.DB_PASS || 'hmis',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    issuer: process.env.JWT_ISSUER || 'hmis-auth',
  },
};
