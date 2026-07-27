"use client";

import { useMemo, useState } from "react";
import { CarFront, Check, Copy, RotateCcw, TriangleAlert, Wine } from "lucide-react";

import {
  BLACK_POINT_SUSPENSION_THRESHOLD,
  BLACK_POINT_WINDOW_MONTHS,
  COUNTRY,
  LICENCE_ORIGINS,
  RESIDENCY_STATUSES,
  assessTrip,
  blackPointStatus,
  convertSpeed,
  estimateBac,
  hoursUntilLegal,
} from "../lib";

const NUM = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });
const BAC = new Intl.NumberFormat("en-GB", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});
const DASH = "—";

const DEFAULTS = {
  ageYears: "35",
  residencyStatus: "tourist",
  licenceOrigin: "approved",
  blackPoints: "8",
  speedValue: "140",
  speedUnit: "kmh",
  drinks: "1",
  drinkVolumeMl: "175",
  abvPercent: "13",
  bodyWeightKg: "60",
  sex: "female",
  hoursSinceFirstDrink: "0",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";

export default function ToolHome() {
  const [ageYears, setAgeYears] = useState(DEFAULTS.ageYears);
  const [residencyStatus, setResidencyStatus] = useState(DEFAULTS.residencyStatus);
  const [licenceOrigin, setLicenceOrigin] = useState(DEFAULTS.licenceOrigin);
  const [blackPoints, setBlackPoints] = useState(DEFAULTS.blackPoints);
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
    () => assessTrip({ ageYears, residencyStatus, licenceOrigin }),
    [ageYears, residencyStatus, licenceOrigin],
  );

  const points = useMemo(() => blackPointStatus(blackPoints), [blackPoints]);
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
      `Driving in ${COUNTRY.shortName} ${DASH} rules summary`,
      `Drive on the ${COUNTRY.driveSide}; ${COUNTRY.steeringWheelSide}-hand-drive cars; speeds in ${COUNTRY.speedUnit}.`,
      "Blood-alcohol limit: zero. Any detectable alcohol is the offence.",
      `Licence accepted for you: ${trip.permit.canDrive ? "yes" : "no"} (${trip.permit.residency.label}).`,
      `Black points that suspend a licence: ${BLACK_POINT_SUSPENSION_THRESHOLD} in ${BLACK_POINT_WINDOW_MONTHS} months.`,
      "",
      "Speed limits:",
      ...trip.speeds.map((row) => `  ${row.label}: ${row.kmh} km/h (${row.mph} mph)`),
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
    setResidencyStatus(DEFAULTS.residencyStatus);
    setLicenceOrigin(DEFAULTS.licenceOrigin);
    setBlackPoints(DEFAULTS.blackPoints);
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
          Driving in UAE Rules Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          You drive on the right with signs in km/h, the alcohol limit is zero rather than low, and
          whether your licence is accepted turns on your visa status rather than your passport.
          Check all three before you collect a car in {COUNTRY.localName}.
        </p>
      </header>

      <section className={CARD} aria-labelledby="ae-details">
        <h2 id="ae-details" className="text-base font-semibold">
          Your details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ae-residency">
              Your status in the UAE
            </label>
            <select
              id="ae-residency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={residencyStatus}
              onChange={(event) => setResidencyStatus(event.target.value)}
            >
              {RESIDENCY_STATUSES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ae-origin">
              Where your licence was issued
            </label>
            <select
              id="ae-origin"
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
          <div>
            <label className={LABEL_CLASS} htmlFor="ae-age">
              Your age (years)
            </label>
            <input
              id="ae-age"
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
            <label className={LABEL_CLASS} htmlFor="ae-points">
              Black points on your UAE record
            </label>
            <input
              id="ae-points"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="500"
              step="1"
              value={blackPoints}
              onChange={(event) => setBlackPoints(event.target.value)}
            />
          </div>
        </div>
        {ok ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-5 text-[var(--foreground)]">
            {trip.permit.origin.summary}
          </p>
        ) : null}
      </section>

      {trip.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {trip.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your legal blood-alcohol limit in the UAE
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${BAC.format(trip.alcohol.limitBacPercent)} %` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${trip.alcohol.category} — there is no permitted concentration at all`
                : "Fix the highlighted input to see the summary."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the UAE driving rules summary"
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
            ["Speeds are posted in", COUNTRY.speedUnit],
            ["Licence accepted for you", ok ? (trip.permit.canDrive ? "Yes" : "No — see the warnings below") : DASH],
            ["International Driving Permit", ok ? (trip.permit.needsIdp ? "Required with your licence" : "Not required") : DASH],
            ["Minimum driving age", `${COUNTRY.minimumDrivingAgeYears} years`],
            ["Typical car-hire minimum age", `${COUNTRY.typicalRentalMinimumAgeYears} years, often 25 for premium categories`],
            ["Why the alcohol limit is zero", ok ? trip.alcohol.reason : DASH],
            ["What happens if you are caught", ok ? trip.alcohol.penalty : DASH],
            ["Black points that suspend a licence", `${BLACK_POINT_SUSPENSION_THRESHOLD} within ${BLACK_POINT_WINDOW_MONTHS} months`],
            ["Enforcement buffer", "Assume none — Dubai removed its 20 km/h grace margin in 2018"],
            ["Emergency numbers", COUNTRY.emergencyNumbers.map(([number, use]) => `${number} — ${use}`).join(" · ")],
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

      <section className={`mt-6 ${CARD}`} aria-labelledby="ae-points-panel">
        <h2 id="ae-points-panel" className="text-base font-semibold">
          Black points against suspension
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          Points accumulate on a rolling {BLACK_POINT_WINDOW_MONTHS}-month view and reaching{" "}
          {BLACK_POINT_SUSPENSION_THRESHOLD} suspends the licence. Serious offences also allow the
          vehicle itself to be impounded.
        </p>
        {points.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {points.error}
          </p>
        ) : (
          <>
            <p className="mt-4 text-3xl font-semibold text-[var(--primary)]">
              {points.points} / {points.threshold}
            </p>
            <div
              className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${points.percentOfThreshold}% of the way to a licence suspension`}
            >
              <span
                className={`block h-full ${points.suspended ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
                style={{ width: `${Math.max(0, Math.min(100, points.percentOfThreshold))}%` }}
              />
            </div>
            <p
              className={`mt-3 rounded-md px-3 py-2 text-sm ${
                points.suspended
                  ? "bg-[var(--danger-soft)] font-medium text-[var(--danger)]"
                  : "bg-[var(--muted)] text-[var(--foreground)]"
              }`}
              role={points.suspended ? "alert" : undefined}
            >
              {points.message}
            </p>
          </>
        )}
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="ae-speeds">
        <h2 id="ae-speeds" className="text-base font-semibold">
          Speed limits
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Road
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  km/h
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  mph
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
                      <td className="py-2.5 pr-3 text-right font-semibold">{row.kmh}</td>
                      <td className="py-2.5 text-right text-[var(--muted-foreground)]">{row.mph}</td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="ae-convert">
        <h2 id="ae-convert" className="text-base font-semibold">
          Convert a speed
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ae-speed-value">
              Speed
            </label>
            <input
              id="ae-speed-value"
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
            <label className={LABEL_CLASS} htmlFor="ae-speed-unit">
              Entered in
            </label>
            <select
              id="ae-speed-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={speedUnit}
              onChange={(event) => setSpeedUnit(event.target.value)}
            >
              <option value="kmh">km/h (UAE signs)</option>
              <option value="mph">mph (UK and US)</option>
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
            {NUM.format(conversion.kmh)} km/h = {NUM.format(conversion.mph)} mph
          </p>
        )}
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="ae-alcohol">
        <h2 id="ae-alcohol" className="flex items-center gap-2 text-base font-semibold">
          <Wine className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          How long until you are back at zero
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          Because the legal figure is zero, the only useful number is how long it takes to clear
          the alcohol entirely. This Widmark-equation estimate is a rough statistical model with
          wide individual variation, so treat it as a floor rather than a clearance.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ae-drinks">
              Number of drinks
            </label>
            <input
              id="ae-drinks"
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
            <label className={LABEL_CLASS} htmlFor="ae-volume">
              Size of each drink (ml)
            </label>
            <input
              id="ae-volume"
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
            <label className={LABEL_CLASS} htmlFor="ae-abv">
              Strength (% ABV)
            </label>
            <input
              id="ae-abv"
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
            <label className={LABEL_CLASS} htmlFor="ae-weight">
              Body weight (kg)
            </label>
            <input
              id="ae-weight"
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
            <label className={LABEL_CLASS} htmlFor="ae-sex">
              Body composition factor
            </label>
            <select
              id="ae-sex"
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
            <label className={LABEL_CLASS} htmlFor="ae-hours">
              Hours since the first drink
            </label>
            <input
              id="ae-hours"
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
              bac.error ? DASH : `${NUM.format(bac.gramsAlcohol)} g (${NUM.format(bac.standardDrinks)} standard drinks)`,
            ],
            ["Estimated blood alcohol now", bac.error ? DASH : `${BAC.format(bac.bacPercent)} %`],
            ["Estimated peak", bac.error ? DASH : `${BAC.format(bac.peakBacPercent)} %`],
            ["Hours until it reaches zero", bac.error ? DASH : `${NUM.format(bac.hoursToZero)} h`],
            [
              "Against the UAE limit of zero",
              !legal || bac.error || trip.error
                ? DASH
                : legal.alreadyUnder
                  ? "At zero on this estimate — still not proof of fitness to drive"
                  : `About ${NUM.format(legal.hours)} more hours before the estimate reaches zero`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="font-medium sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="ae-equipment">
        <h2 id="ae-equipment" className="text-base font-semibold">
          What has to be in the car
        </h2>
        <ul className="mt-3 space-y-3 text-sm">
          {(trip.equipment ?? []).map(([item, detail]) => (
            <li key={item}>
              <span className="font-semibold">{item}</span>
              <span className="block text-[var(--muted-foreground)]">{detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="ae-rules">
        <h2 id="ae-rules" className="text-base font-semibold">
          Rules that catch visitors out
        </h2>
        <ul className="mt-3 space-y-3 text-sm">
          {(trip.keyRules ?? []).map(([title, detail]) => (
            <li key={title}>
              <span className="font-semibold">{title}</span>
              <span className="block text-[var(--muted-foreground)]">{detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational summary only, not legal advice. UAE traffic law, fines and the approved
        licence list change, and a posted or gantry sign always overrides the defaults shown here.
        Confirm the current rules with your rental company, your insurer and the relevant emirate
        police authority before you travel. The alcohol figure is a statistical model — the only
        lawful amount before driving in the UAE is none at all.
      </p>
    </main>
  );
}
