import express from 'express';
import cors from 'cors';
import router from './routes/auth.route';
import { errorHandler } from './middlewares/errorhandler'; // ✅ check filename case too!

const app = express();

// ✅ Use JSON parser first
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, // if you're using cookies/auth headers
}));

// ✅ Then your routes
app.use('/api/auth', router);

// ✅ Then your fallback route (optional)
app.get('/', (req, res) => res.send('Hello from Express + TypeScript'));

// ✅ Finally the error handler — always last!
app.use(errorHandler);

export default app;
