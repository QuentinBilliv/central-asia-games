import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { setupSocketHandlers } from './src/server/socketHandlers';
import { RoomManager } from './src/server/rooms';

const port = parseInt(process.env.PORT || '3001', 10);

const ALLOWED_ORIGINS: string[] = [
  'http://localhost:3000',
  'https://steppegames.vercel.app',
  'https://central-asia-games-production.up.railway.app',
];
if (process.env.FRONTEND_URL) {
  ALLOWED_ORIGINS.push(process.env.FRONTEND_URL);
}

const expressApp = express();
const httpServer = createServer(expressApp);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 30000,
  pingInterval: 10000,
});

const roomManager = new RoomManager();

setupSocketHandlers(io, roomManager);

// Cleanup expired rooms every 5 minutes
setInterval(() => {
  roomManager.cleanupExpired();
}, 5 * 60 * 1000);

// Health check endpoint
expressApp.get('/health', (_req, res) => {
  res.json({ status: 'ok', rooms: roomManager.getRoomCount?.() ?? 'n/a' });
});

httpServer.listen(port, () => {
  console.log(`> Socket.IO server ready on port ${port}`);
});
