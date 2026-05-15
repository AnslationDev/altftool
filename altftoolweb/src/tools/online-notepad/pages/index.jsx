"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Edit3, Trash2 } from "lucide-react";

const storageKey = "altftool-online-notepad";
const emptyDraft = { note: "", title: "Untitled note" };

function loadDraft() {
  if (typeof window === "undefined") return emptyDraft;
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? { ...emptyDraft, ...JSON.parse(saved) } : emptyDraft;
  } catch {
    return emptyDraft;
  }
}

export default function ToolHome() {
  const [draft, setDraft] = useState(loadDraft);
  const { note, title } = draft;

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [draft]);

  const stats = useMemo(() => {
    const words = note.trim() ? note.trim().split(/\s+/).length : 0;
    return { words, chars: note.length, lines: note ? note.split("\n").length : 0 };
  }, [note]);

  const downloadNote = () => {
    const blob = new Blob([note], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.trim() || "note"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Edit3 className="h-4 w-4" />
            Autosaved notes
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Online Notepad</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Capture quick notes in the browser with automatic local saving and plain-text export.
          </p>
        </section>

        <section className="relative z-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <input value={title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} className="min-w-[14rem] flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-lg font-semibold outline-none focus:border-[var(--primary)] sm:text-xl" />
            <button type="button" onClick={downloadNote} className="btn-primary">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button type="button" onClick={() => setDraft((current) => ({ ...current, note: "" }))} className="btn-secondary">
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[var(--muted-foreground)]">
            <span className="rounded-full bg-[var(--muted)] px-3 py-1">{stats.words} words</span>
            <span className="rounded-full bg-[var(--muted)] px-3 py-1">{stats.chars} characters</span>
            <span className="rounded-full bg-[var(--muted)] px-3 py-1">{stats.lines} lines</span>
            <span className="rounded-full bg-[var(--muted)] px-3 py-1">Autosaved locally</span>
          </div>
          <textarea
            value={note}
            onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))}
            className="relative z-10 mt-5 min-h-[360px] w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-base leading-8 outline-none focus:border-[var(--primary)] sm:min-h-[460px] sm:p-5"
            placeholder="Start writing..."
          />
        </section>
      </div>
    </main>
  );
}
