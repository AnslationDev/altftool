"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { DEFAULT_WARN_DAYS, trackDeadlines } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

function isoToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function makeDefaultRows(today) {
  const year = Number(today.slice(0, 4)) || 2026;
  return [
    { id: 1, name: "NSP fresh application", opens: `${year}-07-01`, closes: `${year}-10-31` },
    { id: 2, name: "College merit scholarship", opens: "", closes: `${year}-08-15` },
  ];
}

const STATUS_META = {
  open: { label: "Open", cls: "text-[var(--success)]" },
  "closing-soon": { label: "Closing soon", cls: "text-[var(--danger)]" },
  "not-open": { label: "Not open yet", cls: "text-[var(--muted-foreground)]" },
  closed: { label: "Closed", cls: "text-[var(--muted-foreground)] line-through" },
};

export default function ToolHome() {
  const initialToday = useMemo(() => isoToday(), []);
  const [today, setToday] = useState(initialToday);
  const [warnDays, setWarnDays] = useState(String(DEFAULT_WARN_DAYS));
  const [rows, setRows] = useState(() => makeDefaultRows(initialToday));
  const [nextId, setNextId] = useState(3);
  const { copy: copyToClipboard, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const result = useMemo(
    () =>
      trackDeadlines({
        rows,
        today,
        warnDays: warnDays.trim() === "" ? DEFAULT_WARN_DAYS : Number(warnDays),
      }),
    [rows, today, warnDays],
  );

  const hasError = Boolean(result.error);

  const updateRow = (id, patch) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, { id: nextId, name: "", opens: "", closes: "" }]);
    setNextId((id) => id + 1);
  };

  const removeRow = (id) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Scholarship deadlines as of ${today}`,
      `Open: ${result.counts.open} | Closing soon: ${result.counts.closingSoon} | Not open: ${result.counts.notOpen} | Closed: ${result.counts.closed}`,
      "",
    ];
    for (const item of result.items) {
      const meta = STATUS_META[item.status];
      lines.push(
        `- ${item.name}: ${meta.label}${item.status !== "closed" ? ` (${item.daysLeft} days left)` : ""}`,
      );
    }
    return lines.join("\n");
  }, [hasError, result, today]);

  const copyResult = () => {
    if (!summary) return;
    copyToClipboard("result", summary, { label: "Deadline summary" });
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset the tracker? This will discard every deadline you entered and restore the two sample rows. This cannot be undone.",
      )
    ) {
      return;
    }
    setToday(initialToday);
    setWarnDays(String(DEFAULT_WARN_DAYS));
    setRows(makeDefaultRows(initialToday));
    setNextId(3);
    resetCopyState();
  };

  const next = hasError ? null : result.nextDeadline;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Scholarship Tools
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Scholarship Deadline Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List your scholarship windows and document deadlines to see exactly how many days are
          left on each, what is closing soon and what has already shut.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sdt-today">
              Count days from
            </label>
            <input
              id="sdt-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sdt-warn">
              Flag as &quot;closing soon&quot; within (days)
            </label>
            <input
              id="sdt-warn"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={warnDays}
              onChange={(event) => setWarnDays(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {rows.map((row, index) => (
            <fieldset
              key={row.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Deadline {index + 1}
              </legend>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sdt-name-${row.id}`}>
                    Scholarship / task
                  </label>
                  <input
                    id={`sdt-name-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    placeholder="e.g. NSP renewal"
                    value={row.name}
                    onChange={(event) => updateRow(row.id, { name: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sdt-opens-${row.id}`}>
                    Opens (optional)
                  </label>
                  <input
                    id={`sdt-opens-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={row.opens}
                    onChange={(event) => updateRow(row.id, { opens: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sdt-closes-${row.id}`}>
                    Closes
                  </label>
                  <input
                    id={`sdt-closes-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={row.closes}
                    onChange={(event) => updateRow(row.id, { closes: event.target.value })}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                aria-label={`Remove deadline ${row.name || index + 1}`}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-soft)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </fieldset>
          ))}
        </div>

        <button type="button" onClick={addRow} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add deadline
        </button>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      {!hasError && result.invalid.length > 0 ? (
        <div
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.invalid.map(({ index, error }) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" aria-atomic="true">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Next deadline
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError || !next ? DASH : `${next.daysLeft} days`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the countdown."
                : next
                  ? `${next.name} closes first.`
                  : "No open deadlines in the list."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label={isCopied("result") ? "Copied the deadline summary to clipboard" : "Copy the deadline summary"}
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy result"}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the tracker to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {hasError
            ? null
            : [
                ["Open", result.counts.open],
                ["Closing soon", result.counts.closingSoon],
                ["Not open yet", result.counts.notOpen],
                ["Closed", result.counts.closed],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <dt className="text-xs text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="mt-1 text-xl font-semibold">{value}</dd>
                </div>
              ))}
        </dl>

        {!hasError && result.items.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Scholarship
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Days left
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item) => {
                  const meta = STATUS_META[item.status];
                  return (
                    <tr key={item.index} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{item.name}</td>
                      <td className={`py-2 pr-3 font-semibold ${meta.cls}`}>
                        {meta.label}
                        {item.status === "not-open" && item.daysToOpen !== null
                          ? ` (opens in ${item.daysToOpen}d)`
                          : ""}
                      </td>
                      <td className="py-2 text-right font-semibold">
                        {item.status === "closed" ? DASH : item.daysLeft}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Dates live only on this page — nothing is uploaded. Portal deadlines are extended or
        curtailed by notification, so re-check the official portal close to the date.
      </p>
    </main>
  );
}
