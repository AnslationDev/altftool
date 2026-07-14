import { Clock, Hash, Shuffle } from "lucide-react";
import { getLetterForNumber } from "../utils/bingoLogic";

export default function NumberCaller({
  calledNumbers,
  currentNumber,
  calledLetters,
  onManualCall,
  onAutoCall,
  autoCallActive,
  autoCallSpeed,
  onSpeedChange,
  gameOver,
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <p className="text-xs font-semibold uppercase text-[var(--primary)]">Number Caller</p>
      <h2 className="mt-1 text-xl font-semibold">Call Numbers</h2>

      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
        <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Current Number</p>
        {currentNumber ? (
          <div className="mt-2 flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--primary)] bg-[var(--primary)] text-2xl font-bold text-white">
              {currentNumber}
            </span>
            <div>
              <p className="text-lg font-bold text-[var(--foreground)]">{getLetterForNumber(currentNumber)}-{currentNumber}</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {calledNumbers.length} of 75 called
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">No number called yet</p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-5 gap-1.5">
        {["B", "I", "N", "G", "O"].map((letter) => (
          <div key={letter} className="text-center">
            <p className="text-xs font-bold text-[var(--muted-foreground)]">{letter}</p>
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {calledLetters[letter] || 0}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={onManualCall}
          disabled={gameOver || calledNumbers.length >= 75}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90 focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Shuffle className="h-4 w-4" />
          Call Number
        </button>

        <button
          type="button"
          onClick={onAutoCall}
          disabled={gameOver || calledNumbers.length >= 75}
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 ${
            autoCallActive
              ? "border-[var(--muted)] bg-[var(--muted)] text-[var(--foreground)]"
              : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
          }`}
        >
          <Clock className="h-4 w-4" />
          {autoCallActive ? "Stop Auto" : "Auto Call"}
        </button>
      </div>

      <div className="mt-4">
        <label className="text-xs font-semibold text-[var(--muted-foreground)]" htmlFor="auto-speed">
          Speed: {autoCallSpeed / 1000}s
        </label>
        <input
          id="auto-speed"
          type="range"
          min={1000}
          max={5000}
          step={500}
          value={autoCallSpeed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--muted)] accent-[var(--primary)]"
        />
      </div>
    </div>
  );
}
