import type { Color, PieceSymbol, Square } from "chess.js";

// ─── Types ───────────────────────────────────────────────────
type BoardSquare = {
  square: Square;
  type: PieceSymbol;
  color: Color;
} | null;

interface ChessBoardProps {
  board: BoardSquare[][];
  flipped: boolean;
  selectedSquare: string | null;
  validMoves: string[];
  lastMove: { from: string; to: string } | null;
  onSquareClick: (square: string) => void;
}

// ─── Piece image mapping ────────────────────────────────────
// Maps chess.js piece data to image filenames in /public
function getPieceImage(color: Color, type: PieceSymbol): string {
  const prefix = color === "b" ? "b" : "w";
  return `/${prefix}${type.toUpperCase()}.png`;
}

// ─── Square colors (Stark Black & White Redesign) ───────────
const LIGHT_SQUARE = "#f4f4f5";   // Zinc 100 (crisp light zinc)
const DARK_SQUARE = "#27272a";    // Zinc 800 (deep charcoal zinc)
const SELECTED_LIGHT = "#a1a1aa"; // Zinc 400 (mid-gray selection highlight)
const SELECTED_DARK = "#71717a";  // Zinc 500 (darker-gray selection highlight)
const LAST_MOVE_LIGHT = "#e4e4e7"; // Zinc 200
const LAST_MOVE_DARK = "#3f3f46";  // Zinc 700

function getSquareColor(
  row: number,
  col: number,
  squareName: string,
  selectedSquare: string | null,
  lastMove: { from: string; to: string } | null
): string {
  const isLight = (row + col) % 2 === 0;

  // Selected piece highlight
  if (squareName === selectedSquare) {
    return isLight ? SELECTED_LIGHT : SELECTED_DARK;
  }

  // Last move highlight
  if (lastMove && (squareName === lastMove.from || squareName === lastMove.to)) {
    return isLight ? LAST_MOVE_LIGHT : LAST_MOVE_DARK;
  }

  return isLight ? LIGHT_SQUARE : DARK_SQUARE;
}

// ─── Component ──────────────────────────────────────────────
export const ChessBoard = ({
  board,
  flipped,
  selectedSquare,
  validMoves,
  lastMove,
  onSquareClick,
}: ChessBoardProps) => {
  // Build col indices — reversed when board is flipped for black
  const colIndices = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const displayRows = flipped ? [...board].reverse() : board;

  return (
    <div className="w-full h-full select-none">
      <div
        className="grid w-full h-full"
        style={{ gridTemplateColumns: "repeat(8, 1fr)", gridTemplateRows: "repeat(8, 1fr)" }}
      >
        {displayRows.map((row, displayRowIdx) => {
          // Actual board row index (0=rank 8, 7=rank 1)
          const actualRow = flipped ? 7 - displayRowIdx : displayRowIdx;

          return colIndices.map((actualCol) => {
            const file = String.fromCharCode(97 + actualCol); // 'a' to 'h'
            const rank = `${8 - actualRow}`;                  // '8' to '1'
            const squareName = `${file}${rank}`;
            const piece = row[actualCol];
            const isValidTarget = validMoves.includes(squareName);
            const hasPiece = piece !== null;

            const bgColor = getSquareColor(actualRow, actualCol, squareName, selectedSquare, lastMove);

            // File/rank labels on edges
            const showRankLabel = actualCol === (flipped ? 7 : 0);
            const showFileLabel = actualRow === (flipped ? 0 : 7);

            return (
              <div
                key={squareName}
                className="relative flex items-center justify-center cursor-pointer"
                style={{ backgroundColor: bgColor }}
                onClick={() => onSquareClick(squareName)}
              >
                {/* Rank label (1-8 on left edge) */}
                {showRankLabel && (
                  <span
                    className="absolute top-0.5 left-1 text-xs font-semibold pointer-events-none"
                    style={{ color: (actualRow + actualCol) % 2 === 0 ? DARK_SQUARE : LIGHT_SQUARE, fontSize: "0.65rem" }}
                  >
                    {rank}
                  </span>
                )}

                {/* File label (a-h on bottom edge) */}
                {showFileLabel && (
                  <span
                    className="absolute bottom-0.5 right-1 text-xs font-semibold pointer-events-none"
                    style={{ color: (actualRow + actualCol) % 2 === 0 ? DARK_SQUARE : LIGHT_SQUARE, fontSize: "0.65rem" }}
                  >
                    {file}
                  </span>
                )}

                {/* Valid move indicator */}
                {isValidTarget && !hasPiece && (
                  <div className={`absolute w-[28%] h-[28%] rounded-full pointer-events-none ${
                    (actualRow + actualCol) % 2 === 0 ? "bg-black/20" : "bg-white/20"
                  }`} />
                )}

                {/* Valid capture indicator (ring around enemy piece) */}
                {isValidTarget && hasPiece && (
                  <div className={`absolute inset-[6%] rounded-full border-[3px] pointer-events-none ${
                    (actualRow + actualCol) % 2 === 0 ? "border-black/25" : "border-white/25"
                  }`} />
                )}

                {/* Piece image */}
                {piece && (
                  <img
                    src={getPieceImage(piece.color, piece.type)}
                    alt={`${piece.color}${piece.type}`}
                    className="w-[80%] h-[80%] object-contain pointer-events-none drop-shadow-sm"
                    draggable={false}
                  />
                )}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};
