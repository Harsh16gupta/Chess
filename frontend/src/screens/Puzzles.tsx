import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { ChessBoard } from "../components/ChessBoard";
import { SideBar } from "../components/SideBar";
import { LoginSidebar } from "../components/LoginSidebar";
import { useAuth } from "../context/AuthContext";
import { sound } from "../utils/sound";

interface Puzzle {
  id: number;
  title: string;
  desc: string;
  difficulty: "Novice" | "Intermediate" | "Master";
  elo: number;
  fen: string;
  solution: string[]; // e.g. ["d1d8", "d8f8"]
  opponentMoves: string[]; // e.g. ["f7f8"]
}

const PUZZLES: Puzzle[] = [
  {
    id: 1,
    title: "Back Rank Mate",
    desc: "The Black King is trapped behind its own shield of pawns. Deliver a swift back-rank checkmate.",
    difficulty: "Novice",
    elo: 800,
    fen: "6k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1",
    solution: ["d1d8"],
    opponentMoves: []
  },
  {
    id: 2,
    title: "The Queen Deflection",
    desc: "Force the Black Queen into a pinned defensive position, then capture it to win the game.",
    difficulty: "Intermediate",
    elo: 1200,
    fen: "6k1/5qpp/8/8/8/8/6PP/3R2K1 w - - 0 1",
    solution: ["d1d8", "d8f8"],
    opponentMoves: ["f7f8"]
  },
  {
    id: 3,
    title: "Knight Fork Attack",
    desc: "Spot the unprotected black piece and coordinate your Knight to fork the King and Queen.",
    difficulty: "Master",
    elo: 1600,
    fen: "6k1/5ppp/2q5/4N3/8/8/5PPP/6K1 w - - 0 1",
    solution: ["e5c6"],
    opponentMoves: []
  }
];

