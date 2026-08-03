"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plane, RotateCcw } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  CAFFEINE_CUTOFF_HOURS_BEFORE_SLEEP,
  DEFAULT_CABIN_RH,
  DEFAULT_CABIN_TEMP_C,
  DRINK_TYPES,
  MAX_CABIN_ALTITUDE_FT,
  computeFlightHydration,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

/** Render an arrivalDayOffset as "(+1 day)" / "(1 day earlier)" - never the
 * malformed "(+-1 day)" you get from blindly prefixing a signed number with
 * a literal "+". Westward routes with a large UTC-offset spread can land a
 * negative offset (arrival is calendar-earlier than departure). */
function formatDayOffset(days) {
  if (!days) return "";
  const plural = Math.abs(days) === 1 ? "day" : "days";
  return days > 0 ? ` (+${days} ${plural})` : ` (${Math.abs(days)} ${plural} earlier)`;
}

const DEFAULTS = {
  weight: "70",
  hours: "10",
  temp: String(DEFAULT_CABIN_TEMP_C),
  rh: String(DEFAULT_CABIN_RH),
  drinks: { beer: "1", wine: "0", spirit: "0" },
  coffees: "1",
  teas: "0",
  depart: "02:30",
  originOffset: "5.5",
  destOffset: "1",
  bedtime: "23:00",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [temp, setTemp] = useState(DEFAULTS.temp);
  const [rh, setRh] = useState(DEFAULTS.rh);
  const [drinks, setDrinks] = useState(DEFAULTS.drinks);
  const [coffees, setCoffees] = useState(DEFAULTS.coffees);
  const [teas, setTeas] = useState(DEFAULTS.teas);
  const [depart, setDepart] = useState(DEFAULTS.depart);
  const [originOffset, setOriginOffset] = useState(DEFAULTS.originOffset);
  const [destOffset, setDestOffset] = useState(DEFAULTS.destOffset);
  const [bedtime, setBedtime] = useState(DEFAULTS.bedtime);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const num = (value) => (value === "" ? NaN : Number(value));

  const result = useMemo(() => {
    const parsedDrinks = {};
    for (const type of DRINK_TYPES) {
      parsedDrinks[type.id] = drinks[type.id] === "" ? NaN : Number(drinks[type.id]);
    }
    return computeFlightHydration({
      weightKg: num(weight),
      flightHours: num(hours),
      cabinTempC: num(temp),
      cabinRh: num(rh),
      drinks: parsedDrinks,
      coffees: num(coffees),
      teas: num(teas),
      departTime: depart,
      originUtcOffset: num(originOffset),
      destUtcOffset: num(destOffset),
      destBedtime: bedtime,
    });
  }, [weight, hours, temp, rh, drinks, coffees, teas, depart, originOffset, destOffset, bedtime]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Flight Hydration Planner",
      `Flight: ${hours} h, cabin ${temp} °C / ${rh}% RH`,
      `Drink in flight: ${NUM.format(result.totalDrinkMl)} ml (${NUM.format(result.perSlotMl)} ml per hour)`,
      `That is about ${result.bottlesOf500} × 500 ml bottles.`,
      `Dry cabin air costs: ${NUM.format(result.dryAirExtraMl)} ml`,
      `Alcohol costs: ${NUM.format(result.alcoholDiuresisMl)} ml (${result.alcoholGrams} g ethanol)`,
      `Caffeine costs: ${NUM.format(result.caffeineDiuresisMl)} ml (${NUM.format(result.caffeineMg)} mg)`,
      `Arrival local time: ${result.arrivalLocalTime}${formatDayOffset(result.arrivalDayOffset)}`,
      `Time zones crossed: ${result.zonesCrossed} ${result.direction}`,
      `Last caffeine: ${result.caffeineCutoffDest} destination time`,
    ].join("\n");
  }, [hasError, result, hours, temp, rh]);

  const copied = isCopied("plan");

  const copyResult = () => {
    if (!summary) return;
    copy("plan", summary, { label: "flight hydration plan" });
  };

  const reset = () => {
    setWeight(DEFAULTS.weight);
    setHours(DEFAULTS.hours);
    setTemp(DEFAULTS.temp);
    setRh(DEFAULTS.rh);
    setDrinks(DEFAULTS.drinks);
    setCoffees(DEFAULTS.coffees);
    setTeas(DEFAULTS.teas);
    setDepart(DEFAULTS.depart);
    setOriginOffset(DEFAULTS.originOffset);
    setDestOffset(DEFAULTS.destOffset);
    setBedtime(DEFAULTS.bedtime);
    resetCopyState();
  };

  const rows = [
    ["Baseline need for the hours in the air", hasError ? DASH : `${NUM.format(result.baselineShareMl)} ml`],
    ["Extra from breathing dry cabin air", hasError ? DASH : `${NUM.format(result.respiratoryExtraMl)} ml`],
    ["Extra lost through the skin", hasError ? DASH : `${NUM.format(result.tewlExtraMl)} ml`],
    [
      "Extra urine from alcohol",
      hasError ? DASH : `${NUM.format(result.alcoholDiuresisMl)} ml (${result.alcoholGrams} g ethanol)`,
    ],
    [
      "Extra urine from caffeine",
      hasError ? DASH : `${NUM.format(result.caffeineDiuresisMl)} ml (${NUM.format(result.caffeineMg)} mg)`,
    ],
    ["Cabin air water content", hasError ? DASH : `${result.cabinAbsoluteHumidity} g/m³`],
    ["Same figure in a normal room", hasError ? DASH : `${result.referenceAbsoluteHumidity} g/m³`],
    ["Bottles to plan for", hasError ? DASH : `${result.bottlesOf500} × 500 ml`],
  ];

  const timeRows = [
    [
      "Arrival, destination local time",
      hasError ? DASH : `${result.arrivalLocalTime}${formatDayOffset(result.arrivalDayOffset)}`,
    ],
    [
      "Time zones crossed",
      hasError
        ? DASH
        : result.direction === "none"
          ? "None — same time zone"
          : `${result.zonesCrossed} ${result.direction}`,
    ],
    [
      "Rough jet lag recovery",
      hasError ? DASH : result.jetlagDays === 0 ? "None expected" : `about ${result.jetlagDays} days`,
    ],
    ["Last caffeine, destination time", hasError ? DASH : result.caffeineCutoffDest],
    ["Same moment on your departure clock", hasError ? DASH : result.caffeineCutoffOrigin],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Plane className="h-4 w-4" aria-hidden="true" />
          Flight hydration
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Flight Hydration Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Cabins are pressurised to as high as {NUM.format(MAX_CABIN_ALTITUDE_FT)} ft with humidity
          around 10-20%. This works out what that dryness really costs you, sets it against the
          alcohol and caffeine you plan to have, and gives an hourly drinking plan plus your arrival
          clock.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fh-weight">
              Body weight (kg)
            </label>
            <input
              id="fh-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fh-hours">
              Flight time (hours)
            </label>
            <input
              id="fh-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="20"
              step="0.5"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fh-temp">
              Cabin temperature (°C)
            </label>
            <input
              id="fh-temp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="10"
              max="35"
              step="1"
              value={temp}
              onChange={(event) => setTemp(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fh-rh">
              Cabin humidity (%)
            </label>
            <input
              id="fh-rh"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={rh}
              onChange={(event) => setRh(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fh-coffees">
              Coffees on board
            </label>
            <input
              id="fh-coffees"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={coffees}
              onChange={(event) => setCoffees(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fh-teas">
              Teas on board
            </label>
            <input
              id="fh-teas"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={teas}
              onChange={(event) => setTeas(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Alcoholic drinks you expect to have
          </legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {DRINK_TYPES.map((type) => (
              <div key={type.id}>
                <label className={LABEL_CLASS} htmlFor={`fh-drink-${type.id}`}>
                  {type.label}
                </label>
                <input
                  id={`fh-drink-${type.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="20"
                  step="1"
                  value={drinks[type.id]}
                  onChange={(event) =>
                    setDrinks((current) => ({ ...current, [type.id]: event.target.value }))
                  }
                />
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Times and time zones
          </legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="fh-depart">
                Departure time (local)
              </label>
              <input
                id="fh-depart"
                className={`mt-2 ${INPUT_CLASS}`}
                type="time"
                value={depart}
                onChange={(event) => setDepart(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="fh-bedtime">
                Intended bedtime at destination
              </label>
              <input
                id="fh-bedtime"
                className={`mt-2 ${INPUT_CLASS}`}
                type="time"
                value={bedtime}
                onChange={(event) => setBedtime(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="fh-origin">
                Departure UTC offset (hours)
              </label>
              <input
                id="fh-origin"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="-12"
                max="14"
                step="0.5"
                value={originOffset}
                onChange={(event) => setOriginOffset(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="fh-dest">
                Destination UTC offset (hours)
              </label>
              <input
                id="fh-dest"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="-12"
                max="14"
                step="0.5"
                value={destOffset}
                onChange={(event) => setDestOffset(event.target.value)}
              />
            </div>
          </div>
        </fieldset>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Drink during the flight
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.totalDrinkMl)} ml`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a figure."
                : `About ${NUM.format(result.perSlotMl)} ml every hour — roughly ${result.bottlesOf500} bottles of 500 ml`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={copied ? "Copied result" : "Copy result"}
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
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.alcoholOutweighsAir && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            The alcohol you have planned costs you {NUM.format(result.alcoholDiuresisMl)} ml of extra
            urine — more than the dry cabin air does at {NUM.format(result.dryAirExtraMl)} ml. Skipping
            one drink does more for your arrival than any amount of extra water.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" role="status">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Arrival and time zones</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm" aria-live="polite" role="status">
          {timeRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Caffeine has a mean half-life of about five hours, so the cutoff is set{" "}
          {CAFFEINE_CUTOFF_HOURS_BEFORE_SLEEP} hours before your intended bedtime at the destination.
        </p>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Hour-by-hour plan</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[260px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Hour in the air
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Drink
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Running total
                  </th>
                </tr>
              </thead>
              <tbody aria-live="polite" role="status">
                {result.schedule.map((slot) => (
                  <tr key={slot.hour} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">Hour {slot.hour}</td>
                    <td className="py-2 pr-3 text-right">{NUM.format(slot.amountMl)} ml</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {NUM.format(slot.cumulativeMl)} ml
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate for healthy adults, not medical advice. The dry-air figure is smaller
        than most travel advice implies — dry eyes, nose and throat on a flight come from surface
        evaporation rather than whole-body dehydration. If you take diuretics, have heart or kidney
        disease, or are pregnant, follow your clinician's advice on flying and fluids.
      </p>
    </main>
  );
}
