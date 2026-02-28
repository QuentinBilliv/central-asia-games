'use client';

import { create } from 'zustand';
import { AzulGameState, AzulTileColor } from '@/game-logic/types';

interface AzulStore {
  gameState: AzulGameState | null;
  selectedFactory: { type: 'factory' | 'center'; id: number } | null;
  selectedColor: AzulTileColor | null;
  setGameState: (state: AzulGameState) => void;
  setSelectedFactory: (factory: { type: 'factory' | 'center'; id: number } | null) => void;
  setSelectedColor: (color: AzulTileColor | null) => void;
  clearSelection: () => void;
  reset: () => void;
}

export const useAzulStore = create<AzulStore>((set) => ({
  gameState: null,
  selectedFactory: null,
  selectedColor: null,
  setGameState: (gameState) => set({ gameState }),
  setSelectedFactory: (selectedFactory) => set({ selectedFactory }),
  setSelectedColor: (selectedColor) => set({ selectedColor }),
  clearSelection: () => set({ selectedFactory: null, selectedColor: null }),
  reset: () =>
    set({
      gameState: null,
      selectedFactory: null,
      selectedColor: null,
    }),
}));
