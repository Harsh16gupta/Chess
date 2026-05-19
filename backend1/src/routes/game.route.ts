import { Router } from "express";
import { getGameHistory } from "../controllers/game.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

// Retrieve match history for authenticated players
router.get("/history", requireAuth, getGameHistory);

export default router;
