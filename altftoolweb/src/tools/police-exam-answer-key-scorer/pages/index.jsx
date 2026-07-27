"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck } from "lucide-react";

import { EXAM_PRESETS, scorePoliceExam } from "../lib";

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
  presetId: "up-constable",
  totalQuestions: "150",
  marksPerQuestion: "2",
  negativePerWrong: "0.5",
  correct: "100",
  wrong: "30",
};

export default function ToolHome() {
  const [presetId, setPresetId] = useState(DEFAULTS.presetId);
  const [totalQuestions, setTotalQuestions] = useState(DEFAULTS.totalQuestions);
  const [marksPerQuestion, setMarksPerQuestion] = useState(DEFAULTS.marksPerQuestion);
  const [negativePerWrong, setNegativePerWrong] = useState(DEFAULTS.negativePerWrong);
  const [correct, setCorrect] = useState(DEFAULTS.correct);
  const [wrong, setWrong] = useState(DEFAULTS.wrong);
  const [copied, setCopied] = useState(false);

  const isCustom = presetId === "custom";

  const applyPreset = (id) => {
    setPresetId(id);
    const preset = EXAM_PRESETS.find((item) => item.id === id);
    if (preset && id !== "custom") {
      setTotalQuestions(String(preset.totalQuestions));
      setMarksPerQuestion(String(preset.marksPerQuestion));
      setNegativePerWrong(String(preset.negativePerWrong));
    }
  };

  const result = useMemo(
    () =>
      scorePoliceExam({
        totalQuestions: totalQuestions.trim() === "" ? NaN : Number(totalQuestions),
        marksPerQuestion: marksPerQuestion.trim() === "" ? NaN : Number(marksPerQuestion),
        negativePerWrong: negativePerWrong.trim() === "" ? NaN : Number(negativePerWrong),
        correct: correct.trim() === "" ? 0 : Number(correct),
        wrong: wrong.trim() === "" ? 0 : Number(wrong),
      }),
    [totalQuestions, marksPerQuestion, negativePerWrong, correct, wrong],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const presetLabel = EXAM_PRESETS.find((item) => item.id === presetId)?.label ?? "Custom";
    return [
      `Police exam score — ${presetLabel}`,
      `Score: ${NUM.format(result.score)} / ${NUM.format(result.maxMarks)} (${result.percentage}%)`,
      `Correct: ${result.correct} (+${NUM.format(result.positiveMarks)})`,
      `Wrong: ${result.wrong} (−${NUM.format(result.negativeMarks)})`,
      `Unattempted: ${result.unattempted}`,
      `Accuracy on attempted: ${result.accuracy}%`,
    ].join("\n");
  }, [hasError, result, presetId]);

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
    setNegativePerWrong(DEFAULTS.negativePerWrong);
    setCorrect(DEFAULTS.correct);
    setWrong(DEFAULTS.wrong);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          State constable exams
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Police Exam Answer Key Scorer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Count your correct and wrong answers against the released key, pick your exam&apos;s
          marking scheme — UP&apos;s 2 marks with −0.5, Delhi&apos;s 1 mark with −0.25, Bihar&apos;s
          no-negative pattern, or a custom scheme — and see the exact score.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pol-preset">
              Exam
            </label>
            <select
              id="pol-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={presetId}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {EXAM_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
            {!isCustom ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Scheme from the board&apos;s latest completed notification — switch to Custom if
                your notification differs.
              </p>
            ) : null}
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="pol-total">
              Total questions
            </label>
            <input
              id="pol-total"
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
            <label className={LABEL_CLASS} htmlFor="pol-marks">
              Marks per correct answer
            </label>
            <input
              id="pol-marks"
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
            <label className={LABEL_CLASS} htmlFor="pol-negative">
              Marks deducted per wrong answer
            </label>
            <input
              id="pol-negative"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={negativePerWrong}
              onChange={(event) => {
                setNegativePerWrong(event.target.value);
                setPresetId("custom");
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pol-correct">
              Correct answers (per the key)
            </label>
            <input
              id="pol-correct"
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
            <label className={LABEL_CLASS} htmlFor="pol-wrong">
              Wrong answers (per the key)
            </label>
            <input
              id="pol-wrong"
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
              Estimated score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.score)} / ${NUM.format(result.maxMarks)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : `${result.percentage}% of the paper`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the police exam score"
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
                ["Marks deducted", DASH],
                ["Attempted / unattempted", DASH],
                ["Accuracy on attempted", DASH],
              ]
            : [
                ["Marks earned", `+${NUM.format(result.positiveMarks)}`],
                ["Marks deducted", `−${NUM.format(result.negativeMarks)}`],
                [
                  "Attempted / unattempted",
                  `${NUM.format(result.attempted)} / ${NUM.format(result.unattempted)}`,
                ],
                ["Accuracy on attempted", `${result.accuracy}%`],
                ...(result.wrongsPerCorrect
                  ? [
                      [
                        "Wrong answers that cancel one correct",
                        NUM.format(result.wrongsPerCorrect),
                      ],
                      [
                        "Break-even accuracy for guessing",
                        `${result.breakEvenAccuracy}%`,
                      ],
                    ]
                  : [["Negative marking", "None — attempt everything"]]),
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimate only — boards drop questions, revise keys after objections and normalise across
        shifts, all of which move the final marks. Always verify the scheme in your own
        recruitment notification; the official scorecard prevails.
      </p>
    </main>
  );
}
