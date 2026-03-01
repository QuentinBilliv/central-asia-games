import { Player, BurkutBoriGameState, BurkutBoriPlayer } from '../types';

export function createInitialState(players: Player[]): BurkutBoriGameState {
  const bbPlayers: BurkutBoriPlayer[] = players.map((p) => ({
    playerId: p.id,
    playerIndex: p.index,
    position: 0, // 0 = off-board
  }));

  return {
    type: 'burkutBori',
    players: bbPlayers,
    currentPlayerIndex: 0,
    turnOrder: players.map((p) => p.id),
    winner: null,
    lastMove: null,
  };
}
