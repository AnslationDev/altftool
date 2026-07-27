"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Copy, RotateCcw } from "lucide-react";
import { WORK_STAGES, computeCostPerContent, piecesToHitFixedCostCeiling } from "../lib";

const DEFAULTS = {
  hourlyRate: "800",
  research: "3",
  shoot: "4",
  edit: "10",
  publish: "2",
  piecesPerMonth: "4",
  gearValue: "300000",
  gearLifeMonths: "36",
  monthlySoftware: "2500",
  monthlyOverhead: "8000",
  directCostPerPiece: "1500",
  finishedMinutes: "12",
  revenuePerPiece: "30000",
  ceiling: "2000",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM2.format(value)}%` : DASH);
const hrs = (value) => (Number.isFinite(value) ? `${NUM2.format(value)} h` : DASH);

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  return text === "" ? 0 : Number(text);
};

const COST_FIELDS = [
  ["hourlyRate", "What your hour is worth (INR)", "100"],
  ["piecesPerMonth", "Pieces published per month", "1"],
  ["gearValue", "Total gear value (INR)", "5000"],
  ["gearLifeMonths", "Gear useful life (months)", "6"],
  ["monthlySoftware", "Software & subscriptions per month (INR)", "100"],
  ["monthlyOverhead", "Studio, storage & internet per month (INR)", "100"],
  ["directCostPerPiece", "Direct spend on this piece (INR)", "100"],
  ["finishedMinutes", "Finished runtime (minutes)", "1"],
  ["revenuePerPiece", "Revenue expected per piece (INR)", "500"],
];

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      computeCostPerContent({
        hourlyRate: toNumber(values.hourlyRate),
        hours: {
          research: toNumber(values.research),
          shoot: toNumber(values.shoot),
          edit: toNumber(values.edit),
          publish: toNumber(values.publish),
        },
        piecesPerMonth: toNumber(values.piecesPerMonth),
        gearValue: toNumber(values.gearValue),
        gearLifeMonths: toNumber(values.gearLifeMonths),
        monthlySoftware: toNumber(values.monthlySoftware),
        monthlyOverhead: toNumber(values.monthlyOverhead),
        directCostPerPiece: toNumber(values.directCostPerPiece),
        finishedMinutes: toNumber(values.finishedMinutes),
        revenuePerPiece: toNumber(values.revenuePerPiece),
      }),
    [values],
  );

  const ok = !result.error;

  const fixedMonthly = useMemo(() => {
    if (!ok) return 0;
    return (
      result.gearMonthly +
      toNumber(values.monthlySoftware) +
      toNumber(values.monthlyOverhead)
    );
  }, [ok, result, values.monthlySoftware, values.monthlyOverhead]);

  const ceiling = useMemo(
    () =>
      piecesToHitFixedCostCeiling({
        monthlyFixedCost: fixedMonthly,
        ceilingPerPiece: toNumber(values.ceiling),
      }),
    [fixedMonthly, values.ceiling],
  );

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Cost Per Content",
      `Hours per piece: ${hrs(result.totalHours)}`,
      `Cost of your time: ${money(result.timeCost)}`,
      `Gear depreciation: ${money(result.gearPerPiece)}`,
      `Software: ${money(result.softwarePerPiece)}`,
      `Overheads: ${money(result.overheadPerPiece)}`,
      `Direct spend: ${money(result.directCostPerPiece)}`,
      `TOTAL cost per piece: ${money(result.totalPerPiece)}`,
      `Total cost per month: ${money(result.monthlyTotal)}`,
      result.profitPerPiece === null
        ? ""
        : `Profit per piece: ${money(result.profitPerPiece)} (${pct(result.marginPercent)} margin)`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, result]);

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
    setValues(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Clock className="h-4 w-4" aria-hidden="true" />
          Creator business
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cost Per Content Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Most creators only count the cash they spend. This adds the hours you work, the gear
          wearing out and the subscriptions running in the background, spread across a month of
          output.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Hours on one piece</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {WORK_STAGES.map((stage) => (
            <div key={stage.key}>
              <label className={LABEL_CLASS} htmlFor={`cpc-${stage.key}`}>
                {stage.label}
              </label>
              <input
                id={`cpc-${stage.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={values[stage.key]}
                onChange={setField(stage.key)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Money and output</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {COST_FIELDS.map(([key, label, step]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`cpc-${key}`}>
                {label}
              </label>
              <input
                id={`cpc-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={step}
                value={values[key]}
                onChange={setField(key)}
              />
            </div>
          ))}
        </div>
      </section>

      {result.error ? (
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
              True cost of one piece
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.totalPerPiece) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${hrs(result.totalHours)} of work plus ${money(result.cashPerPiece)} of cash and wear`
                : "Fix the input above to see a figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy cost per content result"
              className={GHOST_BTN}
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
          {[
            ["Total cost across the month", ok ? money(result.monthlyTotal) : DASH],
            ["Hours across the month", ok ? hrs(result.monthlyHours) : DASH],
            [
              "Cost per finished minute",
              ok && result.perFinishedMinute !== null ? money(result.perFinishedMinute) : DASH,
            ],
            [
              "Profit per piece",
              ok && result.profitPerPiece !== null ? money(result.profitPerPiece) : DASH,
            ],
            ["Margin", ok && result.marginPercent !== null ? pct(result.marginPercent) : DASH],
            [
              "What you really earn per hour",
              ok && result.effectiveHourlyRate !== null
                ? money(result.effectiveHourlyRate)
                : DASH,
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
        <h2 className="text-base font-semibold">Where the money goes</h2>
        {ok ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Line
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Per piece
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line) => (
                  <tr key={line.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{line.label}</td>
                    <td className="py-2 pr-3 text-right">{money(line.amount)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {pct(line.share)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How much output dilutes fixed costs</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cpc-ceiling">
              Target fixed cost per piece (INR)
            </label>
            <input
              id="cpc-ceiling"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="100"
              value={values.ceiling}
              onChange={setField("ceiling")}
            />
          </div>
          <div className="flex items-end">
            {ceiling.error ? (
              <p
                role="alert"
                className="w-full rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {ceiling.error}
              </p>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">
                Gear, software and overheads come to {money(fixedMonthly)} a month, so you would
                need{" "}
                <span className="font-semibold text-[var(--foreground)]">{ceiling.pieces}</span>{" "}
                pieces a month to get fixed cost per piece down to that level.
              </p>
            )}
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Straight-line depreciation is used here for simplicity. The rate your accountant applies for
        tax may differ, so treat these figures as internal budgeting numbers rather than accounts.
      </p>
    </main>
  );
}
