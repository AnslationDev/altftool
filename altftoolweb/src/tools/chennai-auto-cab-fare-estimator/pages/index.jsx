"use client";

import { useMemo, useState } from "react";
import { Check, Copy, CarTaxiFront, Moon, RotateCcw } from "lucide-react";

import { COMMON_TRIPS, VEHICLES, estimateFare, getVehicle } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : DASH);

const DEFAULTS = {
  vehicleId: "auto",
  distanceKm: "7.4",
  waitingMinutes: "0",
  rideMinutes: "25",
  pickupTime: "10:30",
  surgeMultiplier: "1",
  tollsAndParking: "0",
};

const INPUT_CLASS =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [vehicleId, setVehicleId] = useState(DEFAULTS.vehicleId);
  const [distanceKm, setDistanceKm] = useState(DEFAULTS.distanceKm);
  const [waitingMinutes, setWaitingMinutes] = useState(DEFAULTS.waitingMinutes);
  const [rideMinutes, setRideMinutes] = useState(DEFAULTS.rideMinutes);
  const [pickupTime, setPickupTime] = useState(DEFAULTS.pickupTime);
  const [surgeMultiplier, setSurgeMultiplier] = useState(DEFAULTS.surgeMultiplier);
  const [tollsAndParking, setTollsAndParking] = useState(DEFAULTS.tollsAndParking);
  const [copied, setCopied] = useState(false);

  const vehicle = getVehicle(vehicleId);

  const result = useMemo(
    () =>
      estimateFare({
        vehicleId,
        distanceKm: distanceKm.trim() === "" ? NaN : Number(distanceKm),
        waitingMinutes: waitingMinutes.trim() === "" ? 0 : Number(waitingMinutes),
        rideMinutes: rideMinutes.trim() === "" ? 0 : Number(rideMinutes),
        pickupTime,
        surgeMultiplier: surgeMultiplier.trim() === "" ? 1 : Number(surgeMultiplier),
        tollsAndParking: tollsAndParking.trim() === "" ? 0 : Number(tollsAndParking),
      }),
    [vehicleId, distanceKm, waitingMinutes, rideMinutes, pickupTime, surgeMultiplier, tollsAndParking],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Chennai fare estimate",
      `Vehicle: ${result.vehicle.label}`,
      `Distance: ${NUM.format(result.distanceKm)} km`,
      `Pickup time: ${pickupTime}${result.isNight ? " (night tariff)" : ""}`,
      `Distance fare: ${money2(result.distanceFare)}`,
      result.rideTimeFare > 0 ? `Ride-time fare: ${money2(result.rideTimeFare)}` : null,
      result.waitingFare > 0 ? `Waiting charge: ${money2(result.waitingFare)}` : null,
      result.nightSurcharge > 0
        ? `Night surcharge (${result.nightSurchargePct}%): ${money2(result.nightSurcharge)}`
        : null,
      result.surgeAmount > 0 ? `Surge (x${NUM.format(result.surge)}): ${money2(result.surgeAmount)}` : null,
      result.tolls > 0 ? `Tolls and parking: ${money2(result.tolls)}` : null,
      `Estimated fare: ${money(result.payable)}`,
      `Fair range: ${money(result.fairLow)} to ${money(result.fairHigh)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result, pickupTime]);

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
    setVehicleId(DEFAULTS.vehicleId);
    setDistanceKm(DEFAULTS.distanceKm);
    setWaitingMinutes(DEFAULTS.waitingMinutes);
    setRideMinutes(DEFAULTS.rideMinutes);
    setPickupTime(DEFAULTS.pickupTime);
    setSurgeMultiplier(DEFAULTS.surgeMultiplier);
    setTollsAndParking(DEFAULTS.tollsAndParking);
    setCopied(false);
  };

  const rows = [
    ["Distance fare", hasError ? DASH : money2(result.distanceFare)],
    ["Ride-time charge", hasError ? DASH : money2(result.rideTimeFare)],
    ["Waiting charge", hasError ? DASH : money2(result.waitingFare)],
    [
      `Night surcharge${hasError ? "" : ` (${result.nightSurchargePct}%)`}`,
      hasError ? DASH : money2(result.nightSurcharge),
    ],
    [`Surge${hasError ? "" : ` (x${NUM.format(result.surge)})`}`, hasError ? DASH : money2(result.surgeAmount)],
    ["Minimum-fare top-up", hasError ? DASH : money2(result.minimumTopUp)],
    ["Tolls and parking", hasError ? DASH : money2(result.tolls)],
    ["Effective cost per km", hasError ? DASH : `${money2(result.perKmEffective)}/km`],
    ["Usually rounded up to", hasError ? DASH : money(result.roundedUp)],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <CarTaxiFront className="h-4 w-4" aria-hidden="true" />
          Chennai transport
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Chennai Auto and Cab Fare Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Works out what a Chennai auto meter should read, or what an app cab is likely to charge,
          from the trip distance, waiting time, pickup hour and surge. The auto card follows the
          notified Tamil Nadu tariff — ₹25 for the first 1.8 km, ₹12 a kilometre after that, and 50%
          extra between 11 pm and 5 am.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fare-vehicle">
              Vehicle
            </label>
            <select
              id="fare-vehicle"
              className={INPUT_CLASS}
              value={vehicleId}
              onChange={(event) => setVehicleId(event.target.value)}
            >
              {VEHICLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              {vehicle.statutory
                ? `Notified meter: ${INR.format(vehicle.baseFare)} for the first ${vehicle.baseKm} km, then ${INR.format(vehicle.perKm)}/km.`
                : `Typical app pricing: ${INR.format(vehicle.baseFare)} base covering ${vehicle.baseKm} km, ${INR.format(vehicle.perKm)}/km plus ${money2(vehicle.perMinute)}/minute of ride time.`}
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="fare-distance">
              Trip distance (km)
            </label>
            <input
              id="fare-distance"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={distanceKm}
              onChange={(event) => setDistanceKm(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="fare-time">
              Pickup time (24-hour)
            </label>
            <input
              id="fare-time"
              className={INPUT_CLASS}
              type="time"
              value={pickupTime}
              onChange={(event) => setPickupTime(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="fare-ride-minutes">
              Ride time (minutes)
            </label>
            <input
              id="fare-ride-minutes"
              className={INPUT_CLASS}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={rideMinutes}
              onChange={(event) => setRideMinutes(event.target.value)}
            />
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              {vehicle.perMinute > 0
                ? "Apps bill ride time on top of distance."
                : "Not billed on a metered auto — distance only."}
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="fare-waiting">
              Waiting time (minutes)
            </label>
            <input
              id="fare-waiting"
              className={INPUT_CLASS}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={waitingMinutes}
              onChange={(event) => setWaitingMinutes(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="fare-surge">
              Surge multiplier
            </label>
            <input
              id="fare-surge"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="1"
              max="5"
              step="0.1"
              value={surgeMultiplier}
              onChange={(event) => setSurgeMultiplier(event.target.value)}
              disabled={!vehicle.surgeable}
            />
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              {vehicle.surgeable
                ? "1.0 means no surge."
                : "A street auto has no surge — the night tariff applies instead."}
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="fare-tolls">
              Tolls and parking (₹)
            </label>
            <input
              id="fare-tolls"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={tollsAndParking}
              onChange={(event) => setTollsAndParking(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
            Common runs
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {COMMON_TRIPS.map((trip) => (
              <button
                key={trip.label}
                type="button"
                className={CHIP_BTN}
                onClick={() => setDistanceKm(String(trip.km))}
              >
                {trip.label} · {trip.km} km
              </button>
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Estimated fare
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.payable)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a fare."
                : `Fair range ${money(result.fairLow)} – ${money(result.fairHigh)} for ${NUM.format(result.distanceKm)} km`}
            </p>
            {!hasError && result.isNight && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)]">
                <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                Night window (11 pm – 5 am)
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Chennai fare estimate"
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Chennai rate cards used</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Vehicle
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Base
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Per km
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Per min
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Night
                </th>
              </tr>
            </thead>
            <tbody>
              {VEHICLES.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{item.label}</td>
                  <td className="py-2 pr-3 text-right">
                    {INR.format(item.baseFare)} / {item.baseKm} km
                  </td>
                  <td className="py-2 pr-3 text-right">{INR.format(item.perKm)}</td>
                  <td className="py-2 pr-3 text-right">{money2(item.perMinute)}</td>
                  <td className="py-2 text-right">
                    {item.nightSurchargePct > 0 ? `+${item.nightSurchargePct}%` : "surge"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          The auto row is the tariff notified by the Tamil Nadu transport department and printed on
          the card inside the vehicle. The cab rows are typical city rates, not a notified tariff —
          apps revise them freely, so treat the total as a sanity check on the quote you are shown.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only, for planning and for checking a quote. Actual charges depend on the route
        the driver takes, GST on app rides, airport pick-up fees and any state tariff revision.
      </p>
    </main>
  );
}
