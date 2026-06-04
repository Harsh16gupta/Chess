import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { ChessBoard } from "../components/ChessBoard";
import { SideBar } from "../components/SideBar";
import { LoginSidebar } from "../components/LoginSidebar";
import { useAuth } from "../context/AuthContext";
import { sound } from "../utils/sound";
import axios from "axios";

// Kasparov's Famous Immortal Game (vs Topalov, Wijk aan Zee 1999)
const SAMPLE_PGN = "1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 Nbd7 8. Bh6 Bxh6 9. Qxh6 Bb7 10. a3 e5 11. O-O-O Qe7 12. Kb1 a6 13. Nc1 O-O-O 14. Nb3 exd4 15. Rxd4 c5 16. Rd1 Nb6 17. g3 Kb8 18. Na5 Ba8 19. Bh3 d5 20. Qf4+ Ka7 21. Rhe1 d4 22. Nd5 Nbxd5 23. exd5 Qd6 24. Rxd4 cxd4 25. Re7+ Kb6 26. Qxd4+ Kxa5 27. b4+ Ka4 28. Qc3 Qxd5 29. Ra7 Bb7 30. Rxb7 Qc4 31. Qxf6 Kxa3 32. Qxa6+ Kxb4 33. c3+ Kxc3 34. Qa1+ Kd2 35. Qb2+ Kd1 36. Bf1 Rd2 37. Rd7 Rxd7 38. Bxc4 bxc4 39. Qxh8 Rd3 40. Qa8 c3 41. Qa4+ Ke1 42. f4 f5 43. Kc1 Rd2 44. Qa7";

