"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const http_1 = require("http");
const ws_1 = require("ws");
const app_1 = __importDefault(require("./app"));
const GameManager_1 = require("./GameManager");
const PORT = process.env.PORT || 3000;
/**
 * Express app & WebSockets are bound to a single HTTP Server instance.
 * This simplifies deployment on Cloud providers (like Render or Fly.io)
 * by bypassing multi-port routing restrictions.
 */
const server = (0, http_1.createServer)(app_1.default);
/**
 * Instantiate WebSocketServer on top of our existing HTTP server.
 * The 'ws' library automatically listens for HTTP 'Upgrade' requests (WSS handshake).
 */
const wss = new ws_1.WebSocketServer({ server });
const gameManager = new GameManager_1.GameManager();
wss.on('connection', (ws) => {
    // Delegate socket management and routing to the global GameManager
    gameManager.addUser(ws);
    // Clean up references when client session disconnects
    ws.on('close', () => gameManager.removeUser(ws));
});
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (HTTP + WebSocket)`);
});
