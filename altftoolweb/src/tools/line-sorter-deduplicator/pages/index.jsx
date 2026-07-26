"use client";

import { useCallback, useMemo, useState } from "react";
import { ArrowDownUp, Copy, Shuffle } from "lucide-react";

const SAMPLE = `banana
Apple
cherry
apple
item 10
item 2
banana

date
Cherry`;

const SORT_MODES = [
  { id: "none", label: "Keep original order" },
  { id: "asc", label: "A to Z" },
  { id: "desc", label: "Z to A" },
  { id: "natural-asc", label: "Natural / numeric (1, 2, 10)" },
  { id: "natural-desc", label: "Natural / numeric, reversed" },
  { id: "length-asc", label: "Shortest to longest" },
  { id: "length-desc", label: "Longest to shortest" },
  { id: "reverse", label: "Reverse current order" },
  { id: "shuffle", label: "Shuffle randomly" },
];

const DEDUPE_MODES = [
  { id: "off", label: "Keep every line" },
  { id: "first", label: "Remove duplicates (keep first)" },
  { id: "last", label: "Remove duplicates (keep last)" },
  { id: "unique-only", label: "Keep only lines that appear once" },
  { id: "dupes-only", label: "Keep only the repeated lines" },
];

const nf = new Intl.NumberFormat("en-IN");

