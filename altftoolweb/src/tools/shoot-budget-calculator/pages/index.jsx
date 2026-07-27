"use client";

import { useMemo, useState } from "react";
import { Check, Clapperboard, Copy, RotateCcw } from "lucide-react";

import {
  CREW_ROLE_PRESETS,
  DEFAULT_CONTINGENCY_PCT,
  GST_RATE_INDIA_SERVICES,
  computeShootBudget,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  shootDays: "2",
  gearDailyRate: "20000",
  gearDays: "2",
  locationPerDay: "10000",
  travelPerPerson: "2000",
  lodgingPerNight: "2500",
  nights: "2",
  mealsPerPersonDay: "500",
  postHours: "24",
  postHourlyRate: "1500",
  miscFlat: "5000",
  contingencyPct: String(DEFAULT_CONTINGENCY_PCT),
  taxPct: String(GST_RATE_INDIA_SERVICES),
  deliverableMinutes: "2",
};

const defaultCrew = () =>
  CREW_ROLE_PRESETS.map((role) => ({
    id: role.id,
    label: role.label,
    count: String(role.count),
    dayRate: String(role.dayRate),
  }));

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return Number.NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : Number.NaN;
};

const FIELDS = [
  ["shootDays", "Shoot days", "0.5", "0"],
  ["gearDays", "Gear rental days", "0.5", "0"],
  ["gearDailyRate", "Gear rate per day (INR)", "500", "0"],
  ["locationPerDay", "Location / studio per day (INR)", "500", "0"],
  ["travelPerPerson", "Travel per crew member (INR)", "100", "0"],
  ["nights", "Lodging nights", "1", "0"],
  ["lodgingPerNight", "Lodging per person per night (INR)", "100", "0"],
  ["mealsPerPersonDay", "Meals per person per day (INR)", "50", "0"],
  ["postHours", "Post-production hours", "1", "0"],
  ["postHourlyRate", "Post rate per hour (INR)", "100", "0"],
  ["miscFlat", "Insurance, permits & misc (INR)", "500", "0"],
  ["deliverableMinutes", "Finished runtime (minutes)", "0.5", "0"],
  ["contingencyPct", "Contingency (%)", "1", "0"],
  ["taxPct", "GST / sales tax (%)", "1", "0"],
];

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [crew, setCrew] = useState(defaultCrew);
  const [copied, setCopied] = useState(false);

  const setField = (key, next) => setValues((prev) => ({ ...prev, [key]: next }));

  const setCrewField = (id, key, next) =>
    setCrew((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: next } : row)));

  const result = useMemo(() => {
    const numeric = {};
    for (const key of Object.keys(DEFAULTS)) numeric[key] = toNumber(values[key]);
    return computeShootBudget({
      ...numeric,
      crew: crew.map((row) => ({
        id: row.id,
        label: row.label,
        count: toNumber(row.count),
        dayRate: toNumber(row.dayRate),
      })),
    });
  }, [values, crew]);

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "Shoot Budget",
      `Shoot days: ${values.shootDays} · Crew on set: ${result.headcount}`,
      "",
      ...result.lines.map((line) => `${line.label}: ${money(line.amount)}`),
      "",
      `Direct subtotal: ${money(result.subtotal)}`,
      `Contingency (${values.contingencyPct}%): ${money(result.contingency)}`,
      `Pre-tax total: ${money(result.preTax)}`,
      `Tax (${values.taxPct}%): ${money(result.tax)}`,
      `TOTAL: ${money(result.total)}`,
      `Cost per shoot day: ${money(result.costPerShootDay)}`,
    ];
    if (result.costPerFinishedMinute !== null) {
      lines.push(`Cost per finished minute: ${money(result.costPerFinishedMinute)}`);
    }
    return lines.join("\n");
  }, [failed, result, values]);

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
    setCrew(defaultCrew());
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Clapperboard className="h-4 w-4" aria-hidden="true" />
          Production budget
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Shoot Budget Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Price a shoot the way a bid form does: crew day rates, equipment, location, travel and
          living, post hours, then a contingency line and tax on top.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Crew on set</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Head count and day rate per role. Crew cost is billed for every shoot day.
        </p>
        <div className="mt-4 grid gap-4">
          {crew.map((row) => (
            <div key={row.id} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <p className="text-sm font-semibold">{row.label}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)]" htmlFor={`crew-count-${row.id}`}>
                    People
                  </label>
                  <input
                    id={`crew-count-${row.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={row.count}
                    onChange={(event) => setCrewField(row.id, "count", event.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)]" htmlFor={`crew-rate-${row.id}`}>
                    Rate / day
                  </label>
                  <input
                    id={`crew-rate-${row.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="500"
                    value={row.dayRate}
                    onChange={(event) => setCrewField(row.id, "dayRate", event.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Everything else</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {FIELDS.map(([key, label, step, min]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`sb-${key}`}>
                {label}
              </label>
              <input
                id={`sb-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={min}
                step={step}
                value={values[key]}
                onChange={(event) => setField(key, event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {failed && (
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
              Total budget
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? "—" : money(result.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? "Fix the input above to see the budget." : `${money(result.costPerShootDay)} per shoot day`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy shoot budget breakdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
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
          {(failed ? [] : result.lines).map((line) => (
            <div key={line.key} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{line.label}</dt>
              <dd className="text-right font-semibold">{money(line.amount)}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Direct subtotal</dt>
            <dd className="text-right font-semibold">{failed ? "—" : money(result.subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Contingency</dt>
            <dd className="text-right font-semibold">{failed ? "—" : money(result.contingency)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Pre-tax total</dt>
            <dd className="text-right font-semibold">{failed ? "—" : money(result.preTax)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Tax</dt>
            <dd className="text-right font-semibold">{failed ? "—" : money(result.tax)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Crew on set</dt>
            <dd className="text-right font-semibold">{failed ? "—" : result.headcount}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Cost per finished minute</dt>
            <dd className="text-right font-semibold">
              {failed || result.costPerFinishedMinute === null
                ? "—"
                : money(result.costPerFinishedMinute)}
            </dd>
          </div>
        </dl>
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where the money goes</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Line</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Amount</th>
                  <th scope="col" className="py-2 text-right font-semibold">Share of direct cost</th>
                </tr>
              </thead>
              <tbody>
                {result.shares.map((row, index) => (
                  <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{money(result.lines[index].amount)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">{pct(row.share)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Union or guild minimums, overtime, kit fees, agency mark-up and
        withholding tax are not included — confirm the final figures with your line producer and
        your accountant.
      </p>
    </main>
  );
}
