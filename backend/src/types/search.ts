import { WebSocket } from 'ws';

export interface UserProfile {
    browser: string;
    os: string;
    location: string;
    preferences?: {
        [key: string]: string;
    };
}

export interface GoogleSearchResult {
    type: 'organic' | 'video' | 'image' | 'news' | 'featured_snippet';
    title: string;
    description: string;
    url: string;
    is_sponsored: boolean;
    thumbnail?: string;
    favicon?: string;
    videoInfo?: {
        platform: string;
        thumbnail: string;
        duration: string;
    };
    imageInfo?: {
        src: string;
        alt: string;
        width: string;
        height: string;
    };
    additionalInfo?: {
        date?: string;
        type?: string;
        details?: string;
    };
}

export interface SearchResponse {
    type: 'partial' | 'complete';
    aiResponse: string;
    googleResults?: GoogleSearchResult[];
}

export interface CombinedSearchResult {
    aiResponse: string;
    googleResults: GoogleSearchResult[];
}

export interface SearchWebSocket extends WebSocket {
    id: string;
} 