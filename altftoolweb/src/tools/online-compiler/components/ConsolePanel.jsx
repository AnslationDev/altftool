"use client";

const LEVEL_STYLES = {
  log: "text-(--foreground)",
  info: "text-(--primary)",
  warn: "text-amber-500",
  error: "text-red-500",
  system: "text-(--muted-foreground)",
};

function fmtTime(t) {
  try {
    const d = new Date(t);
    return d.toLocaleTimeString([], { hour12: false });
  } catch {
    return "";
  }
}

export default function ConsolePanel({ logs, onClear }) {
  return (
    <div className="flex h-full flex-col bg-(--card)">
      <div className="flex items-center justify-between border-b border-(--border) px-3 py-2">
        <span className="text-xs font-semibold text-(--muted-foreground)">
          Console ({logs.length})
        </span>
        <button
          type="button"
          onClick={onClear}
          className="rounded-md px-2 py-1 text-xs text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground)"
        >
          Clear
        </button>
      </div>
      <div className="flex-1 overflow-auto p-2 font-mono text-xs leading-relaxed">
        {logs.length === 0 ? (
          <p className="px-2 py-4 text-(--muted-foreground)">
            Console output will appear here.
          </p>
        ) : (
          logs.map((l, i) => (
            <div
              key={i}
              className={`flex gap-2 border-b border-(--border)/40 px-2 py-1 ${
                LEVEL_STYLES[l.level] || LEVEL_STYLES.log
              }`}
            >
              <span className="shrink-0 opacity-50">{fmtTime(l.time)}</span>
              <span className="whitespace-pre-wrap break-words">{l.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
