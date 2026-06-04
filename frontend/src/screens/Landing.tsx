import { useNavigate } from "react-router-dom";
import { SideBar } from "../components/SideBar";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-black">
      <SideBar />

      <div className="flex-1 relative overflow-hidden bg-black">
        {/* Grayscale background radial glow */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, #27272a 0%, #000000 100%)",
          }}
        />

        {/* Floating monochrome chess pieces */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <span className="absolute text-7xl opacity-[0.03] text-white top-[10%] left-[10%] rotate-[-15deg]">♜</span>
          <span className="absolute text-9xl opacity-[0.03] text-white top-[60%] left-[5%] rotate-[20deg]">♞</span>
          <span className="absolute text-8xl opacity-[0.03] text-white top-[20%] right-[8%] rotate-[10deg]">♝</span>
          <span className="absolute text-6xl opacity-[0.03] text-white bottom-[15%] right-[15%] rotate-[-25deg]">♛</span>
          <span className="absolute text-7xl opacity-[0.03] text-white bottom-[30%] left-[30%] rotate-[5deg]">♚</span>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex h-full items-center justify-center px-8">
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl">
            {/* Left: Board image - using a grayscale filter for theme consistency */}
            <div className="flex-shrink-0">
              <img
                className="w-80 md:w-96 rounded-xl shadow-2xl shadow-black/80 filter grayscale"
                src="/board.png"
                alt="Chess Board"
              />
            </div>

            {/* Right: Text + CTA */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h1 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
                Play Chess
                <br />
                <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                  Online
                </span>
              </h1>
              <p className="mt-4 text-lg text-zinc-400 max-w-md">
                Real-time multiplayer chess. Find an opponent instantly,
                challenge a friend, or improve with puzzles.
              </p>

              <button
                onClick={() => navigate("/game")}
                className="mt-8 group relative bg-white hover:bg-zinc-200 text-black font-bold text-xl py-4 px-12 rounded-xl cursor-pointer transition-all duration-300 shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="flex items-center gap-3">
                  ▶ Play Online
                </span>
                <span className="block text-sm font-normal mt-0.5 opacity-75">
                  Play with someone at your level
                </span>
              </button>

              {/* Stats row */}
              <div className="mt-10 flex gap-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">5 min</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider">Timed Games</div>
                </div>
                <div className="w-px bg-zinc-800" />
                <div>
                  <div className="text-2xl font-bold text-white">Live</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider">In-Game Chat</div>
                </div>
                <div className="w-px bg-zinc-800" />
                <div>
                  <div className="text-2xl font-bold text-white">Free</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider">No Account Needed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}