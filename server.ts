import express from 'express';
import { createServer } from 'http';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { setupSocketHandlers } from './src/server/socketHandlers';
import { RoomManager } from './src/server/rooms';

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);

const ALLOWED_ORIGINS: string[] = [
  'http://localhost:3000',
  'https://steppegames.vercel.app',
];
if (process.env.FRONTEND_URL) {
  ALLOWED_ORIGINS.push(process.env.FRONTEND_URL);
}

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
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

  // Let Next.js handle all other routes
  expressApp.all('*', (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(port, () => {
    console.log(`> Server ready on http://localhost:${port}`);
    console.log(`> Mode: ${dev ? 'development' : 'production'}`);
  });
});
