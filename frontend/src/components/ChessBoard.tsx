import type { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../screens/Game";

export const ChessBoard = ({ chess, setBoard, board, socket }: {
  setBoard: any;
  chess: any;
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  socket: WebSocket;
}) => {
  const [from, setFrom] = useState<null | Square>(null);
  

  return (
    <div className="text-white font-bold">
      {board.map((row, i) => (
        <div key={i} className="flex">
          {row.map((square, j) => {
            const file = String.fromCharCode(97 + j); // 'a' to 'h'
            const rank = `${8 - i}`;                  // '8' to '1'
            const clickedSquare = `${file}${rank}` as Square;

            return (
              <div
                key={j}
                onClick={() => {
                  if (!from) {
                    setFrom(clickedSquare);
                  } else {
                    socket.send(JSON.stringify({
                      type: MOVE,
                      payload: {
                        move: {
                            from,
                            to: clickedSquare
                        }
                        
                      }
                    }));

                    console.log("Sending move:", { from, to: clickedSquare });
                    setFrom(null);
                    chess.move({
                        from,
                        to: clickedSquare
                    });
                    setBoard(chess.board());
                  }
                }}
                className={`w-20 h-20 ${(i + j) % 2 === 0 ? 'bg-green-500' : 'bg-green-300'} flex justify-center items-center`}
              >
                <div className="h-full justify-center flex flex-col">
                    {
                        square ? <img className="w-15" src={`/${square?.color === "b" ? square?.type : `${square?.type?.toUpperCase()} copy`}.png`}/> : null
                    }
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
