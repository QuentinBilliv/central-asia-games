import { Server as SocketIOServer, Socket } from 'socket.io';
import { RoomManager } from './rooms';
import {
  CLIENT_EVENTS,
  SERVER_EVENTS,
  JoinRoomSchema,
  GameMoveSchema,
} from '../socket/events';
import { gameHandlers } from './gameHandlers';
import { Room } from '../game-logic/types';

// ─── Authenticated socket helpers ───

interface AuthenticatedSocketData {
  roomId: string;
  playerId: string;
}

function setSocketIdentity(socket: Socket, roomId: string, playerId: string) {
  (socket as any)._auth = { roomId, playerId } as AuthenticatedSocketData;
}

function getSocketIdentity(socket: Socket): AuthenticatedSocketData | null {
  return (socket as any)._auth ?? null;
}

// ─── Rate limiting ───

const RATE_LIMIT_WINDOW_MS = 2000;
const RATE_LIMIT_MAX = 10;

const rateLimits = new WeakMap<Socket, { count: number; windowStart: number }>();

function isRateLimited(socket: Socket): boolean {
  const now = Date.now();
  let rl = rateLimits.get(socket);
  if (!rl || now - rl.windowStart > RATE_LIMIT_WINDOW_MS) {
    rl = { count: 1, windowStart: now };
    rateLimits.set(socket, rl);
    return false;
  }
  rl.count++;
  return rl.count > RATE_LIMIT_MAX;
}

function sanitizeRoomForClient(room: Room) {
  return {
    id: room.id,
    gameType: room.gameType,
    players: room.players,
    hostId: room.hostId,
    status: room.status,
    maxPlayers: room.maxPlayers,
  };
}

// ─── Socket handlers ───

