"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Luggage, RotateCcw } from "lucide-react";

import {
  CARGO_ITEMS,
  PACKING_EFFICIENCY,
  ROOF_BOX_SPEED_LIMIT_KMH,
  computeRoofBoxPlan,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const DASH = "—";

const PACKING_OPTIONS = [
  { id: "rigid", label: "Hard suitcases", value: PACKING_EFFICIENCY.rigid },
  { id: "mixed", label: "Mixed bags", value: PACKING_EFFICIENCY.mixed },
  { id: "soft", label: "Soft duffels", value: PACKING_EFFICIENCY.soft },
];

const DEFAULTS = {
  roofLimit: "75",
  rack: "4",
  boxEmpty: "15",
  boxVolume: "400",
  boxPayload: "50",
  extraVolume: "0",
  extraWeight: "0",
  packing: "mixed",
  tripKm: "800",
  kmpl: "15",
  fuelPrice: "100",
  counts: { medium: "2", duffel: "2" },
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
  if (text === "") return 0;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [roofLimit, setRoofLimit] = useState(DEFAULTS.roofLimit);
  const [rack, setRack] = useState(DEFAULTS.rack);
  const [boxEmpty, setBoxEmpty] = useState(DEFAULTS.boxEmpty);
  const [boxVolume, setBoxVolume] = useState(DEFAULTS.boxVolume);
  const [boxPayload, setBoxPayload] = useState(DEFAULTS.boxPayload);
  const [counts, setCounts] = useState(DEFAULTS.counts);
  const [extraVolume, setExtraVolume] = useState(DEFAULTS.extraVolume);
  const [extraWeight, setExtraWeight] = useState(DEFAULTS.extraWeight);
  const [packing, setPacking] = useState(DEFAULTS.packing);
  const [tripKm, setTripKm] = useState(DEFAULTS.tripKm);
  const [kmpl, setKmpl] = useState(DEFAULTS.kmpl);
  const [fuelPrice, setFuelPrice] = useState(DEFAULTS.fuelPrice);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const itemCounts = {};
    for (const item of CARGO_ITEMS) itemCounts[item.id] = toNumber(counts[item.id] ?? "0");
    return computeRoofBoxPlan({
      roofLoadLimitKg: toNumber(roofLimit),
      rackWeightKg: toNumber(rack),
      boxEmptyWeightKg: toNumber(boxEmpty),
      boxVolumeL: toNumber(boxVolume),
      boxMaxPayloadKg: toNumber(boxPayload),
      itemCounts,
      extraVolumeL: toNumber(extraVolume),
      extraWeightKg: toNumber(extraWeight),
      packingEfficiency: PACKING_EFFICIENCY[packing],
      tripKm: toNumber(tripKm),
      baselineKmpl: toNumber(kmpl),
      fuelPrice: toNumber(fuelPrice),
    });
  }, [
    roofLimit,
    rack,
    boxEmpty,
    boxVolume,
    boxPayload,
    counts,
    extraVolume,
    extraWeight,
    packing,
    tripKm,
    kmpl,
    fuelPrice,
  ]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Roof Box Capacity Plan",
      `Load: ${NUM.format(result.cargoVolumeL)} L / ${NUM1.format(result.cargoWeightKg)} kg`,
      `Usable box volume: ${NUM.format(result.usableVolumeL)} L (${NUM.format(result.volumeUsedPct)}% used)`,
      `Cargo weight allowance: ${NUM1.format(result.cargoAllowanceKg)} kg, set by the ${result.weightLimitedBy} (${NUM.format(result.weightUsedPct)}% used)`,
      `Total weight on the roof: ${NUM1.format(result.totalRoofLoadKg)} kg`,
      `Verdict: ${result.fits ? "fits" : "does not fit"} — limited by ${result.limitingFactor}`,
      result.fuel
        ? `Fuel penalty: +${NUM1.format(result.fuel.extraLitres)} L (${INR.format(result.fuel.extraCost)}) over the trip`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
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
    setRoofLimit(DEFAULTS.roofLimit);
    setRack(DEFAULTS.rack);
    setBoxEmpty(DEFAULTS.boxEmpty);
    setBoxVolume(DEFAULTS.boxVolume);
    setBoxPayload(DEFAULTS.boxPayload);
    setCounts(DEFAULTS.counts);
    setExtraVolume(DEFAULTS.extraVolume);
    setExtraWeight(DEFAULTS.extraWeight);
    setPacking(DEFAULTS.packing);
    setTripKm(DEFAULTS.tripKm);
    setKmpl(DEFAULTS.kmpl);
    setFuelPrice(DEFAULTS.fuelPrice);
    setCopied(false);
  };

  // Item counts are whole physical items — truncate any typed or pasted decimal
  // part so the field never shows a value the packing-list math would silently
  // floor away (e.g. "2.5" becomes "2", not the "25" a naive digit-strip would give).
  const setCount = (id, value) => {
    const whole = String(value).split(".")[0].replace(/[^0-9]/g, "");
    setCounts((prev) => ({ ...prev, [id]: whole }));
  };

  const rows = hasError
    ? [
        ["Packed volume", DASH],
        ["Usable box volume", DASH],
        ["Volume used", DASH],
        ["Packed weight", DASH],
        ["Weight allowed inside the box", DASH],
        ["Weight used", DASH],
        ["Total weight on the roof", DASH],
        ["Load density", DASH],
        ["Extra fuel for the trip", DASH],
        ["Mileage with the box fitted", DASH],
      ]
    : [
        ["Packed volume", `${NUM.format(result.cargoVolumeL)} L`],
        ["Usable box volume", `${NUM.format(result.usableVolumeL)} L of ${NUM.format(toNumber(boxVolume))} L gross`],
        ["Volume used", `${NUM.format(result.volumeUsedPct)}%`],
        ["Packed weight", `${NUM1.format(result.cargoWeightKg)} kg`],
        [
          "Weight allowed inside the box",
          `${NUM1.format(result.cargoAllowanceKg)} kg (${result.weightLimitedBy})`,
        ],
        ["Weight used", `${NUM.format(result.weightUsedPct)}%`],
        [
          "Total weight on the roof",
          `${NUM1.format(result.totalRoofLoadKg)} kg of ${NUM1.format(toNumber(roofLimit))} kg allowed`,
        ],
        ["Load density", `${NUM1.format(result.cargoDensityKgPer100L)} kg per 100 L`],
        [
          "Extra fuel for the trip",
          result.fuel
            ? `${NUM1.format(result.fuel.extraLitres)} L · ${INR.format(result.fuel.extraCost)}`
            : "Add trip distance and mileage",
        ],
        [
          "Mileage with the box fitted",
          result.fuel ? `${NUM1.format(result.fuel.effectiveKmpl)} km/l` : DASH,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Luggage className="h-4 w-4" aria-hidden="true" />
          Road trip packing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Roof Box Capacity Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Check a packing list against both ceilings that matter — the litres a box realistically
          swallows and the kilograms your car&apos;s roof is rated for while moving.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Car and box
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="roofbox-limit">
              Dynamic roof load limit (kg)
            </label>
            <input
              id="roofbox-limit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={roofLimit}
              onChange={(event) => setRoofLimit(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              From the owner&apos;s manual — usually 50–100 kg.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="roofbox-rack">
              Crossbars / rails weight (kg)
            </label>
            <input
              id="roofbox-rack"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={rack}
              onChange={(event) => setRack(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="roofbox-empty">
              Empty box weight (kg)
            </label>
            <input
              id="roofbox-empty"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={boxEmpty}
              onChange={(event) => setBoxEmpty(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="roofbox-volume">
              Box volume (litres)
            </label>
            <input
              id="roofbox-volume"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="10"
              value={boxVolume}
              onChange={(event) => setBoxVolume(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="roofbox-payload">
              Box max load inside (kg)
            </label>
            <input
              id="roofbox-payload"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={boxPayload}
              onChange={(event) => setBoxPayload(event.target.value)}
            />
          </div>
          <div>
            <span className={LABEL_CLASS}>How you pack</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {PACKING_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={packing === option.id}
                  onClick={() => setPacking(option.id)}
                  className={`min-h-11 flex-1 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    packing === option.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {NUM.format(PACKING_EFFICIENCY[packing] * 100)}% of gross volume is usable.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          What goes in the box
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {CARGO_ITEMS.map((item) => (
            <div key={item.id}>
              <label className={LABEL_CLASS} htmlFor={`roofbox-item-${item.id}`}>
                {item.label}
              </label>
              <input
                id={`roofbox-item-${item.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={counts[item.id] ?? "0"}
                onChange={(event) => setCount(item.id, event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {item.litres} L · {item.kg} kg each
              </p>
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS} htmlFor="roofbox-extra-volume">
              Other items — volume (L)
            </label>
            <input
              id="roofbox-extra-volume"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={extraVolume}
              onChange={(event) => setExtraVolume(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="roofbox-extra-weight">
              Other items — weight (kg)
            </label>
            <input
              id="roofbox-extra-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={extraWeight}
              onChange={(event) => setExtraWeight(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Trip (optional, for the fuel penalty)
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="roofbox-trip">
              Trip distance (km)
            </label>
            <input
              id="roofbox-trip"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={tripKm}
              onChange={(event) => setTripKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="roofbox-kmpl">
              Highway mileage without the box (km/l)
            </label>
            <input
              id="roofbox-kmpl"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={kmpl}
              onChange={(event) => setKmpl(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="roofbox-fuel-price">
              Fuel price (₹ per litre)
            </label>
            <input
              id="roofbox-fuel-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={fuelPrice}
              onChange={(event) => setFuelPrice(event.target.value)}
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

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Box filled to
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError || !result.fits ? "text-[var(--danger)]" : "text-[var(--primary)]"
              }`}
            >
              {hasError ? DASH : `${NUM.format(result.fillPct)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a plan."
                : result.fits
                  ? `This load fits — limited by ${result.limitingFactor}.`
                  : `Too much for this box — over on ${result.limitingFactor}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy roof box capacity plan"
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

        {!hasError && result.lines.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[22rem] border-collapse text-sm">
              <caption className="pb-2 text-left text-xs text-[var(--muted-foreground)]">
                Packing list breakdown
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Item
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Qty
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Litres
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Kg
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line) => (
                  <tr key={line.id} className="border-b border-[var(--border)]">
                    <td className="py-2 pr-3">{line.label}</td>
                    <td className="py-2 pr-3 text-right">{line.count}</td>
                    <td className="py-2 pr-3 text-right">{NUM.format(line.litres)}</td>
                    <td className="py-2 text-right">{NUM1.format(line.kg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        Informational planning aid. The dynamic roof load in your owner&apos;s manual is the binding
        figure, it already includes the bars and the box, and it applies while the car is moving —
        a parked roof tent load is a different, higher number. Stay under{" "}
        {ROOF_BOX_SPEED_LIMIT_KMH} km/h and re-check the straps after the first hour.
      </p>
    </main>
  );
}
