import { Check } from "lucide-react";

export default function BingoCell({ cell, row, col, isMarked, onClick, disabled, isWinning }) {
  return (
    <button
      type="button"
      role="gridcell"
      onClick={onClick}
      disabled={disabled}
      aria-label={
        cell.isFree
          ? "Free space"
          : `${cell.letter}-${cell.number}${isMarked ? ", marked" : ""}`
      }
      className={`flex aspect-square items-center justify-center rounded-lg border text-sm font-semibold transition focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] sm:text-base ${
        isWinning
          ? "border-[var(--primary)] bg-[var(--primary-foreground)] text-[var(--primary)] shadow-[var(--anslation-ds-shadow-md)] motion-safe:animate-pulse"
          : cell.isFree
            ? "border-[var(--primary)] bg-[var(--primary)] text-white cursor-default"
            : isMarked
              ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--primary)]"
              : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)] hover:bg-[var(--muted)]"
      } ${disabled ? "cursor-default" : "cursor-pointer"}`}
    >
      {cell.isFree ? (
        <span className="flex items-center justify-center gap-0.5">
          <Check className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">FREE</span>
        </span>
      ) : (
        <span className="flex flex-col items-center leading-none">
          <span className="text-[10px] font-bold uppercase text-[var(--muted-foreground)] sm:text-xs">{cell.letter}</span>
          <span>{cell.number}</span>
        </span>
      )}
    </button>
  );
}
