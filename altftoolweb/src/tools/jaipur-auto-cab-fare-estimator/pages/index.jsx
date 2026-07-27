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
  distanceKm: "11",
  roundTrip: false,
  waitingMinutes: "0",
  rideMinutes: "25",
  pickupTime: "10:30",
  surgeMultiplier: "1",
  tollsAndParking: "0",
};

/** Rate-card fields the user may override, in display order. */
const RATE_FIELDS = [
  { key: "baseFare", label: "Base fare (₹)", step: "5" },
  { key: "baseKm", label: "Distance included in the base (km)", step: "0.1" },
  { key: "perKm", label: "Rate per extra km (₹)", step: "0.5" },
  { key: "perMinute", label: "Ride-time rate (₹ per minute)", step: "0.1" },
  { key: "waitingPerMin", label: "Waiting rate (₹ per minute)", step: "0.25" },
  { key: "freeWaitingMin", label: "Free waiting minutes", step: "1" },
  { key: "nightSurchargePct", label: "Night premium (% of fare)", step: "5" },
  { key: "minimumFare", label: "Minimum fare (₹)", step: "5" },
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
  const [roundTrip, setRoundTrip] = useState(TRIP_DEFAULTS.roundTrip);
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
    const card = { surgeable: vehicle.surgeable };
    for (const field of RATE_FIELDS) card[field.key] = toNum(rateInputs[field.key]);
    return card;
  }, [rateInputs, vehicle.surgeable]);

  const result = useMemo(
    () =>
      estimateFare({
        rate,
        distanceKm: toNum(distanceKm),
        roundTrip,
        waitingMinutes: waitingMinutes.trim() === "" ? 0 : toNum(waitingMinutes),
        rideMinutes: rideMinutes.trim() === "" ? 0 : toNum(rideMinutes),
        pickupTime,
        surgeMultiplier: surgeMultiplier.trim() === "" ? 1 : toNum(surgeMultiplier),
        tollsAndParking: tollsAndParking.trim() === "" ? 0 : toNum(tollsAndParking),
      }),
    [
      rate,
      distanceKm,
      roundTrip,
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
      "Jaipur fare estimate",
      `Vehicle: ${vehicle.label}`,
      `Distance: ${NUM.format(result.oneWayKm)} km one way${result.roundTrip ? ` (round trip, ${NUM.format(result.distanceKm)} km charged)` : ""}`,
      `Pickup time: ${pickupTime}${result.isNight ? " (night premium applied)" : ""}`,
      `Distance fare: ${money2(result.distanceFare)}`,
      result.rideTimeFare > 0 ? `Ride-time fare: ${money2(result.rideTimeFare)}` : null,
      result.waitingFare > 0 ? `Waiting charge: ${money2(result.waitingFare)}` : null,
      result.nightSurcharge > 0
        ? `Night premium (${result.nightSurchargePct}%): ${money2(result.nightSurcharge)}`
        : null,
      result.surgeAmount > 0
        ? `Surge (x${NUM.format(result.surge)}): ${money2(result.surgeAmount)}`
        : null,
      result.tolls > 0 ? `Tolls, entry fees and parking: ${money2(result.tolls)}` : null,
      `Fair fare: ${money(result.payable)}`,
      `Negotiating band: open at ${money(result.openingOffer)}, walk away above ${money(result.walkAway)}`,
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
    setRoundTrip(TRIP_DEFAULTS.roundTrip);
    setWaitingMinutes(TRIP_DEFAULTS.waitingMinutes);
    setRideMinutes(TRIP_DEFAULTS.rideMinutes);
    setPickupTime(TRIP_DEFAULTS.pickupTime);
    setSurgeMultiplier(TRIP_DEFAULTS.surgeMultiplier);
    setTollsAndParking(TRIP_DEFAULTS.tollsAndParking);
    setCopied(false);
  };

  const rows = [
    ["Chargeable distance", hasError ? DASH : `${NUM.format(result.distanceKm)} km`],
    ["Distance fare", hasError ? DASH : money2(result.distanceFare)],
    ["Ride-time charge", hasError ? DASH : money2(result.rideTimeFare)],
    ["Waiting charge", hasError ? DASH : money2(result.waitingFare)],
    [
      `Night premium${hasError ? "" : ` (${result.nightSurchargePct}%)`}`,
      hasError ? DASH : money2(result.nightSurcharge),
    ],
    [
      `Surge${hasError ? "" : ` (x${NUM.format(result.surge)})`}`,
      hasError ? DASH : money2(result.surgeAmount),
    ],
    ["Minimum-fare top-up", hasError ? DASH : money2(result.minimumTopUp)],
    ["Tolls, entry fees and parking", hasError ? DASH : money2(result.tolls)],
    ["Effective cost per km", hasError ? DASH : `${money2(result.perKmEffective)}/km`],
    ["Open the negotiation at", hasError ? DASH : money(result.openingOffer)],
    ["Walk away above", hasError ? DASH : money(result.walkAway)],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <CarTaxiFront className="h-4 w-4" aria-hidden="true" />
          Jaipur transport
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Jaipur Auto and Cab Fare Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Jaipur autos are negotiated rather than metered, so this works out what the trip is
          actually worth — base fare plus a per-kilometre rate, waiting time, round-trip distance and
          a night premium — and hands you a number to open the conversation with. App cabs are priced
          the way aggregators do it, so you can compare a quote against the same trip at 1.0x.
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
              {vehicle.negotiated
                ? "A benchmark rate to negotiate against, not a notified meter — Jaipur street vehicles quote a lump sum. Edit the card below if local rates have moved."
                : "Typical Jaipur app pricing, not a notified tariff. Edit the card below to match the fare breakdown your app shows."}
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="fare-distance">
              One-way distance (km)
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

          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              htmlFor="fare-round-trip"
            >
              <input
                id="fare-round-trip"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={roundTrip}
                onChange={(event) => setRoundTrip(event.target.checked)}
              />
              <span className="text-sm font-semibold">
                Round trip — the driver waits and brings you back
              </span>
            </label>
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              Doubles the chargeable distance. Add the halt itself under waiting time — an Amber Fort
              visit is usually 90 to 120 minutes.
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
              step="5"
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
                : "Not billed on a negotiated fare — distance only."}
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
                : "A street vehicle has no surge — the night premium covers late pickups."}
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="fare-tolls">
              Tolls, entry fees and parking (₹)
            </label>
            <input
              id="fare-tolls"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={tollsAndParking}
              onChange={(event) => setTollsAndParking(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
            Common Jaipur runs (one way)
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
            Rates are prefilled from the card above and reset whenever you change the vehicle. None
            of these are notified figures for Jaipur, so overwrite any of them with what drivers are
            actually asking on your route.
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
              Fair fare
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.payable)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a fare."
                : `Open at ${money(result.openingOffer)}, walk away above ${money(result.walkAway)}`}
            </p>
            {!hasError && result.isNight && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)]">
                <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                Night premium applied (11 pm – 5 am)
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Jaipur fare estimate"
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
        <h2 className="text-base font-semibold">Starting rate cards</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
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
                  Minimum
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Late night
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
                  <td className="py-2 pr-3 text-right">{INR.format(item.minimumFare)}</td>
                  <td className="py-2 text-right">
                    {item.nightSurchargePct > 0 ? `+${item.nightSurchargePct}%` : "surge"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          None of these rows is a notified Jaipur tariff. Autos and e-rickshaws here quote a lump sum
          rather than running a meter, so the cards are benchmarks built from the same base-plus-per-km
          structure other Indian city tariffs use, and every figure is editable.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only, for planning and for checking a quote. Amber Fort, Nahargarh and Jaigarh
        parking and monument entry are charged separately, and app fares include GST and airport
        pick-up fees that are not modelled here. Agree the fare before the trip starts.
      </p>
    </main>
  );
}
