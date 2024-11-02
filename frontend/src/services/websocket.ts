import type { WebSocketCallback, WebSocketMessage, WebSocketResponse } from '../types/websocket';

class WebSocketService {
  private ws: WebSocket | null = null;
  private messageCallback: WebSocketCallback | null = null;

  connect(onMessage: WebSocketCallback) {
    this.messageCallback = onMessage;
    this.ws = new WebSocket(`ws://localhost:8000/ws?profile={"preferences":{"theme":"dark"}}&location=Ankara`);
    
    this.ws.onopen = () => {
      console.log('🟢 WebSocket Connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data) as WebSocketResponse;
        if (this.messageCallback) {
          this.messageCallback(response);
        }
      } catch (error) {
        console.error('❌ Error processing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket Error:', error);
    };

    this.ws.onclose = () => {
      console.log('🔴 WebSocket Disconnected');
    };
  }

  disconnect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
  }

  send(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}

export const wsService = new WebSocketService();