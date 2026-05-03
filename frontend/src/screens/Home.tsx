import { useNavigate } from "react-router-dom";
import { LoginSidebar } from "../components/LoginSidebar";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex w-full min-h-screen bg-stone-900 text-white">
      {/* Sidebar */}
      <LoginSidebar />

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {user?.picture ? (
              <img
                src={user.picture}
                alt="Profile"
                className="w-12 h-12 rounded-full border-2 border-lime-500/50"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-stone-700 flex items-center justify-center text-lg font-bold text-lime-400">
                {(user?.name || user?.email || "G")[0].toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-xl font-bold">{user?.name || "Guest"}</div>
              <div className="text-sm text-stone-400">{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Quick Play Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Play</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => navigate("/game")}
              className="bg-lime-600 hover:bg-lime-500 p-5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-lime-600/20"
            >
              <div className="text-2xl mb-1">⚡</div>
              <div className="font-bold text-lg">Play Online</div>
              <div className="text-sm opacity-70">5 min game</div>
            </button>

            <button
              onClick={() => navigate("/game")}
              className="bg-stone-800 hover:bg-stone-700 border border-stone-700/50 p-5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="text-2xl mb-1">🎯</div>
              <div className="font-bold text-lg">New Game</div>
              <div className="text-sm text-stone-400">Custom match</div>
            </button>

            <button
              onClick={() => navigate("/game")}
              className="bg-stone-800 hover:bg-stone-700 border border-stone-700/50 p-5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="text-2xl mb-1">🤝</div>
              <div className="font-bold text-lg">Play a Friend</div>
              <div className="text-sm text-stone-400">Share a link</div>
            </button>

            <button
              onClick={() => navigate("/game")}
              className="bg-stone-800 hover:bg-stone-700 border border-stone-700/50 p-5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="text-2xl mb-1">🤖</div>
              <div className="font-bold text-lg">Play Bots</div>
              <div className="text-sm text-stone-400">Coming soon</div>
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Puzzles */}
          <div
            onClick={() => navigate("/puzzle")}
            className="group bg-stone-800 rounded-xl overflow-hidden border border-stone-700/30 cursor-pointer transition-all duration-200 hover:border-stone-600/50 hover:shadow-lg"
          >
            <div className="h-40 bg-gradient-to-br from-amber-900/40 to-stone-800 flex items-center justify-center">
              <span className="text-6xl opacity-60 group-hover:scale-110 transition-transform duration-300">🧩</span>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold">Puzzles</h3>
              <p className="text-sm text-stone-400 mt-1">Sharpen your tactics with daily puzzles</p>
            </div>
          </div>

          {/* Lessons */}
          <div
            onClick={() => navigate("/lesson")}
            className="group bg-stone-800 rounded-xl overflow-hidden border border-stone-700/30 cursor-pointer transition-all duration-200 hover:border-stone-600/50 hover:shadow-lg"
          >
            <div className="h-40 bg-gradient-to-br from-blue-900/40 to-stone-800 flex items-center justify-center">
              <span className="text-6xl opacity-60 group-hover:scale-110 transition-transform duration-300">📘</span>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold">Lessons</h3>
              <p className="text-sm text-stone-400 mt-1">Learn openings, strategy, and endgames</p>
            </div>
          </div>

          {/* Game Review */}
          <div
            onClick={() => navigate("/review")}
            className="group bg-stone-800 rounded-xl overflow-hidden border border-stone-700/30 cursor-pointer transition-all duration-200 hover:border-stone-600/50 hover:shadow-lg"
          >
            <div className="h-40 bg-gradient-to-br from-emerald-900/40 to-stone-800 flex items-center justify-center">
              <span className="text-6xl opacity-60 group-hover:scale-110 transition-transform duration-300">🔍</span>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold">Game Review</h3>
              <p className="text-sm text-stone-400 mt-1">Analyze your games and find improvements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
