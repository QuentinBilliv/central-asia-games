'use client';

import { create } from 'zustand';
import { BackgammonGameState } from '@/game-logic/types';

interface BackgammonStore {
  gameState: BackgammonGameState | null;
  selectedFrom: number | null; // point index or 24 for bar
  setGameState: (state: BackgammonGameState) => void;
  setSelectedFrom: (from: number | null) => void;
  reset: () => void;
}

export const useBackgammonStore = create<BackgammonStore>((set) => ({
  gameState: null,
  selectedFrom: null,
  setGameState: (gameState) => set({ gameState }),
  setSelectedFrom: (selectedFrom) => set({ selectedFrom }),
  reset: () => set({ gameState: null, selectedFrom: null }),
}));
