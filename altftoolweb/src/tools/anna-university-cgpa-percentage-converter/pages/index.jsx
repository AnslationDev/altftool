"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  cgpaFromSemesters,
  cgpaToPercentage,
  classify,
  compareRules,
  GRADE_POINTS,
  percentageToCgpa,
  requiredGpaForTarget,
  RULES,
} from "../lib";

const DEFAULT_SEMESTERS = [
  { id: 1, credits: "24", gpa: "8.2" },
  { id: 2, credits: "25", gpa: "8.6" },
  { id: 3, credits: "23", gpa: "8.9" },
];

const DEFAULTS = {
  cgpa: "8.52",
  ruleId: "standard",
  reversePercent: "72",
  firstAttempt: true,
  targetCgpa: "8.5",
  completedCredits: "72",
  remainingCredits: "88",
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
  const [cgpa, setCgpa] = useState(DEFAULTS.cgpa);
  const [ruleId, setRuleId] = useState(DEFAULTS.ruleId);
  const [reversePercent, setReversePercent] = useState(DEFAULTS.reversePercent);
  const [firstAttempt, setFirstAttempt] = useState(DEFAULTS.firstAttempt);
  const [semesters, setSemesters] = useState(DEFAULT_SEMESTERS);
  const [targetCgpa, setTargetCgpa] = useState(DEFAULTS.targetCgpa);
  const [completedCredits, setCompletedCredits] = useState(DEFAULTS.completedCredits);
  const [remainingCredits, setRemainingCredits] = useState(DEFAULTS.remainingCredits);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => cgpaToPercentage(toNumber(cgpa), ruleId), [cgpa, ruleId]);
  const hasError = Boolean(result.error);

  const reverse = useMemo(
    () => percentageToCgpa(toNumber(reversePercent), ruleId),
    [reversePercent, ruleId],
  );

  const built = useMemo(
    () =>
      cgpaFromSemesters(
        semesters.map((row) => ({ credits: toNumber(row.credits), gpa: toNumber(row.gpa) })),
      ),
    [semesters],
  );

  const grade = useMemo(() => classify(toNumber(cgpa), firstAttempt), [cgpa, firstAttempt]);

  const target = useMemo(
    () =>
      requiredGpaForTarget({
        currentCgpa: toNumber(cgpa),
        completedCredits: toNumber(completedCredits),
        remainingCredits: toNumber(remainingCredits),
        targetCgpa: toNumber(targetCgpa),
      }),
    [cgpa, completedCredits, remainingCredits, targetCgpa],
  );

  const comparison = useMemo(() => (hasError ? [] : compareRules(toNumber(cgpa))), [hasError, cgpa]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Anna University CGPA conversion",
      `CGPA: ${num(toNumber(cgpa))} on a 10-point scale`,
      `Rule: ${result.rule.label}`,
      `Percentage: ${pct(result.percent)}`,
      grade.error ? "" : `Classification: ${grade.label}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, cgpa, result, grade]);

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
    setCgpa(DEFAULTS.cgpa);
    setRuleId(DEFAULTS.ruleId);
    setReversePercent(DEFAULTS.reversePercent);
    setFirstAttempt(DEFAULTS.firstAttempt);
    setSemesters(DEFAULT_SEMESTERS);
    setTargetCgpa(DEFAULTS.targetCgpa);
    setCompletedCredits(DEFAULTS.completedCredits);
    setRemainingCredits(DEFAULTS.remainingCredits);
    setCopied(false);
  };

  const updateSemester = (id, field, value) => {
    setSemesters((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addSemester = () => {
    setSemesters((rows) => {
      const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      return [...rows, { id: nextId, credits: "24", gpa: "8" }];
    });
  };

  const removeSemester = (id) => {
    setSemesters((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          CGPA converter
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Anna University CGPA Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Anna University regulations convert a 10-point CGPA to a percentage with a straight
          multiply. Pick the rule your own consolidated statement quotes, and build the CGPA itself
          from semester credits if you do not have it yet.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cgpa">
              Your CGPA (0 to 10)
            </label>
            <input
              id="cgpa"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="10"
              step="0.01"
              value={cgpa}
              onChange={(event) => setCgpa(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rule">
              Conversion rule
            </label>
            <select
              id="rule"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ruleId}
              onChange={(event) => setRuleId(event.target.value)}
            >
              {Object.values(RULES).map((rule) => (
                <option key={rule.id} value={rule.id}>
                  {rule.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          {RULES[ruleId]?.note}
        </p>
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
              Percentage
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : pct(result.percent)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the CGPA above to see a result." : `using ${result.rule.expression}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the converted percentage to clipboard"
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
            ["CGPA entered", hasError ? DASH : num(toNumber(cgpa))],
            ["Formula applied", hasError ? DASH : result.rule.expression],
            ["Degree classification", grade.error ? DASH : grade.label],
            [
              "Marks out of 100 in a 5-subject sense",
              hasError ? DASH : `${num(result.percent)} average per 100 marks`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <label
          htmlFor="first-attempt"
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
        >
          <input
            id="first-attempt"
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={firstAttempt}
            onChange={(event) => setFirstAttempt(event.target.checked)}
          />
          Passed every subject at the first appearance, within the normal duration
        </label>
        <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
          First Class with Distinction needs CGPA 8.50 or above <em>and</em> no arrears; with an
          arrear history the same CGPA is classified First Class.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Build your CGPA from semester credits</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          CGPA is the credit-weighted average of semester GPAs, so a light semester counts for less
          than a heavy one.
        </p>
        <div className="mt-4 grid gap-3">
          {semesters.map((row, index) => (
            <div key={row.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <div>
                <label className={LABEL_CLASS} htmlFor={`credits-${row.id}`}>
                  Semester {index + 1} credits
                </label>
                <input
                  id={`credits-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={row.credits}
                  onChange={(event) => updateSemester(row.id, "credits", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`gpa-${row.id}`}>
                  Semester {index + 1} GPA
                </label>
                <input
                  id={`gpa-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="10"
                  step="0.01"
                  value={row.gpa}
                  onChange={(event) => updateSemester(row.id, "gpa", event.target.value)}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeSemester(row.id)}
                  aria-label={`Remove semester ${index + 1}`}
                  className={`${GHOST_BTN} w-full sm:w-11`}
                  disabled={semesters.length <= 1}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span className="sm:hidden">Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addSemester} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add a semester
        </button>

        {built.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {built.error}
          </p>
        ) : (
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Credit-weighted CGPA", num(built.cgpa)],
              ["Total credits counted", num(built.totalCredits)],
              ["Total grade points", num(built.totalPoints)],
              [
                "That CGPA as a percentage",
                (() => {
                  const out = cgpaToPercentage(built.cgpa, ruleId);
                  return out.error ? DASH : pct(out.percent);
                })(),
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Percentage back to CGPA</h2>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="reverse">
            Percentage on the form (0 to 100)
          </label>
          <input
            id="reverse"
            className={`mt-2 ${INPUT_CLASS}`}
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="0.01"
            value={reversePercent}
            onChange={(event) => setReversePercent(event.target.value)}
          />
        </div>
        {reverse.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {reverse.error}
          </p>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            That is a CGPA of{" "}
            <span className="font-semibold text-[var(--foreground)]">{num(reverse.cgpa)}</span> under
            the selected rule.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What you still need to score</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="target-cgpa">
              Target CGPA at graduation
            </label>
            <input
              id="target-cgpa"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="10"
              step="0.01"
              value={targetCgpa}
              onChange={(event) => setTargetCgpa(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="done-credits">
              Credits already completed
            </label>
            <input
              id="done-credits"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={completedCredits}
              onChange={(event) => setCompletedCredits(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="left-credits">
              Credits still to go
            </label>
            <input
              id="left-credits"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={remainingCredits}
              onChange={(event) => setRemainingCredits(event.target.value)}
            />
          </div>
        </div>
        {target.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {target.error}
          </p>
        ) : target.achievable ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            You need an average GPA of{" "}
            <span className="font-semibold text-[var(--foreground)]">{num(target.requiredGpa)}</span>{" "}
            across the remaining credits.
          </p>
        ) : (
          <p className="mt-3 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--foreground)]">
            Reaching that target would need a GPA of {num(target.requiredGpa)} in the remaining
            credits, which is outside the 0 to 10 scale. Lower the target or spread it over more
            credits.
          </p>
        )}
      </section>

      {comparison.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">The same CGPA under each rule</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Formula
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      row.id === ruleId ? "font-semibold text-[var(--primary)]" : ""
                    }`}
                  >
                    <td className="py-2 pr-3">{row.expression}</td>
                    <td className="py-2 text-right">{pct(row.percent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Anna University grade points</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Grade
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Marks
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Grade point
                </th>
              </tr>
            </thead>
            <tbody>
              {GRADE_POINTS.map((row) => (
                <tr key={row.letter} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">
                    {row.letter}{" "}
                    <span className="font-normal text-[var(--muted-foreground)]">{row.label}</span>
                  </td>
                  <td className="py-2 pr-3">{row.marks}</td>
                  <td className="py-2 text-right">{row.point}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Conversion rules differ between regulations, programmes and affiliated colleges, and change
        from time to time. Before entering a percentage on an application, check the figure or
        formula printed on your own consolidated grade statement or ask the Controller of
        Examinations for a conversion certificate.
      </p>
    </main>
  );
}
