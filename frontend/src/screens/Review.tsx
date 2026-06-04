import { useState } from "react";
import { Chess } from "chess.js";
import { ChessBoard } from "../components/ChessBoard";
import { SideBar } from "../components/SideBar";
import { LoginSidebar } from "../components/LoginSidebar";
import { useAuth } from "../context/AuthContext";

export default function Review() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // Background chessboard setup for a visually engaging theme
  const [chess] = useState(() => {
    const c = new Chess();
    // A nice complex middle-game position for a game review screen
    c.load("r2qk2r/ppp2ppp/2n5/3pP3/2P1b3/5N2/PP1Q1PPP/R3KB1R w KQkq - 0 10");
    return c;
  });

  const theme = {
    screenBg: isLoggedIn ? "bg-[#0a0d14]" : "bg-[#151413]",
  };

  return (
    <div className={`flex h-screen ${theme.screenBg} text-[#e2e8f0] overflow-hidden relative`}>
      {isLoggedIn ? <LoginSidebar /> : <SideBar />}

      {/* Main Content Area with glassmorphism overlay */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
        {/* Visual Background: Blurred, tilted Chessboard */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none transform -rotate-12 scale-110 blur-[3px]">
          <div className="w-[500px] h-[500px]">
            <ChessBoard
              board={chess.board()}
              flipped={false}
              selectedSquare={null}
              validMoves={[]}
              lastMove={null}
              onSquareClick={() => {}}
            />
          </div>
        </div>

        {/* Dynamic ambient background spots */}
        <div className="absolute top-[25%] right-[20%] w-[35vw] h-[35vh] bg-slate-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[25%] left-[20%] w-[30vw] h-[30vh] bg-slate-800/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Premium Coming Soon Card */}
        <div className="relative z-10 max-w-lg w-full text-center px-6 py-12 md:py-16 bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white">
              {/* Review icon (Magnifying glass over board or game analysis chart icon) */}
              <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
          </div>

          <span className="text-[10px] bg-white/10 text-white px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-white/10">
            Game Review & Analysis
          </span>

          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight mt-6">
            Review Your Matches
          </h1>
          <p className="mt-4 text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
            Deep-dive into your chess history. Review your past matches, identify key blunders, and explore alternate moves with our advanced move-by-move engine analysis.
          </p>

          <div className="mt-8 flex justify-center">
            <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-zinc-400 font-bold uppercase tracking-wide">
              Coming Soon
            </span>
          </div>

          {/* Planned Features list */}
          <div className="mt-10 pt-8 border-t border-white/5 flex justify-center gap-6 md:gap-8 text-center">
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Engine</div>
              <div className="text-xs font-extrabold text-white mt-1">Move Classification</div>
            </div>
            <div className="w-px bg-white/5" />
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Coach</div>
              <div className="text-xs font-extrabold text-white mt-1">Garry GM AI</div>
            </div>
            <div className="w-px bg-white/5" />
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">History</div>
              <div className="text-xs font-extrabold text-white mt-1">Auto-saved matches</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
