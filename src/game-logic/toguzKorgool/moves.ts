import {
  ToguzKorgoolGameState,
  ToguzKorgoolMove,
  ToguzKorgoolPlayerState,
} from '../types';
import {
  PITS_PER_PLAYER,
  TOTAL_STONES,
  STONES_TO_WIN,
  STONES_FOR_DRAW,
  TUZ_TRIGGER_COUNT,
  TUZ_FORBIDDEN_PIT,
} from './constants';

/**
 * Toguz Korgool rules:
 * - 2 players, 9 pits each, 9 stones per pit (162 total)
 * - Sow counter-clockwise from chosen pit
 * - If pit has exactly 1 stone, move it to the next pit (don't sow from same pit)
 * - If last stone lands in opponent's pit making it even → capture all stones
 * - Tuz: if last stone lands in opponent's pit making it exactly 3, player may claim
 *   it as tuz (permanently captures stones that land there). Rules:
 *   - Each player can have at most 1 tuz
 *   - Cannot claim pit 9 (index 8)
 *   - Cannot claim the same-numbered pit as opponent's tuz (symmetry rule)
 * - Win: collect 82+ stones. Draw: both at 81.
 */

const TOTAL_PITS = PITS_PER_PLAYER * 2; // 18 pits in the circular board

export function validateAndApplyMove(
  state: ToguzKorgoolGameState,
  playerId: string,
  move: ToguzKorgoolMove
): { valid: boolean; state: ToguzKorgoolGameState; error?: string } {
  // Check turn
  if (state.turnOrder[state.currentPlayerIndex] !== playerId) {
    return { valid: false, state, error: 'Not your turn' };
  }
  if (state.winner != null || state.isDraw) {
    return { valid: false, state, error: 'Game is over' };
  }
  if (move.type !== 'sow') {
    return { valid: false, state, error: 'Invalid move type' };
  }
  if (move.pitIndex < 0 || move.pitIndex >= PITS_PER_PLAYER) {
    return { valid: false, state, error: 'Invalid pit index' };
  }

  const currentPI = state.currentPlayerIndex;
  const opponentPI = 1 - currentPI;

  // Check pit has stones
  if (state.players[currentPI].pits[move.pitIndex] === 0) {
    return { valid: false, state, error: 'Pit is empty' };
  }

  // Deep clone state
  const newState: ToguzKorgoolGameState = JSON.parse(JSON.stringify(state));
  const current = newState.players[currentPI];
  const opponent = newState.players[opponentPI];

  let stones = current.pits[move.pitIndex];
  current.pits[move.pitIndex] = 0;

  // Sowing: pits are numbered 0-8 for current player, 9-17 for opponent (circular)
  // Start from the next pit after the chosen one
  // Special rule: if only 1 stone, drop it in the next pit
  let pos = pitToAbsolute(currentPI, move.pitIndex);

  if (stones === 1) {
    // Move single stone to next pit
    pos = (pos + 1) % TOTAL_PITS;
    addStoneAt(newState, currentPI, pos, 1);
  } else {
    // Drop one stone back in the source pit, sow the rest
    current.pits[move.pitIndex] = 1;
    stones -= 1;

    for (let i = 0; i < stones; i++) {
      pos = (pos + 1) % TOTAL_PITS;
      addStoneAt(newState, currentPI, pos, 1);
    }
  }

  // Check capture: last stone landed in opponent's pit
  const lastPitOwner = getOwner(currentPI, pos);
  const lastPitLocalIndex = getLocalIndex(currentPI, pos);

  if (lastPitOwner === opponentPI) {
    const opponentPitStones = opponent.pits[lastPitLocalIndex];

    // Even number → capture all
    if (opponentPitStones % 2 === 0) {
      current.kazan += opponentPitStones;
      current.tpieces = current.kazan;
      opponent.pits[lastPitLocalIndex] = 0;
    }
    // Exactly 3 → candidate for tuz
    else if (opponentPitStones === TUZ_TRIGGER_COUNT) {
      if (canClaimTuz(current, opponent, lastPitLocalIndex)) {
        current.tuz = lastPitLocalIndex;
        // Immediately capture stones in the new tuz
        current.kazan += opponent.pits[lastPitLocalIndex];
        current.tpieces = current.kazan;
        opponent.pits[lastPitLocalIndex] = 0;
      }
    }
  }

  // Collect any stones in tuz pits
  collectTuzStones(newState);

  // Check win/draw conditions
  checkEndCondition(newState);

  // If game not over, check if next player has moves. If not, current player captures remaining.
  if (newState.winner == null && !newState.isDraw) {
    const nextPI = 1 - currentPI;
    const nextPlayer = newState.players[nextPI];
    const hasStones = nextPlayer.pits.some((s) => s > 0);
    if (!hasStones) {
      // Next player has no moves — current player captures all remaining stones on their side
      const remaining = newState.players[currentPI].pits.reduce((a, b) => a + b, 0);
      newState.players[currentPI].pits = Array(PITS_PER_PLAYER).fill(0);
      newState.players[currentPI].kazan += remaining;
      newState.players[currentPI].tpieces = newState.players[currentPI].kazan;
      checkEndCondition(newState);
    }
  }

  // Advance turn if game not over
  if (newState.winner == null && !newState.isDraw) {
    newState.currentPlayerIndex = 1 - currentPI;
  }

  return { valid: true, state: newState };
}

