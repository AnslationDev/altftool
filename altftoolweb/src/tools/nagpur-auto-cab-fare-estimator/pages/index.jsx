"use client";

import { useMemo, useState } from "react";
import { Check, Copy, CarTaxiFront, Moon, RotateCcw } from "lucide-react";

import { COMMON_TRIPS, MAX_SURGE, VEHICLES, estimateFare, getVehicle } from "../lib";

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

const DEFAULT_VEHICLE_ID = "auto";
const TRIP_DEFAULTS = {
  distanceKm: "8",
  passengers: "1",
  waitingMinutes: "0",
  rideMinutes: "22",
  pickupTime: "10:30",
  surgeMultiplier: "1",
  tollsAndParking: "0",
};

/** Rate-card fields the user may override, in display order. */
const RATE_FIELDS = [
  { key: "baseFare", label: "Minimum / meter-down fare (₹)", step: "1" },
  { key: "baseKm", label: "Distance included in it (km)", step: "0.1" },
  { key: "perKm", label: "Rate per extra km (₹)", step: "0.5" },
  { key: "perMinute", label: "Ride-time rate (₹ per minute)", step: "0.1" },
  { key: "waitingPerMin", label: "Waiting rate (₹ per minute)", step: "0.25" },
  { key: "freeWaitingMin", label: "Free waiting minutes", step: "1" },
  { key: "nightSurchargePct", label: "Night charge (% of meter)", step: "5" },
  { key: "minimumFare", label: "Fare floor (₹)", step: "5" },
];

const INPUT_CLASS =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function rateToStrings(vehicle) {
  const out = {};
  for (const field of RATE_FIELDS) out[field.key] = String(vehicle[field.key]);
  return out;
}

