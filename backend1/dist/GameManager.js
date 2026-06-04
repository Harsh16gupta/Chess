"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const ws_1 = require("ws");
const messages_1 = require("./messages");
const Game_1 = require("./Game");
class GameManager {
    constructor() {
        this.games = new Set();
        this.socketToGame = new Map();
        this.socketToUser = new Map();
        this.pendingUser = null;
    }
    addUser(socket, userMeta) {
        const name = userMeta ? userMeta.email : `Guest${Math.floor(1000 + Math.random() * 9000)}`;
        this.socketToUser.set(socket, { userId: userMeta === null || userMeta === void 0 ? void 0 : userMeta.userId, name });
        this.addHandler(socket);
    }
    addHandler(socket) {
        socket.on("message", (data) => {
            let message;
            try {
                message = JSON.parse(data.toString());
            }
            catch (_a) {
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
    /*
     * MATCHMAKING PIPELINE:
     * - Uses a simple 1-element FIFO queue (pendingUser).
     * - If a client calls 'init_game':
     *   - If a player is already in queue (this.pendingUser), we immediately match them
     *     and construct a new Game session, mapping both socket connections to the game.
     *   - If the queue is empty, the player is cached as `this.pendingUser`.
     * - Limitation: Does not check ELO boundaries or queue timeouts; matching is purely sequential.
     */
    handleInitGame(socket, name) {
        const userMeta = this.socketToUser.get(socket);
        // Prioritize the server-resolved identity over client-supplied payload parameters
        const resolvedName = userMeta ? userMeta.name : name || "Unknown";
        const newUser = { socket, name: resolvedName };
        // If already in a game, ignore
        if (this.socketToGame.has(socket))
            return;
        if (this.pendingUser) {
            // Start new game
            const game = new Game_1.Game(this.pendingUser.socket, newUser.socket, this.pendingUser.name, newUser.name);
            this.games.add(game);
            this.socketToGame.set(this.pendingUser.socket, game);
            this.socketToGame.set(newUser.socket, game);
            // Clear pending
            this.pendingUser = null;
        }
        else {
            this.pendingUser = newUser;
        }
    }
    handleMove(socket, move) {
        const game = this.socketToGame.get(socket);
        if (game) {
            game.makeMove(socket, move);
        }
    }
    handleChat(socket, text) {
        const game = this.socketToGame.get(socket);
        if (game) {
            game.sendChatMessage(socket, text);
        }
    }
    removeUser(leavingSocket) {
        var _a;
        // Remove user mapping to clean up memory
        this.socketToUser.delete(leavingSocket);
        // If they were waiting to be matched
        if (((_a = this.pendingUser) === null || _a === void 0 ? void 0 : _a.socket) === leavingSocket) {
            this.pendingUser = null;
            return;
        }
        // If they were in a game
        const game = this.socketToGame.get(leavingSocket);
        if (game) {
            const opponentSocket = game.player1 === leavingSocket ? game.player2 : game.player1;
            this.safeSend(opponentSocket, { type: "opponent_left" });
            // Cleanup game mappings
            this.socketToGame.delete(leavingSocket);
            this.socketToGame.delete(opponentSocket);
            this.games.delete(game);
        }
    }
    safeSend(ws, payload) {
        try {
            if (ws.readyState === ws_1.WebSocket.OPEN) {
                ws.send(JSON.stringify(payload));
            }
        }
        catch (_a) {
            // ignore send errors
        }
    }
}
exports.GameManager = GameManager;
