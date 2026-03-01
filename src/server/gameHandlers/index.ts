import { azulHandler } from './azul';
import { petitsChevauxHandler } from './petitsChevaux';
import { GameHandlerRegistry } from './types';

export const gameHandlers: GameHandlerRegistry = {
  azul: azulHandler,
  petitsChevaux: petitsChevauxHandler,
};
