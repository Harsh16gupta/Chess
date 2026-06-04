import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { ChessBoard } from "../components/ChessBoard";
import { SideBar } from "../components/SideBar";
import { LoginSidebar } from "../components/LoginSidebar";
import { useAuth } from "../context/AuthContext";
import { sound } from "../utils/sound";

interface LessonStep {
  move: string; // e.g. "e2e4"
  comment: string;
}

interface Lesson {
  id: number;
  title: string;
  category: "Openings" | "Tactics" | "Endgames";
  difficulty: "Novice" | "Intermediate" | "Master";
  desc: string;
  initialFen: string;
  steps: LessonStep[];
}

const LESSONS: Lesson[] = [
  {
    id: 1,
    title: "Scholar's Mate (4-Move Mate)",
    category: "Openings",
    difficulty: "Novice",
    desc: "Learn the quickest checkmate in chess and how to target the vulnerable f7-square in the opening.",
    initialFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    steps: [
      { move: "e2e4", comment: "White opens with the King's Pawn to control the center." },
      { move: "e7e5", comment: "Black matches the response, stakes a claim in the center." },
      { move: "d1h5", comment: "White brings out the Queen early to attack the e5 pawn and f7 square." },
      { move: "b8c6", comment: "Black defends the e5 pawn with the Knight." },
      { move: "f1c4", comment: "White develops the Bishop, combining with the Queen to double-attack f7." },
      { move: "g8f6", comment: "Black attacks the White Queen, but ignores the mating threat on f7!" },
      { move: "h5f7", comment: "Checkmate! The Queen captures f7, protected by the c4 Bishop." }
    ]
  },
  {
    id: 2,
    title: "King Safety (Kingside Castle)",
    category: "Tactics",
    difficulty: "Novice",
    desc: "Understand how to execute castling to shield your King and activate your defensive Rooks.",
    initialFen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 5 5",
    steps: [
      { move: "e1g1", comment: "White castles kingside. The King moves two squares to g1 and the Rook jumps to f1. Safe and active!" }
    ]
  },
  {
    id: 3,
    title: "Exploiting the Bishop Pin",
    category: "Tactics",
    difficulty: "Intermediate",
    desc: "See how pins restrict the movement of defending pieces and how to force favorable trades.",
    initialFen: "r1bqk2r/pppp1ppp/2n2n2/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 3 4",
    steps: [
      { move: "a2a3", comment: "White pushes a3 to force Black's pinned Bishop to make a decision." },
      { move: "b4c3", comment: "Black elects to trade the Bishop for the Knight, doubling White's pawns." },
      { move: "b2c3", comment: "White recaptures, resolving the pin and opening files for counterplay." }
    ]
  }
];

