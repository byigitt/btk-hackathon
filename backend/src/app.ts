import "reflect-metadata";
import { setupAPI } from './core/api';
import { env } from './config';

const startServer = async () => {
    const { server } = await setupAPI();
    return server;
};

startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});