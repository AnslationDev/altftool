"use client";

import { useMemo, useState } from "react";
import { Check, CircleDollarSign, Copy, RotateCcw } from "lucide-react";

import { MAX_TYRES_PER_SET, compareTyreCostPerKm } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR_PAISE = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const KM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const rate = (value) => INR_PAISE.format(Number.isFinite(value) ? value : 0);
const km = (value) => `${KM.format(Number.isFinite(value) ? value : 0)} km`;

const DASH = "—";

const DEFAULTS = {
  tyresPerSet: "4",
  ownershipKm: "60000",
  fuelPrice: "100",
  aName: "Budget tyre",
  aPrice: "4500",
  aLife: "45000",
  aFitting: "800",
  aKmpl: "18",
  bName: "Premium tyre",
  bPrice: "6200",
  bLife: "65000",
  bFitting: "800",
  bKmpl: "18.4",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const num = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [tyresPerSet, setTyresPerSet] = useState(DEFAULTS.tyresPerSet);
  const [ownershipKm, setOwnershipKm] = useState(DEFAULTS.ownershipKm);
  const [fuelPrice, setFuelPrice] = useState(DEFAULTS.fuelPrice);
  const [aName, setAName] = useState(DEFAULTS.aName);
  const [aPrice, setAPrice] = useState(DEFAULTS.aPrice);
  const [aLife, setALife] = useState(DEFAULTS.aLife);
  const [aFitting, setAFitting] = useState(DEFAULTS.aFitting);
  const [aKmpl, setAKmpl] = useState(DEFAULTS.aKmpl);
  const [bName, setBName] = useState(DEFAULTS.bName);
  const [bPrice, setBPrice] = useState(DEFAULTS.bPrice);
  const [bLife, setBLife] = useState(DEFAULTS.bLife);
  const [bFitting, setBFitting] = useState(DEFAULTS.bFitting);
  const [bKmpl, setBKmpl] = useState(DEFAULTS.bKmpl);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareTyreCostPerKm({
        optionA: {
          name: aName.trim() || "Option A",
          pricePerTyre: num(aPrice),
          lifeKm: num(aLife),
          fittingCost: num(aFitting),
          kmPerLitre: num(aKmpl),
        },
        optionB: {
          name: bName.trim() || "Option B",
          pricePerTyre: num(bPrice),
          lifeKm: num(bLife),
          fittingCost: num(bFitting),
          kmPerLitre: num(bKmpl),
        },
        tyresPerSet: num(tyresPerSet),
        ownershipKm: num(ownershipKm),
        fuelPricePerLitre: num(fuelPrice) || 0,
      }),
    [
      aName, aPrice, aLife, aFitting, aKmpl,
      bName, bPrice, bLife, bFitting, bKmpl,
      tyresPerSet, ownershipKm, fuelPrice,
    ],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Tyre Cost Per KM Calculator",
      `${result.a.name}: set ${money(result.a.setCost)}, ${rate(result.a.tyreCostPerKm)}/km tyre + ${rate(result.a.fuelCostPerKm)}/km fuel = ${rate(result.a.totalCostPerKm)}/km`,
      `${result.b.name}: set ${money(result.b.setCost)}, ${rate(result.b.tyreCostPerKm)}/km tyre + ${rate(result.b.fuelCostPerKm)}/km fuel = ${rate(result.b.totalCostPerKm)}/km`,
      result.tie
        ? "Both options cost the same per kilometre."
        : `Cheaper per km: ${result.cheaperName} by ${rate(result.savingPerKm)} — ${money(result.savingOverOwnership)} over ${km(result.ownershipKm)}`,
      result.breakEvenLifeKm
        ? `${result.breakEvenForName} would need ${km(result.breakEvenLifeKm)} of life to draw level.`
        : "",
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
    setTyresPerSet(DEFAULTS.tyresPerSet);
    setOwnershipKm(DEFAULTS.ownershipKm);
    setFuelPrice(DEFAULTS.fuelPrice);
    setAName(DEFAULTS.aName);
    setAPrice(DEFAULTS.aPrice);
    setALife(DEFAULTS.aLife);
    setAFitting(DEFAULTS.aFitting);
    setAKmpl(DEFAULTS.aKmpl);
    setBName(DEFAULTS.bName);
    setBPrice(DEFAULTS.bPrice);
    setBLife(DEFAULTS.bLife);
    setBFitting(DEFAULTS.bFitting);
    setBKmpl(DEFAULTS.bKmpl);
    setCopied(false);
  };

  const optionFields = [
    {
      key: "a",
      title: "Option A",
      name: aName, setName: setAName,
      price: aPrice, setPrice: setAPrice,
      life: aLife, setLife: setALife,
      fitting: aFitting, setFitting: setAFitting,
      kmpl: aKmpl, setKmpl: setAKmpl,
    },
    {
      key: "b",
      title: "Option B",
      name: bName, setName: setBName,
      price: bPrice, setPrice: setBPrice,
      life: bLife, setLife: setBLife,
      fitting: bFitting, setFitting: setBFitting,
      kmpl: bKmpl, setKmpl: setBKmpl,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CircleDollarSign className="h-4 w-4" aria-hidden="true" />
          Running cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Tyre Cost Per KM Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fitted set price divided by real tread life, plus the fuel-cost gap between the two
          tyres — so the cheaper sticker and the cheaper tyre stop being the same question.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Shared assumptions</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-count">
              Tyres per set
            </label>
            <input
              id="tc-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_TYRES_PER_SET}
              step="1"
              value={tyresPerSet}
              onChange={(event) => setTyresPerSet(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-own">
              Distance you plan to cover (km)
            </label>
            <input
              id="tc-own"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1000"
              value={ownershipKm}
              onChange={(event) => setOwnershipKm(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tc-fuel">
              Fuel price (INR per litre) — leave 0 to ignore fuel
            </label>
            <input
              id="tc-fuel"
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

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {optionFields.map((field) => (
          <section key={field.key} className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">{field.title}</h2>
            <div className="mt-3 grid gap-4">
              <div>
                <label className={LABEL_CLASS} htmlFor={`tc-${field.key}-name`}>
                  Label
                </label>
                <input
                  id={`tc-${field.key}-name`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={field.name}
                  onChange={(event) => field.setName(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`tc-${field.key}-price`}>
                  Price per tyre (INR)
                </label>
                <input
                  id={`tc-${field.key}-price`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="100"
                  value={field.price}
                  onChange={(event) => field.setPrice(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`tc-${field.key}-life`}>
                  Expected life (km)
                </label>
                <input
                  id={`tc-${field.key}-life`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1000"
                  value={field.life}
                  onChange={(event) => field.setLife(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`tc-${field.key}-fit`}>
                  Fitting, balancing &amp; disposal (INR per set)
                </label>
                <input
                  id={`tc-${field.key}-fit`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="50"
                  value={field.fitting}
                  onChange={(event) => field.setFitting(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`tc-${field.key}-kmpl`}>
                  Real-world mileage on these tyres (km/l)
                </label>
                <input
                  id={`tc-${field.key}-kmpl`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={field.kmpl}
                  onChange={(event) => field.setKmpl(event.target.value)}
                />
              </div>
            </div>
          </section>
        ))}
      </div>

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
              {ok && !result.tie ? `Cheaper per km — ${result.cheaperName}` : "Cheaper per km"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? (result.tie ? "Level" : rate(result.savingPerKm)) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.tie
                  ? "Both options work out the same per kilometre"
                  : `Saves ${money(result.savingOverOwnership)} over ${km(result.ownershipKm)}`
                : "Fix the inputs above to see a figure"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy tyre cost per kilometre comparison"
              className={GHOST_BTN}
              disabled={!ok}
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

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Figure</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">{ok ? result.a.name : "Option A"}</th>
                <th scope="col" className="py-2 text-right font-semibold">{ok ? result.b.name : "Option B"}</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Fitted set cost", ok ? money(result.a.setCost) : DASH, ok ? money(result.b.setCost) : DASH],
                ["Tyre cost per km", ok ? rate(result.a.tyreCostPerKm) : DASH, ok ? rate(result.b.tyreCostPerKm) : DASH],
                ["Fuel cost per km", ok ? rate(result.a.fuelCostPerKm) : DASH, ok ? rate(result.b.fuelCostPerKm) : DASH],
                ["Total cost per km", ok ? rate(result.a.totalCostPerKm) : DASH, ok ? rate(result.b.totalCostPerKm) : DASH],
                [
                  "Tyre cost per 10,000 km",
                  ok ? money(result.a.costPerReferenceDistance) : DASH,
                  ok ? money(result.b.costPerReferenceDistance) : DASH,
                ],
                [
                  "Sets needed for the distance",
                  ok ? NUM2.format(result.a.setsOverOwnership) : DASH,
                  ok ? NUM2.format(result.b.setsOverOwnership) : DASH,
                ],
                [
                  "Tyre spend over the distance",
                  ok ? money(result.a.tyreSpendOverOwnership) : DASH,
                  ok ? money(result.b.tyreSpendOverOwnership) : DASH,
                ],
                [
                  "Fuel spend over the distance",
                  ok ? money(result.a.fuelSpendOverOwnership) : DASH,
                  ok ? money(result.b.fuelSpendOverOwnership) : DASH,
                ],
                [
                  "Total spend over the distance",
                  ok ? money(result.a.totalSpendOverOwnership) : DASH,
                  ok ? money(result.b.totalSpendOverOwnership) : DASH,
                ],
              ].map(([label, left, right]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{label}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{left}</td>
                  <td className="py-2 text-right font-semibold">{right}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Break-even life to draw level",
              ok && result.breakEvenLifeKm
                ? `${result.breakEvenForName} would need ${km(result.breakEvenLifeKm)}`
                : DASH,
            ],
            [
              "Saving per 10,000 km",
              ok && !result.tie ? money(result.savingPerReferenceDistance) : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. Tread life depends far more on pressure, alignment, rotation and driving
        style than on the brand, so treat any quoted life as a planning figure and re-run the
        comparison with your own measured numbers once a set has worn out.
      </p>
    </main>
  );
}
