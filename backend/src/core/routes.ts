import { Application } from 'express';
import { okResponse } from '../utils/response';

export const setupRoutes = (app: Application) => {
    app.get('/', (req, res) => {
        res.json(okResponse('mayis backend is running'));
    });

    app.get('/health', (req, res) => {
        res.json(okResponse('OK'));
    });

    // Add more routes as needed
};
