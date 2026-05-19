"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const ws_1 = require("ws");
const messages_1 = require("./messages");
const Game_1 = require("./Game");
/**
 * GameManager handles matchmaking queues, maps active WebSocket connections to active game sessions,
 * and handles multiplexing incoming real-time socket actions (moves, chats, matchmaking).
 */
class GameManager {
    constructor() {
        this.games = new Set();
        this.socketToGame = new Map();
        this.pendingUser = null;
    }
    /**
     * Register a newly opened socket connection and bind its message listeners
     */
    addUser(socket) {
        this.addHandler(socket);
    }
    /**
     * Bind event listeners for real-time WebSocket protocol events.
     * Incoming messages are decoded from JSON and matched against pre-defined route keys.
     */
    addHandler(socket) {
        socket.on("message", (data) => {
            let message;
            try {
                message = JSON.parse(data.toString());
            }
            catch (_a) {
                // Prevent crashes on malformed payload inputs
                return;
            }
            switch (message.type) {
                case messages_1.INIT_GAME:
                    this.handleInitGame(socket, message.payload.name || "Unknown");
                    break;
                case messages_1.MOVE:
                    this.handleMove(socket, message.payload.move);
                    break;
                case messages_1.CHAT_MESSAGE:
                    this.handleChat(socket, message.payload.text);
                    break;
            }
        });
        socket.on("close", () => {
            this.removeUser(socket);
        });
    }
    /**
     * Handles user matchmaking request (INIT_GAME).
     * FIFO matchmaking implementation: if a pending user exists, pair them immediately and launch a game.
     * Otherwise, push the requester into the pending slot.
     */
    handleInitGame(socket, name) {
        const newUser = { socket, name };
        // Prevent double-matching if a player is already engaged in an active game
        if (this.socketToGame.has(socket))
            return;
        if (this.pendingUser) {
            // Create and initialize a new Game state machine
            const game = new Game_1.Game(this.pendingUser.socket, newUser.socket, this.pendingUser.name, newUser.name);
            // Save game index pointers in memory
            this.games.add(game);
            this.socketToGame.set(this.pendingUser.socket, game);
            this.socketToGame.set(newUser.socket, game);
            // Clear the matchmaking queue
            this.pendingUser = null;
        }
        else {
            // Put player in waiting queue
            this.pendingUser = newUser;
        }
    }
    /**
     * Direct a user's move attempt to their active game instance
     */
    handleMove(socket, move) {
        const game = this.socketToGame.get(socket);
        if (game) {
            game.makeMove(socket, move);
        }
    }
    /**
     * Route real-time in-game chat messages
     */
    handleChat(socket, text) {
        const game = this.socketToGame.get(socket);
        if (game) {
            game.sendChatMessage(socket, text);
        }
    }
    /**
     * Clean up memory records, socket mappings, and notify active opponents
     * when a player unexpectedly leaves or closes their socket session.
     */
    removeUser(leavingSocket) {
        var _a;
        // If the leaving user was currently waiting in matchmaking queue
        if (((_a = this.pendingUser) === null || _a === void 0 ? void 0 : _a.socket) === leavingSocket) {
            this.pendingUser = null;
            return;
        }
        // If they were actively playing, terminate the game and alert opponent
        const game = this.socketToGame.get(leavingSocket);
        if (game) {
            const opponentSocket = game.player1 === leavingSocket ? game.player2 : game.player1;
            this.safeSend(opponentSocket, { type: "opponent_left" });
            // Free up references for Garbage Collector to clean up game object
            this.socketToGame.delete(leavingSocket);
            this.socketToGame.delete(opponentSocket);
            this.games.delete(game);
        }
    }
    /**
     * Send JSON-serialized packets over WebSockets with safety checks
     * against closed connection errors.
     */
    safeSend(ws, payload) {
        try {
            if (ws.readyState === ws_1.WebSocket.OPEN) {
                ws.send(JSON.stringify(payload));
            }
        }
        catch (_a) {
            // Fail silently to prevent crashing from network drops mid-transit
        }
    }
}
exports.GameManager = GameManager;