/** Deterministic PRNG so a shuffle stays stable until you press Shuffle again. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed(list, seed) {
  const random = mulberry32(seed);
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function processLines(input, settings) {
  const { sortMode, dedupeMode, caseInsensitive, trimLines, removeBlank, seed } = settings;

  const rawLines = input.length === 0 ? [] : input.split(/\r\n|\r|\n/);
  const inputCount = rawLines.length;

  let lines = trimLines ? rawLines.map((line) => line.trim()) : rawLines;

  let blanksRemoved = 0;
  if (removeBlank) {
    const kept = lines.filter((line) => line.trim() !== "");
    blanksRemoved = lines.length - kept.length;
    lines = kept;
  }

  const keyOf = (line) => (caseInsensitive ? line.toLowerCase() : line);

  const counts = new Map();
  for (const line of lines) {
    const key = keyOf(line);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const beforeDedupe = lines.length;
  if (dedupeMode === "first") {
    const seen = new Set();
    lines = lines.filter((line) => {
      const key = keyOf(line);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } else if (dedupeMode === "last") {
    const seen = new Set();
    const reversed = [];
    for (let i = lines.length - 1; i >= 0; i -= 1) {
      const key = keyOf(lines[i]);
      if (seen.has(key)) continue;
      seen.add(key);
      reversed.push(lines[i]);
    }
    lines = reversed.reverse();
  } else if (dedupeMode === "unique-only") {
    lines = lines.filter((line) => counts.get(keyOf(line)) === 1);
  } else if (dedupeMode === "dupes-only") {
    const seen = new Set();
    lines = lines.filter((line) => {
      const key = keyOf(line);
      if (counts.get(key) < 2 || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  const removedByDedupe = beforeDedupe - lines.length;

  const collator = new Intl.Collator(undefined, {
    sensitivity: caseInsensitive ? "base" : "variant",
    numeric: false,
  });
  const naturalCollator = new Intl.Collator(undefined, {
    sensitivity: caseInsensitive ? "base" : "variant",
    numeric: true,
  });

  if (sortMode === "asc") lines = [...lines].sort(collator.compare);
  else if (sortMode === "desc") lines = [...lines].sort((a, b) => collator.compare(b, a));
  else if (sortMode === "natural-asc") lines = [...lines].sort(naturalCollator.compare);
  else if (sortMode === "natural-desc") lines = [...lines].sort((a, b) => naturalCollator.compare(b, a));
  else if (sortMode === "length-asc") lines = [...lines].sort((a, b) => a.length - b.length || collator.compare(a, b));
  else if (sortMode === "length-desc") lines = [...lines].sort((a, b) => b.length - a.length || collator.compare(a, b));
  else if (sortMode === "reverse") lines = [...lines].reverse();
  else if (sortMode === "shuffle") lines = shuffleWithSeed(lines, seed);

  const duplicateGroups = [...counts.values()].filter((count) => count > 1).length;

  return {
    lines,
    output: lines.join("\n"),
    inputCount,
    outputCount: lines.length,
    blanksRemoved,
    removedByDedupe,
    duplicateGroups,
    uniqueCount: counts.size,
  };
}

export default function ToolHome() {
  const [text, setText] = useState(SAMPLE);
  const [sortMode, setSortMode] = useState("asc");
  const [dedupeMode, setDedupeMode] = useState("first");
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const [trimLines, setTrimLines] = useState(true);
  const [removeBlank, setRemoveBlank] = useState(true);
  const [seed, setSeed] = useState(1);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      processLines(text, {
        sortMode,
        dedupeMode,
        caseInsensitive,
        trimLines,
        removeBlank,
        seed,
      }),
    [caseInsensitive, dedupeMode, removeBlank, seed, sortMode, text, trimLines]
  );

  const copyOutput = useCallback(async () => {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }, [result.output]);

  const reset = () => {
    setText(SAMPLE);
    setSortMode("asc");
    setDedupeMode("first");
    setCaseInsensitive(true);
    setTrimLines(true);
    setRemoveBlank(true);
    setSeed(1);
  };

  const isEmpty = text.trim() === "";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <ArrowDownUp className="h-4 w-4" aria-hidden="true" />
            Text & Writing
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Line Sorter and Deduplicator
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Paste any list to sort it alphabetically, naturally (item 2 before item 10), by length,
            in reverse or shuffled — and strip duplicates or blank lines at the same time.
          </p>
        </header>

        <section className="mt-6 grid gap-6">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="lsd-sort" className="text-sm font-semibold">
                  Sort order
                </label>
                <select
                  id="lsd-sort"
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                >
                  {SORT_MODES.map((mode) => (
                    <option key={mode.id} value={mode.id}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="lsd-dedupe" className="text-sm font-semibold">
                  Duplicate handling
                </label>
                <select
                  id="lsd-dedupe"
                  value={dedupeMode}
                  onChange={(event) => setDedupeMode(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                >
                  {DEDUPE_MODES.map((mode) => (
                    <option key={mode.id} value={mode.id}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["Ignore case", caseInsensitive, setCaseInsensitive],
                ["Trim spaces on each line", trimLines, setTrimLines],
                ["Remove blank lines", removeBlank, setRemoveBlank],
              ].map(([label, value, setter]) => (
                <label key={label} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(event) => setter(event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            {sortMode === "shuffle" && (
              <button
                type="button"
                onClick={() => setSeed((value) => value + 1)}
                aria-label="Shuffle the lines again"
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Shuffle className="h-4 w-4" aria-hidden="true" />
                Shuffle again
              </button>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label htmlFor="lsd-input" className="text-sm font-semibold">
                  Input list
                </label>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {nf.format(result.inputCount)} lines
                </span>
              </div>
              <textarea
                id="lsd-input"
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={14}
                spellCheck="false"
                placeholder="One item per line…"
                className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm leading-6 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setText("")}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Reset the tool to its defaults"
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label htmlFor="lsd-output" className="text-sm font-semibold">
                  Result
                </label>
                <button
                  type="button"
                  onClick={copyOutput}
                  aria-label="Copy the processed list"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  {copied ? "Copied!" : "Copy result"}
                </button>
              </div>
              <textarea
                id="lsd-output"
                value={result.output}
                readOnly
                rows={14}
                spellCheck="false"
                className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm leading-6 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              />
              {isEmpty && (
                <p
                  role="alert"
                  className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
                >
                  Paste a list into the input box — one item per line — to see the sorted result.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
              Lines returned
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {nf.format(result.outputCount)}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Input lines", nf.format(result.inputCount)],
                ["Duplicates removed", nf.format(result.removedByDedupe)],
                ["Blank lines removed", nf.format(result.blanksRemoved)],
                ["Repeated values", nf.format(result.duplicateGroups)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs font-medium text-[var(--muted-foreground)]">{label}</p>
                  <p className="mt-1 text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              Sorting uses your browser locale, so accented words land where a dictionary would put
              them. Natural order compares embedded numbers by value, not digit by digit.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
