"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameManager = void 0;
const http_1 = require("http");
const url_1 = __importDefault(require("url"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ws_1 = require("ws");
const app_1 = __importDefault(require("./app"));
const GameManager_1 = require("./GameManager");
const prisma_1 = __importDefault(require("./utils/prisma"));
const env_1 = require("./utils/env");
const logger_1 = __importStar(require("./utils/logger"));
// ══════════════════════════════════════════════════════════════════════
//  Server Setup
//  Both Express (HTTP) and WebSocket share a single HTTP server.
//  This means one port for everything — simpler in production
//  behind a reverse proxy (nginx, CloudFlare, etc).
// ══════════════════════════════════════════════════════════════════════
const server = (0, http_1.createServer)(app_1.default);
const wss = new ws_1.WebSocketServer({ server, path: "/ws" });
const gameManager = new GameManager_1.GameManager();
exports.gameManager = gameManager;
// ══════════════════════════════════════════════════════════════════════
//  WebSocket Connection Handler
//  Every connection MUST have a valid JWT token.
//  No guest play — unauthenticated connections are rejected.
// ══════════════════════════════════════════════════════════════════════
wss.on("connection", (ws, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedUrl = url_1.default.parse(req.url || "", true);
        const token = parsedUrl.query.token;
        // No token = no connection. Close with code 4001.
        if (!token) {
            ws.close(4001, "Authentication required");
            return;
        }
        // Verify the JWT and look up the user in the database.
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        const user = yield prisma_1.default.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            ws.close(4001, "User not found");
            return;
        }
        // Hand the authenticated socket to the GameManager.
        gameManager.addUser(ws, {
            userId: user.id,
            name: user.Email,
        });
    }
    catch (err) {
        // JWT expired, malformed, or DB error — reject the connection.
        logger_1.wsLog.warn({ err }, "WS auth failed");
        ws.close(4001, "Unauthorized: Invalid or expired token");
    }
}));
// ══════════════════════════════════════════════════════════════════════
//  Start Server
// ══════════════════════════════════════════════════════════════════════
server.listen(env_1.env.PORT, () => {
    logger_1.default.info(`Server running on http://localhost:${env_1.env.PORT}`);
    logger_1.default.info(`WebSocket available at ws://localhost:${env_1.env.PORT}/ws`);
});
// ══════════════════════════════════════════════════════════════════════
//  Graceful Shutdown
//  On SIGTERM/SIGINT (e.g. docker stop, Ctrl+C):
//  1. Stop accepting new connections
//  2. Let GameManager clean up active games
//  3. Disconnect from DB
//  4. Exit
// ══════════════════════════════════════════════════════════════════════
function gracefulShutdown(signal) {
    logger_1.default.info(`${signal} received — shutting down gracefully`);
    // Stop GameManager heartbeat and timers.
    gameManager.shutdown();
    // Close WebSocket server (stops accepting new connections).
    wss.close(() => {
        logger_1.wsLog.info("WebSocket server closed");
    });
    // Close HTTP server.
    server.close(() => __awaiter(this, void 0, void 0, function* () {
        logger_1.default.info("HTTP server closed");
        // Disconnect from database.
        yield prisma_1.default.$disconnect();
        logger_1.default.info("Database disconnected — goodbye");
        process.exit(0);
    }));
    // Force exit after 10 seconds if something hangs.
    setTimeout(() => {
        logger_1.default.error("Forced shutdown after timeout");
        process.exit(1);
    }, 10000);
}
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
