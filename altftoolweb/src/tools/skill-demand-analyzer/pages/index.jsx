"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TrendingUp } from "lucide-react";

import { DEMAND_WEIGHTS, analyzeSkillDemand } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  skill: "Kubernetes",
  openings: "2400",
  openingsLastYear: "1600",
  applicantsPerPosting: "28",
  skillMedianSalary: "1600000",
  marketMedianSalary: "1250000",
  remoteSharePct: "42",
};

const DASH = "—";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const count = new Intl.NumberFormat("en-IN");
const oneDp = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const FACTOR_LABELS = {
  volume: "Live openings",
  growth: "Year-on-year growth",
  competition: "Competition",
  pay: "Salary premium",
  remote: "Remote share",
};

export default function ToolHome({ initialSearch } = {}) {
  const [form, setForm] = useState(() =>
    initialSearch ? { ...DEFAULTS, skill: initialSearch } : DEFAULTS,
  );
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const result = useMemo(
    () =>
      analyzeSkillDemand({
        skill: form.skill,
        openings: form.openings,
        openingsLastYear: form.openingsLastYear,
        applicantsPerPosting: form.applicantsPerPosting,
        skillMedianSalary: form.skillMedianSalary,
        marketMedianSalary: form.marketMedianSalary,
        remoteSharePct: form.remoteSharePct,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    const lines = [
      `Skill demand: ${result.skill}`,
      `Score: ${result.score}/100 — ${result.band}`,
      `Year-on-year openings growth: ${result.growthPct}%`,
      `Salary premium vs role family: ${result.payPremiumPct}%`,
      `Applicants per posting: ${result.applicantsPerPosting}`,
      `Projected openings next year: ${result.projectedOpenings}`,
      `Weakest factor: ${FACTOR_LABELS[result.weakestFactor]}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const fields = [
    {
      id: "sda-skill",
      key: "skill",
      label: "Skill",
      type: "text",
      hint: "The exact term you searched on the job board.",
      span: true,
    },
    {
      id: "sda-openings",
      key: "openings",
      label: "Live openings today",
      type: "number",
      hint: "Postings naming the skill right now, in your target market.",
    },
    {
      id: "sda-openings-ly",
      key: "openingsLastYear",
      label: "Openings 12 months ago",
      type: "number",
      hint: "Same search, same market, one year earlier.",
    },
    {
      id: "sda-applicants",
      key: "applicantsPerPosting",
      label: "Applicants per posting",
      type: "number",
      hint: "Average applicant count shown on the listings.",
    },
    {
      id: "sda-remote",
      key: "remoteSharePct",
      label: "Remote share (%)",
      type: "number",
      hint: "Share of those postings that are remote or hybrid.",
    },
    {
      id: "sda-skill-pay",
      key: "skillMedianSalary",
      label: "Median salary, postings with the skill",
      type: "number",
      hint: "Annual, in rupees.",
    },
    {
      id: "sda-market-pay",
      key: "marketMedianSalary",
      label: "Median salary, whole role family",
      type: "number",
      hint: "Annual, in rupees — the baseline the premium is measured against.",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Labour market
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Skill Demand Analyzer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste five readings from any job board and get one 0-100 demand score, with the
          sub-scores that produced it so you can see which factor is carrying the result.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.id} className={field.span ? "sm:col-span-2" : undefined}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type={field.type}
                inputMode={field.type === "number" ? "decimal" : undefined}
                min={field.type === "number" ? "0" : undefined}
                value={form[field.key]}
                onChange={setField(field.key)}
              />
              <p className={HINT_CLASS}>{field.hint}</p>
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
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Skill demand score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
              {hasError ? DASH : `${oneDp.format(result.score)}`}
              <span className="ml-1 text-xl font-medium text-[var(--muted-foreground)]">/100</span>
            </p>
            <p className="mt-1 text-sm font-semibold">{hasError ? DASH : result.band}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : result.advice}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the skill demand result"
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
            [
              "Year-on-year openings growth",
              hasError ? DASH : `${oneDp.format(result.growthPct)}%`,
            ],
            [
              "Salary premium over role family",
              hasError ? DASH : `${oneDp.format(result.payPremiumPct)}%`,
            ],
            [
              "Median salary with this skill",
              hasError ? DASH : money.format(result.skillMedianSalary),
            ],
            [
              "Applicants per posting",
              hasError ? DASH : count.format(result.applicantsPerPosting),
            ],
            [
              "Projected openings in 12 months",
              hasError ? DASH : count.format(result.projectedOpenings),
            ],
            [
              "Weakest factor",
              hasError ? DASH : FACTOR_LABELS[result.weakestFactor],
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How the score is built</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[26rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Factor</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Weight</th>
                <th scope="col" className="py-2 font-semibold">Sub-score</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(DEMAND_WEIGHTS).map((key) => (
                <tr key={key} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2.5 pr-3">{FACTOR_LABELS[key]}</td>
                  <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">
                    {DEMAND_WEIGHTS[key]}%
                  </td>
                  <td className="py-2.5 font-semibold">
                    {hasError ? DASH : `${oneDp.format(result.subScores[key])}/100`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The score only reflects the numbers you enter. Pull all five readings from the same board,
        the same country filter and the same date window, or the comparison between skills breaks
        down.
      </p>
    </main>
  );
}
