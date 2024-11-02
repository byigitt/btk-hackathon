import type { GoogleResult } from './googleResult';

export interface WebSocketMessage {
  event: string;
  data: string | Record<string, unknown>;
}

export interface WebSocketResponse {
  success: boolean;
  message: string;
  data: {
    event: string;
    data: {
      type: string;
      aiResponse: string;
      googleResults?: GoogleResult[];
    };
  };
  timestamp: string;
}

export type WebSocketCallback = (data: WebSocketResponse) => void; 