type RuntimeMode = 'development' | 'test' | 'production';
type CorsOrigin = string | RegExp;

type EnvValidationResult = {
    nodeEnv: RuntimeMode;
    port: number;
    corsOrigins: CorsOrigin[];
};

function parseNodeEnv(input: string | undefined): RuntimeMode {
    if (input === 'development' || input === 'test' || input === 'production') {
        return input;
    }

    return 'development';
}

function requireEnv(key: string): string {
    const value = process.env[key]?.trim();
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

function parsePort(value: string | undefined): number {
    const fallback = 3001;
    if (!value) return fallback;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
        throw new Error('PORT must be a valid TCP port between 1 and 65535');
    }
    return parsed;
}

function wildcardToRegex(originPattern: string): RegExp {
    const escaped = originPattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');

    return new RegExp(`^${escaped}$`);
}

function parseCorsOrigins(value: string | undefined): CorsOrigin[] {
    if (!value || !value.trim()) {
        return [
            'http://localhost:3000',
            'https://pfe-maintenace-industrielle.vercel.app',
            /^https:\/\/pfe-maintenace-industrielle-[a-z0-9-]+\.vercel\.app$/,
        ];
    }

    return value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
        .map((origin) => (origin.includes('*') ? wildcardToRegex(origin) : origin));
}

export function validateEnvironment(): EnvValidationResult {
    const nodeEnv = parseNodeEnv(process.env.NODE_ENV);
    process.env.NODE_ENV = nodeEnv;

    if (nodeEnv !== 'test') {
        requireEnv('MONGODB_URI');
        requireEnv('JWT_SECRET');

        const jwtExpires = process.env.JWT_EXPIRES_IN ?? process.env.JWT_ACCESS_EXPIRES_IN;
        if (!jwtExpires?.trim()) {
            throw new Error('Missing required environment variable: JWT_EXPIRES_IN (or JWT_ACCESS_EXPIRES_IN)');
        }

        requireEnv('JWT_REFRESH_SECRET');
        const refreshExpires = process.env.JWT_REFRESH_EXPIRES_IN;
        if (!refreshExpires?.trim()) {
            throw new Error('Missing required environment variable: JWT_REFRESH_EXPIRES_IN');
        }
    }

    const port = parsePort(process.env.PORT);
    const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGINS);

    return {
        nodeEnv,
        port,
        corsOrigins,
    };
}
