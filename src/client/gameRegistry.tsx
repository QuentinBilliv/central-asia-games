import { ComponentType } from 'react';
import { GameType, Player } from '@/game-logic/types';
import AzulBoard from '@/components/azul/AzulBoard';
import PetitsChevauxBoard from '@/components/petitsChevaux/PetitsChevauxBoard';
import BurkutBoriBoard from '@/components/burkutBori/BurkutBoriBoard';
import MemoryBoard from '@/components/memory/MemoryBoard';
import ToguzKorgoolBoard from '@/components/toguzKorgool/ToguzKorgoolBoard';
import { createInitialState as createAzulState } from '@/game-logic/azul/state';
import { validateAndApplyMove as azulApplyMove } from '@/game-logic/azul/moves';
import { createInitialState as createPCState } from '@/game-logic/petitsChevaux/state';
import { validateAndApplyMove as pcApplyMove } from '@/game-logic/petitsChevaux/moves';
import { createInitialState as createBBState } from '@/game-logic/burkutBori/state';
import { validateAndApplyMove as bbApplyMove } from '@/game-logic/burkutBori/moves';
import { createInitialState as createMemoryState } from '@/game-logic/memory/state';
import { validateAndApplyMove as memoryApplyMove } from '@/game-logic/memory/moves';
import { createInitialState as createTKState } from '@/game-logic/toguzKorgool/state';
import { validateAndApplyMove as tkApplyMove } from '@/game-logic/toguzKorgool/moves';
import { pickAzulBotMove, pickPetitsChevauxBotMove, pickBurkutBoriBotMove, pickMemoryBotMove, pickToguzKorgoolBotMove } from '@/game-logic/bot';

export interface GameBoardProps {
  gameState: any;
  playerId: string;
  players: Player[];
  onMove: (move: any) => void;
  onRestart: () => void;
  isHost: boolean;
}

export interface ClientGameEntry {
  Board: ComponentType<GameBoardProps>;
  createInitialState(players: Player[], gameConfig?: any): any;
  validateAndApplyMove(state: any, playerId: string, move: any): { valid: boolean; state: any; error?: string };
  pickBotMove(state: any, playerId: string): any;
  isGameOver(state: any): boolean;
}

export const clientGameRegistry: Record<GameType, ClientGameEntry> = {
  azul: {
    Board: AzulBoard as ComponentType<GameBoardProps>,
    createInitialState: createAzulState,
    validateAndApplyMove: azulApplyMove,
    pickBotMove: pickAzulBotMove,
    isGameOver: (state) => state.winner != null || state.gameOver,
  },
  petitsChevaux: {
    Board: PetitsChevauxBoard as ComponentType<GameBoardProps>,
    createInitialState: createPCState,
    validateAndApplyMove: pcApplyMove,
    pickBotMove: pickPetitsChevauxBotMove,
    isGameOver: (state) => state.winner != null,
  },
  burkutBori: {
    Board: BurkutBoriBoard as ComponentType<GameBoardProps>,
    createInitialState: createBBState,
    validateAndApplyMove: bbApplyMove,
    pickBotMove: pickBurkutBoriBotMove,
    isGameOver: (state) => state.winner != null,
  },
  memory: {
    Board: MemoryBoard as ComponentType<GameBoardProps>,
    createInitialState: createMemoryState,
    validateAndApplyMove: memoryApplyMove,
    pickBotMove: pickMemoryBotMove,
    isGameOver: (state) => state.gameOver,
  },
  toguzKorgool: {
    Board: ToguzKorgoolBoard as ComponentType<GameBoardProps>,
    createInitialState: createTKState,
    validateAndApplyMove: tkApplyMove,
    pickBotMove: pickToguzKorgoolBotMove,
    isGameOver: (state) => state.winner != null || state.isDraw,
  },
};
