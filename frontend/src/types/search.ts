import type { GoogleResult } from './websocket';

export interface SearchHistory {
  query: string;
  response: string;
  googleResults?: GoogleResult[];
  timestamp: number;
} 