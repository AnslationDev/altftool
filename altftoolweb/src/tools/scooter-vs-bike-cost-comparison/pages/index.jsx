"use client";

import { useMemo, useState } from "react";
import { Bike, Check, Copy, RotateCcw } from "lucide-react";

import { compareTwoWheelers } from "../lib";

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

const DASH = "—";

const DEFAULT_TRIP = { annualKm: "8000", years: "5", fuelPrice: "105" };

const DEFAULT_SCOOTER = {
  name: "Scooter",
  onRoadPrice: "95000",
  kmpl: "45",
  serviceCost: "800",
  serviceIntervalKm: "3000",
  serviceIntervalMonths: "6",
  tyreSetCost: "3500",
  tyreLifeKm: "20000",
  annualInsurance: "1800",
  resalePct: "45",
};

const DEFAULT_BIKE = {
  name: "Motorcycle",
  onRoadPrice: "130000",
  kmpl: "55",
  serviceCost: "1100",
  serviceIntervalKm: "4000",
  serviceIntervalMonths: "6",
  tyreSetCost: "5000",
  tyreLifeKm: "25000",
  annualInsurance: "2200",
  resalePct: "50",
};

const FIELDS = [
  { id: "onRoadPrice", label: "On-road price (₹)", step: "1000", min: "1" },
  { id: "kmpl", label: "Real mileage (km/l)", step: "1", min: "1" },
  { id: "serviceCost", label: "Cost per service (₹)", step: "50", min: "0" },
  { id: "serviceIntervalKm", label: "Service interval (km)", step: "500", min: "1" },
  { id: "serviceIntervalMonths", label: "Service interval (months)", step: "1", min: "1" },
  { id: "tyreSetCost", label: "Tyre set cost (₹)", step: "250", min: "0" },
  { id: "tyreLifeKm", label: "Tyre life (km)", step: "1000", min: "1" },
  { id: "annualInsurance", label: "Insurance per year (₹)", step: "100", min: "0" },
  { id: "resalePct", label: "Resale at the end (% of price)", step: "1", min: "0" },
];

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

const toSpec = (form, id) => ({
  id,
  name: form.name.trim() || id,
  onRoadPrice: toNumber(form.onRoadPrice),
  kmpl: toNumber(form.kmpl),
  serviceCost: toNumber(form.serviceCost),
  serviceIntervalKm: toNumber(form.serviceIntervalKm),
  serviceIntervalMonths: toNumber(form.serviceIntervalMonths),
  tyreSetCost: toNumber(form.tyreSetCost),
  tyreLifeKm: toNumber(form.tyreLifeKm),
  annualInsurance: toNumber(form.annualInsurance),
  resalePct: toNumber(form.resalePct),
});

