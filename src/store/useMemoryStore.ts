'use client';

import { create } from 'zustand';
import { MemoryGameState } from '@/game-logic/types';

interface MemoryStore {
  gameState: MemoryGameState | null;
  setGameState: (state: MemoryGameState) => void;
  reset: () => void;
}

export const useMemoryStore = create<MemoryStore>((set) => ({
  gameState: null,
  setGameState: (gameState) => set({ gameState }),
  reset: () => set({ gameState: null }),
}));