/** Get valid pit indices for a player */
export function getValidMoves(state: ToguzKorgoolGameState, playerIndex: number): number[] {
  const pits = state.players[playerIndex].pits;
  const moves: number[] = [];
  for (let i = 0; i < PITS_PER_PLAYER; i++) {
    if (pits[i] > 0) moves.push(i);
  }
  return moves;
}

// --- Helpers ---

/** Convert player-relative pit index to absolute position (0-17) */
function pitToAbsolute(currentPI: number, pitIndex: number): number {
  return currentPI === 0 ? pitIndex : pitIndex + PITS_PER_PLAYER;
}

/** Get which player owns an absolute pit position */
function getOwner(currentPI: number, absPos: number): number {
  // Pits 0-8 belong to player who is currentPI=0's side, 9-17 to the other
  // But in absolute terms: player 0 = pits 0-8, player 1 = pits 9-17
  return absPos < PITS_PER_PLAYER ? 0 : 1;
}

/** Get local index (0-8) from absolute position */
function getLocalIndex(_currentPI: number, absPos: number): number {
  return absPos % PITS_PER_PLAYER;
}

/** Add stones to a pit at absolute position */
function addStoneAt(state: ToguzKorgoolGameState, _currentPI: number, absPos: number, count: number): void {
  const owner = absPos < PITS_PER_PLAYER ? 0 : 1;
  const localIdx = absPos % PITS_PER_PLAYER;
  state.players[owner].pits[localIdx] += count;
}

/** Check if player can claim a tuz at the given opponent pit index */
function canClaimTuz(
  current: ToguzKorgoolPlayerState,
  opponent: ToguzKorgoolPlayerState,
  pitIndex: number
): boolean {
  // Already has a tuz
  if (current.tuz != null) return false;
  // Pit 9 (index 8) cannot be tuz
  if (pitIndex === TUZ_FORBIDDEN_PIT) return false;
  // Symmetry rule: cannot claim same-numbered pit as opponent's tuz
  if (opponent.tuz != null && opponent.tuz === pitIndex) return false;
  return true;
}

/** Collect stones that landed in tuz pits */
function collectTuzStones(state: ToguzKorgoolGameState): void {
  for (let pi = 0; pi < 2; pi++) {
    const player = state.players[pi];
    const opponentIdx = 1 - pi;
    if (player.tuz != null) {
      const stonesInTuz = state.players[opponentIdx].pits[player.tuz];
      if (stonesInTuz > 0) {
        player.kazan += stonesInTuz;
        player.tpieces = player.kazan;
        state.players[opponentIdx].pits[player.tuz] = 0;
      }
    }
  }
}

/** Check win/draw conditions */
function checkEndCondition(state: ToguzKorgoolGameState): void {
  for (let pi = 0; pi < 2; pi++) {
    if (state.players[pi].kazan >= STONES_TO_WIN) {
      state.winner = state.turnOrder[pi];
      return;
    }
  }
  if (state.players[0].kazan === STONES_FOR_DRAW && state.players[1].kazan === STONES_FOR_DRAW) {
    state.isDraw = true;
  }
}
