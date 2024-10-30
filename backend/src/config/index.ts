import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();

function getVersion(): string {
    try {
        const packageJsonPath = path.resolve(__dirname, '../../package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return packageJson.version || '0.0.0';
    } catch (error) {
        console.error('Error reading package.json:', error);
        return '0.0.0';
    }
}

// Validate and sanitize origins
function validateOrigins(origins: string): string[] {
    const sanitizedOrigins = origins
        .split(',')
        .map(origin => origin.trim())
        .filter(origin => {
            try {
                // Validate URL format
                new URL(origin);
                // Only allow http/https protocols
                return origin.startsWith('http://') || origin.startsWith('https://');
            } catch {
                console.warn(`Invalid origin ignored: ${origin}`);
                return false;
            }
        });

    if (sanitizedOrigins.length === 0) {
        console.warn('No valid origins found, falling back to default');
        return ['http://localhost:3000'];
    }

    return sanitizedOrigins;
}

const version = getVersion();
const isProd = process.env.NODE_ENV === 'production';

// Security settings based on environment
const securitySettings = {
    development: {
        rateLimitWindow: 60,
        rateLimitMax: 100,
        corsWildcard: true,
        allowedOrigins: ['http://localhost:3000'],
        requireHTTPS: false,
        strictOriginCheck: false
    },
    production: {
        rateLimitWindow: 15,
        rateLimitMax: 20,
        corsWildcard: false,
        allowedOrigins: validateOrigins(process.env.ALLOWED_ORIGINS || ''),
        requireHTTPS: true,
        strictOriginCheck: true
    }
};

const envSettings = isProd ? securitySettings.production : securitySettings.development;

export const env = {
    apiPort: process.env.PORT || 3000,
    corsWildcard: process.env.CORS_WILDCARD === 'true' && !isProd, // Force false in production
    corsURL: process.env.CORS_URL,
    rateLimitWindow: (process.env.RATELIMIT_WINDOW && Number.parseInt(process.env.RATELIMIT_WINDOW)) || envSettings.rateLimitWindow,
    rateLimitMax: (process.env.RATELIMIT_MAX && Number.parseInt(process.env.RATELIMIT_MAX)) || envSettings.rateLimitMax,
    externalProxy: process.env.API_EXTERNAL_PROXY,
    csrfSecret: process.env.CSRF_SECRET || (isProd ? undefined : 'your-csrf-secret-here'), // Force undefined in prod if not set
    geminiAPIKey: process.env.GEMINI_API_KEY || '',
    dbSecret: process.env.DB_SECRET || (isProd ? undefined : 'your-secure-key-here'), // Force undefined in prod if not set
    allowedOrigins: envSettings.allowedOrigins,
    isProd,
    
    // Additional security settings
    requireHTTPS: envSettings.requireHTTPS,
    strictOriginCheck: envSettings.strictOriginCheck,
    
    // Helper methods for security checks
    isOriginAllowed: (origin: string | undefined): boolean => {
        if (!origin) return false;
        if (!envSettings.strictOriginCheck) return true;
        return envSettings.allowedOrigins.includes(origin);
    },
    
    validateSecuritySettings: (): void => {
        if (isProd) {
            // Required environment variables in production
            const requiredEnvVars = ['CSRF_SECRET', 'DB_SECRET', 'GEMINI_API_KEY', 'ALLOWED_ORIGINS'];
            const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
            
            if (missingVars.length > 0) {
                throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
            }

            // Validate CORS settings
            if (process.env.CORS_WILDCARD === 'true') {
                throw new Error('CORS wildcard is not allowed in production');
            }

            // Validate origins
            if (envSettings.allowedOrigins.length === 0) {
                throw new Error('No valid origins configured for production');
            }

            // Validate rate limits
            if (env.rateLimitMax > 50) {
                throw new Error('Rate limit maximum is too high for production');
            }
        }
    },
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/aisearch',
};

// Validate security settings on startup
env.validateSecuritySettings();

export const genericUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";
export const mayisUserAgent = `Mayis/${version} (+https://github.com/byigitt/btk-hackathon)`;
