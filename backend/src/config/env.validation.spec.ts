import { validateEnvironment } from './env.validation';

describe('validateEnvironment', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('accepts valid production configuration', () => {
    process.env.NODE_ENV = 'production';
    process.env.PORT = '3001';
    process.env.CORS_ORIGINS = 'http://localhost:3000,https://app.example.com';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/gmao';
    process.env.JWT_SECRET = 'a'.repeat(32);
    process.env.JWT_REFRESH_SECRET = 'b'.repeat(32);
    process.env.JWT_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';

    const env = validateEnvironment();

    expect(env.nodeEnv).toBe('production');
    expect(env.port).toBe(3001);
    expect(env.corsOrigins).toEqual([
      'http://localhost:3000',
      'https://app.example.com',
    ]);
  });

  it('throws on missing required production variables', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.MONGODB_URI;

    expect(() => validateEnvironment()).toThrow(
      'Missing required environment variable: MONGODB_URI',
    );
  });

  it('does not require strict env variables during tests', () => {
    process.env.NODE_ENV = 'test';
    delete process.env.MONGODB_URI;
    delete process.env.JWT_SECRET;

    const env = validateEnvironment();

    expect(env.nodeEnv).toBe('test');
    expect(env.port).toBe(3001);
  });
});
