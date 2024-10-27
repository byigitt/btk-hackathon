import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('X-API-Key');
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json(errorResponse('Unauthorized'));
  }
  next();
};
