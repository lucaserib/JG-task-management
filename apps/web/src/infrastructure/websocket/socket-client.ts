import { io, Socket } from 'socket.io-client';
import { WEBSOCKET_CONFIG, WEBSOCKET_EVENTS } from '../../shared/config/websocket.config';
import { LocalStorageService } from '../storage/local-storage';

class SocketClient {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, Set<Function>> = new Map();
  private onConnectCallback: ((socket: Socket) => void) | null = null;

  connect(): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const token = LocalStorageService.getAccessToken();
    if (!token) {
      console.warn('No access token available for socket connection');
      return;
    }

    this.socket = io(`${WEBSOCKET_CONFIG.URL}/notifications`, {
      ...WEBSOCKET_CONFIG.OPTIONS,
      auth: {
        token,
      },
    });

    this.setupEventListeners();
    this.socket.connect();
  }

  register(userId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot register user');
      return;
    }
    console.log('Registering user:', userId);
    this.socket.emit('register', userId);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventHandlers.clear();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on(WEBSOCKET_EVENTS.CONNECT, () => {
      console.log('Socket connected');
      if (this.onConnectCallback && this.socket) {
        this.onConnectCallback(this.socket);
      }
    });

    this.socket.on(WEBSOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on(WEBSOCKET_EVENTS.CONNECT_ERROR, (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on(WEBSOCKET_EVENTS.RECONNECT, (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on(WEBSOCKET_EVENTS.RECONNECT_ATTEMPT, (attemptNumber) => {
      console.log('Socket reconnection attempt:', attemptNumber);
    });

    this.socket.on(WEBSOCKET_EVENTS.RECONNECT_ERROR, (error) => {
      console.error('Socket reconnection error:', error);
    });

    this.socket.on(WEBSOCKET_EVENTS.RECONNECT_FAILED, () => {
      console.error('Socket reconnection failed');
    });
  }

  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    this.eventHandlers.get(event)!.add(handler);

    if (this.socket) {
      this.socket.on(event, (data: any) => handler(data));
    }
  }

  off(event: string, handler?: Function): void {
    if (handler) {
      this.eventHandlers.get(event)?.delete(handler);
      if (this.socket) {
        this.socket.off(event, handler as any);
      }
    } else {
      this.eventHandlers.delete(event);
      if (this.socket) {
        this.socket.off(event);
      }
    }
  }

  emit(event: string, data?: any): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot emit event:', event);
      return;
    }
    this.socket.emit(event, data);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  onConnect(callback: (socket: Socket) => void): void {
    this.onConnectCallback = callback;
  }
}

export const socketClient = new SocketClient();
