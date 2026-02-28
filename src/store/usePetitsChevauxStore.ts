'use client';

import { create } from 'zustand';
import { PetitsChevauxGameState } from '@/game-logic/types';

interface PetitsChevauxStore {
  gameState: PetitsChevauxGameState | null;
  validMoves: number[];
  setGameState: (state: PetitsChevauxGameState) => void;
  setValidMoves: (moves: number[]) => void;
  reset: () => void;
}

export const usePetitsChevauxStore = create<PetitsChevauxStore>((set) => ({
  gameState: null,
  validMoves: [],
  setGameState: (gameState) => set({ gameState }),
  setValidMoves: (validMoves) => set({ validMoves }),
  reset: () =>
    set({
      gameState: null,
      validMoves: [],
    }),
}));
