"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Users } from "lucide-react";

import { DEFAULT_WEAR_PER_KM, MAX_RIDERS, computeCarpool } from "../lib";

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
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : DASH);

const DEFAULT_RIDERS = [
  { id: "r1", name: "You (driver)", km: "20", isDriver: true },
  { id: "r2", name: "Rider 2", km: "20", isDriver: false },
  { id: "r3", name: "Rider 3", km: "10", isDriver: false },
];

const DEFAULTS = {
  route: "20",
  roundTrip: true,
  trips: "22",
  fuelPrice: "105",
  efficiency: "15",
  wear: String(DEFAULT_WEAR_PER_KM),
  toll: "60",
  parking: "40",
  driverPaysShare: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [route, setRoute] = useState(DEFAULTS.route);
  const [roundTrip, setRoundTrip] = useState(DEFAULTS.roundTrip);
  const [trips, setTrips] = useState(DEFAULTS.trips);
  const [fuelPrice, setFuelPrice] = useState(DEFAULTS.fuelPrice);
  const [efficiency, setEfficiency] = useState(DEFAULTS.efficiency);
  const [wear, setWear] = useState(DEFAULTS.wear);
  const [toll, setToll] = useState(DEFAULTS.toll);
  const [parking, setParking] = useState(DEFAULTS.parking);
  const [driverPaysShare, setDriverPaysShare] = useState(DEFAULTS.driverPaysShare);
  const [riders, setRiders] = useState(DEFAULT_RIDERS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeCarpool({
        routeDistanceKm: route.trim() === "" ? NaN : Number(route),
        roundTrip,
        tripsPerMonth: trips.trim() === "" ? NaN : Number(trips),
        fuelPricePerL: fuelPrice.trim() === "" ? NaN : Number(fuelPrice),
        fuelEfficiencyKmPerL: efficiency.trim() === "" ? NaN : Number(efficiency),
        wearPerKm: wear.trim() === "" ? NaN : Number(wear),
        tollPerTrip: toll.trim() === "" ? 0 : Number(toll),
        parkingPerTrip: parking.trim() === "" ? 0 : Number(parking),
        riders: riders.map((rider) => ({
          ...rider,
          km: rider.km.trim() === "" ? NaN : Number(rider.km),
        })),
        driverPaysShare,
      }),
    [route, roundTrip, trips, fuelPrice, efficiency, wear, toll, parking, riders, driverPaysShare],
  );

  const error = result.error || null;

  const updateRider = (id, patch) => {
    setRiders((current) => current.map((rider) => (rider.id === id ? { ...rider, ...patch } : rider)));
  };

  const setDriver = (id) => {
    setRiders((current) => current.map((rider) => ({ ...rider, isDriver: rider.id === id })));
  };

  const addRider = () => {
    setRiders((current) => {
      if (current.length >= MAX_RIDERS) return current;
      const nextNumber =
        current.reduce((max, rider) => {
          const parsed = Number(String(rider.id).replace(/\D/g, ""));
          return Number.isFinite(parsed) && parsed > max ? parsed : max;
        }, 0) + 1;
      return [
        ...current,
        { id: `r${nextNumber}`, name: `Rider ${current.length + 1}`, km: route, isDriver: false },
      ];
    });
  };

  const removeRider = (id) => {
    setRiders((current) => (current.length <= 1 ? current : current.filter((rider) => rider.id !== id)));
  };

  const summary = useMemo(() => {
    if (error) return "";
    return [
      "Carpool Cost Split",
      `Running cost: ${money2(result.costPerKm)} per km (fuel ${money2(result.fuelCostPerKm)} + wear ${money2(result.wearPerKm)})`,
      `Distance per trip: ${NUM.format(result.tripDistanceKm)} km, ${NUM.format(result.fuelLitresPerTrip)} litres`,
      `Cost per trip: ${money2(result.tripCost)} (running ${money2(result.runningCostPerTrip)} + tolls and parking ${money2(result.fixedCostPerTrip)})`,
      `Cost per month: ${money(result.monthlyCost)}`,
      "Split:",
      ...result.breakdown.map(
        (rider) =>
          `  ${rider.name}${rider.isDriver ? " (driver)" : ""}: ${money2(rider.perTrip)} per trip, ${money(rider.perMonth)} per month (${NUM.format(rider.sharePct)}%)`,
      ),
      `Driver saves ${money(result.driverSavingPerMonth)} a month versus driving alone.`,
    ].join("\n");
  }, [error, result]);

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
    setRoute(DEFAULTS.route);
    setRoundTrip(DEFAULTS.roundTrip);
    setTrips(DEFAULTS.trips);
    setFuelPrice(DEFAULTS.fuelPrice);
    setEfficiency(DEFAULTS.efficiency);
    setWear(DEFAULTS.wear);
    setToll(DEFAULTS.toll);
    setParking(DEFAULTS.parking);
    setDriverPaysShare(DEFAULTS.driverPaysShare);
    setRiders(DEFAULT_RIDERS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Users className="h-4 w-4" aria-hidden="true" />
          Shared commute
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Carpool Cost Split Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Splits fuel and wear by the kilometres each person actually rides, and tolls and parking
          equally, so someone who joins halfway is not charged for the full route.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The trip</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-route">
              One-way route distance (km)
            </label>
            <input
              id="cp-route"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={route}
              onChange={(event) => setRoute(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-trips">
              Trips per month
            </label>
            <input
              id="cp-trips"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="62"
              step="1"
              value={trips}
              onChange={(event) => setTrips(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-fuel-price">
              Fuel price (INR per litre)
            </label>
            <input
              id="cp-fuel-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={fuelPrice}
              onChange={(event) => setFuelPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-efficiency">
              Fuel efficiency (km per litre)
            </label>
            <input
              id="cp-efficiency"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={efficiency}
              onChange={(event) => setEfficiency(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-wear">
              Wear allowance (INR per km)
            </label>
            <input
              id="cp-wear"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={wear}
              onChange={(event) => setWear(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-toll">
              Tolls per trip (INR)
            </label>
            <input
              id="cp-toll"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={toll}
              onChange={(event) => setToll(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cp-parking">
              Parking per trip (INR)
            </label>
            <input
              id="cp-parking"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={parking}
              onChange={(event) => setParking(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <label
            className="flex min-h-11 items-center gap-3 text-sm font-medium text-[var(--foreground)]"
            htmlFor="cp-roundtrip"
          >
            <input
              id="cp-roundtrip"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={roundTrip}
              onChange={(event) => setRoundTrip(event.target.checked)}
            />
            The car does the route both ways each day
          </label>
          <label
            className="flex min-h-11 items-center gap-3 text-sm font-medium text-[var(--foreground)]"
            htmlFor="cp-driver-pays"
          >
            <input
              id="cp-driver-pays"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={driverPaysShare}
              onChange={(event) => setDriverPaysShare(event.target.checked)}
            />
            The driver also pays a share (uncheck to have passengers cover everything)
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Who rides, and how far</h2>
          <button
            type="button"
            onClick={addRider}
            disabled={riders.length >= MAX_RIDERS}
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add rider
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          {riders.map((rider, index) => (
            <div
              key={rider.id}
              className="grid gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-2"
            >
              <div>
                <label className={LABEL_CLASS} htmlFor={`cp-name-${rider.id}`}>
                  Rider {index + 1} name
                </label>
                <input
                  id={`cp-name-${rider.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={rider.name}
                  onChange={(event) => updateRider(rider.id, { name: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`cp-km-${rider.id}`}>
                  Kilometres in the car, one way
                </label>
                <input
                  id={`cp-km-${rider.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={rider.km}
                  onChange={(event) => updateRider(rider.id, { km: event.target.value })}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                <label
                  className="flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--foreground)]"
                  htmlFor={`cp-driver-${rider.id}`}
                >
                  <input
                    id={`cp-driver-${rider.id}`}
                    type="radio"
                    name="carpool-driver"
                    className="h-5 w-5 border-[var(--border)] accent-[var(--primary)]"
                    checked={rider.isDriver}
                    onChange={() => setDriver(rider.id)}
                  />
                  This is the driver
                </label>
                <button
                  type="button"
                  onClick={() => removeRider(rider.id)}
                  disabled={riders.length <= 1}
                  aria-label={`Remove ${rider.name || `rider ${index + 1}`}`}
                  className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]" aria-live="polite">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Cost of one trip
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? DASH : money2(result.tripCost)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error ? DASH : `${money(result.monthlyCost)} a month across the whole carpool`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy carpool cost split"
              className={GHOST_BTN}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Running cost per km", error ? DASH : money2(result.costPerKm)],
            ["Of which fuel", error ? DASH : `${money2(result.fuelCostPerKm)} per km`],
            ["Distance covered per trip", error ? DASH : `${NUM.format(result.tripDistanceKm)} km`],
            ["Fuel burned per trip", error ? DASH : `${NUM.format(result.fuelLitresPerTrip)} litres`],
            ["Tolls and parking per trip", error ? DASH : money2(result.fixedCostPerTrip)],
            ["Total person-kilometres per trip", error ? DASH : `${NUM.format(result.totalPersonKm)} km`],
            [
              "Driver saves versus driving alone",
              error ? DASH : `${money(result.driverSavingPerMonth)} a month`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]" aria-live="polite">
        <h2 className="text-base font-semibold">What each person owes</h2>
        {error ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[400px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Rider</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Km each way</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Per trip</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Per month</th>
                  <th scope="col" className="py-2 text-right font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((rider) => (
                  <tr key={rider.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {rider.name}
                      {rider.isDriver ? (
                        <span className="ml-2 text-xs font-medium text-[var(--primary)]">driver</span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM.format(rider.km)}
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">{money2(rider.perTrip)}</td>
                    <td className="py-2 pr-3 text-right">{money(rider.perMonth)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {NUM.format(rider.sharePct)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The wear allowance is yours to set — it stands in for tyres, servicing, brakes and
        depreciation, which fuel price alone ignores. Tolls and parking are split equally on the
        assumption everyone is aboard for the tolled section; adjust the toll figure if a rider gets
        out before it.
      </p>
    </main>
  );
}
