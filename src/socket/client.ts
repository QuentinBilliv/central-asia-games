'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return socket;
}

export function getPlayerId(): string {
  if (typeof window === 'undefined') return '';

  let id = sessionStorage.getItem('playerId');
  if (!id) {
    // Generate a simple ID without importing nanoid (avoid ESM issues)
    id = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    sessionStorage.setItem('playerId', id);
  }
  return id;
}
