import { ErrorRequestHandler } from 'express';
import { errorResponse } from './response';

export const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(errorResponse('Internal Server Error'));
};

export class APIError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}
