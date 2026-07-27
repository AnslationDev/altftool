"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Percent, RotateCcw } from "lucide-react";
import { MARKING_PRESETS, breakEvenAnalysis } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

const n = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");
const n3 = (value) => (Number.isFinite(value) ? NUM3.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");
const signed = (value) => (Number.isFinite(value) ? `${value > 0 ? "+" : ""}${NUM3.format(value)}` : "—");

const CUSTOM = "custom";
const DEFAULT_PRESET = "neet";
const DEFAULTS = { eliminated: "0", accuracy: "75", attempts: "40" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HELP_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

const presetByKey = (key) => MARKING_PRESETS.find((item) => item.key === key);

export default function ToolHome() {
  const initial = presetByKey(DEFAULT_PRESET) ?? MARKING_PRESETS[0];
  const [presetKey, setPresetKey] = useState(initial.key);
  const [marks, setMarks] = useState(String(initial.marksPerCorrect));
  const [penalty, setPenalty] = useState(String(initial.penaltyPerWrong));
  const [options, setOptions] = useState(String(initial.options));
  const [eliminated, setEliminated] = useState(DEFAULTS.eliminated);
  const [accuracy, setAccuracy] = useState(DEFAULTS.accuracy);
  const [attempts, setAttempts] = useState(DEFAULTS.attempts);
  const [copied, setCopied] = useState(false);

  const applyPreset = (key) => {
    setPresetKey(key);
    const preset = presetByKey(key);
    if (preset) {
      setMarks(String(preset.marksPerCorrect));
      setPenalty(String(preset.penaltyPerWrong));
      setOptions(String(preset.options));
      setEliminated("0");
    }
    setCopied(false);
  };

  const editScheme = (setter) => (event) => {
    setPresetKey(CUSTOM);
    setter(event.target.value);
  };

  const result = useMemo(
    () =>
      breakEvenAnalysis({
        marksPerCorrect: toNumber(marks),
        penaltyPerWrong: toNumber(penalty),
        options: toNumber(options),
        eliminated: toNumber(eliminated),
        accuracyPercent: toNumber(accuracy),
        attempts: toNumber(attempts),
      }),
    [marks, penalty, options, eliminated, accuracy, attempts],
  );

  const ok = !result.error;
  const activePreset = presetKey === CUSTOM ? null : presetByKey(presetKey);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `Break-even accuracy: ${pct(result.breakEvenAccuracyPercent)}`,
      `Scheme: +${n(result.marksPerCorrect)} correct, -${n3(result.penaltyPerWrong)} wrong, ${result.options} options`,
      `Formula: a* = P / (M + P) = ${n3(result.penaltyPerWrong)} / (${n(result.marksPerCorrect)} + ${n3(result.penaltyPerWrong)})`,
      `Blind guess hit rate: ${pct(100 / result.options)} → ${signed(result.ladder[0].evPerGuess)} marks`,
      `With ${result.eliminated} option(s) ruled out: ${pct(result.hitRatePercent)} → ${signed(result.evPerGuess)} marks (${result.guessVerdict})`,
      result.minEliminations === null
        ? "No amount of elimination makes a guess profitable under this scheme."
        : `Options you must rule out before guessing pays: ${result.minEliminations}`,
      `At ${pct(result.accuracyPercent)} accuracy each attempt is worth ${signed(result.evPerAttempt)} marks`,
      `${n(result.attempts)} attempts → ${n(result.expectedCorrect)} correct, ${n(result.expectedWrong)} wrong, net ${n(result.netMarks)} marks`,
      `Marks lost per 100 attempts at that accuracy: ${n(result.marksLostPer100Attempts)}`,
    ].join("\n");
  }, [ok, result]);

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
    applyPreset(initial.key);
    setEliminated(DEFAULTS.eliminated);
    setAccuracy(DEFAULTS.accuracy);
    setAttempts(DEFAULTS.attempts);
    setCopied(false);
  };

  const breakdown = [
    ["Marks for a correct answer", ok ? `+${n(result.marksPerCorrect)}` : "—"],
    ["Marks deducted if wrong", ok ? `-${n3(result.penaltyPerWrong)}` : "—"],
    ["Options on the question", ok ? String(result.options) : "—"],
    ["Options still live when you guess", ok ? String(result.optionsLeft) : "—"],
    ["Chance a guess is right", ok ? pct(result.hitRatePercent) : "—"],
    ["Value of that guess", ok ? `${signed(result.evPerGuess)} marks` : "—"],
    ["Your accuracy on this question type", ok ? pct(result.accuracyPercent) : "—"],
    ["Margin over break-even", ok ? `${signed(result.accuracyMarginPercent)} points` : "—"],
    ["Value of one attempt at your accuracy", ok ? `${signed(result.evPerAttempt)} marks` : "—"],
    ["Expected correct / wrong over your attempts", ok ? `${n(result.expectedCorrect)} / ${n(result.expectedWrong)}` : "—"],
    ["Net marks from those attempts", ok ? n(result.netMarks) : "—"],
    ["Marks lost per 100 attempts", ok ? n(result.marksLostPer100Attempts) : "—"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Percent className="h-4 w-4" aria-hidden="true" />
          Attempt strategy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Break Even Accuracy Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Under any negative marking scheme, answering beats leaving blank exactly when your accuracy
          exceeds P ÷ (M + P). Pick an exam or type your own scheme and see the threshold, plus how
          many options you have to rule out before a guess starts paying.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="be-preset">
          Marking scheme
        </label>
        <select
          id="be-preset"
          className={`mt-2 ${INPUT_CLASS}`}
          value={presetKey}
          onChange={(event) => applyPreset(event.target.value)}
        >
          {MARKING_PRESETS.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
          <option value={CUSTOM}>Custom scheme</option>
        </select>
        <p className={HELP_CLASS}>{activePreset ? activePreset.note : "Editing any field below switches to a custom scheme."}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="be-marks">
              Marks for a correct answer
            </label>
            <input
              id="be-marks"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={marks}
              onChange={editScheme(setMarks)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="be-penalty">
              Marks deducted for a wrong answer
            </label>
            <input
              id="be-penalty"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={penalty}
              onChange={editScheme(setPenalty)}
            />
            <p className={HELP_CLASS}>Enter it as a positive number.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="be-options">
              Options printed on the question
            </label>
            <input
              id="be-options"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="2"
              max="10"
              step="1"
              value={options}
              onChange={editScheme(setOptions)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="be-eliminated">
              Options you can rule out
            </label>
            <input
              id="be-eliminated"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={eliminated}
              onChange={(event) => setEliminated(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="be-accuracy">
              Your accuracy on this question type (%)
            </label>
            <input
              id="be-accuracy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={accuracy}
              onChange={(event) => setAccuracy(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="be-attempts">
              Questions you plan to answer
            </label>
            <input
              id="be-attempts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={attempts}
              onChange={(event) => setAttempts(event.target.value)}
            />
          </div>
        </div>
      </section>

      {result.error ? (
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
              Break-even accuracy
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? pct(result.breakEvenAccuracyPercent) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `a* = ${n3(result.penaltyPerWrong)} ÷ (${n(result.marksPerCorrect)} + ${n3(result.penaltyPerWrong)})`
                : "Fix the input above to see a threshold."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy break-even accuracy result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-semibold ${
              result.beatsBreakEven
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {result.beatsBreakEven
              ? `Your ${pct(result.accuracyPercent)} accuracy is ${n(result.accuracyMarginPercent)} points above break-even — attempting adds marks.`
              : `Your ${pct(result.accuracyPercent)} accuracy is ${n(Math.abs(result.accuracyMarginPercent))} points below break-even — leaving these blank scores better.`}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {breakdown.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What each elimination is worth</h2>
        <p className={HELP_CLASS}>
          {ok
            ? result.minEliminations === null
              ? "No amount of elimination makes a guess profitable under this scheme."
              : result.minEliminations === 0
                ? "A blind guess already pays under this scheme."
                : `You must rule out at least ${result.minEliminations} option${result.minEliminations === 1 ? "" : "s"} before guessing pays.`
            : "—"}
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <caption className="sr-only">Expected marks from a guess at each elimination level</caption>
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Ruled out</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Options left</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Hit rate</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Value</th>
                <th scope="col" className="py-2 text-right font-semibold">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {(ok ? result.ladder : []).map((row) => (
                <tr key={row.optionsLeft} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.eliminated}</td>
                  <td className="py-2 pr-3 text-right">{row.optionsLeft}</td>
                  <td className="py-2 pr-3 text-right">{pct(row.hitRatePercent)}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{signed(row.evPerGuess)}</td>
                  <td
                    className={`py-2 text-right font-semibold ${
                      row.verdict === "answer"
                        ? "text-[var(--success)]"
                        : row.verdict === "neutral"
                          ? "text-[var(--muted-foreground)]"
                          : "text-[var(--danger)]"
                    }`}
                  >
                    {row.verdict}
                  </td>
                </tr>
              ))}
              {!ok && (
                <tr>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]" colSpan={5}>
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Expected values are long-run averages across many questions, not a prediction for one paper.
        Marking schemes are revised by examining bodies — confirm the current scheme in the official
        bulletin or notification before planning around a threshold.
      </p>
    </main>
  );
}