const toNum = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [vehicleId, setVehicleId] = useState(DEFAULT_VEHICLE_ID);
  const [rateInputs, setRateInputs] = useState(() => rateToStrings(getVehicle(DEFAULT_VEHICLE_ID)));
  const [distanceKm, setDistanceKm] = useState(TRIP_DEFAULTS.distanceKm);
  const [passengers, setPassengers] = useState(TRIP_DEFAULTS.passengers);
  const [waitingMinutes, setWaitingMinutes] = useState(TRIP_DEFAULTS.waitingMinutes);
  const [rideMinutes, setRideMinutes] = useState(TRIP_DEFAULTS.rideMinutes);
  const [pickupTime, setPickupTime] = useState(TRIP_DEFAULTS.pickupTime);
  const [surgeMultiplier, setSurgeMultiplier] = useState(TRIP_DEFAULTS.surgeMultiplier);
  const [tollsAndParking, setTollsAndParking] = useState(TRIP_DEFAULTS.tollsAndParking);
  const [copied, setCopied] = useState(false);

  const vehicle = getVehicle(vehicleId);

  const selectVehicle = (nextId) => {
    setVehicleId(nextId);
    setRateInputs(rateToStrings(getVehicle(nextId)));
    setCopied(false);
  };

  const rate = useMemo(() => {
    const card = { surgeable: vehicle.surgeable, perPassenger: vehicle.perPassenger };
    for (const field of RATE_FIELDS) card[field.key] = toNum(rateInputs[field.key]);
    return card;
  }, [rateInputs, vehicle.surgeable, vehicle.perPassenger]);

  const result = useMemo(
    () =>
      estimateFare({
        rate,
        distanceKm: toNum(distanceKm),
        passengers: passengers.trim() === "" ? 1 : toNum(passengers),
        waitingMinutes: waitingMinutes.trim() === "" ? 0 : toNum(waitingMinutes),
        rideMinutes: rideMinutes.trim() === "" ? 0 : toNum(rideMinutes),
        pickupTime,
        surgeMultiplier: surgeMultiplier.trim() === "" ? 1 : toNum(surgeMultiplier),
        tollsAndParking: tollsAndParking.trim() === "" ? 0 : toNum(tollsAndParking),
      }),
    [
      rate,
      distanceKm,
      passengers,
      waitingMinutes,
      rideMinutes,
      pickupTime,
      surgeMultiplier,
      tollsAndParking,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Nagpur fare estimate",
      `Vehicle: ${vehicle.label}`,
      `Distance: ${NUM.format(result.distanceKm)} km`,
      `Pickup time: ${pickupTime}${result.isNight ? " (night charge window)" : ""}`,
      `Distance fare: ${money2(result.distanceFare)}`,
      result.rideTimeFare > 0 ? `Ride-time fare: ${money2(result.rideTimeFare)}` : null,
      result.waitingFare > 0 ? `Waiting charge: ${money2(result.waitingFare)}` : null,
      result.nightSurcharge > 0
        ? `Night charge (${result.nightSurchargePct}%): ${money2(result.nightSurcharge)}`
        : null,
      result.surgeAmount > 0
        ? `Surge (x${NUM.format(result.surge)}): ${money2(result.surgeAmount)}`
        : null,
      result.isPerPassenger
        ? `Per seat ${money2(result.perSeatFare)} x ${result.billedSeats} seats = ${money2(result.fareForAllSeats)}`
        : null,
      result.tolls > 0 ? `Tolls and parking: ${money2(result.tolls)}` : null,
      `Estimated fare: ${money(result.payable)}`,
      `Fair range: ${money(result.fairLow)} to ${money(result.fairHigh)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result, pickupTime, vehicle.label]);

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
    setVehicleId(DEFAULT_VEHICLE_ID);
    setRateInputs(rateToStrings(getVehicle(DEFAULT_VEHICLE_ID)));
    setDistanceKm(TRIP_DEFAULTS.distanceKm);
    setPassengers(TRIP_DEFAULTS.passengers);
    setWaitingMinutes(TRIP_DEFAULTS.waitingMinutes);
    setRideMinutes(TRIP_DEFAULTS.rideMinutes);
    setPickupTime(TRIP_DEFAULTS.pickupTime);
    setSurgeMultiplier(TRIP_DEFAULTS.surgeMultiplier);
    setTollsAndParking(TRIP_DEFAULTS.tollsAndParking);
    setCopied(false);
  };

  const rows = [
    ["Distance fare", hasError ? DASH : money2(result.distanceFare)],
    ["Ride-time charge", hasError ? DASH : money2(result.rideTimeFare)],
    ["Waiting charge", hasError ? DASH : money2(result.waitingFare)],
    [
      `Night charge${hasError ? "" : ` (${result.nightSurchargePct}%)`}`,
      hasError ? DASH : money2(result.nightSurcharge),
    ],
    [
      `Surge${hasError ? "" : ` (x${NUM.format(result.surge)})`}`,
      hasError ? DASH : money2(result.surgeAmount),
    ],
    ["Minimum-fare top-up", hasError ? DASH : money2(result.minimumTopUp)],
    [
      "Fare per seat",
      hasError ? DASH : result.isPerPassenger ? money2(result.perSeatFare) : "Whole vehicle",
    ],
    ["Seats billed", hasError ? DASH : String(result.billedSeats)],
    ["Tolls and parking", hasError ? DASH : money2(result.tolls)],
    ["Effective cost per km", hasError ? DASH : `${money2(result.perKmEffective)}/km`],
    ["Usually rounded up to", hasError ? DASH : money(result.roundedUp)],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <CarTaxiFront className="h-4 w-4" aria-hidden="true" />
          Nagpur transport
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Nagpur Auto and Cab Fare Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Prices a Nagpur trip on the RTA meter structure — a minimum fare covering the first
          stretch, a per-kilometre rate after it, waiting time, and Maharashtra&apos;s statutory 25%
          night charge between midnight and 5 am. Shared autos are priced per seat, and app cabs the
          way aggregators bill them, so you can compare all three for the same run.
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
              onChange={(event) => selectVehicle(event.target.value)}
            >
              {VEHICLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              {vehicle.rta
                ? "Follows the Nagpur RTA meter structure and the statutory night charge. RTA revises the rupee figures periodically — edit the card below to match the one printed in your vehicle."
                : "Typical Nagpur app pricing, not a notified tariff. Edit the card below to match the fare breakdown your app shows."}
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
            <label className={LABEL_CLASS} htmlFor="fare-passengers">
              Passengers
            </label>
            <input
              id="fare-passengers"
              className={INPUT_CLASS}
              type="number"
              inputMode="numeric"
              min="1"
              max="8"
              step="1"
              value={passengers}
              onChange={(event) => setPassengers(event.target.value)}
            />
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              {vehicle.perPassenger
                ? "A shared auto charges each seat separately, so this multiplies the fare."
                : "A hired vehicle is one fare regardless of how many of you get in."}
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
                : "Not billed on a meter — distance only."}
            </p>
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
              max={String(MAX_SURGE)}
              step="0.1"
              value={surgeMultiplier}
              onChange={(event) => setSurgeMultiplier(event.target.value)}
              disabled={!vehicle.surgeable}
            />
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              {vehicle.surgeable
                ? `1.0 means no surge. MoRTH's 2020 guidelines cap it at ${MAX_SURGE}x the base fare.`
                : "A metered vehicle has no surge — the night charge applies instead."}
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
            Common Nagpur runs
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

        <details className="mt-5 rounded-lg border border-[var(--border)] p-4">
          <summary className="cursor-pointer text-sm font-semibold">
            Adjust the rate card for {vehicle.label}
          </summary>
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Rates are prefilled from the card above and reset whenever you change the vehicle.
            Maharashtra revises auto tariffs region by region, so the figure printed in your vehicle
            is the one that counts — copy it in here.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {RATE_FIELDS.map((field) => (
              <div key={field.key}>
                <label className={LABEL_CLASS} htmlFor={`rate-${field.key}`}>
                  {field.label}
                </label>
                <input
                  id={`rate-${field.key}`}
                  className={INPUT_CLASS}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step={field.step}
                  value={rateInputs[field.key]}
                  onChange={(event) =>
                    setRateInputs((prev) => ({ ...prev, [field.key]: event.target.value }))
                  }
                />
              </div>
            ))}
          </div>
        </details>
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
                Night charge window (midnight – 5 am)
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Nagpur fare estimate"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
        <h2 className="text-base font-semibold">Nagpur rate cards used</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Vehicle
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Minimum
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Per km
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Billed
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
                  <td className="py-2 pr-3 text-right">{money2(item.perKm)}</td>
                  <td className="py-2 pr-3 text-right">
                    {item.perPassenger ? "per seat" : "per vehicle"}
                  </td>
                  <td className="py-2 text-right">
                    {item.nightSurchargePct > 0 ? `+${item.nightSurchargePct}%` : "surge"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Auto and shared-auto tariffs in Maharashtra are fixed region by region by the Regional
          Transport Authority and revised using the Hakim Committee formula, which links the fare to
          fuel and CNG prices, vehicle cost and a notional driver income. The rupee figures above are
          starting values only — the card printed inside your vehicle is the authority.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only, for planning and for checking a quote. Actual charges depend on the route
        taken, GST on app rides, airport pick-up fees and any RTA revision since you last checked the
        card. Confirm the fare on the meter or in the app before you pay.
      </p>
    </main>
  );
}
