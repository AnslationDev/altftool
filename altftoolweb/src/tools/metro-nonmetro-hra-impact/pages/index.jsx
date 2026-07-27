"use client";

import { useMemo, useState } from "react";
import { Building2, Check, Copy, RotateCcw } from "lucide-react";

import {
  HRA_METRO_CITIES,
  METRO_SALARY_PERCENT,
  NON_METRO_SALARY_PERCENT,
  RENT_LESS_SALARY_PERCENT,
  compareMetroNonMetroHra,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const SLAB_RATES = [0, 5, 10, 15, 20, 25, 30];

const DEFAULTS = {
  monthlyBasic: "60000",
  monthlyDa: "0",
  monthlyHra: "30000",
  monthlyRent: "35000",
  months: "12",
  slab: "30",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [monthlyBasic, setMonthlyBasic] = useState(DEFAULTS.monthlyBasic);
  const [monthlyDa, setMonthlyDa] = useState(DEFAULTS.monthlyDa);
  const [monthlyHra, setMonthlyHra] = useState(DEFAULTS.monthlyHra);
  const [monthlyRent, setMonthlyRent] = useState(DEFAULTS.monthlyRent);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [slab, setSlab] = useState(DEFAULTS.slab);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareMetroNonMetroHra({
        monthlyBasic: toNumber(monthlyBasic),
        monthlyDa: toNumber(monthlyDa),
        monthlyHra: toNumber(monthlyHra),
        monthlyRent: toNumber(monthlyRent),
        months: toNumber(months),
        marginalRatePercent: toNumber(slab),
      }),
    [monthlyBasic, monthlyDa, monthlyHra, monthlyRent, months, slab],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Metro vs Non Metro HRA Impact",
      `Salary for Rule 2A (basic + DA): ${money(result.salary)} over ${result.monthsUsed} month(s)`,
      `HRA received: ${money(result.hraReceived)}`,
      `Rent paid: ${money(result.rentPaid)}`,
      `Metro (${METRO_SALARY_PERCENT}%) exemption: ${money(result.metro.exempt)} — capped by ${result.metro.bindingLimit}`,
      `Non-metro (${NON_METRO_SALARY_PERCENT}%) exemption: ${money(result.nonMetro.exempt)} — capped by ${result.nonMetro.bindingLimit}`,
      `Extra exemption in a metro: ${money(result.exemptionGap)}`,
      `Extra tax saved at ${num(result.effectiveRatePercent)}%: ${money(result.taxGap)}`,
    ].join("\n");
  }, [hasError, result]);

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
    setMonthlyBasic(DEFAULTS.monthlyBasic);
    setMonthlyDa(DEFAULTS.monthlyDa);
    setMonthlyHra(DEFAULTS.monthlyHra);
    setMonthlyRent(DEFAULTS.monthlyRent);
    setMonths(DEFAULTS.months);
    setSlab(DEFAULTS.slab);
    setCopied(false);
  };

  const rows = hasError
    ? []
    : [
        {
          label: "Actual HRA received",
          metro: money(result.metro.limitHra),
          nonMetro: money(result.nonMetro.limitHra),
        },
        {
          label: `Rent paid minus ${RENT_LESS_SALARY_PERCENT}% of salary`,
          metro: money(result.metro.limitRent),
          nonMetro: money(result.nonMetro.limitRent),
        },
        {
          label: "Percentage-of-salary cap",
          metro: `${money(result.metro.limitSalary)} (${METRO_SALARY_PERCENT}%)`,
          nonMetro: `${money(result.nonMetro.limitSalary)} (${NON_METRO_SALARY_PERCENT}%)`,
        },
        {
          label: "Exemption = lowest of the three",
          metro: money(result.metro.exempt),
          nonMetro: money(result.nonMetro.exempt),
          strong: true,
        },
        {
          label: "HRA still taxable",
          metro: money(result.metro.taxable),
          nonMetro: money(result.nonMetro.taxable),
        },
      ];

  const breakdown = hasError
    ? [
        ["Salary for Rule 2A (basic + DA)", DASH],
        ["HRA received", DASH],
        ["Rent paid", DASH],
        ["Metro exemption", DASH],
        ["Non-metro exemption", DASH],
        ["Extra tax saved in a metro", DASH],
      ]
    : [
        [
          "Salary for Rule 2A (basic + DA)",
          `${money(result.salary)} (${money(result.monthlySalaryBase)} × ${result.monthsUsed})`,
        ],
        ["HRA received", money(result.hraReceived)],
        ["Rent paid", money(result.rentPaid)],
        [
          `Metro exemption (${METRO_SALARY_PERCENT}% cap)`,
          `${money(result.metro.exempt)} — capped by ${result.metro.bindingLimit}`,
        ],
        [
          `Non-metro exemption (${NON_METRO_SALARY_PERCENT}% cap)`,
          `${money(result.nonMetro.exempt)} — capped by ${result.nonMetro.bindingLimit}`,
        ],
        [
          `Extra tax saved in a metro at ${num(result.effectiveRatePercent)}%`,
          money(result.taxGap),
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Rent and HRA
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Metro vs Non Metro HRA Impact Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Rule 2A caps your HRA exemption at {METRO_SALARY_PERCENT}% of salary in{" "}
          {HRA_METRO_CITIES.join(", ")} and {NON_METRO_SALARY_PERCENT}% everywhere else. See exactly
          what that swap costs or saves you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hra-basic">
              Monthly basic pay (INR)
            </label>
            <input
              id="hra-basic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={monthlyBasic}
              onChange={(event) => setMonthlyBasic(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hra-da">
              Monthly DA counted for retirement benefits (INR)
            </label>
            <input
              id="hra-da"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={monthlyDa}
              onChange={(event) => setMonthlyDa(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hra-hra">
              Monthly HRA received (INR)
            </label>
            <input
              id="hra-hra"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={monthlyHra}
              onChange={(event) => setMonthlyHra(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hra-rent">
              Monthly rent actually paid (INR)
            </label>
            <input
              id="hra-rent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={monthlyRent}
              onChange={(event) => setMonthlyRent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hra-months">
              Months in the year (1-12)
            </label>
            <input
              id="hra-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hra-slab">
              Your slab rate (%)
            </label>
            <select
              id="hra-slab"
              className={`mt-2 ${INPUT_CLASS}`}
              value={slab}
              onChange={(event) => setSlab(event.target.value)}
            >
              {SLAB_RATES.map((rate) => (
                <option key={rate} value={String(rate)}>
                  {rate}%
                </option>
              ))}
            </select>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Extra exemption in a metro city
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.exemptionGap)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : result.ruleMatters
                  ? `Worth ${money(result.taxGap)} of tax at ${num(result.effectiveRatePercent)}% including cess.`
                  : `On these numbers the ${METRO_SALARY_PERCENT}% and ${NON_METRO_SALARY_PERCENT}% caps make no difference — another limit is binding.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the metro versus non-metro HRA comparison"
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
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {breakdown.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">The three Rule 2A limits, side by side</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Limit
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Metro
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Non-metro
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.label}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      row.strong ? "font-semibold text-[var(--foreground)]" : ""
                    }`}
                  >
                    <th
                      scope="row"
                      className={`py-2 pr-3 text-left font-medium ${
                        row.strong ? "font-semibold" : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {row.label}
                    </th>
                    <td className="py-2 pr-3 text-right">{row.metro}</td>
                    <td className="py-2 text-right">{row.nonMetro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
            The city rate only decides the answer while your rent stays above{" "}
            {money(result.rentWhereGapDisappears)} a month on this salary. Below that, the
            rent-minus-{RENT_LESS_SALARY_PERCENT}% limit binds in both cases and the metro status is
            irrelevant.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Under Rule 2A only {HRA_METRO_CITIES.join(", ")} get the{" "}
        {METRO_SALARY_PERCENT}% cap — Bengaluru, Hyderabad, Pune and Gurugram do not. The exemption
        is available under the old regime only; section 115BAC withdraws it. Confirm your own figures
        with a chartered accountant.
      </p>
    </main>
  );
}
