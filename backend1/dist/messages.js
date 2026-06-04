"use strict";
// ── WebSocket Message Types ─────────────────────────────────────────
// These string constants are the "type" field in every WS message.
// Both the frontend and backend use matching constants for routing.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR = exports.GAME_STATE = exports.RECONNECT = exports.DRAW_RESPONSE = exports.OFFER_DRAW = exports.RESIGN = exports.CHAT_MESSAGE = exports.GAME_OVER = exports.MOVE = exports.INIT_GAME = void 0;
// Core game lifecycle
exports.INIT_GAME = "init_game";
exports.MOVE = "move";
exports.GAME_OVER = "game_over";
// In-game communication
exports.CHAT_MESSAGE = "chat_message";
// Player actions
exports.RESIGN = "resign";
exports.OFFER_DRAW = "offer_draw";
exports.DRAW_RESPONSE = "draw_response";
// Reconnection — when a player refreshes or drops connection mid-game
exports.RECONNECT = "reconnect";
exports.GAME_STATE = "game_state";
// Server → client error messages
exports.ERROR = "error";
