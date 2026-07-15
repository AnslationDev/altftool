export default function EmptyState({ text, compact = false }) {
  return (
    <div className={`${compact ? "min-h-16 p-3" : "min-h-24 p-4"} flex min-w-0 max-w-full items-center justify-center rounded-xl border border-dashed border-[var(--border)] text-center text-sm text-[var(--muted-foreground)]`}>
      {text}
    </div>
  );
}
