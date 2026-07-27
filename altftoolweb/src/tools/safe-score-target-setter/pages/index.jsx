"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Target } from "lucide-react";

import {
  attemptPlan,
  buildRiskLadder,
  computeSafeTarget,
  cutoffStats,
  parseCutoffList,
  RISK_PROFILES,
} from "../lib";

const DEFAULTS = {
  history: "120, 128, 135, 131, 124",
  useHistoryMean: true,
  expectedCutoff: "128",
  maxMarks: "200",
  riskId: "balanced",
  totalQuestions: "100",
  marksPerCorrect: "2",
  negativeMark: "0.5",
  accuracy: "75",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const num = (v) => (Number.isFinite(v) ? NUM.format(v) : DASH);
const pct = (v) => (Number.isFinite(v) ? `${NUM.format(v)}%` : DASH);

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [history, setHistory] = useState(DEFAULTS.history);
  const [useHistoryMean, setUseHistoryMean] = useState(DEFAULTS.useHistoryMean);
  const [expectedCutoff, setExpectedCutoff] = useState(DEFAULTS.expectedCutoff);
  const [maxMarks, setMaxMarks] = useState(DEFAULTS.maxMarks);
  const [riskId, setRiskId] = useState(DEFAULTS.riskId);
  const [totalQuestions, setTotalQuestions] = useState(DEFAULTS.totalQuestions);
  const [marksPerCorrect, setMarksPerCorrect] = useState(DEFAULTS.marksPerCorrect);
  const [negativeMark, setNegativeMark] = useState(DEFAULTS.negativeMark);
  const [accuracy, setAccuracy] = useState(DEFAULTS.accuracy);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => cutoffStats(parseCutoffList(history)), [history]);

  const cutoffUsed = useMemo(() => {
    if (useHistoryMean && Number.isFinite(stats.mean)) return stats.mean;
    return toNumber(expectedCutoff);
  }, [useHistoryMean, stats, expectedCutoff]);

  const result = useMemo(
    () =>
      computeSafeTarget({
        expectedCutoff: cutoffUsed,
        maxMarks: toNumber(maxMarks),
        riskId,
        spread: stats.sd,
      }),
    [cutoffUsed, maxMarks, riskId, stats],
  );

  const hasError = Boolean(result.error);

  const plan = useMemo(() => {
    if (hasError) return { error: result.error };
    return attemptPlan({
      target: result.target,
      totalQuestions: toNumber(totalQuestions),
      marksPerCorrect: toNumber(marksPerCorrect),
      negativeMark: toNumber(negativeMark),
      accuracyPercent: toNumber(accuracy),
    });
  }, [hasError, result, totalQuestions, marksPerCorrect, negativeMark, accuracy]);

  const planError = Boolean(plan.error);

  const ladder = useMemo(
    () => (hasError ? [] : buildRiskLadder(cutoffUsed, toNumber(maxMarks), stats.sd)),
    [hasError, cutoffUsed, maxMarks, stats],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Safe score target",
      `Expected cutoff: ${num(result.expectedCutoff)} of ${num(result.maxMarks)} marks`,
      `Cutoff spread used: ${num(result.spreadUsed)} marks${result.usedFallback ? " (fallback, no usable history)" : " (sample SD of past cutoffs)"}`,
      `Risk appetite: ${result.profile.label} — ${num(result.confidencePercent)}% confidence`,
      `Buffer: +${num(result.buffer)} marks`,
      `TARGET SCORE: ${num(result.target)} marks (${pct(result.targetPercentOfMax)} of the paper)`,
    ];
    if (!planError) {
      lines.push(
        "",
        `Attempt plan at ${num(toNumber(accuracy))}% accuracy: attempt ${plan.attempts} questions`,
        `Expected ${plan.correct} correct, ${plan.wrong} wrong, ${plan.skipped} left blank`,
        `Projected score: ${num(plan.projectedScore)} marks`,
        `Break-even accuracy under this negative marking: ${pct(plan.breakEvenAccuracyPercent)}`,
      );
    }
    return lines.join("\n");
  }, [hasError, result, plan, planError, accuracy]);

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
    setHistory(DEFAULTS.history);
    setUseHistoryMean(DEFAULTS.useHistoryMean);
    setExpectedCutoff(DEFAULTS.expectedCutoff);
    setMaxMarks(DEFAULTS.maxMarks);
    setRiskId(DEFAULTS.riskId);
    setTotalQuestions(DEFAULTS.totalQuestions);
    setMarksPerCorrect(DEFAULTS.marksPerCorrect);
    setNegativeMark(DEFAULTS.negativeMark);
    setAccuracy(DEFAULTS.accuracy);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Target className="h-4 w-4" aria-hidden="true" />
          Cutoff analysis
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Safe Score Target Setter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Aiming exactly at the expected cutoff clears it about half the time. Enter the last few
          years&rsquo; cutoffs and this sizes a buffer from how much they actually moved, then turns
          the target into a number of questions to attempt.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="history">
              Past cutoffs, one per year (comma separated)
            </label>
            <input
              id="history"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="decimal"
              value={history}
              onChange={(event) => setHistory(event.target.value)}
            />
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              {stats.count >= 2
                ? `${stats.count} years read — mean ${num(stats.mean)}, spread (SD) ${num(stats.sd)}, range ${num(stats.min)} to ${num(stats.max)}.`
                : "Fewer than two usable numbers, so a fallback spread of 3% of total marks will be used."}
            </p>
          </div>

          <label
            htmlFor="use-mean"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
          >
            <input
              id="use-mean"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={useHistoryMean}
              onChange={(event) => setUseHistoryMean(event.target.checked)}
              disabled={!Number.isFinite(stats.mean)}
            />
            Use the average of past cutoffs as this year&rsquo;s expectation
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="expected">
                Expected cutoff this year (marks)
              </label>
              <input
                id="expected"
                className={`mt-2 ${INPUT_CLASS} disabled:opacity-60`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={useHistoryMean && Number.isFinite(stats.mean) ? String(stats.mean) : expectedCutoff}
                onChange={(event) => setExpectedCutoff(event.target.value)}
                disabled={useHistoryMean && Number.isFinite(stats.mean)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="max-marks">
                Total marks in the paper
              </label>
              <input
                id="max-marks"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                value={maxMarks}
                onChange={(event) => setMaxMarks(event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="risk">
              Risk appetite
            </label>
            <select
              id="risk"
              className={`mt-2 ${INPUT_CLASS}`}
              value={riskId}
              onChange={(event) => setRiskId(event.target.value)}
            >
              {Object.values(RISK_PROFILES).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({Math.round(p.confidence * 100)}% confidence)
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              {RISK_PROFILES[riskId]?.blurb}
            </p>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Target score to aim at
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : num(result.target)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `out of ${num(result.maxMarks)} marks — ${pct(result.targetPercentOfMax)} of the paper`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the target score plan to clipboard"
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
          {[
            ["Expected cutoff used", hasError ? DASH : `${num(result.expectedCutoff)} marks`],
            [
              "Cutoff spread (standard deviation)",
              hasError
                ? DASH
                : `${num(result.spreadUsed)} marks${result.usedFallback ? " (fallback)" : ""}`,
            ],
            ["Confidence level", hasError ? DASH : pct(result.confidencePercent)],
            ["Buffer added", hasError ? DASH : `+${num(result.buffer)} marks`],
            ["Buffer as share of the paper", hasError ? DASH : pct(result.bufferPercentOfMax)],
            ["Marks left above the target", hasError ? DASH : `${num(result.headroom)} marks`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.cappedAtMax && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--foreground)]">
            The buffered target ran past the total marks, so it has been capped at a full paper.
            Either the expected cutoff or the spread you entered is unrealistically high.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How many questions to attempt</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="questions">
              Questions in the paper
            </label>
            <input
              id="questions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={totalQuestions}
              onChange={(event) => setTotalQuestions(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="marks-correct">
              Marks per correct answer
            </label>
            <input
              id="marks-correct"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              step="0.25"
              value={marksPerCorrect}
              onChange={(event) => setMarksPerCorrect(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="negative">
              Negative marking per wrong answer
            </label>
            <input
              id="negative"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={negativeMark}
              onChange={(event) => setNegativeMark(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="accuracy">
              Your accuracy on attempted questions (%)
            </label>
            <input
              id="accuracy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={accuracy}
              onChange={(event) => setAccuracy(event.target.value)}
            />
          </div>
        </div>

        {planError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {plan.error}
          </p>
        ) : (
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              ["Questions to attempt", `${plan.attempts} of ${toNumber(totalQuestions)}`],
              ["Expected correct", String(plan.correct)],
              ["Expected wrong", String(plan.wrong)],
              ["Left blank", String(plan.skipped)],
              ["Projected score", `${num(plan.projectedScore)} marks`],
              ["Net marks per attempt", num(plan.netPerAttempt)],
              ["Break-even accuracy", pct(plan.breakEvenAccuracyPercent)],
              [
                "Accuracy needed if you attempt every question",
                pct(plan.requiredAccuracyFullPaper),
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {!planError && !plan.feasible && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--foreground)]">
            This target needs {plan.attemptsNeeded} attempts but the paper only has{" "}
            {toNumber(totalQuestions)} questions. At this accuracy the best reachable score is{" "}
            {num(plan.maxReachable)} marks — accuracy has to rise, not attempts.
          </p>
        )}
      </section>

      {!hasError && ladder.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">What each level of safety costs</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Confidence
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Buffer
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Target
                  </th>
                </tr>
              </thead>
              <tbody>
                {ladder.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      row.id === riskId ? "font-semibold text-[var(--primary)]" : ""
                    }`}
                  >
                    <td className="py-2 pr-3">{pct(row.confidencePercent)}</td>
                    <td className="py-2 pr-3 text-right">+{num(row.buffer)}</td>
                    <td className="py-2 text-right">
                      {num(row.target)} ({pct(row.targetPercentOfMax)})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The confidence figures assume the cutoff varies roughly normally around your expected value
        with the spread seen in past years. A change in vacancies, paper difficulty, reservation
        roster or the number of applicants can move a cutoff further than history suggests, so treat
        the target as a planning aid rather than a guarantee.
      </p>
    </main>
  );
}
