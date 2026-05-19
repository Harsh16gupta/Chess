"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const game_route_1 = __importDefault(require("./routes/game.route"));
const errorhandler_1 = require("./middlewares/errorhandler");
const app = (0, express_1.default)();
// ─── MIDDLEWARE SETUP ─────────────────────────────────────────
// Parse incoming requests with JSON payloads first, making req.body available.
app.use(express_1.default.json());
// Configure Cross-Origin Resource Sharing (CORS)
// In production, configure CORS_ORIGIN to restrict access to trusted clients.
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true, // Allow cookies and Auth headers across domains
}));
// ─── API ROUTES ───────────────────────────────────────────────
app.use('/api/auth', auth_route_1.default);
app.use('/api/games', game_route_1.default);
// Static health check endpoint to verify HTTP layer availability
app.get('/', (req, res) => res.send('Hello from Express + TypeScript'));
// ─── ERROR HANDLING ───────────────────────────────────────────
// Centralized error handler MUST be registered last in the Express stack
// to catch all downstream sync/async exceptions.
app.use(errorhandler_1.errorHandler);
exports.default = app;
