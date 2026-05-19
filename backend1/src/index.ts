import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import app from './app';
import { GameManager } from './GameManager';

const PORT = process.env.PORT || 3000;

/**
 * Express app & WebSockets are bound to a single HTTP Server instance.
 * This simplifies deployment on Cloud providers (like Render or Fly.io) 
 * by bypassing multi-port routing restrictions.
 */
const server = createServer(app);

/**
 * Instantiate WebSocketServer on top of our existing HTTP server.
 * The 'ws' library automatically listens for HTTP 'Upgrade' requests (WSS handshake).
 */
const wss = new WebSocketServer({ server });
const gameManager = new GameManager();

wss.on('connection', (ws) => {
  // Delegate socket management and routing to the global GameManager
  gameManager.addUser(ws);
  
  // Clean up references when client session disconnects
  ws.on('close', () => gameManager.removeUser(ws));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (HTTP + WebSocket)`);
});
