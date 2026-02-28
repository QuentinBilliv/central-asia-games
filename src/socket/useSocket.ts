'use client';

import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, getPlayerId } from './client';
import { CLIENT_EVENTS, SERVER_EVENTS } from './events';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return {
    socket: socketRef.current,
    connected,
    playerId: typeof window !== 'undefined' ? getPlayerId() : '',
  };
}
