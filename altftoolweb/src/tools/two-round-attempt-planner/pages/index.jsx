"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Repeat, RotateCcw } from "lucide-react";

import {
  DEFAULT_BUFFER_MINUTES,
  DEFAULT_FLAG_PERCENT,
  DEFAULT_ROUND1_SHARE_PERCENT,
  planTwoRounds,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  questions: "100",
  minutes: "180",
  share: String(DEFAULT_ROUND1_SHARE_PERCENT),
  flag: String(DEFAULT_FLAG_PERCENT),
  buffer: String(DEFAULT_BUFFER_MINUTES),
};

export default function ToolHome() {
  const [questions, setQuestions] = useState(DEFAULTS.questions);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [share, setShare] = useState(DEFAULTS.share);
  const [flag, setFlag] = useState(DEFAULTS.flag);
  const [buffer, setBuffer] = useState(DEFAULTS.buffer);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planTwoRounds({
        totalQuestions: questions.trim() === "" ? Number.NaN : Number(questions),
        totalMinutes: minutes.trim() === "" ? Number.NaN : Number(minutes),
        round1SharePercent: share.trim() === "" ? Number.NaN : Number(share),
        flagPercent: flag.trim() === "" ? 0 : Number(flag),
        bufferMinutes: buffer.trim() === "" ? 0 : Number(buffer),
      }),
    [questions, minutes, share, flag, buffer],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const r2pace =
      result.round2.secondsPerFlagged === null
        ? "no questions flagged — use round 2 as review time"
        : `${result.round2.secondsPerFlagged} sec per flagged question`;
    return [
      "Two round attempt plan",
      `Round 1: ${NUM.format(result.round1.minutes)} min — all ${result.round1.questions} questions at ${result.round1.secondsPerQuestion} sec each`,
      `Round 2: ${NUM.format(result.round2.minutes)} min — ${result.round2.flaggedQuestions} flagged questions, ${r2pace}`,
      `End buffer: ${NUM.format(result.bufferMinutes)} min`,
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
    setQuestions(DEFAULTS.questions);
    setMinutes(DEFAULTS.minutes);
    setShare(DEFAULTS.share);
    setFlag(DEFAULTS.flag);
    setBuffer(DEFAULTS.buffer);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Round 1 time", DASH],
        ["Round 1 pace", DASH],
        ["Round 2 time", DASH],
        ["Round 2 pace", DASH],
        ["End buffer", DASH],
      ]
    : [
        ["Round 1 time (all questions)", `${NUM.format(result.round1.minutes)} min`],
        ["Round 1 pace", `${result.round1.secondsPerQuestion} sec / question`],
        [
          `Round 2 time (${result.round2.flaggedQuestions} flagged)`,
          `${NUM.format(result.round2.minutes)} min`,
        ],
        [
          "Round 2 pace",
          result.round2.secondsPerFlagged === null
            ? "no flagged questions — becomes review time"
            : `${result.round2.secondsPerFlagged} sec / flagged question`,
        ],
        ["End buffer (OMR / final check)", `${NUM.format(result.bufferMinutes)} min`],
        [
          "Single-pass average, for comparison",
          `${result.singlePassSecondsPerQuestion} sec / question`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Repeat className="h-4 w-4" aria-hidden="true" />
          Time strategy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Two Round Attempt Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sweep the whole paper fast in round 1, answering only sure questions and flagging the
          rest — then spend round 2 on the flagged ones. Set your split and see the pace each round
          demands.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-questions">
              Total questions on the paper
            </label>
            <input
              id="tr-questions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              value={questions}
              onChange={(event) => setQuestions(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-minutes">
              Paper duration (minutes)
            </label>
            <input
              id="tr-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="5"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-share">
              Round 1 share of working time (%)
            </label>
            <input
              id="tr-share"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="99"
              step="5"
              value={share}
              onChange={(event) => setShare(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Coaching convention: 60-70% for the first sweep.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-flag">
              Questions you expect to flag for round 2 (%)
            </label>
            <input
              id="tr-flag"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="5"
              value={flag}
              onChange={(event) => setFlag(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tr-buffer">
              End buffer for OMR transfer and final checks (minutes)
            </label>
            <input
              id="tr-buffer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={buffer}
              onChange={(event) => setBuffer(event.target.value)}
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
              Round 1 pace
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.round1.secondsPerQuestion} sec/question`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your plan."
                : `Anything you cannot answer within this budget gets flagged and left for round 2.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the two round attempt plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The two-pass method works because it guarantees every sure mark is banked before any time is
        risked on doubtful questions. Practise the round 1 discipline in mocks: answer, flag, or
        skip — never wrestle.
      </p>
    </main>
  );
}
