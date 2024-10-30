import { Schema, model, Document } from 'mongoose';

export interface IChatHistory extends Document {
    userId: string;  // IPv4 address
    query: string;
    response: string;
    browser: string;
    os: string;
    location: string;
    createdAt: Date;
}

const ChatHistorySchema = new Schema<IChatHistory>({
    userId: { 
        type: String, 
        required: true,
        index: true 
    },
    query: { 
        type: String, 
        required: true 
    },
    response: { 
        type: String, 
        required: true 
    },
    browser: { 
        type: String, 
        required: true 
    },
    os: { 
        type: String, 
        required: true 
    },
    location: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        expires: 7 * 24 * 60 * 60 // Automatically delete documents after 7 days
    }
});

export const ChatHistory = model<IChatHistory>('ChatHistory', ChatHistorySchema); 