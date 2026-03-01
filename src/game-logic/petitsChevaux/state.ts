import { Player, PetitsChevauxGameState, PetitsChevauxPlayerState, Horse } from '../types';
import { HORSES_PER_PLAYER } from './constants';

export function createInitialState(players: Player[]): PetitsChevauxGameState {
  const playerStates: PetitsChevauxPlayerState[] = players.map((player) => {
    const horses: Horse[] = Array.from({ length: HORSES_PER_PLAYER }, (_, i) => ({
      id: i,
      playerIndex: player.index,
      status: 'stable',
      boardPosition: -1,
      homePosition: -1,
    }));

    return {
      playerId: player.id,
      playerIndex: player.index,
      horses,
      horsesHome: 0,
    };
  });

  return {
    type: 'petitsChevaux',
    players: playerStates,
    currentPlayerIndex: 0,
    diceValue: null,
    mustRoll: true,
    extraTurn: false,
    turnOrder: players.map((p) => p.id),
    winner: null,
    lastRolls: {},
  };
}
