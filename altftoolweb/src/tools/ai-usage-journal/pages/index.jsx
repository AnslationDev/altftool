"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, NotebookPen, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  MAX_ATTEMPTS,
  MAX_TASK_LENGTH,
  OUTCOMES,
  summarizeJournal,
  toTsv,
  validateEntry,
} from "../lib";

const STORAGE_KEY = "altft-ai-usage-journal-v1";

const NUM = new Intl.NumberFormat("en-US");
const ONE_DP = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const isoToday = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const shiftIso = (iso, days) => {
  const stamp = Date.parse(`${iso}T00:00:00Z`);
  return new Date(stamp + days * 86400000).toISOString().slice(0, 10);
};

const emptyDraft = (date) => ({
  date,
  task: "",
  model: "",
  outcome: "shipped",
  attempts: "1",
  minutesSpent: "5",
  minutesSaved: "20",
});

const seedEntries = (today) => [
  {
    id: "seed-1",
    date: shiftIso(today, -4),
    task: "Draft release notes from the changelog",
    model: "Claude",
    outcome: "shipped",
    attempts: 1,
    minutesSpent: 6,
    minutesSaved: 45,
  },
  {
    id: "seed-2",
    date: shiftIso(today, -2),
    task: "Write unit tests for the pricing module",
    model: "Claude",
    outcome: "light-edit",
    attempts: 2,
    minutesSpent: 15,
    minutesSaved: 40,
  },
  {
    id: "seed-3",
    date: today,
    task: "Long-form blog post on onboarding",
    model: "ChatGPT",
    outcome: "redone",
    attempts: 3,
    minutesSpent: 30,
    minutesSaved: 0,
  },
];

