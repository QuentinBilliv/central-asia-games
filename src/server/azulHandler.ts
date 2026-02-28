import { AzulGameState, AzulMove, Player } from '../game-logic/types';
import { createInitialState } from '../game-logic/azul/state';
import { validateAndApplyMove } from '../game-logic/azul/moves';

export function initAzulGame(players: Player[]): AzulGameState {
  return createInitialState(players);
}

export function handleAzulMove(
  state: AzulGameState,
  playerId: string,
  move: any
): { valid: boolean; state: AzulGameState; error?: string } {
  const parsedMove: AzulMove = {
    type: move.type,
    sourceType: move.sourceType,
    sourceId: move.sourceId,
    color: move.color,
    patternLineIndex: move.patternLineIndex,
  };

  if (parsedMove.type !== 'pick') {
    return { valid: false, state, error: 'Invalid move type' };
  }

  if (!['factory', 'center'].includes(parsedMove.sourceType)) {
    return { valid: false, state, error: 'Invalid source type' };
  }

  return validateAndApplyMove(state, playerId, parsedMove);
}
