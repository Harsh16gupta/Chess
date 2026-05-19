import { useEffect, useRef, useState } from "react";
import { ChessBoard } from "../components/ChessBoard";
import { SideBar } from "../components/SideBar";
import { useSocket } from "../hooks/useSockets";
import { Chess } from "chess.js";
import type { Square } from "chess.js";
import { LoginSidebar } from "../components/LoginSidebar";
import { useAuth } from "../context/AuthContext";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
export const CHAT_MESSAGE = "chat_message";

function formatTime(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

function genGuestName() {
  return `Guest${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function Game() {
  const { user } = useAuth();
  const socket = useSocket();
  const [chess] = useState(() => new Chess());
  const [board, setBoard] = useState(chess.board());
  const [isMatching, setIsMatching] = useState(false);

  const [myName, setMyName] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [myColor, setMyColor] = useState<"white" | "black" | null>(null);
  const [players, setPlayers] = useState<{ white: string; black: string }>({
    white: "Waiting...",
    black: "Waiting...",
  });
  const [currentTurn, setCurrentTurn] = useState<"white" | "black">("white");
  const [started, setStarted] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);

  const [timeLeftMs, setTimeLeftMs] = useState<{ white: number; black: number }>({
    white: 5 * 60 * 1000,
    black: 5 * 60 * 1000,
  });
  const lastSyncRef = useRef(Date.now());
  const tickRef = useRef<number | null>(null);

  const [chatMessages, setChatMessages] = useState<{ sender: string; message: string }[]>([]);
  const [chatInput, setChatInput] = useState("");

  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  const [status, setStatus] = useState<"connecting" | "open" | "closed">("connecting");
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'error' | 'success' } | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const [showWinBanner, setShowWinBanner] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setMyName(user.email);
      return;
    }
    const stored = localStorage.getItem("guestName");
    if (stored) setMyName(stored);
  }, [user?.email]);

  useEffect(() => {
    if (!socket) {
      setStatus("connecting");
      return;
    }
    setStatus((socket as any).readyState === 1 ? "open" : "connecting");
    const onOpen = () => setStatus("open");
    const onClose = () => setStatus("closed");
    socket.addEventListener("open", onOpen);
    socket.addEventListener("close", onClose);
    return () => {
      socket.removeEventListener("open", onOpen);
      socket.removeEventListener("close", onClose);
    };
  }, [socket]);

  useEffect(() => {
    if (!started) {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }

    if (tickRef.current) return;
    tickRef.current = window.setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastSyncRef.current;
      lastSyncRef.current = now;

      setTimeLeftMs((prev) => {
        const updated = { ...prev };
        if (currentTurn === "white") updated.white = Math.max(0, prev.white - elapsed);
        else updated.black = Math.max(0, prev.black - elapsed);

        if (updated.white <= 0 && prev.white > 0) {
          setTimeout(() => {
            setStarted(false);
            setGameOverMessage(`${players.black} wins on time!`);
          }, 0);
        }
        if (updated.black <= 0 && prev.black > 0) {
          setTimeout(() => {
            setStarted(false);
            setGameOverMessage(`${players.white} wins on time!`);
          }, 0);
        }

        return updated;
      });
    }, 1000);

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [started, currentTurn, players.black, players.white]);

  useEffect(() => {
    if (!socket) return;
    const handler = (e: MessageEvent) => {
      let message: any;
      try {
        message = JSON.parse(e.data);
      } catch {
        return;
      }

      switch (message.type) {
        case CHAT_MESSAGE: {
          const p = message.payload;
          const text = p.message ?? p.text ?? "";
          setChatMessages((s) => [...s, { sender: p.sender, message: text }]);
          break;
        }
        case INIT_GAME: {
          const p = message.payload;
          setMyColor(p.color);
          const whiteName = p.color === "white" ? (myName ?? p.name) : p.opponent;
          const blackName = p.color === "black" ? (myName ?? p.name) : p.opponent;
          setPlayers({ white: whiteName, black: blackName });

          if (p.board) {
            try {
              chess.load(p.board);
            } catch {}
            setBoard(chess.board());
          }

          setTimeLeftMs({
            white: Math.max(0, p.timeLeft?.white ?? timeLeftMs.white),
            black: Math.max(0, p.timeLeft?.black ?? timeLeftMs.black),
          });
          lastSyncRef.current = Date.now();
          setCurrentTurn(p.turn ?? (chess.turn() === "w" ? "white" : "black"));
          setStarted(true);
          setGameOverMessage(null);
          setIsMatching(false);
          break;
        }
        case MOVE: {
          const p = message.payload;
          if (p.board) {
            try {
              chess.load(p.board);
            } catch {}
          } else if (p.move) {
            try {
              chess.move(p.move);
            } catch {}
          }
          setBoard(chess.board());
          setCurrentTurn(p.turn ?? (chess.turn() === "w" ? "white" : "black"));

          setTimeLeftMs({
            white: Math.max(0, p.timeLeft?.white ?? timeLeftMs.white),
            black: Math.max(0, p.timeLeft?.black ?? timeLeftMs.black),
          });
          lastSyncRef.current = Date.now();
          break;
        }
        case GAME_OVER: {
          const p = message.payload;
          if (p.result === "draw") setGameOverMessage("Draw");
          else if (p.winnerName) setGameOverMessage(`${p.winnerName} won`);
          else setGameOverMessage("Game Over");

          setStarted(false);
          if (p.board) {
            try {
              chess.load(p.board);
            } catch {}
            setBoard(chess.board());
          }
          break;
        }
      }
    };

    socket.addEventListener("message", handler);
    return () => socket.removeEventListener("message", handler);
  }, [socket, chess, myName, timeLeftMs.white, timeLeftMs.black]);

  const showToast = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setToast({ message, type });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToast(null), 3000);
  };

  const startMatch = (nameOverride?: string) => {
    const name = user?.email || nameOverride || myName;
    if (!name) return;

    if (!socket || (socket as any).readyState !== 1) {
      showToast("Socket not connected. Wait a moment and try again.", "error");
      return;
    }

    setIsMatching(true);
    if (!user?.email) localStorage.setItem("guestName", name);

    socket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: { name },
      })
    );
  };

  const onSquareClick = (square: string) => {
    if (!myColor || myColor !== currentTurn) {
      showToast("It's not your turn!", "error");
      return;
    }

    const sq = square as Square;

    if (selectedSquare === sq) {
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    const piece = chess.get(sq);

    if (piece && piece.color === myColor[0]) {
      const moves = chess.moves({ square: sq, verbose: true });
      if (moves.length === 0) {
        showToast("No valid moves for this piece!", "error");
        return;
      }
      setSelectedSquare(sq);
      setValidMoves(moves.map((m) => m.to));
    } 
    else if (selectedSquare && validMoves.includes(sq)) {
      const move = chess.move({ from: selectedSquare, to: sq });

      if (!move) {
        showToast("Invalid move!", "error");
        return;
      }

      if (socket && (socket as any).readyState === 1) {
        socket.send(JSON.stringify({ type: MOVE, payload: { move: { from: selectedSquare, to: sq } } }));
      }
      setLastMove({ from: selectedSquare, to: sq });
      setSelectedSquare(null);
      setValidMoves([]);

      if (chess.isCheckmate()) {
        showToast("Checkmate! 👑", "success");
        triggerWinAnimation();
      } else if (chess.inCheck()) {
        showToast("Check! ⚠️", "info");
      }
    } else {
      showToast("Select one of your pieces first", "info");
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };
  
  const triggerWinAnimation = () => {
    setShowWinBanner(true);
    setTimeout(() => setShowWinBanner(false), 3500);
  };

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text || !socket || (socket as any).readyState !== 1) return;

    socket.send(JSON.stringify({
      type: CHAT_MESSAGE,
      payload: { text }
    }));

    setChatInput("");
  };

  const submitGuestName = () => {
    const name = tempName.trim() || genGuestName();
    localStorage.setItem("guestName", name);
    setMyName(name);
    startMatch(name);
  };

  const handlePlayAgain = () => {
    chess.reset();
    setBoard(chess.board());
    setGameOverMessage(null);
    startMatch();
  };

  const whiteSeconds = Math.max(0, Math.floor(timeLeftMs.white / 1000));
  const blackSeconds = Math.max(0, Math.floor(timeLeftMs.black / 1000));
  const isMyTurn = myColor === currentTurn;

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-white font-sans antialiased">
      {!user ? <SideBar /> : <LoginSidebar />}
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 relative">
        <div className="flex flex-col items-center gap-4">
          
          {/* Opponent Card (Black) */}
          <div
            className={`w-full p-4 border rounded-2xl flex items-center justify-between transition-all duration-300 ${
              currentTurn === "black" 
                ? "bg-zinc-900 border-zinc-700 shadow-lg shadow-black/30" 
                : "bg-zinc-900/20 border-zinc-900 opacity-60"
            }`}
            style={{ width: "85vmin", maxWidth: 720 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold text-xs uppercase">
                {players.black?.slice(0, 2) || "BL"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white tracking-tight">{players.black || "Waiting..."}</span>
                <span className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase">Black</span>
              </div>
            </div>
            <div className={`text-base font-mono font-bold px-3 py-1 rounded bg-zinc-950/80 border border-zinc-800 tracking-wider ${
              currentTurn === "black" ? "text-white" : "text-zinc-600"
            }`}>
              {formatTime(blackSeconds)}
            </div>
          </div>

          {/* Chessboard container */}
          <div className="relative shadow-2xl rounded-2xl overflow-hidden border border-zinc-900" style={{ width: "85vmin", height: "85vmin", maxWidth: 720, maxHeight: 720 }}>
            <ChessBoard
              board={board}
              flipped={myColor === "black"}
              selectedSquare={selectedSquare}
              validMoves={validMoves}
              lastMove={lastMove}
              onSquareClick={onSquareClick}
            />
          </div>

          {/* Self Card (White) */}
          <div
            className={`w-full p-4 border rounded-2xl flex items-center justify-between transition-all duration-300 ${
              currentTurn === "white" 
                ? "bg-zinc-900 border-zinc-700 shadow-lg shadow-black/30" 
                : "bg-zinc-900/20 border-zinc-900 opacity-60"
            }`}
            style={{ width: "85vmin", maxWidth: 720 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold text-xs uppercase">
                {players.white?.slice(0, 2) || "WH"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white tracking-tight">{players.white || "Waiting..."}</span>
                <span className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase">White</span>
              </div>
            </div>
            <div className={`text-base font-mono font-bold px-3 py-1 rounded bg-zinc-950/80 border border-zinc-800 tracking-wider ${
              currentTurn === "white" ? "text-white" : "text-zinc-600"
            }`}>
              {formatTime(whiteSeconds)}
            </div>
          </div>

        </div>
      </div>

      {/* Control panel & Chat side-column */}
      <div className="w-80 bg-zinc-950 border-l border-zinc-900 flex flex-col py-8 px-6 shrink-0 h-full justify-between">
        
        {/* Connection status header */}
        <div className="flex flex-col gap-1 mb-6">
          <span className="text-[10px] text-zinc-600 font-bold tracking-widest uppercase">matchmaking</span>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white">♟ chess.in</h2>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">
              <span className={`w-1.5 h-1.5 rounded-full ${
                status === 'open' ? 'bg-emerald-500' : status === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
              }`}></span>
              <span className="text-[9px] text-zinc-500 font-bold tracking-wider uppercase">
                {status === 'open' ? 'Live' : status === 'connecting' ? 'Wait' : 'Offline'}
              </span>
            </div>
          </div>
          {started && (
            <div className="mt-2.5">
              <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                isMyTurn ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
              }`}>
                {isMyTurn ? "Your turn" : "Waiting for Opponent"}
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Center Panel (Matchmaker or Chat) */}
        <div className="flex-1 flex flex-col justify-center gap-4">
          
          {/* Matchmaker view: Logged-out guest registration */}
          {!started && !user && (
            <div className="bg-zinc-900/10 border border-zinc-900 p-6 rounded-3xl flex flex-col gap-4 shadow-xl">
              <h3 className="text-sm font-semibold tracking-tight text-zinc-400 text-center">Register Guest Name</h3>
              <input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Guest username"
                className="w-full px-4 py-3 bg-zinc-900/40 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 text-sm outline-none focus:border-zinc-700 transition-colors"
              />
              <button
                onClick={submitGuestName}
                disabled={isMatching}
                className="w-full bg-white hover:bg-zinc-100 text-zinc-950 font-bold py-3.5 rounded-full text-xs tracking-wider uppercase cursor-pointer transition-colors duration-200"
              >
                {isMatching ? "Finding Opponent..." : "Play Online"}
              </button>
            </div>
          )}

          {/* Matchmaker view: Logged-in user quick start */}
          {!started && user && (
            <div className="bg-zinc-900/10 border border-zinc-900 p-6 rounded-3xl flex flex-col gap-4 shadow-xl text-center">
              <h3 className="text-sm font-semibold tracking-tight text-zinc-400">Launch standard game</h3>
              <button
                onClick={() => startMatch()}
                disabled={isMatching}
                className="w-full bg-white hover:bg-zinc-100 text-zinc-950 font-bold py-3.5 rounded-full text-xs tracking-wider uppercase cursor-pointer transition-colors duration-200"
              >
                {isMatching ? "Finding Opponent..." : "Play Online"}
              </button>
            </div>
          )}

          {/* Live Chat component */}
          {started && (
            <div className="flex-1 flex flex-col bg-zinc-900/10 border border-zinc-900 rounded-3xl p-4 overflow-hidden h-[360px] justify-between gap-4">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 flex flex-col text-xs">
                {chatMessages.length === 0 && (
                  <div className="text-zinc-600 text-center font-medium my-auto">No messages yet. Send a friendly greeting!</div>
                )}
                {chatMessages.map((msg, i) => {
                  const mine = msg.sender === (myName || user?.email);
                  return (
                    <div
                      key={i}
                      className={`flex flex-col max-w-[85%] ${mine ? "self-end items-end" : "self-start items-start"}`}
                    >
                      <span className="text-[9px] text-zinc-600 font-bold mb-0.5 tracking-tight px-1">{msg.sender?.split("@")[0]}</span>
                      <div
                        className={`px-3.5 py-2 rounded-2xl tracking-tight leading-relaxed ${
                          mine 
                            ? "bg-white text-zinc-950 font-semibold rounded-tr-none" 
                            : "bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-tl-none"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-zinc-900/40 border border-zinc-800 rounded-full text-white placeholder-zinc-600 text-xs outline-none focus:border-zinc-700 transition-colors"
                />
                <button 
                  onClick={sendChat} 
                  className="bg-white hover:bg-zinc-100 text-zinc-950 font-bold px-4 py-2.5 rounded-full text-xs transition-colors duration-200 cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer info or legal */}
        <div className="text-center text-[10px] text-zinc-600 font-medium tracking-tight mt-6">
          © chess.in • Minimalist Chess App
        </div>

      </div>

      {/* Toast notifications */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 z-50 px-5 py-2.5 rounded-full shadow-2xl text-xs font-bold backdrop-blur-md border tracking-wide ${
            toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' :
            toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' :
            'bg-zinc-900 border-zinc-800 text-zinc-300'
          }`}
          style={{ animation: 'toastSlideIn 0.3s ease-out', transform: 'translateX(-50%)' }}
        >
          {toast.message}
        </div>
      )}

      {/* Victory Celebration Overlay */}
      {showWinBanner && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50 animate-pulse bg-white/5">
          <span className="text-5xl font-black tracking-widest text-white uppercase bg-zinc-950 border border-zinc-800 px-8 py-4 rounded-3xl shadow-2xl">
            🏆 Victory!
          </span>
        </div>
      )}

      {/* Game Over modal dialog */}
      {gameOverMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-45"
          style={{ animation: 'fadeIn 0.25s ease-out' }}>
          <div className="bg-zinc-950 border border-zinc-900 p-10 rounded-3xl text-center shadow-2xl max-w-sm flex flex-col items-center gap-4"
            style={{ animation: 'modalPop 0.3s ease-out' }}>
            <span className="text-4xl text-zinc-400">♚</span>
            <div className="text-2xl font-black text-white tracking-tight">{gameOverMessage}</div>
            <p className="text-zinc-500 text-xs font-medium tracking-tight">Spectacular game! Ready for another battle?</p>
            <button
              onClick={handlePlayAgain}
              className="mt-2 bg-white hover:bg-zinc-100 text-zinc-950 font-bold py-3 px-8 rounded-full text-xs tracking-wider uppercase transition-colors duration-200 cursor-pointer shadow-lg"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
