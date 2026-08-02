"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Timer } from "lucide-react";

import { OS_LABELS, PLAN_OPTIONS, estimateActionsCost } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const DEFAULTS = {
  plan: "team",
  publicRepo: false,
  linuxJobs: "1500",
  linuxMinutes: "4",
  windowsJobs: "100",
  windowsMinutes: "6",
  macosJobs: "60",
  macosMinutes: "15",
};

const DASH = "—";
const OS_KEYS = ["linux", "windows", "macos"];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const result = useMemo(
    () =>
      estimateActionsCost({
        plan: form.plan,
        publicRepo: form.publicRepo,
        workload: {
          linux: {
            jobs: form.linuxJobs.trim() === "" ? 0 : Number(form.linuxJobs),
            minutes: form.linuxMinutes.trim() === "" ? 0 : Number(form.linuxMinutes),
          },
          windows: {
            jobs: form.windowsJobs.trim() === "" ? 0 : Number(form.windowsJobs),
            minutes: form.windowsMinutes.trim() === "" ? 0 : Number(form.windowsMinutes),
          },
          macos: {
            jobs: form.macosJobs.trim() === "" ? 0 : Number(form.macosJobs),
            minutes: form.macosMinutes.trim() === "" ? 0 : Number(form.macosMinutes),
          },
        },
      }),
    [form],
  );
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    const text = [
      "GitHub Actions monthly cost estimate",
      `Plan: ${result.plan.label}${result.publicRepo ? " (public repo — standard runners free)" : ""}`,
      ...OS_KEYS.map(
        (os) =>
          `${OS_LABELS[os]}: ${NUM.format(result.perOs[os].rawMinutes)} min x${result.perOs[os].multiplier} = ${NUM.format(result.perOs[os].multipliedMinutes)} billed min`,
      ),
      `Billed minutes total: ${NUM.format(result.multipliedTotal)}`,
      `Included allowance: ${NUM.format(result.included)}`,
      `Overage minutes: ${NUM.format(result.overageMinutes)}`,
      `Estimated cost: ${USD.format(result.cost)}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (!window.confirm("Reset all workload fields to the default example values? Your entered numbers will be lost.")) {
      return;
    }
    setForm(DEFAULTS);
    setCopied(false);
  };

  const osFields = [
    { os: "linux", jobsKey: "linuxJobs", minutesKey: "linuxMinutes" },
    { os: "windows", jobsKey: "windowsJobs", minutesKey: "windowsMinutes" },
    { os: "macos", jobsKey: "macosJobs", minutesKey: "macosMinutes" },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          CI Cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          GitHub Actions Minutes Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Estimate your monthly bill from jobs and durations. Windows minutes count double and macOS
          minutes count 10x against your plan&apos;s included allowance; overage is billed from
          $0.008 per Linux minute.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ac-plan">
              GitHub plan
            </label>
            <select id="ac-plan" className={`mt-2 ${INPUT_CLASS}`} value={form.plan} onChange={set("plan")}>
              {PLAN_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label} — {NUM.format(option.included)} min included
                </option>
              ))}
            </select>
          </div>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 self-end text-sm text-[var(--foreground)]"
            htmlFor="ac-public"
          >
            <input
              id="ac-public"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={form.publicRepo}
              onChange={set("publicRepo")}
            />
            Public repository (standard runners are free)
          </label>
        </div>

        <div className="mt-4 space-y-4">
          {osFields.map(({ os, jobsKey, minutesKey }) => (
            <div key={os} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor={`ac-${os}-jobs`}>
                  {OS_LABELS[os]} — jobs per month
                </label>
                <input
                  id={`ac-${os}-jobs`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="10"
                  value={form[jobsKey]}
                  onChange={set(jobsKey)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`ac-${os}-minutes`}>
                  {OS_LABELS[os]} — average minutes per job
                </label>
                <input
                  id={`ac-${os}-minutes`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={form[minutesKey]}
                  onChange={set(minutesKey)}
                />
              </div>
            </div>
          ))}
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
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated monthly overage cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : USD.format(result.cost)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.publicRepo
                  ? result.note
                  : `${NUM.format(result.multipliedTotal)} billed minutes against ${NUM.format(result.included)} included (${result.includedUsedPercent.toFixed(0)}% used).`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the cost estimate breakdown"
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

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Runner
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Raw minutes
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Multiplier
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Billed minutes
                </th>
              </tr>
            </thead>
            <tbody>
              {OS_KEYS.map((os) => (
                <tr key={os} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{OS_LABELS[os]}</td>
                  <td className="py-2 pr-3 text-right">
                    {hasError ? DASH : NUM.format(result.perOs[os].rawMinutes)}
                  </td>
                  <td className="py-2 pr-3 text-right">
                    {hasError ? DASH : `${result.perOs[os].multiplier}x`}
                  </td>
                  <td className="py-2 text-right font-semibold">
                    {hasError ? DASH : NUM.format(result.perOs[os].multipliedMinutes)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Billed minutes (multiplied)", hasError ? DASH : NUM.format(result.multipliedTotal)],
            ["Included in plan", hasError ? DASH : NUM.format(result.included)],
            ["Overage minutes", hasError ? DASH : NUM.format(result.overageMinutes)],
            ["Estimated overage cost", hasError ? DASH : USD.format(result.cost)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Rates from GitHub&apos;s billing documentation: Linux $0.008, Windows $0.016 and macOS $0.08
        per minute on standard runners, each job rounded up to a whole minute. Larger runners,
        storage and data transfer bill separately — check your usage report for the final figure.
      </p>
    </main>
  );
}
