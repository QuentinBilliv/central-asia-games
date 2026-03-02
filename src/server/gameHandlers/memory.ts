import { MemoryMoveSchema } from '../../socket/events';
import { createInitialState } from '../../game-logic/memory/state';
import { validateAndApplyMove } from '../../game-logic/memory/moves';
import { MemoryGameState } from '../../game-logic/types';
import { pickMemoryBotMove } from '../../game-logic/bot';
import { GameHandler } from './types';

export const memoryHandler: GameHandler = {
  moveSchema: MemoryMoveSchema,
  createInitialState,
  validateAndApplyMove,
  sanitizeState(state: MemoryGameState) {
    return {
      ...state,
      cards: state.cards.map((card) => {
        if (card.flipped || card.matched) {
          return card;
        }
        return { ...card, pairId: -1, symbol: '?' };
      }),
    };
  },
  isGameOver(state: MemoryGameState) {
    return state.gameOver;
  },
  pickBotMove: pickMemoryBotMove,
};
