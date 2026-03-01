import { ComponentType } from 'react';
import { GameType, Player } from '@/game-logic/types';
import AzulBoard from '@/components/azul/AzulBoard';
import PetitsChevauxBoard from '@/components/petitsChevaux/PetitsChevauxBoard';
import { createInitialState as createAzulState } from '@/game-logic/azul/state';
import { validateAndApplyMove as azulApplyMove } from '@/game-logic/azul/moves';
import { createInitialState as createPCState } from '@/game-logic/petitsChevaux/state';
import { validateAndApplyMove as pcApplyMove } from '@/game-logic/petitsChevaux/moves';
import { pickAzulBotMove, pickPetitsChevauxBotMove } from '@/game-logic/bot';

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
  createInitialState(players: Player[]): any;
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
};
