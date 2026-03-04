import { create } from 'zustand';
import { ToguzKorgoolGameState } from '@/game-logic/types';

interface ToguzKorgoolStore {
  gameState: ToguzKorgoolGameState | null;
  selectedPit: number | null;
  setGameState: (state: ToguzKorgoolGameState) => void;
  setSelectedPit: (pit: number | null) => void;
  reset: () => void;
}

export const useToguzKorgoolStore = create<ToguzKorgoolStore>((set) => ({
  gameState: null,
  selectedPit: null,
  setGameState: (state) => set({ gameState: state }),
  setSelectedPit: (pit) => set({ selectedPit: pit }),
  reset: () => set({ gameState: null, selectedPit: null }),
}));
