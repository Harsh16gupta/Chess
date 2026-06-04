import { Request, Response, NextFunction } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Endpoint to analyze the current chess board position using the Gemini API.
 * POST /api/coach/analyze
 * 
 * Body: { fen: string, pgn?: string }
 */
export const analyzePosition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fen, pgn } = req.body;

    if (!fen) {
      res.status(400).json({ error: "Missing FEN string in request body." });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Friendly fallback if the developer hasn't configured the key yet
      res.json({
        analysis: "👋 Welcome! Live AI Coaching is currently running in preview mode. To activate the full Grandmaster commentary, please set your GEMINI_API_KEY in backend1/.env.\n\nFrom the current board state, make sure to keep your pieces defended, control the center squares, and prioritize king safety!"
      });
      return;
    }

    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Using gemini-2.5-flash for fast, responsive natural language generation
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Craft a highly contextual prompt for the chess coach
    const prompt = `You are Garry, a friendly and experienced Grandmaster chess coach. 
Analyze the current board state and give advice.

Current Board state (FEN): ${fen}
Game History (PGN): ${pgn || "No moves played yet."}

Please provide:
1. A quick strategic evaluation of the current position (who is better, key threats, pawn structure).
2. Practical advice: warn the player about any vulnerabilities (like pins, forks, undefended pieces) or validate their last move.
3. Strategic ideas: point them in the right direction (e.g., "try to control the d-file", "develop your bishop") without giving the exact coordinate move (like 'e2e4'), unless it's a critical tactical forced sequence.

Keep your response encouraging, clear, and around 2 to 3 concise paragraphs. Do not use markdown headers (like # or ##), but you can use bolding or bullet points where appropriate. Avoid any robotic AI-like meta-comments.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      analysis: text || "Garry is scratching his head and couldn't think of anything. Try asking again on your next move!"
    });
  } catch (error) {
    console.error("Gemini API error during chess analysis:", error);
    // Send a standard error response rather than crashing
    res.status(500).json({ 
      error: "Failed to communicate with the Chess Coach API. Make sure your key is active and try again." 
    });
  }
};
