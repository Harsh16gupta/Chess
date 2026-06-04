import { useNavigate } from "react-router-dom";
import { LoginSidebar } from "../components/LoginSidebar";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex w-full min-h-screen bg-black text-white">
      {/* Sidebar */}
      <LoginSidebar />

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto bg-black">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {user?.picture ? (
              <img
                src={user.picture}
                alt="Profile"
                className="w-12 h-12 rounded-full border border-zinc-800 filter grayscale"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lg font-bold text-white">
                {(user?.name || user?.email || "G")[0].toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-xl font-bold text-white">{user?.name || "Guest"}</div>
              <div className="text-sm text-zinc-400">{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Quick Play Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Quick Play</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => navigate("/game")}
              className="bg-white text-black hover:bg-zinc-200 p-5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/5 font-bold"
            >
              <div className="text-2xl mb-1">⚡</div>
              <div className="font-bold text-lg">Play Online</div>
              <div className="text-sm opacity-80 font-normal">5 min game</div>
            </button>

            <button
              onClick={() => navigate("/game")}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 p-5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="text-2xl mb-1">🎯</div>
              <div className="font-bold text-lg text-white">New Game</div>
              <div className="text-sm text-zinc-400">Custom match</div>
            </button>

            <button
              onClick={() => navigate("/game")}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 p-5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="text-2xl mb-1">🤝</div>
              <div className="font-bold text-lg text-white">Play a Friend</div>
              <div className="text-sm text-zinc-400">Share a link</div>
            </button>

            <button
              onClick={() => navigate("/game")}
              className="bg-zinc-900 border border-zinc-900 opacity-40 p-5 rounded-xl cursor-not-allowed"
              disabled
            >
              <div className="text-2xl mb-1">🤖</div>
              <div className="font-bold text-lg text-zinc-500">Play Bots</div>
              <div className="text-sm text-zinc-600">Coming soon</div>
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Puzzles */}
          <div
            onClick={() => navigate("/puzzle")}
            className="group bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 cursor-pointer transition-all duration-200 hover:border-white hover:shadow-lg"
          >
            <div className="h-40 bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center border-b border-zinc-800">
              <span className="text-6xl opacity-50 group-hover:scale-110 transition-transform duration-300 filter grayscale">🧩</span>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-white">Puzzles</h3>
              <p className="text-sm text-zinc-400 mt-1">Sharpen your tactics with daily puzzles</p>
            </div>
          </div>

          {/* Lessons */}
          <div
            onClick={() => navigate("/lesson")}
            className="group bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 cursor-pointer transition-all duration-200 hover:border-white hover:shadow-lg"
          >
            <div className="h-40 bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center border-b border-zinc-800">
              <span className="text-6xl opacity-50 group-hover:scale-110 transition-transform duration-300 filter grayscale">📘</span>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-white">Lessons</h3>
              <p className="text-sm text-zinc-400 mt-1">Learn openings, strategy, and endgames</p>
            </div>
          </div>

          {/* Game Review */}
          <div
            onClick={() => navigate("/review")}
            className="group bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 cursor-pointer transition-all duration-200 hover:border-white hover:shadow-lg"
          >
            <div className="h-40 bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center border-b border-zinc-800">
              <span className="text-6xl opacity-50 group-hover:scale-110 transition-transform duration-300 filter grayscale">🔍</span>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-white">Game Review</h3>
              <p className="text-sm text-zinc-400 mt-1">Analyze your games and find improvements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
