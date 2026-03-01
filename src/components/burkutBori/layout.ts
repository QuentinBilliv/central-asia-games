import { cellToGridPosition } from '@/game-logic/burkutBori/board';
import { GRID_ROWS, GRID_COLS, BOARD_SIZE } from '@/game-logic/burkutBori/constants';

export const PADDING = 40;
export const CELL_SIZE = 46;
export const BOARD_W = GRID_COLS * CELL_SIZE;
export const BOARD_H = GRID_ROWS * CELL_SIZE;
export const SVG_W = BOARD_W + PADDING * 2;
export const SVG_H = BOARD_H + PADDING * 2;

export const STEP_DELAY_MS = 280;
export const EAGLE_WOLF_PAUSE_MS = 600;

/**
 * Convert grid row/col to SVG pixel coordinates (center of cell).
 * Row 0 is the BOTTOM row visually, row 9 is the TOP.
 */
export function gridToPixel(row: number, col: number): { x: number; y: number } {
  return {
    x: PADDING + col * CELL_SIZE + CELL_SIZE / 2,
    y: PADDING + (GRID_ROWS - 1 - row) * CELL_SIZE + CELL_SIZE / 2,
  };
}

export function cellToPixel(cell: number): { x: number; y: number } {
  const { row, col } = cellToGridPosition(cell);
  return gridToPixel(row, col);
}

export function computeMovePath(from: number, diceValue: number): number[] {
  const path: number[] = [];
  const rawTarget = from + diceValue;

  if (rawTarget <= BOARD_SIZE) {
    for (let i = from + 1; i <= rawTarget; i++) path.push(i);
  } else {
    for (let i = from + 1; i <= BOARD_SIZE; i++) path.push(i);
    const bounceTarget = BOARD_SIZE - (rawTarget - BOARD_SIZE);
    for (let i = BOARD_SIZE - 1; i >= bounceTarget; i--) path.push(i);
  }

  return path;
}
