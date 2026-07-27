"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TrendingUp } from "lucide-react";
import { COMMON_CYCLE_MONTHS, MAX_HORIZON_YEARS, planRentIncrements } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const DEFAULTS = {
  startingRent: "25000",
  escalationPercent: "8",
  cycleMonths: "12",
  horizonYears: "5",
  inflationPercent: "6",
  altStartingRent: "25000",
  altEscalationPercent: "5",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(
    () =>
      planRentIncrements({
        startingRent: toNumber(form.startingRent),
        escalationPercent: toNumber(form.escalationPercent),
        cycleMonths: toNumber(form.cycleMonths),
        horizonYears: toNumber(form.horizonYears),
        inflationPercent: toNumber(form.inflationPercent),
        altStartingRent: toNumber(form.altStartingRent),
        altEscalationPercent: toNumber(form.altEscalationPercent),
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Rent Increment Plan",
      `Starting rent: ${money(result.startingRent)} a month`,
      `Escalation: ${form.escalationPercent}% every ${form.cycleMonths} months`,
      `Rent in the final cycle: ${money(result.finalMonthlyRent)} (${pct(result.finalIncreasePercent)} above today)`,
      `Total rent over ${form.horizonYears} years: ${money(result.nominalTotal)}`,
      `Same outgo in today's money: ${money(result.realTotal)}`,
      `Comparison scenario total: ${money(result.altNominalTotal)}`,
      `Difference: ${money(Math.abs(result.difference))} ${result.difference > 0 ? "cheaper on your plan" : "cheaper on the comparison"}`,
    ].join("\n");
  }, [hasError, result, form.escalationPercent, form.cycleMonths, form.horizonYears]);

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Rent in the final cycle", DASH],
        ["Total increase over today's rent", DASH],
        ["Average monthly rent across the horizon", DASH],
        ["Total rent (nominal)", DASH],
        ["Total rent in today's money", DASH],
        ["Value lost to inflation", DASH],
        ["Comparison scenario total", DASH],
        ["Difference between the two", DASH],
      ]
    : [
        ["Rent in the final cycle", money(result.finalMonthlyRent)],
        ["Total increase over today's rent", pct(result.finalIncreasePercent)],
        ["Average monthly rent across the horizon", money(result.averageMonthlyRent)],
        ["Total rent (nominal)", money(result.nominalTotal)],
        ["Total rent in today's money", money(result.realTotal)],
        ["Value lost to inflation", money(result.inflationDrag)],
        ["Comparison scenario total", money(result.altNominalTotal)],
        [
          "Difference between the two",
          result.difference === 0
            ? "Identical"
            : `${money(Math.abs(result.difference))} ${result.difference > 0 ? "in your favour" : "against you"}`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Property finance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Rent Increment Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Compounds an agreed escalation across every renewal cycle, totals what you will actually
          pay, and puts a second scenario alongside it so you can see what a negotiated point or two
          is worth.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rip-rent">
              Current monthly rent (INR)
            </label>
            <input
              id="rip-rent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={form.startingRent}
              onChange={setField("startingRent")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rip-escalation">
              Agreed escalation per renewal (%)
            </label>
            <input
              id="rip-escalation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="0.5"
              value={form.escalationPercent}
              onChange={setField("escalationPercent")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rip-cycle">
              Renewal cycle (months)
            </label>
            <select
              id="rip-cycle"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.cycleMonths}
              onChange={setField("cycleMonths")}
            >
              {COMMON_CYCLE_MONTHS.map((months) => (
                <option key={months} value={String(months)}>
                  Every {months} months
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rip-horizon">
              Years to project
            </label>
            <input
              id="rip-horizon"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max={MAX_HORIZON_YEARS}
              step="1"
              value={form.horizonYears}
              onChange={setField("horizonYears")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rip-inflation">
              General inflation for today&apos;s-money view (%)
            </label>
            <input
              id="rip-inflation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="0.5"
              value={form.inflationPercent}
              onChange={setField("inflationPercent")}
            />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Comparison scenario</h2>
        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
          Use this for the landlord&apos;s original ask, a different flat, or the escalation you are
          negotiating towards.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rip-alt-rent">
              Comparison starting rent (INR)
            </label>
            <input
              id="rip-alt-rent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={form.altStartingRent}
              onChange={setField("altStartingRent")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rip-alt-escalation">
              Comparison escalation (%)
            </label>
            <input
              id="rip-alt-escalation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="0.5"
              value={form.altEscalationPercent}
              onChange={setField("altEscalationPercent")}
            />
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
              Total rent over the horizon
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.nominalTotal)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a projection."
                : `${result.horizonMonths} months, ending at ${money(result.finalMonthlyRent)} a month`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the rent escalation projection"
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

        {!hasError && result.crossoverCycle > 0 && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            The comparison scenario becomes the dearer monthly rent from cycle{" "}
            {result.crossoverCycle} onwards.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Cycle-by-cycle rent</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Cycle
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Months
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Monthly rent
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Paid in cycle
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Cumulative
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.cycle} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.cycle}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {row.firstMonth}&ndash;{row.lastMonth}
                    </td>
                    <td className="py-2 pr-3 text-right">{money(row.monthlyRent)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {money(row.cycleTotal)}
                    </td>
                    <td className="py-2 text-right font-semibold">{money(row.cumulative)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational projection only. Actual increases depend on what your agreement says and on
        local rent control law, which in some states caps how much and how often rent may be raised.
        Read the escalation clause carefully before signing.
      </p>
    </main>
  );
}
