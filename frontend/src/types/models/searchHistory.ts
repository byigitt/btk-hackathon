import type { GoogleResult } from './googleResult';

export interface SearchHistory {
  query: string;
  response: string;
  googleResults?: GoogleResult[];
  timestamp: number;
} 