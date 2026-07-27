"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Check, Copy, RotateCcw, XCircle } from "lucide-react";

import { CATEGORY_OPTIONS, checkPreMatricEligibility } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  studentClass: "9",
  category: "sc",
  familyIncome: "200000",
  prevPercent: "",
  hazardousOccupation: false,
};

const DASH = "—";

export default function ToolHome() {
  const [studentClass, setStudentClass] = useState(DEFAULTS.studentClass);
  const [category, setCategory] = useState(DEFAULTS.category);
  const [familyIncome, setFamilyIncome] = useState(DEFAULTS.familyIncome);
  const [prevPercent, setPrevPercent] = useState(DEFAULTS.prevPercent);
  const [hazardousOccupation, setHazardousOccupation] = useState(DEFAULTS.hazardousOccupation);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const toNum = (v) => (String(v).trim() === "" ? Number.NaN : Number(v));
    return checkPreMatricEligibility({
      studentClass: toNum(studentClass),
      category,
      familyIncome: toNum(familyIncome),
      prevPercent,
      hazardousOccupation,
    });
  }, [studentClass, category, familyIncome, prevPercent, hazardousOccupation]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Pre-matric scholarship eligibility",
      `Class ${result.studentClass}, category ${category.toUpperCase()}`,
      `Eligible schemes: ${result.eligibleCount} of ${result.schemes.length}`,
      "",
    ];
    for (const scheme of result.schemes) {
      lines.push(`${scheme.eligible ? "[YES]" : "[NO]"} ${scheme.name}`);
      if (!scheme.eligible) lines.push(`  Why not: ${scheme.reasons.join("; ")}`);
    }
    return lines.join("\n");
  }, [hasError, result, category]);

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
    setStudentClass(DEFAULTS.studentClass);
    setCategory(DEFAULTS.category);
    setFamilyIncome(DEFAULTS.familyIncome);
    setPrevPercent(DEFAULTS.prevPercent);
    setHazardousOccupation(DEFAULTS.hazardousOccupation);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BadgeCheck className="h-4 w-4" aria-hidden="true" />
          NSP schemes
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Pre Matric Scholarship Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Checks the five central pre-matric schemes — SC, ST, OBC/EBC/DNT (PM-YASASVI), minority
          and the hazardous-occupations component — against class, category and family income.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pms-class">
              Class currently studying in
            </label>
            <input
              id="pms-class"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              value={studentClass}
              onChange={(event) => setStudentClass(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pms-category">
              Category
            </label>
            <select
              id="pms-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pms-income">
              Annual family income (INR)
            </label>
            <input
              id="pms-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={familyIncome}
              onChange={(event) => setFamilyIncome(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pms-prev">
              Previous exam percentage (optional)
            </label>
            <input
              id="pms-prev"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              value={prevPercent}
              onChange={(event) => setPrevPercent(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Used for the minority scheme&apos;s 50% condition. Leave blank if not applicable.
            </p>
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="pms-hazard"
        >
          <input
            id="pms-hazard"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={hazardousOccupation}
            onChange={(event) => setHazardousOccupation(event.target.checked)}
          />
          A parent is engaged in a notified hazardous occupation (manual scavenging, tanning,
          flaying, waste picking)
        </label>
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
              Schemes you may qualify for
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.eligibleCount} of ${result.schemes.length}`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.eligibleCount > 0
                  ? "Apply on the National Scholarship Portal (or your state portal) within the year's deadline."
                  : "No central pre-matric scheme matches — check your state's own scholarship schemes."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the eligibility result"
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

        <ul className="mt-5 grid gap-3">
          {hasError
            ? null
            : result.schemes.map((scheme) => (
                <li
                  key={scheme.id}
                  className="rounded-lg border border-[var(--border)] p-4"
                >
                  <div className="flex items-start gap-3">
                    {scheme.eligible ? (
                      <BadgeCheck
                        className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]"
                        aria-hidden="true"
                      />
                    ) : (
                      <XCircle
                        className="mt-0.5 h-5 w-5 shrink-0 text-[var(--muted-foreground)]"
                        aria-hidden="true"
                      />
                    )}
                    <div>
                      <p className="text-sm font-semibold">
                        {scheme.name}
                        <span
                          className={`ml-2 text-xs font-semibold uppercase tracking-wide ${
                            scheme.eligible
                              ? "text-[var(--success)]"
                              : "text-[var(--muted-foreground)]"
                          }`}
                        >
                          {scheme.eligible ? "Likely eligible" : "Not eligible"}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                        {scheme.ministry} — {scheme.criteria}
                      </p>
                      {!scheme.eligible && scheme.reasons.length > 0 ? (
                        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                          Why not: {scheme.reasons.join("; ")}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, based on the central scheme guidelines as revised from 2022-23 (main
        schemes limited to classes 9-10). States run their own pre-matric schemes with different
        limits, and fresh/renewal rules, document requirements and deadlines apply — verify on the
        National Scholarship Portal or your state portal before applying.
      </p>
    </main>
  );
}
