import { Server as SocketIOServer, Socket } from 'socket.io';
import { RoomManager } from './rooms';
import {
  CLIENT_EVENTS,
  SERVER_EVENTS,
  JoinRoomSchema,
  LeaveRoomSchema,
  StartGameSchema,
  GameMoveSchema,
  RestartGameSchema,
} from '../socket/events';
import { handleAzulMove, initAzulGame } from './azulHandler';
import { handlePetitsChevauxMove, initPetitsChevauxGame } from './petitsChevauxHandler';
import { Room } from '../game-logic/types';

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

export function setupSocketHandlers(io: SocketIOServer, roomManager: RoomManager) {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on(CLIENT_EVENTS.JOIN_ROOM, (data: unknown) => {
      const parsed = JoinRoomSchema.safeParse(data);
      if (!parsed.success) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Invalid join data' });
        return;
      }

      const { roomId, playerId, nickname, gameType } = parsed.data;
      let room = roomManager.get(roomId);

      // Auto-create room if it doesn't exist (first player joining)
      if (!room) {
        const type = gameType || 'petitsChevaux';
        room = roomManager.create(roomId, type, playerId);
      }

      if (room.status === 'playing') {
        // Allow reconnection
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

      // Check nickname uniqueness in room
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

      socket.join(roomId);
      (socket as any).roomId = roomId;
      (socket as any).playerId = playerId;

      // Send full room state to the joining player
      socket.emit(SERVER_EVENTS.ROOM_STATE, sanitizeRoomForClient(updatedRoom));

      // If game in progress, send game state to reconnecting player
      if (updatedRoom.status === 'playing' && updatedRoom.gameState) {
        socket.emit(SERVER_EVENTS.GAME_STATE_UPDATE, updatedRoom.gameState);
      }

      // Notify others
      socket.to(roomId).emit(SERVER_EVENTS.PLAYER_JOINED, {
        player: updatedRoom.players.find((p) => p.id === playerId),
        players: updatedRoom.players,
      });
    });

    socket.on(CLIENT_EVENTS.LEAVE_ROOM, (data: unknown) => {
      const parsed = LeaveRoomSchema.safeParse(data);
      if (!parsed.success) return;

      const { roomId, playerId } = parsed.data;
      handlePlayerLeave(io, socket, roomManager, roomId, playerId);
    });

    socket.on(CLIENT_EVENTS.START_GAME, (data: unknown) => {
      const parsed = StartGameSchema.safeParse(data);
      if (!parsed.success) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Invalid start data' });
        return;
      }

      const { roomId, playerId } = parsed.data;
      const room = roomManager.get(roomId);

      if (!room) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Room not found' });
        return;
      }

      if (room.hostId !== playerId) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Only the host can start' });
        return;
      }

      if (room.players.length < 2) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Need at least 2 players' });
        return;
      }

      // Initialize game state
      const playerIds = room.players.map((p) => p.id);
      let gameState;

      if (room.gameType === 'azul') {
        gameState = initAzulGame(room.players);
      } else {
        gameState = initPetitsChevauxGame(room.players);
      }

      roomManager.setGameState(roomId, gameState);
      roomManager.setStatus(roomId, 'playing');

      io.to(roomId).emit(SERVER_EVENTS.GAME_STARTED, {
        gameState,
        players: room.players,
      });
    });

    socket.on(CLIENT_EVENTS.GAME_MOVE, (data: unknown) => {
      const parsed = GameMoveSchema.safeParse(data);
      if (!parsed.success) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Invalid move data' });
        return;
      }

      const { roomId, playerId, move } = parsed.data;
      const room = roomManager.get(roomId);

      if (!room || room.status !== 'playing' || !room.gameState) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'No active game' });
        return;
      }

      let result;
      if (room.gameType === 'azul') {
        result = handleAzulMove(room.gameState as any, playerId, move);
      } else {
        result = handlePetitsChevauxMove(room.gameState as any, playerId, move);
      }

      if (!result.valid) {
        socket.emit(SERVER_EVENTS.ERROR, { message: result.error || 'Invalid move' });
        return;
      }

      roomManager.setGameState(roomId, result.state);

      io.to(roomId).emit(SERVER_EVENTS.GAME_STATE_UPDATE, result.state);

      if (result.state.winner) {
        roomManager.setStatus(roomId, 'finished');
        const winnerPlayer = room.players.find((p) => p.id === result.state.winner);
        io.to(roomId).emit(SERVER_EVENTS.GAME_OVER, {
          winner: winnerPlayer,
          gameState: result.state,
        });
      }
    });

    socket.on(CLIENT_EVENTS.RESTART_GAME, (data: unknown) => {
      const parsed = RestartGameSchema.safeParse(data);
      if (!parsed.success) return;

      const { roomId, playerId } = parsed.data;
      const room = roomManager.get(roomId);

      if (!room) return;
      if (room.hostId !== playerId) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Only the host can restart' });
        return;
      }

      let gameState;
      if (room.gameType === 'azul') {
        gameState = initAzulGame(room.players);
      } else {
        gameState = initPetitsChevauxGame(room.players);
      }

      roomManager.setGameState(roomId, gameState);
      roomManager.setStatus(roomId, 'playing');

      io.to(roomId).emit(SERVER_EVENTS.GAME_STARTED, {
        gameState,
        players: room.players,
      });
    });

    socket.on('disconnect', () => {
      const roomId = (socket as any).roomId;
      const playerId = (socket as any).playerId;
      if (roomId && playerId) {
        handlePlayerLeave(io, socket, roomManager, roomId, playerId);
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
  }
}
