export default function CompareBlock({ label, value, compact = false }) {
  return (
    <div className={`${compact ? "min-h-20 p-3" : "min-h-28 p-3"} min-w-0 max-w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]/70`}>
      <p className={`${compact ? "mb-2 text-[11px]" : "mb-3 text-xs"} font-bold uppercase text-[var(--muted-foreground)]`}>{label}</p>
      <p className={`${compact ? "max-h-24 text-sm leading-6" : "text-sm leading-7"} max-w-full overflow-y-auto whitespace-pre-wrap break-words text-[var(--foreground)] [overflow-wrap:anywhere]`}>
        {value}
      </p>
    </div>
  );
}
