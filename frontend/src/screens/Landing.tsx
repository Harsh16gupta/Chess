import { useNavigate } from "react-router-dom";
import { SideBar } from "../components/SideBar";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-zinc-950 text-white font-sans antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <SideBar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-12 relative">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">
          
          {/* Left Hero Column: Minimalist typography and CTA */}
          <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Play Chess.<br />
              <span className="text-zinc-400">Pure & simple.</span>
            </h1>
            <p className="mt-4 text-zinc-400 text-base md:text-lg max-w-sm font-normal leading-relaxed">
              Experience clean, real-time multiplayer chess. No ads, no noise—just pure focus.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate("/game")}
                className="bg-white hover:bg-zinc-100 text-zinc-950 font-semibold px-8 py-3.5 rounded-full transition-colors duration-250 text-base cursor-pointer shadow-sm text-center"
              >
                Play Online
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold px-8 py-3.5 rounded-full transition-colors duration-250 text-base cursor-pointer text-center"
              >
                Log In
              </button>
            </div>

            {/* Micro details stats row */}
            <div className="mt-12 pt-8 border-t border-zinc-900 flex gap-10 text-left w-full justify-center md:justify-start">
              <div>
                <span className="text-xl font-bold tracking-tight text-white block">5 Min</span>
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5 block">Lobby Clock</span>
              </div>
              <div className="w-px bg-zinc-900" />
              <div>
                <span className="text-xl font-bold tracking-tight text-white block">Live</span>
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5 block">Match Chat</span>
              </div>
              <div className="w-px bg-zinc-900" />
              <div>
                <span className="text-xl font-bold tracking-tight text-white block">Free</span>
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5 block">No Accounts Req</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean board preview */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-b from-zinc-800 to-zinc-950 rounded-2xl opacity-20 blur-md transition-opacity duration-300"></div>
              <img
                className="relative w-72 md:w-80 rounded-2xl border border-zinc-800/80 shadow-2xl shadow-black/80"
                src="/board.png"
                alt="Chess.in Chess Board"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}