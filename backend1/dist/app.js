"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const coach_route_1 = __importDefault(require("./routes/coach.route"));
const game_route_1 = __importDefault(require("./routes/game.route"));
const errorhandler_1 = require("./middlewares/errorhandler");
const env_1 = require("./utils/env");
const app = (0, express_1.default)();
// ── Security headers ────────────────────────────────────────────────
app.use((0, helmet_1.default)());
// ── JSON body parser with size limit ────────────────────────────────
app.use(express_1.default.json({ limit: '1mb' }));
// ── CORS ────────────────────────────────────────────────────────────
// Origin is configurable via env so we don't hardcode localhost.
app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGIN,
    credentials: true,
}));
// ── Routes ──────────────────────────────────────────────────────────
app.use('/api/auth', auth_route_1.default);
app.use('/api/coach', coach_route_1.default);
app.use('/api/games', game_route_1.default);
// ── Health check ────────────────────────────────────────────────────
// Used by load balancers, uptime monitors, and deployment checks.
app.get('/health', (_req, res) => {
    var _a, _b;
    // We import gameManager lazily to avoid circular deps.
    // (index.ts imports app.ts, and app.ts can't import index.ts)
    let activeGames = 0;
    try {
        const { gameManager } = require('./index');
        activeGames = (_b = (_a = gameManager === null || gameManager === void 0 ? void 0 : gameManager.getActiveGameCount) === null || _a === void 0 ? void 0 : _a.call(gameManager)) !== null && _b !== void 0 ? _b : 0;
    }
    catch (_c) {
        // Server might not be fully started yet.
    }
    res.json({
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        activeGames,
    });
});
// ── Fallback ────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.send('Chess.in API'));
// ── Global error handler — always last ──────────────────────────────
app.use(errorhandler_1.errorHandler);
exports.default = app;
