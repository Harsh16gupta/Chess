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
              <svg className="w-6 h-6 mx-auto mb-1 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <div className="font-bold text-lg">Play Online</div>
              <div className="text-sm opacity-80 font-normal">5 min game</div>
            </button>

            <button
              onClick={() => navigate("/game")}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 p-5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-6 h-6 mx-auto mb-1 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
              <div className="font-bold text-lg text-white">New Game</div>
              <div className="text-sm text-zinc-400">Custom match</div>
            </button>

            <button
              onClick={() => navigate("/game")}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 p-5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-6 h-6 mx-auto mb-1 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <div className="font-bold text-lg text-white">Play a Friend</div>
              <div className="text-sm text-zinc-400">Share a link</div>
            </button>

            <button
              onClick={() => navigate("/game")}
              className="bg-zinc-900 border border-zinc-900 opacity-40 p-5 rounded-xl cursor-not-allowed"
              disabled
            >
              <svg className="w-6 h-6 mx-auto mb-1 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2"/>
                <circle cx="12" cy="5" r="2"/>
                <path d="M12 7v4"/>
              </svg>
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
              <svg className="w-12 h-12 stroke-zinc-500 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
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
              <svg className="w-12 h-12 stroke-zinc-500 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3L1 9l11 6 9-5v6h2V9l-11-6z"/>
                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
              </svg>
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
              <svg className="w-12 h-12 stroke-zinc-500 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
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
