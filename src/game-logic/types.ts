// Shared types for all games

export const GAME_TYPES = ['azul', 'petitsChevaux', 'burkutBori', 'memory', 'toguzKorgool'] as const;
export type GameType = (typeof GAME_TYPES)[number];
export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface Player {
  id: string;
  nickname: string;
  connected: boolean;
  index: number; // 0-3, determines color
}

export interface Room {
  id: string;
  gameType: GameType;
  players: Player[];
  hostId: string;
  status: GameStatus;
  gameState: AzulGameState | PetitsChevauxGameState | BurkutBoriGameState | MemoryGameState | ToguzKorgoolGameState | null;
  gameConfig?: MemoryGameConfig;
  createdAt: number;
  lastActivity: number;
  maxPlayers: number;
}

// ===== Azul Types =====

export type AzulTileColor = 'lapis' | 'gold' | 'terracotta' | 'obsidian' | 'turquoise';

export interface AzulFactory {
  id: number;
  tiles: AzulTileColor[];
}

export interface AzulPatternLine {
  color: AzulTileColor | null;
  count: number;
  maxCount: number; // 1-5 for rows 0-4
}

// wall[row][col] = tile color or null
export type AzulWall = (AzulTileColor | null)[][];

export interface AzulPlayerBoard {
  playerId: string;
  patternLines: AzulPatternLine[]; // 5 rows
  wall: AzulWall; // 5x5
  floorLine: AzulTileColor[]; // penalty tiles
  hasFirstPlayerTokenPenalty: boolean; // took first-player token this round
  score: number;
}

export interface AzulGameState {
  type: 'azul';
  factories: AzulFactory[];
  center: AzulTileColor[]; // tiles in center
  hasFirstPlayerToken: boolean; // is first-player token still in center?
  firstPlayerNextRound: string | null; // player who took first-player token
  playerBoards: AzulPlayerBoard[];
  bag: AzulTileColor[]; // remaining tiles
  discard: AzulTileColor[]; // discarded tiles
  currentPlayerIndex: number;
  round: number;
  phase: 'picking' | 'wallTiling'; // picking tiles or wall tiling phase
  turnOrder: string[]; // player IDs in turn order
  winner: string | null;
  gameOver: boolean;
}

export interface AzulMove {
  type: 'pick';
  sourceType: 'factory' | 'center';
  sourceId: number; // factory ID or -1 for center
  color: AzulTileColor;
  patternLineIndex: number; // 0-4, or -1 for floor line
}

// ===== Petits Chevaux Types =====

export type HorseStatus = 'stable' | 'board' | 'home';

export interface Horse {
  id: number; // 0-3 per player
  playerIndex: number;
  status: HorseStatus;
  boardPosition: number; // 0-39 on the main board, -1 if in stable
  homePosition: number; // 0-3 in home stretch, -1 if not home
}

export interface PetitsChevauxPlayerState {
  playerId: string;
  playerIndex: number;
  horses: Horse[];
  horsesHome: number;
}

export interface PetitsChevauxGameState {
  type: 'petitsChevaux';
  players: PetitsChevauxPlayerState[];
  currentPlayerIndex: number;
  diceValue: number | null;
  mustRoll: boolean; // true if player needs to roll
  extraTurn: boolean; // true if player rolled 6
  turnOrder: string[]; // player IDs in turn order
  winner: string | null;
  lastRolls: Record<string, number>; // playerId → last dice value rolled
}

export interface PetitsChevauxMove {
  type: 'roll' | 'moveHorse';
  horseId?: number; // which horse to move (for moveHorse)
}

// ===== Bürküt & Böri (Eagles & Wolves) Types =====

export interface BurkutBoriPlayer {
  playerId: string;
  playerIndex: number;
  position: number; // 0 = off-board, 1-100 on board
}

export interface BurkutBoriLastMove {
  playerId: string;
  diceValue: number;
  from: number;
  to: number;
  intermediatePosition: number | null; // cell before eagle/wolf redirect
  hitEagle: boolean;
  hitWolf: boolean;
}

export interface BurkutBoriGameState {
  type: 'burkutBori';
  players: BurkutBoriPlayer[];
  currentPlayerIndex: number;
  turnOrder: string[];
  winner: string | null;
  lastMove: BurkutBoriLastMove | null;
}

export interface BurkutBoriMove {
  type: 'roll';
}

// ===== Memory Types =====

export interface MemoryGameConfig {
  rows: number;
  cols: number;
}

export interface MemoryCard {
  index: number;
  pairId: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
}

export interface MemoryPlayerState {
  playerId: string;
  pairsFound: number;
}

export interface MemoryGameState {
  type: 'memory';
  cards: MemoryCard[];
  rows: number;
  cols: number;
  players: MemoryPlayerState[];
  currentPlayerIndex: number;
  turnOrder: string[];
  firstFlippedIndex: number | null;
  pendingReset: [number, number] | null;
  winner: string | null;
  gameOver: boolean;
}

export interface MemoryMove {
  type: 'flip';
  cardIndex: number;
}

// ===== Toguz Korgool Types =====

export interface ToguzKorgoolPlayerState {
  playerId: string;
  playerIndex: number; // 0 or 1
  pits: number[]; // 9 pits, each with stone count
  kazan: number; // captured stones (scoring pit)
  tpieces: number; // alias — same as kazan, kept for clarity
  tuz: number | null; // index (0-8) of opponent's pit claimed as tuz, or null
}

export interface ToguzKorgoolGameState {
  type: 'toguzKorgool';
  players: ToguzKorgoolPlayerState[];
  currentPlayerIndex: number;
  turnOrder: string[]; // exactly 2 player IDs
  winner: string | null;
  isDraw: boolean;
}

export interface ToguzKorgoolMove {
  type: 'sow';
  pitIndex: number; // 0-8, which pit to pick up and sow from
}
