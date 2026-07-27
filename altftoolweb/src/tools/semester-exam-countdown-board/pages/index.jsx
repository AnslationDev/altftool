"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import { READINESS_MAX, READINESS_MIN, RISK_DAYS_MAX, RISK_READINESS_MAX, buildBoard } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toIso = (date) => date.toISOString().slice(0, 10);

const plusDays = (iso, days) => {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return toIso(date);
};

function makeDefaults() {
  const today = toIso(new Date());
  return {
    today,
    papers: [
      { id: 1, name: "Engineering Mathematics III", examDate: plusDays(today, 6), readiness: "40" },
      { id: 2, name: "Data Structures", examDate: plusDays(today, 9), readiness: "65" },
      { id: 3, name: "Digital Electronics", examDate: plusDays(today, 12), readiness: "55" },
      { id: 4, name: "Discrete Mathematics", examDate: plusDays(today, 15), readiness: "30" },
    ],
    nextId: 5,
  };
}

export default function ToolHome() {
  const [state, setState] = useState(makeDefaults);
  const [copied, setCopied] = useState(false);

  const { today, papers } = state;

  const setToday = (event) => {
    const { value } = event.target;
    setState((prev) => ({ ...prev, today: value }));
  };

  const setPaper = (id, key) => (event) => {
    const { value } = event.target;
    setState((prev) => ({
      ...prev,
      papers: prev.papers.map((paper) => (paper.id === id ? { ...paper, [key]: value } : paper)),
    }));
  };

  const addPaper = () => {
    setState((prev) => ({
      ...prev,
      papers: [
        ...prev.papers,
        { id: prev.nextId, name: "", examDate: plusDays(prev.today, 7), readiness: "50" },
      ],
      nextId: prev.nextId + 1,
    }));
  };

  const removePaper = (id) => {
    setState((prev) => ({ ...prev, papers: prev.papers.filter((paper) => paper.id !== id) }));
  };

  const result = useMemo(() => buildBoard({ papers, today }), [papers, today]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Semester exam countdown",
      `Counting from: ${today}`,
      ...result.rows.map(
        (row) =>
          `${row.name}: ${row.status === "done" ? "done" : row.status === "today" ? "TODAY" : `${row.daysLeft} day(s) left`} — readiness ${row.readiness}%${row.atRisk ? " (AT RISK)" : ""}`,
      ),
    ].join("\n");
  }, [hasError, result, today]);

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
    setState(makeDefaults());
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          University Exams
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Semester Exam Countdown Board
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every paper, its days-left countdown and your readiness on one board. A paper under{" "}
          {RISK_READINESS_MAX}% readiness within {RISK_DAYS_MAX} days is flagged at risk.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="secb-today">
              Counting from
            </label>
            <input id="secb-today" className={`mt-2 ${INPUT_CLASS}`} type="date" value={today} onChange={setToday} />
          </div>
        </div>

        <ul className="mt-4 space-y-4">
          {papers.map((paper, index) => (
            <li key={paper.id} className="rounded-lg border border-[var(--border)] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`secb-name-${paper.id}`}>
                    Paper {index + 1} — subject
                  </label>
                  <input
                    id={`secb-name-${paper.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    placeholder="Subject name"
                    value={paper.name}
                    onChange={setPaper(paper.id, "name")}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`secb-date-${paper.id}`}>
                    Exam date
                  </label>
                  <input
                    id={`secb-date-${paper.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={paper.examDate}
                    onChange={setPaper(paper.id, "examDate")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`secb-ready-${paper.id}`}>
                    Readiness: {paper.readiness || 0}%
                  </label>
                  <input
                    id={`secb-ready-${paper.id}`}
                    className="mt-2 h-11 w-full accent-[var(--primary)]"
                    type="range"
                    min={READINESS_MIN}
                    max={READINESS_MAX}
                    step="5"
                    value={paper.readiness}
                    onChange={setPaper(paper.id, "readiness")}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removePaper(paper.id)}
                aria-label={`Remove paper ${paper.name || index + 1}`}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-soft)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </li>
          ))}
        </ul>

        <button type="button" onClick={addPaper} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add paper
        </button>
      </section>

      {hasError ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Next paper
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError || !result.nextPaper
                ? DASH
                : result.nextPaper.daysLeft === 0
                  ? "Today"
                  : `${result.nextPaper.daysLeft} day${result.nextPaper.daysLeft === 1 ? "" : "s"}`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the board."
                : result.nextPaper
                  ? `${result.nextPaper.name} is the next paper.`
                  : "All papers on the board are already past."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the countdown board as text"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy board"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the board to the example papers" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Papers pending</dt>
            <dd className="mt-1 text-xl font-semibold">{hasError ? DASH : result.pendingCount}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Average readiness</dt>
            <dd className="mt-1 text-xl font-semibold">
              {hasError || result.avgReadiness === null ? DASH : `${result.avgReadiness}%`}
            </dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Papers at risk</dt>
            <dd className={`mt-1 text-xl font-semibold ${!hasError && result.riskCount > 0 ? "text-[var(--danger)]" : ""}`}>
              {hasError ? DASH : result.riskCount}
            </dd>
          </div>
        </dl>

        {hasError ? null : (
          <ul className="mt-5 space-y-3">
            {result.rows.map((row) => (
              <li key={`${row.name}-${row.examDate}`} className="rounded-md border border-[var(--border)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{row.name}</p>
                  <p className={`text-sm font-semibold ${row.atRisk ? "text-[var(--danger)]" : "text-[var(--muted-foreground)]"}`}>
                    {row.status === "done"
                      ? "Done"
                      : row.status === "today"
                        ? "Today"
                        : `${row.daysLeft} day${row.daysLeft === 1 ? "" : "s"} left`}
                    {row.atRisk ? " · at risk" : ""}
                  </p>
                </div>
                <div
                  className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="progressbar"
                  aria-label={`${row.name} readiness`}
                  aria-valuenow={row.readiness}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`h-full rounded-full ${row.atRisk ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
                    style={{ width: `${row.readiness}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {row.examDate} · readiness {row.readiness}%
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The at-risk flag is a simple planning heuristic (under {RISK_READINESS_MAX}% ready with{" "}
        {RISK_DAYS_MAX} or fewer days to go), not a prediction. Data stays on this page — nothing is
        uploaded or saved.
      </p>
    </main>
  );
}
