"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  MessageCircleQuestion,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

import {
  RESOLVER_OPTIONS,
  STALE_OPEN_DAYS,
  summarizeDoubts,
  validateDoubt,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STORAGE_KEY = "altft-doubt-resolution-log-v1";
const DASH = "—";

const SAMPLE_ENTRIES = [
  {
    id: "sample-1",
    subject: "Physics",
    question: "Why is tension the same throughout a massless string?",
    resolvedBy: "faculty",
    raisedOn: "2026-07-10",
    resolvedOn: "2026-07-12",
    retested: true,
  },
  {
    id: "sample-2",
    subject: "Maths",
    question: "Integration by parts — choosing u and dv",
    resolvedBy: "online",
    raisedOn: "2026-07-15",
    resolvedOn: "2026-07-15",
    retested: false,
  },
  {
    id: "sample-3",
    subject: "Chemistry",
    question: "Order of SN1 vs SN2 for tertiary halides",
    resolvedBy: "",
    raisedOn: "2026-07-20",
    resolvedOn: "",
    retested: false,
  },
];

const EMPTY_FORM = {
  subject: "",
  question: "",
  resolvedBy: "faculty",
  raisedOn: "",
  resolvedOn: "",
  retested: false,
};

export default function ToolHome() {
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState(SAMPLE_ENTRIES);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM, raisedOn: "" });
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setEntries(parsed);
      }
    } catch {
      // ignore corrupted storage
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // storage may be unavailable (private mode)
    }
  }, [entries, loaded]);

  const stats = useMemo(() => summarizeDoubts({ entries, today }), [entries, today]);
  const hasError = Boolean(stats.error);

  const addDoubt = () => {
    const candidate = { ...form, raisedOn: form.raisedOn || today };
    const check = validateDoubt(candidate);
    if (check.error) {
      setFormError(check.error);
      return;
    }
    setFormError("");
    setEntries((prev) => [
      {
        ...candidate,
        id: `d-${prev.length + 1}-${candidate.raisedOn}-${candidate.subject}`,
        resolvedBy: candidate.resolvedOn ? candidate.resolvedBy : "",
        retested: candidate.resolvedOn ? candidate.retested : false,
      },
      ...prev,
    ]);
    setForm({ ...EMPTY_FORM, raisedOn: "" });
  };

  const removeDoubt = (id) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const markResolved = (id) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, resolvedOn: today, resolvedBy: entry.resolvedBy || "self" } : entry,
      ),
    );
  };

  const toggleRetested = (id) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, retested: !entry.retested } : entry)),
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Doubt resolution log summary",
      `Total doubts: ${stats.total}`,
      `Open: ${stats.open} (oldest ${stats.oldestOpenDays} days)`,
      `Resolved: ${stats.resolved} (${stats.resolvedRatePercent}%)`,
      `Retested after resolving: ${stats.retested} of ${stats.resolved} (${stats.retestRatePercent}%)`,
      `Average days to resolve: ${stats.avgDaysToResolve}`,
      `Stale open doubts (> ${STALE_OPEN_DAYS} days): ${stats.staleOpen.length}`,
    ].join("\n");
  }, [hasError, stats]);

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
    setEntries(SAMPLE_ENTRIES);
    setForm({ ...EMPTY_FORM, raisedOn: "" });
    setFormError("");
    setCopied(false);
  };

  const statRows = hasError
    ? [
        ["Open doubts", DASH],
        ["Resolved", DASH],
        ["Retest rate", DASH],
        ["Average days to resolve", DASH],
      ]
    : [
        ["Open doubts", String(stats.open)],
        ["Resolved", `${stats.resolved} (${stats.resolvedRatePercent}%)`],
        ["Retested after resolving", `${stats.retested} of ${stats.resolved}`],
        ["Average days to resolve", `${stats.avgDaysToResolve} days`],
        ["Oldest open doubt", `${stats.oldestOpenDays} days`],
        [`Stale (open > ${STALE_OPEN_DAYS} days)`, String(stats.staleOpen.length)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MessageCircleQuestion className="h-4 w-4" aria-hidden="true" />
          Coaching decisions
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Doubt Resolution Log</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Log every doubt, who resolved it and whether you retested yourself afterwards. A doubt
          only counts as closed once you re-solve a similar problem without help — the retest rate
          below tracks exactly that. Entries stay in this browser only.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Add a doubt</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="drl-subject">
              Subject
            </label>
            <input
              id="drl-subject"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.subject}
              onChange={(event) => setForm((f) => ({ ...f, subject: event.target.value }))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="drl-raised">
              Date raised
            </label>
            <input
              id="drl-raised"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.raisedOn}
              onChange={(event) => setForm((f) => ({ ...f, raisedOn: event.target.value }))}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Blank = today.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="drl-question">
              The doubt, in one line
            </label>
            <input
              id="drl-question"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.question}
              onChange={(event) => setForm((f) => ({ ...f, question: event.target.value }))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="drl-resolvedon">
              Resolved on (leave blank if open)
            </label>
            <input
              id="drl-resolvedon"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.resolvedOn}
              onChange={(event) => setForm((f) => ({ ...f, resolvedOn: event.target.value }))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="drl-resolver">
              Resolved by
            </label>
            <select
              id="drl-resolver"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.resolvedBy}
              onChange={(event) => setForm((f) => ({ ...f, resolvedBy: event.target.value }))}
            >
              {RESOLVER_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={addDoubt} className={PRIMARY_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add doubt
          </button>
          {formError ? (
            <p
              role="alert"
              className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {formError}
            </p>
          ) : null}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {stats.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Retest rate
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${stats.retestRatePercent}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the log to see stats."
                : "Share of resolved doubts you actually re-solved on your own — the number that predicts recall on exam day."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the doubt log summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the log to the sample entries"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {statRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && stats.bySubject.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Subject
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Open
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Resolved
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Retested
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.bySubject.map((row) => (
                  <tr key={row.subject} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.subject}</td>
                    <td className="py-2 pr-3 text-right">{row.open}</td>
                    <td className="py-2 pr-3 text-right">{row.resolved}</td>
                    <td className="py-2 text-right">{row.retested}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Logged doubts ({entries.length})</h2>
        <ul className="mt-3 space-y-3">
          {entries.map((entry) => {
            const isResolved = Boolean(entry.resolvedOn);
            return (
              <li
                key={entry.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{entry.question}</p>
                    <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                      {entry.subject} · raised {entry.raisedOn}
                      {isResolved
                        ? ` · resolved ${entry.resolvedOn} by ${
                            RESOLVER_OPTIONS.find((r) => r.id === entry.resolvedBy)?.label ||
                            "self"
                          }`
                        : " · still open"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      isResolved
                        ? entry.retested
                          ? "bg-[var(--muted)] text-[var(--success)]"
                          : "bg-[var(--muted)] text-[var(--primary)]"
                        : "bg-[var(--muted)] text-[var(--danger)]"
                    }`}
                  >
                    {isResolved ? (entry.retested ? "Closed + retested" : "Resolved") : "Open"}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {!isResolved ? (
                    <button
                      type="button"
                      onClick={() => markResolved(entry.id)}
                      className={`${GHOST_BTN} px-3 text-xs`}
                    >
                      Mark resolved today
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleRetested(entry.id)}
                      className={`${GHOST_BTN} px-3 text-xs`}
                    >
                      {entry.retested ? "Undo retest" : "Mark retested"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeDoubt(entry.id)}
                    aria-label={`Delete doubt: ${entry.question}`}
                    className={`${GHOST_BTN} px-3 text-xs text-[var(--danger)]`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Data never leaves this browser — it is stored locally and clearing site data erases the
        log. Export a copy with the summary button before switching devices.
      </p>
    </main>
  );
}
