import { GRID_COLS, EAGLE_MAP, WOLF_MAP } from './constants';

/**
 * Convert cell number (1-100) to grid row/col (0-indexed).
 * Boustrophedon: row 0 is bottom, even rows go left→right, odd rows right→left.
 */
export function cellToGridPosition(cell: number): { row: number; col: number } {
  const idx = cell - 1; // 0-based
  const row = Math.floor(idx / GRID_COLS);
  const colInRow = idx % GRID_COLS;
  // Even rows (0,2,4,...) go left→right; odd rows go right→left
  const col = row % 2 === 0 ? colInRow : GRID_COLS - 1 - colInRow;
  return { row, col };
}

export interface CellResolution {
  finalCell: number;
  hitEagle: boolean;
  hitWolf: boolean;
}

/**
 * Resolve a cell: check if it's an eagle base or wolf head.
 */
export function resolveCell(cell: number): CellResolution {
  if (EAGLE_MAP[cell] !== undefined) {
    return { finalCell: EAGLE_MAP[cell], hitEagle: true, hitWolf: false };
  }
  if (WOLF_MAP[cell] !== undefined) {
    return { finalCell: WOLF_MAP[cell], hitEagle: false, hitWolf: true };
  }
  return { finalCell: cell, hitEagle: false, hitWolf: false };
}
