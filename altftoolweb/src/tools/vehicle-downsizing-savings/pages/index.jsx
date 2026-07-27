"use client";

import { useMemo, useState } from "react";
import { ArrowDownWideNarrow, Check, Copy, RotateCcw } from "lucide-react";

import {
  DEFAULT_DEPRECIATION_PCT,
  FUEL_TYPES,
  computeDownsizingSavings,
} from "../lib";

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
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : DASH);
const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);

const VEHICLE_FIELDS = [
  ["kmPerYear", "Distance per year (km)", "100"],
  ["economy", "Fuel economy (km per litre or kg)", "0.5"],
  ["insurance", "Insurance per year (₹)", "500"],
  ["maintenance", "Service and repairs per year (₹)", "500"],
  ["parking", "Parking per year (₹)", "500"],
  ["marketValue", "Resale value today (₹)", "10000"],
];

const DEFAULT_PRIMARY = {
  kmPerYear: "12000",
  economy: "14",
  insurance: "25000",
  maintenance: "18000",
  parking: "12000",
  marketValue: "700000",
};
const DEFAULT_SECOND = {
  kmPerYear: "4000",
  economy: "45",
  insurance: "3000",
  maintenance: "4000",
  parking: "0",
  marketValue: "60000",
};
const DEFAULT_REPLACEMENT = {
  kmPerYear: "14000",
  economy: "20",
  insurance: "15000",
  maintenance: "10000",
  parking: "12000",
  marketValue: "450000",
};

