// Backgammon (Nard) constants

export const NUM_POINTS = 24;
export const CHECKERS_PER_PLAYER = 15;
export const BAR = 24; // virtual point index for bar
export const BEAR_OFF = 25; // virtual point index for bearing off

// Starting positions for standard backgammon
// Player 0: positive values, moves from high points to low (home = points 0-5)
// Player 1: negative values, moves from low points to high (home = points 18-23)
export const INITIAL_POSITIONS: number[] = (() => {
  const points = new Array(24).fill(0);
  // Player 0 (positive): standard starting layout
  points[23] = 2;   // 2 checkers on point 24
  points[12] = 5;   // 5 checkers on point 13
  points[7] = 3;    // 3 checkers on point 8
  points[5] = 5;    // 5 checkers on point 6
  // Player 1 (negative): mirrored
  points[0] = -2;   // 2 checkers on point 1
  points[11] = -5;  // 5 checkers on point 12
  points[16] = -3;  // 3 checkers on point 17
  points[18] = -5;  // 5 checkers on point 19
  return points;
})();

// Home board ranges
export const HOME_START = [0, 18] as const; // inclusive
export const HOME_END = [5, 23] as const;   // inclusive

// Direction of movement for each player
export const DIRECTION = [-1, 1] as const; // player 0 moves down, player 1 moves up
