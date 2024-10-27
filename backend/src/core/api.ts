import express from 'express';
import cors from 'cors';
import { setGlobalDispatcher, ProxyAgent } from 'undici';
import { Server } from 'socket.io';
import * as http from 'node:http';
import { env } from '../config';
import { setupRoutes } from './routes';
import { setupSocketHandlers } from './socket';
import { apiLimiter } from '../middleware/rateLimiter';
import { authMiddleware } from '../middleware/auth';
import { globalErrorHandler } from '../utils/errorHandler';
import logger from '../utils/logger';
import { swaggerServe, swaggerSetup } from '../utils/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import Tokens from 'csrf';  // Changed this line

export const setupAPI = (): { app: express.Express; server: http.Server; io: Server } => {
    const app = express();
    const server = http.createServer(app);
    const io = new Server(server);

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
            if (!csrfToken || !tokens.verify(env.csrfSecret, csrfToken)) {
                return res.status(403).json({ error: 'Invalid CSRF token' });
            }
        }
        next();
    });

    // Generate CSRF token route
    app.get('/csrf-token', (req, res) => {
        const token = tokens.create(env.csrfSecret);
        res.json({ csrfToken: token });
    });

    // Swagger documentation
    app.use('/api-docs', swaggerServe, swaggerSetup);

    // Proxy configuration (if needed)
    if (env.externalProxy) {
        setGlobalDispatcher(new ProxyAgent(env.externalProxy));
    }

    // Setup routes and socket handlers
    setupRoutes(app);
    setupSocketHandlers(io);

    // Global error handler
    app.use(globalErrorHandler);

    // Log server start
    server.listen(env.apiPort, () => {
        logger.info(`Server is running on port ${env.apiPort}`);
    });

    return { app, server, io };
};
