import { Room, Player, GameType, GameStatus } from '../game-logic/types';

const ROOM_EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  create(roomId: string, gameType: GameType, hostId: string): Room {
    const room: Room = {
      id: roomId,
      gameType,
      players: [],
      hostId,
      status: 'waiting',
      gameState: null,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      maxPlayers: gameType === 'toguzKorgool' ? 2 : 4,
    };
    this.rooms.set(roomId, room);
    return room;
  }

  get(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  addPlayer(roomId: string, player: Player): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (room.players.length >= room.maxPlayers) return null;

    // Check if player is reconnecting
    const existing = room.players.find((p) => p.id === player.id);
    if (existing) {
      existing.connected = true;
      existing.nickname = player.nickname;
    } else {
      // Assign next available index
      const usedIndices = new Set(room.players.map((p) => p.index));
      let nextIndex = 0;
      while (usedIndices.has(nextIndex)) nextIndex++;
      player.index = nextIndex;
      room.players.push(player);
    }

    room.lastActivity = Date.now();
    return room;
  }

  removePlayer(roomId: string, playerId: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (room.status === 'playing') {
      // Mark as disconnected during game
      const player = room.players.find((p) => p.id === playerId);
      if (player) player.connected = false;
    } else {
      room.players = room.players.filter((p) => p.id !== playerId);

      // If host left and there are players, reassign host
      if (room.hostId === playerId && room.players.length > 0) {
        room.hostId = room.players[0].id;
      }
    }

    // Clean up empty rooms
    if (room.players.length === 0 || room.players.every((p) => !p.connected)) {
      this.rooms.delete(roomId);
      return null;
    }

    room.lastActivity = Date.now();
    return room;
  }

  setGameState(roomId: string, state: any): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.gameState = state;
      room.lastActivity = Date.now();
    }
  }

  setStatus(roomId: string, status: GameStatus): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.status = status;
      room.lastActivity = Date.now();
    }
  }

  cleanupExpired(): number {
    const now = Date.now();
    let cleaned = 0;
    for (const [id, room] of this.rooms) {
      if (now - room.lastActivity > ROOM_EXPIRY_MS) {
        this.rooms.delete(id);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired rooms. Active: ${this.rooms.size}`);
    }
    return cleaned;
  }

  getRoomCount(): number {
    return this.rooms.size;
  }
}
