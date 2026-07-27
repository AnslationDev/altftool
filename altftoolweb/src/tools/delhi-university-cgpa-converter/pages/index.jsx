"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, School, Trash2, X } from "lucide-react";

import {
  cgpaFromSemesters,
  cgpaToPercentage,
  eligibilityCheck,
  GRADE_POINTS,
  percentageToCgpa,
  requiredSgpaForTarget,
  RULES,
} from "../lib";

const DEFAULT_SEMESTERS = [
  { id: 1, credits: "22", sgpa: "8.0" },
  { id: 2, credits: "24", sgpa: "8.5" },
  { id: 3, credits: "20", sgpa: "9.0" },
];

const DEFAULTS = {
  cgpa: "8.20",
  ruleId: "ugc",
  reversePercent: "55",
  targetCgpa: "8.5",
  completedCredits: "88",
  remainingCredits: "44",
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
        semesters.map((r) => ({ credits: toNumber(r.credits), sgpa: toNumber(r.sgpa) })),
      ),
    [semesters],
  );

  const eligibility = useMemo(
    () => (hasError ? [] : eligibilityCheck(toNumber(cgpa), ruleId)),
    [hasError, cgpa, ruleId],
  );

  const target = useMemo(
    () =>
      requiredSgpaForTarget({
        currentCgpa: toNumber(cgpa),
        completedCredits: toNumber(completedCredits),
        remainingCredits: toNumber(remainingCredits),
        targetCgpa: toNumber(targetCgpa),
      }),
    [cgpa, completedCredits, remainingCredits, targetCgpa],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Delhi University CGPA conversion",
      `CGPA: ${num(toNumber(cgpa))}`,
      `Rule: ${result.rule.expression}`,
      `Percentage: ${pct(result.percent)}`,
      ...eligibility.map(
        (row) => `${row.met ? "MEETS" : "SHORT"} — ${row.percent}% : ${row.label}`,
      ),
    ].join("\n");
  }, [hasError, cgpa, result, eligibility]);

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
    setSemesters(DEFAULT_SEMESTERS);
    setTargetCgpa(DEFAULTS.targetCgpa);
    setCompletedCredits(DEFAULTS.completedCredits);
    setRemainingCredits(DEFAULTS.remainingCredits);
    setCopied(false);
  };

  const updateSemester = (id, field, value) =>
    setSemesters((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const addSemester = () =>
    setSemesters((rows) => [
      ...rows,
      { id: rows.reduce((m, r) => Math.max(m, r.id), 0) + 1, credits: "22", sgpa: "8" },
    ]);
  const removeSemester = (id) =>
    setSemesters((rows) => (rows.length > 1 ? rows.filter((r) => r.id !== id) : rows));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <School className="h-4 w-4" aria-hidden="true" />
          Delhi University
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Delhi University CGPA Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          DU&rsquo;s notified conversion multiplies the CGPA across all semesters by 9.5, the UGC
          Choice Based Credit System equivalence. Build the CGPA from your semester SGPAs and see
          straight away which eligibility bars the result clears.
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
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{RULES[ruleId]?.note}</p>
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
              Percentage of marks
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
            ["Highest percentage this rule can give", hasError ? DASH : pct(RULES[ruleId].m * 10)],
            [
              "Marks per CGPA point",
              hasError ? DASH : `${num(RULES[ruleId].m)} percentage points`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {eligibility.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Eligibility bars this percentage clears</h2>
          <ul className="mt-3 grid gap-2">
            {eligibility.map((row) => (
              <li
                key={row.id}
                className={`rounded-md px-3 py-2.5 text-sm ${
                  row.met
                    ? "bg-[var(--success-soft)] text-[var(--success)]"
                    : "bg-[var(--danger-soft)] text-[var(--danger)]"
                }`}
              >
                <span className="flex items-center gap-2 font-semibold">
                  {row.met ? (
                    <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <X className="h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  {row.percent}% — {row.label}
                </span>
                <span className="mt-1 block text-[var(--foreground)]">
                  Needs CGPA {num(row.cgpaNeeded)}.{" "}
                  {row.met ? "" : `You are ${num(row.gapPercent)} percentage points short. `}
                  {row.source}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">CGPA from your semester SGPAs</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          DU weights each semester by its credits. Averaging the SGPAs equally gives a different
          answer whenever the credit loads differ, and the gap is shown below.
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
                <label className={LABEL_CLASS} htmlFor={`sgpa-${row.id}`}>
                  Semester {index + 1} SGPA
                </label>
                <input
                  id={`sgpa-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="10"
                  step="0.01"
                  value={row.sgpa}
                  onChange={(event) => updateSemester(row.id, "sgpa", event.target.value)}
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
              ["Credit-weighted CGPA (DU method)", num(built.weightedCgpa)],
              ["Plain average of the SGPAs", num(built.simpleAverageCgpa)],
              ["Difference between the two", num(built.difference)],
              ["Total credits counted", num(built.totalCredits)],
              [
                "Weighted CGPA as a percentage",
                (() => {
                  const out = cgpaToPercentage(built.weightedCgpa, ruleId);
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
            Percentage a form asks for (0 to 100)
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
            That needs a CGPA of{" "}
            <span className="font-semibold text-[var(--foreground)]">{num(reverse.cgpa)}</span>.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What the remaining semesters must deliver</h2>
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
              Credits completed
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
            You need an average SGPA of{" "}
            <span className="font-semibold text-[var(--foreground)]">{num(target.requiredSgpa)}</span>{" "}
            across the remaining credits.
          </p>
        ) : (
          <p className="mt-3 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--foreground)]">
            That target needs an SGPA of {num(target.requiredSgpa)}, outside the 0 to 10 scale. Lower
            the target or account for more remaining credits.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">UGC CBCS grade points</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Grade
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Meaning
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Grade point
                </th>
              </tr>
            </thead>
            <tbody>
              {GRADE_POINTS.map((row) => (
                <tr key={row.letter} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.letter}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.label}</td>
                  <td className="py-2 text-right">{row.point}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Eligibility thresholds are set by the awarding body and revised from time to time; check the
        current advertisement or prospectus before relying on any of them. For an official figure,
        ask the University of Delhi examination branch for a conversion certificate.
      </p>
    </main>
  );
}