export function setupSocketHandlers(io: SocketIOServer, roomManager: RoomManager) {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // ─── JOIN ROOM ───
    // This is the ONLY event where we trust client-supplied playerId/roomId.
    // After joining, the identity is bound to the socket.
    socket.on(CLIENT_EVENTS.JOIN_ROOM, (data: unknown) => {
      const parsed = JoinRoomSchema.safeParse(data);
      if (!parsed.success) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Invalid join data' });
        return;
      }

      const { roomId, playerId, nickname, gameType } = parsed.data;
      let room = roomManager.get(roomId);

      // Auto-create room if it doesn't exist
      if (!room) {
        const type = gameType || 'petitsChevaux';
        room = roomManager.create(roomId, type, playerId);
      }

      if (room.status === 'playing') {
        const existingPlayer = room.players.find((p) => p.id === playerId);
        if (!existingPlayer) {
          socket.emit(SERVER_EVENTS.ERROR, { message: 'Game already in progress' });
          return;
        }
      }

      if (room.players.length >= room.maxPlayers && !room.players.find((p) => p.id === playerId)) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Room is full' });
        return;
      }

      // Check nickname uniqueness
      const nickTaken = room.players.find(
        (p) => p.nickname.toLowerCase() === nickname.toLowerCase() && p.id !== playerId
      );
      if (nickTaken) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Nickname already taken' });
        return;
      }

      const updatedRoom = roomManager.addPlayer(roomId, {
        id: playerId,
        nickname,
        connected: true,
        index: 0,
      });

      if (!updatedRoom) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Could not join room' });
        return;
      }

      // Bind identity to socket — all subsequent events use this, not client payloads
      socket.join(roomId);
      setSocketIdentity(socket, roomId, playerId);

      socket.emit(SERVER_EVENTS.ROOM_STATE, sanitizeRoomForClient(updatedRoom));

      if (updatedRoom.status === 'playing' && updatedRoom.gameState) {
        const handler = gameHandlers[updatedRoom.gameType];
        socket.emit(SERVER_EVENTS.GAME_STATE_UPDATE,
          handler.sanitizeState(updatedRoom.gameState));
      }

      socket.to(roomId).emit(SERVER_EVENTS.PLAYER_JOINED, {
        player: updatedRoom.players.find((p) => p.id === playerId),
        players: updatedRoom.players,
      });
    });

    // ─── LEAVE ROOM ───
    // Uses socket-bound identity — client cannot force-disconnect other players
    socket.on(CLIENT_EVENTS.LEAVE_ROOM, () => {
      const auth = getSocketIdentity(socket);
      if (!auth) return;

      handlePlayerLeave(io, socket, roomManager, auth.roomId, auth.playerId);
    });

    // ─── START GAME ───
    // Uses socket-bound identity — only the real host can start
    socket.on(CLIENT_EVENTS.START_GAME, () => {
      const auth = getSocketIdentity(socket);
      if (!auth) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Not in a room' });
        return;
      }

      const room = roomManager.get(auth.roomId);
      if (!room) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Room not found' });
        return;
      }

      if (room.hostId !== auth.playerId) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Only the host can start' });
        return;
      }

      if (room.players.length < 2) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Need at least 2 players' });
        return;
      }

      const handler = gameHandlers[room.gameType];
      const gameState = handler.createInitialState(room.players);

      roomManager.setGameState(auth.roomId, gameState);
      roomManager.setStatus(auth.roomId, 'playing');

      io.to(auth.roomId).emit(SERVER_EVENTS.GAME_STARTED, {
        gameState: handler.sanitizeState(gameState),
        players: room.players,
      });
    });

    // ─── GAME MOVE ───
    // Uses socket-bound identity — player can only act as themselves, in their own room
    socket.on(CLIENT_EVENTS.GAME_MOVE, (data: unknown) => {
      if (isRateLimited(socket)) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Too many requests' });
        return;
      }

      const auth = getSocketIdentity(socket);
      if (!auth) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Not in a room' });
        return;
      }

      const parsed = GameMoveSchema.safeParse(data);
      if (!parsed.success) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Invalid move data' });
        return;
      }

      // Use socket-bound roomId and playerId, ignore anything from payload
      const room = roomManager.get(auth.roomId);
      if (!room || room.status !== 'playing' || !room.gameState) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'No active game' });
        return;
      }

      const { move } = parsed.data;
      const handler = gameHandlers[room.gameType];

      const moveParsed = handler.moveSchema.safeParse(move);
      if (!moveParsed.success) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Invalid move format' });
        return;
      }

      const result = handler.validateAndApplyMove(room.gameState, auth.playerId, moveParsed.data);

      if (!result.valid) {
        socket.emit(SERVER_EVENTS.ERROR, { message: result.error || 'Invalid move' });
        return;
      }

      roomManager.setGameState(auth.roomId, result.state);
      io.to(auth.roomId).emit(SERVER_EVENTS.GAME_STATE_UPDATE,
        handler.sanitizeState(result.state));

      if (handler.isGameOver(result.state)) {
        roomManager.setStatus(auth.roomId, 'finished');
        const winnerPlayer = result.state.winner
          ? room.players.find((p) => p.id === result.state.winner)
          : null;
        io.to(auth.roomId).emit(SERVER_EVENTS.GAME_OVER, {
          winner: winnerPlayer,
          gameState: handler.sanitizeState(result.state),
        });
      }
    });

    // ─── RESTART GAME ───
    // Uses socket-bound identity — only the real host can restart
    socket.on(CLIENT_EVENTS.RESTART_GAME, () => {
      const auth = getSocketIdentity(socket);
      if (!auth) return;

      const room = roomManager.get(auth.roomId);
      if (!room) return;

      if (room.hostId !== auth.playerId) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Only the host can restart' });
        return;
      }

      const handler = gameHandlers[room.gameType];
      const gameState = handler.createInitialState(room.players);

      roomManager.setGameState(auth.roomId, gameState);
      roomManager.setStatus(auth.roomId, 'playing');

      io.to(auth.roomId).emit(SERVER_EVENTS.GAME_STARTED, {
        gameState: handler.sanitizeState(gameState),
        players: room.players,
      });
    });

    // ─── DISCONNECT ───
    socket.on('disconnect', () => {
      const auth = getSocketIdentity(socket);
      if (auth) {
        handlePlayerLeave(io, socket, roomManager, auth.roomId, auth.playerId);
      }
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

function handlePlayerLeave(
  io: SocketIOServer,
  socket: Socket,
  roomManager: RoomManager,
  roomId: string,
  playerId: string
) {
  const room = roomManager.removePlayer(roomId, playerId);
  socket.leave(roomId);

  if (room) {
    io.to(roomId).emit(SERVER_EVENTS.PLAYER_LEFT, {
      playerId,
      players: room.players,
      hostId: room.hostId,
    });

    // Auto-play for disconnected player if it's their turn
    if (room.status === 'playing' && room.gameState) {
      autoPlayForDisconnected(io, roomManager, roomId);
    }
  }
}

/**
 * When a disconnected player's turn comes up, auto-play a bot move on their
 * behalf so the game isn't stuck. Loops to handle extra turns (e.g. rolling 6).
 */
function autoPlayForDisconnected(
  io: SocketIOServer,
  roomManager: RoomManager,
  roomId: string
) {
  const MAX_AUTO_PLAYS = 10; // Safety limit to prevent infinite loops
  let autoPlays = 0;

  const tick = () => {
    if (autoPlays >= MAX_AUTO_PLAYS) return;

    const room = roomManager.get(roomId);
    if (!room || !room.gameState || room.status !== 'playing') return;

    const handler = gameHandlers[room.gameType];
    if (handler.isGameOver(room.gameState)) return;

    const currentPlayerId = room.gameState.turnOrder[room.gameState.currentPlayerIndex];
    const currentPlayer = room.players.find((p) => p.id === currentPlayerId);

    // Only auto-play if the current player is disconnected
    if (!currentPlayer || currentPlayer.connected) return;

    const move = handler.pickBotMove(room.gameState, currentPlayerId);

    if (!move) return;

    const result = handler.validateAndApplyMove(room.gameState, currentPlayerId, move);
    if (!result.valid) return;

    roomManager.setGameState(roomId, result.state);
    io.to(roomId).emit(
      SERVER_EVENTS.GAME_STATE_UPDATE,
      handler.sanitizeState(result.state)
    );

    if (handler.isGameOver(result.state)) {
      roomManager.setStatus(roomId, 'finished');
      const winnerPlayer = result.state.winner
        ? room.players.find((p) => p.id === result.state.winner)
        : null;
      io.to(roomId).emit(SERVER_EVENTS.GAME_OVER, {
        winner: winnerPlayer,
        gameState: handler.sanitizeState(result.state),
      });
      return;
    }

    autoPlays++;
    // Delay next auto-play so clients can see the moves
    setTimeout(tick, 1500);
  };

  // Start after a short delay to let the disconnect event propagate
  setTimeout(tick, 2000);
}
