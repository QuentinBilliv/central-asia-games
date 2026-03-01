import { PetitsChevauxMoveSchema } from '../../socket/events';
import { createInitialState } from '../../game-logic/petitsChevaux/state';
import { validateAndApplyMove } from '../../game-logic/petitsChevaux/moves';
import { PetitsChevauxGameState } from '../../game-logic/types';
import { pickPetitsChevauxBotMove } from '../../game-logic/bot';
import { GameHandler } from './types';

export const petitsChevauxHandler: GameHandler = {
  moveSchema: PetitsChevauxMoveSchema,
  createInitialState,
  validateAndApplyMove,
  sanitizeState(state: PetitsChevauxGameState) {
    return state;
  },
  isGameOver(state: PetitsChevauxGameState) {
    return state.winner != null;
  },
  pickBotMove: pickPetitsChevauxBotMove,
};
