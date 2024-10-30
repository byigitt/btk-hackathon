import { WebSocketServer, WebSocket } from 'ws';
import { errorResponse, okResponse } from '../utils/response';
import { handleSearch } from '../processing/search';
import { addToSearchHistory, getSearchHistory, clearSearchHistory } from '../services/searchHistory';
import { IncomingMessage } from 'node:http';
import { parse as parseUrl } from 'node:url';
import { env } from '../config';

interface WebSocketMessage {
    event: string;
    data: unknown;
}

interface UserProfile {
    browser: string;
    os: string;
    location: string;
    preferences?: {
        [key: string]: string;
    };
}

interface WebSocketClient extends WebSocket {
    id: string;
    userProfile: UserProfile;
    isAlive: boolean;
    pingTimeout?: NodeJS.Timeout;
}

const getDefaultProfile = (): UserProfile => ({
    browser: 'Chrome',
    os: 'Unknown',
    location: 'Turkey',
    preferences: {}
});

const parseUserAgent = (userAgent: string): Partial<UserProfile> => {
    const profile: Partial<UserProfile> = {};
    
    // Basic browser detection
    if (userAgent.includes('Firefox')) profile.browser = 'Firefox';
    else if (userAgent.includes('Chrome')) profile.browser = 'Chrome';
    else if (userAgent.includes('Safari')) profile.browser = 'Safari';
    
    // Basic OS detection
    if (userAgent.includes('Windows')) profile.os = 'Windows';
    else if (userAgent.includes('Mac')) profile.os = 'MacOS';
    else if (userAgent.includes('Linux')) profile.os = 'Linux';
    
    return profile;
};

const simulateStreamResponse = (client: WebSocketClient, text: string) => {
    const currentText = '';
    const finalText = `${text}123`;
    
    // Create an array of progressive text chunks
    const chunks = finalText.split('').map((_, index) => 
        finalText.slice(0, index + 1)
    );

    // Send chunks with delays
    let chunkIndex = 0;
    const sendChunk = () => {
        if (chunkIndex < chunks.length) {
            const chunk = chunks[chunkIndex];
            client.send(JSON.stringify(
                okResponse('Partial echo response', {
                    event: 'echo_partial',
                    data: chunk
                })
            ));
            chunkIndex++;
            setTimeout(sendChunk, 100); // 100ms delay between chunks
        } else {
            // Send completion message
            client.send(JSON.stringify(
                okResponse('Echo completed', {
                    event: 'echo_complete',
                    data: finalText
                })
            ));
        }
    };

    // Start sending chunks
    sendChunk();
};

// Rate limiting configuration
const RATE_LIMITS = {
    SEARCH: { points: 10, duration: 60 * 1000 }, // 10 searches per minute
    HISTORY: { points: 30, duration: 60 * 1000 }, // 30 history requests per minute
};

class RateLimiter {
    private requests: Map<string, { count: number; resetTime: number }> = new Map();

    check(key: string, limit: { points: number; duration: number }): boolean {
        const now = Date.now();
        const record = this.requests.get(key);

        if (!record || now > record.resetTime) {
            this.requests.set(key, { count: 1, resetTime: now + limit.duration });
            return true;
        }

        if (record.count >= limit.points) {
            return false;
        }

        record.count++;
        return true;
    }
}

export const setupWebSocketHandlers = (wss: WebSocketServer) => {
    console.log('Setting up WebSocket handlers...');

    const rateLimiter = new RateLimiter();
    const clients = new Map<string, WebSocketClient>();

    // Cleanup inactive connections every 5 minutes
    const CLEANUP_INTERVAL = 5 * 60 * 1000;
    setInterval(() => {
        for (const ws of wss.clients) {
            const client = ws as WebSocketClient;
            if (!client.isAlive) {
                console.log(`Terminating inactive client: ${client.id}`);
                clients.delete(client.id);
                return client.terminate();
            }
            client.isAlive = false;
            client.ping();
        }
    }, CLEANUP_INTERVAL);

    wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
        const client = ws as WebSocketClient;
        
        // Initialize client
        client.isAlive = true;
        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || 
                   req.socket.remoteAddress || 
                   'unknown';
        client.id = ip;

        // Setup ping/pong
        client.on('pong', () => {
            client.isAlive = true;
        });

        // Parse user profile
        const urlParams = parseUrl(req.url || '', true).query;
        const userAgent = req.headers['user-agent'] || '';
        
        client.userProfile = {
            ...getDefaultProfile(),
            ...parseUserAgent(userAgent),
            ...((urlParams.profile && typeof urlParams.profile === 'string') 
                ? JSON.parse(decodeURIComponent(urlParams.profile))
                : {}),
            location: (urlParams.location as string) || 'Turkey'
        };

        clients.set(client.id, client);
        console.log('WebSocket client connected, IP:', client.id);

        client.on('message', async (data: Buffer) => {
            try {
                const message = JSON.parse(data.toString()) as WebSocketMessage;

                if (!message.event || message.data === undefined) {
                    client.send(JSON.stringify(
                        errorResponse('Invalid message format')
                    ));
                    return;
                }

                // Apply rate limiting based on event type
                const rateLimitKey = `${client.id}:${message.event}`;
                const limit = RATE_LIMITS[message.event as keyof typeof RATE_LIMITS];
                
                if (limit && !rateLimiter.check(rateLimitKey, limit)) {
                    client.send(JSON.stringify(
                        errorResponse('Rate limit exceeded')
                    ));
                    return;
                }

                // Handle different event types
                switch (message.event) {
                    case 'search': {
                        if (typeof message.data === 'string') {
                            await handleSearch(client, message.data, client.userProfile);
                        } else {
                            client.send(JSON.stringify(
                                errorResponse('Search query must be a string')
                            ));
                        }
                        break;
                    }

                    case 'getSearchHistory': {
                        const history = await getSearchHistory(client.id);
                        client.send(JSON.stringify(
                            okResponse('Search history', {
                                event: 'searchHistory',
                                data: history
                            })
                        ));
                        break;
                    }

                    case 'clearSearchHistory': {
                        await clearSearchHistory(client.id);
                        client.send(JSON.stringify(
                            okResponse('Search history cleared')
                        ));
                        break;
                    }

                    default: {
                        client.send(JSON.stringify(
                            errorResponse(`Unknown event: ${message.event}`)
                        ));
                    }
                }
            } catch (error) {
                client.send(JSON.stringify(
                    errorResponse('Invalid message format')
                ));
            }
        });

        client.on('close', () => {
            clients.delete(client.id);
            clearSearchHistory(client.id);
        });

        // Send welcome message
        client.send(JSON.stringify(
            okResponse('Connected to WebSocket server')
        ));
    });
};
