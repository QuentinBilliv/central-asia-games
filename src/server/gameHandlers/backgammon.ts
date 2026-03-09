import { BackgammonMoveSchema } from '../../socket/events';
import { createInitialState } from '../../game-logic/backgammon/state';
import { validateAndApplyMove } from '../../game-logic/backgammon/moves';
import { BackgammonGameState } from '../../game-logic/types';
import { pickBackgammonBotMove } from '../../game-logic/bot';
import { GameHandler } from './types';

export const backgammonHandler: GameHandler = {
  moveSchema: BackgammonMoveSchema,
  createInitialState,
  validateAndApplyMove,
  sanitizeState(state: BackgammonGameState) {
    // No hidden info in backgammon
    return state;
  },
  isGameOver(state: BackgammonGameState) {
    return state.winner != null;
  },
  pickBotMove: pickBackgammonBotMove,
};
