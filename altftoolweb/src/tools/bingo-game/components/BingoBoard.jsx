import BingoCell from "./BingoCell";

export default function BingoBoard({ board, markedCells, onCellClick, disabled, winningCells }) {
  return (
    <div
      className="mx-auto grid w-full max-w-[min(100%,420px)] grid-cols-5 gap-2 sm:gap-3"
      role="grid"
      aria-label="Bingo board"
    >
      {["B", "I", "N", "G", "O"].map((letter) => (
        <div
          key={letter}
          className="flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--primary)] py-2 text-sm font-bold text-white sm:text-base"
          role="columnheader"
        >
          {letter}
        </div>
      ))}

      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const key = `${rowIndex}-${colIndex}`;
          return (
            <BingoCell
              key={key}
              cell={cell}
              row={rowIndex}
              col={colIndex}
              isMarked={markedCells.has(key)}
              isWinning={winningCells.has(key)}
              onClick={() => onCellClick(rowIndex, colIndex)}
              disabled={disabled || cell.isFree || markedCells.has(key)}
            />
          );
        })
      )}
    </div>
  );
}
