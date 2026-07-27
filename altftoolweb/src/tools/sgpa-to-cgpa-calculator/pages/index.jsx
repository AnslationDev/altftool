"use client";

import { useMemo, useState } from "react";
import { Calculator, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  CONVERSION_RULES,
  SCALE_OPTIONS,
  cgpaToPercentage,
  compareRules,
  computeCgpa,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const pct = (value) => (Number.isFinite(value) ? `${NUM2.format(value)}%` : "—");
const gp = (value) => (Number.isFinite(value) ? NUM2.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_SEMESTERS = [
  { sgpa: "8.5", credits: "20" },
  { sgpa: "7.2", credits: "24" },
  { sgpa: "9.0", credits: "18" },
];

export default function ToolHome() {
  const [scaleId, setScaleId] = useState("10");
  const [rule, setRule] = useState("direct");
  const [semesters, setSemesters] = useState(DEFAULT_SEMESTERS);
  const [copied, setCopied] = useState(false);

  const scaleMax = useMemo(
    () => (SCALE_OPTIONS.find((option) => option.id === scaleId) || SCALE_OPTIONS[0]).max,
    [scaleId],
  );
  const tenPoint = scaleMax === 10;
  const effectiveRule = tenPoint ? rule : "direct";

  const result = useMemo(() => computeCgpa(semesters, { scaleMax }), [semesters, scaleMax]);
  const ok = !result.error;

  const converted = useMemo(
    () => (ok ? cgpaToPercentage({ cgpa: result.cgpa, rule: effectiveRule, scaleMax }) : { error: result.error }),
    [ok, result, effectiveRule, scaleMax],
  );
  const variants = useMemo(
    () => (ok && tenPoint ? compareRules(result.cgpa, scaleMax) : []),
    [ok, tenPoint, result, scaleMax],
  );

  const summary = useMemo(() => {
    if (!ok || converted.error) return "";
    return [
      "SGPA to CGPA",
      `Semesters: ${result.semesters}`,
      `Total credits: ${NUM1.format(result.totalCredits)}`,
      `Total grade points: ${NUM1.format(result.totalGradePoints)}`,
      `Credit weighted CGPA: ${gp(result.cgpa)} out of ${result.scaleMax}`,
      `Plain average of the SGPAs: ${gp(result.simpleAverage)}`,
      `Equivalent percentage (${converted.ruleLabel}): ${pct(converted.percentage)}`,
    ].join("\n");
  }, [ok, converted, result]);

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
    setScaleId("10");
    setRule("direct");
    setSemesters(DEFAULT_SEMESTERS);
    setCopied(false);
  };

  const updateSemester = (position, key, value) =>
    setSemesters((rows) =>
      rows.map((row, index) => (index === position ? { ...row, [key]: value } : row)),
    );
  const addSemester = () => setSemesters((rows) => [...rows, { sgpa: "", credits: "20" }]);
  const removeSemester = (position) =>
    setSemesters((rows) => (rows.length > 1 ? rows.filter((_, index) => index !== position) : rows));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Calculator className="h-4 w-4" aria-hidden="true" />
          Cumulative average
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">SGPA To CGPA Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A CGPA is the credit weighted average of the semesters, not the average of the SGPAs.
          Enter each semester with its credits to get the correct figure, the running cumulative
          after every semester, and the gap a plain average would have introduced.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-scale">
              Grade point scale
            </label>
            <select
              id="sc-scale"
              className={`mt-2 ${INPUT_CLASS}`}
              value={scaleId}
              onChange={(event) => setScaleId(event.target.value)}
            >
              {SCALE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-rule">
              Percentage conversion rule
            </label>
            <select
              id="sc-rule"
              className={`mt-2 ${INPUT_CLASS}`}
              value={effectiveRule}
              disabled={!tenPoint}
              onChange={(event) => setRule(event.target.value)}
            >
              {CONVERSION_RULES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {tenPoint
                ? "Pick the rule your own university publishes — the three disagree by up to 7.5 marks."
                : "On a 4 point scale the equivalent percentage is a straight proportion of the scale."}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Semesters</h2>
        <div className="mt-4 grid gap-3">
          {semesters.map((row, index) => (
            <div key={`sem-${index}`} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label className={LABEL_CLASS} htmlFor={`sc-sgpa-${index}`}>
                  Semester {index + 1} SGPA
                </label>
                <input
                  id={`sc-sgpa-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max={scaleMax}
                  step="0.01"
                  value={row.sgpa}
                  onChange={(event) => updateSemester(index, "sgpa", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`sc-cred-${index}`}>
                  Credits
                </label>
                <input
                  id={`sc-cred-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={row.credits}
                  onChange={(event) => updateSemester(index, "credits", event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeSemester(index)}
                disabled={semesters.length < 2}
                aria-label={`Remove semester ${index + 1}`}
                className={`${GHOST_BTN} disabled:opacity-40`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sm:hidden">Remove</span>
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addSemester} className={`${GHOST_BTN} mt-3`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add semester
        </button>
      </section>

      {result.error && (
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
              Cumulative CGPA
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${gp(result.cgpa)} / ${result.scaleMax}` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM1.format(result.totalGradePoints)} grade points over ${NUM1.format(result.totalCredits)} credits`
                : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the CGPA result"
              className={`${GHOST_BTN} disabled:opacity-40`}
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
            ["Semesters counted", ok ? NUM1.format(result.semesters) : "—"],
            ["Total credits", ok ? NUM1.format(result.totalCredits) : "—"],
            ["Total grade points", ok ? NUM1.format(result.totalGradePoints) : "—"],
            ["Credit weighted CGPA", ok ? gp(result.cgpa) : "—"],
            ["Plain average of the SGPAs", ok ? gp(result.simpleAverage) : "—"],
            [
              "Error a plain average would cause",
              ok
                ? result.averagingGap === 0
                  ? "None — every semester carries equal credits"
                  : `${result.averagingGap > 0 ? "+" : ""}${gp(result.averagingGap)} points`
                : "—",
            ],
            [
              "Equivalent percentage",
              ok && !converted.error ? pct(converted.percentage) : "—",
            ],
            ["Strongest semester", ok ? `Semester ${result.bestSemester} (${gp(result.bestSgpa)})` : "—"],
            ["Weakest semester", ok ? `Semester ${result.weakestSemester} (${gp(result.weakestSgpa)})` : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Running cumulative after each semester</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Semester
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  SGPA
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Credits
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Grade points
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  CGPA so far
                </th>
              </tr>
            </thead>
            <tbody>
              {ok ? (
                result.running.map((row) => (
                  <tr key={row.semester} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.semester}</td>
                    <td className="py-2 pr-3">{gp(row.sgpa)}</td>
                    <td className="py-2 pr-3">{NUM1.format(row.credits)}</td>
                    <td className="py-2 pr-3">{NUM1.format(row.gradePoints)}</td>
                    <td className="py-2 text-right font-semibold">{gp(row.cumulativeCgpa)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={5}>
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {tenPoint && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">The same CGPA under each published rule</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Rule
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Used by
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody>
                {variants.length > 0 ? (
                  variants.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.label}</td>
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.note}</td>
                      <td className="py-2 text-right font-semibold">{pct(row.percentage)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 text-[var(--muted-foreground)]" colSpan={3}>
                      —
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational calculation. Universities differ on which semesters count towards the final
        CGPA and on how repeated papers are treated, so the figure printed on your consolidated
        transcript is the one that counts.
      </p>
    </main>
  );
}
