"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import {
  MAX_HOURS_PER_WEEK,
  MIN_HOURS_PER_WEEK,
  PROVIDERS,
  ROLES,
  planCertificationPath,
} from "../lib";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const LEVEL_LABELS = {
  foundational: "Foundational",
  associate: "Associate",
  professional: "Professional / Expert",
};

const DEFAULTS = {
  provider: "aws",
  role: "architect",
  hoursPerWeek: "8",
  includeFundamentals: true,
};

export default function ToolHome() {
  const [provider, setProvider] = useState(DEFAULTS.provider);
  const [role, setRole] = useState(DEFAULTS.role);
  const [hoursPerWeek, setHoursPerWeek] = useState(DEFAULTS.hoursPerWeek);
  const [includeFundamentals, setIncludeFundamentals] = useState(DEFAULTS.includeFundamentals);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planCertificationPath({
        provider,
        role,
        hoursPerWeek: hoursPerWeek.trim() === "" ? Number.NaN : Number(hoursPerWeek),
        includeFundamentals,
      }),
    [provider, role, hoursPerWeek, includeFundamentals],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Certification path — ${PROVIDERS.find((p) => p.id === provider)?.label} ${ROLES.find((r) => r.id === role)?.label} at ${hoursPerWeek} h/week`,
      "",
      "| # | Certification | Exam | Fee | Study hours | Weeks | Exam in week |",
      "| --- | --- | --- | --- | --- | --- | --- |",
      ...result.steps.map(
        (step) =>
          `| ${step.order} | ${step.name} | ${step.code} | ${USD.format(step.feeUsd)} | ${step.studyHours} | ${step.weeks} | ${step.examWeek} |`,
      ),
      "",
      `Total: ${result.totalHours} study hours, ${result.totalWeeks} weeks (~${NUM.format(result.totalMonths)} months), ${USD.format(result.totalFeesUsd)} in exam fees.`,
    ].join("\n");
  }, [hasError, result, provider, role, hoursPerWeek]);

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
    setProvider(DEFAULTS.provider);
    setRole(DEFAULTS.role);
    setHoursPerWeek(DEFAULTS.hoursPerWeek);
    setIncludeFundamentals(DEFAULTS.includeFundamentals);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Interview prep
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cloud Certification Path Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a provider and target role to get an ordered exam sequence with published exam
          fees, typical study hours and a week-by-week timeline at your own study pace.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-provider">
              Cloud provider
            </label>
            <select
              id="cc-provider"
              className={`mt-2 ${INPUT_CLASS}`}
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
            >
              {PROVIDERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-role">
              Target role
            </label>
            <select
              id="cc-role"
              className={`mt-2 ${INPUT_CLASS}`}
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              {ROLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-hours">
              Study hours per week ({MIN_HOURS_PER_WEEK}–{MAX_HOURS_PER_WEEK})
            </label>
            <input
              id="cc-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_HOURS_PER_WEEK}
              max={MAX_HOURS_PER_WEEK}
              value={hoursPerWeek}
              onChange={(event) => setHoursPerWeek(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              8–10 h/week is a sustainable pace alongside a full-time job.
            </p>
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
              htmlFor="cc-fundamentals"
            >
              <input
                id="cc-fundamentals"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={includeFundamentals}
                onChange={(event) => setIncludeFundamentals(event.target.checked)}
              />
              Start with the fundamentals exam (skip it if you already work in cloud)
            </label>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Time to finish the path
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.totalWeeks} weeks`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a plan."
                : `≈ ${NUM.format(result.totalMonths)} months at ${hoursPerWeek} h/week — ${result.totalHours} study hours and ${USD.format(result.totalFeesUsd)} in exam fees across ${result.steps.length} exam${result.steps.length === 1 ? "" : "s"}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the certification plan as Markdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
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

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">#</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Certification</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Level</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Fee</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Study h</th>
                <th scope="col" className="py-2 text-right font-semibold">Exam in week</th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-[var(--muted-foreground)]">
                    {DASH}
                  </td>
                </tr>
              ) : (
                result.steps.map((step) => (
                  <tr key={step.id} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2.5 pr-3">{step.order}</td>
                    <td className="py-2.5 pr-3">
                      <span className="font-semibold">{step.name}</span>
                      <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                        Exam {step.code} · weeks {step.startWeek}–{step.examWeek}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">{LEVEL_LABELS[step.level]}</td>
                    <td className="py-2.5 pr-3 text-right whitespace-nowrap">{USD.format(step.feeUsd)}</td>
                    <td className="py-2.5 pr-3 text-right">{step.studyHours}</td>
                    <td className="py-2.5 text-right font-semibold">{step.examWeek}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Fees are the providers&apos; published standard USD prices and vary by country and
        promotions; study hours are typical estimates for someone with some IT background.
        Check the provider&apos;s certification page for the current exam version before
        booking.
      </p>
    </main>
  );
}
