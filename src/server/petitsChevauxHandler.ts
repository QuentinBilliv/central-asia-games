import { PetitsChevauxGameState, PetitsChevauxMove, Player } from '../game-logic/types';
import { createInitialState } from '../game-logic/petitsChevaux/state';
import { validateAndApplyMove } from '../game-logic/petitsChevaux/moves';

export function initPetitsChevauxGame(players: Player[]): PetitsChevauxGameState {
  return createInitialState(players);
}

export function handlePetitsChevauxMove(
  state: PetitsChevauxGameState,
  playerId: string,
  move: any
): { valid: boolean; state: PetitsChevauxGameState; error?: string } {
  const parsedMove: PetitsChevauxMove = {
    type: move.type,
    horseId: move.horseId,
  };

  if (parsedMove.type !== 'roll' && parsedMove.type !== 'moveHorse') {
    return { valid: false, state, error: 'Invalid move type' };
  }

  if (parsedMove.type === 'moveHorse' && parsedMove.horseId === undefined) {
    return { valid: false, state, error: 'Horse ID required' };
  }

  return validateAndApplyMove(state, playerId, parsedMove);
}
