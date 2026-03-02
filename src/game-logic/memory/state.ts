import { Player, MemoryGameState, MemoryGameConfig, MemoryCard } from '../types';
import { MIN_GRID_SIZE, MAX_GRID_SIZE, DEFAULT_ROWS, DEFAULT_COLS, CARD_SYMBOLS } from './constants';
import { secureRandomInt } from '../random';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createInitialState(
  players: Player[],
  config?: MemoryGameConfig
): MemoryGameState {
  // Coerce to integer and clamp to valid range (defense in depth)
  let rows = Math.floor(Number(config?.rows) || DEFAULT_ROWS);
  let cols = Math.floor(Number(config?.cols) || DEFAULT_COLS);

  rows = clamp(rows, MIN_GRID_SIZE, MAX_GRID_SIZE);
  cols = clamp(cols, MIN_GRID_SIZE, MAX_GRID_SIZE);

  // Ensure total is even
  const total = rows * cols;
  if (total % 2 !== 0) {
    cols = cols - 1 < MIN_GRID_SIZE ? cols + 1 : cols - 1;
  }

  const numPairs = (rows * cols) / 2;
  const symbols = shuffleArray(CARD_SYMBOLS).slice(0, numPairs);

  const cardData: { pairId: number; symbol: string }[] = [];
  for (let i = 0; i < numPairs; i++) {
    cardData.push({ pairId: i, symbol: symbols[i] });
    cardData.push({ pairId: i, symbol: symbols[i] });
  }

  const shuffled = shuffleArray(cardData);
  const cards: MemoryCard[] = shuffled.map((c, idx) => ({
    index: idx,
    pairId: c.pairId,
    symbol: c.symbol,
    flipped: false,
    matched: false,
  }));

  const turnOrder = players.map((p) => p.id);

  return {
    type: 'memory',
    cards,
    rows,
    cols: (rows * cols) / rows, // recalculate in case cols was adjusted
    players: players.map((p) => ({ playerId: p.id, pairsFound: 0 })),
    currentPlayerIndex: 0,
    turnOrder,
    firstFlippedIndex: null,
    pendingReset: null,
    winner: null,
    gameOver: false,
  };
}
