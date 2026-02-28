import { Horse } from '../types';
import { BOARD_SIZE, START_POSITIONS, HOME_STRETCH_LENGTH } from './constants';

/**
 * Calculate the actual position of a horse relative to the board,
 * accounting for the player's start position.
 */
export function getAbsolutePosition(horse: Horse): number {
  if (horse.status !== 'board') return -1;
  return horse.boardPosition;
}

/**
 * Calculate how far a horse has traveled from its start position.
 * Used to determine if it can enter the home stretch.
 */
export function getDistanceTraveled(horse: Horse): number {
  if (horse.status !== 'board') return -1;
  const start = START_POSITIONS[horse.playerIndex];
  if (horse.boardPosition >= start) {
    return horse.boardPosition - start;
  }
  return BOARD_SIZE - start + horse.boardPosition;
}

/**
 * Calculate the new position after moving `steps` spaces.
 * Returns null if the move is invalid (would overshoot home).
 */
export function calculateNewPosition(
  horse: Horse,
  steps: number
): { status: 'board'; boardPosition: number; homePosition: number } |
   { status: 'home'; boardPosition: number; homePosition: number } |
   null {
  if (horse.status === 'home') return null;

  if (horse.status === 'stable') {
    // Can only leave stable with a 6
    if (steps !== 6) return null;
    return {
      status: 'board',
      boardPosition: START_POSITIONS[horse.playerIndex],
      homePosition: -1,
    };
  }

  // Horse is on the board
  const distanceTraveled = getDistanceTraveled(horse);
  const totalAfterMove = distanceTraveled + steps;

  // Check if horse enters home stretch
  // Home stretch starts after traveling the full board (BOARD_SIZE positions)
  if (totalAfterMove >= BOARD_SIZE) {
    const homePos = totalAfterMove - BOARD_SIZE;
    if (homePos >= HOME_STRETCH_LENGTH) {
      // Overshoot - invalid move
      return null;
    }
    return {
      status: 'home',
      boardPosition: -1,
      homePosition: homePos,
    };
  }

  // Normal board movement
  const newPos = (horse.boardPosition + steps) % BOARD_SIZE;
  return {
    status: 'board',
    boardPosition: newPos,
    homePosition: -1,
  };
}

/**
 * Check if a position on the board is occupied by another player's horse.
 * Returns the horse that would be captured, or null.
 */
export function findCapturedHorse(
  allHorses: Horse[],
  targetPosition: number,
  movingPlayerIndex: number
): Horse | null {
  return allHorses.find(
    (h) =>
      h.status === 'board' &&
      h.boardPosition === targetPosition &&
      h.playerIndex !== movingPlayerIndex
  ) || null;
}
