import { BurkutBoriGameState, BurkutBoriMove, BurkutBoriLastMove } from '../types';
import { BOARD_SIZE, EXTRA_TURN_VALUE } from './constants';
import { resolveCell } from './board';
import { secureDiceRoll } from '../random';

interface MoveResult {
  valid: boolean;
  state: BurkutBoriGameState;
  error?: string;
}

export function validateAndApplyMove(
  state: BurkutBoriGameState,
  playerId: string,
  move: BurkutBoriMove
): MoveResult {
  const currentPlayer = state.turnOrder[state.currentPlayerIndex];
  if (currentPlayer !== playerId) {
    return { valid: false, state, error: 'Not your turn' };
  }

  if (move.type !== 'roll') {
    return { valid: false, state, error: 'Invalid move type' };
  }

  // Roll the die
  const diceValue = secureDiceRoll();

  // Deep clone
  const newState: BurkutBoriGameState = structuredClone(state);
  const playerIdx = newState.players.findIndex((p) => p.playerId === playerId);
  const player = newState.players[playerIdx];

  const from = player.position;
  let rawTarget = from + diceValue;

  // Overshoot: bounce back from 100
  if (rawTarget > BOARD_SIZE) {
    rawTarget = BOARD_SIZE - (rawTarget - BOARD_SIZE);
  }

  // Resolve eagle/wolf
  const resolution = resolveCell(rawTarget);

  const lastMove: BurkutBoriLastMove = {
    playerId,
    diceValue,
    from,
    to: resolution.finalCell,
    intermediatePosition: rawTarget !== resolution.finalCell ? rawTarget : null,
    hitEagle: resolution.hitEagle,
    hitWolf: resolution.hitWolf,
  };

  player.position = resolution.finalCell;
  newState.lastMove = lastMove;

  // Check win
  if (player.position === BOARD_SIZE) {
    newState.winner = playerId;
    return { valid: true, state: newState };
  }

  // Extra turn on 6, otherwise advance
  if (diceValue === EXTRA_TURN_VALUE) {
    // Same player rolls again (currentPlayerIndex stays)
  } else {
    newState.currentPlayerIndex =
      (newState.currentPlayerIndex + 1) % newState.turnOrder.length;
  }

  return { valid: true, state: newState };
}
