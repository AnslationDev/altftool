"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpenCheck, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  MAX_CHAPTERS,
  MIN_CHAPTERS,
  NCERT_PRESETS,
  STATUSES,
  STATUS_IDS,
  freshStatuses,
  nextStatus,
  resizeStatuses,
  summarizeTracker,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";
const STORAGE_KEY = "altft-ncert-chapter-tracker";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-xs font-semibold text-[var(--muted-foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STATUS_CHIP = {
  "not-started": "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]",
  reading: "border-[var(--primary)] bg-[var(--background)] text-[var(--primary)]",
  read: "border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)]",
  revised: "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]",
};

const STATUS_LABEL = Object.fromEntries(STATUSES.map((status) => [status.id, status.label]));

const DEFAULT_BOOKS = [
  {
    id: "bk1",
    name: "Class 10 Science (rationalised)",
    statuses: ["revised", "revised", "read", "read", "reading", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started"],
  },
];

let bookSeq = 100;

export default function ToolHome() {
  const [books, setBooks] = useState(DEFAULT_BOOKS);
  const [presetId, setPresetId] = useState(NCERT_PRESETS[1].id);
  const [copied, setCopied] = useState(false);
  // Raw, uncommitted text for the "Chapters" count field, keyed by book id.
  // Keeping this separate from `books` means an in-progress multi-digit edit
  // (e.g. typing "24" fires onChange with "2", then "24") never triggers the
  // destructive array resize until the value is committed on blur/Enter.
  const [countDrafts, setCountDrafts] = useState({});
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(copyTimeoutRef.current);
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Repair/drop malformed entries so a corrupted payload can't crash
          // the render on `.length`/`.map` of an undefined/null `statuses`.
          const sanitized = parsed
            .filter(
              (book) =>
                book &&
                typeof book === "object" &&
                typeof book.id === "string" &&
                Array.isArray(book.statuses) &&
                book.statuses.length > 0,
            )
            .map((book) => ({
              ...book,
              name: typeof book.name === "string" ? book.name : "",
              statuses: book.statuses.map((status) => (STATUS_IDS.includes(status) ? status : STATUS_IDS[0])),
            }));
          if (sanitized.length > 0) setBooks(sanitized);
        }
      }
    } catch {
      /* corrupted storage — keep defaults */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    } catch {
      /* storage blocked — session-only */
    }
  }, [books]);

  const result = useMemo(() => summarizeTracker({ books }), [books]);
  const hasError = Boolean(result.error);

  const addPresetBook = () => {
    const preset = NCERT_PRESETS.find((entry) => entry.id === presetId) ?? NCERT_PRESETS[0];
    bookSeq += 1;
    setBooks((previous) => [
      ...previous,
      { id: `bk${bookSeq}-${previous.length}`, name: preset.label, statuses: freshStatuses(preset.chapters) },
    ]);
  };

  const addCustomBook = () => {
    bookSeq += 1;
    setBooks((previous) => [
      ...previous,
      { id: `bk${bookSeq}-${previous.length}`, name: "", statuses: freshStatuses(10) },
    ]);
  };

  const removeBook = (id) => {
    const book = books.find((entry) => entry.id === id);
    const label = book?.name?.trim() || "this book";
    if (!window.confirm(`Remove "${label}"? Its chapter progress will be permanently deleted.`)) {
      return;
    }
    setBooks((previous) => previous.filter((entry) => entry.id !== id));
    setCountDrafts((previous) => {
      if (!(id in previous)) return previous;
      const next = { ...previous };
      delete next[id];
      return next;
    });
  };

  const renameBook = (id, name) => {
    setBooks((previous) => previous.map((book) => (book.id === id ? { ...book, name } : book)));
  };

  // Called only when the "Chapters" count is committed (blur or Enter), never
  // on individual keystrokes — see `countDrafts` above. An incomplete or
  // out-of-range value is discarded (the book keeps its previous statuses)
  // instead of being treated as a truncation target.
  const commitBookCount = (id, rawValue) => {
    setCountDrafts((previous) => {
      if (!(id in previous)) return previous;
      const next = { ...previous };
      delete next[id];
      return next;
    });
    setBooks((previous) =>
      previous.map((book) => {
        if (book.id !== id) return book;
        const count = Number(rawValue);
        if (!Number.isInteger(count) || count < MIN_CHAPTERS || count > MAX_CHAPTERS) return book;
        if (count < book.statuses.length) {
          const dropped = book.statuses.slice(count);
          const hasProgress = dropped.some((status) => status !== "not-started");
          if (hasProgress) {
            const label = book.name?.trim() || "this book";
            const confirmed = window.confirm(
              `Shrink "${label}" to ${count} chapters? This permanently deletes progress on the last ${dropped.length} chapter${dropped.length === 1 ? "" : "s"}.`,
            );
            if (!confirmed) return book;
          }
        }
        return { ...book, statuses: resizeStatuses(book.statuses, count) };
      }),
    );
  };

  const cycleChapter = (id, chapterIndex) => {
    setBooks((previous) =>
      previous.map((book) =>
        book.id === id
          ? {
              ...book,
              statuses: book.statuses.map((status, index) =>
                index === chapterIndex ? nextStatus(status) : status,
              ),
            }
          : book,
      ),
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "NCERT chapter tracker",
      ...result.books.map(
        (book) =>
          `${book.name}: ${NUM.format(book.readOrBetter)}/${NUM.format(book.total)} read (${PCT.format(book.percentRead)}%), ${NUM.format(book.counts.revised)} revised`,
      ),
      `Overall: ${PCT.format(result.overallPercentRead)}% read, ${PCT.format(result.overallPercentRevised)}% revised, ${NUM.format(result.remaining)} chapters left`,
    ].join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (!window.confirm("Reset the tracker? This deletes every tracked book and all chapter progress saved in this browser.")) {
      return;
    }
    setBooks(DEFAULT_BOOKS);
    setCountDrafts({});
    setCopied(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
          NCERT tools
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">NCERT Chapter Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tap a chapter to cycle it through Not started → Reading → Read once → Revised. Progress is
          saved in your browser. Preset chapter counts follow the rationalised (2023-24 onward)
          NCERT editions — edit the count if your print differs.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nct-preset">
              Add a preset NCERT book
            </label>
            <select
              id="nct-preset"
              className={`mt-1.5 ${INPUT_CLASS}`}
              value={presetId}
              onChange={(event) => setPresetId(event.target.value)}
            >
              {NCERT_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label} — {preset.chapters} ch
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button type="button" onClick={addPresetBook} className={`${PRIMARY_BTN} flex-1`}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add preset
            </button>
            <button type="button" onClick={addCustomBook} className={`${GHOST_BTN} flex-1`}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Custom book
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          {books.map((book, index) => (
            <div key={book.id} className="rounded-lg border border-[var(--border)] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${book.id}-name`}>
                    Book {index + 1}
                  </label>
                  <input
                    id={`${book.id}-name`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="text"
                    value={book.name}
                    placeholder="e.g. Class 12 Physics"
                    onChange={(event) => renameBook(book.id, event.target.value)}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className={LABEL_CLASS} htmlFor={`${book.id}-count`}>
                      Chapters
                    </label>
                    <input
                      id={`${book.id}-count`}
                      className={`mt-1.5 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="numeric"
                      min={MIN_CHAPTERS}
                      max={MAX_CHAPTERS}
                      step="1"
                      value={countDrafts[book.id] ?? book.statuses.length}
                      onChange={(event) => {
                        const { value } = event.target;
                        setCountDrafts((previous) => ({ ...previous, [book.id]: value }));
                      }}
                      onBlur={(event) => commitBookCount(book.id, event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") event.currentTarget.blur();
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBook(book.id)}
                    aria-label={`Remove ${book.name || `book ${index + 1}`}`}
                    className={`${GHOST_BTN} text-[var(--danger)]`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {book.statuses.map((status, chapterIndex) => (
                  <button
                    key={chapterIndex}
                    type="button"
                    onClick={() => cycleChapter(book.id, chapterIndex)}
                    aria-label={`Chapter ${chapterIndex + 1}: ${STATUS_LABEL[status] ?? status}. Tap to change.`}
                    className={`min-h-11 min-w-11 rounded-md border px-2 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${STATUS_CHIP[status] ?? STATUS_CHIP["not-started"]}`}
                  >
                    {chapterIndex + 1}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)]">
          {STATUSES.map((status) => (
            <li key={status.id} className="flex items-center gap-1.5">
              <span className={`inline-block h-3 w-3 rounded-sm border ${STATUS_CHIP[status.id]}`} aria-hidden="true" />
              {status.label}
            </li>
          ))}
        </ul>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" aria-atomic="true">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Overall read
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${PCT.format(result.overallPercentRead)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted problem to see progress."
                : `${NUM.format(result.totalRead)} of ${NUM.format(result.totalChapters)} chapters read at least once; ${PCT.format(result.overallPercentRevised)}% revised.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the chapter progress summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {copied ? "Copied to clipboard" : ""}
            </span>
            <button type="button" onClick={reset} aria-label="Reset the tracker" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" aria-atomic="true">
          {(hasError
            ? [
                ["Chapters read", DASH],
                ["Chapters revised", DASH],
                ["Chapters remaining", DASH],
              ]
            : [
                ...result.books.map((book) => [
                  book.name,
                  `${NUM.format(book.readOrBetter)}/${NUM.format(book.total)} read · ${NUM.format(book.counts.revised)} revised`,
                ]),
                ["Chapters remaining (not yet read)", NUM.format(result.remaining)],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        "% read" counts chapters marked Read once or Revised; "% revised" counts only Revised.
        Overall progress is weighted by chapter count across books. Preset counts follow the
        rationalised NCERT editions in print since 2023-24 — older prints have more chapters.
      </p>
    </main>
  );
}
