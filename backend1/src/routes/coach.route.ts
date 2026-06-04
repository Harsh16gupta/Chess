import { Router } from "express";
import { analyzePosition } from "../controllers/coach.controller";

const router = Router();

router.post("/analyze", analyzePosition);

export default router;
