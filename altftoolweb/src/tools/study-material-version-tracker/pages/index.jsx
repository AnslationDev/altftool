"use client";

import { useEffect, useMemo, useState } from "react";
import { BookCopy, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import { STALE_AFTER_YEARS, summarizeMaterials } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";
const STORAGE_KEY = "altft-study-material-version-tracker";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-xs font-semibold text-[var(--muted-foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STATUS_BADGE = {
  current: "bg-[var(--muted)] text-[var(--success)]",
  behind: "bg-[var(--muted)] text-[var(--danger)]",
  unknown: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};
const STATUS_TEXT = { current: "Current", behind: "Behind", unknown: "Check latest" };

const DEFAULT_ROWS = [
  { id: "r1", title: "Indian Polity — Laxmikanth", usingEdition: "6", usingYear: "2019", latestEdition: "7" },
  { id: "r2", title: "Physics module — Vol 2", usingEdition: "3", usingYear: "2024", latestEdition: "3" },
  { id: "r3", title: "Modern History notes", usingEdition: "1", usingYear: "2022", latestEdition: "" },
];

let rowSeq = 100;

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [referenceYear, setReferenceYear] = useState(() => new Date().getFullYear());
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
      /* storage full or blocked — tracking still works for the session */
    }
  }, [rows]);

  const result = useMemo(
    () => summarizeMaterials({ materials: rows, referenceYear }),
    [rows, referenceYear],
  );
  const hasError = Boolean(result.error);

  const updateRow = (id, field, value) => {
    setRows((previous) => previous.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    rowSeq += 1;
    setRows((previous) => [
      ...previous,
      { id: `r${rowSeq}-${previous.length}`, title: "", usingEdition: "1", usingYear: "", latestEdition: "" },
    ]);
  };

  const removeRow = (id) => {
    setRows((previous) => previous.filter((row) => row.id !== id));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Study material version check",
      ...result.items.map((item) => {
        const detail =
          item.status === "behind"
            ? `behind by ${item.editionsBehind} edition(s) — latest is ed. ${item.latestEdition}`
            : item.status === "current"
              ? "current"
              : "latest edition not recorded";
        return `${item.title}: using ed. ${item.usingEdition} — ${detail}`;
      }),
      `Needs action: ${result.actionNeeded} of ${result.total}`,
    ].join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
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
          <BookCopy className="h-4 w-4" aria-hidden="true" />
          Notes management
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Study Material Version Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Record the edition of every book and module you actually study from, alongside the latest
          edition you know of. The list is saved in your browser only.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="space-y-5">
          {rows.map((row, index) => (
            <div key={row.id} className="rounded-lg border border-[var(--border)] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-title`}>
                    Book / module {index + 1}
                  </label>
                  <input
                    id={`${row.id}-title`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="text"
                    value={row.title}
                    placeholder="e.g. Indian Polity — Laxmikanth"
                    onChange={(event) => updateRow(row.id, "title", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-using`}>
                    Edition you use
                  </label>
                  <input
                    id={`${row.id}-using`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={row.usingEdition}
                    onChange={(event) => updateRow(row.id, "usingEdition", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-year`}>
                    Year of that edition (optional)
                  </label>
                  <input
                    id={`${row.id}-year`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1900"
                    step="1"
                    value={row.usingYear}
                    onChange={(event) => updateRow(row.id, "usingYear", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-latest`}>
                    Latest edition (blank if unknown)
                  </label>
                  <input
                    id={`${row.id}-latest`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={row.latestEdition}
                    onChange={(event) => updateRow(row.id, "latestEdition", event.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    aria-label={`Remove ${row.title || `row ${index + 1}`}`}
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
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={addRow} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add material
          </button>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold" htmlFor="smvt-refyear">
              Reference year
            </label>
            <input
              id="smvt-refyear"
              className={`${INPUT_CLASS} w-28`}
              type="number"
              inputMode="numeric"
              min="1900"
              step="1"
              value={referenceYear}
              onChange={(event) => setReferenceYear(Number(event.target.value))}
            />
          </div>
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
              Materials needing action
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.actionNeeded)} / ${NUM.format(result.total)}`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted problem to see the summary."
                : `${NUM.format(result.counts.behind)} behind, ${NUM.format(result.counts.unknown)} unchecked, ${NUM.format(result.counts.current)} current.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the version summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the tracker to sample rows" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Material</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Using</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Latest</th>
                  <th scope="col" className="py-2 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item) => (
                  <tr key={item.title} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      {item.title}
                      {item.stale ? (
                        <span className="ml-2 text-xs text-[var(--muted-foreground)]">
                          ({NUM.format(item.ageYears)} yrs old)
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3">ed. {NUM.format(item.usingEdition)}</td>
                    <td className="py-2 pr-3">{item.latestEdition === null ? DASH : `ed. ${NUM.format(item.latestEdition)}`}</td>
                    <td className="py-2 text-right">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[item.status]}`}>
                        {item.status === "behind" ? `Behind by ${NUM.format(item.editionsBehind)}` : STATUS_TEXT[item.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Most out-of-date material</dt>
            <dd className="text-right font-semibold">
              {hasError || !result.mostBehind
                ? DASH
                : `${result.mostBehind.title} (behind by ${NUM.format(result.mostBehind.editionsBehind)})`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Oldest edition on the shelf</dt>
            <dd className="text-right font-semibold">
              {hasError || !result.oldest
                ? DASH
                : `${result.oldest.title} (${NUM.format(result.oldest.usingYear)})`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Editions older than {STALE_AFTER_YEARS} years</dt>
            <dd className="text-right font-semibold">{hasError ? DASH : NUM.format(result.staleCount)}</dd>
          </div>
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A material is Current when your edition number matches or exceeds the latest you recorded,
        Behind when a higher edition exists, and Unknown when you have not checked the latest
        edition. Editions revised more than {STALE_AFTER_YEARS} years ago are flagged for a re-check.
      </p>
    </main>
  );
}