export default function ToolHome() {
  const [trip, setTrip] = useState(DEFAULT_TRIP);
  const [scooterForm, setScooterForm] = useState(DEFAULT_SCOOTER);
  const [bikeForm, setBikeForm] = useState(DEFAULT_BIKE);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareTwoWheelers({
        scooter: toSpec(scooterForm, "scooter"),
        bike: toSpec(bikeForm, "bike"),
        annualKm: toNumber(trip.annualKm),
        years: toNumber(trip.years),
        fuelPrice: toNumber(trip.fuelPrice),
      }),
    [scooterForm, bikeForm, trip],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const line = (v) =>
      `${v.name}: ${INR.format(v.total)} total — depreciation ${INR.format(v.depreciation)}, fuel ${INR.format(v.fuel)}, service ${INR.format(v.servicing)} (${v.services}), tyres ${INR.format(v.tyres)} (${v.tyreSets} sets), insurance ${INR.format(v.insurance)}; ${INR2.format(v.perKm)}/km`;
    const sameVariableCost =
      Math.abs(result.scooter.variablePerKm - result.bike.variablePerKm) <= 1e-9;
    return [
      "Scooter vs Motorcycle — cost of ownership",
      `${result.years} years at ${NUM.format(result.annualKm)} km a year`,
      line(result.scooter),
      line(result.bike),
      result.isTie
        ? `Both cost the same: ${INR.format(result.cheaperTotal)} over ${result.years} year${result.years === 1 ? "" : "s"}`
        : `Cheaper: ${result.cheaperName} by ${INR.format(result.difference)} (${INR.format(result.differencePerMonth)} a month)`,
      result.breakEven
        ? `They break even near ${NUM.format(result.breakEven.annualKm)} km a year`
        : sameVariableCost
          ? "Both cost the same per kilometre to run"
          : `${result.scooter.variablePerKm <= result.bike.variablePerKm ? result.scooter.name : result.bike.name} is cheaper per kilometre at every distance here`,
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
    if (
      !window.confirm(
        "Reset every field? This will discard both vehicles' names, on-road prices, mileage, service and tyre intervals, insurance and resale figures, and your trip assumptions, and restore the defaults. This cannot be undone.",
      )
    ) {
      return;
    }
    setTrip(DEFAULT_TRIP);
    setScooterForm(DEFAULT_SCOOTER);
    setBikeForm(DEFAULT_BIKE);
    setCopied(false);
  };

  const forms = [
    { key: "scooter", form: scooterForm, setForm: setScooterForm },
    { key: "bike", form: bikeForm, setForm: setBikeForm },
  ];

  const rows = hasError
    ? [
        ["Depreciation", DASH],
        ["Fuel", DASH],
        ["Servicing", DASH],
        ["Tyres", DASH],
        ["Insurance", DASH],
        ["Total cost of ownership", DASH],
        ["Cost per kilometre", DASH],
        ["Cost per month", DASH],
        ["Resale value at the end", DASH],
      ]
    : [
        [
          "Depreciation",
          `${INR.format(result.scooter.depreciation)} · ${INR.format(result.bike.depreciation)}`,
        ],
        ["Fuel", `${INR.format(result.scooter.fuel)} · ${INR.format(result.bike.fuel)}`],
        [
          "Servicing",
          `${INR.format(result.scooter.servicing)} (${result.scooter.services}) · ${INR.format(result.bike.servicing)} (${result.bike.services})`,
        ],
        [
          "Tyres",
          `${INR.format(result.scooter.tyres)} (${result.scooter.tyreSets}) · ${INR.format(result.bike.tyres)} (${result.bike.tyreSets})`,
        ],
        ["Insurance", `${INR.format(result.scooter.insurance)} · ${INR.format(result.bike.insurance)}`],
        [
          "Total cost of ownership",
          `${INR.format(result.scooter.total)} · ${INR.format(result.bike.total)}`,
        ],
        [
          "Cost per kilometre",
          `${INR2.format(result.scooter.perKm)} · ${INR2.format(result.bike.perKm)}`,
        ],
        ["Cost per month", `${INR.format(result.scooter.perMonth)} · ${INR.format(result.bike.perMonth)}`],
        [
          "Resale value at the end",
          `${INR.format(result.scooter.resaleValue)} · ${INR.format(result.bike.resaleValue)}`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bike className="h-4 w-4" aria-hidden="true" />
          Two wheelers
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Scooter vs Bike Cost Comparison
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Purchase price decides very little. Compare both machines over the years you will keep them,
          including what you get back when you sell — and find the annual distance where the answer
          flips.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          How you will use it
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tco-annual-km">
              Kilometres a year
            </label>
            <input
              id="tco-annual-km"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="500"
              value={trip.annualKm}
              onChange={(event) => setTrip((prev) => ({ ...prev, annualKm: event.target.value }))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tco-years">
              Years you will keep it
            </label>
            <input
              id="tco-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="25"
              step="1"
              value={trip.years}
              onChange={(event) => setTrip((prev) => ({ ...prev, years: event.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tco-fuel-price">
              Fuel price (₹ per litre)
            </label>
            <input
              id="tco-fuel-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={trip.fuelPrice}
              onChange={(event) => setTrip((prev) => ({ ...prev, fuelPrice: event.target.value }))}
            />
          </div>
        </div>
      </section>

      {forms.map(({ key, form, setForm }) => (
        <section key={key} className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div>
            <label className={LABEL_CLASS} htmlFor={`tco-name-${key}`}>
              {key === "scooter" ? "Scooter" : "Motorcycle"} name
            </label>
            <input
              id={`tco-name-${key}`}
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <div key={field.id}>
                <label className={LABEL_CLASS} htmlFor={`tco-${key}-${field.id}`}>
                  {field.label}
                </label>
                <input
                  id={`tco-${key}-${field.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min={field.min}
                  step={field.step}
                  value={form[field.id]}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, [field.id]: event.target.value }))
                  }
                />
              </div>
            ))}
          </div>
        </section>
      ))}

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
          <div role="status" aria-live="polite" aria-atomic="true">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cheaper to own
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.isTie ? "Tie" : result.cheaperName}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to compare."
                : result.isTie
                  ? `Both cost the same over ${result.years} year${result.years === 1 ? "" : "s"} — ${INR.format(result.cheaperTotal)} each.`
                  : `${INR.format(result.difference)} less over ${result.years} year${result.years === 1 ? "" : "s"} — about ${INR.format(result.differencePerMonth)} a month`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy cost of ownership comparison"
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

        {!hasError && (
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">
            Each row reads <strong className="text-[var(--foreground)]">{result.scooter.name}</strong> ·{" "}
            <strong className="text-[var(--foreground)]">{result.bike.name}</strong>.
          </p>
        )}

        <dl
          className="mt-3 divide-y divide-[var(--border)] text-sm"
          aria-live="polite"
          aria-atomic="true"
        >
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.breakEven && (
          <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Break-even distance
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
              {NUM.format(result.breakEven.annualKm)} km a year
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Below that, {result.breakEven.cheaperBelow} wins. Above it, {result.breakEven.cheaperAbove}{" "}
              does.
            </p>
          </div>
        )}

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
        Informational estimate, not financial advice. Loan interest, parking, fines, accessories and
        the cost of a battery replacement on an electric two-wheeler are not modelled. Resale
        percentages are the assumption that moves the answer most — check what your two models
        actually sell for used before trusting the gap.
      </p>
    </main>
  );
}
