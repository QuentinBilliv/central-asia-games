import { BurkutBoriMoveSchema } from '../../socket/events';
import { createInitialState } from '../../game-logic/burkutBori/state';
import { validateAndApplyMove } from '../../game-logic/burkutBori/moves';
import { BurkutBoriGameState } from '../../game-logic/types';
import { pickBurkutBoriBotMove } from '../../game-logic/bot';
import { GameHandler } from './types';

export const burkutBoriHandler: GameHandler = {
  moveSchema: BurkutBoriMoveSchema,
  createInitialState,
  validateAndApplyMove,
  sanitizeState(state: BurkutBoriGameState) {
    return state; // No hidden state
  },
  isGameOver(state: BurkutBoriGameState) {
    return state.winner != null;
  },
  pickBotMove: pickBurkutBoriBotMove,
};
