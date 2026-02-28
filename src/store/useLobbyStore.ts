'use client';

import { create } from 'zustand';
import { Player, GameType } from '@/game-logic/types';

interface LobbyState {
  roomId: string | null;
  gameType: GameType | null;
  players: Player[];
  hostId: string | null;
  status: 'waiting' | 'playing' | 'finished';
  nickname: string;
  joined: boolean;
  error: string | null;
  setRoom: (room: any) => void;
  setPlayers: (players: Player[]) => void;
  setHostId: (hostId: string) => void;
  setNickname: (nickname: string) => void;
  setJoined: (joined: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useLobbyStore = create<LobbyState>((set) => ({
  roomId: null,
  gameType: null,
  players: [],
  hostId: null,
  status: 'waiting',
  nickname: '',
  joined: false,
  error: null,
  setRoom: (room) =>
    set({
      roomId: room.id,
      gameType: room.gameType,
      players: room.players,
      hostId: room.hostId,
      status: room.status,
      joined: true,
      error: null,
    }),
  setPlayers: (players) => set({ players }),
  setHostId: (hostId) => set({ hostId }),
  setNickname: (nickname) => set({ nickname }),
  setJoined: (joined) => set({ joined }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      roomId: null,
      gameType: null,
      players: [],
      hostId: null,
      status: 'waiting',
      nickname: '',
      joined: false,
      error: null,
    }),
}));
