import rateLimit from 'express-rate-limit';
import { env } from '../config';

export const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindow * 1000,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.'
});
