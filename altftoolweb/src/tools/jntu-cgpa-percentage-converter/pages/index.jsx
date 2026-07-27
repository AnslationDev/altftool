"use client";

import { useMemo, useState } from "react";
import { Calculator, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  RULES,
  cgpaFromSemesters,
  cgpaToPercentage,
  classForCgpa,
  percentageToCgpa,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const MODES = [
  { id: "toPercent", label: "CGPA to %" },
  { id: "toCgpa", label: "% to CGPA" },
  { id: "semesters", label: "SGPA to CGPA" },
];

const DEFAULTS = {
  mode: "toPercent",
  ruleId: "jntuh",
  cgpa: "8.5",
  percent: "70",
  semRows: [
    { id: 1, credits: "20", sgpa: "8.4" },
    { id: 2, credits: "22", sgpa: "7.6" },
  ],
};

const DASH = "—";

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [ruleId, setRuleId] = useState(DEFAULTS.ruleId);
  const [cgpa, setCgpa] = useState(DEFAULTS.cgpa);
  const [percent, setPercent] = useState(DEFAULTS.percent);
  const [semRows, setSemRows] = useState(DEFAULTS.semRows);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (mode === "toPercent") {
      const conv = cgpaToPercentage(cgpa.trim(), ruleId);
      if (conv.error) return { error: conv.error };
      const band = classForCgpa(Number(cgpa));
      return {
        headline: `${NUM2.format(conv.percent)}%`,
        caption: "Equivalent percentage",
        rows: [
          ["CGPA entered", NUM2.format(Number(cgpa))],
          ["University", `${conv.rule.university} (${conv.rule.regulations})`],
          ["Formula", "(CGPA − 0.75) × 10"],
          ["Class band", band.error ? DASH : band.label],
        ],
        note: conv.clamped
          ? "The raw formula result fell below 0% and was clamped."
          : band.error
            ? ""
            : band.note,
        copyText: `${conv.rule.university} CGPA ${cgpa} = ${NUM2.format(conv.percent)}% using (CGPA − 0.75) × 10${band.error ? "" : ` — ${band.label}`}`,
      };
    }
    if (mode === "toCgpa") {
      const conv = percentageToCgpa(percent.trim(), ruleId);
      if (conv.error) return { error: conv.error };
      const band = classForCgpa(conv.cgpa);
      return {
        headline: NUM2.format(conv.cgpa),
        caption: "Equivalent CGPA",
        rows: [
          ["Percentage entered", `${NUM2.format(Number(percent))}%`],
          ["University", `${conv.rule.university} (${conv.rule.regulations})`],
          ["Formula", "CGPA = % ÷ 10 + 0.75"],
          ["Class band", band.error ? DASH : band.label],
        ],
        note: band.error ? "" : band.note,
        copyText: `${percent}% = ${conv.rule.university} CGPA ${NUM2.format(conv.cgpa)} using CGPA = % ÷ 10 + 0.75${band.error ? "" : ` — ${band.label}`}`,
      };
    }
    const agg = cgpaFromSemesters(
      semRows.map((row) => ({ credits: Number(row.credits), sgpa: Number(row.sgpa) })),
    );
    if (agg.error) return { error: agg.error };
    const conv = cgpaToPercentage(agg.cgpa, ruleId);
    const band = classForCgpa(agg.cgpa);
    return {
      headline: NUM2.format(agg.cgpa),
      caption: "Credit-weighted CGPA",
      rows: [
        ["Semesters counted", String(semRows.length)],
        ["Total credits", NUM2.format(agg.totalCredits)],
        ["Equivalent percentage", conv.error ? DASH : `${NUM2.format(conv.percent)}%`],
        ["Class band", band.error ? DASH : band.label],
      ],
      note: band.error ? "" : band.note,
      copyText: `JNTU CGPA from SGPAs: ${NUM2.format(agg.cgpa)} over ${NUM2.format(agg.totalCredits)} credits${conv.error ? "" : ` = ${NUM2.format(conv.percent)}%`}`,
    };
  }, [mode, ruleId, cgpa, percent, semRows]);

  const hasError = Boolean(result.error);

  const setSemField = (id, field, value) => {
    setCopied(false);
    setSemRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const addSemester = () => {
    setCopied(false);
    setSemRows((prev) => [
      ...prev,
      { id: prev.reduce((m, r) => Math.max(m, r.id), 0) + 1, credits: "20", sgpa: "7.5" },
    ]);
  };

  const removeSemester = (id) => {
    setCopied(false);
    setSemRows((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setMode(DEFAULTS.mode);
    setRuleId(DEFAULTS.ruleId);
    setCgpa(DEFAULTS.cgpa);
    setPercent(DEFAULTS.percent);
    setSemRows(DEFAULTS.semRows);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Calculator className="h-4 w-4" aria-hidden="true" />
          CGPA Converters
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          JNTU CGPA Percentage Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The credit regulations of JNTU Hyderabad, Kakinada and Anantapur all notify percentage =
          (CGPA − 0.75) × 10. Convert either way, combine semester SGPAs, and see which class band
          your figure earns.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="jntu-mode">
              What do you want to convert?
            </label>
            <select
              id="jntu-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => {
                setCopied(false);
                setMode(event.target.value);
              }}
            >
              {MODES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jntu-rule">
              University and regulations
            </label>
            <select
              id="jntu-rule"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ruleId}
              onChange={(event) => {
                setCopied(false);
                setRuleId(event.target.value);
              }}
            >
              {RULES.map((rule) => (
                <option key={rule.id} value={rule.id}>
                  {rule.label}
                </option>
              ))}
            </select>
          </div>
          {mode === "toPercent" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="jntu-cgpa">
                Your CGPA (0 to 10)
              </label>
              <input
                id="jntu-cgpa"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="10"
                step="0.01"
                value={cgpa}
                onChange={(event) => {
                  setCopied(false);
                  setCgpa(event.target.value);
                }}
              />
            </div>
          ) : null}
          {mode === "toCgpa" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="jntu-percent">
                Your percentage (0 to 100)
              </label>
              <input
                id="jntu-percent"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="0.01"
                value={percent}
                onChange={(event) => {
                  setCopied(false);
                  setPercent(event.target.value);
                }}
              />
            </div>
          ) : null}
        </div>

        {mode === "semesters" ? (
          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">Semester SGPAs</h2>
              <button
                type="button"
                onClick={addSemester}
                aria-label="Add a semester row"
                className={GHOST_BTN}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add semester
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {semRows.map((row, index) => (
                <div
                  key={row.id}
                  className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 sm:grid-cols-[1fr_1fr_auto]"
                >
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`jntu-credits-${row.id}`}>
                      Semester {index + 1} credits
                    </label>
                    <input
                      id={`jntu-credits-${row.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="1"
                      step="1"
                      value={row.credits}
                      onChange={(event) => setSemField(row.id, "credits", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`jntu-sgpa-${row.id}`}>
                      SGPA
                    </label>
                    <input
                      id={`jntu-sgpa-${row.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max="10"
                      step="0.01"
                      value={row.sgpa}
                      onChange={(event) => setSemField(row.id, "sgpa", event.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSemester(row.id)}
                    disabled={semRows.length <= 1}
                    aria-label={`Remove semester ${index + 1}`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 self-end rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--danger)] transition hover:border-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
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
              {hasError ? "Result" : result.caption}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.headline}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.note || "Computed with the notified (CGPA − 0.75) × 10 equivalence."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the JNTU conversion result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Input", DASH],
                ["University", DASH],
                ["Formula", DASH],
                ["Class band", DASH],
              ]
            : result.rows
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">JNTU class bands (credit regulations)</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[380px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  CGPA
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Converted %
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Class
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["7.75 and above", "70% and above", "First Class with Distinction*"],
                ["6.75 to below 7.75", "60% to below 70%", "First Class"],
                ["5.75 to below 6.75", "50% to below 60%", "Second Class"],
                ["5.00 to below 5.75", "42.5% to below 50%", "Pass Class"],
              ].map(([a, b, c]) => (
                <tr key={c} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{a}</td>
                  <td className="py-2 pr-3">{b}</td>
                  <td className="py-2 text-right font-semibold">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          *Distinction is commonly conditioned on clearing everything within the regular course
          period; the exact wording varies by university and regulation.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational conversion per the credit regulations of JNTUH, JNTUK and JNTUA. Older
        marks-based regulations (R09 and earlier) printed the percentage directly and need no
        conversion. When a form demands a different formula (such as UGC&apos;s CGPA × 9.5), state
        which rule you used.
      </p>
    </main>
  );
}
