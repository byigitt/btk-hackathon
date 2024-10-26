import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import axios from 'axios';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('AIsearch backend is running');
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('search', async (query) => {
    try {
      // TODO: Implement Google Flash API 1.5 search here
      // For now, we'll just echo the query
      socket.emit('searchResult', `Received query: ${query}`);
    } catch (error) {
      socket.emit('error', 'An error occurred during the search');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
