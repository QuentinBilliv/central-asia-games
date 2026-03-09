import { BackgammonGameState, BackgammonMove } from '../types';
import { NUM_POINTS, CHECKERS_PER_PLAYER, BAR } from './constants';
import { secureDiceRoll } from '../random';

// Helper: does a point belong to a given player?
function isOwnChecker(points: number[], pointIndex: number, playerIndex: number): boolean {
  if (playerIndex === 0) return points[pointIndex] > 0;
  return points[pointIndex] < 0;
}

// Helper: count of checkers for a player at a point
function checkerCount(points: number[], pointIndex: number, playerIndex: number): number {
  const val = points[pointIndex];
  if (playerIndex === 0) return val > 0 ? val : 0;
  return val < 0 ? -val : 0;
}

// Helper: can a player land on a point?
function canLandOn(points: number[], pointIndex: number, playerIndex: number): boolean {
  if (pointIndex < 0 || pointIndex >= NUM_POINTS) return false;
  const val = points[pointIndex];
  if (playerIndex === 0) {
    // Can land if empty, own, or opponent has exactly 1 (blot)
    return val >= -1;
  } else {
    return val <= 1;
  }
}

// Helper: check if all checkers are in home board
function allCheckersInHome(state: BackgammonGameState, playerIndex: number): boolean {
  const bar = state.bar[playerIndex];
  if (bar > 0) return false;

  if (playerIndex === 0) {
    // Home = points 0-5. Check no checkers on points 6-23
    for (let i = 6; i < NUM_POINTS; i++) {
      if (state.points[i] > 0) return false;
    }
  } else {
    // Home = points 18-23. Check no checkers on points 0-17
    for (let i = 0; i < 18; i++) {
      if (state.points[i] < 0) return false;
    }
  }
  return true;
}

// Helper: get the destination point index for a move
function getDestination(from: number, dieValue: number, playerIndex: number): number {
  if (from === BAR) {
    // Entering from bar
    if (playerIndex === 0) return NUM_POINTS - dieValue; // enters at 24-die (point 24,23,...19)
    return dieValue - 1; // enters at die-1 (point 0,1,...5)
  }
  if (playerIndex === 0) return from - dieValue;
  return from + dieValue;
}

// Helper: get the furthest checker from bearing off edge
function furthestChecker(state: BackgammonGameState, playerIndex: number): number {
  if (playerIndex === 0) {
    // Looking for highest index point with own checkers (furthest from point 0)
    for (let i = 5; i >= 0; i--) {
      if (state.points[i] > 0) return i;
    }
  } else {
    // Looking for lowest index point with own checkers (furthest from point 23)
    for (let i = 18; i <= 23; i++) {
      if (state.points[i] < 0) return i;
    }
  }
  return -1;
}

// Get all valid moves for the current player with a specific die value
export function getValidMovesForDie(
  state: BackgammonGameState,
  playerIndex: number,
  dieValue: number
): { from: number; to: number }[] {
  const moves: { from: number; to: number }[] = [];

  // If player has checkers on the bar, must enter them first
  if (state.bar[playerIndex] > 0) {
    const dest = getDestination(BAR, dieValue, playerIndex);
    if (dest >= 0 && dest < NUM_POINTS && canLandOn(state.points, dest, playerIndex)) {
      moves.push({ from: BAR, to: dest });
    }
    return moves; // Must enter from bar before anything else
  }

  const canBearOff = allCheckersInHome(state, playerIndex);

  // Check each point for own checkers
  for (let i = 0; i < NUM_POINTS; i++) {
    if (!isOwnChecker(state.points, i, playerIndex)) continue;

    const dest = getDestination(i, dieValue, playerIndex);

    // Bearing off
    if (canBearOff) {
      if (playerIndex === 0 && dest < 0) {
        // Exact or over-bear: only if this is the furthest checker or exact
        if (dest === -1 || i === furthestChecker(state, playerIndex)) {
          moves.push({ from: i, to: 25 });
        }
        continue;
      }
      if (playerIndex === 1 && dest >= NUM_POINTS) {
        if (dest === NUM_POINTS || i === furthestChecker(state, playerIndex)) {
          moves.push({ from: i, to: 25 });
        }
        continue;
      }
    }

    // Normal move
    if (dest >= 0 && dest < NUM_POINTS && canLandOn(state.points, dest, playerIndex)) {
      moves.push({ from: i, to: dest });
    }
  }

  return moves;
}