export default function Puzzles() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // Active puzzle state
  const [currentIdx, setCurrentIdx] = useState(0);
  const activePuzzle = PUZZLES[currentIdx];

  const [chess, setChess] = useState(() => new Chess(activePuzzle.fen));
  const [board, setBoard] = useState(chess.board());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Puzzle validation state
  const [moveStep, setMoveStep] = useState(0); // index in solution array
  const [puzzleState, setPuzzleState] = useState<"playing" | "success" | "failed">("playing");
  const [feedback, setFeedback] = useState<string>("");
  const [hintUsed, setHintUsed] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);
  const [userRating, setUserRating] = useState(() => {
    return Number(localStorage.getItem("rating")) || 1200;
  });

  // Re-initialize chess when switching puzzles
  useEffect(() => {
    const newChess = new Chess(activePuzzle.fen);
    setChess(newChess);
    setBoard(newChess.board());
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setMoveStep(0);
    setPuzzleState("playing");
    setFeedback("");
    setHintUsed(false);
  }, [currentIdx, activePuzzle.fen]);

  // Handle square clicks
  const handleSquareClick = (square: string) => {
    if (puzzleState !== "playing") return;

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    // If a square is already selected, try to make a move
    if (selectedSquare) {
      const moveStr = `${selectedSquare}${square}`;
      const isCorrectMove = activePuzzle.solution[moveStep] === moveStr;

      try {
        const moveObj = chess.move({
          from: selectedSquare,
          to: square,
          promotion: "q", // default to queen for simplicity
        });

        if (moveObj) {
          // Play sounds
          if (chess.isCheckmate() || (isCorrectMove && moveStep === activePuzzle.solution.length - 1)) {
            sound.playGameOver("win");
          } else if (moveObj.captured) {
            sound.playCapture();
          } else {
            sound.playMove();
          }

          setBoard(chess.board());
          setLastMove({ from: selectedSquare, to: square });
          setSelectedSquare(null);
          setValidMoves([]);

          if (isCorrectMove) {
            const nextStep = moveStep + 1;
            if (nextStep === activePuzzle.solution.length) {
              // Puzzle solved successfully!
              setPuzzleState("success");
              setFeedback("🎉 Correct! Outstanding tactical vision.");
              setSolvedCount(prev => prev + 1);
              // Update rating
              const ratingGain = hintUsed ? 5 : 15;
              const newRating = userRating + ratingGain;
              setUserRating(newRating);
              localStorage.setItem("rating", String(newRating));
            } else {
              // Play opponent's move
              setFeedback("Correct move! Watching opponent reply...");
              setMoveStep(nextStep);

              setTimeout(() => {
                const oppMove = activePuzzle.opponentMoves[nextStep - 1];
                const fromSq = oppMove.substring(0, 2);
                const toSq = oppMove.substring(2, 4);

                const oppResult = chess.move({
                  from: fromSq,
                  to: toSq,
                  promotion: "q"
                });

                if (oppResult) {
                  sound.playMove();
                  setBoard(chess.board());
                  setLastMove({ from: fromSq, to: toSq });
                }
                setFeedback("Your turn! Find the winning continuation.");
              }, 1000);
            }
          } else {
            // Wrong move
            setPuzzleState("failed");
            setFeedback("❌ That's not the solution. Try again!");
          }
          return;
        }
      } catch (err) {
        // Invalid chess move
        console.log("Invalid move tried:", moveStr);
      }
    }

    // Otherwise, select the square if it contains a piece of the correct turn
    const piece = chess.get(square as any);
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      const moves = chess.moves({ square: square as any, verbose: true }) as any[];
      setValidMoves(moves.map((m) => m.to));
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const handleReset = () => {
    const newChess = new Chess(activePuzzle.fen);
    setChess(newChess);
    setBoard(newChess.board());
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setMoveStep(0);
    setPuzzleState("playing");
    setFeedback("Puzzle reset. Find the best move!");
  };

  const handleHint = () => {
    if (puzzleState !== "playing") return;
    setHintUsed(true);
    const correctMoveStr = activePuzzle.solution[moveStep];
    const fromSq = correctMoveStr.substring(0, 2);
    setSelectedSquare(fromSq);
    const moves = chess.moves({ square: fromSq as any, verbose: true }) as any[];
    setValidMoves(moves.map((m) => m.to));
    setFeedback(`Hint: Focus on the piece on ${fromSq.toUpperCase()}.`);
  };

  // Sleek minimalist colors
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
          <div className="w-full h-full">
            <ChessBoard
              board={board}
              flipped={false}
              selectedSquare={selectedSquare}
              validMoves={validMoves}
              lastMove={lastMove}
              onSquareClick={handleSquareClick}
            />
          </div>
        </div>

        {/* Right: Info and controls */}
        <div className="w-full md:w-[400px] flex flex-col gap-6">
          <div className={`p-6 rounded-2xl ${theme.panelBg} border ${theme.panelBorder} shadow-lg`}>
            {/* Header info */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] bg-white/10 text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                Daily Puzzle
              </span>
              <span className="text-sm font-bold text-emerald-400">
                Rating: {userRating} ELO
              </span>
            </div>

            <h1 className="text-2xl font-black text-white leading-tight">{activePuzzle.title}</h1>
            <p className={`mt-2 text-xs leading-relaxed ${theme.textMuted}`}>{activePuzzle.desc}</p>

            <div className="flex items-center gap-3 mt-4 py-2 border-y border-white/5">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Difficulty</span>
                <span className={`text-xs font-bold ${
                  activePuzzle.difficulty === "Novice" ? "text-emerald-400" :
                  activePuzzle.difficulty === "Intermediate" ? "text-amber-400" : "text-rose-400"
                }`}>{activePuzzle.difficulty}</span>
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div>
                <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Puzzle ELO</span>
                <span className="text-xs font-bold text-white">{activePuzzle.elo}</span>
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div>
                <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Solved Today</span>
                <span className="text-xs font-bold text-emerald-400">{solvedCount}</span>
              </div>
            </div>

            {/* Puzzle State Feedback */}
            <div className="my-5 min-h-[50px] flex items-center justify-center p-3 bg-white/5 rounded-xl border border-white/5 text-center">
              <span className={`text-sm font-bold ${
                puzzleState === "success" ? "text-emerald-400" :
                puzzleState === "failed" ? "text-rose-400 animate-pulse" : "text-white"
              }`}>
                {feedback || "Find the best move for White!"}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold rounded-xl text-xs hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={handleHint}
                disabled={puzzleState !== "playing"}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Get Hint
              </button>
            </div>
          </div>

          {/* Puzzle Playlist / Directory */}
          <div className={`p-6 rounded-2xl ${theme.panelBg} border ${theme.panelBorder} flex-1 overflow-y-auto`}>
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Tactical Playlist</h2>
            <div className="flex flex-col gap-3">
              {PUZZLES.map((puzzle, idx) => (
                <div
                  key={puzzle.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex justify-between items-center ${
                    idx === currentIdx
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-white/[0.02] border-white/5 hover:bg-white/5 text-zinc-400"
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-extrabold">{puzzle.title}</h3>
                    <p className="text-[10px] text-zinc-500 font-medium">ELO {puzzle.elo}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    puzzle.difficulty === "Novice" ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900/50" :
                    puzzle.difficulty === "Intermediate" ? "bg-amber-950/50 text-amber-400 border border-amber-900/50" :
                    "bg-rose-950/50 text-rose-400 border border-rose-900/50"
                  }`}>
                    {puzzle.difficulty}
                  </span>
                </div>
              ))}

              {/* Mock locked premium puzzles */}
              {[4, 5, 6].map((num) => (
                <div
                  key={num}
                  className="p-4 bg-white/[0.01] border border-dashed border-white/5 text-zinc-600 rounded-xl flex justify-between items-center relative group overflow-hidden cursor-pointer"
                  onClick={() => alert("Premium Puzzles Coming Soon! Link your accounts to save progress and unlock 50,000+ chess puzzles.")}
                >
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-zinc-650" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      Advanced Tactics #{num * 4}
                    </h3>
                    <p className="text-[10px] text-zinc-700">ELO {1500 + num * 120}</p>
                  </div>
                  <span className="text-[9px] bg-zinc-950 text-zinc-700 border border-zinc-900/50 font-bold px-2 py-0.5 rounded-full">
                    Locked
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
