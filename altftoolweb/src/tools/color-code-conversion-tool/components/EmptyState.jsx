export default function EmptyState({ text, compact = false }) {
  return (
    <div className={`min-w-0 rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)]/60 text-center text-[var(--muted-foreground)] ${compact ? "p-3 text-xs" : "p-5 text-sm"}`}>
      <p className="break-words [overflow-wrap:anywhere]">{text}</p>
    </div>
  );
}
