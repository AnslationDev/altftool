"use client";

import { useMemo, useState } from "react";
import { CarFront, Check, Copy, RotateCcw, TriangleAlert, Wine } from "lucide-react";

import {
  COUNTRY,
  EQUIPMENT,
  KEY_RULES,
  LICENCE_ORIGINS,
  STATES,
  assessTrip,
  convertSpeed,
  estimateBac,
  hoursUntilLegal,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const BAC = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});
const DASH = "—";

const DEFAULTS = {
  ageYears: "35",
  stateId: "california",
  licenceOrigin: "foreign_english",
  stayDays: "14",
  towingTrailer: false,
  commercialVehicle: false,
  speedValue: "70",
  speedUnit: "mph",
  drinks: "3",
  drinkVolumeMl: "355",
  abvPercent: "5",
  bodyWeightKg: "80",
  sex: "male",
  hoursSinceFirstDrink: "2",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const CHECKBOX_LABEL =
  "inline-flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)]";

export default function ToolHome() {
  const [ageYears, setAgeYears] = useState(DEFAULTS.ageYears);
  const [stateId, setStateId] = useState(DEFAULTS.stateId);
  const [licenceOrigin, setLicenceOrigin] = useState(DEFAULTS.licenceOrigin);
  const [stayDays, setStayDays] = useState(DEFAULTS.stayDays);
  const [towingTrailer, setTowingTrailer] = useState(DEFAULTS.towingTrailer);
  const [commercialVehicle, setCommercialVehicle] = useState(DEFAULTS.commercialVehicle);
  const [speedValue, setSpeedValue] = useState(DEFAULTS.speedValue);
  const [speedUnit, setSpeedUnit] = useState(DEFAULTS.speedUnit);
  const [drinks, setDrinks] = useState(DEFAULTS.drinks);
  const [drinkVolumeMl, setDrinkVolumeMl] = useState(DEFAULTS.drinkVolumeMl);
  const [abvPercent, setAbvPercent] = useState(DEFAULTS.abvPercent);
  const [bodyWeightKg, setBodyWeightKg] = useState(DEFAULTS.bodyWeightKg);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [hoursSinceFirstDrink, setHoursSinceFirstDrink] = useState(DEFAULTS.hoursSinceFirstDrink);
  const [copied, setCopied] = useState(false);

  const trip = useMemo(
    () =>
      assessTrip({
        ageYears,
        stateId,
        licenceOrigin,
        stayDays,
        towingTrailer,
        commercialVehicle,
      }),
    [ageYears, stateId, licenceOrigin, stayDays, towingTrailer, commercialVehicle],
  );

  const conversion = useMemo(() => convertSpeed(speedValue, speedUnit), [speedValue, speedUnit]);

  const bac = useMemo(
    () =>
      estimateBac({
        drinks,
        drinkVolumeMl,
        abvPercent,
        bodyWeightKg,
        sex,
        hoursSinceFirstDrink,
      }),
    [drinks, drinkVolumeMl, abvPercent, bodyWeightKg, sex, hoursSinceFirstDrink],
  );

  const legal = useMemo(() => {
    if (trip.error || bac.error) return null;
    return hoursUntilLegal(bac.bacPercent, trip.alcohol.limitBacPercent);
  }, [trip, bac]);

  const ok = !trip.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `Driving in ${COUNTRY.shortName} ${DASH} rules summary (${trip.state.label})`,
      `Drive on the ${COUNTRY.driveSide}; ${COUNTRY.steeringWheelSide}-hand-drive cars; speeds posted in ${COUNTRY.speedUnit}.`,
      `Your blood-alcohol limit: ${BAC.format(trip.alcohol.limitBacPercent)}% (${trip.alcohol.category}).`,
      `International Driving Permit needed: ${trip.permit.needsIdp ? "yes" : "no"}.`,
      "",
      "Speed limits:",
      ...trip.speeds.map((row) => `  ${row.label}: ${row.mph} mph (${row.kmh} km/h)`),
      "",
      `Emergency: ${COUNTRY.emergencyNumbers.map(([number, use]) => `${number} (${use})`).join(", ")}`,
    ].join("\n");
  }, [ok, trip]);

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
    setAgeYears(DEFAULTS.ageYears);
    setStateId(DEFAULTS.stateId);
    setLicenceOrigin(DEFAULTS.licenceOrigin);
    setStayDays(DEFAULTS.stayDays);
    setTowingTrailer(DEFAULTS.towingTrailer);
    setCommercialVehicle(DEFAULTS.commercialVehicle);
    setSpeedValue(DEFAULTS.speedValue);
    setSpeedUnit(DEFAULTS.speedUnit);
    setDrinks(DEFAULTS.drinks);
    setDrinkVolumeMl(DEFAULTS.drinkVolumeMl);
    setAbvPercent(DEFAULTS.abvPercent);
    setBodyWeightKg(DEFAULTS.bodyWeightKg);
    setSex(DEFAULTS.sex);
    setHoursSinceFirstDrink(DEFAULTS.hoursSinceFirstDrink);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CarFront className="h-4 w-4" aria-hidden="true" />
          Driving abroad
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Driving in USA Rules Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Traffic law in the United States is state law. Pick the state you are driving in and see
          the speed limits in mph and km/h, the blood-alcohol limit that applies to <em>you</em>,
          and whether your licence needs an International Driving Permit.
        </p>
      </header>

      <section className={CARD} aria-labelledby="us-details">
        <h2 id="us-details" className="text-base font-semibold">
          Your details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="us-state">
              State you are driving in
            </label>
            <select
              id="us-state"
              className={`mt-2 ${INPUT_CLASS}`}
              value={stateId}
              onChange={(event) => setStateId(event.target.value)}
            >
              {STATES.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="us-age">
              Your age (years)
            </label>
            <input
              id="us-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="14"
              max="110"
              step="1"
              value={ageYears}
              onChange={(event) => setAgeYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="us-stay">
              Length of stay (days)
            </label>
            <input
              id="us-stay"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="3650"
              step="1"
              value={stayDays}
              onChange={(event) => setStayDays(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="us-origin">
              Where your licence was issued
            </label>
            <select
              id="us-origin"
              className={`mt-2 ${INPUT_CLASS}`}
              value={licenceOrigin}
              onChange={(event) => setLicenceOrigin(event.target.value)}
            >
              {LICENCE_ORIGINS.map((origin) => (
                <option key={origin.id} value={origin.id}>
                  {origin.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className={CHECKBOX_LABEL} htmlFor="us-towing">
              <input
                id="us-towing"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={towingTrailer}
                onChange={(event) => setTowingTrailer(event.target.checked)}
              />
              Towing a trailer or RV
            </label>
          </div>
          <div className="flex items-end">
            <label className={CHECKBOX_LABEL} htmlFor="us-commercial">
              <input
                id="us-commercial"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={commercialVehicle}
                onChange={(event) => setCommercialVehicle(event.target.checked)}
              />
              Driving a commercial vehicle
            </label>
          </div>
        </div>
      </section>

      {trip.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {trip.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`} aria-live="polite" role="status">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your legal blood-alcohol limit{ok ? ` in ${trip.state.label}` : ""}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${BAC.format(trip.alcohol.limitBacPercent)} %` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? trip.alcohol.category : "Fix the highlighted input to see your limit."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the US driving rules summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
            ["Which side of the road", `Drive on the ${COUNTRY.driveSide} · ${COUNTRY.steeringWheelSide}-hand-drive cars`],
            ["Speeds are posted in", `${COUNTRY.speedUnit} — miles per hour, not km/h`],
            ["Minimum age to drive", `${COUNTRY.minimumDrivingAgeYears} years in most states`],
            ["Typical car-hire minimum age", `${COUNTRY.typicalRentalMinimumAgeYears} years, with a surcharge under 25`],
            ["Legal drinking age", `${COUNTRY.drinkingAgeYears} years, nationwide`],
            ["International Driving Permit", ok ? (trip.permit.needsIdp ? "Carry one with your licence" : "Not required") : DASH],
            ["Why this alcohol limit", ok ? trip.alcohol.reason : DASH],
            ["What happens if you exceed it", ok ? trip.alcohol.penalty : DASH],
            [
              "Highest speed limit in this state",
              ok
                ? `${trip.state.maxMph} mph${
                    trip.state.notableMaxMph ? ` (${trip.state.notableMaxMph} mph on one specific toll road — see the speed table below)` : ""
                  }`
                : DASH,
            ],
            ["Emergency number", COUNTRY.emergencyNumbers.map(([number, use]) => `${number} — ${use}`).join(" · ")],
            ["Tolls", COUNTRY.tolls],
            ["Fuel", COUNTRY.fuelNote],
          ].map(([label, value]) => (
            <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="font-medium sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && trip.permit.blockers.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {trip.permit.blockers.map((item) => (
              <li
                key={item}
                role="alert"
                className="flex gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {ok && trip.permit.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {trip.permit.warnings.map((item) => (
              <li
                key={item}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning-text)]"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="us-speeds">
        <h2 id="us-speeds" className="text-base font-semibold">
          Speed limits{towingTrailer ? " (towing)" : ""} in {ok ? trip.state.label : "this state"}
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Road
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  mph
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  km/h
                </th>
              </tr>
            </thead>
            <tbody>
              {ok
                ? trip.speeds.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] align-top last:border-0">
                      <td className="py-2.5 pr-3">
                        <span className="font-semibold">{row.label}</span>
                        <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                          {row.note}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-right font-semibold">{row.mph}</td>
                      <td className="py-2.5 text-right text-[var(--muted-foreground)]">{row.kmh}</td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          A posted sign always beats the statutory default. Limits change without warning at city
          limits and school zones, and enforcement tolerance in the US is far narrower than most
          visitors expect.
        </p>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="us-convert">
        <h2 id="us-convert" className="text-base font-semibold">
          Convert a speed
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="us-speed-value">
              Speed
            </label>
            <input
              id="us-speed-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="1000"
              step="1"
              value={speedValue}
              onChange={(event) => setSpeedValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="us-speed-unit">
              Entered in
            </label>
            <select
              id="us-speed-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={speedUnit}
              onChange={(event) => setSpeedUnit(event.target.value)}
            >
              <option value="mph">mph (US signs)</option>
              <option value="kmh">km/h (most of the world)</option>
            </select>
          </div>
        </div>
        {conversion.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {conversion.error}
          </p>
        ) : (
          <p className="mt-4 text-2xl font-semibold">
            {NUM.format(conversion.mph)} mph = {NUM.format(conversion.kmh)} km/h
          </p>
        )}
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="us-alcohol" aria-live="polite" role="status">
        <h2 id="us-alcohol" className="flex items-center gap-2 text-base font-semibold">
          <Wine className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          Morning-after estimate
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          A Widmark-equation estimate of where your blood alcohol sits. A US standard drink is 14 g
          of pure alcohol — about a 355 ml beer at 5% ABV. This is a rough statistical model, never
          a green light to drive.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="us-drinks">
              Number of drinks
            </label>
            <input
              id="us-drinks"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={drinks}
              onChange={(event) => setDrinks(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="us-volume">
              Size of each drink (ml)
            </label>
            <input
              id="us-volume"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="2000"
              step="5"
              value={drinkVolumeMl}
              onChange={(event) => setDrinkVolumeMl(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="us-abv">
              Strength (% ABV)
            </label>
            <input
              id="us-abv"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={abvPercent}
              onChange={(event) => setAbvPercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="us-weight">
              Body weight (kg)
            </label>
            <input
              id="us-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="30"
              max="400"
              step="1"
              value={bodyWeightKg}
              onChange={(event) => setBodyWeightKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="us-sex">
              Body composition factor
            </label>
            <select
              id="us-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Male (r = 0.68)</option>
              <option value="female">Female (r = 0.55)</option>
              <option value="average">Unspecified (r = 0.615)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="us-hours">
              Hours since the first drink
            </label>
            <input
              id="us-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="72"
              step="0.5"
              value={hoursSinceFirstDrink}
              onChange={(event) => setHoursSinceFirstDrink(event.target.value)}
            />
          </div>
        </div>

        {bac.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {bac.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Pure alcohol consumed",
              bac.error ? DASH : `${NUM.format(bac.gramsAlcohol)} g (${NUM.format(bac.standardDrinks)} US standard drinks)`,
            ],
            ["Estimated blood alcohol now", bac.error ? DASH : `${BAC.format(bac.bacPercent)} %`],
            ["Estimated peak", bac.error ? DASH : `${BAC.format(bac.peakBacPercent)} %`],
            ["Hours until it reaches zero", bac.error ? DASH : `${NUM.format(bac.hoursToZero)} h`],
            [
              "Against your legal limit",
              !legal || bac.error || trip.error
                ? DASH
                : legal.alreadyUnder
                  ? "Below the limit on this estimate — still not proof of fitness to drive"
                  : `About ${NUM.format(legal.hours)} more hours before you would be under the limit`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="font-medium sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="us-equipment">
        <h2 id="us-equipment" className="text-base font-semibold">
          What has to be in the car
        </h2>
        <ul className="mt-3 space-y-3 text-sm">
          {EQUIPMENT.map(([item, detail]) => (
            <li key={item}>
              <span className="font-semibold">{item}</span>
              <span className="block text-[var(--muted-foreground)]">{detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="us-rules">
        <h2 id="us-rules" className="text-base font-semibold">
          Rules that catch visitors out
        </h2>
        <ul className="mt-3 space-y-3 text-sm">
          {KEY_RULES.map(([title, detail]) => (
            <li key={title}>
              <span className="font-semibold">{title}</span>
              <span className="block text-[var(--muted-foreground)]">{detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational summary only, not legal advice. US traffic law is set state by state and
        changes regularly, and a posted sign always overrides the defaults shown here. Confirm the
        current rules with your rental company, your insurer and the state DMV before you travel.
        The alcohol figure is a statistical model with wide individual variation — the only safe
        amount before driving is none.
      </p>
    </main>
  );
}
