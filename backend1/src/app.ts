import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.route';
import gameRouter from './routes/game.route';
import { errorHandler } from './middlewares/errorhandler'; 

const app = express();

// ─── MIDDLEWARE SETUP ─────────────────────────────────────────
// Parse incoming requests with JSON payloads first, making req.body available.
app.use(express.json());

// Configure Cross-Origin Resource Sharing (CORS)
// In production, configure CORS_ORIGIN to restrict access to trusted clients.
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true, // Allow cookies and Auth headers across domains
}));

// ─── API ROUTES ───────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/games', gameRouter);

// Static health check endpoint to verify HTTP layer availability
app.get('/', (req, res) => res.send('Hello from Express + TypeScript'));

// ─── ERROR HANDLING ───────────────────────────────────────────
// Centralized error handler MUST be registered last in the Express stack
// to catch all downstream sync/async exceptions.
app.use(errorHandler);

export default app;
