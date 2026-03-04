import { ToguzKorgoolMoveSchema } from '../../socket/events';
import { createInitialState } from '../../game-logic/toguzKorgool/state';
import { validateAndApplyMove } from '../../game-logic/toguzKorgool/moves';
import { ToguzKorgoolGameState } from '../../game-logic/types';
import { pickToguzKorgoolBotMove } from '../../game-logic/bot';
import { GameHandler } from './types';

export const toguzKorgoolHandler: GameHandler = {
  moveSchema: ToguzKorgoolMoveSchema,
  createInitialState,
  validateAndApplyMove,
  sanitizeState(state: ToguzKorgoolGameState) {
    // Toguz Korgool is perfect information — no hidden state to strip
    return state;
  },
  isGameOver(state: ToguzKorgoolGameState) {
    return state.winner != null || state.isDraw;
  },
  pickBotMove: pickToguzKorgoolBotMove,
};
