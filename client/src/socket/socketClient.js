import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token, roomId = null) {
    if (this.socket) {
      this.socket.disconnect();
    }

    const query = {};
    if (roomId) query.roomId = roomId;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      query
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (this.socket) this.socket.on(event, callback);
  }

  off(event, callback) {
    if (this.socket) this.socket.off(event, callback);
  }

  emit(event, payload) {
    if (this.socket) this.socket.emit(event, payload);
  }
}

const socketClient = new SocketService();
export default socketClient;
