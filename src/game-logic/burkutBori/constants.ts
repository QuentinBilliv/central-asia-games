export const BOARD_SIZE = 100;
export const GRID_ROWS = 10;
export const GRID_COLS = 10;
export const EXTRA_TURN_VALUE = 6;

// Eagles (Bürküt): base → head (lift player UP)
export const EAGLE_MAP: Record<number, number> = {
  4: 25,
  13: 46,
  33: 49,
  42: 63,
  50: 69,
  62: 81,
  74: 92,
};

// Wolves (Böri): head → tail (slide player DOWN)
export const WOLF_MAP: Record<number, number> = {
  27: 5,
  40: 3,
  43: 18,
  54: 31,
  66: 45,
  76: 58,
  89: 53,
  99: 41,
};
