import mongoose from 'mongoose';
import { env } from '../config';
import crypto from 'crypto';

// Add encryption helpers
const ENCRYPTION_KEY = crypto.scryptSync(env.dbSecret || '', 'salt', 32);
const IV_LENGTH = 16;

export const encrypt = (text: string): string => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${encrypted.toString('hex')}:${tag.toString('hex')}`;
};

export const decrypt = (text: string): string => {
    const [ivHex, encryptedHex, tagHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    decipher.setAuthTag(tag);
    return decipher.update(encrypted) + decipher.final('utf8');
};

export const initializeDatabase = async () => {
    try {
        await mongoose.connect(env.mongoUri);
        console.log("MongoDB connected successfully");
        // Set up indexes
        if (mongoose.connection.db) {
            await mongoose.connection.db.collection('chathistories').createIndex(
                { createdAt: 1 },
                { expireAfterSeconds: 7 * 24 * 60 * 60 } // 7 days TTL index
            );
        }

        // Monitor connection
        mongoose.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
        });

    } catch (error) {
        console.error("Error initializing MongoDB:", error);
        throw error;
    }
}; 