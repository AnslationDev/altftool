"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MinusCircle, RotateCcw } from "lucide-react";

import { SSC_PRESETS, computeNegativeImpact, wipeoutTable } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULTS = {
  presetId: "cgl-tier1",
  totalQuestions: "100",
  marksPerQuestion: "2",
  penalty: "0.5",
  correct: "70",
  wrong: "20",
};

export default function ToolHome() {
  const [presetId, setPresetId] = useState(DEFAULTS.presetId);
  const [totalQuestions, setTotalQuestions] = useState(DEFAULTS.totalQuestions);
  const [marksPerQuestion, setMarksPerQuestion] = useState(DEFAULTS.marksPerQuestion);
  const [penalty, setPenalty] = useState(DEFAULTS.penalty);
  const [correct, setCorrect] = useState(DEFAULTS.correct);
  const [wrong, setWrong] = useState(DEFAULTS.wrong);
  const [copied, setCopied] = useState(false);

  const applyPreset = (id) => {
    setPresetId(id);
    const preset = SSC_PRESETS.find((item) => item.id === id);
    if (preset && id !== "custom") {
      setTotalQuestions(String(preset.totalQuestions));
      setMarksPerQuestion(String(preset.marksPerQuestion));
      setPenalty(String(preset.penalty));
    }
  };

  const result = useMemo(
    () =>
      computeNegativeImpact({
        totalQuestions: totalQuestions.trim() === "" ? NaN : Number(totalQuestions),
        marksPerQuestion: marksPerQuestion.trim() === "" ? NaN : Number(marksPerQuestion),
        penalty: penalty.trim() === "" ? NaN : Number(penalty),
        correct: correct.trim() === "" ? 0 : Number(correct),
        wrong: wrong.trim() === "" ? 0 : Number(wrong),
      }),
    [totalQuestions, marksPerQuestion, penalty, correct, wrong],
  );

  const hasError = Boolean(result.error);

  const table = useMemo(
    () =>
      hasError
        ? []
        : wipeoutTable({
            marksPerQuestion: Number(marksPerQuestion),
            penalty: Number(penalty),
          }),
    [hasError, marksPerQuestion, penalty],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "SSC negative marking impact",
      `Net score: ${NUM.format(result.netScore)} / ${NUM.format(result.maxMarks)} (${result.percentage}%)`,
      `Marks earned: +${NUM.format(result.grossMarks)}`,
      `Marks lost to ${result.wrong} wrong answers: −${NUM.format(result.marksLost)}`,
      result.wrongsPerCorrect
        ? `Every ${NUM.format(result.wrongsPerCorrect)} wrong answers cancel one correct answer`
        : "No negative marking in this scheme",
      `Accuracy on attempted: ${result.accuracy}%`,
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
    setPresetId(DEFAULTS.presetId);
    setTotalQuestions(DEFAULTS.totalQuestions);
    setMarksPerQuestion(DEFAULTS.marksPerQuestion);
    setPenalty(DEFAULTS.penalty);
    setCorrect(DEFAULTS.correct);
    setWrong(DEFAULTS.wrong);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <MinusCircle className="h-4 w-4" aria-hidden="true" />
          −0.50 per wrong answer
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Negative Marking Calculator — SSC
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          In SSC CGL and CHSL Tier-I every wrong answer costs 0.50 of the 2 marks a question
          carries — four wrong answers erase one correct one. See what your wrong answers cost,
          your net score, and the accuracy at which guessing stops paying.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ssc-preset">
              Exam
            </label>
            <select
              id="ssc-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={presetId}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {SSC_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-total">
              Total questions
            </label>
            <input
              id="ssc-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={totalQuestions}
              onChange={(event) => {
                setTotalQuestions(event.target.value);
                setPresetId("custom");
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-marks">
              Marks per question
            </label>
            <input
              id="ssc-marks"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              step="0.25"
              value={marksPerQuestion}
              onChange={(event) => {
                setMarksPerQuestion(event.target.value);
                setPresetId("custom");
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-penalty">
              Penalty per wrong answer
            </label>
            <input
              id="ssc-penalty"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={penalty}
              onChange={(event) => {
                setPenalty(event.target.value);
                setPresetId("custom");
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-correct">
              Correct answers
            </label>
            <input
              id="ssc-correct"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={correct}
              onChange={(event) => setCorrect(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-wrong">
              Wrong answers
            </label>
            <input
              id="ssc-wrong"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={wrong}
              onChange={(event) => setWrong(event.target.value)}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Marks lost to wrong answers
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `−${NUM.format(result.marksLost)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Net score ${NUM.format(result.netScore)} of ${NUM.format(result.maxMarks)} (${result.percentage}%)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the negative marking result"
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
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Marks earned", DASH],
                ["Net score", DASH],
                ["Correct answers cancelled out", DASH],
                ["Accuracy on attempted", DASH],
              ]
            : [
                ["Marks earned", `+${NUM.format(result.grossMarks)}`],
                ["Net score", `${NUM.format(result.netScore)} / ${NUM.format(result.maxMarks)}`],
                [
                  "Correct answers cancelled out",
                  result.wrongsPerCorrect ? NUM.format(result.correctsCancelled) : "None — no penalty",
                ],
                [
                  "Wrong answers that cancel one correct",
                  result.wrongsPerCorrect ? NUM.format(result.wrongsPerCorrect) : DASH,
                ],
                ["Break-even guessing accuracy", `${result.breakEvenAccuracy}%`],
                ["Accuracy on attempted", `${result.accuracy}%`],
                [
                  "Attempted / unattempted",
                  `${NUM.format(result.attempted)} / ${NUM.format(result.unattempted)}`,
                ],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && table.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">How the penalty compounds</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Wrong answers</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Marks lost</th>
                  <th scope="col" className="py-2 text-right font-semibold">Corrects cancelled</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row) => (
                  <tr key={row.wrong} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.wrong}</td>
                    <td className="py-2 pr-3 text-right font-semibold">−{NUM.format(row.marksLost)}</td>
                    <td className="py-2 text-right">{NUM.format(row.correctsCancelled)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Schemes are from SSC notifications for the exams named; SSC revises patterns between
        cycles and normalises scores across shifts, so treat this as an estimate and verify the
        scheme in your own notification.
      </p>
    </main>
  );
}
