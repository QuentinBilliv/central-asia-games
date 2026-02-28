import { AzulPlayerBoard, AzulWall } from '../types';
import { WALL_PATTERN, FLOOR_PENALTIES, BONUS_COMPLETE_ROW, BONUS_COMPLETE_COLUMN, BONUS_ALL_OF_COLOR, TILE_COLORS } from './constants';

/**
 * Score a single tile placement on the wall.
 * Points = sum of connected tiles horizontally + vertically (including the placed tile).
 * If isolated, scores 1 point.
 */
export function scoreTilePlacement(wall: AzulWall, row: number, col: number): number {
  let points = 0;
  let horizontalCount = 0;
  let verticalCount = 0;

  // Count horizontal connections
  // Left
  for (let c = col - 1; c >= 0 && wall[row][c] !== null; c--) {
    horizontalCount++;
  }
  // Right
  for (let c = col + 1; c < 5 && wall[row][c] !== null; c++) {
    horizontalCount++;
  }

  // Count vertical connections
  // Up
  for (let r = row - 1; r >= 0 && wall[r][col] !== null; r--) {
    verticalCount++;
  }
  // Down
  for (let r = row + 1; r < 5 && wall[r][col] !== null; r++) {
    verticalCount++;
  }

  if (horizontalCount > 0) {
    points += horizontalCount + 1; // +1 for the placed tile
  }
  if (verticalCount > 0) {
    points += verticalCount + 1; // +1 for the placed tile
  }
  if (horizontalCount === 0 && verticalCount === 0) {
    points = 1; // Isolated tile
  }

  return points;
}

/**
 * Calculate floor line penalty.
 */
export function calculateFloorPenalty(floorLineCount: number): number {
  let penalty = 0;
  for (let i = 0; i < Math.min(floorLineCount, FLOOR_PENALTIES.length); i++) {
    penalty += FLOOR_PENALTIES[i];
  }
  return penalty;
}

/**
 * Calculate end-of-game bonuses.
 */
export function calculateEndGameBonuses(wall: AzulWall): number {
  let bonus = 0;

  // Complete rows
  for (let row = 0; row < 5; row++) {
    if (wall[row].every((tile) => tile !== null)) {
      bonus += BONUS_COMPLETE_ROW;
    }
  }

  // Complete columns
  for (let col = 0; col < 5; col++) {
    if (wall.every((row) => row[col] !== null)) {
      bonus += BONUS_COMPLETE_COLUMN;
    }
  }

  // All 5 of one color
  for (const color of TILE_COLORS) {
    let count = 0;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (wall[row][col] === color) count++;
      }
    }
    if (count === 5) {
      bonus += BONUS_ALL_OF_COLOR;
    }
  }

  return bonus;
}

/**
 * Check if the game is over (any player has a complete row).
 */
export function isGameOver(playerBoards: AzulPlayerBoard[]): boolean {
  return playerBoards.some((board) =>
    board.wall.some((row) => row.every((tile) => tile !== null))
  );
}

/**
 * Find the column where a color goes on a specific row of the wall.
 */
export function getWallColumn(row: number, color: string): number {
  return WALL_PATTERN[row].indexOf(color as any);
}
