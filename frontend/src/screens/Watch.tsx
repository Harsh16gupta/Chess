import { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { ChessBoard } from "../components/ChessBoard";
import { SideBar } from "../components/SideBar";
import { LoginSidebar } from "../components/LoginSidebar";
import { useAuth } from "../context/AuthContext";
import { sound } from "../utils/sound";

interface StreamMatch {
  id: number;
  white: string;
  black: string;
  whiteRating: number;
  blackRating: number;
  title: string;
  moves: string[];
}

const STREAM_MATCHES: StreamMatch[] = [
  {
    id: 1,
    white: "Garry Kasparov",
    black: "Deep Blue",
    whiteRating: 2820,
    blackRating: 2700,
    title: "1996 Game 1: The Human-Machine Showdown",
    moves: [
      "e4", "c5", "c3", "d5", "exd5", "Qxd5", "d4", "Nf6", "Nf3", "Bg4", 
      "Be2", "e6", "h3", "Bh5", "O-O", "Nc6", "Be3", "cxd4", "cxd4", "Bb4", 
      "a3", "Ba5", "Nc3", "Qd6", "Nb5", "Qe7", "Ne5", "Bxe2", "Qxe2", "O-O", 
      "Rac1", "Rac8", "Bg5", "Bb6", "Bxf6", "gxf6", "Nc4", "Rfd8", "Nxb6", "axb6", 
      "Rfd1", "f5", "Qe3", "Qf6", "d5", "Rxd5", "Rxd5", "exd5", "b3", "Kh8", 
      "Qxb6", "Rg8", "Qc5", "d4", "Nd6", "f4", "Nxb7", "Ne5", "Qd5", "f3", 
      "g3", "Nd3", "Rc7", "Re8", "Nd6", "Re1+", "Kh2", "Nxf2", "Nxf7+", "Kg7", 
      "Ng5+", "Kh6", "Rxh7+"
    ]
  },
  {
    id: 2,
    white: "Bobby Fischer",
    black: "Boris Spassky",
    whiteRating: 2785,
    blackRating: 2660,
    title: "1972 Game 6: The Match of the Century",
    moves: [
      "c4", "e6", "Nf3", "d5", "d4", "Nf6", "Nc3", "Be7", "Bg5", "O-O", 
      "e3", "h6", "Bh4", "b6", "cxd5", "Nxd5", "Bxe7", "Qxe7", "Nxd5", "exd5", 
      "Rc1", "Be6", "Qa4", "c5", "Qa3", "Rc8", "Bb5", "a6", "dxc5", "bxc5", 
      "O-O", "Ra7", "Be2", "Nd7", "Nd4", "Qf8", "Nxe6", "fxe6", "e4", "d4", 
      "f4", "Qe7", "e5", "Rb8", "Bc4", "Kh8", "Qh3", "Nf8", "b3", "a5", 
      "f5", "exf5", "Rxf5", "Nh7", "Rcf1", "Qd8", "Qg3", "Re7", "h4", "Rbb7", 
      "e6", "Rbc7", "Qe5", "Qe8", "a4", "Qd8", "R1f2", "Qe8", "R2f3", "Qd8", 
      "Bd3", "Qe8", "Qe4", "Nf6", "Rxf6", "gxf6", "Rxf6", "Kg8", "Bc4", "Kh8", 
      "Qf4"
    ]
  },
  {
    id: 3,
    white: "Carlsen",
    black: "Nakamura",
    whiteRating: 2882,
    blackRating: 2875,
    title: "Speed Chess Championship Final 2026",
    moves: [
      "e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7",
      "Re1", "b5", "Bb3", "d6", "c3", "O-O", "h3", "Nb8", "d4", "Nbd7",
      "c4", "c6", "cxb5", "axb5", "Qc2", "Bb7", "dxe5", "dxe5", "Be3", "Qc7",
      "a4", "h6", "Nbd2", "bxa4", "Bxa4", "Rfc8", "Nc4", "Ba6", "Bb3", "Bxb3",
      "Qxb3", "Rxa1", "Rxa1", "Nxe4", "Nb6", "Rb8", "Qc4", "Nxb6", "Qxe4"
    ]
  }
];

const CHAT_PHRASES = [
  "Wow! Check out that pawn structure.",
  "Kasparov is cooking something big here.",
  "Fischer's endgame conversion is pure art.",
  "Can black survive this rook lift?",
  "Magnus is playing at 99% accuracy today.",
  "Hikaru is pre-moving everything!",
  "Is that a theoretical draw or can white squeeze a win?",
  "OH! Queen sacrifice incoming??",
  "Beautiful knight maneuver.",
  "I did not expect that defensive move.",
  "Chat is this winning?",
  "Insane time scramble!",
  "Garry Grandmaster is shaking his head in the commentary box."
];

const CHAT_USERS = [
  "ChessKing99", "CastleQueen", "RooknRoll", "PawnStar", "GarryFan", 
  "StockfishEnjoyer", "SicilianDefense", "GM_Enthusiast", "MateInTwo"
];

export default function Watch() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // Active match
  const [currentIdx, setCurrentIdx] = useState(0);
  const activeMatch = STREAM_MATCHES[currentIdx];

  const [chess, setChess] = useState(() => new Chess());
  const [board, setBoard] = useState(chess.board());
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Playback index
  const [moveIndex, setMoveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Chat message feed
  const [chatMessages, setChatMessages] = useState<{ id: number; user: string; text: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize new game logic on match switch
  useEffect(() => {
    const newChess = new Chess();
    setChess(newChess);
    setBoard(newChess.board());
    setMoveIndex(0);
    setLastMove(null);
    setChatMessages([
      { id: 1, user: "System", text: `🔴 Live stream connected to: ${activeMatch.title}` },
      { id: 2, user: "ChessMod", text: "Welcome to the match chat! Keep commentary respectful." }
    ]);
  }, [currentIdx, activeMatch]);

  // Set up live move scheduler
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (moveIndex < activeMatch.moves.length) {
        const nextMoveStr = activeMatch.moves[moveIndex];
        try {
          const moveObj = chess.move(nextMoveStr);
          if (moveObj) {
            // Sound effects
            if (chess.isGameOver()) {
              sound.playGameOver("win");
            } else if (moveObj.captured) {
              sound.playCapture();
            } else {
              sound.playMove();
            }

            setBoard(chess.board());
            setLastMove({ from: moveObj.from, to: moveObj.to });
            setMoveIndex(prev => prev + 1);

            // Periodically inject random user chat messages
            if (Math.random() > 0.3) {
              const randUser = CHAT_USERS[Math.floor(Math.random() * CHAT_USERS.length)];
              const randText = CHAT_PHRASES[Math.floor(Math.random() * CHAT_PHRASES.length)];
              setChatMessages(prev => [...prev, {
                id: Date.now(),
                user: randUser,
                text: randText
              }]);
            }
          }
        } catch (err) {
          console.error("Error executing live stream move:", nextMoveStr);
          setIsPaused(true);
        }
      } else {
        // Restart game loop automatically for mock replay
        setTimeout(() => {
          const resetChess = new Chess();
          setChess(resetChess);
          setBoard(resetChess.board());
          setMoveIndex(0);
          setLastMove(null);
          setChatMessages(prev => [...prev, { id: Date.now(), user: "System", text: "Match finished. Auto-replaying stream..." }]);
        }, 3000);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [chess, moveIndex, activeMatch, isPaused]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const handleNextBtn = () => {
    if (moveIndex < activeMatch.moves.length) {
      const nextMoveStr = activeMatch.moves[moveIndex];
      try {
        const moveObj = chess.move(nextMoveStr);
        if (moveObj) {
          if (moveObj.captured) sound.playCapture();
          else sound.playMove();
          setBoard(chess.board());
          setLastMove({ from: moveObj.from, to: moveObj.to });
          setMoveIndex(prev => prev + 1);
        }
      } catch (err) {}
    }
  };

  const handlePrevBtn = () => {
    if (moveIndex > 0) {
      // Re-compile chess up to moveIndex - 1
      const newChess = new Chess();
      for (let i = 0; i < moveIndex - 1; i++) {
        newChess.move(activeMatch.moves[i]);
      }
      setChess(newChess);
      setBoard(newChess.board());
      setMoveIndex(prev => prev - 1);
      setLastMove(null);
    }
  };

  const theme = {
    screenBg: isLoggedIn ? "bg-[#0a0d14]" : "bg-[#151413]",
    sidebarBorder: isLoggedIn ? "border-[#1e293b]" : "border-[#2c2b2a]",
    panelBg: isLoggedIn ? "bg-[#111625]" : "bg-[#1a1918]",
    panelBorder: isLoggedIn ? "border-[#1e293b]" : "border-[#2c2b2a]",
    textMuted: isLoggedIn ? "text-slate-450" : "text-zinc-500",
  };

  return (
    <div className={`flex h-screen ${theme.screenBg} text-[#e2e8f0] overflow-hidden`}>
      {isLoggedIn ? <LoginSidebar /> : <SideBar />}

      <div className="flex-1 flex flex-col md:flex-row p-6 md:p-8 gap-8 overflow-y-auto">
        {/* Left: Chessboard */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-[550px] mx-auto w-full">
          {/* Active players bar */}
          <div className="flex justify-between w-full mb-3 px-3 font-semibold text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              ⚪ {activeMatch.white} ({activeMatch.whiteRating})
            </span>
            <span className="flex items-center gap-1.5">
              ⚫ {activeMatch.black} ({activeMatch.blackRating})
            </span>
          </div>

          <div className="w-full aspect-square pointer-events-none mb-4">
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
          <div className="flex gap-4 justify-center items-center w-full bg-white/5 border border-white/5 p-3.5 rounded-xl">
            <button
              onClick={handlePrevBtn}
              className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Previous Move"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button
              onClick={togglePause}
              className="py-2 px-5 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {isPaused ? (
                <>
                  <svg className="w-3.5 h-3.5 fill-black" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Resume Stream
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 fill-black" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                  Pause Replay
                </>
              )}
            </button>
            <button
              onClick={handleNextBtn}
              className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Next Move"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Right: Matches Lobby and Live Chat */}
        <div className="w-full md:w-[400px] flex flex-col gap-6 h-full min-h-[500px]">
          {/* Match Lobby selector */}
          <div className={`p-5 rounded-2xl ${theme.panelBg} border ${theme.panelBorder} max-h-[220px] overflow-y-auto shrink-0 shadow-md`}>
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Live Broadcasts</h2>
            <div className="flex flex-col gap-2.5">
              {STREAM_MATCHES.map((match, idx) => (
                <div
                  key={match.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer flex justify-between items-center ${
                    idx === currentIdx
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-white/[0.02] border-white/5 hover:bg-white/5 text-zinc-450"
                  }`}
                >
                  <div className="flex-1 overflow-hidden pr-2">
                    <div className="text-xs font-extrabold truncate">{match.white} vs. {match.black}</div>
                    <div className="text-[9px] text-zinc-500 truncate">{match.title}</div>
                  </div>
                  <span className="flex items-center gap-1 text-[9px] font-bold text-rose-500 animate-pulse bg-rose-950/40 border border-rose-900/50 px-2 py-0.5 rounded-full shrink-0">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                    LIVE
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Spectator Chat container */}
          <div className={`flex-1 min-h-[280px] p-5 rounded-2xl ${theme.panelBg} border ${theme.panelBorder} flex flex-col overflow-hidden shadow-lg`}>
            <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Spectator Chat</h2>
              <span className="text-[10px] text-zinc-500 font-bold">14,295 watching</span>
            </div>

            {/* Chat message feed */}
            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="text-xs">
                  <span className={`font-black ${
                    msg.user === "System" ? "text-rose-400" :
                    msg.user === "ChessMod" ? "text-emerald-400" : "text-zinc-400"
                  } mr-1.5`}>
                    {msg.user}:
                  </span>
                  <span className="text-white font-medium">{msg.text}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input placeholder */}
            <div className="pt-3 border-t border-white/5 shrink-0">
              <input
                disabled
                placeholder="Subscribe/Login to chat live..."
                className="w-full p-2.5 rounded-lg bg-zinc-950/40 border border-white/5 text-xs text-zinc-500 cursor-not-allowed outline-none font-medium"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
