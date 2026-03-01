'use client';

import { create } from 'zustand';
import { BurkutBoriGameState } from '@/game-logic/types';

interface BurkutBoriStore {
  gameState: BurkutBoriGameState | null;
  animatingMove: boolean;
  setGameState: (state: BurkutBoriGameState) => void;
  setAnimatingMove: (animating: boolean) => void;
  reset: () => void;
}

export const useBurkutBoriStore = create<BurkutBoriStore>((set) => ({
  gameState: null,
  animatingMove: false,
  setGameState: (gameState) => set({ gameState }),
  setAnimatingMove: (animatingMove) => set({ animatingMove }),
  reset: () =>
    set({
      gameState: null,
      animatingMove: false,
    }),
}));
