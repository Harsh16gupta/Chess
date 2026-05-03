import { useNavigate } from "react-router-dom";
import { SideBar } from "../components/SideBar";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen">
      <SideBar />

      <div className="flex-1 relative overflow-hidden bg-stone-900">
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(ellipse at 30% 20%, #4ade80 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, #a3e635 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, #1c1917 0%, #0c0a09 100%)",
          }}
        />

        {/* Floating chess pieces (decorative) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <span className="absolute text-7xl opacity-[0.04] top-[10%] left-[10%] rotate-[-15deg]">♜</span>
          <span className="absolute text-9xl opacity-[0.04] top-[60%] left-[5%] rotate-[20deg]">♞</span>
          <span className="absolute text-8xl opacity-[0.04] top-[20%] right-[8%] rotate-[10deg]">♝</span>
          <span className="absolute text-6xl opacity-[0.04] bottom-[15%] right-[15%] rotate-[-25deg]">♛</span>
          <span className="absolute text-7xl opacity-[0.04] bottom-[30%] left-[30%] rotate-[5deg]">♚</span>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex h-full items-center justify-center px-8">
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl">
            {/* Left: Board image */}
            <div className="flex-shrink-0">
              <img
                className="w-80 md:w-96 rounded-2xl shadow-2xl shadow-black/50"
                src="/board.png"
                alt="Chess Board"
              />
            </div>

            {/* Right: Text + CTA */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h1 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
                Play Chess
                <br />
                <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
                  Online
                </span>
              </h1>
              <p className="mt-4 text-lg text-stone-400 max-w-md">
                Real-time multiplayer chess. Find an opponent instantly,
                challenge a friend, or improve with puzzles.
              </p>

              <button
                onClick={() => navigate("/game")}
                className="mt-8 group relative bg-lime-600 hover:bg-lime-500 text-white font-bold text-xl py-4 px-12 rounded-2xl cursor-pointer transition-all duration-300 shadow-lg shadow-lime-600/30 hover:shadow-lime-500/40 hover:scale-[1.03] active:scale-[0.98]"
              >
                <span className="flex items-center gap-3">
                  ▶ Play Online
                </span>
                <span className="block text-sm font-normal mt-0.5 opacity-70">
                  Play with someone at your level
                </span>
              </button>

              {/* Stats row */}
              <div className="mt-10 flex gap-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">5 min</div>
                  <div className="text-xs text-stone-500 uppercase tracking-wider">Timed Games</div>
                </div>
                <div className="w-px bg-stone-700" />
                <div>
                  <div className="text-2xl font-bold text-white">Live</div>
                  <div className="text-xs text-stone-500 uppercase tracking-wider">In-Game Chat</div>
                </div>
                <div className="w-px bg-stone-700" />
                <div>
                  <div className="text-2xl font-bold text-white">Free</div>
                  <div className="text-xs text-stone-500 uppercase tracking-wider">No Account Needed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}