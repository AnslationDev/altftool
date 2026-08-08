"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Truck } from "lucide-react";

import { IS1172_LPCD, TANKER_SIZES_L, computeTankerCost } from "../lib";

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
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";

const DEFAULTS = {
  demand: "700",
  piped: "300",
  capacity: "5000",
  price: "1200",
  delivery: "0",
  days: "30",
  pipedRate: "25",
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
  const [demand, setDemand] = useState(DEFAULTS.demand);
  const [piped, setPiped] = useState(DEFAULTS.piped);
  const [capacity, setCapacity] = useState(DEFAULTS.capacity);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [delivery, setDelivery] = useState(DEFAULTS.delivery);
  const [days, setDays] = useState(DEFAULTS.days);
  const [pipedRate, setPipedRate] = useState(DEFAULTS.pipedRate);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTankerCost({
        dailyDemandLitres: toNumber(demand),
        pipedLitresPerDay: toNumber(piped),
        tankerCapacityL: toNumber(capacity),
        tankerPrice: toNumber(price),
        deliveryCharge: toNumber(delivery),
        daysInMonth: toNumber(days),
        pipedRatePerKl: toNumber(pipedRate),
      }),
    [demand, piped, capacity, price, delivery, days, pipedRate],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Water Tanker Cost",
      `Daily demand: ${NUM.format(toNumber(demand))} L, piped supply ${NUM.format(toNumber(piped))} L`,
      `Monthly shortfall: ${NUM.format(result.monthlyDeficit)} L`,
      `Tankers per month: ${result.tankersPerMonth}`,
      `Monthly tanker spend: ${INR.format(result.monthlyCost)}`,
      `Cost per litre: ${INR2.format(result.tankerCostPerLitre)}`,
      `Cost per kilolitre: ${INR.format(result.tankerCostPerKl)}`,
      `Blended cost of all water: ${INR.format(result.blendedCostPerKl)} per kL`,
      `Estimated annual tanker spend: ${INR.format(result.annualCost)}`,
    ].join("\n");
  }, [hasError, result, demand, piped]);

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
    setDemand(DEFAULTS.demand);
    setPiped(DEFAULTS.piped);
    setCapacity(DEFAULTS.capacity);
    setPrice(DEFAULTS.price);
    setDelivery(DEFAULTS.delivery);
    setDays(DEFAULTS.days);
    setPipedRate(DEFAULTS.pipedRate);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Shortfall per day", DASH],
        ["Shortfall per month", DASH],
        ["Tankers needed per month", DASH],
        ["Litres delivered (whole tankers)", DASH],
        ["Cost per tanker", DASH],
        ["Cost per litre of tanker water", DASH],
        ["Cost per kilolitre of tanker water", DASH],
        ["Piped water bill for the month", DASH],
        ["Blended cost of all water", DASH],
        ["Share of supply bought by tanker", DASH],
        ["Estimated annual tanker spend", DASH],
      ]
    : [
        ["Shortfall per day", `${NUM.format(result.dailyDeficit)} L`],
        ["Shortfall per month", `${NUM.format(result.monthlyDeficit)} L`],
        [
          "Tankers needed per month",
          result.daysPerTanker
            ? `${result.tankersPerMonth} (one lasts ${NUM1.format(result.daysPerTanker)} days)`
            : String(result.tankersPerMonth),
        ],
        ["Litres delivered (whole tankers)", `${NUM.format(result.litresDelivered)} L`],
        ["Cost per tanker", INR.format(result.costPerTanker)],
        ["Cost per litre of tanker water", INR2.format(result.tankerCostPerLitre)],
        ["Cost per kilolitre of tanker water", INR.format(result.tankerCostPerKl)],
        ["Piped water bill for the month", INR.format(result.pipedMonthlyCost)],
        ["Blended cost of all water", `${INR.format(result.blendedCostPerKl)} per kL`],
        ["Share of supply bought by tanker", `${NUM1.format(result.tankerShareOfSupply)}%`],
        ["Estimated annual tanker spend", INR.format(result.annualCost)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Truck className="h-4 w-4" aria-hidden="true" />
          Tanker water
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Water Tanker Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          See how many tankers your shortfall really needs each month, what they cost per litre and
          per kilolitre, and how that compares with the piped rate you are billed.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tanker-demand">
              Household demand per day (L)
            </label>
            <input
              id="tanker-demand"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="50"
              value={demand}
              onChange={(event) => setDemand(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              IS 1172 minimum is {IS1172_LPCD} L per person per day.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tanker-piped">
              Piped / borewell supply per day (L)
            </label>
            <input
              id="tanker-piped"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={piped}
              onChange={(event) => setPiped(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tanker-capacity">
              Litres per tanker
            </label>
            <input
              id="tanker-capacity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="500"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tanker-price">
              Price per tanker (₹)
            </label>
            <input
              id="tanker-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tanker-delivery">
              Delivery / pumping charge (₹)
            </label>
            <input
              id="tanker-delivery"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="25"
              value={delivery}
              onChange={(event) => setDelivery(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tanker-days">
              Days in the month
            </label>
            <input
              id="tanker-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              step="1"
              value={days}
              onChange={(event) => setDays(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tanker-piped-rate">
              Municipal water rate (₹ per kilolitre)
            </label>
            <input
              id="tanker-piped-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={pipedRate}
              onChange={(event) => setPipedRate(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Tanker sizes</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {TANKER_SIZES_L.map((size) => (
              <button
                key={size.id}
                type="button"
                onClick={() => setCapacity(String(size.litres))}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {NUM.format(size.litres)} L · {size.label}
              </button>
            ))}
          </div>
        </fieldset>
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
              Monthly tanker spend
            </p>
            <p
              className="mt-1 text-4xl font-semibold text-[var(--primary)]"
              aria-live="polite"
              aria-atomic="true"
            >
              {hasError ? DASH : INR.format(result.monthlyCost)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a cost."
                : `${result.tankersPerMonth} tanker(s) covering a ${NUM.format(result.monthlyDeficit)} L shortfall`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy water tanker cost result"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.notes.length > 0 && (
          <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {note}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Tanker prices swing with the season and the distance from the
        source, and a &quot;5,000 litre&quot; tanker does not always deliver 5,000 litres — check the
        level in your sump against the quoted volume.
      </p>
    </main>
  );
}
