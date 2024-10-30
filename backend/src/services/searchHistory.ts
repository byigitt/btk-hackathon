import { encrypt, decrypt } from "./database";
import { ChatHistory, IChatHistory } from "../entities/ChatHistory";
import { UserProfile } from "../types/userProfile";
import { Document } from 'mongoose';

type LeanDocument = {
    _id: Document['_id'];
    userId: string;
    query: string;
    response: string;
    browser: string;
    os: string;
    location: string;
    createdAt: Date;
};

export const addToSearchHistory = async (
    userId: string,
    query: string,
    response: string,
    profile: UserProfile
) => {
    try {
        const chatHistory = new ChatHistory({
            userId: userId, // IPv4 address
            query: encrypt(query),
            response: encrypt(response),
            browser: encrypt(profile.browser),
            os: encrypt(profile.os),
            location: encrypt(profile.location)
        });

        await chatHistory.save();
    } catch (error) {
        console.error('Error adding to search history:', error);
        throw new Error('Failed to save search history');
    }
};

export const getSearchHistory = async (userId: string): Promise<IChatHistory[]> => {
    try {
        const histories = await ChatHistory.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean<LeanDocument[]>();
            
        // Decrypt the data before returning
        return histories.map(history => ({
            _id: history._id,
            userId: history.userId,
            query: decrypt(history.query),
            response: decrypt(history.response),
            browser: decrypt(history.browser),
            os: decrypt(history.os),
            location: decrypt(history.location),
            createdAt: history.createdAt
        })) as IChatHistory[];
    } catch (error) {
        console.error('Error getting search history:', error);
        return [];
    }
};

export const clearSearchHistory = async (userId: string): Promise<void> => {
    try {
        await ChatHistory.deleteMany({ userId });
    } catch (error) {
        console.error('Error clearing search history:', error);
        throw new Error('Failed to clear search history');
    }
};
