"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, IndianRupee, RotateCcw } from "lucide-react";
import { PLAN_TERMS, attendanceTable, computeCostPerVisit, findTerm } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  term: "annual",
  planFee: "24000",
  joiningFee: "1500",
  monthlyExtras: "200",
  perVisitCost: "40",
  visitsPerWeek: "3",
  dropInPrice: "400",
};

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  const value = Number(text);
  return text === "" || !Number.isFinite(value) ? NaN : value;
};

export default function ToolHome() {
  const [termId, setTermId] = useState(DEFAULTS.term);
  const [planFee, setPlanFee] = useState(DEFAULTS.planFee);
  const [joiningFee, setJoiningFee] = useState(DEFAULTS.joiningFee);
  const [monthlyExtras, setMonthlyExtras] = useState(DEFAULTS.monthlyExtras);
  const [perVisitCost, setPerVisitCost] = useState(DEFAULTS.perVisitCost);
  const [visitsPerWeek, setVisitsPerWeek] = useState(DEFAULTS.visitsPerWeek);
  const [dropInPrice, setDropInPrice] = useState(DEFAULTS.dropInPrice);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const term = findTerm(termId);

  const input = useMemo(
    () => ({
      planFee: toNumber(planFee),
      planMonths: term.months,
      joiningFee: toNumber(joiningFee),
      monthlyExtras: toNumber(monthlyExtras),
      perVisitCost: toNumber(perVisitCost),
      visitsPerWeek: toNumber(visitsPerWeek),
      dropInPrice: toNumber(dropInPrice),
    }),
    [planFee, term.months, joiningFee, monthlyExtras, perVisitCost, visitsPerWeek, dropInPrice],
  );

  const result = useMemo(() => computeCostPerVisit(input), [input]);
  const failed = Boolean(result.error);
  const table = useMemo(() => attendanceTable(input), [input]);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Gym Cost Per Visit Calculator",
      `Term: ${term.label} · ${NUM.format(input.visitsPerWeek)} visits a week`,
      `Total cost over the term: ${money(result.totalCost)}`,
      `Visits over the term: ${NUM.format(result.visits)}`,
      `Cost per visit: ${money2(result.costPerVisit)}`,
      `Membership-only cost per visit: ${money2(result.membershipOnlyPerVisit)}`,
      result.breakEvenVisits === null
        ? "No drop-in price entered, so no break-even comparison."
        : `Break-even vs a ${money(input.dropInPrice)} day pass: ${NUM.format(result.breakEvenVisits)} visits (${NUM.format(result.breakEvenVisitsPerWeek)} a week)`,
    ].join("\n");
  }, [failed, result, term.label, input.visitsPerWeek, input.dropInPrice]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTermId(DEFAULTS.term);
    setPlanFee(DEFAULTS.planFee);
    setJoiningFee(DEFAULTS.joiningFee);
    setMonthlyExtras(DEFAULTS.monthlyExtras);
    setPerVisitCost(DEFAULTS.perVisitCost);
    setVisitsPerWeek(DEFAULTS.visitsPerWeek);
    setDropInPrice(DEFAULTS.dropInPrice);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <IndianRupee className="h-4 w-4" aria-hidden="true" />
          Gym programming
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Gym Cost Per Visit Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The sticker price is not the real price. Add the joining fee, locker charges and travel,
          divide by the sessions you actually attend, and see how many visits it takes before the
          membership beats paying per session.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gym-term">
              Membership term
            </label>
            <select
              id="gym-term"
              className={`mt-2 ${INPUT_CLASS}`}
              value={termId}
              onChange={(event) => setTermId(event.target.value)}
            >
              {PLAN_TERMS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gym-fee">
              Price for that term (INR)
            </label>
            <input
              id="gym-fee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={planFee}
              onChange={(event) => setPlanFee(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gym-joining">
              One-off joining fee (INR)
            </label>
            <input
              id="gym-joining"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={joiningFee}
              onChange={(event) => setJoiningFee(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gym-extras">
              Monthly add-ons: locker, app, towel (INR)
            </label>
            <input
              id="gym-extras"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={monthlyExtras}
              onChange={(event) => setMonthlyExtras(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gym-pervisit">
              Spend per visit: travel, shake (INR)
            </label>
            <input
              id="gym-pervisit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={perVisitCost}
              onChange={(event) => setPerVisitCost(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gym-visits">
              Visits per week (be honest)
            </label>
            <input
              id="gym-visits"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="14"
              step="0.5"
              value={visitsPerWeek}
              onChange={(event) => setVisitsPerWeek(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gym-dropin">
              Day pass price for comparison (INR)
            </label>
            <input
              id="gym-dropin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={dropInPrice}
              onChange={(event) => setDropInPrice(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Set to 0 to skip the pay-per-session comparison.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["1", "2", "3", "4", "5"].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setVisitsPerWeek(value)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {value}x a week
            </button>
          ))}
        </div>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              True cost per visit
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : money2(result.costPerVisit)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to see a figure."
                : `${NUM.format(result.visits)} visits across ${result.months} month${result.months === 1 ? "" : "s"}${result.band ? ` · ${result.band.label}` : ""}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the cost per visit result" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
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
            ["Membership-only cost per visit", failed ? DASH : money2(result.membershipOnlyPerVisit)],
            ["Fixed cost for the term", failed ? DASH : money(result.fixedCost)],
            ["Per-visit spending across the term", failed ? DASH : money(result.variableCost)],
            ["Total cost for the term", failed ? DASH : money(result.totalCost)],
            ["Equivalent monthly cost", failed ? DASH : money(result.monthlyEquivalent)],
            ["Visits per month", failed ? DASH : NUM.format(result.visitsPerMonth)],
            [
              "Break-even visits vs a day pass",
              failed || result.breakEvenVisits === null ? DASH : `${NUM.format(result.breakEvenVisits)} visits`,
            ],
            [
              "That is per week",
              failed || result.breakEvenVisitsPerWeek === null
                ? DASH
                : `${NUM.format(result.breakEvenVisitsPerWeek)} a week`,
            ],
            [
              "Saving vs paying per session",
              failed || result.savingsVsDropIn === null ? DASH : money(result.savingsVsDropIn),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.band && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-xs leading-5 ${result.beatsDropIn ? "bg-[var(--muted)] text-[var(--muted-foreground)]" : "bg-[var(--danger-soft)] text-[var(--danger)]"}`}
          >
            {result.band.note}
          </p>
        )}
      </section>

      {!failed && table.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What attendance does to the price</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Same membership, same fees — only the number of visits changes.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Visits a week</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Visits in term</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Total cost</th>
                  <th scope="col" className="py-2 text-right font-semibold">Per visit</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row) => (
                  <tr key={row.visitsPerWeek} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.visitsPerWeek}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{NUM.format(row.visits)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-[var(--muted-foreground)]">
                      {money(row.totalCost)}
                    </td>
                    <td className="py-2 text-right tabular-nums">{money2(row.costPerVisit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Figures are informational estimates based on what you enter — taxes, freeze charges and
        cancellation terms vary by gym, so read the membership agreement before signing.
      </p>
    </main>
  );
}
