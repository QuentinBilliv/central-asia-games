import { z } from 'zod';
import { Player, GameType } from '../../game-logic/types';

export interface GameHandler {
  moveSchema: z.ZodType;
  createInitialState(players: Player[]): any;
  validateAndApplyMove(state: any, playerId: string, move: any): { valid: boolean; state: any; error?: string };
  sanitizeState(state: any): any;
  isGameOver(state: any): boolean;
  pickBotMove(state: any, playerId: string): any;
}

export type GameHandlerRegistry = Record<GameType, GameHandler>;
