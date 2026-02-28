import { z } from 'zod';

// Client -> Server events
export const JoinRoomSchema = z.object({
  roomId: z.string().min(1),
  playerId: z.string().min(1),
  nickname: z.string().min(1).max(20),
  gameType: z.enum(['azul', 'petitsChevaux']).optional(),
});

export const LeaveRoomSchema = z.object({
  roomId: z.string().min(1),
  playerId: z.string().min(1),
});

export const StartGameSchema = z.object({
  roomId: z.string().min(1),
  playerId: z.string().min(1),
});

export const GameMoveSchema = z.object({
  roomId: z.string().min(1),
  playerId: z.string().min(1),
  move: z.any(), // Validated per-game
});

export const RestartGameSchema = z.object({
  roomId: z.string().min(1),
  playerId: z.string().min(1),
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
