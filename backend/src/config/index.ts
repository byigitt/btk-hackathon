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

const version = getVersion();

export const env = {
    apiURL: process.env.API_URL || '',
    apiPort: process.env.PORT || 3000,
    corsWildcard: process.env.CORS_WILDCARD !== '0',
    corsURL: process.env.CORS_URL,
    rateLimitWindow: (process.env.RATELIMIT_WINDOW && Number.parseInt(process.env.RATELIMIT_WINDOW)) || 60,
    rateLimitMax: (process.env.RATELIMIT_MAX && Number.parseInt(process.env.RATELIMIT_MAX)) || 20,
    googleFlashAPIKey: process.env.GOOGLE_FLASH_API_KEY,
    googleFlashAPIURL: process.env.GOOGLE_FLASH_API_URL || 'https://flashsearch.googleapis.com/v1.5/search',
    externalProxy: process.env.API_EXTERNAL_PROXY,
    csrfSecret: process.env.CSRF_SECRET || 'your-csrf-secret-here',
};

export const genericUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";
export const mayisUserAgent = `Mayis/${version} (+https://github.com/byigitt/btk-hackathon)`;
