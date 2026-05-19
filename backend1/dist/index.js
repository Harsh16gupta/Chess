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
// Create a single HTTP server for both Express and WebSocket
const server = (0, http_1.createServer)(app_1.default);
// Attach WebSocket to the same server (upgrades on ws:// connections)
const wss = new ws_1.WebSocketServer({ server });
const gameManager = new GameManager_1.GameManager();
wss.on('connection', (ws) => {
    gameManager.addUser(ws);
    ws.on('close', () => gameManager.removeUser(ws));
});
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (HTTP + WebSocket)`);
});
