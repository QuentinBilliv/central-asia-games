// Board has 40 positions around the loop
export const BOARD_SIZE = 40;

// Each player's horses enter the board at a specific position
// Spaced evenly: 0, 10, 20, 30
export const START_POSITIONS: Record<number, number> = {
  0: 0,
  1: 10,
  2: 20,
  3: 30,
};

// Home stretch: 4 positions per player before the finish
export const HOME_STRETCH_LENGTH = 4;

// Number of horses per player
export const HORSES_PER_PLAYER = 4;

// Dice value needed to leave stable
export const EXIT_STABLE_VALUE = 6;
