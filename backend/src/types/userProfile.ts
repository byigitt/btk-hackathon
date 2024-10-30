export interface UserProfile {
    browser: string;
    os: string;
    location: string;
    preferences?: {
        [key: string]: string;
    };
} 