import { BOARD_SIZE, HOME_STRETCH_LENGTH } from '@/game-logic/petitsChevaux/constants';

export const BOARD_CX = 250;
export const BOARD_CY = 250;
export const TRACK_RADIUS = 185;

export function getBoardPosition(index: number): { x: number; y: number } {
  const angle = (index / BOARD_SIZE) * Math.PI * 2 - Math.PI / 2;
  return {
    x: BOARD_CX + Math.cos(angle) * TRACK_RADIUS,
    y: BOARD_CY + Math.sin(angle) * TRACK_RADIUS,
  };
}

export function getStablePosition(playerIndex: number, horseId: number): { x: number; y: number } {
  const corners = [
    { x: 78, y: 78 },
    { x: 422, y: 78 },
    { x: 422, y: 422 },
    { x: 78, y: 422 },
  ];
  const base = corners[playerIndex];
  const offsets = [
    { x: -18, y: -18 },
    { x: 18, y: -18 },
    { x: -18, y: 18 },
    { x: 18, y: 18 },
  ];
  return { x: base.x + offsets[horseId].x, y: base.y + offsets[horseId].y };
}

export function getHomePosition(playerIndex: number, homePos: number): { x: number; y: number } {
  const directions = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
  ];
  const startDist = 135;
  const step = 28;
  const dir = directions[playerIndex];
  return {
    x: BOARD_CX + dir.dx * (startDist - homePos * step),
    y: BOARD_CY + dir.dy * (startDist - homePos * step),
  };
}

export const STABLE_CORNERS = [
  { x: 78, y: 78 },
  { x: 422, y: 78 },
  { x: 422, y: 422 },
  { x: 78, y: 422 },
];
