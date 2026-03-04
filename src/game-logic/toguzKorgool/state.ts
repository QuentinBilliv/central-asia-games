import { Player, ToguzKorgoolGameState } from '../types';
import { PITS_PER_PLAYER, INITIAL_STONES_PER_PIT } from './constants';

export function createInitialState(players: Player[]): ToguzKorgoolGameState {
  // Toguz Korgool is strictly 2-player
  const sorted = [...players].sort((a, b) => a.index - b.index).slice(0, 2);
  const turnOrder = sorted.map((p) => p.id);

  return {
    type: 'toguzKorgool',
    players: sorted.map((p, i) => ({
      playerId: p.id,
      playerIndex: i,
      pits: Array(PITS_PER_PLAYER).fill(INITIAL_STONES_PER_PIT),
      kazan: 0,
      tpieces: 0,
      tuz: null,
    })),
    currentPlayerIndex: 0,
    turnOrder,
    winner: null,
    isDraw: false,
  };
}
