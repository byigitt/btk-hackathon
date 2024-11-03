import type { WebSocketMessage, WebSocketResponse } from '../types/websocket';

class WebSocketService {
  private ws: WebSocket | null = null;
  private messageHandler: ((data: WebSocketResponse) => void) | null = null;
  private onOpenHandler: (() => void) | null = null;
  private onCloseHandler: (() => void) | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;

  connect(
    messageHandler: (data: WebSocketResponse) => void,
    onOpen?: () => void,
    onClose?: () => void
  ) {
    // Prevent multiple connection attempts
    if (this.isConnecting || (this.ws?.readyState === WebSocket.CONNECTING || this.ws?.readyState === WebSocket.OPEN)) {
      console.log('WebSocket connection already exists or is connecting');
      return;
    }

    this.isConnecting = true;
    
    // Clear any existing reconnection timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.messageHandler = messageHandler;
    this.onOpenHandler = onOpen || null;
    this.onCloseHandler = onClose || null;

    try {
      // Fix the WebSocket URL format
      const profile = encodeURIComponent(JSON.stringify({
        preferences: { theme: "dark" },
        location: "Ankara"
      }));
      
      this.ws = new WebSocket(`ws://localhost:8000/ws?profile=${profile}`);
      
      this.ws.onopen = () => {
        console.log('WebSocket Connected');
        this.isConnecting = false;
        // Ensure we call the open handler after the connection is fully established
        setTimeout(() => {
          this.onOpenHandler?.();
        }, 100);
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket Disconnected', event.code, event.reason);
        this.isConnecting = false;
        this.onCloseHandler?.();
        
        // Only attempt to reconnect if the connection wasn't closed intentionally
        // and we don't already have a reconnection pending
        if (event.code !== 1000 && !this.reconnectTimeout && !this.isConnecting) {
          this.reconnectTimeout = setTimeout(() => {
            console.log('Attempting to reconnect...');
            this.reconnectTimeout = null;
            if (!this.isConnected()) {  // Only reconnect if we're not already connected
              this.connect(messageHandler, onOpen, onClose);
            }
          }, 5000);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        this.isConnecting = false;
        
        // Close the connection on error to trigger reconnect
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.close();
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.messageHandler?.(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.isConnecting = false;
      
      // Attempt to reconnect on connection error
      if (!this.reconnectTimeout) {
        this.reconnectTimeout = setTimeout(() => {
          console.log('Attempting to reconnect after connection error...');
          this.reconnectTimeout = null;
          this.connect(messageHandler, onOpen, onClose);
        }, 5000);
      }
    }
  }

  disconnect() {
    // Clear any pending reconnection attempt
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      // Only close if the connection is open or connecting
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Intentional disconnect'); // 1000 is normal closure
      }
      this.ws = null;
    }
    
    this.isConnecting = false;
    this.messageHandler = null;
    this.onOpenHandler = null;
    this.onCloseHandler = null;
  }

  send(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket is not connected');
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService();