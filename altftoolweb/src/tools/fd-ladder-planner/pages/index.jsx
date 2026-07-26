"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Layers, RotateCcw } from "lucide-react";

const DEFAULTS = {
  total: "500000",
  rungs: "5",
  firstTenure: "12",
  tenureStep: "12",
  baseRate: "6.5",
  rateStep: "0.2",
  split: "equal",
};

const SPLITS = [
  { value: "equal", label: "Equal amount in every rung" },
  { value: "front", label: "More in short tenures (liquidity first)" },
  { value: "back", label: "More in long tenures (yield first)" },
];

const inputClass =
  "mt-1.5 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const labelClass = "block text-sm font-medium text-[var(--foreground)]";

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const btnGhost =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const inr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const todayIso = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

function addMonths(iso, months) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const targetMonth = date.getMonth() + months;
  const shifted = new Date(date.getFullYear(), targetMonth, 1);
  const lastDay = new Date(
    shifted.getFullYear(),
    shifted.getMonth() + 1,
    0
  ).getDate();
  shifted.setDate(Math.min(day, lastDay));
  return shifted;
}

const tenureLabel = (months) => {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} mo`;
  if (rest === 0) return `${years} yr`;
  return `${years} yr ${rest} mo`;
};

function buildLadder({
  total,
  rungs,
  firstTenure,
  tenureStep,
  baseRate,
  rateStep,
  split,
  startDate,
}) {
  const weights = [];
  for (let i = 0; i < rungs; i += 1) {
    if (split === "front") weights.push(rungs - i);
    else if (split === "back") weights.push(i + 1);
    else weights.push(1);
  }
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);

  // Round each rung to a bookable amount, then let the last rung absorb the
  // rounding so the ladder always adds back up to the lump sum.
  const rawAmounts = weights.map((weight) => (total * weight) / weightSum);
  let principals = rawAmounts.map((raw) => Math.round(raw / 100) * 100);
  const headTotal = principals
    .slice(0, -1)
    .reduce((sum, amount) => sum + amount, 0);
  principals[principals.length - 1] = total - headTotal;
  if (principals[principals.length - 1] <= 0) {
    principals = rawAmounts;
  }

  const rows = [];

  for (let i = 0; i < rungs; i += 1) {
    const principal = principals[i];
    const months = firstTenure + i * tenureStep;
    const years = months / 12;
    const rate = Math.min(baseRate + i * rateStep, 15);
    const maturity = principal * (1 + rate / 400) ** (4 * years);
    const interest = maturity - principal;
    const effectiveYield =
      principal > 0 && years > 0
        ? ((maturity / principal) ** (1 / years) - 1) * 100
        : 0;

    rows.push({
      index: i + 1,
      principal,
      months,
      years,
      rate,
      maturity,
      interest,
      effectiveYield,
      maturityDate: startDate ? addMonths(startDate, months) : null,
    });
  }

  const totalMaturity = rows.reduce((sum, row) => sum + row.maturity, 0);
  const totalInterest = totalMaturity - total;
  const weightedTenure =
    rows.reduce((sum, row) => sum + row.principal * row.years, 0) / (total || 1);
  const averageYield =
    rows.reduce((sum, row) => sum + row.principal * row.effectiveYield, 0) /
    (total || 1);

  return { rows, totalMaturity, totalInterest, weightedTenure, averageYield };
}

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [startDate, setStartDate] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setStartDate(todayIso());
  }, []);

  const setField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setCopied(false);
  };

  const parsed = useMemo(() => {
    const total = Number(form.total);
    const rungs = Number(form.rungs);
    const firstTenure = Number(form.firstTenure);
    const tenureStep = Number(form.tenureStep);
    const baseRate = Number(form.baseRate);
    const rateStep = Number(form.rateStep);

    const values = { total, rungs, firstTenure, tenureStep, baseRate, rateStep };
    if (Object.values(values).some((value) => !Number.isFinite(value)))
      return { error: "Please enter numbers in every field." };
    if (total < 5000)
      return { error: "Use a lump sum of at least Rs 5,000 to build a ladder." };
    if (rungs < 2 || rungs > 10)
      return { error: "A ladder needs between 2 and 10 rungs." };
    if (!Number.isInteger(rungs))
      return { error: "The number of rungs must be a whole number." };
    if (firstTenure < 3)
      return { error: "The shortest FD tenure banks offer is about 3 months." };
    if (tenureStep < 1)
      return { error: "The gap between rungs must be at least 1 month." };
    if (firstTenure + (rungs - 1) * tenureStep > 120)
      return {
        error:
          "The longest rung goes beyond 10 years. Reduce the rungs, the first tenure or the step.",
      };
    if (baseRate <= 0 || baseRate > 15)
      return { error: "Enter a base rate between 0.1% and 15%." };
    if (rateStep < -2 || rateStep > 2)
      return { error: "Use a rate step between -2% and +2% per rung." };
    if (baseRate + (rungs - 1) * rateStep <= 0)
      return { error: "The rate step drives the longest rung to zero or below." };

    return { values: { ...values, split: form.split } };
  }, [form]);

  const result = useMemo(
    () => (parsed.values ? buildLadder({ ...parsed.values, startDate }) : null),
    [parsed, startDate]
  );

  const summary = useMemo(() => {
    if (!result || !parsed.values) return "";
    const lines = [
      "Fixed Deposit Ladder Plan",
      `Lump sum: ${inr(parsed.values.total)} across ${parsed.values.rungs} rungs`,
      "",
      ...result.rows.map(
        (row) =>
          `Rung ${row.index}: ${inr(row.principal)} for ${tenureLabel(
            row.months
          )} @ ${row.rate.toFixed(2)}% -> ${inr(row.maturity)}`
      ),
      "",
      `Total maturity: ${inr(result.totalMaturity)}`,
      `Total interest: ${inr(result.totalInterest)}`,
      `Average effective yield: ${result.averageYield.toFixed(2)}%`,
      `Weighted average tenure: ${result.weightedTenure.toFixed(2)} years`,
    ];
    return lines.join("\n");
  }, [parsed, result]);

  const copySummary = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Layers className="h-4 w-4" aria-hidden="true" />
          Savings
        </div>
        <h1 className="text-2xl font-semibold sm:text-3xl">
          Fixed Deposit Ladder Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Split one lump sum across staggered FD tenures so something matures
          every year. See each rung&apos;s payout, its maturity date and the
          blended yield of the whole ladder.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Ladder setup
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="fd-total">
              Lump sum to invest (INR)
            </label>
            <input
              id="fd-total"
              type="number"
              inputMode="numeric"
              min="5000"
              step="1000"
              value={form.total}
              onChange={setField("total")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="fd-rungs">
              Number of rungs (2-10)
            </label>
            <input
              id="fd-rungs"
              type="number"
              inputMode="numeric"
              min="2"
              max="10"
              step="1"
              value={form.rungs}
              onChange={setField("rungs")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="fd-first-tenure">
              Shortest tenure (months)
            </label>
            <input
              id="fd-first-tenure"
              type="number"
              inputMode="numeric"
              min="3"
              step="1"
              value={form.firstTenure}
              onChange={setField("firstTenure")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="fd-tenure-step">
              Gap between rungs (months)
            </label>
            <input
              id="fd-tenure-step"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.tenureStep}
              onChange={setField("tenureStep")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="fd-base-rate">
              Rate on shortest rung (% p.a.)
            </label>
            <input
              id="fd-base-rate"
              type="number"
              inputMode="decimal"
              min="0.1"
              max="15"
              step="0.05"
              value={form.baseRate}
              onChange={setField("baseRate")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="fd-rate-step">
              Rate change per rung (%)
            </label>
            <input
              id="fd-rate-step"
              type="number"
              inputMode="decimal"
              min="-2"
              max="2"
              step="0.05"
              value={form.rateStep}
              onChange={setField("rateStep")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="fd-split">
              How to split the money
            </label>
            <select
              id="fd-split"
              value={form.split}
              onChange={setField("split")}
              className={inputClass}
            >
              {SPLITS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="fd-start">
              Booking date
            </label>
            <input
              id="fd-start"
              type="date"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);
                setCopied(false);
              }}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copySummary}
            disabled={!result}
            aria-label="Copy FD ladder plan"
            className={`${btnPrimary} disabled:opacity-60`}
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
            onClick={() => {
              setForm(DEFAULTS);
              setStartDate(todayIso());
              setCopied(false);
            }}
            aria-label="Reset all inputs to defaults"
            className={btnGhost}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>

        {parsed.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {parsed.error}
          </p>
        ) : null}
      </section>

      {result ? (
        <>
          <section className="mt-5 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-sm font-medium text-[var(--muted-foreground)]">
              Total value when the whole ladder matures
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {inr(result.totalMaturity)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              From {inr(parsed.values.total)} split across {parsed.values.rungs}{" "}
              deposits
            </p>

            <dl className="mt-5 divide-y divide-[var(--border)]">
              {[
                ["Total interest earned", inr(result.totalInterest)],
                [
                  "Average effective yield",
                  `${result.averageYield.toFixed(2)}% p.a.`,
                ],
                [
                  "Weighted average tenure",
                  `${result.weightedTenure.toFixed(2)} years`,
                ],
                [
                  "First maturity",
                  `${tenureLabel(result.rows[0].months)} from booking`,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-4 py-2.5"
                >
                  <dt className="text-sm text-[var(--muted-foreground)]">
                    {label}
                  </dt>
                  <dd className="text-sm font-semibold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-5 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              The ladder
            </h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[360px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-medium">
                      Rung
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-medium">
                      Amount
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-medium">
                      Rate
                    </th>
                    <th scope="col" className="py-2 text-right font-medium">
                      Maturity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr
                      key={row.index}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="py-2 pr-3">
                        <span className="font-medium">
                          {tenureLabel(row.months)}
                        </span>
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          {row.maturityDate
                            ? row.maturityDate.toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Set a booking date"}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {inr(row.principal)}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {row.rate.toFixed(2)}%
                      </td>
                      <td className="py-2 text-right font-semibold tabular-nums">
                        {inr(row.maturity)}
                        <span className="block text-xs font-normal text-[var(--success)]">
                          +{inr(row.interest)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              Maturity is compounded quarterly, the standard for cumulative bank
              FDs. As each rung matures you can spend it or roll it into a fresh
              long-tenure deposit, which keeps one payout available every period
              while most of the money keeps earning the higher long-tenure rate.
              FD interest is taxable at your slab rate.
            </p>
          </section>
        </>
      ) : null}
    </div>
  );
}
