"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Wallet } from "lucide-react";

import { FUEL_TYPES, planFuelBudget, savingsFromEfficiencyGain } from "../lib";

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

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : "—");
const num1 = (value) => (Number.isFinite(value) ? NUM1.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM1.format(value * 100)}%` : "—");

const DEFAULT_VEHICLES = [
  { id: 1, name: "Car", fuel: "petrol", monthlyKm: "1000", efficiency: "15", unitPrice: "105" },
  { id: 2, name: "Bike", fuel: "petrol", monthlyKm: "400", efficiency: "45", unitPrice: "105" },
  { id: 3, name: "CNG hatch", fuel: "cng", monthlyKm: "800", efficiency: "25", unitPrice: "90" },
];
const DEFAULT_BUDGET = "9000";
const DEFAULT_GAIN = "10";

const INPUT_CLASS =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
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
  const [vehicles, setVehicles] = useState(DEFAULT_VEHICLES);
  const [budget, setBudget] = useState(DEFAULT_BUDGET);
  const [gainPct, setGainPct] = useState(DEFAULT_GAIN);
  const [copied, setCopied] = useState(false);

  const updateVehicle = (id, key, value) =>
    setVehicles((previous) =>
      previous.map((vehicle) => (vehicle.id === id ? { ...vehicle, [key]: value } : vehicle)),
    );

  const addVehicle = () =>
    setVehicles((previous) => {
      const nextId = previous.reduce((max, vehicle) => Math.max(max, vehicle.id), 0) + 1;
      return [
        ...previous,
        {
          id: nextId,
          name: `Vehicle ${previous.length + 1}`,
          fuel: "petrol",
          monthlyKm: "500",
          efficiency: "15",
          unitPrice: "105",
        },
      ];
    });

  const removeVehicle = (id) =>
    setVehicles((previous) =>
      previous.length > 1 ? previous.filter((vehicle) => vehicle.id !== id) : previous,
    );

  const result = useMemo(
    () =>
      planFuelBudget({
        vehicles: vehicles.map((vehicle) => ({
          name: vehicle.name,
          fuel: vehicle.fuel,
          monthlyKm: toNumber(vehicle.monthlyKm),
          efficiency: toNumber(vehicle.efficiency),
          unitPrice: toNumber(vehicle.unitPrice),
        })),
        budget: toNumber(budget) || 0,
      }),
    [vehicles, budget],
  );

  const error = result.error ?? null;
  const view = error ? null : result;

  const efficiencyGain = useMemo(() => {
    if (!view) return null;
    const outcome = savingsFromEfficiencyGain({
      totalCost: view.totalCost,
      gainPct: toNumber(gainPct),
    });
    return outcome.error ? null : outcome;
  }, [view, gainPct]);

  const summary = useMemo(() => {
    if (!view) return "";
    return [
      "Monthly Fuel Budget",
      ...view.rows.map(
        (row) =>
          `${row.name}: ${num1(row.monthlyKm)} km, ${num1(row.units)} ${row.unitShort} — ${money(row.cost)}`,
      ),
      `Fleet total: ${money(view.totalCost)} a month (${money(view.yearlyCost)} a year)`,
      `Fleet cost per km: ${money2(view.fleetCostPerKm)}`,
      view.budgetSet
        ? view.withinBudget
          ? `Within budget by ${money(view.difference)}`
          : `Over budget by ${money(view.overspend)} — trim about ${num1(view.kmToTrim)} km`
        : "No budget cap set",
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
    setVehicles(DEFAULT_VEHICLES);
    setBudget(DEFAULT_BUDGET);
    setGainPct(DEFAULT_GAIN);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wallet className="h-4 w-4" aria-hidden="true" />
          Fuel budget
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Monthly Fuel Budget Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add every vehicle in the household — petrol, diesel or CNG — with the distance it covers
          in a month. See the fleet total, who is eating the budget, and how far to cut back.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Vehicles</h2>
          <button type="button" onClick={addVehicle} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add vehicle
          </button>
        </div>

        <ul className="mt-4 space-y-5">
          {vehicles.map((vehicle, index) => (
            <li
              key={vehicle.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="min-w-[10rem] flex-1">
                  <label className={LABEL_CLASS} htmlFor={`fleet-name-${vehicle.id}`}>
                    Vehicle name
                  </label>
                  <input
                    id={`fleet-name-${vehicle.id}`}
                    className={INPUT_CLASS}
                    type="text"
                    value={vehicle.name}
                    onChange={(event) => updateVehicle(vehicle.id, "name", event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeVehicle(vehicle.id)}
                  disabled={vehicles.length <= 1}
                  aria-label={`Remove ${vehicle.name || `vehicle ${index + 1}`}`}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={SMALL_LABEL} htmlFor={`fleet-fuel-${vehicle.id}`}>
                    Fuel
                  </label>
                  <select
                    id={`fleet-fuel-${vehicle.id}`}
                    className={INPUT_CLASS}
                    value={vehicle.fuel}
                    onChange={(event) => updateVehicle(vehicle.id, "fuel", event.target.value)}
                  >
                    {FUEL_TYPES.map((fuel) => (
                      <option key={fuel.id} value={fuel.id}>
                        {fuel.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`fleet-km-${vehicle.id}`}>
                    Distance per month (km)
                  </label>
                  <input
                    id={`fleet-km-${vehicle.id}`}
                    className={INPUT_CLASS}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="50"
                    value={vehicle.monthlyKm}
                    onChange={(event) => updateVehicle(vehicle.id, "monthlyKm", event.target.value)}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`fleet-eff-${vehicle.id}`}>
                    Mileage (km per {vehicle.fuel === "cng" ? "kg" : "litre"})
                  </label>
                  <input
                    id={`fleet-eff-${vehicle.id}`}
                    className={INPUT_CLASS}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    value={vehicle.efficiency}
                    onChange={(event) => updateVehicle(vehicle.id, "efficiency", event.target.value)}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`fleet-price-${vehicle.id}`}>
                    Price per {vehicle.fuel === "cng" ? "kg" : "litre"}
                  </label>
                  <input
                    id={`fleet-price-${vehicle.id}`}
                    className={INPUT_CLASS}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    value={vehicle.unitPrice}
                    onChange={(event) => updateVehicle(vehicle.id, "unitPrice", event.target.value)}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 max-w-xs">
          <label className={LABEL_CLASS} htmlFor="fleet-budget">
            Monthly fuel budget (0 for none)
          </label>
          <input
            id="fleet-budget"
            className={INPUT_CLASS}
            type="number"
            inputMode="decimal"
            min="0"
            step="500"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
          />
        </div>
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
              Fuel spend per month
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {view ? money(view.totalCost) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {view
                ? `${num1(view.totalKm)} km across ${view.rows.length} vehicle${view.rows.length > 1 ? "s" : ""}`
                : "Fix the highlighted input to see your budget."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the fuel budget"
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
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the fuel budget planner"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {view && view.budgetSet && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              view.withinBudget
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {view.withinBudget
              ? `Inside the budget with ${money(view.difference)} to spare.`
              : `Over budget by ${money(view.overspend)} — that is about ${num1(view.kmToTrim)} km, or ${pct(view.shareToTrim)} of your driving.`}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Fleet cost per km", view ? money2(view.fleetCostPerKm) : "—"],
            ["Distance per month", view ? `${num1(view.totalKm)} km` : "—"],
            ["Fuel spend per year", view ? money(view.yearlyCost) : "—"],
            ["Biggest single cost", view ? view.costliestVehicle : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Vehicle
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Fuel
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Cost / month
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Share
                </th>
              </tr>
            </thead>
            <tbody>
              {view ? (
                view.rows.map((row) => (
                  <tr key={row.name + row.monthlyKm} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {row.name}
                      <span className="ml-2 font-normal text-[var(--muted-foreground)]">
                        {num1(row.monthlyKm)} km
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {num1(row.units)} {row.unitShort}
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">{money(row.cost)}</td>
                    <td className="py-2 text-right">{pct(row.shareOfSpend)}</td>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">If every vehicle got more efficient</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Correct tyre pressure, a clean air filter and lighter throttle typically recover several
          percent of mileage.
        </p>
        <div className="mt-3 max-w-xs">
          <label className={LABEL_CLASS} htmlFor="fleet-gain">
            Mileage improvement (%)
          </label>
          <input
            id="fleet-gain"
            className={INPUT_CLASS}
            type="number"
            inputMode="decimal"
            min="-50"
            max="100"
            step="1"
            value={gainPct}
            onChange={(event) => setGainPct(event.target.value)}
          />
        </div>
        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["New monthly fuel spend", efficiencyGain ? money(efficiencyGain.newMonthlyCost) : "—"],
            ["Saved per month", efficiencyGain ? money(efficiencyGain.monthlySaving) : "—"],
            ["Saved per year", efficiencyGain ? money(efficiencyGain.yearlySaving) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Fuel only. Tolls, parking, insurance premiums, servicing and depreciation sit outside this
        budget line and should be planned separately. Pump prices move — refresh them monthly.
      </p>
    </main>
  );
}