export default function ToolHome() {
  const [today, setToday] = useState("");
  const [entries, setEntries] = useState([]);
  const [draft, setDraft] = useState(() => emptyDraft(""));
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const date = isoToday();
    setToday(date);
    let stored = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) stored = parsed;
      }
    } catch {
      stored = null;
    }
    setEntries(stored && stored.length > 0 ? stored : seedEntries(date));
    setDraft(emptyDraft(date));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      /* storage unavailable (private mode) — the journal still works in memory */
    }
  }, [entries, ready]);

  const summary = useMemo(
    () => summarizeJournal(entries, { today, recentDays: 7 }),
    [entries, today]
  );

  const hasError = Boolean(summary.error);

  const addEntry = () => {
    const checked = validateEntry({
      ...draft,
      id: `${draft.date}-${entries.length + 1}-${draft.task.trim().slice(0, 24)}`,
      attempts: Number(draft.attempts),
      minutesSpent: Number(draft.minutesSpent),
      minutesSaved: Number(draft.minutesSaved),
    });
    if (checked.error) {
      setFormError(checked.error);
      return;
    }
    setFormError("");
    setEntries((current) => [...current, checked.entry]);
    setDraft((current) => ({ ...emptyDraft(current.date), model: current.model }));
  };

  const removeEntry = (id) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
    setCopied(false);
  };

  const resetAll = () => {
    const date = today || isoToday();
    setEntries(seedEntries(date));
    setDraft(emptyDraft(date));
    setFormError("");
    setCopied(false);
  };

  const clipboardText = useMemo(() => {
    if (hasError) return "";
    return [
      "AI Usage Journal",
      `Entries: ${summary.total} over ${summary.daysCovered} day(s)`,
      `Net time saved: ${ONE_DP.format(summary.netHours)} h (${NUM.format(summary.netMinutes)} min)`,
      `First-pass rate: ${ONE_DP.format(summary.firstPassRate)}%`,
      `Average attempts per task: ${ONE_DP.format(summary.avgAttempts)}`,
      `Effectiveness score: ${ONE_DP.format(summary.effectiveness)}/100 (${summary.band.label})`,
      "",
      toTsv(summary.entries),
    ].join("\n");
  }, [hasError, summary]);

  const copyResult = async () => {
    if (!clipboardText) return;
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const setField = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setFormError("");
  };

  const breakdown = [
    ["Entries logged", hasError ? DASH : NUM.format(summary.total)],
    [
      "First-pass rate (used as-is, one attempt)",
      hasError ? DASH : `${ONE_DP.format(summary.firstPassRate)}%`,
    ],
    ["Average attempts per task", hasError ? DASH : ONE_DP.format(summary.avgAttempts)],
    [
      "Effectiveness score",
      hasError ? DASH : `${ONE_DP.format(summary.effectiveness)}/100 · ${summary.band.label}`,
    ],
    ["Time spent prompting", hasError ? DASH : `${NUM.format(summary.minutesSpent)} min`],
    ["Time the output saved", hasError ? DASH : `${NUM.format(summary.minutesSaved)} min`],
    ["Net minutes per task", hasError ? DASH : `${ONE_DP.format(summary.minutesPerEntry)} min`],
    [
      "Last 7 days",
      hasError || !summary.recent
        ? DASH
        : `${NUM.format(summary.recent.count)} task(s), ${NUM.format(summary.recent.netMinutes)} min net`,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <NotebookPen className="h-4 w-4" aria-hidden="true" />
          AI usage log
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">AI Usage Journal</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Record what you asked an assistant to do, how many attempts it took and whether you shipped
          the answer or rewrote it. The journal turns those notes into a first-pass rate, an
          effectiveness score and the net time you actually saved. Entries stay in this browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Log a task</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="auj-task">
              What did you ask for?
            </label>
            <input
              id="auj-task"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={MAX_TASK_LENGTH}
              placeholder="Summarise the Q3 support tickets"
              value={draft.task}
              onChange={(event) => setField("task", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="auj-date">
              Date
            </label>
            <input
              id="auj-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={draft.date}
              onChange={(event) => setField("date", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="auj-model">
              Assistant or model
            </label>
            <input
              id="auj-model"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Claude, ChatGPT, Gemini, local…"
              value={draft.model}
              onChange={(event) => setField("model", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="auj-outcome">
              Outcome
            </label>
            <select
              id="auj-outcome"
              className={`mt-2 ${INPUT_CLASS}`}
              value={draft.outcome}
              onChange={(event) => setField("outcome", event.target.value)}
            >
              {OUTCOMES.map((outcome) => (
                <option key={outcome.id} value={outcome.id}>
                  {outcome.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="auj-attempts">
              Attempts / re-prompts
            </label>
            <input
              id="auj-attempts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_ATTEMPTS}
              step="1"
              value={draft.attempts}
              onChange={(event) => setField("attempts", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="auj-spent">
              Minutes spent on the AI
            </label>
            <input
              id="auj-spent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={draft.minutesSpent}
              onChange={(event) => setField("minutesSpent", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="auj-saved">
              Minutes it saved you
            </label>
            <input
              id="auj-saved"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={draft.minutesSaved}
              onChange={(event) => setField("minutesSaved", event.target.value)}
            />
          </div>
        </div>

        {formError && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {formError}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={addEntry} className={PRIMARY_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add entry
          </button>
          <button
            type="button"
            onClick={resetAll}
            aria-label="Reset the journal to the sample entries"
            className={GHOST_BTN}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {summary.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Net time saved
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${ONE_DP.format(summary.netHours)} h`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "No entries yet"
                : `${NUM.format(summary.total)} task(s) across ${NUM.format(summary.daysCovered)} day(s) · ${summary.band.note}`}
            </p>
          </div>
          <button
            type="button"
            onClick={copyResult}
            aria-label="Copy the journal summary and entries"
            className={GHOST_BTN}
            disabled={hasError}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy result"}
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {breakdown.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5 space-y-2">
            {summary.byOutcome
              .filter((outcome) => outcome.count > 0)
              .map((outcome) => (
                <div key={outcome.id} className="flex items-center gap-3 text-sm">
                  <span className="w-40 shrink-0 text-[var(--muted-foreground)]">
                    {outcome.label}
                  </span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
                    <span
                      className="block h-full bg-[var(--primary)]"
                      style={{ width: `${outcome.share}%` }}
                    />
                  </span>
                  <span className="w-10 shrink-0 text-right font-semibold">{outcome.count}</span>
                </div>
              ))}
          </div>
        )}
      </section>

      {!hasError && summary.byModel.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">By assistant</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Assistant</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Tasks</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Avg tries</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Score</th>
                  <th scope="col" className="py-2 text-right font-semibold">Net min</th>
                </tr>
              </thead>
              <tbody>
                {summary.byModel.map((row) => (
                  <tr key={row.model} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.model}</td>
                    <td className="py-2 pr-3 text-right">{NUM.format(row.count)}</td>
                    <td className="py-2 pr-3 text-right">{ONE_DP.format(row.avgAttempts)}</td>
                    <td className="py-2 pr-3 text-right">{ONE_DP.format(row.effectiveness)}</td>
                    <td className="py-2 text-right">{NUM.format(row.netMinutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {entries.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Entries</h2>
          <ul className="mt-3 divide-y divide-[var(--border)]">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{entry.task}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                    {entry.date} · {entry.model} ·{" "}
                    {OUTCOMES.find((outcome) => outcome.id === entry.outcome)?.label ?? entry.outcome}{" "}
                    · {entry.attempts} try(s) · +{entry.minutesSaved}/-{entry.minutesSpent} min
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  aria-label={`Delete entry: ${entry.task}`}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Minutes saved is your own estimate of the time the task would have taken unaided — the
        journal reports what you record, so keep the estimates honest for the numbers to mean
        anything.
      </p>
    </main>
  );
}
