import { AzulTileColor } from '../types';

export const TILE_COLORS: AzulTileColor[] = ['lapis', 'gold', 'terracotta', 'obsidian', 'turquoise'];

export const TILES_PER_COLOR = 20;
export const TOTAL_TILES = TILE_COLORS.length * TILES_PER_COLOR; // 100

export const TILES_PER_FACTORY = 4;

// Number of factories based on player count
export const FACTORIES_BY_PLAYERS: Record<number, number> = {
  2: 5,
  3: 7,
  4: 9,
};

// Wall pattern (which color goes where)
// Each row shifts one position from the previous
export const WALL_PATTERN: AzulTileColor[][] = [
  ['lapis', 'gold', 'terracotta', 'obsidian', 'turquoise'],
  ['turquoise', 'lapis', 'gold', 'terracotta', 'obsidian'],
  ['obsidian', 'turquoise', 'lapis', 'gold', 'terracotta'],
  ['terracotta', 'obsidian', 'turquoise', 'lapis', 'gold'],
  ['gold', 'terracotta', 'obsidian', 'turquoise', 'lapis'],
];

// Floor line penalties
export const FLOOR_PENALTIES = [-1, -1, -2, -2, -2, -3, -3];

// Pattern line sizes (row 0 = 1 slot, row 4 = 5 slots)
export const PATTERN_LINE_SIZES = [1, 2, 3, 4, 5];

// End game bonuses
export const BONUS_COMPLETE_ROW = 2;
export const BONUS_COMPLETE_COLUMN = 7;
export const BONUS_ALL_OF_COLOR = 10;
