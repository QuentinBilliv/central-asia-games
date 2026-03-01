import { AzulMoveSchema } from '../../socket/events';
import { createInitialState } from '../../game-logic/azul/state';
import { validateAndApplyMove } from '../../game-logic/azul/moves';
import { AzulGameState } from '../../game-logic/types';
import { pickAzulBotMove } from '../../game-logic/bot';
import { GameHandler } from './types';

export const azulHandler: GameHandler = {
  moveSchema: AzulMoveSchema,
  createInitialState,
  validateAndApplyMove,
  sanitizeState(state: AzulGameState) {
    const { bag, discard, ...safe } = state;
    return safe;
  },
  isGameOver(state: AzulGameState) {
    return state.winner != null || state.gameOver;
  },
  pickBotMove: pickAzulBotMove,
};
