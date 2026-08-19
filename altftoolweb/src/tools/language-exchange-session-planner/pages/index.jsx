"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessagesSquare, RotateCcw, Shuffle } from "lucide-react";

import { LEVELS, buildSession, pickTopics } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const LEVEL_LABELS = {
  beginner: "Beginner — concrete, everyday",
  intermediate: "Intermediate — narrative and comparison",
  advanced: "Advanced — argument and abstraction",
};

const DEFAULTS = {
  totalMinutes: "60",
  languageA: "Spanish",
  languageB: "English",
  warmUpMinutes: "6",
  correctionMinutes: "6",
  breakMinutes: "5",
  wrapUpMinutes: "4",
  startTime: "18:30",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [level, setLevel] = useState("intermediate");
  const [seed, setSeed] = useState(1);
  const [copied, setCopied] = useState(false);

  const session = useMemo(
    () =>
      buildSession({
        totalMinutes: Number(form.totalMinutes),
        languageA: form.languageA,
        languageB: form.languageB,
        warmUpMinutes: Number(form.warmUpMinutes),
        correctionMinutes: Number(form.correctionMinutes),
        breakMinutes: Number(form.breakMinutes),
        wrapUpMinutes: Number(form.wrapUpMinutes),
        startTime: form.startTime,
      }),
    [form],
  );
  const topics = useMemo(() => pickTopics({ level, count: 3, seed }), [level, seed]);

  const hasError = Boolean(session.error);
  const setField = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Language exchange: ${session.languageA} and ${session.languageB}`,
      `${session.total} minutes, ${session.perLanguage} speaking minutes each way`,
      "",
      ...session.blocks.map((block) => {
        const clock = block.startClock ? `${block.startClock}-${block.endClock}` : `+${block.startOffset}-${block.endOffset} min`;
        return `${clock}  ${block.label} (${block.minutes} min, ${block.language})\n    ${block.note}`;
      }),
      "",
      `Topics (${level}):`,
      ...topics.map((topic) => `- ${topic.title}\n    ${topic.prompts.join("\n    ")}`),
    ].join("\n");
  }, [session, hasError, topics, level]);

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
    setForm(DEFAULTS);
    setLevel("intermediate");
    setSeed(1);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MessagesSquare className="h-4 w-4" aria-hidden="true" />
          Tandem learning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Language Exchange Session Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Split a tandem session into timed blocks so both partners get exactly the same speaking
          minutes. Set the length, the fixed blocks and a start time, and get an agenda with clock
          times plus three topic cards at your level.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tandem-a">
              First language spoken
            </label>
            <input id="tandem-a" className={`mt-2 ${INPUT_CLASS}`} value={form.languageA} onChange={setField("languageA")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tandem-b">
              Second language spoken
            </label>
            <input id="tandem-b" className={`mt-2 ${INPUT_CLASS}`} value={form.languageB} onChange={setField("languageB")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tandem-total">
              Session length (minutes)
            </label>
            <input
              id="tandem-total"
              type="number"
              inputMode="numeric"
              min="20"
              max="240"
              step="5"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.totalMinutes}
              onChange={setField("totalMinutes")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tandem-start">
              Start time (24-hour)
            </label>
            <input
              id="tandem-start"
              type="time"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.startTime}
              onChange={setField("startTime")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tandem-warmup">
              Warm-up (minutes)
            </label>
            <input
              id="tandem-warmup"
              type="number"
              inputMode="numeric"
              min="0"
              max="40"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.warmUpMinutes}
              onChange={setField("warmUpMinutes")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tandem-correction">
              Feedback per language (minutes)
            </label>
            <input
              id="tandem-correction"
              type="number"
              inputMode="numeric"
              min="0"
              max="40"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.correctionMinutes}
              onChange={setField("correctionMinutes")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tandem-break">
              Break (minutes)
            </label>
            <input
              id="tandem-break"
              type="number"
              inputMode="numeric"
              min="0"
              max="40"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.breakMinutes}
              onChange={setField("breakMinutes")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tandem-wrap">
              Wrap-up (minutes)
            </label>
            <input
              id="tandem-wrap"
              type="number"
              inputMode="numeric"
              min="0"
              max="40"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.wrapUpMinutes}
              onChange={setField("wrapUpMinutes")}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {session.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" aria-atomic="true">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Speaking minutes each way
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(session.perLanguage)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${session.perLanguage} min of ${session.languageA} and ${session.perLanguage} min of ${session.languageB}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the session agenda" className={GHOST_BTN} disabled={hasError}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the planner" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total session", hasError ? DASH : `${NUM.format(session.total)} minutes`],
            [
              "Time actually spent talking",
              hasError ? DASH : `${NUM.format(session.conversationMinutes)} min (${NUM.format(session.conversationShare)}%)`,
            ],
            ["Feedback time", hasError ? DASH : `${NUM.format(session.feedbackMinutes)} minutes`],
            ["Warm-up, break and wrap-up", hasError ? DASH : `${NUM.format(session.fixedMinutes - session.feedbackMinutes)} minutes`],
            ["Session ends", hasError ? DASH : session.endClock || `+${NUM.format(session.endOffset)} min`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Session agenda</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">When</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Block</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Language</th>
                  <th scope="col" className="py-2 text-right font-semibold">Minutes</th>
                </tr>
              </thead>
              <tbody>
                {session.blocks.map((block) => (
                  <tr key={block.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                      {block.startClock ? `${block.startClock}–${block.endClock}` : `+${block.startOffset}–${block.endOffset}`}
                    </td>
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{block.label}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">{block.note}</span>
                    </td>
                    <td className="py-2 pr-3">{block.language}</td>
                    <td className="py-2 text-right">{NUM.format(block.minutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Topic cards</h2>
          <button
            type="button"
            onClick={() => setSeed((value) => value + 1)}
            className={GHOST_BTN}
            aria-label="Draw three different topic cards"
          >
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            New topics
          </button>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="tandem-level">
            Level
          </label>
          <select
            id="tandem-level"
            className={`mt-2 ${INPUT_CLASS}`}
            value={level}
            onChange={(event) => setLevel(event.target.value)}
          >
            {LEVELS.map((value) => (
              <option key={value} value={value}>
                {LEVEL_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <ul className="mt-4 grid gap-3">
          {topics.map((topic) => (
            <li key={topic.id} className="rounded-md border border-[var(--border)] p-3">
              <p className="font-semibold">{topic.title}</p>
              <ul className="mt-2 grid gap-1 text-sm text-[var(--muted-foreground)]">
                {topic.prompts.map((prompt) => (
                  <li key={prompt}>· {prompt}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The one rule worth keeping is equal time: if block one runs over, block two runs over by the
        same amount. Save corrections for the feedback block rather than interrupting, and cap them
        at three per block — more than that is not remembered.
      </p>
    </main>
  );
}
