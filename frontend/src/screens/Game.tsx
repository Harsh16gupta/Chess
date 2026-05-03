import { useEffect, useRef, useState } from "react";
import { Button } from "../components/Button";
import { ChessBoard } from "../components/ChessBoard";
import { SideBar } from "../components/SideBar";
import { useSocket } from "../hooks/useSockets";
import { Chess } from "chess.js";
import { EMAIL } from "./Home";
import type { Square } from "chess.js";
import { LoginSidebar } from "../components/LoginSidebar";

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
  const socket = useSocket(); // WebSocket | null
  const [chess] = useState(() => new Chess());
  const [board, setBoard] = useState(chess.board());
  const [isMatching, setIsMatching] = useState(false);

  // Player & game state
  const [myName, setMyName] = useState<string | null>(null);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
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


  // Connection status
  const [status, setStatus] = useState<"connecting" | "open" | "closed">("connecting");
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'error' | 'success' } | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const [showWinBanner, setShowWinBanner] = useState(false);

  // initialize guest name / username
  useEffect(() => {
    if (EMAIL) {
      setMyName(EMAIL);
      return;
    }
    const stored = localStorage.getItem("guestName");
    if (stored) setMyName(stored);
    else {
      // delay opening modal until user tries to play (so modal doesn't annoy)
      setMyName(null);
    }
  }, []);

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
    if (started) {
      if (whiteSeconds === 0) {
        setStarted(false);
        setGameOverMessage(`${players.black} wins on time!`);
        triggerWinAnimation();
      }
      if (blackSeconds === 0) {
        setStarted(false);
        setGameOverMessage(`${players.white} wins on time!`);
        triggerWinAnimation();
      }
    }

    if (tickRef.current) return;
    tickRef.current = window.setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastSyncRef.current;
      lastSyncRef.current = now;

      setTimeLeftMs((prev) => {
        const copy = { ...prev };
        if (currentTurn === "white") copy.white = Math.max(0, prev.white - elapsed);
        else copy.black = Math.max(0, prev.black - elapsed);
        return copy;
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
    const name = EMAIL || nameOverride || myName;
    if (!name) {
      setGuestModalOpen(true);
      return;
    }

    if (!socket || (socket as any).readyState !== 1) {
      showToast("Socket not connected. Wait a moment and try again.", "error");
      return;
    }

    // set matching state true
    setIsMatching(true);

    if (!EMAIL) localStorage.setItem("guestName", name);

    socket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: { name },
      })
    );
  };


  // Called by ChessBoard on local move
  const onLocalMove = (move: { from: string; to: string } | string) => {
    if (!socket || (socket as any).readyState !== 1) return;
    socket.send(JSON.stringify({ type: MOVE, payload: { move } }));
  };

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
      onLocalMove({ from: selectedSquare, to: sq });
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

    // Update local state (matches state type)
    

    console.log("Sent chat:", text);
    console.log("All messages:", chatMessages);

    setChatInput("");
  };



  // Guest modal submit
  const submitGuestName = () => {
    const name = tempName.trim() || genGuestName();
    localStorage.setItem("guestName", name);
    setMyName(name);
    setGuestModalOpen(false);
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

  // Board size class: smaller (85vmin) so top & bottom bars fit
  // Player bars above and below board are fixed-height so both names show
  return (
    <div className="flex h-screen w-screen bg-stone-800 text-white">
      {!EMAIL ? <SideBar /> : <LoginSidebar />}
      

      <div className="flex-1 flex flex-col items-center py-2 px-4 md:px-8 relative">
        

        {/* center game area */}
        <div className="flex flex-col items-center ">
          {/* top player bar */}
          <div
            className={`w-full max-w-3xl p-2 rounded-t-xl flex items-center justify-between ${
              currentTurn === "black" ? "bg-yellow-700" : "bg-stone-700"
            }`}
            style={{ height: 48 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
                {players.black?.slice(0, 2).toUpperCase() || "BL"}
              </div>
              <div className="flex flex-col">
                <div className="text-sm">{players.black || "Waiting..."}</div>
                <div className="text-xs text-gray-200">Black</div>
              </div>
            </div>
            <div className={`text-lg font-bold ${blackSeconds < 10 ? "text-red-400" : ""}`}>
              {formatTime(blackSeconds)}
            </div>
          </div>

          {/* board container (smaller so both bars visible) */}
          <div className=" " style={{ width: "85vmin", height: "85vmin", maxWidth: 720, maxHeight: 720 }}>
            <ChessBoard
              chess={chess}
              setBoard={(b: any) => setBoard(b)}
              board={board}
              socket={socket}
              myColor={myColor}
              onLocalMove={onLocalMove}
              onSquareClick={onSquareClick}
              selectedSquare={selectedSquare}
              validMoves={validMoves}
            />

          </div>

          {/* bottom player bar */}
          <div
            className={`w-full max-w-3xl p-2 rounded-b-xl flex items-center justify-between ${
              currentTurn === "white" ? "bg-yellow-700" : "bg-stone-700"
            }`}
            style={{ height: 48 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
                {players.white?.slice(0, 2).toUpperCase() || "WH"}
              </div>
              <div className="flex flex-col">
                <div className="text-sm">{players.white || "Waiting..."}</div>
                <div className="text-xs text-gray-200">White</div>
              </div>
            </div>
            <div className={`text-lg font-bold ${whiteSeconds < 10 ? "text-red-400" : ""}`}>
              {formatTime(whiteSeconds)}
            </div>
          </div>

          
        </div>
      </div>

      {/* right side: chat appears only when game started */}
      <div className="flex flex-col bg-stone-900 m-4 rounded-md w-80">
        <div className="flex flex-col items-center pt-4 px-4 mb-4 gap-2">
          <div className="text-xl font-bold tracking-wide">♟ Chess.in</div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${status === 'open' ? 'bg-green-400' : status === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'}`}></span>
            <span className="text-gray-400">{status === 'open' ? 'Connected' : status === 'connecting' ? 'Connecting...' : 'Disconnected'}</span>
          </div>
          {started && (
            <div className={`text-sm font-semibold mt-1 px-3 py-1 rounded-full ${isMyTurn ? 'bg-lime-600/30 text-lime-300' : 'bg-stone-700 text-gray-400'}`}>
              {isMyTurn ? "Your turn" : "Opponent's turn"}
            </div>
          )}
        </div>
        {!started && !EMAIL && (
         <div className=" flex items-center justify-center ">
          <div className="bg-stone-900 p-6 rounded-md w-80">
            <div className="text-xl font-bold mb-3">Enter your name</div>
            <input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Your name"
              className="w-full p-2 rounded mb-3 bg-stone-800 text-white"
            />
            <div className="flex justify-center gap-2  my-1 bg-lime-500 text-2xl">
              <Button
                onClick={submitGuestName}
                disabled={isMatching}
                className={`cursor-pointer  ${isMatching ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isMatching ? <span className="flex items-center gap-2"><span className="matching-spinner"></span>Finding Opponent...</span> : "▶ Play"}
              </Button>

            </div>
          </div>
        </div>
      )}

      {!started && EMAIL && (
         <div className="flex justify-center gap-2 m-5 bg-lime-500 text-2xl">
              <Button
                onClick={startMatch}
                disabled={isMatching}
                className={`cursor-pointer  ${isMatching ? "opacity-50 cursor-not-allowed w-xl bg-lime-500" : ""}`}
              >
                {isMatching ? <span className="flex items-center gap-2"><span className="matching-spinner"></span>Finding Opponent...</span> : "▶ Play"}
              </Button>

            </div>
      )}
        

        {started && (
          <div className="flex flex-col p-2 border-t border-gray-600 flex-1">
            <div className="text-sm text-gray-300 mb-2">Chat</div>
              <div className="flex-1 overflow-y-auto mb-2 space-y-2 p-1 flex flex-col">
                {chatMessages.length === 0 && (
                  <div className="text-xs text-gray-400">No messages yet — say hi!</div>
                )}
                {chatMessages.map((msg, i) => {
                  const mine = msg.sender === (myName || EMAIL);
                  return (
                    <div
                      key={i}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`p-1 px-4 rounded max-w-[70%] ${
                          mine ? "bg-lime-700 text-black" : "bg-stone-700 text-white"
                        }`}
                      >
                        <div className="text-xs font-bold">{msg.sender}</div>
                        <div className="text-sm">{msg.message}</div>
                      </div>
                    </div>
                  );
              })}
            </div>


            <div className="flex gap-1">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Type a message..."
                className="flex-1 p-2 rounded-l bg-stone-800 text-white border border-gray-600"
              />
              <Button onClick={sendChat} className="bg-lime-600 text-white rounded-r px-4">
                Send
                

              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl text-sm font-semibold backdrop-blur-md border ${
            toast.type === 'error' ? 'bg-red-500/20 border-red-500/40 text-red-200' :
            toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' :
            'bg-sky-500/20 border-sky-500/40 text-sky-200'
          }`}
          style={{ animation: 'toastSlideIn 0.3s ease-out', transform: 'translateX(-50%)' }}
        >
          {toast.message}
        </div>
      )}

      {/* Win celebration banner */}
      {showWinBanner && (
        <div className="win-animation">
          🏆 Victory! 🏆
        </div>
      )}

      {/* Game over modal */}
      {gameOverMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40"
          style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <div className="bg-stone-800 border border-stone-600/50 p-10 rounded-2xl text-center shadow-2xl min-w-[320px]"
            style={{ animation: 'modalPop 0.35s ease-out' }}>
            <div className="text-6xl mb-4">♚</div>
            <div className="text-3xl font-bold mb-2">{gameOverMessage}</div>
            <p className="text-gray-400 mb-8">Good game!</p>
            <button
              onClick={handlePlayAgain}
              className="bg-lime-600 hover:bg-lime-500 text-white font-bold py-3 px-10 rounded-xl transition-colors duration-200 cursor-pointer text-lg shadow-lg shadow-lime-600/25"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
