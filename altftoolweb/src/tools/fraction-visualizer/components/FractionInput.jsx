"use client";

export default function FractionInput({ numerator, denominator, onNumeratorChange, onDenominatorChange, label, disabled = false }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {label && <span className="text-xs font-semibold text-[var(--muted-foreground)]">{label}</span>}
      <div className="flex flex-col items-center">
        <input
          type="number"
          min="0"
          max="999"
          value={numerator}
          onChange={(e) => onNumeratorChange(parseInt(e.target.value) || 0)}
          disabled={disabled}
          className="h-12 w-20 rounded-lg border border-[var(--border)] bg-[var(--card)] text-center text-xl font-bold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] disabled:opacity-50"
        />
        <div className="my-1 h-0.5 w-16 bg-[var(--foreground)]" />
        <input
          type="number"
          min="1"
          max="999"
          value={denominator}
          onChange={(e) => onDenominatorChange(Math.max(1, parseInt(e.target.value) || 1))}
          disabled={disabled}
          className="h-12 w-20 rounded-lg border border-[var(--border)] bg-[var(--card)] text-center text-xl font-bold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] disabled:opacity-50"
        />
      </div>
    </div>
  );
}
