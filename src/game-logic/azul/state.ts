import { Player, AzulGameState, AzulPlayerBoard, AzulTileColor, AzulFactory } from '../types';
import { TILE_COLORS, TILES_PER_COLOR, TILES_PER_FACTORY, FACTORIES_BY_PLAYERS, PATTERN_LINE_SIZES } from './constants';

function createBag(): AzulTileColor[] {
  const bag: AzulTileColor[] = [];
  for (const color of TILE_COLORS) {
    for (let i = 0; i < TILES_PER_COLOR; i++) {
      bag.push(color);
    }
  }
  // Shuffle
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

function createPlayerBoard(playerId: string): AzulPlayerBoard {
  return {
    playerId,
    patternLines: PATTERN_LINE_SIZES.map((size) => ({
      color: null,
      count: 0,
      maxCount: size,
    })),
    wall: Array.from({ length: 5 }, () => Array(5).fill(null)),
    floorLine: [],
    score: 0,
  };
}

export function createFactories(bag: AzulTileColor[], numFactories: number): { factories: AzulFactory[]; remainingBag: AzulTileColor[] } {
  const factories: AzulFactory[] = [];
  let remaining = [...bag];

  for (let i = 0; i < numFactories; i++) {
    const tiles = remaining.splice(0, TILES_PER_FACTORY);
    factories.push({ id: i, tiles });
  }

  return { factories, remainingBag: remaining };
}

export function createInitialState(players: Player[]): AzulGameState {
  const bag = createBag();
  const numFactories = FACTORIES_BY_PLAYERS[players.length] || 5;
  const { factories, remainingBag } = createFactories(bag, numFactories);

  return {
    type: 'azul',
    factories,
    center: [],
    hasFirstPlayerToken: true,
    firstPlayerNextRound: null,
    playerBoards: players.map((p) => createPlayerBoard(p.id)),
    bag: remainingBag,
    discard: [],
    currentPlayerIndex: 0,
    round: 1,
    phase: 'picking',
    turnOrder: players.map((p) => p.id),
    winner: null,
  };
}
