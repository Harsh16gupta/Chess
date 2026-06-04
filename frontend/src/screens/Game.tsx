import { useEffect, useRef, useState } from "react";
import { Button } from "../components/Button";
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
  const socket = useSocket(); // WebSocket | null
  const [chess] = useState(() => new Chess());
  const [board, setBoard] = useState(chess.board());
  const [isMatching, setIsMatching] = useState(false);

  // Player & game state
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

  // Timers (ms)
  const [timeLeftMs, setTimeLeftMs] = useState<{ white: number; black: number }>({
    white: 5 * 60 * 1000,
    black: 5 * 60 * 1000,
  });
  const lastSyncRef = useRef(Date.now());
  const tickRef = useRef<number | null>(null);

  // Chat (hidden until game starts)
  const [chatMessages, setChatMessages] = useState<{ sender: string; message: string }[]>([]);
  const [chatInput, setChatInput] = useState("");

  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);


  // Connection status
  const [status, setStatus] = useState<"connecting" | "open" | "closed">("connecting");
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'error' | 'success' } | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const [showWinBanner, setShowWinBanner] = useState(false);

  // initialize guest name / username
  useEffect(() => {
    if (user?.email) {
      setMyName(user.email);
      return;
    }
    const stored = localStorage.getItem("guestName");
    if (stored) setMyName(stored);
    else {
      // delay opening modal until user tries to play (so modal doesn't annoy)
      setMyName(null);
    }
  }, [user?.email]);

  // connection state tracking
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

  // local ticking (1s) only when game started
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

        // Detect timeout inside the callback (always has fresh values)
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
  }, [ started, currentTurn]);

  // handle messages from server
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
          // server should send: color, name, opponent, timeLeft {white, black} (ms), board (fen) optional
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
          // show chat only after game starts — the chat rendering is conditional below
          setIsMatching(false);  // stop matching animation here
          break;
        }
        case MOVE: {
          const p = message.payload;
          // prefer server FEN
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

  // Toast helper
  const showToast = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setToast({ message, type });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToast(null), 3000);
  };

  // Start matchmaking flow
  const startMatch = (nameOverride?: string) => {
    const name = user?.email || nameOverride || myName;
    if (!name) {
      showToast("Please enter a name first.", "error");
      return;
    }

    if (!socket || (socket as any).readyState !== 1) {
      showToast("Socket not connected. Wait a moment and try again.", "error");
      return;
    }

    // set matching state true
    setIsMatching(true);

    if (!user?.email) localStorage.setItem("guestName", name);

    socket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: { name },
      })
    );
  };


  // Called when the user clicks a square on the board
  const onSquareClick = (square: string) => {
    // Restrict move to correct player
    if (!myColor || myColor !== currentTurn) {
      showToast("It's not your turn!", "error");
      return;
    }

    const sq = square as Square;

    // Select/deselect piece
    if (selectedSquare === sq) {
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    const piece = chess.get(sq);

    // Selecting a piece
    if (piece && piece.color === myColor[0]) {
      const moves = chess.moves({ square: sq, verbose: true });
      if (moves.length === 0) {
        showToast("No valid moves for this piece!", "error");
        return;
      }
      setSelectedSquare(sq);
      setValidMoves(moves.map((m) => m.to));
    } 
    // Making a move
    else if (selectedSquare && validMoves.includes(sq)) {
      const move = chess.move({ from: selectedSquare, to: sq });

      if (!move) {
        showToast("Invalid move!", "error");
        return;
      }

      // Send move to server
      if (socket && (socket as any).readyState === 1) {
        socket.send(JSON.stringify({ type: MOVE, payload: { move: { from: selectedSquare, to: sq } } }));
      }
      setLastMove({ from: selectedSquare, to: sq });
      setSelectedSquare(null);
      setValidMoves([]);

      // Check/checkmate alerts
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


  // Chat send
  const sendChat = () => {
    const text = chatInput.trim();
    if (!text || !socket || (socket as any).readyState !== 1) return;

    // Send to backend
    socket.send(JSON.stringify({
      type: CHAT_MESSAGE,
      payload: { text }
    }));

    setChatInput("");
  };



  // Guest modal submit
  const submitGuestName = () => {
    const name = tempName.trim() || genGuestName();
    localStorage.setItem("guestName", name);
    setMyName(name);

    // Immediately start the match with provided name
    startMatch(name);
  };

  // Play again
  const handlePlayAgain = () => {
    chess.reset();
    setBoard(chess.board());
    setGameOverMessage(null);
    startMatch();
  };

  // Derived UI
  const whiteSeconds = Math.max(0, Math.floor(timeLeftMs.white / 1000));
  const blackSeconds = Math.max(0, Math.floor(timeLeftMs.black / 1000));
  const isMyTurn = myColor === currentTurn;

  // Board size class: smaller (85vmin) so top & bottom   // Board size class: smaller (85vmin) so top & bottom bars fit
  // Player bars above and below board are fixed-height so both names show
  return (
    <div className="flex h-screen w-screen bg-black text-white">
      {!user ? <SideBar /> : <LoginSidebar />}

      <div className="flex-1 flex flex-col items-center py-2 px-4 md:px-8 relative bg-black">
        {/* center game area */}
        <div className="flex flex-col items-center">
          {/* top player bar */}
          <div
            className={`w-full max-w-3xl p-2 rounded-t-xl flex items-center justify-between transition-colors duration-200 border border-zinc-900 ${
              currentTurn === "black" ? "bg-white text-black font-bold" : "bg-zinc-950 text-zinc-400"
            }`}
            style={{ height: 48 }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                currentTurn === "black" ? "bg-black text-white" : "bg-zinc-800 text-white"
              }`}>
                {players.black?.slice(0, 2).toUpperCase() || "BL"}
              </div>
              <div className="flex flex-col">
                <div className="text-sm">{players.black || "Waiting..."}</div>
                <div className="text-xs opacity-75">Black</div>
              </div>
            </div>
            <div className="text-lg font-mono font-bold">
              {formatTime(blackSeconds)}
            </div>
          </div>

          {/* board container (smaller so both bars visible) */}
          <div className="border-x border-zinc-900" style={{ width: "85vmin", height: "85vmin", maxWidth: 720, maxHeight: 720 }}>
            <ChessBoard
              board={board}
              flipped={myColor === "black"}
              selectedSquare={selectedSquare}
              validMoves={validMoves}
              lastMove={lastMove}
              onSquareClick={onSquareClick}
            />
          </div>

          {/* bottom player bar */}
          <div
            className={`w-full max-w-3xl p-2 rounded-b-xl flex items-center justify-between transition-colors duration-200 border border-zinc-900 ${
              currentTurn === "white" ? "bg-white text-black font-bold" : "bg-zinc-950 text-zinc-400"
            }`}
            style={{ height: 48 }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                currentTurn === "white" ? "bg-black text-white" : "bg-zinc-800 text-white"
              }`}>
                {players.white?.slice(0, 2).toUpperCase() || "WH"}
              </div>
              <div className="flex flex-col">
                <div className="text-sm">{players.white || "Waiting..."}</div>
                <div className="text-xs opacity-75">White</div>
              </div>
            </div>
            <div className="text-lg font-mono font-bold">
              {formatTime(whiteSeconds)}
            </div>
          </div>
        </div>
      </div>

      {/* right side: chat appears only when game started */}
      <div className="flex flex-col bg-zinc-950 border-l border-zinc-900 w-80">
        <div className="flex flex-col items-center pt-4 px-4 mb-4 gap-2">
          <div className="text-xl font-bold tracking-wide text-white">♟ Chess.in</div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${status === 'open' ? 'bg-white' : status === 'connecting' ? 'bg-zinc-500 animate-pulse' : 'bg-zinc-800'}`}></span>
            <span className="text-zinc-500">{status === 'open' ? 'Connected' : status === 'connecting' ? 'Connecting...' : 'Disconnected'}</span>
          </div>
          {started && (
            <div className={`text-sm font-semibold mt-1 px-3 py-1 rounded-full transition-colors ${isMyTurn ? 'bg-white text-black font-bold shadow-sm' : 'bg-zinc-900 border border-zinc-800 text-zinc-500'}`}>
              {isMyTurn ? "Your turn" : "Opponent's turn"}
            </div>
          )}
        </div>

        {!started && !user && (
         <div className="flex items-center justify-center px-4">
          <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-900 w-full">
            <div className="text-lg font-bold mb-3 text-white">Enter your name</div>
            <input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Your name"
              className="w-full p-2.5 rounded-lg mb-4 bg-black border border-zinc-800 text-white placeholder-zinc-600 outline-none focus:border-white transition-colors"
            />
            <Button
              onClick={submitGuestName}
              disabled={isMatching}
              className={`w-full bg-white hover:bg-zinc-200 text-black py-2.5 rounded-lg font-bold transition-all duration-200 cursor-pointer text-center ${isMatching ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isMatching ? <span className="flex items-center justify-center gap-2"><span className="matching-spinner"></span>Finding Opponent...</span> : "▶ Play"}
            </Button>
          </div>
        </div>
      )}

      {!started && user && (
         <div className="px-4">
            <Button
              onClick={startMatch}
              disabled={isMatching}
              className={`w-full bg-white hover:bg-zinc-200 text-black py-3 rounded-lg font-bold transition-all duration-200 cursor-pointer text-center ${isMatching ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isMatching ? <span className="flex items-center justify-center gap-2"><span className="matching-spinner"></span>Finding Opponent...</span> : "▶ Play"}
            </Button>
          </div>
      )}

        {started && (
          <div className="flex flex-col p-3 border-t border-zinc-900 flex-1 overflow-hidden">
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Chat</div>
            <div className="flex-1 overflow-y-auto mb-3 space-y-2 p-1 flex flex-col">
              {chatMessages.length === 0 && (
                <div className="text-xs text-zinc-650 italic">No messages yet — say hi!</div>
              )}
              {chatMessages.map((msg, i) => {
                const mine = msg.sender === (myName || user?.email);
                return (
                  <div
                    key={i}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`p-2 px-3 rounded-lg max-w-[85%] ${
                        mine ? "bg-white text-black font-semibold shadow-sm" : "bg-zinc-900 border border-zinc-800 text-white"
                      }`}
                    >
                      <div className="text-[10px] opacity-75 font-mono mb-0.5">{msg.sender}</div>
                      <div className="text-sm leading-relaxed">{msg.message}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-1.5">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Type a message..."
                className="flex-1 p-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-650 outline-none focus:border-zinc-500 transition-colors text-sm"
              />
              <Button onClick={sendChat} className="bg-white hover:bg-zinc-200 text-black rounded-lg px-4 font-bold text-sm transition-colors">
                Send
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Toast notification (Sleek Stark Monochrome) */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 z-50 px-6 py-3 rounded-lg shadow-2xl text-sm font-semibold border ${
            toast.type === 'error' ? 'bg-black border-white text-white' : 'bg-white border-black text-black'
          }`}
          style={{ animation: 'toastSlideIn 0.3s ease-out', transform: 'translateX(-50%)' }}
        >
          {toast.type === 'error' ? '⚠️ ' : ''}{toast.message}
        </div>
      )}

      {/* Win celebration banner */}
      {showWinBanner && (
        <div className="win-animation">
          🏆 Victory 🏆
        </div>
      )}

      {/* Game over modal (Stark Monochrome) */}
      {gameOverMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40 animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 p-10 rounded-xl text-center shadow-2xl min-w-[320px] animate-modal-pop">
            <div className="text-6xl mb-4 text-white">♚</div>
            <div className="text-3xl font-black mb-2 text-white">{gameOverMessage}</div>
            <p className="text-zinc-500 mb-8">Good game!</p>
            <button
              onClick={handlePlayAgain}
              className="bg-white hover:bg-zinc-200 text-black font-bold py-3 px-10 rounded-lg transition-all duration-200 cursor-pointer text-lg shadow-xl"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
