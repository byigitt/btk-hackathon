import { io, type Socket } from 'socket.io-client';
import readline from 'node:readline';

declare const process: {
  env: {
    [key: string]: string | undefined
  },
  stdin: NodeJS.ReadableStream,
  stdout: NodeJS.WritableStream,
  exit: (code?: number) => never
};

const socket: Socket = io('http://localhost:3000');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

socket.on('connect', () => {
  console.log('Connected to server');
  promptUser();
});

socket.on('searchPartialResult', (result: SearchResult) => {
  console.log('Partial result:', result);
});

socket.on('searchComplete', () => {
  console.log('Search completed');
  promptUser();
});

socket.on('error', (error: string) => {
  console.error('Error:', error);
  promptUser();
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

function promptUser() {
  rl.question('Enter a search query (or type "exit" to quit): ', (query: string) => {
    if (query.toLowerCase() === 'exit') {
      rl.close();
      socket.disconnect();
      return;
    }
    
    console.log('Searching for:', query);
    socket.emit('search', query);
  });
}

rl.on('close', () => {
  console.log('Exiting client');
  process.exit(0);
});

type SearchResult = {
  success: boolean;
  message: string;
  data: unknown; // or define a more specific type if possible
  timestamp: string;
};
