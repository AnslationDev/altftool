"use client";

import { useMemo, useState } from "react";
import { Copy, Fuel, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const KM_PER_MILE = 1.609344;
const LITRES_PER_US_GALLON = 3.785411784;
const LITRES_PER_UK_GALLON = 4.54609;

const DISTANCE_UNITS = [
  { id: "km", label: "Kilometres", toKm: 1, short: "km" },
  { id: "mi", label: "Miles", toKm: KM_PER_MILE, short: "mi" },
];

const EFFICIENCY_UNITS = [
  { id: "kmpl", label: "km per litre" },
  { id: "l100km", label: "litres per 100 km" },
  { id: "mpgus", label: "miles per US gallon" },
  { id: "mpguk", label: "miles per UK gallon" },
];

const PRICE_UNITS = [
  { id: "litre", label: "per litre", litres: 1 },
  { id: "usgal", label: "per US gallon", litres: LITRES_PER_US_GALLON },
  { id: "ukgal", label: "per UK gallon", litres: LITRES_PER_UK_GALLON },
];

const DEFAULTS = {
  distance: "450",
  distanceUnit: "km",
  roundTrip: false,
  efficiency: "18",
  efficiencyUnit: "kmpl",
  price: "102",
  priceUnit: "litre",
  extras: "0",
  people: "4",
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const moneyExact = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const plain = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const fmtMoney = (value) => (Number.isFinite(value) ? money.format(value) : "—");
const fmtMoneyExact = (value) => (Number.isFinite(value) ? moneyExact.format(value) : "—");
const fmtNum = (value) => (Number.isFinite(value) ? plain.format(value) : "—");

function toKmPerLitre(value, unit) {
  if (!Number.isFinite(value) || value <= 0) return null;
  if (unit === "kmpl") return value;
  if (unit === "l100km") return 100 / value;
  if (unit === "mpgus") return (value * KM_PER_MILE) / LITRES_PER_US_GALLON;
  if (unit === "mpguk") return (value * KM_PER_MILE) / LITRES_PER_UK_GALLON;
  return null;
}

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const distanceUnit =
    DISTANCE_UNITS.find((item) => item.id === form.distanceUnit) || DISTANCE_UNITS[0];
  const priceUnit = PRICE_UNITS.find((item) => item.id === form.priceUnit) || PRICE_UNITS[0];

  const result = useMemo(() => {
    const distance = Number(form.distance);
    const efficiency = Number(form.efficiency);
    const price = Number(form.price);
    const extras = form.extras.trim() === "" ? 0 : Number(form.extras);
    const people = Number(form.people);

    if (form.distance.trim() === "" || !Number.isFinite(distance) || distance <= 0) {
      return { error: "Enter a trip distance greater than 0." };
    }
    if (form.efficiency.trim() === "" || !Number.isFinite(efficiency) || efficiency <= 0) {
      return { error: "Enter a fuel efficiency greater than 0." };
    }
    if (form.price.trim() === "" || !Number.isFinite(price) || price < 0) {
      return { error: "Enter a fuel price of 0 or more." };
    }
    if (!Number.isFinite(extras) || extras < 0) {
      return { error: "Tolls and parking must be 0 or a positive amount." };
    }
    if (!Number.isFinite(people) || !Number.isInteger(people) || people < 1) {
      return { error: "Split between at least 1 person (whole numbers only)." };
    }
    if (people > 100) {
      return { error: "Split between 100 people or fewer." };
    }

    const kmPerLitre = toKmPerLitre(efficiency, form.efficiencyUnit);
    if (!kmPerLitre || !Number.isFinite(kmPerLitre) || kmPerLitre <= 0) {
      return { error: "That fuel efficiency cannot be converted. Check the value and unit." };
    }

    const oneWayKm = distance * distanceUnit.toKm;
    const totalKm = form.roundTrip ? oneWayKm * 2 : oneWayKm;
    const litres = totalKm / kmPerLitre;
    const pricePerLitre = price / priceUnit.litres;
    const fuelCost = litres * pricePerLitre;
    const totalCost = fuelCost + extras;

    return {
      totalKm,
      oneWayKm,
      litres,
      pricePerLitre,
      fuelCost,
      extras,
      totalCost,
      people,
      perPerson: totalCost / people,
      costPerKm: totalCost / totalKm,
      costPer100Km: (totalCost / totalKm) * 100,
      kmPerLitre,
      mileageEquivalent: {
        kmpl: kmPerLitre,
        l100km: 100 / kmPerLitre,
        mpgus: (kmPerLitre * LITRES_PER_US_GALLON) / KM_PER_MILE,
      },
    };
  }, [form, distanceUnit, priceUnit]);

  const report = useMemo(() => {
    if (result.error) return "";
    return [
      "Trip fuel cost",
      `Distance: ${fmtNum(result.totalKm)} km${form.roundTrip ? " (round trip)" : ""}`,
      `Mileage: ${fmtNum(result.kmPerLitre)} km/l`,
      `Fuel price: ${fmtMoneyExact(result.pricePerLitre)} per litre`,
      `Fuel needed: ${fmtNum(result.litres)} litres`,
      `Fuel cost: ${fmtMoneyExact(result.fuelCost)}`,
      result.extras > 0 ? `Tolls and parking: ${fmtMoneyExact(result.extras)}` : "",
      `Total trip cost: ${fmtMoneyExact(result.totalCost)}`,
      `Per person (${result.people}): ${fmtMoneyExact(result.perPerson)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [form.roundTrip, result]);

  const copyResult = async () => {
    if (!report) return;
    const ok = await safeCopyText(report);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none disabled:opacity-60";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <Fuel className="h-4 w-4" aria-hidden="true" />
            Travel calculator
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Fuel Cost Trip Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Enter the distance, your vehicle's mileage and the pump price to see how much fuel the trip
            burns, what it costs with tolls, and what each passenger owes.
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fuel-distance" className="mb-1.5 block text-sm font-semibold">
                  Trip distance
                </label>
                <input
                  id="fuel-distance"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={form.distance}
                  onChange={(event) => setField("distance", event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="fuel-distance-unit" className="mb-1.5 block text-sm font-semibold">
                  Distance unit
                </label>
                <select
                  id="fuel-distance-unit"
                  value={form.distanceUnit}
                  onChange={(event) => setField("distanceUnit", event.target.value)}
                  className={inputClass}
                >
                  {DISTANCE_UNITS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="fuel-efficiency" className="mb-1.5 block text-sm font-semibold">
                  Fuel efficiency
                </label>
                <input
                  id="fuel-efficiency"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={form.efficiency}
                  onChange={(event) => setField("efficiency", event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="fuel-efficiency-unit" className="mb-1.5 block text-sm font-semibold">
                  Efficiency unit
                </label>
                <select
                  id="fuel-efficiency-unit"
                  value={form.efficiencyUnit}
                  onChange={(event) => setField("efficiencyUnit", event.target.value)}
                  className={inputClass}
                >
                  {EFFICIENCY_UNITS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="fuel-price" className="mb-1.5 block text-sm font-semibold">
                  Fuel price (₹)
                </label>
                <input
                  id="fuel-price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={form.price}
                  onChange={(event) => setField("price", event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="fuel-price-unit" className="mb-1.5 block text-sm font-semibold">
                  Price basis
                </label>
                <select
                  id="fuel-price-unit"
                  value={form.priceUnit}
                  onChange={(event) => setField("priceUnit", event.target.value)}
                  className={inputClass}
                >
                  {PRICE_UNITS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="fuel-extras" className="mb-1.5 block text-sm font-semibold">
                  Tolls, parking (₹)
                </label>
                <input
                  id="fuel-extras"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={form.extras}
                  onChange={(event) => setField("extras", event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="fuel-people" className="mb-1.5 block text-sm font-semibold">
                  People sharing
                </label>
                <input
                  id="fuel-people"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={form.people}
                  onChange={(event) => setField("people", event.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
              <input
                id="fuel-round-trip"
                type="checkbox"
                checked={form.roundTrip}
                onChange={(event) => setField("roundTrip", event.target.checked)}
                className="mt-0.5 h-5 w-5 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              />
              <label htmlFor="fuel-round-trip" className="text-sm">
                <span className="font-semibold">Round trip</span>
                <span className="block text-[var(--muted-foreground)]">
                  Doubles the distance for the return leg.
                </span>
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyResult}
                disabled={Boolean(result.error)}
                aria-label="Copy trip fuel cost summary"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button
                type="button"
                onClick={() => setForm(DEFAULTS)}
                aria-label="Reset all inputs"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </section>

          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            {result.error ? (
              <div
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {result.error}
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Total trip cost
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                  {fmtMoney(result.totalCost)}
                </p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {fmtNum(result.totalKm)} km · {fmtNum(result.litres)} litres of fuel
                  {form.roundTrip ? " · return journey included" : ""}
                </p>

                <dl className="mt-5 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">Fuel needed</dt>
                    <dd className="text-sm font-semibold">{fmtNum(result.litres)} litres</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">Fuel cost</dt>
                    <dd className="text-sm font-semibold">{fmtMoneyExact(result.fuelCost)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">Tolls and parking</dt>
                    <dd className="text-sm font-semibold">{fmtMoneyExact(result.extras)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm font-semibold">
                      Each person pays ({result.people} sharing)
                    </dt>
                    <dd className="text-sm font-semibold text-[var(--success)]">
                      {fmtMoneyExact(result.perPerson)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">Effective price per litre</dt>
                    <dd className="text-sm font-semibold">{fmtMoneyExact(result.pricePerLitre)}</dd>
                  </div>
                </dl>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {[
                    ["Cost per km", fmtMoneyExact(result.costPerKm)],
                    ["Cost per 100 km", fmtMoney(result.costPer100Km)],
                    ["One way", fmtNum(result.oneWayKm) + " km"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                      <p className="mt-1 text-sm font-semibold">{value}</p>
                    </div>
                  ))}
                </div>

                <h2 className="mt-5 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Your mileage in other units
                </h2>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {[
                    ["km per litre", fmtNum(result.mileageEquivalent.kmpl)],
                    ["litres per 100 km", fmtNum(result.mileageEquivalent.l100km)],
                    ["miles per US gallon", fmtNum(result.mileageEquivalent.mpgus)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                      <p className="mt-1 text-sm font-semibold">{value}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                  Estimates only. Real consumption changes with traffic, air-conditioning, load, tyre
                  pressure and how much of the route is highway.
                </p>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
