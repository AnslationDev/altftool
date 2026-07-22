"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Type,
  Search,
  Copy,
  Volume2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ALPHABETS } from "../data/alphabets";

export default function ToolHome() {
  const [activeId, setActiveId] = useState(ALPHABETS[0].id);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const gridRef = useRef(null);

  const active = useMemo(
    () => ALPHABETS.find((a) => a.id === activeId) || ALPHABETS[0],
    [activeId]
  );

  const chars = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return active.characters;
    return active.characters.filter(
      (c) =>
        c.char.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.pronunciation.toLowerCase().includes(q)
    );
  }, [active, query]);

  useEffect(() => {
    setSelectedIdx(0);
    setQuery("");
  }, [activeId]);

  const selected = chars[Math.min(selectedIdx, Math.max(0, chars.length - 1))];

  const copyChar = useCallback(async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.char);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }, [selected]);

  const speak = useCallback((text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(u);
  }, []);

  const move = useCallback(
    (delta) => {
      setSelectedIdx((prev) => {
        const next = prev + delta;
        if (next < 0 || next >= chars.length) return prev;
        return next;
      });
    },
    [chars.length]
  );

  const onKeyDown = useCallback(
    (e) => {
      const rtl = active.direction === "RTL";
      if (e.key === "ArrowRight") {
        e.preventDefault();
        move(rtl ? 1 : -1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        move(rtl ? -1 : 1);
      }
    },
    [active.direction, move]
  );

  const switchScript = useCallback(
    (dir) => {
      const idx = ALPHABETS.findIndex((a) => a.id === activeId);
      const next = (idx + dir + ALPHABETS.length) % ALPHABETS.length;
      setActiveId(ALPHABETS[next].id);
    },
    [activeId]
  );

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8 transition-colors">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-2xl border border-(--border) bg-(--card) p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--muted) text-(--primary)">
              <Type className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-(--foreground) leading-none">
                Alphabet Explorer
              </h1>
              <p className="text-xs text-(--muted-foreground) mt-1.5 max-w-2xl leading-relaxed">
                Browse {ALPHABETS.length} writing systems. Tap any character to see its
                name, pronunciation, Unicode point, and an example word.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold text-(--muted-foreground)">
            {["Runs locally", "RTL aware", `${ALPHABETS.length} scripts`].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-md border border-(--border) bg-(--background) px-2 py-1"
              >
                <Sparkles className="h-3 w-3 text-(--primary)" />
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* Script switcher */}
        <div className="flex items-center gap-2 rounded-2xl border border-(--border) bg-(--card) p-2 shadow-sm">
          <button
            onClick={() => switchScript(-1)}
            className="rounded-lg border border-(--border) bg-(--background) p-2 text-(--muted-foreground) hover:text-(--primary) transition"
            aria-label="Previous script"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex flex-1 items-center justify-center gap-2">
            <h2 className="text-sm font-bold text-(--foreground)">{active.name}</h2>
            <span className="rounded-md bg-(--muted) px-2 py-0.5 text-[10px] font-semibold text-(--muted-foreground)">
              {active.script} · {active.direction}
            </span>
          </div>
          <button
            onClick={() => switchScript(1)}
            className="rounded-lg border border-(--border) bg-(--background) p-2 text-(--muted-foreground) hover:text-(--primary) transition"
            aria-label="Next script"
          >
            <ChevronRight size={16} />
          </button>
          <select
            value={activeId}
            onChange={(e) => setActiveId(e.target.value)}
            className="ml-1 rounded-lg border border-(--border) bg-(--background) px-2 py-2 text-xs font-semibold text-(--foreground) outline-none focus:border-(--primary)"
          >
            {ALPHABETS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <p className="text-xs leading-relaxed text-(--muted-foreground)">{active.note}</p>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIdx(0);
            }}
            placeholder={`Search ${active.name} characters…`}
            className="w-full rounded-xl border border-(--border) bg-(--card) py-2.5 pl-9 pr-3 text-sm text-(--foreground) outline-none focus:border-(--primary) focus:shadow-[0_0_0_3px_rgba(20,184,166,0.25)] transition"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Grid */}
          <div
            ref={gridRef}
            tabIndex={0}
            onKeyDown={onKeyDown}
            className={`rounded-2xl border border-(--border) bg-(--card) p-4 shadow-sm outline-none focus:border-(--primary) ${
              active.direction === "RTL" ? "text-right" : "text-left"
            }`}
          >
            {chars.length === 0 ? (
              <p className="py-10 text-center text-xs italic text-(--muted-foreground)">
                No characters match &ldquo;{query}&rdquo;.
              </p>
            ) : (
              <div
                className="grid grid-cols-4 gap-2 sm:grid-cols-6"
                style={{ direction: active.direction === "RTL" ? "rtl" : "ltr" }}
              >
                {chars.map((c, idx) => (
                  <button
                    key={c.unicode}
                    onClick={() => setSelectedIdx(idx)}
                    className={`flex aspect-square flex-col items-center justify-center rounded-xl border transition ${
                      selectedIdx === idx
                        ? "border-(--primary) bg-(--muted)"
                        : "border-(--border) bg-(--background) hover:bg-(--muted)"
                    }`}
                  >
                    <span className="text-2xl font-semibold text-(--foreground) leading-none">
                      {c.char}
                    </span>
                    <span className="mt-1 text-[9px] text-(--muted-foreground)">{c.name}</span>
                  </button>
                ))}
              </div>
            )}
            <p className="mt-3 text-center text-[10px] text-(--muted-foreground)">
              Use arrow keys to navigate · showing {chars.length} of {active.characters.length}
            </p>
          </div>

          {/* Detail */}
          <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
            {selected ? (
              <div className="space-y-4" style={{ direction: active.direction === "RTL" ? "rtl" : "ltr" }}>
                <div className="flex items-center justify-between">
                  <span className="text-6xl font-bold text-(--foreground) leading-none">
                    {selected.char}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => speak(selected.char)}
                      className="rounded-lg border border-(--border) bg-(--background) p-2 text-(--muted-foreground) hover:text-(--primary) transition"
                      aria-label="Pronounce character"
                    >
                      <Volume2 size={16} />
                    </button>
                    <button
                      onClick={copyChar}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-(--primary) px-3 py-2 text-[11px] font-bold text-(--primary-foreground) transition hover:opacity-90"
                    >
                      <Copy size={14} />
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-(--border) bg-(--background) p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">Name</p>
                    <p className="mt-1 text-sm font-semibold text-(--foreground)">{selected.name}</p>
                  </div>
                  <div className="rounded-xl border border-(--border) bg-(--background) p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">Pronunciation</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-(--primary)">{selected.pronunciation}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-(--border) bg-(--background) p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">Unicode</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-(--foreground)">{selected.unicode}</p>
                </div>

                <div className="rounded-xl border border-(--border) bg-(--muted) p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">Example</p>
                  <p className="mt-1 text-sm font-semibold text-(--foreground)">{selected.example}</p>
                </div>
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-(--muted-foreground)">
                Select a character to see details.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
