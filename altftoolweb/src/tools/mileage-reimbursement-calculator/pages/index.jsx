"use client";

import { useMemo, useState } from "react";
import { Car, Check, Copy, RotateCcw } from "lucide-react";

import { RATE_PRESETS, UNITS, computeMileage } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const TOGGLE_CLASS =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)]";

const LOCALES = { INR: "en-IN", GBP: "en-GB", USD: "en-US" };

const DEFAULT_PRESET = RATE_PRESETS[0];

const START = {
  preset: DEFAULT_PRESET.key,
  currency: DEFAULT_PRESET.currency,
  unit: DEFAULT_PRESET.unit,
  distance: "120",
  trips: "1",
  roundTrip: true,
  tier1Rate: String(DEFAULT_PRESET.tier1Rate),
  tierLimit: String(DEFAULT_PRESET.tierLimit),
  tier2Rate: String(DEFAULT_PRESET.tier2Rate),
  priorDistance: "9000",
  passengers: "0",
  passengerRate: String(DEFAULT_PRESET.passengerRate),
  tolls: "0",
  parking: "0",
  fuelPrice: "0",
  fuelEfficiency: "0",
};

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return 0;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [state, setState] = useState(START);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setState((current) => ({ ...current, [key]: value }));

  const applyPreset = (key) => {
    const preset = RATE_PRESETS.find((p) => p.key === key);
    if (!preset) {
      setState((current) => ({ ...current, preset: "custom" }));
      return;
    }
    setState((current) => ({
      ...current,
      preset: preset.key,
      currency: preset.currency,
      unit: preset.unit,
      tier1Rate: String(preset.tier1Rate),
      tierLimit: String(preset.tierLimit),
      tier2Rate: String(preset.tier2Rate),
      passengerRate: String(preset.passengerRate),
    }));
  };

  const activePreset = RATE_PRESETS.find((p) => p.key === state.preset) || null;
  const unit = UNITS[state.unit] || UNITS.km;

  const fmtMoney = useMemo(() => {
    const locale = LOCALES[state.currency] || "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: state.currency,
      maximumFractionDigits: 2,
    });
  }, [state.currency]);

  const fmtDistance = useMemo(
    () => new Intl.NumberFormat(LOCALES[state.currency] || "en-US", { maximumFractionDigits: 2 }),
    [state.currency],
  );

  const money = (value) => (Number.isFinite(value) ? fmtMoney.format(value) : "—");
  const dist = (value) =>
    Number.isFinite(value) ? `${fmtDistance.format(value)} ${unit.short}` : "—";

  const result = useMemo(() => {
    const numbers = {
      distancePerTrip: toNumber(state.distance),
      trips: toNumber(state.trips),
      tier1Rate: toNumber(state.tier1Rate),
      tierLimit: toNumber(state.tierLimit),
      tier2Rate: toNumber(state.tier2Rate),
      priorDistance: toNumber(state.priorDistance),
      passengers: toNumber(state.passengers),
      passengerRate: toNumber(state.passengerRate),
      tolls: toNumber(state.tolls),
      parking: toNumber(state.parking),
      fuelPrice: toNumber(state.fuelPrice),
      fuelEfficiency: toNumber(state.fuelEfficiency),
    };
    if (Object.values(numbers).some((value) => Number.isNaN(value))) {
      return { error: "Every field must be a number — check for stray characters." };
    }
    return computeMileage({ ...numbers, roundTrip: state.roundTrip });
  }, [state]);

  const ok = !result.error;

  const copy = async () => {
    if (!ok) return;
    const text = [
      `Mileage claim — ${dist(result.totalDistance)} over ${result.trips} trip${result.trips > 1 ? "s" : ""}`,
      `Mileage ${money(result.mileageAmount)}`,
      result.passengerAmount > 0 ? `Passengers ${money(result.passengerAmount)}` : "",
      result.extras > 0 ? `Tolls and parking ${money(result.extras)}` : "",
      `Total claim ${money(result.total)}`,
    ]
      .filter(Boolean)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setState(START);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Car className="h-4 w-4" aria-hidden="true" />
          Distance × rate
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Mileage Reimbursement Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn trip distance into a reimbursement claim. Handles two-tier rates such as the UK 45p /
          25p threshold, passenger supplements, tolls and parking, and shows what is left after fuel.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mr-preset">
              Rate preset
            </label>
            <select
              id="mr-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.preset}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {RATE_PRESETS.map((preset) => (
                <option key={preset.key} value={preset.key}>
                  {preset.label}
                </option>
              ))}
              <option value="custom">Custom rate</option>
            </select>
            {activePreset && (
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{activePreset.note}</p>
            )}
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mr-distance">
              One-way distance per trip ({unit.short})
            </label>
            <input
              id="mr-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={state.distance}
              onChange={(event) => setField("distance", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mr-trips">
              Number of trips
            </label>
            <input
              id="mr-trips"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={state.trips}
              onChange={(event) => setField("trips", event.target.value)}
            />
          </div>

          <div className="grid content-end">
            <label className={TOGGLE_CLASS} htmlFor="mr-return">
              <input
                id="mr-return"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={state.roundTrip}
                onChange={(event) => setField("roundTrip", event.target.checked)}
              />
              Return journey (double the distance)
            </label>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mr-unit">
              Distance unit
            </label>
            <select
              id="mr-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.unit}
              onChange={(event) => setField("unit", event.target.value)}
            >
              {Object.values(UNITS).map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mr-rate1">
              Rate per {unit.short}
            </label>
            <input
              id="mr-rate1"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={state.tier1Rate}
              onChange={(event) => setField("tier1Rate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mr-limit">
              Threshold distance (0 = flat rate)
            </label>
            <input
              id="mr-limit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={state.tierLimit}
              onChange={(event) => setField("tierLimit", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mr-rate2">
              Rate beyond the threshold
            </label>
            <input
              id="mr-rate2"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={state.tier2Rate}
              onChange={(event) => setField("tier2Rate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mr-prior">
              Distance already claimed this year
            </label>
            <input
              id="mr-prior"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={state.priorDistance}
              onChange={(event) => setField("priorDistance", event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mr-passengers">
              Passengers carried
            </label>
            <input
              id="mr-passengers"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={state.passengers}
              onChange={(event) => setField("passengers", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mr-prate">
              Rate per passenger per {unit.short}
            </label>
            <input
              id="mr-prate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={state.passengerRate}
              onChange={(event) => setField("passengerRate", event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mr-tolls">
              Tolls paid
            </label>
            <input
              id="mr-tolls"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={state.tolls}
              onChange={(event) => setField("tolls", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mr-parking">
              Parking paid
            </label>
            <input
              id="mr-parking"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={state.parking}
              onChange={(event) => setField("parking", event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mr-fuelprice">
              Fuel price per litre or gallon
            </label>
            <input
              id="mr-fuelprice"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={state.fuelPrice}
              onChange={(event) => setField("fuelPrice", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mr-fueleff">
              {unit.short} per litre or gallon
            </label>
            <input
              id="mr-fueleff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={state.fuelEfficiency}
              onChange={(event) => setField("fuelEfficiency", event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mr-currency">
              Currency
            </label>
            <select
              id="mr-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.currency}
              onChange={(event) => setField("currency", event.target.value)}
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="GBP">Pound Sterling (£)</option>
              <option value="USD">US Dollar ($)</option>
            </select>
          </div>
        </div>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total to claim
            </p>
            <p className="mt-1 text-3xl font-semibold leading-tight text-[var(--primary)] sm:text-4xl">
              {ok ? money(result.total) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${dist(result.totalDistance)} · ${money(result.effectiveRate)} per ${unit.short} all in`
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copy}
              disabled={!ok}
              aria-label="Copy the mileage claim"
              className={`${GHOST_BTN} disabled:opacity-40`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ["Total distance", ok ? dist(result.totalDistance) : "—"],
            ["At the first rate", ok ? `${dist(result.tier1Distance)} → ${money(result.tier1Amount)}` : "—"],
            ["Above the threshold", ok ? `${dist(result.tier2Distance)} → ${money(result.tier2Amount)}` : "—"],
            ["Mileage payment", ok ? money(result.mileageAmount) : "—"],
            ["Passenger supplement", ok ? money(result.passengerAmount) : "—"],
            ["Tolls and parking", ok ? money(result.extras) : "—"],
            ["Fuel used at your rate", ok && result.fuelCost !== null ? money(result.fuelCost) : "—"],
            [
              "Left over after fuel",
              ok && result.marginOverFuel !== null ? money(result.marginOverFuel) : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md bg-[var(--muted)] px-3 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {label}
              </dt>
              <dd className="mt-1 text-base font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.crossedThreshold && (
          <p className="mt-4 rounded-md bg-[var(--info-soft)] px-3 py-2 text-sm font-medium text-[var(--foreground)]">
            This claim crosses the threshold: {dist(result.tier2Distance)} of it is paid at the lower
            rate.
          </p>
        )}
        {ok && !result.crossedThreshold && result.thresholdHeadroom !== null && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {dist(result.thresholdHeadroom)} still available at the higher rate this year.
          </p>
        )}
        {ok && result.marginOverFuel !== null && result.marginOverFuel < 0 && (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]"
          >
            The mileage payment does not even cover the fuel at the price and efficiency you entered.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Rates change: HMRC&apos;s approved amounts and the IRS standard mileage rate are published
        separately each year, and India has no statutory per-kilometre figure at all — employers set
        their own. This page is informational, not tax advice; check the rate in your policy or the
        current notice before you submit a claim.
      </p>
    </main>
  );
}
