import { Application } from 'express';
import { okResponse } from '../utils/response';
import { getSearchHistory, clearSearchHistory } from '../services/searchHistory';
import path from 'node:path';

export const setupRoutes = (app: Application) => {
    app.get('/', (req, res) => {
        res.json(okResponse('mayis backend is running'));
    });

    app.get('/health', (req, res) => {
        res.json(okResponse('OK'));
    });

    app.get('/echo', (req, res) => {
        res.sendFile(path.join(__dirname, '../../echo.html'));
    });

    app.get('/api/history/:userId', async (req, res) => {
        try {
            const history = await getSearchHistory(req.params.userId);
            res.json(okResponse('Chat history retrieved', history));
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve chat history' });
        }
    });

    app.delete('/api/history/:userId', async (req, res) => {
        try {
            await clearSearchHistory(req.params.userId);
            res.json(okResponse('Chat history cleared'));
        } catch (error) {
            res.status(500).json({ error: 'Failed to clear chat history' });
        }
    });
};
