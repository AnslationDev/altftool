"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Truck } from "lucide-react";

import {
  DEFAULT_TRUCK_PAYLOAD_T,
  DEFAULT_TRUCK_VOLUME_M3,
  MATERIALS,
  estimateWasteRemoval,
  volumeFromArea,
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
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : DASH);
const num2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);

const DEFAULTS = {
  mode: "area",
  material: "concrete",
  volume: "6",
  area: "40",
  thickness: "150",
  truckVolume: String(DEFAULT_TRUCK_VOLUME_M3),
  truckPayload: String(DEFAULT_TRUCK_PAYLOAD_T),
  hirePerTrip: "1500",
  distance: "12",
  ratePerKm: "35",
  tipping: "300",
  loaders: "3",
  loadingDays: "1.5",
  wage: "700",
  permit: "500",
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
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const inPlaceVolume =
    values.mode === "area"
      ? volumeFromArea(toNum(values.area), toNum(values.thickness))
      : toNum(values.volume);

  const result = useMemo(
    () =>
      estimateWasteRemoval({
        inPlaceVolumeM3: inPlaceVolume,
        materialKey: values.material,
        truckVolumeM3: toNum(values.truckVolume),
        truckPayloadT: toNum(values.truckPayload),
        hirePerTrip: toNum(values.hirePerTrip),
        distanceKm: toNum(values.distance),
        ratePerKm: toNum(values.ratePerKm),
        tippingFeePerTonne: toNum(values.tipping),
        loaders: toNum(values.loaders),
        loadingDays: toNum(values.loadingDays),
        wagePerDay: toNum(values.wage),
        permitFee: toNum(values.permit),
      }),
    [values, inPlaceVolume],
  );

  const hasError = Boolean(result.error);

  const rows = hasError
    ? [
        ["Volume in place", DASH],
        ["Loose volume after bulking", DASH],
        ["Estimated weight", DASH],
        ["Truckloads by body volume", DASH],
        ["Truckloads by payload", DASH],
        ["Trips needed", DASH],
        ...["Trip hire", "Distance", "Tipping fee", "Loading labour", "Permit or society charge"].map(
          (label) => [label, DASH],
        ),
        ["Cost per cubic metre in place", DASH],
        ["Cost per tonne", DASH],
      ]
    : [
        ["Volume in place", `${num2(result.inPlaceVolumeM3)} m³`],
        ["Loose volume after bulking", `${num2(result.looseVolumeM3)} m³`],
        ["Estimated weight", `${num2(result.tonnes)} t`],
        ["Truckloads by body volume", num2(result.tripsByVolume)],
        ["Truckloads by payload", num2(result.tripsByWeight)],
        ["Trips needed", `${result.trips}`],
        ...result.items.map(([label, value]) => [label, money(value)]),
        ["Cost per cubic metre in place", money2(result.costPerInPlaceM3)],
        ["Cost per tonne", money2(result.costPerTonne)],
      ];

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Construction Waste Cost Estimator",
      `Total removal cost: ${money(result.total)}`,
      ...rows.map(([label, value]) => `${label}: ${value}`),
      ...result.notes.map((note) => `Note: ${note}`),
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
    setValues(DEFAULTS);
    setCopied(false);
  };

  const sizeFields =
    values.mode === "area"
      ? [
          ["cwc-area", "Area being broken out (m²)", "area", "1"],
          ["cwc-thickness", "Thickness or depth (mm)", "thickness", "10"],
        ]
      : [["cwc-volume", "Debris volume in place (m³)", "volume", "0.5"]];

  const truckFields = [
    ["cwc-truckvol", "Tipper body volume (m³)", "truckVolume", "0.5"],
    ["cwc-truckpay", "Tipper payload (tonnes)", "truckPayload", "0.5"],
    ["cwc-hire", "Hire per trip (₹)", "hirePerTrip", "100"],
    ["cwc-distance", "Distance to the facility, one way (km)", "distance", "1"],
    ["cwc-rate", "Running rate (₹ per km)", "ratePerKm", "5"],
    ["cwc-tipping", "Tipping fee (₹ per tonne)", "tipping", "25"],
  ];

  const labourFields = [
    ["cwc-loaders", "Loaders", "loaders", "1"],
    ["cwc-days", "Days of loading", "loadingDays", "0.5"],
    ["cwc-wage", "Wage per person per day (₹)", "wage", "50"],
    ["cwc-permit", "Permit or society charge (₹)", "permit", "100"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Truck className="h-4 w-4" aria-hidden="true" />
          Debris removal
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Construction Waste Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Broken material takes up more room than it did in place, and a tipper fills on volume or
          on weight — whichever comes first. Both are what turn a small demolition into three trips.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cwc-material">
              Debris type
            </label>
            <select
              id="cwc-material"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.material}
              onChange={set("material")}
            >
              {MATERIALS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cwc-mode">
              How you measured it
            </label>
            <select
              id="cwc-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.mode}
              onChange={set("mode")}
            >
              <option value="area">Area and thickness</option>
              <option value="volume">Volume directly</option>
            </select>
          </div>
          {sizeFields.map(([id, label, key, step]) => (
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
                value={values[key]}
                onChange={set(key)}
              />
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-[var(--border)] pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
            Truck and haul
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {truckFields.map(([id, label, key, step]) => (
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
                  value={values[key]}
                  onChange={set(key)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 border-t border-[var(--border)] pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
            Labour and charges
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {labourFields.map(([id, label, key, step]) => (
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
                  value={values[key]}
                  onChange={set(key)}
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
              Total debris removal cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the estimate."
                : `${result.trips} trip${result.trips === 1 ? "" : "s"} carrying about ${num2(result.tonnes)} tonnes`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy debris removal estimate"
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
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="font-semibold">Total</dt>
            <dd className="text-right font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.total)}
            </dd>
          </div>
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Bulking factors and densities are typical values for common debris and vary with how the
        material is broken and how wet it is — weigh a loaded trip if precision matters. C&D waste
        must go to an authorised processing facility; the duty to segregate and hand it over sits
        with whoever generates it.
      </p>
    </main>
  );
}
