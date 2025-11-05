"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const ws_1 = require("ws");
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
class Game {
    constructor(player1, player2, name1, name2, initialTimeMs = 5 * 60 * 1000 // default 5 minutes
    ) {
        this.ended = false;
        this.player1 = player1;
        this.player2 = player2;
        this.name1 = name1;
        this.name2 = name2;
        this.board = new chess_js_1.Chess();
        this.lastMoveTime = Date.now();
        this.timeLeft = { white: initialTimeMs, black: initialTimeMs };
        // init messages (each player needs their own payload)
        this.safeSend(this.player1, {
            type: messages_1.INIT_GAME,
            payload: {
                color: "white",
                name: this.name1,
                opponent: this.name2,
                timeLeft: this.timeLeft.white,
            },
        });
        this.safeSend(this.player2, {
            type: messages_1.INIT_GAME,
            payload: {
                color: "black",
                name: this.name2,
                opponent: this.name1,
                timeLeft: this.timeLeft.black,
            },
        });
    }
    // --- Public API ---
    makeMove(socket, move) {
        if (this.ended)
            return;
        // verify who's making the move matches current player (optional but recommended)
        const holderOfWhite = this.player1;
        const holderOfBlack = this.player2;
        const turnBeforeMove = this.board.turn() === "w" ? "white" : "black";
        // verify socket belongs to the player whose turn it is
        const expectedSocket = turnBeforeMove === "white" ? holderOfWhite : holderOfBlack;
        if (socket !== expectedSocket) {
            this.safeSend(socket, {
                type: messages_1.MOVE,
                payload: { ok: false, reason: "not_your_turn" },
            });
            return;
        }
        const legalMoves = this.board.moves({ verbose: true });
        const isLegal = legalMoves.some((m) => m.from === move.from && m.to === move.to);
        if (!isLegal) {
            this.safeSend(socket, {
                type: messages_1.MOVE,
                payload: { ok: false, reason: "illegal_move", move },
            });
            return;
        }
        const now = Date.now();
        const elapsed = now - this.lastMoveTime;
        // Subtract elapsed time from the player who just moved (turnBeforeMove).
        // Example: if turnBeforeMove === 'white', white is about to move and will be the one using elapsed time.
        this.timeLeft[turnBeforeMove] -= elapsed;
        this.lastMoveTime = now;
        // If the player ran out of time BEFORE making this move, treat as timeout (they lost).
        if (this.timeLeft[turnBeforeMove] <= 0) {
            const winner = turnBeforeMove === "white" ? "black" : "white";
            const winnerName = winner === "white" ? this.name1 : this.name2;
            this.endGame({
                result: "timeout",
                winner,
                winnerName,
                reason: `${turnBeforeMove}_flag_fall`,
            });
            return;
        }
        // Make the move on the board
        this.board.move(move);
        // Prepare and broadcast move message
        const moveMessage = {
            type: messages_1.MOVE,
            payload: {
                ok: true,
                move,
                board: this.board.fen(),
                turn: this.board.turn() === "w" ? "white" : "black",
                timeLeft: this.timeLeft,
                players: { white: this.name1, black: this.name2 },
            },
        };
        this.sendToBoth(moveMessage);
        // After move, check chess-end conditions
        if (this.board.isCheckmate()) {
            // The side to move after the move lost (the side that was put in checkmate)
            const loser = this.board.turn() === "w" ? "white" : "black";
            const winner = loser === "white" ? "black" : "white";
            const winnerName = winner === "white" ? this.name1 : this.name2;
            this.endGame({
                result: "checkmate",
                winner,
                winnerName,
            });
            return;
        }
        // Draw conditions: stalemate, insufficient material, threefold repetition, or generic draw
        if (this.board.isStalemate() ||
            this.board.isInsufficientMaterial() ||
            this.board.isThreefoldRepetition() ||
            this.board.isDraw()) {
            this.endGame({
                result: "draw",
                winner: null,
                winnerName: null,
            });
            return;
        }
        // Note: clocks continue from lastMoveTime; next player's clock will be reduced on their next move or if you implement a periodic checker.
    }
    sendChatMessage(senderSocket, text) {
        if (this.ended)
            return;
        const senderName = senderSocket === this.player1 ? this.name1 : this.name2;
        // Basic sanitization: trim and limit length
        const trimmed = typeof text === "string" ? text.trim().slice(0, 1000) : "";
        const message = {
            type: messages_1.CHAT_MESSAGE,
            payload: { sender: senderName, text: trimmed },
        };
        this.sendToBoth(message);
    }
    // --- Helpers ---
    endGame(payload) {
        var _a;
        if (this.ended)
            return;
        this.ended = true;
        const gameOverMessage = {
            type: messages_1.GAME_OVER,
            payload: {
                result: payload.result,
                winner: payload.winner,
                winnerName: payload.winnerName,
                reason: (_a = payload.reason) !== null && _a !== void 0 ? _a : null,
                players: { white: this.name1, black: this.name2 },
                board: this.board.fen(),
                timeLeft: this.timeLeft,
            },
        };
        this.sendToBoth(gameOverMessage);
    }
    sendToBoth(payload) {
        this.safeSend(this.player1, payload);
        this.safeSend(this.player2, payload);
    }
    safeSend(ws, payload) {
        try {
            // WebSocket.OPEN === 1 in 'ws'
            if (ws.readyState === ws_1.WebSocket.OPEN) {
                ws.send(JSON.stringify(payload));
            }
        }
        catch (err) {
            // swallow send errors; optionally log
            // console.warn("send failed", err);
        }
    }
}
exports.Game = Game;
