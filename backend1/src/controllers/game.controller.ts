import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

const prisma = new PrismaClient();

/**
 * Controller to retrieve complete historical matches for the authenticated profile.
 * Fetches games played as White or Black, resolving opponent identities and Elo ratings.
 */
export const getGameHistory = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    const games = await prisma.game.findMany({
      where: {
        OR: [
          { whitePlayerId: userId },
          { blackPlayerId: userId }
        ]
      },
      include: {
        whitePlayer: {
          select: { Email: true, Rating: true }
        },
        blackPlayer: {
          select: { Email: true, Rating: true }
        },
        winner: {
          select: { Email: true }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Map database results to a sanitized REST payload
    const sanitizedGames = games.map((game) => {
      return {
        id: game.id,
        whitePlayer: game.whitePlayer?.Email || "Guest",
        blackPlayer: game.blackPlayer?.Email || "Guest",
        whiteRating: game.whitePlayer?.Rating ?? 1200,
        blackRating: game.blackPlayer?.Rating ?? 1200,
        winner: game.winner?.Email || (game.winnerId ? "Unknown" : "Draw"),
        result: game.result,
        pgn: game.pgn,
        createdAt: game.createdAt,
      };
    });

    return res.status(200).json({ games: sanitizedGames });
  } catch (err) {
    console.error("Error retrieving game history:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};
