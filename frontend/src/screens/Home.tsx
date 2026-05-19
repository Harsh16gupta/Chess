import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginSidebar } from "../components/LoginSidebar";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

interface GameRecord {
  id: string;
  whitePlayer: string;
  blackPlayer: string;
  whiteRating: number;
  blackRating: number;
  winner: string;
  result: string;
  pgn: string;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [games, setGames] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Hydrate user rating from localStorage if it exists
  const localRating = localStorage.getItem("rating") || "1200";

  useEffect(() => {
    async function fetchHistory() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/api/games/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGames(res.data.games || []);
      } catch (err) {
        console.error("Failed to load match history:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  return (
    <div className="flex w-full min-h-screen bg-stone-900 text-white font-sans">
      {/* Sidebar Navigation */}
      <LoginSidebar />

      {/* Main Dashboard Panel */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-6xl mx-auto">
        
        {/* User Card Profile Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-800/40 border border-stone-800/80 p-6 rounded-2xl mb-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            {user?.picture ? (
              <img
                src={user.picture}
                alt="Profile"
                className="w-16 h-16 rounded-full border-2 border-lime-500/50 shadow-lg shadow-lime-500/10"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-stone-700/60 border border-stone-600/30 flex items-center justify-center text-2xl font-bold text-lime-400">
                {(user?.name || user?.email || "G")[0].toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black tracking-tight">{user?.name || "Chess Competitor"}</h1>
              <p className="text-sm text-stone-400 font-mono mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-stone-900/60 border border-stone-800/80 px-5 py-3 rounded-xl self-start md:self-auto">
            <span className="text-stone-400 text-sm font-semibold uppercase tracking-wider">Blitz Rating</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-lime-400">{localRating}</span>
              <span className="text-xs text-lime-500/70 font-semibold font-mono">ELO</span>
            </div>
          </div>
        </div>

        {/* Quick Play Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
            <span>⚡</span> Quick Play Lobby
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => navigate("/game")}
              className="bg-lime-600 hover:bg-lime-500 p-5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-lime-600/20 text-left"
            >
              <div className="text-3xl mb-1">⚡</div>
              <div className="font-bold text-lg leading-tight">Play Online</div>
              <div className="text-xs opacity-80 mt-1">Blitz 5 min lobby</div>
            </button>

            <button
              onClick={() => navigate("/game")}
              className="bg-stone-800 hover:bg-stone-700/80 border border-stone-700/30 p-5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left"
            >
              <div className="text-3xl mb-1">🎯</div>
              <div className="font-bold text-lg leading-tight">New Game</div>
              <div className="text-xs text-stone-400 mt-1">Launch standard board</div>
            </button>

            <button
              onClick={() => navigate("/game")}
              className="bg-stone-800 hover:bg-stone-700/80 border border-stone-700/30 p-5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left"
            >
              <div className="text-3xl mb-1">🤝</div>
              <div className="font-bold text-lg leading-tight">Play a Friend</div>
              <div className="text-xs text-stone-400 mt-1">Generate room link</div>
            </button>

            <button
              disabled
              className="bg-stone-800/40 border border-stone-800/60 p-5 rounded-xl opacity-50 cursor-not-allowed text-left"
            >
              <div className="text-3xl mb-1">🤖</div>
              <div className="font-bold text-lg leading-tight text-stone-500">Play Bots</div>
              <div className="text-xs text-stone-500 mt-1">AI training (soon)</div>
            </button>
          </div>
        </div>

        {/* Game History List Panel */}
        <div className="bg-stone-800/20 border border-stone-800/70 p-6 rounded-2xl mb-8">
          <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
            <span>📜</span> Recent Matches
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 border-4 border-lime-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-stone-400 font-mono">Loading history...</span>
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-12 bg-stone-900/30 border border-stone-800/40 rounded-xl">
              <span className="text-4xl">♟️</span>
              <p className="text-stone-400 mt-3 text-sm">No recorded battles yet. Launch matchmaking to write history!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 text-xs uppercase tracking-wider">
                    <th className="pb-3 font-semibold">White</th>
                    <th className="pb-3 font-semibold">Black</th>
                    <th className="pb-3 font-semibold">Outcome</th>
                    <th className="pb-3 font-semibold">Details</th>
                    <th className="pb-3 font-semibold text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-850/60 text-sm">
                  {games.map((game) => {
                    const isWhite = user?.email && game.whitePlayer.toLowerCase() === user.email.toLowerCase();
                    const isWinner = user?.email && game.winner.toLowerCase() === user.email.toLowerCase();
                    const isDraw = game.winner === "Draw";

                    let outcomeBadge = (
                      <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-stone-800 text-stone-400">
                        DRAW
                      </span>
                    );
                    if (!isDraw) {
                      outcomeBadge = isWinner ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          VICTORY
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                          DEFEAT
                        </span>
                      );
                    }

                    return (
                      <tr key={game.id} className="hover:bg-stone-800/10 transition-colors duration-150">
                        <td className="py-3.5 pr-3">
                          <span className={`font-semibold ${isWhite ? "text-lime-400" : "text-stone-200"}`}>
                            {game.whitePlayer.split("@")[0]}
                          </span>
                          <span className="text-xs text-stone-500 font-mono block">Rating: {game.whiteRating}</span>
                        </td>
                        <td className="py-3.5 pr-3">
                          <span className={`font-semibold ${!isWhite ? "text-lime-400" : "text-stone-200"}`}>
                            {game.blackPlayer.split("@")[0]}
                          </span>
                          <span className="text-xs text-stone-500 font-mono block">Rating: {game.blackRating}</span>
                        </td>
                        <td className="py-3.5 pr-3">{outcomeBadge}</td>
                        <td className="py-3.5 pr-3">
                          <span className="text-stone-400 capitalize">{game.result}</span>
                          <span className="text-[10px] font-mono text-stone-500 block truncate max-w-[150px]">
                            {game.pgn || "No recorded moves"}
                          </span>
                        </td>
                        <td className="py-3.5 text-right text-xs text-stone-500 font-mono">
                          {new Date(game.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "2-digit"
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Puzzles */}
          <div
            onClick={() => navigate("/game")}
            className="group bg-stone-800/40 rounded-2xl overflow-hidden border border-stone-800/50 cursor-pointer transition-all duration-200 hover:border-stone-700/60 hover:shadow-lg"
          >
            <div className="h-32 bg-gradient-to-br from-amber-900/20 to-stone-800/10 flex items-center justify-center">
              <span className="text-5xl opacity-70 group-hover:scale-110 transition-transform duration-300">🧩</span>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold tracking-tight">Tactical Puzzles</h3>
              <p className="text-xs text-stone-400 mt-1">Sharpen openings and chess problem tactics</p>
            </div>
          </div>

          {/* Lessons */}
          <div
            onClick={() => navigate("/game")}
            className="group bg-stone-800/40 rounded-2xl overflow-hidden border border-stone-800/50 cursor-pointer transition-all duration-200 hover:border-stone-700/60 hover:shadow-lg"
          >
            <div className="h-32 bg-gradient-to-br from-blue-900/20 to-stone-800/10 flex items-center justify-center">
              <span className="text-5xl opacity-70 group-hover:scale-110 transition-transform duration-300">📘</span>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold tracking-tight">Chess Academy</h3>
              <p className="text-xs text-stone-400 mt-1">Learn critical endgames and strategic setups</p>
            </div>
          </div>

          {/* Game Review */}
          <div
            onClick={() => navigate("/game")}
            className="group bg-stone-800/40 rounded-2xl overflow-hidden border border-stone-800/50 cursor-pointer transition-all duration-200 hover:border-stone-700/60 hover:shadow-lg"
          >
            <div className="h-32 bg-gradient-to-br from-emerald-900/20 to-stone-800/10 flex items-center justify-center">
              <span className="text-5xl opacity-70 group-hover:scale-110 transition-transform duration-300">🔍</span>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold tracking-tight">Game Review</h3>
              <p className="text-xs text-stone-400 mt-1">Retrieve historical FENs and review key blunders</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
