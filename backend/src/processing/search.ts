import { Socket } from 'socket.io';
import axios from 'axios';
import { env } from '../config';
import { okResponse, errorResponse } from '../utils/response';

export const handleSearch = (socket: Socket) => async (query: string) => {
    if (typeof query !== 'string') {
        return socket.emit('error', errorResponse('Invalid query format'));
    }

    try {
        const response = await axios.post(env.googleFlashAPIURL, 
            { query },
            {
                headers: {
                    'Authorization': `Bearer ${env.googleFlashAPIKey}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'stream'
            }
        );

        response.data.on('data', (chunk: Buffer) => {
            try {
                const parsedChunk = JSON.parse(chunk.toString());
                socket.emit('searchPartialResult', okResponse('Partial result received', parsedChunk));
            } catch (parseError) {
                console.error('Error parsing chunk:', parseError);
                socket.emit('error', errorResponse('Error parsing search result'));
            }
        });

        response.data.on('end', () => {
            socket.emit('searchComplete', okResponse('Search completed'));
        });

    } catch (error) {
        console.error('Search error:', error);
        if (axios.isAxiosError(error) && error.response) {
            socket.emit('error', errorResponse(`Search failed: ${error.response.data}`));
        } else if (axios.isAxiosError(error) && error.request) {
            socket.emit('error', errorResponse('Search failed: No response from server'));
        } else {
            socket.emit('error', errorResponse('An error occurred during the search'));
        }
    }
};
