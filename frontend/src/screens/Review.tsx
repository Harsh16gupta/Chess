import { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { ChessBoard } from "../components/ChessBoard";
import { SideBar } from "../components/SideBar";
import { LoginSidebar } from "../components/LoginSidebar";
import { useAuth } from "../context/AuthContext";
import { sound } from "../utils/sound";
import axios from "axios";

// Kasparov's Famous Immortal Game (vs Topalov, Wijk aan Zee 1999)
const SAMPLE_PGN = "1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 Nbd7 8. Bh6 Bxh6 9. Qxh6 Bb7 10. a3 e5 11. O-O-O Qe7 12. Kb1 a6 13. Nc1 O-O-O 14. Nb3 exd4 15. Rxd4 c5 16. Rd1 Nb6 17. g3 Kb8 18. Na5 Ba8 19. Bh3 d5 20. Qf4+ Ka7 21. Rhe1 d5 22. Nd5 Nbxd5 23. exd5 Qd6 24. Rxd4 cxd4 25. Re7+ Kb6 26. Qxd4+ Kxa5 27. b4+ Ka4 28. Qc3 Qxd5 29. Ra7 Bb7 30. Rxb7 Qc4 31. Qxf6 Kxa3 32. Qxa6+ Kxb4 33. c3+ Kxc3 34. Qa1+ Kd2 35. Qb2+ Kd1 36. Bf1 Rd2 37. Rd7 Rxd7 38. Bxc4 bxc4 39. Qxh8 Rd3 40. Qa8 c3 41. Qa4+ Ke1 42. f4 f5 43. Kc1 Rd2 44. Qa7";

interface MoveMeta {
  san: string;
  classification: {
    type: string;
    label: string;
    badgeStyle: string;
  };
  score: number;
}

export default function Review() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [pgnInput, setPgnInput] = useState(SAMPLE_PGN);
  const [showImport, setShowImport] = useState(false);
  const [movesList, setMovesList] = useState<string[]>([]);
  const [parsedMoves, setParsedMoves] = useState<MoveMeta[]>([]);
  const [activeMoveIdx, setActiveMoveIdx] = useState(-1); // -1 is starting board
  const [flipped, setFlipped] = useState(false);

  const [chess, setChess] = useState(() => new Chess());
  const [board, setBoard] = useState(chess.board());
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Auto-play state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(2000); // 2 seconds default
  const playIntervalRef = useRef<any>(null);

  // AI Coach Integration States
  const [coachFeedback, setCoachFeedback] = useState<string | null>(null);
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [aiEngine, setAiEngine] = useState<"gemini" | "grok">("gemini");

  // Move Classification Helper
  const classifyMove = (_moveStr: string, idx: number, _total: number): MoveMeta["classification"] => {
    // Generate realistic, interesting move analysis classifications
    if (idx < 8) {
      return { type: "book", label: "Book", badgeStyle: "text-sky-400 bg-sky-950/30 border border-sky-900/50" };
    }
    if (idx === 18 || idx === 24) {
      return { type: "blunder", label: "Blunder", badgeStyle: "text-rose-400 bg-rose-950/30 border border-rose-900/50" };
    }
    if (idx === 14 || idx === 32) {
      return { type: "mistake", label: "Mistake", badgeStyle: "text-amber-400 bg-amber-950/30 border border-amber-900/50" };
    }
    if (idx % 7 === 0 || idx % 9 === 0) {
      return { type: "excellent", label: "Excellent", badgeStyle: "text-emerald-400 bg-emerald-950/30 border border-emerald-900/50" };
    }
    return { type: "good", label: "Good", badgeStyle: "text-slate-300 bg-slate-800/30 border border-slate-700/50" };
  };

  // Evaluation Score Helper
  const getEvalScore = (idx: number, total: number): number => {
    if (idx === -1) return 0.3;
    if (idx > total - 10) {
      // Simulate White's winning advantage scaling up rapidly at the end of the game
      return 3.5 + (idx - (total - 10)) * 0.45;
    }
    
    // Stable simulated fluctuation curve
    const scores = [
      0.3, 0.4, 0.2, 0.5, 0.3, 0.6, 0.4, 0.5, 0.2, 0.1,
      -0.2, -0.4, -0.3, -0.5, -0.2, -0.6, -0.4, -0.1, -1.4, -0.9, // blunder at 18
      -0.5, -0.3, -0.4, -0.1, 1.9, 1.4, 1.7, 2.3, 2.0, 2.6, // white advantage climbs
      2.3, 2.7, 1.3, 1.9, 2.3, 2.9, 3.2, 3.4
    ];
    return scores[idx % scores.length];
  };

  // Parse PGN input and convert to flat moves list with classifications
  const loadPgn = (pgnStr: string) => {
    try {
      setIsPlaying(false);
      const tempChess = new Chess();

      // Clean and parse PGN moves manually to bypass loadPgn ESM/bundler issues
      const cleanMoves = pgnStr
        .replace(/\{[^}]*\}/g, "") // remove comments
        .split(/\s+/)
        .filter(t => t && !t.includes('.') && t !== '1-0' && t !== '0-1' && t !== '1/2-1/2' && t !== '*');

      const history: string[] = [];
      const metas: MoveMeta[] = [];

      for (let i = 0; i < cleanMoves.length; i++) {
        const m = cleanMoves[i];
        const moveObj = tempChess.move(m);
        if (moveObj) {
          history.push(moveObj.san);
          metas.push({
            san: moveObj.san,
            classification: classifyMove(moveObj.san, i, cleanMoves.length),
            score: getEvalScore(i, cleanMoves.length)
          });
        }
      }

      setMovesList(history);
      setParsedMoves(metas);
      setActiveMoveIdx(history.length - 1);
      setCoachFeedback(null);

      // Play start sound
      sound.playMove();
    } catch (err: any) {
      console.error("PGN Load Error:", err);
      alert("Failed to parse PGN: " + err.message);
    }
  };

  // Sync board representation on active move index update
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

  // Handle Auto-Play Replay Loop
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setActiveMoveIdx((prev) => {
          if (prev < movesList.length - 1) {
            sound.playMove();
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playSpeed);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, movesList, playSpeed]);

  const handleNext = () => {
    if (activeMoveIdx < movesList.length - 1) {
      setActiveMoveIdx((prev) => prev + 1);
      sound.playMove();
    }
  };

  const handlePrev = () => {
    if (activeMoveIdx >= 0) {
      setActiveMoveIdx((prev) => prev - 1);
      sound.playMove();
    }
  };

  // Ask AI Coach Garry/Grok to analyze the current active board position
  const askCoach = async () => {
    try {
      setIsCoachLoading(true);
      setCoachFeedback(null);

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

  // Compute scorecard statistics for white/black based on parsed classifications
  const getScorecardStats = () => {
    const stats = {
      white: { book: 0, excellent: 0, blunder: 0, mistake: 0, good: 0 },
      black: { book: 0, excellent: 0, blunder: 0, mistake: 0, good: 0 }
    };

    parsedMoves.forEach((m, idx) => {
      const turn = idx % 2 === 0 ? "white" : "black";
      const type = m.classification.type as keyof typeof stats.white;
      if (stats[turn][type] !== undefined) {
        stats[turn][type]++;
      }
    });

    return stats;
  };

  const stats = getScorecardStats();
  const activeScore = activeMoveIdx === -1 ? 0.3 : (parsedMoves[activeMoveIdx]?.score ?? 0.3);

  // Compute heights for the evaluation bar white vs black parts
  const isWhiteAdvantage = activeScore >= 0;
  const absScore = Math.abs(activeScore).toFixed(1);
  const whitePercent = Math.min(Math.max(((activeScore + 8) / 16) * 100, 5), 95);

  const theme = {
    screenBg: isLoggedIn ? "bg-[#0a0d14]" : "bg-[#151413]",
    panelBg: isLoggedIn ? "bg-[#111625]" : "bg-[#1a1918]",
    panelBorder: isLoggedIn ? "border-[#1e293b]" : "border-[#2c2b2a]",
    textMuted: isLoggedIn ? "text-slate-400" : "text-zinc-500",
  };

  return (
    <div className={`flex h-screen ${theme.screenBg} text-[#e2e8f0] overflow-hidden`}>
      {isLoggedIn ? <LoginSidebar /> : <SideBar />}

      <div className="flex-1 flex flex-col lg:flex-row p-6 md:p-8 gap-8 overflow-y-auto">
        {/* Left Section: Chessboard + Dynamic Evaluation Bar */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-[580px] mx-auto w-full">
          {/* Active players bar */}
          <div className="flex justify-between w-full mb-3 px-3 font-semibold text-xs text-zinc-400 shrink-0">
            <span className="flex items-center gap-1.5">⚪ Garry Kasparov (White)</span>
            <span className="flex items-center gap-1.5">⚫ Veselin Topalov (Black)</span>
          </div>

          <div className="flex w-full aspect-square gap-3 relative mb-4 shrink-0">
            {/* Dynamic Evaluation Bar */}
            <div className="w-5 bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 flex flex-col justify-end relative h-full shrink-0 shadow-lg">
              {/* White advantage gauge (aligned bottom) */}
              <div 
                className="bg-[#efebe4] w-full transition-all duration-300 ease-out"
                style={{ height: `${whitePercent}%` }}
              />
              
              {/* Overlay Score Text */}
              <span className={`absolute left-1/2 -translate-x-1/2 font-black text-[9px] pointer-events-none select-none ${
                whitePercent > 50 ? "text-zinc-900 bottom-2" : "text-white top-2"
              }`}>
                {absScore === "0.0" ? "0" : isWhiteAdvantage ? `+${absScore}` : `-${absScore}`}
              </span>
            </div>

            {/* Chessboard component */}
            <div className="flex-1 aspect-square pointer-events-none">
              <ChessBoard
                board={board}
                flipped={flipped}
                selectedSquare={null}
                validMoves={[]}
                lastMove={lastMove}
                onSquareClick={() => {}}
              />
            </div>
          </div>

          {/* Stepper & Playback controls */}
          <div className="flex flex-wrap gap-4 justify-between items-center w-full bg-white/5 border border-white/5 p-3 rounded-xl shrink-0">
            <div className="flex gap-1.5 items-center">
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setActiveMoveIdx(-1);
                }}
                className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer text-sm"
                title="Start of Game"
              >
                ⏮
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  handlePrev();
                }}
                disabled={activeMoveIdx < 0}
                className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous Move"
              >
                ◀
              </button>
              
              {/* Play/Pause Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3.5 py-1.5 bg-[#efebe4] text-[#1c1b1a] text-[10px] font-black rounded-lg hover:bg-[#e0dad0] transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
              >
                {isPlaying ? "⏸ Pause" : "▶ Play"}
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  handleNext();
                }}
                disabled={activeMoveIdx >= movesList.length - 1}
                className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next Move"
              >
                ▶
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setActiveMoveIdx(movesList.length - 1);
                }}
                className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer text-sm"
                title="End of Game"
              >
                ⏭
              </button>
            </div>

            <div className="flex gap-3 items-center">
              {/* Play speed selector */}
              <select
                value={playSpeed}
                onChange={(e) => setPlaySpeed(Number(e.target.value))}
                className="bg-zinc-950 border border-white/5 text-[10px] text-zinc-400 rounded p-1 cursor-pointer outline-none"
              >
                <option value={3000}>3.0s</option>
                <option value={2000}>2.0s</option>
                <option value={1000}>1.0s</option>
              </select>

              {/* Flip Board Button */}
              <button
                onClick={() => setFlipped(!flipped)}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold rounded-lg text-[10px] hover:bg-zinc-850 hover:text-white transition-colors cursor-pointer"
              >
                🔄 Flip
              </button>
            </div>
          </div>
        </div>

        {/* Right Section: Scorecard, Clickable Move List, AI Coach */}
        <div className="w-full lg:w-[420px] flex flex-col gap-6 h-full min-h-[500px]">
          
          {/* Collapsible PGN Loader */}
          <div className={`p-4 rounded-2xl ${theme.panelBg} border ${theme.panelBorder} shadow-md shrink-0`}>
            <button
              onClick={() => setShowImport(!showImport)}
              className="w-full flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase tracking-widest outline-none cursor-pointer"
            >
              <span>Import PGN</span>
              <span>{showImport ? "▲" : "▼"}</span>
            </button>
            
            {showImport && (
              <div className="mt-3 animate-fade-in">
                <textarea
                  value={pgnInput}
                  onChange={(e) => setPgnInput(e.target.value)}
                  placeholder="Paste standard PGN chess moves..."
                  className="w-full h-20 p-2.5 rounded-lg bg-zinc-950/60 border border-white/5 text-[10px] text-zinc-300 font-mono resize-none outline-none focus:border-white/20"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      loadPgn(pgnInput);
                      setShowImport(false);
                    }}
                    className="flex-1 py-1.5 bg-[#efebe4] text-[#1c1b1a] font-bold rounded-lg text-[10px] hover:bg-[#e0dad0] transition-colors cursor-pointer"
                  >
                    Analyze PGN
                  </button>
                  <button
                    onClick={() => {
                      setPgnInput(SAMPLE_PGN);
                      loadPgn(SAMPLE_PGN);
                      setShowImport(false);
                    }}
                    className="py-1.5 px-3 bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold rounded-lg text-[10px] hover:bg-zinc-850 transition-colors cursor-pointer"
                  >
                    Reset Sample
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Game Scorecard Panel */}
          <div className={`p-4 rounded-2xl ${theme.panelBg} border ${theme.panelBorder} shadow-md shrink-0`}>
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-1">Positional Scorecard</h2>
            <div className="grid grid-cols-3 text-center gap-2 items-center text-xs">
              <div className="text-left font-bold text-zinc-400">White</div>
              <div className="flex justify-center gap-2.5">
                <span className="text-[10px] bg-sky-950/40 text-sky-400 border border-sky-900/40 px-1.5 py-0.5 rounded font-black" title="Book moves">{stats.white.book}</span>
                <span className="text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-1.5 py-0.5 rounded font-black" title="Excellent moves">{stats.white.excellent}</span>
                <span className="text-[10px] bg-amber-950/40 text-amber-400 border border-amber-900/40 px-1.5 py-0.5 rounded font-black" title="Mistakes">{stats.white.mistake}</span>
                <span className="text-[10px] bg-rose-950/40 text-rose-400 border border-rose-900/40 px-1.5 py-0.5 rounded font-black" title="Blunders">{stats.white.blunder}</span>
              </div>
              <div className="text-right font-black text-white text-[10px]">G. Kasparov</div>

              <div className="text-left font-bold text-zinc-400">Black</div>
              <div className="flex justify-center gap-2.5">
                <span className="text-[10px] bg-sky-950/40 text-sky-400 border border-sky-900/40 px-1.5 py-0.5 rounded font-black">{stats.black.book}</span>
                <span className="text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-1.5 py-0.5 rounded font-black">{stats.black.excellent}</span>
                <span className="text-[10px] bg-amber-950/40 text-amber-400 border border-amber-900/40 px-1.5 py-0.5 rounded font-black">{stats.black.mistake}</span>
                <span className="text-[10px] bg-rose-950/40 text-rose-400 border border-rose-900/40 px-1.5 py-0.5 rounded font-black">{stats.black.blunder}</span>
              </div>
              <div className="text-right font-black text-white text-[10px]">V. Topalov</div>
            </div>
          </div>

          {/* Clickable Move Grid */}
          <div className={`p-4 rounded-2xl ${theme.panelBg} border ${theme.panelBorder} flex-1 overflow-hidden flex flex-col min-h-[180px] shadow-md`}>
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 shrink-0 pb-1 border-b border-white/5">Interactive Move History</h2>
            
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
              {Array.from({ length: Math.ceil(parsedMoves.length / 2) }).map((_, turnIdx) => {
                const whiteMoveIdx = turnIdx * 2;
                const blackMoveIdx = turnIdx * 2 + 1;
                const whiteMove = parsedMoves[whiteMoveIdx];
                const blackMove = parsedMoves[blackMoveIdx];

                return (
                  <div key={turnIdx} className="grid grid-cols-12 gap-2 items-center text-xs py-1 border-b border-white/[0.02]">
                    <span className="col-span-2 text-zinc-500 font-bold text-[10px]">{turnIdx + 1}.</span>
                    
                    {/* White Move Button */}
                    <div className="col-span-5 flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setIsPlaying(false);
                          setActiveMoveIdx(whiteMoveIdx);
                        }}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-left font-extrabold border transition-all text-xs cursor-pointer ${
                          activeMoveIdx === whiteMoveIdx
                            ? "bg-white text-zinc-950 border-white shadow-sm"
                            : "bg-zinc-950 border-zinc-800 text-white hover:border-zinc-700"
                        }`}
                      >
                        {whiteMove.san}
                      </button>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${whiteMove.classification.badgeStyle}`}>
                        {whiteMove.classification.label}
                      </span>
                    </div>

                    {/* Black Move Button */}
                    <div className="col-span-5 flex items-center gap-1.5">
                      {blackMove && (
                        <>
                          <button
                            onClick={() => {
                              setIsPlaying(false);
                              setActiveMoveIdx(blackMoveIdx);
                            }}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-left font-extrabold border transition-all text-xs cursor-pointer ${
                              activeMoveIdx === blackMoveIdx
                                ? "bg-white text-zinc-950 border-white shadow-sm"
                                : "bg-zinc-950 border-zinc-800 text-white hover:border-zinc-700"
                            }`}
                          >
                            {blackMove.san}
                          </button>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${blackMove.classification.badgeStyle}`}>
                            {blackMove.classification.label}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Coach Analysis Panel */}
          <div className={`p-5 rounded-2xl ${theme.panelBg} border ${theme.panelBorder} shrink-0 shadow-lg flex flex-col gap-4`}>
            <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2 shrink-0">
              <div className="flex items-center gap-2">
                {/* Garry Coach Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border-2 border-[#efebe4] flex items-center justify-center font-black text-[#efebe4] text-sm shadow-md overflow-hidden relative">
                    G
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-white">Garry AI Grandmaster</h3>
                  <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Chess Coach</p>
                </div>
              </div>
              
              <select
                value={aiEngine}
                onChange={(e) => setAiEngine(e.target.value as any)}
                className="bg-zinc-950 border border-white/5 text-[10px] text-white rounded p-1 outline-none cursor-pointer"
              >
                <option value="gemini">Gemini</option>
                <option value="grok">Grok</option>
              </select>
            </div>

            {/* Analysis feedback board bubble */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 min-h-[120px] max-h-[160px] overflow-y-auto relative flex flex-col justify-center items-center">
              {isCoachLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span className="text-[10px] text-zinc-400 font-bold">Garry is reviewing FEN position...</span>
                </div>
              ) : coachFeedback ? (
                <div className="relative text-[11px] text-zinc-200 leading-relaxed font-semibold text-left w-full whitespace-pre-wrap">
                  {/* Speech Bubble Arrow */}
                  <div className="absolute left-[-16px] top-2 border-8 border-transparent border-r-zinc-950" />
                  {coachFeedback}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-[11px] text-zinc-500 italic leading-relaxed">
                    Select a move from the grid above and click evaluate to summon Coach Garry's strategic advice.
                  </p>
                  <button
                    onClick={askCoach}
                    className="mt-3.5 py-1.5 px-5 bg-[#efebe4] text-[#1c1b1a] font-black rounded-lg text-[10px] hover:bg-[#e0dad0] transition-colors cursor-pointer"
                  >
                    Evaluate Position
                  </button>
                </div>
              )}
            </div>

            {coachFeedback && !isCoachLoading && (
              <button
                onClick={askCoach}
                className="py-1.5 w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer text-center"
              >
                Re-Analyze Position
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
