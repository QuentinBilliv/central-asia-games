import { azulHandler } from './azul';
import { petitsChevauxHandler } from './petitsChevaux';
import { burkutBoriHandler } from './burkutBori';
import { memoryHandler } from './memory';
import { GameHandlerRegistry } from './types';

export const gameHandlers: GameHandlerRegistry = {
  azul: azulHandler,
  petitsChevaux: petitsChevauxHandler,
  burkutBori: burkutBoriHandler,
  memory: memoryHandler,
};
