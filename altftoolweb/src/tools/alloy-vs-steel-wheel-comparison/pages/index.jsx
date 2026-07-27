"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Disc3, RotateCcw } from "lucide-react";

import { WHEEL_COUNTS, compareWheels } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const kg = (value) => (Number.isFinite(value) ? `${NUM2.format(value)} kg` : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM3.format(value)}%` : DASH);

const DEFAULTS = {
  kerb: "1100",
  wheelCount: "4",
  steelWeight: "8.5",
  alloyWeight: "7",
  steelPrice: "2500",
  alloyPrice: "6000",
  annualKm: "12000",
  mileage: "18",
  fuelPrice: "105",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [kerb, setKerb] = useState(DEFAULTS.kerb);
  const [wheelCount, setWheelCount] = useState(DEFAULTS.wheelCount);
  const [steelWeight, setSteelWeight] = useState(DEFAULTS.steelWeight);
  const [alloyWeight, setAlloyWeight] = useState(DEFAULTS.alloyWeight);
  const [steelPrice, setSteelPrice] = useState(DEFAULTS.steelPrice);
  const [alloyPrice, setAlloyPrice] = useState(DEFAULTS.alloyPrice);
  const [annualKm, setAnnualKm] = useState(DEFAULTS.annualKm);
  const [mileage, setMileage] = useState(DEFAULTS.mileage);
  const [fuelPrice, setFuelPrice] = useState(DEFAULTS.fuelPrice);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareWheels({
        kerbWeightKg: toNumber(kerb),
        wheelCount: toNumber(wheelCount),
        steelWeightKg: toNumber(steelWeight),
        alloyWeightKg: toNumber(alloyWeight),
        steelPrice: toNumber(steelPrice),
        alloyPrice: toNumber(alloyPrice),
        annualKm: toNumber(annualKm),
        mileageKmPerL: toNumber(mileage),
        fuelPricePerL: toNumber(fuelPrice),
      }),
    [kerb, wheelCount, steelWeight, alloyWeight, steelPrice, alloyPrice, annualKm, mileage, fuelPrice],
  );

  const hasError = Boolean(result.error);

  const paybackText = hasError
    ? DASH
    : result.paybackYears === null
      ? "Never"
      : result.paybackYears === 0
        ? "Immediate"
        : `${NUM2.format(result.paybackYears)} years`;

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Alloy vs Steel Wheel Comparison",
      `Wheels compared: ${result.wheelCount}`,
      `Steel set: ${kg(result.steelSetWeight)} · ${money(result.steelSetPrice)}`,
      `Alloy set: ${kg(result.alloySetWeight)} · ${money(result.alloySetPrice)}`,
      `Weight saved: ${kg(result.weightSavedKg)} (${kg(result.effectiveSavedKg)} counting rotating inertia)`,
      `Vehicle mass change: ${pct(result.massReductionPct)}`,
      `Fuel economy change: ${pct(result.economyGainPct)} (${NUM2.format(result.mileageBefore)} to ${NUM2.format(result.mileageAfter)} km/l)`,
      `Annual fuel saving: ${money(result.annualFuelSaving)}`,
      `Price premium: ${money(result.pricePremium)}`,
      `Payback: ${paybackText}`,
    ].join("\n");
  }, [hasError, result, paybackText]);

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
    setKerb(DEFAULTS.kerb);
    setWheelCount(DEFAULTS.wheelCount);
    setSteelWeight(DEFAULTS.steelWeight);
    setAlloyWeight(DEFAULTS.alloyWeight);
    setSteelPrice(DEFAULTS.steelPrice);
    setAlloyPrice(DEFAULTS.alloyPrice);
    setAnnualKm(DEFAULTS.annualKm);
    setMileage(DEFAULTS.mileage);
    setFuelPrice(DEFAULTS.fuelPrice);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Disc3 className="h-4 w-4" aria-hidden="true" />
          Wheels
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Alloy vs Steel Wheel Comparison
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          See exactly how much unsprung weight an alloy set actually saves, what that is worth in
          fuel, and how many years it would take the saving to repay the price premium.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wheel-kerb">
              Vehicle kerb weight (kg)
            </label>
            <input
              id="wheel-kerb"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="10"
              value={kerb}
              onChange={(event) => setKerb(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wheel-count">
              Wheels being changed
            </label>
            <select
              id="wheel-count"
              className={`mt-2 ${INPUT_CLASS}`}
              value={wheelCount}
              onChange={(event) => setWheelCount(event.target.value)}
            >
              {WHEEL_COUNTS.map((value) => (
                <option key={value} value={String(value)}>
                  {value === 4 ? "4 road wheels" : "5 (with matching spare)"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wheel-steel-weight">
              Steel wheel weight, each (kg)
            </label>
            <input
              id="wheel-steel-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.1"
              value={steelWeight}
              onChange={(event) => setSteelWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wheel-alloy-weight">
              Alloy wheel weight, each (kg)
            </label>
            <input
              id="wheel-alloy-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.1"
              value={alloyWeight}
              onChange={(event) => setAlloyWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wheel-steel-price">
              Steel wheel price, each (INR)
            </label>
            <input
              id="wheel-steel-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={steelPrice}
              onChange={(event) => setSteelPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wheel-alloy-price">
              Alloy wheel price, each (INR)
            </label>
            <input
              id="wheel-alloy-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={alloyPrice}
              onChange={(event) => setAlloyPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wheel-annual">
              Annual running (km)
            </label>
            <input
              id="wheel-annual"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              value={annualKm}
              onChange={(event) => setAnnualKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wheel-mileage">
              Current mileage (km per litre)
            </label>
            <input
              id="wheel-mileage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.5"
              value={mileage}
              onChange={(event) => setMileage(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wheel-fuel">
              Fuel price (INR per litre)
            </label>
            <input
              id="wheel-fuel"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={fuelPrice}
              onChange={(event) => setFuelPrice(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
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
              Weight saved by the alloy set
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : kg(result.weightSavedKg)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${kg(result.effectiveSavedKg)} once rotating inertia is counted · ${result.lighterSet === "alloy" ? "alloys are lighter" : result.lighterSet === "steel" ? "steel is lighter here" : "identical weight"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy wheel comparison result"
              className={GHOST_BTN}
              disabled={hasError}
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
          {[
            ["Steel set weight", hasError ? DASH : kg(result.steelSetWeight)],
            ["Alloy set weight", hasError ? DASH : kg(result.alloySetWeight)],
            ["Change in vehicle mass", hasError ? DASH : pct(result.massReductionPct)],
            ["Change in fuel economy", hasError ? DASH : pct(result.economyGainPct)],
            [
              "Mileage before / after",
              hasError
                ? DASH
                : `${NUM2.format(result.mileageBefore)} → ${NUM2.format(result.mileageAfter)} km/l`,
            ],
            ["Fuel saved per year", hasError ? DASH : `${NUM2.format(result.litresSaved)} L`],
            ["Fuel money saved per year", hasError ? DASH : money(result.annualFuelSaving)],
            ["Steel set price", hasError ? DASH : money(result.steelSetPrice)],
            ["Alloy set price", hasError ? DASH : money(result.alloySetPrice)],
            ["Price premium for alloys", hasError ? DASH : money(result.pricePremium)],
            ["Payback from fuel saving", paybackText],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.paybackNote ? (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.paybackNote}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What each material is good at</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Aspect
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Steel
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Alloy
                </th>
              </tr>
            </thead>
            <tbody className="text-[var(--muted-foreground)]">
              {[
                ["Weight", "Heavier for the same size", "Usually lighter, but not always"],
                ["Pothole damage", "Bends, can be hammered back", "Cracks; repair is specialist work"],
                ["Corrosion", "Rusts where paint chips", "Does not rust, but kerb rash shows"],
                ["Brake cooling", "Solid disc traps heat", "Open spokes let heat escape"],
                ["Cost", "Cheaper to buy and replace", "Higher purchase and repair cost"],
              ].map(([aspect, steel, alloy]) => (
                <tr key={aspect} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold text-[var(--foreground)]">{aspect}</td>
                  <td className="py-2 pr-3">{steel}</td>
                  <td className="py-2">{alloy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The fuel figure uses the standard mass-reduction rule of thumb and assumes everything else
        stays the same. A wider tyre or a larger rim fitted at the same time will usually cost more
        fuel than the lighter wheel saves.
      </p>
    </main>
  );
}
