import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import router from './routes/auth.route';
import coachRouter from './routes/coach.route';
import gameRouter from './routes/game.route';
import { errorHandler } from './middlewares/errorhandler';
import { env } from './utils/env';

const app = express();

// ── Security headers ────────────────────────────────────────────────
app.use(helmet());

// ── JSON body parser with size limit ────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── CORS ────────────────────────────────────────────────────────────
// Origin is configurable via env so we don't hardcode localhost.
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));

// ── Routes ──────────────────────────────────────────────────────────
app.use('/api/auth', router);
app.use('/api/coach', coachRouter);
app.use('/api/games', gameRouter);

// ── Health check ────────────────────────────────────────────────────
// Used by load balancers, uptime monitors, and deployment checks.
app.get('/health', (_req, res) => {
  // We import gameManager lazily to avoid circular deps.
  // (index.ts imports app.ts, and app.ts can't import index.ts)
  let activeGames = 0;
  try {
    const { gameManager } = require('./index');
    activeGames = gameManager?.getActiveGameCount?.() ?? 0;
  } catch {
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
app.use(errorHandler);

export default app;
