import { Server, Socket } from 'socket.io';
import { handleSearch } from '../processing/search';

export const setupSocketHandlers = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('new client connected');

        socket.on('search', handleSearch(socket));

        socket.on('disconnect', () => {
            console.log('client disconnected');
        });
    });
};
