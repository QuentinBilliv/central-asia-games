import { z } from 'zod';
import { GAME_TYPES } from '../game-logic/types';

// --- Strict move schemas per game ---

const AzulTileColorSchema = z.enum(['lapis', 'gold', 'terracotta', 'obsidian', 'turquoise']);

export const AzulMoveSchema = z.object({
  type: z.literal('pick'),
  sourceType: z.enum(['factory', 'center']),
  sourceId: z.number().int(),
  color: AzulTileColorSchema,
  patternLineIndex: z.number().int().min(-1).max(4), // -1 = floor, 0-4 = pattern lines
});

export const PetitsChevauxMoveSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('roll') }),
  z.object({ type: z.literal('moveHorse'), horseId: z.number().int().min(0).max(3) }),
]);

// Client -> Server events
export const JoinRoomSchema = z.object({
  roomId: z.string().min(1).max(20),
  playerId: z.string().min(1).max(50),
  nickname: z.string().min(1).max(20),
  gameType: z.enum(GAME_TYPES).optional(),
});

export const LeaveRoomSchema = z.object({
  roomId: z.string().min(1).max(20),
  playerId: z.string().min(1).max(50),
});

export const StartGameSchema = z.object({
  roomId: z.string().min(1).max(20),
  playerId: z.string().min(1).max(50),
});

export const GameMoveSchema = z.object({
  roomId: z.string().min(1).max(20),
  playerId: z.string().min(1).max(50),
  move: z.any(), // Fine validation done per-game by handler on server
});

export const RestartGameSchema = z.object({
  roomId: z.string().min(1).max(20),
  playerId: z.string().min(1).max(50),
});

// Event names
export const CLIENT_EVENTS = {
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  START_GAME: 'start-game',
  GAME_MOVE: 'game-move',
  RESTART_GAME: 'restart-game',
} as const;

export const SERVER_EVENTS = {
  ROOM_STATE: 'room-state',
  PLAYER_JOINED: 'player-joined',
  PLAYER_LEFT: 'player-left',
  GAME_STARTED: 'game-started',
  GAME_STATE_UPDATE: 'game-state-update',
  GAME_OVER: 'game-over',
  ERROR: 'error',
} as const;

export type JoinRoomPayload = z.infer<typeof JoinRoomSchema>;
export type LeaveRoomPayload = z.infer<typeof LeaveRoomSchema>;
export type StartGamePayload = z.infer<typeof StartGameSchema>;
export type GameMovePayload = z.infer<typeof GameMoveSchema>;
export type RestartGamePayload = z.infer<typeof RestartGameSchema>;
