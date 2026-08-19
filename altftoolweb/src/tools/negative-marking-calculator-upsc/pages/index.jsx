"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";
import { CSAT_QUALIFYING_PERCENT, UPSC_PAPERS, UPSC_PENALTY_FRACTION, modelUpscPrelims } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const n = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");
const signed = (value) => (Number.isFinite(value) ? `${value > 0 ? "+" : ""}${NUM.format(value)}` : "—");

const DEFAULTS = {
  paper: "gs",
  sureAttempts: "55",
  sureAccuracy: "82",
  twoLeft: "12",
  threeLeft: "10",
  blind: "8",
  target: "90",
};

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

export default function ToolHome() {
  const [paper, setPaper] = useState(DEFAULTS.paper);
  const [sureAttempts, setSureAttempts] = useState(DEFAULTS.sureAttempts);
  const [sureAccuracy, setSureAccuracy] = useState(DEFAULTS.sureAccuracy);
  const [twoLeft, setTwoLeft] = useState(DEFAULTS.twoLeft);
  const [threeLeft, setThreeLeft] = useState(DEFAULTS.threeLeft);
  const [blind, setBlind] = useState(DEFAULTS.blind);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [copied, setCopied] = useState(false);

  const paperSpec = UPSC_PAPERS[paper] ?? UPSC_PAPERS.gs;

  const result = useMemo(
    () =>
      modelUpscPrelims({
        questions: paperSpec.questions,
        marksPerQuestion: paperSpec.marksPerQuestion,
        penaltyFraction: UPSC_PENALTY_FRACTION,
        sureAttempts: toNumber(sureAttempts),
        sureAccuracyPercent: toNumber(sureAccuracy),
        twoLeft: toNumber(twoLeft),
        threeLeft: toNumber(threeLeft),
        blind: toNumber(blind),
        targetMarks: toNumber(target),
      }),
    [paperSpec, sureAttempts, sureAccuracy, twoLeft, threeLeft, blind, target],
  );

  const ok = !result.error;
  const isCsat = paperSpec.key === "csat";

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      `UPSC prelims projection — ${paperSpec.label}`,
      `Penalty: one-third of ${n(result.marksPerQuestion)} marks = ${n(result.penaltyPerWrong)} per wrong answer`,
      `Answered ${n(result.answered)} of ${result.questions}, left blank ${n(result.unattempted)}`,
      `Solved with knowledge: ${result.sureAttempts} at ${pct(toNumber(sureAccuracy))} accuracy → ${n(result.sureScore)} marks`,
      ...result.tiers.map(
        (tier) => `${tier.label}: ${tier.count} questions × ${signed(tier.evPerQuestion)} = ${signed(tier.score)} marks`,
      ),
      `Marks gained: +${n(result.marksGained)}`,
      `Marks lost to the penalty: -${n(result.marksLost)}`,
      `Expected score: ${n(result.expectedScore)} / ${n(result.totalMarks)} (${pct(result.percentOfMax)})`,
      `Range: ${n(result.worstCase)} to ${n(result.bestCase)}`,
      `Break-even accuracy: ${pct(result.breakEvenAccuracyPercent)}`,
      `Attempt count that maximises expected marks: ${n(result.optimalAttempts)}`,
    ];
    if (isCsat) {
      lines.push(
        `CSAT qualifying mark (${CSAT_QUALIFYING_PERCENT}%): ${n(result.qualifyingMarks)} — ${result.qualifiesCsat ? "clears" : "falls short"}`,
      );
    } else {
      lines.push(`Target ${n(result.targetMarks)}: ${result.meetsTarget ? "met" : `short by ${n(result.targetGap)}`}`);
    }
    return lines.join("\n");
  }, [ok, result, paperSpec, sureAccuracy, isCsat]);

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
    setPaper(DEFAULTS.paper);
    setSureAttempts(DEFAULTS.sureAttempts);
    setSureAccuracy(DEFAULTS.sureAccuracy);
    setTwoLeft(DEFAULTS.twoLeft);
    setThreeLeft(DEFAULTS.threeLeft);
    setBlind(DEFAULTS.blind);
    setTarget(DEFAULTS.target);
    setCopied(false);
  };

  const breakdown = [
    ["Questions answered", ok ? `${n(result.answered)} of ${result.questions}` : "—"],
    ["Left blank (no penalty)", ok ? n(result.unattempted) : "—"],
    ["Marks per correct answer", ok ? n(result.marksPerQuestion) : "—"],
    ["Deduction per wrong answer", ok ? `-${n(result.penaltyPerWrong)}` : "—"],
    ["Expected correct answers", ok ? n(result.totalCorrect) : "—"],
    ["Expected wrong answers", ok ? n(result.totalWrong) : "—"],
    ["Marks gained", ok ? `+${n(result.marksGained)}` : "—"],
    ["Marks lost to the penalty", ok ? `-${n(result.marksLost)}` : "—"],
    ["Score from solved questions only", ok ? n(result.sureScore) : "—"],
    ["Score added by guessing", ok ? signed(result.guessScore) : "—"],
    ["Overall accuracy on answered", ok ? pct(result.overallAccuracyPercent) : "—"],
    ["Percentage of maximum", ok ? pct(result.percentOfMax) : "—"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          UPSC prelims
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Negative Marking Calculator UPSC</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          UPSC deducts one-third of a question&apos;s marks for a wrong answer, which puts the
          break-even accuracy at 25% — exactly the odds of a blind four-option guess. Sort your paper
          into confidence tiers and see which attempts actually earn marks.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="upsc-paper">
              Paper
            </label>
            <select
              id="upsc-paper"
              className={`mt-2 ${INPUT_CLASS}`}
              value={paper}
              onChange={(event) => setPaper(event.target.value)}
            >
              {Object.values(UPSC_PAPERS).map((spec) => (
                <option key={spec.key} value={spec.key}>
                  {spec.label} — {spec.questions} questions, {spec.totalMarks} marks
                </option>
              ))}
            </select>
            <p className={HELP_CLASS}>{paperSpec.note}</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsc-sure">
              Questions solved with knowledge
            </label>
            <input
              id="upsc-sure"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={sureAttempts}
              onChange={(event) => setSureAttempts(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsc-accuracy">
              Accuracy on those (%)
            </label>
            <input
              id="upsc-accuracy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={sureAccuracy}
              onChange={(event) => setSureAccuracy(event.target.value)}
            />
            <p className={HELP_CLASS}>Even &quot;sure&quot; answers are rarely 100% in prelims.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsc-two">
              Guesses with two options left
            </label>
            <input
              id="upsc-two"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={twoLeft}
              onChange={(event) => setTwoLeft(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsc-three">
              Guesses with three options left
            </label>
            <input
              id="upsc-three"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={threeLeft}
              onChange={(event) => setThreeLeft(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsc-blind">
              Pure blind guesses
            </label>
            <input
              id="upsc-blind"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={blind}
              onChange={(event) => setBlind(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsc-target">
              Your target or expected cutoff
            </label>
            <input
              id="upsc-target"
              className={`mt-2 ${INPUT_CLASS} ${isCsat ? "cursor-not-allowed opacity-50" : ""}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={target}
              disabled={isCsat}
              aria-disabled={isCsat}
              onChange={(event) => setTarget(event.target.value)}
            />
            <p className={HELP_CLASS}>
              {isCsat
                ? "CSAT is qualifying-only, so a target score does not apply — the result below checks your expected score against the 33% qualifying bar instead."
                : "Cutoffs are declared only after the result — use your own estimate."}
            </p>
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

      <section aria-live="polite" className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Expected score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${n(result.expectedScore)} / ${n(result.totalMarks)}` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${n(result.worstCase)} to ${n(result.bestCase)} across the ${n(result.guessCount)} guessed questions`
                : "Fix the input above to see a score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy UPSC prelims score projection"
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
              isCsat
                ? result.qualifiesCsat
                  ? "bg-[var(--success-soft)] text-[var(--success)]"
                  : "bg-[var(--danger-soft)] text-[var(--danger)]"
                : result.meetsTarget
                  ? "bg-[var(--success-soft)] text-[var(--success)]"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)]"
            }`}
          >
            {isCsat
              ? result.qualifiesCsat
                ? `Clears the ${CSAT_QUALIFYING_PERCENT}% CSAT bar of ${n(result.qualifyingMarks)} marks by ${n(result.expectedScore - result.qualifyingMarks)}.`
                : `Short of the ${CSAT_QUALIFYING_PERCENT}% CSAT bar of ${n(result.qualifyingMarks)} marks by ${n(result.qualifyingMarks - result.expectedScore)}.`
              : result.meetsTarget
                ? `Clears your ${n(result.targetMarks)} target by ${n(result.expectedScore - result.targetMarks)} marks.`
                : `Short of your ${n(result.targetMarks)} target by ${n(result.targetGap)} marks.`}
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
        <h2 className="text-base font-semibold">Which guesses are worth taking</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[380px] text-left text-sm">
            <caption className="sr-only">Expected marks per confidence tier</caption>
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Tier</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Count</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Per question</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Total</th>
                <th scope="col" className="py-2 text-right font-semibold">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {(ok ? result.tiers : []).map((tier) => (
                <tr key={tier.key} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{tier.label}</td>
                  <td className="py-2 pr-3 text-right">{n(tier.count)}</td>
                  <td className="py-2 pr-3 text-right">{signed(tier.evPerQuestion)}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{signed(tier.score)}</td>
                  <td
                    className={`py-2 text-right font-semibold ${
                      tier.worthAttempting
                        ? "text-[var(--success)]"
                        : tier.neutral
                          ? "text-[var(--muted-foreground)]"
                          : "text-[var(--danger)]"
                    }`}
                  >
                    {tier.worthAttempting ? "Attempt" : tier.neutral ? "Neutral" : "Skip"}
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
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
          {ok ? (
            <>
              The attempt count that maximises expected marks is{" "}
              <strong className="text-[var(--foreground)]">{n(result.optimalAttempts)}</strong>.
              {result.blindGuessIsNeutral
                ? " A pure blind guess is exactly break-even under the one-third penalty — it neither helps nor hurts on average, but it does widen the spread of your score."
                : ""}{" "}
              Break-even accuracy is {pct(result.breakEvenAccuracyPercent)}; below that, leaving the
              question blank scores better.
            </>
          ) : (
            "—"
          )}
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Expected values are long-run averages, not a promise about one paper.
        Marking multiple options counts as a wrong answer and attracts the same penalty. Confirm the
        rules in the UPSC notification for your examination year.
      </p>
    </main>
  );
}
