import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import app from './app';
import { GameManager } from './GameManager';

const PORT = process.env.PORT || 3000;

// Create a single HTTP server for both Express and WebSocket
const server = createServer(app);

// Attach WebSocket to the same server (upgrades on ws:// connections)
const wss = new WebSocketServer({ server });
const gameManager = new GameManager();

wss.on('connection', (ws) => {
  gameManager.addUser(ws);
  ws.on('close', () => gameManager.removeUser(ws));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (HTTP + WebSocket)`);
});