const DEFAULT_SHARED = {
  fuelType: "petrol",
  fuelPrice: "105",
  depreciation: String(DEFAULT_DEPRECIATION_PCT),
  extraTransport: "12000",
  replacementPrice: "450000",
  saleProceeds: "760000",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [primary, setPrimary] = useState(DEFAULT_PRIMARY);
  const [second, setSecond] = useState(DEFAULT_SECOND);
  const [replacement, setReplacement] = useState(DEFAULT_REPLACEMENT);
  const [keepSecond, setKeepSecond] = useState(true);
  const [shared, setShared] = useState(DEFAULT_SHARED);
  const [copied, setCopied] = useState(false);

  const setField = (setter) => (key, value) =>
    setter((prev) => ({ ...prev, [key]: value }));

  const shape = (group) => ({
    kmPerYear: toNum(group.kmPerYear),
    economy: toNum(group.economy),
    fuelPrice: toNum(shared.fuelPrice),
    insurance: toNum(group.insurance),
    maintenance: toNum(group.maintenance),
    parking: toNum(group.parking),
    marketValue: toNum(group.marketValue),
    depreciationPct: toNum(shared.depreciation),
  });

  const result = useMemo(
    () =>
      computeDownsizingSavings({
        primary: shape(primary),
        second: shape(second),
        keepSecond,
        replacement: shape(replacement),
        extraTransportPerYear: toNum(shared.extraTransport),
        replacementPrice: toNum(shared.replacementPrice),
        saleProceeds: toNum(shared.saleProceeds),
        fuelType: shared.fuelType,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [primary, second, replacement, keepSecond, shared],
  );

  const hasError = Boolean(result.error);

  const rows = hasError
    ? [
        ["Cost now — main vehicle", DASH],
        ["Cost now — second vehicle", DASH],
        ["Cost now — total per year", DASH],
        ["After — vehicle cost per year", DASH],
        ["After — added cab and transit", DASH],
        ["After — total per year", DASH],
        ["Saving per month", DASH],
        ["Fuel avoided per year", DASH],
        ["CO2 avoided per year", DASH],
        ["One-time cost to switch", DASH],
        ["Payback period", DASH],
        ["Net over 5 years", DASH],
        ["Cost per km now", DASH],
        ["Cost per km after", DASH],
      ]
    : [
        ["Cost now — main vehicle", money(result.primaryCost.total)],
        [
          "Cost now — second vehicle",
          result.secondCost ? money(result.secondCost.total) : "not run",
        ],
        ["Cost now — total per year", money(result.beforeTotal)],
        ["After — vehicle cost per year", money(result.afterVehicleTotal)],
        ["After — added cab and transit", money(result.extraTransportPerYear)],
        ["After — total per year", money(result.afterTotal)],
        ["Saving per month", money(result.monthlySavings)],
        ["Fuel avoided per year", `${num1(result.unitsSaved)} ${result.fuelUnitLabel}`],
        ["CO2 avoided per year", `${num1(result.co2SavedKg)} kg`],
        ["One-time cost to switch", money(result.netSwitchCost)],
        [
          "Payback period",
          result.paybackMonths === null
            ? "not applicable"
            : `${num1(result.paybackMonths)} months`,
        ],
        ["Net over 5 years", money(result.projectionSavings)],
        ["Cost per km now", money2(result.costPerKmBefore)],
        ["Cost per km after", money2(result.costPerKmAfter)],
      ];

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Vehicle Downsizing Savings",
      `Saving per year: ${money(result.annualSavings)}`,
      ...rows.map(([label, value]) => `${label}: ${value}`),
    ].join("\n");
  }, [hasError, result, rows]);

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
    setPrimary(DEFAULT_PRIMARY);
    setSecond(DEFAULT_SECOND);
    setReplacement(DEFAULT_REPLACEMENT);
    setKeepSecond(true);
    setShared(DEFAULT_SHARED);
    setCopied(false);
  };

  const groups = [
    ["now", "Vehicle you run today", primary, setField(setPrimary), true],
    ["two", "Second vehicle in the household", second, setField(setSecond), keepSecond],
    ["after", "Vehicle you would keep or buy", replacement, setField(setReplacement), true],
  ];

  const switchFields = [
    ["vds-fuelprice", "Fuel price (₹ per litre or kg)", "fuelPrice", "0.5"],
    ["vds-dep", "Depreciation (% of value per year)", "depreciation", "0.5"],
    ["vds-extra", "Added cab and transit per year (₹)", "extraTransport", "500"],
    ["vds-newprice", "Price of the replacement (₹)", "replacementPrice", "10000"],
    ["vds-proceeds", "Cash from selling what you let go (₹)", "saleProceeds", "10000"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ArrowDownWideNarrow className="h-4 w-4" aria-hidden="true" />
          Cost of ownership
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Vehicle Downsizing Savings
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fuel is the small part. Depreciation, insurance and parking are what a second or
          oversized vehicle really costs — and the trips it carried have to be paid for somewhere.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="mb-4">
          <label className={LABEL_CLASS} htmlFor="vds-fueltype">
            Fuel type
          </label>
          <select
            id="vds-fueltype"
            className={`mt-2 ${INPUT_CLASS}`}
            value={shared.fuelType}
            onChange={(e) => setShared((prev) => ({ ...prev, fuelType: e.target.value }))}
          >
            {FUEL_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
          <input
            id="vds-keepsecond"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={keepSecond}
            onChange={(e) => setKeepSecond(e.target.checked)}
          />
          The household runs a second vehicle today
        </label>

        {groups.map(([key, title, group, update, visible]) =>
          visible ? (
            <div key={key} className="mt-5 border-t border-[var(--border)] pt-5 first:border-0">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
                {title}
              </h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {VEHICLE_FIELDS.map(([field, label, step]) => {
                  const id = `vds-${key}-${field}`;
                  return (
                    <div key={id}>
                      <label className={LABEL_CLASS} htmlFor={id}>
                        {label}
                      </label>
                      <input
                        id={id}
                        className={`mt-2 ${INPUT_CLASS}`}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step={step}
                        value={group[field]}
                        onChange={(e) => update(field, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null,
        )}

        <div className="mt-5 border-t border-[var(--border)] pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
            Shared figures and the switch
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {switchFields.map(([id, label, key, step]) => (
              <div key={id}>
                <label className={LABEL_CLASS} htmlFor={id}>
                  {label}
                </label>
                <input
                  id={id}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step={step}
                  value={shared[key]}
                  onChange={(e) => setShared((prev) => ({ ...prev, [key]: e.target.value }))}
                />
              </div>
            ))}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Saving per year after downsizing
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                !hasError && result.annualSavings < 0
                  ? "text-[var(--danger)]"
                  : "text-[var(--primary)]"
              }`}
            >
              {hasError ? DASH : money(result.annualSavings)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the comparison."
                : `${money(result.beforeTotal)} a year now against ${money(result.afterTotal)} after`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy vehicle downsizing comparison"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

        {!hasError &&
          result.notes.map((note) => (
            <p
              key={note}
              className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {note}
            </p>
          ))}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Depreciation is charged as a flat percentage of current market value, which is a
        simplification — real depreciation is steepest in the first two years and flattens after.
        CO2 figures are tank-to-wheel combustion only and exclude fuel production and delivery.
        Informational, not financial advice.
      </p>
    </main>
  );
}
