"use client";

function counts(code) {
  const chars = code.length;
  const lines = code.length === 0 ? 0 : code.split("\n").length;
  const words = code.trim() ? code.trim().split(/\s+/).length : 0;
  return { chars, lines, words };
}

function fmtMem(mb) {
  if (mb == null) return "—";
  return `${mb.toFixed(1)} MB`;
}

export default function StatusBar({ code, autosaved, memory, language }) {
  const c = counts(code);
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-(--border) bg-(--card) px-3 py-1.5 text-xs text-(--muted-foreground)">
      <span className="font-semibold uppercase tracking-wide text-(--primary)">{language}</span>
      <span>{c.lines} lines</span>
      <span>{c.words} words</span>
      <span>{c.chars} chars</span>
      <div className="ml-auto flex items-center gap-4">
        <span title="JavaScript heap (Chromium only)">Mem: {fmtMem(memory)}</span>
        <span
          className={`flex items-center gap-1.5 ${autosaved ? "text-(--primary)" : "text-(--muted-foreground)"}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              autosaved ? "bg-(--primary)" : "bg-(--muted-foreground)"
            }`}
          />
          {autosaved ? "Saved" : "Saving…"}
        </span>
      </div>
    </div>
  );
}
