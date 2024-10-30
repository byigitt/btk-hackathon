import express from 'express';
import cors from 'cors';
import { setGlobalDispatcher, ProxyAgent } from 'undici';
import * as http from 'node:http';
import { WebSocketServer } from 'ws';
import { env } from '../config';
import { setupRoutes } from './routes';
import { setupWebSocketHandlers } from './socket';
import { apiLimiter } from '../middleware/rateLimiter';
import { authMiddleware } from '../middleware/auth';
import { globalErrorHandler } from '../utils/errorHandler';
import logger from '../utils/logger';
import { swaggerServe, swaggerSetup } from '../utils/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import Tokens from 'csrf';
import { initializeDatabase } from '../services/database';

interface APISetupResult {
    app: express.Express;
    server: http.Server;
}

export const setupAPI = async (): Promise<APISetupResult> => {
    // Initialize database first
    await initializeDatabase();

    const app = express();
    const server = http.createServer(app);
    
    // Setup WebSocket Server
    const wss = new WebSocketServer({ noServer: true });

    // Handle upgrade requests
    server.on('upgrade', (request, socket, head) => {
        const pathname = new URL(request.url ?? '', 'http://localhost').pathname;

        if (pathname === '/ws') {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        } else {
            socket.destroy();
        }
    });

    // CSRF setup
    const tokens = new Tokens();

    // CORS configuration
    const corsConfig = {
        origin: env.corsWildcard ? '*' : env.corsURL,
        optionsSuccessStatus: 200
    };

    // Apply middlewares
    app.use(cors(corsConfig));
    app.use(apiLimiter);
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));
    app.use(cookieParser());
    app.use(authMiddleware);
    app.use(helmet());

    // CSRF protection middleware
    app.use((req, res, next) => {
        if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
            const csrfToken = req.headers['x-csrf-token'] as string;
            if (!csrfToken || !tokens.verify(env.csrfSecret ?? '', csrfToken)) {
                return res.status(403).json({ error: 'Invalid CSRF token' });
            }
        }
        next();
    });

    // Generate CSRF token route
    app.get('/csrf-token', (req, res) => {
        const token = tokens.create(env.csrfSecret ?? '');
        res.json({ csrfToken: token });
    });

    // Swagger documentation
    app.use('/api-docs', swaggerServe, swaggerSetup);

    // Proxy configuration (if needed)
    if (env.externalProxy) {
        setGlobalDispatcher(new ProxyAgent(env.externalProxy));
    }

    // Setup routes and WebSocket handlers
    setupRoutes(app);
    setupWebSocketHandlers(wss);

    // Global error handler
    app.use(globalErrorHandler);

    // Log server start
    await new Promise<void>((resolve) => {
        server.listen(env.apiPort, () => {
            logger.info(`Server is running on port ${env.apiPort}`);
            resolve();
        });
    });

    return { app, server };
};
