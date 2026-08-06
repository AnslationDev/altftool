"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldAlert } from "lucide-react";
import {
  MESSAGES,
  PASS_BALANCED_ACCURACY,
  RED_FLAGS,
  scoreVerdicts,
  selectMessages,
} from "../lib";

const TOTAL = MESSAGES.length;
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [seed, setSeed] = useState(1);
  const [count, setCount] = useState(String(TOTAL));
  const [verdicts, setVerdicts] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const messages = useMemo(() => {
    const wanted = Number(count);
    return selectMessages(seed, Number.isFinite(wanted) ? wanted : TOTAL);
  }, [seed, count]);

  const score = useMemo(() => scoreVerdicts(messages, verdicts), [messages, verdicts]);
  const hasError = Boolean(score.error);
  const revealed = submitted && !hasError;
  const dash = "—";

  const setVerdict = (id, value) => {
    if (revealed) return; // frozen once graded — fieldset is also disabled, this just guards non-pointer paths
    setVerdicts((current) => ({ ...current, [id]: value }));
  };

  const restart = (nextSeed) => {
    setSeed(nextSeed);
    setVerdicts({});
    setSubmitted(false);
    setCopied(false);
  };

  const summary = revealed
    ? [
        "AI Scam Message Awareness Quiz",
        `Balanced accuracy: ${score.balancedAccuracyPct}% (${score.verdictLabel})`,
        `Scams caught: ${score.truePositive} of ${score.truePositive + score.falseNegative}`,
        `Genuine messages left alone: ${score.trueNegative} of ${score.trueNegative + score.falsePositive}`,
        `Missed scams: ${score.falseNegative} · False alarms: ${score.falsePositive}`,
      ].join("\n")
    : "";

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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          Scam awareness
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Scam Message Awareness Quiz
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fluent grammar no longer means a message is genuine. Judge {TOTAL} realistic texts, emails
          and calls as scam or genuine, then see your recall, your false alarms and the red flags you
          walked past.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="scam-count">
              Messages in this round
            </label>
            <select
              id="scam-count"
              className={`mt-2 ${INPUT_CLASS}`}
              value={count}
              onChange={(event) => {
                setCount(event.target.value);
                setVerdicts({});
                setSubmitted(false);
              }}
            >
              {[6, 9, TOTAL].map((option) => (
                <option key={option} value={String(option)}>
                  {option} messages
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="scam-seed">
              Round number
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="scam-seed"
                className={INPUT_CLASS}
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={seed}
                onChange={(event) => restart(Number(event.target.value) || 1)}
              />
              <button type="button" className={GHOST_BTN} onClick={() => restart(seed + 1)}>
                Shuffle
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 space-y-4">
        {messages.map((message, index) => {
          const chosen = verdicts[message.id];
          // Prefer the score engine's own per-message `answered`/`correct`
          // flags (scoreVerdicts already computes them) over re-deriving
          // from `verdicts` directly, so a skipped message can't be
          // mislabeled as "Missed" (an actively wrong guess).
          const resultRow = score.rows?.[index];
          const wasAnswered = resultRow ? resultRow.answered : chosen !== undefined;
          const correct = revealed && Boolean(resultRow?.correct);
          return (
            <fieldset
              key={message.id}
              disabled={revealed}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <legend className="flex flex-wrap items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                <span>
                  Message {index + 1} of {messages.length}
                </span>
                <span aria-hidden="true">·</span>
                <span>{message.channel}</span>
                <span aria-hidden="true">·</span>
                <span className="normal-case">from {message.from}</span>
              </legend>
              <blockquote className="mt-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
                {message.text}
              </blockquote>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  ["scam", "Scam"],
                  ["genuine", "Genuine"],
                ].map(([value, label]) => (
                  <label
                    key={value}
                    htmlFor={`${message.id}-${value}`}
                    className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition hover:border-[var(--primary)] ${
                      chosen === value
                        ? "border-[var(--primary)] text-[var(--primary)]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <input
                      id={`${message.id}-${value}`}
                      type="radio"
                      name={message.id}
                      className="h-4 w-4 accent-[var(--primary)]"
                      checked={chosen === value}
                      onChange={() => setVerdict(message.id, value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
              {revealed && (
                <div
                  className={`mt-3 rounded-md px-3 py-2 text-sm leading-6 ${
                    correct
                      ? "bg-[var(--muted)] text-[var(--foreground)]"
                      : wasAnswered
                        ? "bg-[var(--danger-soft)] text-[var(--danger-text)]"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  }`}
                >
                  <p>
                    <span className="font-semibold">
                      {correct ? "Correct — " : wasAnswered ? "Missed — " : "Skipped — "}
                      {message.isScam ? "scam. " : "genuine. "}
                    </span>
                    {message.explanation}
                  </p>
                  {message.flags.length > 0 && (
                    <ul className="mt-2 list-disc pl-5 text-xs">
                      {message.flags.map((flag) => (
                        <li key={flag}>{RED_FLAGS[flag]}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </fieldset>
          );
        })}
      </section>

      {submitted && hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {score.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Balanced accuracy
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {revealed ? `${score.balancedAccuracyPct}%` : dash}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {revealed
                ? `${score.verdictLabel} — pass mark ${PASS_BALANCED_ACCURACY}%`
                : "Mark every message, then reveal."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={PRIMARY_BTN} onClick={() => setSubmitted(true)}>
              Reveal answers
            </button>
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy scam quiz score"
              className={GHOST_BTN}
              disabled={!revealed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy score"}
            </button>
            <button
              type="button"
              onClick={() => restart(seed)}
              aria-label="Reset the quiz"
              className={GHOST_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Answered", revealed ? `${score.answeredCount} of ${score.total}` : dash],
            [
              "Scams caught (recall)",
              revealed && score.recallPct !== null
                ? `${score.truePositive}/${score.truePositive + score.falseNegative} — ${score.recallPct}%`
                : dash,
            ],
            [
              "Genuine left alone (specificity)",
              revealed && score.specificityPct !== null
                ? `${score.trueNegative}/${score.trueNegative + score.falsePositive} — ${score.specificityPct}%`
                : dash,
            ],
            ["Missed scams", revealed ? String(score.falseNegative) : dash],
            ["False alarms", revealed ? String(score.falsePositive) : dash],
            ["Plain accuracy", revealed ? `${score.accuracyPct}%` : dash],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {revealed && (
          <>
            <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{score.advice}</p>
            {score.topMissedFlags.length > 0 && (
              <div className="mt-4">
                <h2 className="text-sm font-semibold">Red flags you walked past</h2>
                <ul className="mt-2 space-y-1 text-sm text-[var(--muted-foreground)]">
                  {score.topMissedFlags.map((flag) => (
                    <li key={flag.flag}>
                      {flag.label} — missed {flag.count} time{flag.count === 1 ? "" : "s"}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Training examples only — names, numbers and domains are invented. If you think you have been
        targeted, contact your bank on the number printed on your card and report it to your national
        fraud reporting service.
      </p>
    </main>
  );
}
