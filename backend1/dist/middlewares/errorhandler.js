"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
// ── Global Error Handler ────────────────────────────────────────────
// Catches any unhandled errors from route handlers.
// In production: returns a generic message (no stack traces leaked).
// In development: logs the full error for debugging.
const isDev = process.env.NODE_ENV !== 'production';
const errorHandler = (err, req, res, _next) => {
    logger_1.default.error({ err, path: req.path, method: req.method }, 'unhandled error');
    res.status(err.status || 500).json({
        error: isDev ? err.message : 'Internal Server Error',
    });
};
exports.errorHandler = errorHandler;