export default function Review() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [pgnInput, setPgnInput] = useState(SAMPLE_PGN);
  const [movesList, setMovesList] = useState<string[]>([]);
  const [activeMoveIdx, setActiveMoveIdx] = useState(-1); // -1 means starting board

  const [chess, setChess] = useState(() => new Chess());
  const [board, setBoard] = useState(chess.board());
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Coach Integration States
  const [coachFeedback, setCoachFeedback] = useState<string | null>(null);
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [aiEngine, setAiEngine] = useState<"gemini" | "grok">("gemini");

  // Parse PGN input and convert to flat moves list
  const loadPgn = (pgnStr: string) => {
    try {
      const tempChess = new Chess();
      tempChess.loadPgn(pgnStr);
      const history = tempChess.history();

      setMovesList(history);
      setActiveMoveIdx(history.length - 1);
      setCoachFeedback(null);

      // Play start sound
      sound.playMove();
    } catch (err) {
      alert("Failed to parse PGN. Please ensure it follows standard chess notation.");
    }
  };

  // Sync board with active move index
  useEffect(() => {
    const tempChess = new Chess();
    let moveObj = null;

    for (let i = 0; i <= activeMoveIdx; i++) {
      if (i < movesList.length) {
        moveObj = tempChess.move(movesList[i]);
      }
    }

    setChess(tempChess);
    setBoard(tempChess.board());

    if (moveObj) {
      setLastMove({ from: moveObj.from, to: moveObj.to });
    } else {
      setLastMove(null);
    }
  }, [activeMoveIdx, movesList]);

  // Load sample game on mount
  useEffect(() => {
    loadPgn(SAMPLE_PGN);
  }, []);

  const handleNext = () => {
    if (activeMoveIdx < movesList.length - 1) {
      setActiveMoveIdx(prev => prev + 1);
      sound.playMove();
    }
  };

  const handlePrev = () => {
    if (activeMoveIdx >= 0) {
      setActiveMoveIdx(prev => prev - 1);
      sound.playMove();
    }
  };

  // Ask AI Coach Garry/Grok to analyze the current active board position
  const askCoach = async () => {
    try {
      setIsCoachLoading(true);
      setCoachFeedback(null);

      // Reconstruct the game history up to activeMoveIdx
      const subMoves = movesList.slice(0, activeMoveIdx + 1);
      
      const res = await axios.post(
        "http://localhost:3000/api/coach/analyze",
        {
          fen: chess.fen(),
          pgn: subMoves.join(" "),
          engine: aiEngine,
        },
        {
          headers: {
            "x-gemini-key": localStorage.getItem("user_gemini_key") || "",
            "x-grok-key": localStorage.getItem("user_grok_key") || "",
          },
        }
      );
      setCoachFeedback(res.data.analysis || null);
    } catch (err: any) {
      console.error("Coach API error:", err);
      const errMsg = err.response?.data?.error || "Could not reach the Coach. Make sure your API key is correct and try again shortly.";
      setCoachFeedback(`⚠️ Error: ${errMsg}`);
    } finally {
      setIsCoachLoading(false);
    }
  };

  const theme = {
    screenBg: isLoggedIn ? "bg-[#0a0d14]" : "bg-[#151413]",
    sidebarBorder: isLoggedIn ? "border-[#1e293b]" : "border-[#2c2b2a]",
    panelBg: isLoggedIn ? "bg-[#111625]" : "bg-[#1a1918]",
    panelBorder: isLoggedIn ? "border-[#1e293b]" : "border-[#2c2b2a]",
    textMuted: isLoggedIn ? "text-slate-400" : "text-zinc-500",
  };

  return (
    <div className={`flex h-screen ${theme.screenBg} text-[#e2e8f0] overflow-hidden`}>
      {isLoggedIn ? <LoginSidebar /> : <SideBar />}

      <div className="flex-1 flex flex-col md:flex-row p-6 md:p-8 gap-8 overflow-y-auto">
        {/* Left: Chessboard */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-[550px] mx-auto w-full aspect-square">
          <div className="w-full h-full pointer-events-none mb-4">
            <ChessBoard
              board={board}
              flipped={false}
              selectedSquare={null}
              validMoves={[]}
              lastMove={lastMove}
              onSquareClick={() => {}}
            />
          </div>

          {/* Stepper controls */}
          <div className="flex gap-4 justify-center items-center w-full bg-white/5 border border-white/5 p-3 rounded-xl">
            <button
              onClick={() => setActiveMoveIdx(-1)}
              className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Start of Game"
            >
              ⏮
            </button>
            <button
              onClick={handlePrev}
              disabled={activeMoveIdx < 0}
              className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous Move"
            >
              ◀
            </button>
            <span className="text-xs font-bold text-zinc-400">
              Move {activeMoveIdx + 1} of {movesList.length}
            </span>
            <button
              onClick={handleNext}
              disabled={activeMoveIdx >= movesList.length - 1}
              className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next Move"
            >
              ▶
            </button>
            <button
              onClick={() => setActiveMoveIdx(movesList.length - 1)}
              className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="End of Game"
            >
              ⏭
            </button>
          </div>
        </div>

        {/* Right: Review Tools and AI Coach */}
        <div className="w-full md:w-[400px] flex flex-col gap-6">
          {/* PGN Loader */}
          <div className={`p-5 rounded-2xl ${theme.panelBg} border ${theme.panelBorder} shadow-md shrink-0`}>
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Load Game (PGN)</h2>
            <textarea
              value={pgnInput}
              onChange={(e) => setPgnInput(e.target.value)}
              placeholder="Paste PGN here..."
              className="w-full h-16 p-2 rounded-lg bg-zinc-950/40 border border-white/5 text-xs outline-none focus:border-white/20 transition-colors font-mono resize-none text-zinc-400"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => loadPgn(pgnInput)}
                className="flex-1 py-2 bg-[#efebe4] text-[#1c1b1a] font-bold rounded-lg text-xs hover:bg-[#e0dad0] transition-colors cursor-pointer text-center"
              >
                Parse Game
              </button>
              <button
                onClick={() => {
                  setPgnInput(SAMPLE_PGN);
                  loadPgn(SAMPLE_PGN);
                }}
                className="py-2 px-3 bg-zinc-900 border border-zinc-800 text-zinc-450 font-bold rounded-lg text-xs hover:bg-zinc-850 transition-colors cursor-pointer"
              >
                Sample
              </button>
            </div>
          </div>

          {/* AI Coach Analysis */}
          <div className={`p-6 rounded-2xl ${theme.panelBg} border ${theme.panelBorder} flex flex-col flex-1 overflow-hidden shadow-lg min-h-[300px]`}>
            <div className="flex items-center justify-between gap-2 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M12 2a3 3 0 0 0-3 3c0 .87.37 1.66 1 2.21A6.74 6.74 0 0 0 7 13.5c0 1 .5 1.5 1.5 1.5h7c1 0 1.5-.5 1.5-1.5a6.74 6.74 0 0 0-3-6.29c.63-.55 1-1.34 1-2.21a3 3 0 0 0-3-3z"/>
                    <path d="M8 19h8"/>
                    <path d="M6 22h12"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Garry AI</div>
                  <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Coach Commentary</div>
                </div>
              </div>
              
              <select
                value={aiEngine}
                onChange={(e) => setAiEngine(e.target.value as any)}
                className="p-1.5 rounded-lg bg-zinc-950 border border-white/5 text-white text-xs outline-none cursor-pointer"
              >
                <option value="gemini">Gemini</option>
                <option value="grok">Grok</option>
              </select>
            </div>

            {/* Analysis feedback board */}
            <div className="flex-1 overflow-y-auto bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              {isCoachLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                  <span className="text-xs text-zinc-400 font-bold">Garry is reviewing the FEN position...</span>
                </div>
              ) : coachFeedback ? (
                <p className="text-xs text-white text-left leading-relaxed font-medium whitespace-pre-wrap">
                  {coachFeedback}
                </p>
              ) : (
                <div className="text-zinc-500">
                  <p className="text-xs italic">Step to any move in the game history and click below to ask Coach Garry for a strategic positional evaluation.</p>
                  <button
                    onClick={askCoach}
                    className="mt-4 py-2 px-6 bg-[#efebe4] text-[#1c1b1a] font-bold rounded-lg text-xs hover:bg-[#e0dad0] transition-colors cursor-pointer inline-block"
                  >
                    Analyze Active Move
                  </button>
                </div>
              )}
            </div>

            {coachFeedback && !isCoachLoading && (
              <button
                onClick={askCoach}
                className="mt-3 py-2 w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer text-center"
              >
                Re-Analyze Move
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
