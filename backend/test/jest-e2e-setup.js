/**
 * Global setup for e2e tests.
 * Supplies stub values for required env vars so AppModule can boot without real secrets.
 */
module.exports = async function () {
  process.env.NODE_ENV = process.env.NODE_ENV || 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'e2e-test-jwt-secret';
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'e2e-test-refresh-secret';
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/GMAO_IPROTEX_TEST';
  process.env.PORT = process.env.PORT || '3001';
  process.env.CORS_ORIGINS = process.env.CORS_ORIGINS || 'http://localhost:3000';
};
