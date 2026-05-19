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
    <div className="flex w-full min-h-screen bg-zinc-950 text-white font-sans antialiased">
      {/* Sidebar Navigation */}
      <LoginSidebar />

      {/* Main Dashboard Panel */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto max-w-5xl mx-auto">
        
        {/* User Card Profile Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/10 border border-zinc-900 p-6 rounded-2xl mb-10">
          <div className="flex items-center gap-4">
            {user?.picture ? (
              <img
                src={user.picture}
                alt="Profile"
                className="w-14 h-14 rounded-full border border-zinc-800 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl font-semibold text-zinc-300">
                {(user?.name || user?.email || "G")[0].toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">{user?.name || "Competitor"}</h1>
              <p className="text-sm text-zinc-500 font-mono mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900/40 border border-zinc-800 px-4 py-2.5 rounded-xl self-start md:self-auto">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Rating</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-white">{localRating}</span>
              <span className="text-[10px] text-zinc-500 font-semibold font-mono">ELO</span>
            </div>
          </div>
        </div>

        {/* Quick Play Selection */}
        <div className="mb-10">
          <h2 className="text-base font-semibold tracking-tight text-zinc-400 mb-4 uppercase tracking-widest text-xs">
            Quick Play Lobby
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/game")}
              className="bg-white hover:bg-zinc-100 text-zinc-950 p-5 rounded-2xl cursor-pointer transition-colors duration-200 text-left shadow-sm"
            >
              <div className="text-2xl mb-1">⚡</div>
              <div className="font-bold text-base leading-tight">Play Online</div>
              <div className="text-[11px] opacity-75 mt-0.5 font-medium">Blitz 5 min lobby</div>
            </button>

            <button
              onClick={() => navigate("/game")}
              className="bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-900 p-5 rounded-2xl cursor-pointer transition-colors duration-200 text-left"
            >
              <div className="text-2xl mb-1">🎯</div>
              <div className="font-bold text-base leading-tight text-white">New Game</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Launch standard board</div>
            </button>

            <button
              onClick={() => navigate("/game")}
              className="bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-900 p-5 rounded-2xl cursor-pointer transition-colors duration-200 text-left"
            >
              <div className="text-2xl mb-1">🤝</div>
              <div className="font-bold text-base leading-tight text-white">Play a Friend</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Generate room link</div>
            </button>

            <button
              disabled
              className="bg-zinc-900/10 border border-zinc-950 p-5 rounded-2xl opacity-40 cursor-not-allowed text-left"
            >
              <div className="text-2xl mb-1">🤖</div>
              <div className="font-bold text-base leading-tight text-zinc-600">Play Bots</div>
              <div className="text-[11px] text-zinc-600 mt-0.5">AI engine (soon)</div>
            </button>
          </div>
        </div>

        {/* Game History List Panel */}
        <div className="bg-zinc-900/10 border border-zinc-900 p-6 rounded-2xl mb-10">
          <h2 className="text-base font-semibold tracking-tight text-zinc-400 mb-4 uppercase tracking-widest text-xs">
            Recent Matches
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-zinc-500 font-mono">Loading history...</span>
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/5 border border-zinc-900/50 rounded-xl">
              <span className="text-3xl opacity-50">♟️</span>
              <p className="text-zinc-500 mt-2 text-xs font-normal">No matches yet. Launch matchmaking to record your history.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 text-[10px] uppercase tracking-widest">
                    <th className="pb-3 font-semibold">White</th>
                    <th className="pb-3 font-semibold">Black</th>
                    <th className="pb-3 font-semibold">Outcome</th>
                    <th className="pb-3 font-semibold">Details</th>
                    <th className="pb-3 font-semibold text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40 text-xs">
                  {games.map((game) => {
                    const isWhite = user?.email && game.whitePlayer.toLowerCase() === user.email.toLowerCase();
                    const isWinner = user?.email && game.winner.toLowerCase() === user.email.toLowerCase();
                    const isDraw = game.winner === "Draw";

                    let outcomeBadge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800">
                        DRAW
                      </span>
                    );
                    if (!isDraw) {
                      outcomeBadge = isWinner ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-900 text-white border border-zinc-800">
                          VICTORY
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-950 text-zinc-500 border border-zinc-900">
                          DEFEAT
                        </span>
                      );
                    }

                    return (
                      <tr key={game.id} className="hover:bg-zinc-900/10 transition-colors duration-150">
                        <td className="py-3 pr-3">
                          <span className={`font-semibold ${isWhite ? "text-white" : "text-zinc-400"}`}>
                            {game.whitePlayer.split("@")[0]}
                          </span>
                          <span className="text-[10px] text-zinc-600 font-mono block">Rating: {game.whiteRating}</span>
                        </td>
                        <td className="py-3 pr-3">
                          <span className={`font-semibold ${!isWhite ? "text-white" : "text-zinc-400"}`}>
                            {game.blackPlayer.split("@")[0]}
                          </span>
                          <span className="text-[10px] text-zinc-600 font-mono block">Rating: {game.blackRating}</span>
                        </td>
                        <td className="py-3 pr-3">{outcomeBadge}</td>
                        <td className="py-3 pr-3">
                          <span className="text-zinc-400 capitalize">{game.result}</span>
                          <span className="text-[9px] font-mono text-zinc-600 block truncate max-w-[150px]">
                            {game.pgn || "No recorded moves"}
                          </span>
                        </td>
                        <td className="py-3 text-right text-[10px] text-zinc-600 font-mono">
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
            className="group bg-zinc-900/10 rounded-2xl overflow-hidden border border-zinc-900 cursor-pointer hover:border-zinc-800 transition-colors duration-250"
          >
            <div className="h-28 bg-zinc-900/20 flex items-center justify-center">
              <span className="text-4xl opacity-50">🧩</span>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold tracking-tight text-white">Tactical Puzzles</h3>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">Sharpen openings and chess problem tactics</p>
            </div>
          </div>

          {/* Lessons */}
          <div
            onClick={() => navigate("/game")}
            className="group bg-zinc-900/10 rounded-2xl overflow-hidden border border-zinc-900 cursor-pointer hover:border-zinc-800 transition-colors duration-250"
          >
            <div className="h-28 bg-zinc-900/20 flex items-center justify-center">
              <span className="text-4xl opacity-50">📘</span>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold tracking-tight text-white">Chess Academy</h3>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">Learn critical endgames and strategic setups</p>
            </div>
          </div>

          {/* Game Review */}
          <div
            onClick={() => navigate("/game")}
            className="group bg-zinc-900/10 rounded-2xl overflow-hidden border border-zinc-900 cursor-pointer hover:border-zinc-800 transition-colors duration-250"
          >
            <div className="h-28 bg-zinc-900/20 flex items-center justify-center">
              <span className="text-4xl opacity-50">🔍</span>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold tracking-tight text-white">Game Review</h3>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">Retrieve historical FENs and review key blunders</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
