import { Player, BackgammonGameState } from '../types';
import { INITIAL_POSITIONS } from './constants';

export function createInitialState(players: Player[]): BackgammonGameState {
  const turnOrder = players
    .sort((a, b) => a.index - b.index)
    .map((p) => p.id);

  return {
    type: 'backgammon',
    points: [...INITIAL_POSITIONS],
    bar: [0, 0],
    borneOff: [0, 0],
    dice: null,
    remainingMoves: [],
    mustRoll: true,
    currentPlayerIndex: 0,
    turnOrder,
    winner: null,
    doublingCube: 1,
  };
}
