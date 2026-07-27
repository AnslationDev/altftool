"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Users } from "lucide-react";

import { splitFuelCost } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const INR0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const money0 = (value) => (Number.isFinite(value) ? INR0.format(value) : "—");
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${PCT.format(value * 100)}%` : "—");

const DEFAULT_TRIP = {
  distanceKm: "600",
  mileageKmpl: "15",
  fuelPrice: "100",
  tolls: "800",
  otherCosts: "200",
};

const DEFAULT_PEOPLE = [
  { id: 1, name: "Driver", km: "600" },
  { id: 2, name: "Rider 2", km: "600" },
  { id: 3, name: "Rider 3", km: "300" },
];

const INPUT_CLASS =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const ROW_INPUT_CLASS =
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
  const [trip, setTrip] = useState(DEFAULT_TRIP);
  const [people, setPeople] = useState(DEFAULT_PEOPLE);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setTrip((previous) => ({ ...previous, [key]: event.target.value }));

  const updatePerson = (id, key, value) =>
    setPeople((previous) =>
      previous.map((person) => (person.id === id ? { ...person, [key]: value } : person)),
    );

  const addPerson = () =>
    setPeople((previous) => {
      const nextId = previous.reduce((max, person) => Math.max(max, person.id), 0) + 1;
      return [...previous, { id: nextId, name: `Rider ${previous.length + 1}`, km: trip.distanceKm }];
    });

  const removePerson = (id) =>
    setPeople((previous) => (previous.length > 1 ? previous.filter((p) => p.id !== id) : previous));

  const result = useMemo(
    () =>
      splitFuelCost({
        distanceKm: toNumber(trip.distanceKm),
        mileageKmpl: toNumber(trip.mileageKmpl),
        fuelPrice: toNumber(trip.fuelPrice),
        tolls: toNumber(trip.tolls),
        otherCosts: toNumber(trip.otherCosts),
        people: people.map((person) => ({
          name: person.name.trim() || "Unnamed",
          km: toNumber(person.km),
        })),
      }),
    [trip, people],
  );

  const error = result.error ?? null;
  const view = error ? null : result;

  const summary = useMemo(() => {
    if (!view) return "";
    return [
      "Fuel Cost Split",
      `Fuel: ${num(view.litres)} litres — ${money0(view.fuelCost)}`,
      `Tolls: ${money0(view.tolls)}`,
      `Other costs: ${money0(view.otherCosts)}`,
      `Trip total: ${money(view.totalCost)}`,
      "",
      ...view.shares.map((share) => `${share.name} (${num(share.km)} km): ${money(share.amount)}`),
    ].join("\n");
  }, [view]);

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
    setTrip(DEFAULT_TRIP);
    setPeople(DEFAULT_PEOPLE);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Users className="h-4 w-4" aria-hidden="true" />
          Road trip
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Fuel Cost Split Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add the trip distance, mileage, fuel price and tolls, then list who rode how far. Everyone
          pays in proportion to the kilometres they were actually in the car.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Trip costs</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="split-distance">
              Total distance driven (km)
            </label>
            <input
              id="split-distance"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={trip.distanceKm}
              onChange={setField("distanceKm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="split-mileage">
              Mileage (km per litre)
            </label>
            <input
              id="split-mileage"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={trip.mileageKmpl}
              onChange={setField("mileageKmpl")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="split-price">
              Fuel price (per litre)
            </label>
            <input
              id="split-price"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={trip.fuelPrice}
              onChange={setField("fuelPrice")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="split-tolls">
              Tolls for the whole trip
            </label>
            <input
              id="split-tolls"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={trip.tolls}
              onChange={setField("tolls")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="split-other">
              Other shared costs (parking, ferry, permits)
            </label>
            <input
              id="split-other"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={trip.otherCosts}
              onChange={setField("otherCosts")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Who rode how far</h2>
          <button type="button" onClick={addPerson} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add person
          </button>
        </div>

        <ul className="mt-4 space-y-4">
          {people.map((person, index) => (
            <li key={person.id} className="grid gap-3 sm:grid-cols-[1fr_9rem_auto] sm:items-end">
              <div>
                <label className={LABEL_CLASS} htmlFor={`split-name-${person.id}`}>
                  Name
                </label>
                <input
                  id={`split-name-${person.id}`}
                  className={`mt-2 ${ROW_INPUT_CLASS}`}
                  type="text"
                  value={person.name}
                  onChange={(event) => updatePerson(person.id, "name", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`split-km-${person.id}`}>
                  Kilometres aboard
                </label>
                <input
                  id={`split-km-${person.id}`}
                  className={`mt-2 ${ROW_INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="10"
                  value={person.km}
                  onChange={(event) => updatePerson(person.id, "km", event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removePerson(person.id)}
                disabled={people.length <= 1}
                aria-label={`Remove ${person.name || `person ${index + 1}`}`}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total trip cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {view ? money0(view.totalCost) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {view
                ? `${num(view.litres)} litres of fuel · ${money(view.costPerKm)} per km`
                : "Fix the highlighted input to see the split."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the fuel cost split"
              className={GHOST_BTN}
              disabled={!view}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the trip" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Fuel", view ? `${num(view.litres)} litres — ${money0(view.fuelCost)}` : "—"],
            ["Tolls", view ? money0(view.tolls) : "—"],
            ["Other shared costs", view ? money0(view.otherCosts) : "—"],
            ["Person-kilometres in total", view ? `${num(view.totalPersonKm)} km` : "—"],
            ["Flat equal split would be", view ? money(view.equalShare) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Person
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Share
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Pays
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  vs equal
                </th>
              </tr>
            </thead>
            <tbody>
              {view ? (
                view.shares.map((share) => (
                  <tr key={share.name + share.km} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {share.name}
                      <span className="ml-2 font-normal text-[var(--muted-foreground)]">
                        {num(share.km)} km
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {pct(share.fraction)}
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">{money(share.amount)}</td>
                    <td
                      className={`py-2 text-right ${
                        share.differenceVsEqual > 0
                          ? "text-[var(--danger)]"
                          : "text-[var(--success)]"
                      }`}
                    >
                      {share.differenceVsEqual >= 0 ? "+" : "−"}
                      {money(Math.abs(share.differenceVsEqual))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]" colSpan={4}>
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Shares are rounded to the nearest paisa and the remainder is added to the largest share, so
        the amounts always add back to the trip total. Wear, tyres and servicing are not included —
        some groups add a flat per-km allowance to the &ldquo;other shared costs&rdquo; box for that.
      </p>
    </main>
  );
}
