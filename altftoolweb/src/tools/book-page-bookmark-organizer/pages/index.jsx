"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmark, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import { buildIndex, formatIndexText } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";
const STORAGE_KEY = "altft-book-page-bookmark-organizer";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-xs font-semibold text-[var(--muted-foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ROWS = [
  { id: "b1", topic: "Federalism", book: "Indian Polity — Laxmikanth", pageFrom: "312", pageTo: "329", note: "centre-state relations" },
  { id: "b2", topic: "Federalism", book: "NCERT Class 11 Polity", pageFrom: "155", pageTo: "170", note: "" },
  { id: "b3", topic: "Monetary policy", book: "Indian Economy — Ramesh Singh", pageFrom: "418", pageTo: "", note: "repo rate box" },
];

let rowSeq = 100;

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setRows(parsed);
      }
    } catch {
      /* corrupted storage — keep defaults */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    } catch {
      /* storage blocked — session-only */
    }
  }, [rows]);

  const result = useMemo(() => buildIndex({ bookmarks: rows }), [rows]);
  const hasError = Boolean(result.error);
  const indexText = useMemo(() => (hasError ? "" : formatIndexText(result)), [hasError, result]);

  const updateRow = (id, field, value) => {
    setRows((previous) => previous.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    rowSeq += 1;
    setRows((previous) => [
      ...previous,
      { id: `b${rowSeq}-${previous.length}`, topic: "", book: "", pageFrom: "1", pageTo: "", note: "" },
    ]);
  };

  const removeRow = (id) => {
    setRows((previous) => previous.filter((row) => row.id !== id));
  };

  const copyResult = async () => {
    if (!indexText) return;
    try {
      await navigator.clipboard.writeText(indexText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setRows(DEFAULT_ROWS);
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
          <Bookmark className="h-4 w-4" aria-hidden="true" />
          Notes management
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Bookmark Page Organizer For Books</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Save page references per topic across all your books and get one sorted index — grouped by
          topic, ordered by book and page, saved in your browser only.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="space-y-5">
          {rows.map((row, index) => (
            <div key={row.id} className="rounded-lg border border-[var(--border)] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-topic`}>
                    Topic {index + 1}
                  </label>
                  <input
                    id={`${row.id}-topic`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="text"
                    value={row.topic}
                    placeholder="e.g. Federalism"
                    onChange={(event) => updateRow(row.id, "topic", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-book`}>
                    Book
                  </label>
                  <input
                    id={`${row.id}-book`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="text"
                    value={row.book}
                    placeholder="e.g. NCERT Class 11 Polity"
                    onChange={(event) => updateRow(row.id, "book", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-from`}>
                    Page from
                  </label>
                  <input
                    id={`${row.id}-from`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={row.pageFrom}
                    onChange={(event) => updateRow(row.id, "pageFrom", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-to`}>
                    Page to (blank for single page)
                  </label>
                  <input
                    id={`${row.id}-to`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={row.pageTo}
                    onChange={(event) => updateRow(row.id, "pageTo", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-note`}>
                    Note (optional)
                  </label>
                  <input
                    id={`${row.id}-note`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="text"
                    value={row.note}
                    placeholder="what is on these pages"
                    onChange={(event) => updateRow(row.id, "note", event.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    aria-label={`Remove bookmark ${index + 1}`}
                    className={`${GHOST_BTN} w-full text-[var(--danger)]`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button type="button" onClick={addRow} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add page reference
          </button>
        </div>
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Topic index
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.topicCount)} topics`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted problem to build the index."
                : `${NUM.format(result.totalBookmarks)} references across ${NUM.format(result.bookCount)} book${result.bookCount === 1 ? "" : "s"}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the full topic index"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy index"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to sample bookmarks" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError ? (
          <div className="mt-5 space-y-4">
            {result.groups.map((group) => (
              <div key={group.topic} className="rounded-lg border border-[var(--border)] p-4">
                <h2 className="text-sm font-semibold">
                  {group.topic}
                  <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">
                    {NUM.format(group.totalPages)} page{group.totalPages === 1 ? "" : "s"} saved
                  </span>
                </h2>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {group.entries.map((entry, entryIndex) => (
                    <li key={`${entry.book}-${entry.pageFrom}-${entryIndex}`} className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                      <span className="text-[var(--muted-foreground)]">
                        {entry.book}
                        {entry.note ? <span className="ml-1 text-xs">({entry.note})</span> : null}
                      </span>
                      <span className="font-semibold">
                        {entry.pageFrom === entry.pageTo
                          ? `p. ${NUM.format(entry.pageFrom)}`
                          : `pp. ${NUM.format(entry.pageFrom)}–${NUM.format(entry.pageTo)}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Biggest topic</dt>
            <dd className="text-right font-semibold">{hasError ? DASH : result.biggestTopic}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Total pages referenced</dt>
            <dd className="text-right font-semibold">{hasError ? DASH : NUM.format(result.totalPages)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Books indexed</dt>
            <dd className="text-right font-semibold">{hasError ? DASH : NUM.format(result.bookCount)}</dd>
          </div>
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Entries are grouped by topic (case-insensitive) and sorted by book title then start page —
        the same convention as a printed subject index. Everything is stored only in your browser.
      </p>
    </main>
  );
}
