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

export interface GoogleResult {
  type: string;
  title: string;
  description: string;
  url: string;
  is_sponsored: boolean;
  favicon?: string;
  thumbnail?: string;
  videoInfo?: {
    platform: string;
    thumbnail: string;
    duration: string;
  };
}

export type WebSocketCallback = (data: WebSocketResponse) => void; 