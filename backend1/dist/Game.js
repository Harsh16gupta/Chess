"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const ws_1 = require("ws");
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * The Game class controls an active match between two players.
 * It manages the chess board state machine (via chess.js), handles move validation,
 * synchronizes player timers, and handles live in-game chat messaging.
 */
class Game {
    constructor(player1, player2, name1, name2, initialTimeMs = 5 * 60 * 1000 // Defaults to standard Blitz: 5 minutes per player
    ) {
        this.ended = false; // Flag to prevent duplicate game-over triggers or moves after game ends
        this.timer = null; // Active background timeout for resolving flag falls (timeouts)
        this.player1 = player1;
        this.player2 = player2;
        this.name1 = name1;
        this.name2 = name2;
        this.board = new chess_js_1.Chess();
        this.lastMoveTime = Date.now();
        this.timeLeft = { white: initialTimeMs, black: initialTimeMs };
        // Broadcast the INIT_GAME handshake payloads independently to both clients.
        // This establishes their piece colors and sets their opponents.
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
        // Start active background tracking for White's first turn
        this.startActiveTimer();
    }
    // --- Public API ---
    /**
     * Commits a chess move if validation checks succeed.
     * Ensures the socket matches the player whose turn it is, validates moves for legality,
     * performs clock time deduction, updates the board representation, and triggers match end
     * if victory or draw conditions are met.
     */
    makeMove(socket, move) {
        // If the game has already concluded, ignore any subsequent incoming moves
        if (this.ended)
            return;
        // Clear active timeout checker as a move is currently being processed
        this.clearActiveTimer();
        const holderOfWhite = this.player1;
        const holderOfBlack = this.player2;
        const turnBeforeMove = this.board.turn() === "w" ? "white" : "black";
        // 1. Strict Turn Enforcement
        // Verify that the socket proposing the move belongs to the active turn player.
        const expectedSocket = turnBeforeMove === "white" ? holderOfWhite : holderOfBlack;
        if (socket !== expectedSocket) {
            this.safeSend(socket, {
                type: messages_1.MOVE,
                payload: { ok: false, reason: "not_your_turn" },
            });
            // Resume the active timer for the current turn player
            this.startActiveTimer();
            return;
        }
        // 2. Legality Verification
        // Retrieve list of all mathematically legal chess moves in the current position.
        const legalMoves = this.board.moves({ verbose: true });
        const isLegal = legalMoves.some((m) => m.from === move.from && m.to === move.to);
        if (!isLegal) {
            this.safeSend(socket, {
                type: messages_1.MOVE,
                payload: { ok: false, reason: "illegal_move", move },
            });
            // Resume the active timer for the current turn player
            this.startActiveTimer();
            return;
        }
        // 3. Passive Chess Clock Math
        // Note: The backend tracks player clocks passively to minimize active CPU execution.
        // When a move is completed, the duration since the last move is calculated and deducted.
        const now = Date.now();
        const elapsed = now - this.lastMoveTime;
        this.timeLeft[turnBeforeMove] -= elapsed;
        this.lastMoveTime = now;
        // Verify whether the moving player's clock fell below 0 BEFORE committing this move.
        // If a timeout occurred, they forfeit the match immediately.
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
        // 4. State Update
        // Commit the legal move to the chess.js state engine.
        this.board.move(move);
        // Prepare state update payload and broadcast to both players.
        const moveMessage = {
            type: messages_1.MOVE,
            payload: {
                ok: true,
                move,
                board: this.board.fen(), // Send board representation in FEN notation
                turn: this.board.turn() === "w" ? "white" : "black",
                timeLeft: this.timeLeft,
                players: { white: this.name1, black: this.name2 },
            },
        };
        this.sendToBoth(moveMessage);
        // 5. Game Termination Audits
        // A. Checkmate Resolution
        if (this.board.isCheckmate()) {
            // The side to move AFTER the current move is checkmated and loses.
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
        // B. Draw Resolution
        // Covers: Stalemate, Insufficient Material (e.g. King vs King), Threefold Repetition, 50-move rule
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
        // Move committed successfully. Begin active clock tracking for the next turn player.
        this.startActiveTimer();
    }
    /**
     * Broadcasts sanitized and length-limited real-time chat messages to both clients.
     */
    sendChatMessage(senderSocket, text) {
        if (this.ended)
            return;
        const senderName = senderSocket === this.player1 ? this.name1 : this.name2;
        // Basic sanitization: trim leading/trailing whitespace and truncate at 1000 characters
        const trimmed = typeof text === "string" ? text.trim().slice(0, 1000) : "";
        const message = {
            type: messages_1.CHAT_MESSAGE,
            payload: { sender: senderName, text: trimmed },
        };
        this.sendToBoth(message);
    }
    // --- Helpers ---
    /**
     * Ends the match session, locks the ended state to prevent double execution,
     * and broadcasts the final result metrics to both players.
     */
    endGame(payload) {
        var _a;
        if (this.ended)
            return;
        this.ended = true;
        // Halt active timer loops to prevent dangling background intervals/timeouts
        this.clearActiveTimer();
        // Persist the match records asynchronously to PostgreSQL and update player Elo ratings
        this.persistGameAndElo(payload.result, payload.winner);
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
    /**
     * Helper to write payloads to both players' WebSocket streams.
     */
    sendToBoth(payload) {
        this.safeSend(this.player1, payload);
        this.safeSend(this.player2, payload);
    }
    // --- Active Clock Schedulers ---
    /**
     * Computes remaining turn time and schedules a single precise timeout for clock expiry.
     * This provides exact active timeout resolution without expensive periodic high-frequency polling.
     */
    startActiveTimer() {
        this.clearActiveTimer();
        if (this.ended)
            return;
        const turn = this.board.turn() === "w" ? "white" : "black";
        const timeLeft = this.timeLeft[turn];
        // Schedule timeout execution at the precise millisecond the player's clock drops to zero.
        // Plus a micro 150ms buffer to compensate for TCP transmission delay/jitters.
        this.timer = setTimeout(() => {
            this.handleTimeout();
        }, timeLeft + 150);
    }
    /**
     * Resets active timeout handles safely.
     */
    clearActiveTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
    /**
     * Executed when the allocated time limit runs out. Recalculates elapsed times
     * and triggers the flag fall (loss by timeout) if the clock truly fell below zero.
     */
    handleTimeout() {
        if (this.ended)
            return;
        const turn = this.board.turn() === "w" ? "white" : "black";
        const now = Date.now();
        const elapsed = now - this.lastMoveTime;
        this.timeLeft[turn] = Math.max(0, this.timeLeft[turn] - elapsed);
        this.lastMoveTime = now;
        if (this.timeLeft[turn] <= 0) {
            const winner = turn === "white" ? "black" : "white";
            const winnerName = winner === "white" ? this.name1 : this.name2;
            this.endGame({
                result: "timeout",
                winner,
                winnerName,
                reason: `${turn}_flag_fall`,
            });
        }
        else {
            // If latency / CPU drift left time on the clock, reschedule the remainder
            this.startActiveTimer();
        }
    }
    /**
     * Safe socket transmitter which swallows connection-drop faults silently
     * to guarantee server thread stability.
     */
    safeSend(ws, payload) {
        try {
            if (ws.readyState === ws_1.WebSocket.OPEN) {
                ws.send(JSON.stringify(payload));
            }
        }
        catch (err) {
            // Swallowed: network transport issues do not deserve runtime crash overhead
        }
    }
    /**
     * Resolves registered users, calculates and saves updated Elo ratings,
     * and persists game logs in PostgreSQL via Prisma.
     */
    persistGameAndElo(result, winnerColor) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                // Query profile records from PostgreSQL.
                // In matchmaking, registered users pass their email as their initial name payload.
                const whiteUser = yield prisma.user.findUnique({ where: { Email: this.name1 } });
                const blackUser = yield prisma.user.findUnique({ where: { Email: this.name2 } });
                const whiteRating = (_a = whiteUser === null || whiteUser === void 0 ? void 0 : whiteUser.Rating) !== null && _a !== void 0 ? _a : 1200;
                const blackRating = (_b = blackUser === null || blackUser === void 0 ? void 0 : blackUser.Rating) !== null && _b !== void 0 ? _b : 1200;
                let scoreWhite = 0.5; // Draw
                if (winnerColor === "white")
                    scoreWhite = 1;
                if (winnerColor === "black")
                    scoreWhite = 0;
                // Compute standard FIDE Elo delta
                const expectedWhite = 1 / (1 + Math.pow(10, (blackRating - whiteRating) / 400));
                const expectedBlack = 1 / (1 + Math.pow(10, (whiteRating - blackRating) / 400));
                const scoreBlack = 1 - scoreWhite;
                const kFactor = 32;
                const newWhiteRating = Math.round(whiteRating + kFactor * (scoreWhite - expectedWhite));
                const newBlackRating = Math.round(blackRating + kFactor * (scoreBlack - expectedBlack));
                let winnerId = null;
                if (winnerColor === "white" && whiteUser)
                    winnerId = whiteUser.id;
                if (winnerColor === "black" && blackUser)
                    winnerId = blackUser.id;
                // Extract space-separated SAN moves array
                const pgn = this.board.history().join(" ");
                // 1. Persist the game history log
                yield prisma.game.create({
                    data: {
                        whitePlayerId: whiteUser ? whiteUser.id : null,
                        blackPlayerId: blackUser ? blackUser.id : null,
                        winnerId,
                        result,
                        pgn,
                    },
                });
                // 2. Persist updated Elo ratings for registered profiles
                if (whiteUser) {
                    yield prisma.user.update({
                        where: { id: whiteUser.id },
                        data: { Rating: newWhiteRating },
                    });
                }
                if (blackUser) {
                    yield prisma.user.update({
                        where: { id: blackUser.id },
                        data: { Rating: newBlackRating },
                    });
                }
            }
            catch (err) {
                console.error("Failed to persist game history or process Elo updates:", err);
            }
        });
    }
}
exports.Game = Game;
