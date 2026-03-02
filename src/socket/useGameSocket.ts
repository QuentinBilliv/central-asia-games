'use client';

import { useEffect, useCallback } from 'react';
import { CLIENT_EVENTS, SERVER_EVENTS } from './events';
import { useSocket } from './useSocket';
import { useLobbyStore } from '@/store/useLobbyStore';

export function useGameSocket(roomId: string) {
  const { socket, connected, playerId } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleRoomState = (data: any) => {
      useLobbyStore.getState().setRoom(data);
    };

    const handlePlayerJoined = (data: any) => {
      useLobbyStore.getState().setPlayers(data.players);
    };

    const handlePlayerLeft = (data: any) => {
      useLobbyStore.getState().setPlayers(data.players);
      if (data.hostId) {
        useLobbyStore.getState().setHostId(data.hostId);
      }
    };

    const handleError = (data: any) => {
      useLobbyStore.getState().setError(data.message);
    };

    socket.on(SERVER_EVENTS.ROOM_STATE, handleRoomState);
    socket.on(SERVER_EVENTS.PLAYER_JOINED, handlePlayerJoined);
    socket.on(SERVER_EVENTS.PLAYER_LEFT, handlePlayerLeft);
    socket.on(SERVER_EVENTS.ERROR, handleError);

    return () => {
      socket.off(SERVER_EVENTS.ROOM_STATE, handleRoomState);
      socket.off(SERVER_EVENTS.PLAYER_JOINED, handlePlayerJoined);
      socket.off(SERVER_EVENTS.PLAYER_LEFT, handlePlayerLeft);
      socket.off(SERVER_EVENTS.ERROR, handleError);
    };
  }, [socket]);

  const joinRoom = useCallback(
    (nickname: string, gameType?: string) => {
      if (!socket) return;
      socket.emit(CLIENT_EVENTS.JOIN_ROOM, { roomId, playerId, nickname, gameType });
    },
    [socket, roomId, playerId]
  );

  const leaveRoom = useCallback(() => {
    if (!socket) return;
    socket.emit(CLIENT_EVENTS.LEAVE_ROOM, { roomId, playerId });
  }, [socket, roomId, playerId]);

  const startGame = useCallback((gameConfig?: any) => {
    if (!socket) return;
    socket.emit(CLIENT_EVENTS.START_GAME, { roomId, playerId, gameConfig });
  }, [socket, roomId, playerId]);

  const sendMove = useCallback(
    (move: any) => {
      if (!socket) return;
      socket.emit(CLIENT_EVENTS.GAME_MOVE, { roomId, playerId, move });
    },
    [socket, roomId, playerId]
  );

  const restartGame = useCallback(() => {
    if (!socket) return;
    socket.emit(CLIENT_EVENTS.RESTART_GAME, { roomId, playerId });
  }, [socket, roomId, playerId]);

  return {
    connected,
    playerId,
    joinRoom,
    leaveRoom,
    startGame,
    sendMove,
    restartGame,
  };
}