export default function Learn() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // Active lesson
  const [currentIdx, setCurrentIdx] = useState(0);
  const activeLesson = LESSONS[currentIdx];

  const [chess, setChess] = useState(() => new Chess(activeLesson.initialFen));
  const [board, setBoard] = useState(chess.board());
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Lesson playback state
  const [stepIdx, setStepIdx] = useState(0); // 0 means starting state
  const [comment, setComment] = useState("Click 'Next Move' to start the lesson!");

  // Reset chess and playback whenever lesson changes
  useEffect(() => {
    setChess(new Chess(activeLesson.initialFen));
    setStepIdx(0);
    setLastMove(null);
    setComment("Click 'Next Move' to start the lesson!");
  }, [currentIdx, activeLesson]);

  // Sync board representation
  useEffect(() => {
    setBoard(chess.board());
  }, [chess]);

  const handleNextMove = () => {
    if (stepIdx >= activeLesson.steps.length) {
      setComment("Lesson complete! Select another topic below.");
      return;
    }

    const currentStep = activeLesson.steps[stepIdx];
    const fromSq = currentStep.move.substring(0, 2);
    const toSq = currentStep.move.substring(2, 4);

    try {
      const result = chess.move({
        from: fromSq,
        to: toSq,
        promotion: "q"
      });

      if (result) {
        if (chess.isGameOver()) {
          sound.playGameOver("win");
        } else if (result.captured) {
          sound.playCapture();
        } else {
          sound.playMove();
        }

        setLastMove({ from: fromSq, to: toSq });
        setBoard(chess.board());
        setComment(currentStep.comment);
        setStepIdx(prev => prev + 1);
      }
    } catch (err) {
      console.error("Invalid move in lesson database:", currentStep.move);
    }
  };

  const handleRestart = () => {
    setChess(new Chess(activeLesson.initialFen));
    setStepIdx(0);
    setLastMove(null);
    setComment("Lesson reset. Click 'Next Move' to run it again!");
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
        {/* Left: Mini-Board (Playable viewer only, clicks disabled to prevent disrupting step order) */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-[550px] mx-auto w-full aspect-square">
          <div className="w-full h-full pointer-events-none">
            <ChessBoard
              board={board}
              flipped={false}
              selectedSquare={null}
              validMoves={[]}
              lastMove={lastMove}
              onSquareClick={() => {}}
            />
          </div>
        </div>

        {/* Right: Lesson information */}
        <div className="w-full md:w-[400px] flex flex-col gap-6">
          <div className={`p-6 rounded-2xl ${theme.panelBg} border ${theme.panelBorder} shadow-lg`}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] bg-white/10 text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                {activeLesson.category}
              </span>
              <span className={`text-xs font-bold ${
                activeLesson.difficulty === "Novice" ? "text-emerald-400" :
                activeLesson.difficulty === "Intermediate" ? "text-amber-400" : "text-rose-400"
              }`}>
                {activeLesson.difficulty}
              </span>
            </div>

            <h1 className="text-2xl font-black text-white leading-tight">{activeLesson.title}</h1>
            <p className={`mt-2 text-xs leading-relaxed ${theme.textMuted}`}>{activeLesson.desc}</p>

            {/* Commentary box */}
            <div className="my-5 min-h-[90px] flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-white/5 text-center">
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5">
                Instruction
              </div>
              <p className="text-xs text-white leading-relaxed font-semibold">
                {comment}
              </p>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <button
                onClick={handleRestart}
                className="py-3 px-4 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold rounded-xl text-xs hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
              >
                Restart
              </button>
              <button
                onClick={handleNextMove}
                disabled={stepIdx >= activeLesson.steps.length}
                className="flex-1 py-3 bg-[#efebe4] text-[#1c1b1a] font-bold rounded-xl text-xs hover:bg-[#e0dad0] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-center"
              >
                {stepIdx === 0 ? "Start Lesson" : stepIdx >= activeLesson.steps.length ? "Completed" : "Next Move"}
              </button>
            </div>
            
            {/* Progress indicator bar */}
            <div className="mt-4 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-400 h-full transition-all duration-300"
                style={{ width: `${(stepIdx / activeLesson.steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Curriculum List */}
          <div className={`p-6 rounded-2xl ${theme.panelBg} border ${theme.panelBorder} flex-1 overflow-y-auto`}>
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Lesson Curriculum</h2>
            <div className="flex flex-col gap-3">
              {LESSONS.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex justify-between items-center ${
                    idx === currentIdx
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-white/[0.02] border-white/5 hover:bg-white/5 text-zinc-400"
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-extrabold">{lesson.title}</h3>
                    <p className="text-[10px] text-zinc-500 font-medium">{lesson.category} • {lesson.steps.length} Moves</p>
                  </div>
                </div>
              ))}

              {/* Locked/Advanced Lessons */}
              {["Mastering Pawn Endgames", "Advanced Rook Maneuvers", "Defending Against the Sicilian"].map((title, i) => (
                <div
                  key={i}
                  className="p-4 bg-white/[0.01] border border-dashed border-white/5 text-zinc-650 rounded-xl flex justify-between items-center relative group overflow-hidden cursor-pointer"
                  onClick={() => alert("Masterclass Lessons Coming Soon! Enter your email on settings to join the beta waitlist.")}
                >
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-zinc-650" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      {title}
                    </h3>
                    <p className="text-[10px] text-zinc-700">Course Release July 2026</p>
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