// Check if any valid move exists with any remaining die
function hasAnyValidMove(state: BackgammonGameState, playerIndex: number): boolean {
  for (const die of state.remainingMoves) {
    if (getValidMovesForDie(state, playerIndex, die).length > 0) return true;
  }
  return false;
}

// Apply a single checker move to the state (mutates the clone)
function applyCheckerMove(state: BackgammonGameState, playerIndex: number, from: number, to: number): void {
  // Remove from source
  if (from === BAR) {
    state.bar[playerIndex]--;
  } else {
    if (playerIndex === 0) state.points[from]--;
    else state.points[from]++;
  }

  // Bear off
  if (to === 25) {
    state.borneOff[playerIndex]++;
    return;
  }

  // Check for hit (blot)
  const opponent = 1 - playerIndex;
  if (playerIndex === 0 && state.points[to] === -1) {
    state.points[to] = 0;
    state.bar[opponent]++;
  } else if (playerIndex === 1 && state.points[to] === 1) {
    state.points[to] = 0;
    state.bar[opponent]++;
  }

  // Place on destination
  if (playerIndex === 0) state.points[to]++;
  else state.points[to]--;
}

export function validateAndApplyMove(
  state: BackgammonGameState,
  playerId: string,
  move: BackgammonMove
): { valid: boolean; state: BackgammonGameState; error?: string } {
  if (state.turnOrder[state.currentPlayerIndex] !== playerId) {
    return { valid: false, state, error: 'Not your turn' };
  }

  const playerIndex = state.currentPlayerIndex;
  const newState: BackgammonGameState = JSON.parse(JSON.stringify(state));

  if (move.type === 'roll') {
    if (!state.mustRoll) {
      return { valid: false, state, error: 'You must move, not roll' };
    }

    const d1 = secureDiceRoll(6);
    const d2 = secureDiceRoll(6);
    newState.dice = [d1, d2];
    newState.mustRoll = false;

    // Doubles = 4 moves of that value
    if (d1 === d2) {
      newState.remainingMoves = [d1, d1, d1, d1];
    } else {
      newState.remainingMoves = [d1, d2];
    }

    // If no valid moves, auto-end turn
    if (!hasAnyValidMove(newState, playerIndex)) {
      newState.remainingMoves = [];
      newState.dice = null;
      newState.mustRoll = true;
      newState.currentPlayerIndex = 1 - playerIndex;
    }

    return { valid: true, state: newState };
  }

  if (move.type === 'move') {
    if (state.mustRoll) {
      return { valid: false, state, error: 'You must roll first' };
    }

    const from = move.from!;
    const to = move.to!;

    // Find which die value corresponds to this move
    let usedDie = -1;
    for (const die of newState.remainingMoves) {
      const validMoves = getValidMovesForDie(newState, playerIndex, die);
      if (validMoves.some((m) => m.from === from && m.to === to)) {
        usedDie = die;
        break;
      }
    }

    if (usedDie === -1) {
      return { valid: false, state, error: 'Invalid move' };
    }

    // Apply the move
    applyCheckerMove(newState, playerIndex, from, to);

    // Remove used die
    const dieIdx = newState.remainingMoves.indexOf(usedDie);
    newState.remainingMoves.splice(dieIdx, 1);

    // Check win
    if (newState.borneOff[playerIndex] === CHECKERS_PER_PLAYER) {
      newState.winner = playerId;
      newState.remainingMoves = [];
      return { valid: true, state: newState };
    }

    // If no more moves available, auto-end turn
    if (newState.remainingMoves.length === 0 || !hasAnyValidMove(newState, playerIndex)) {
      newState.remainingMoves = [];
      newState.dice = null;
      newState.mustRoll = true;
      newState.currentPlayerIndex = 1 - playerIndex;
    }

    return { valid: true, state: newState };
  }

  if (move.type === 'endTurn') {
    if (state.mustRoll) {
      return { valid: false, state, error: 'You must roll first' };
    }
    // Player can end turn early if they have remaining moves but can't use them
    // (this shouldn't normally happen since we auto-end, but as a safety valve)
    if (hasAnyValidMove(newState, playerIndex)) {
      return { valid: false, state, error: 'You still have valid moves' };
    }

    newState.remainingMoves = [];
    newState.dice = null;
    newState.mustRoll = true;
    newState.currentPlayerIndex = 1 - playerIndex;
    return { valid: true, state: newState };
  }

  return { valid: false, state, error: 'Unknown move type' };
}
