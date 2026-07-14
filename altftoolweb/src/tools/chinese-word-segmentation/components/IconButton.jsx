export default function IconButton({ icon: Icon, label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-9 min-w-0 max-w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs font-bold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-45"
      title={label}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}
