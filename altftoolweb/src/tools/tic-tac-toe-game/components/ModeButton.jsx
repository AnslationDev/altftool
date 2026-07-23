"use client";

export default function ModeButton({ active, children, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] ${
        active
          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
          : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{children}</span>
    </button>
  );
}
