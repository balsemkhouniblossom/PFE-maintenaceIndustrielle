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
    process.env.EMAIL_VERIFICATION_SECRET = 'c'.repeat(32);
    process.env.JWT_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
    process.env.API_URL = 'https://api.example.com';
    process.env.APP_URL = 'https://app.example.com';
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_USER = 'smtp-user';
    process.env.SMTP_PASS = 'smtp-pass';
    process.env.EMAIL_FROM = 'noreply@example.com';
    process.env.ENABLE_LEGACY_EMAIL_TOKENS = 'true';
    process.env.ENABLE_EVENT_BASED_EMAILS = 'false';

    const env = validateEnvironment();

    expect(env.nodeEnv).toBe('production');
    expect(env.port).toBe(3001);
    expect(env.corsOrigins).toEqual([
      'http://localhost:3000',
      'https://app.example.com',
    ]);
    expect(env.enableLegacyEmailTokens).toBe(true);
    expect(env.enableEventBasedEmails).toBe(false);
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
