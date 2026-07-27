"use client";

import { useMemo, useState } from "react";
import { CarFront, Check, Copy, Gauge, RotateCcw, TriangleAlert, Wine } from "lucide-react";

import {
  COUNTRY,
  DRIVER_CATEGORIES,
  LICENCE_ORIGINS,
  VIGNETTE_FINE_CHF,
  VIGNETTE_PRICE_CHF,
  assessTrip,
  convertSpeed,
  estimateBac,
  hoursUntilLegal,
  speedOffenceCheck,
  vignetteCost,
} from "../lib";

const NUM = new Intl.NumberFormat("de-CH", { maximumFractionDigits: 1 });
const BAC = new Intl.NumberFormat("de-CH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});
const CHF = new Intl.NumberFormat("de-CH", {
  style: "currency",
  currency: "CHF",
  maximumFractionDigits: 0,
});
const DASH = "—";

const DEFAULTS = {
  ageYears: "35",
  driverCategory: "ordinary",
  licenceOrigin: "eu_efta",
  stayDays: "10",
  hasVignette: true,
  postedKmh: "50",
  drivenKmh: "72",
  speedValue: "120",
  speedUnit: "kmh",
  drinks: "2",
  drinkVolumeMl: "300",
  abvPercent: "5",
  bodyWeightKg: "80",
  sex: "male",
  hoursSinceFirstDrink: "1",
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
  const [driverCategory, setDriverCategory] = useState(DEFAULTS.driverCategory);
  const [licenceOrigin, setLicenceOrigin] = useState(DEFAULTS.licenceOrigin);
  const [stayDays, setStayDays] = useState(DEFAULTS.stayDays);
  const [hasVignette, setHasVignette] = useState(DEFAULTS.hasVignette);
  const [postedKmh, setPostedKmh] = useState(DEFAULTS.postedKmh);
  const [drivenKmh, setDrivenKmh] = useState(DEFAULTS.drivenKmh);
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
    () => assessTrip({ ageYears, driverCategory, licenceOrigin, stayDays }),
    [ageYears, driverCategory, licenceOrigin, stayDays],
  );

  const offence = useMemo(() => speedOffenceCheck({ postedKmh, drivenKmh }), [postedKmh, drivenKmh]);
  const vignette = useMemo(() => vignetteCost({ hasVignette }), [hasVignette]);
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
      `Driving in ${COUNTRY.name} ${DASH} rules summary`,
      `Drive on the ${COUNTRY.driveSide}; ${COUNTRY.steeringWheelSide}-hand-drive cars; speeds in ${COUNTRY.speedUnit}.`,
      `Your blood-alcohol limit: ${BAC.format(trip.alcohol.limitBacPercent)}% (${trip.alcohol.perMille} per mille, ${trip.alcohol.category}).`,
      `Motorway vignette: CHF ${VIGNETTE_PRICE_CHF} a year, CHF ${VIGNETTE_FINE_CHF} fine without one.`,
      "Dipped headlights are compulsory day and night.",
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
    setDriverCategory(DEFAULTS.driverCategory);
    setLicenceOrigin(DEFAULTS.licenceOrigin);
    setStayDays(DEFAULTS.stayDays);
    setHasVignette(DEFAULTS.hasVignette);
    setPostedKmh(DEFAULTS.postedKmh);
    setDrivenKmh(DEFAULTS.drivenKmh);
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
          Driving in Switzerland Rules Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          You drive on the right with signs in km/h, every motorway needs a vignette, and Swiss law
          turns a large enough excess into a criminal offence with a mandatory prison sentence.
          Check where that line falls before you drive in {COUNTRY.localName}.
        </p>
      </header>

      <section className={CARD} aria-labelledby="ch-details">
        <h2 id="ch-details" className="text-base font-semibold">
          Your details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ch-category">
              Which driver category you fall into
            </label>
            <select
              id="ch-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={driverCategory}
              onChange={(event) => setDriverCategory(event.target.value)}
            >
              {DRIVER_CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ch-origin">
              Where your licence was issued
            </label>
            <select
              id="ch-origin"
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
            <label className={LABEL_CLASS} htmlFor="ch-age">
              Your age (years)
            </label>
            <input
              id="ch-age"
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
            <label className={LABEL_CLASS} htmlFor="ch-stay">
              Length of stay (days)
            </label>
            <input
              id="ch-stay"
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
          <div className="flex items-end sm:col-span-2">
            <label className={CHECKBOX_LABEL} htmlFor="ch-vignette">
              <input
                id="ch-vignette"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={hasVignette}
                onChange={(event) => setHasVignette(event.target.checked)}
              />
              I have a valid motorway vignette
            </label>
          </div>
        </div>
        {vignette.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {vignette.error}
          </p>
        ) : (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm leading-5 ${
              hasVignette
                ? "bg-[var(--muted)] text-[var(--foreground)]"
                : "bg-[var(--warning-soft)] text-[var(--warning-text)]"
            }`}
          >
            {vignette.message} Total exposure: {CHF.format(vignette.total)}.
          </p>
        )}
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
              Your legal blood-alcohol limit in Switzerland
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${BAC.format(trip.alcohol.limitBacPercent)} %` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${trip.alcohol.perMille} per mille · ${trip.alcohol.category}`
                : "Fix the highlighted input to see your limit."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the Swiss driving rules summary"
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
            ["Minimum age to drive a car", `${COUNTRY.minimumDrivingAgeYears} years`],
            ["Typical car-hire minimum age", `${COUNTRY.typicalRentalMinimumAgeYears} years, with a surcharge under 25`],
            ["Motorway vignette", `${CHF.format(VIGNETTE_PRICE_CHF)} a year, valid 1 December to 31 January the following year`],
            ["Fine for using a motorway without one", CHF.format(VIGNETTE_FINE_CHF)],
            ["International Driving Permit", ok ? (trip.permit.needsIdp ? "Required with your licence" : "Not required") : DASH],
            ["Why this alcohol limit", ok ? trip.alcohol.reason : DASH],
            ["What happens if you exceed it", ok ? trip.alcohol.penalty : DASH],
            ["Headlights", "Dipped headlights on at all times, day and night, all year"],
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

      <section className={`mt-6 ${CARD}`} aria-labelledby="ch-raser">
        <h2 id="ch-raser" className="flex items-center gap-2 text-base font-semibold">
          <Gauge className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          Where speeding becomes a crime
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          Under the Via Sicura rule in force since 2013, a large enough excess is a Raserdelikt: a
          crime carrying a mandatory prison sentence, a two-year licence withdrawal and
          confiscation of the vehicle. Enter the posted limit and your speed to see where the line
          falls.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ch-posted">
              Posted limit (km/h)
            </label>
            <input
              id="ch-posted"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="200"
              step="5"
              value={postedKmh}
              onChange={(event) => setPostedKmh(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ch-driven">
              Speed recorded (km/h)
            </label>
            <input
              id="ch-driven"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="500"
              step="1"
              value={drivenKmh}
              onChange={(event) => setDrivenKmh(event.target.value)}
            />
          </div>
        </div>

        {offence.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {offence.error}
          </p>
        ) : (
          <>
            <p
              className={`mt-4 text-2xl font-semibold ${
                offence.isRaser ? "text-[var(--danger)]" : "text-[var(--primary)]"
              }`}
            >
              {offence.classification}
            </p>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {[
                ["Excess over the limit", `${NUM.format(offence.excessKmh)} km/h`],
                [
                  "Raser threshold for this limit",
                  `+${offence.raserExcessKmh} km/h, that is ${offence.raserAtKmh} km/h`,
                ],
                ["Margin before it becomes a crime", `${NUM.format(offence.marginToRaser)} km/h`],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="font-medium sm:text-right">{value}</dd>
                </div>
              ))}
            </dl>
            <p
              className={`mt-4 rounded-md px-3 py-2 text-sm leading-5 ${
                offence.isRaser
                  ? "bg-[var(--danger-soft)] font-medium text-[var(--danger)]"
                  : "bg-[var(--muted)] text-[var(--foreground)]"
              }`}
              role={offence.isRaser ? "alert" : undefined}
            >
              {offence.consequence}
            </p>
          </>
        )}
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="ch-speeds">
        <h2 id="ch-speeds" className="text-base font-semibold">
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

      <section className={`mt-6 ${CARD}`} aria-labelledby="ch-convert">
        <h2 id="ch-convert" className="text-base font-semibold">
          Convert a speed
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ch-speed-value">
              Speed
            </label>
            <input
              id="ch-speed-value"
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
            <label className={LABEL_CLASS} htmlFor="ch-speed-unit">
              Entered in
            </label>
            <select
              id="ch-speed-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={speedUnit}
              onChange={(event) => setSpeedUnit(event.target.value)}
            >
              <option value="kmh">km/h (Swiss signs)</option>
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

      <section className={`mt-6 ${CARD}`} aria-labelledby="ch-alcohol">
        <h2 id="ch-alcohol" className="flex items-center gap-2 text-base font-semibold">
          <Wine className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          Morning-after estimate
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          A Widmark-equation estimate of where your blood alcohol sits, shown in both percent and
          the per mille figure Swiss law uses. It is a rough model, never a green light to drive.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ch-drinks">
              Number of drinks
            </label>
            <input
              id="ch-drinks"
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
            <label className={LABEL_CLASS} htmlFor="ch-volume">
              Size of each drink (ml)
            </label>
            <input
              id="ch-volume"
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
            <label className={LABEL_CLASS} htmlFor="ch-abv">
              Strength (% ABV)
            </label>
            <input
              id="ch-abv"
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
            <label className={LABEL_CLASS} htmlFor="ch-weight">
              Body weight (kg)
            </label>
            <input
              id="ch-weight"
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
            <label className={LABEL_CLASS} htmlFor="ch-sex">
              Body composition factor
            </label>
            <select
              id="ch-sex"
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
            <label className={LABEL_CLASS} htmlFor="ch-hours">
              Hours since the first drink
            </label>
            <input
              id="ch-hours"
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
            [
              "Estimated blood alcohol now",
              bac.error ? DASH : `${BAC.format(bac.bacPercent)} % (${NUM.format(bac.perMille)} per mille)`,
            ],
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

      <section className={`mt-6 ${CARD}`} aria-labelledby="ch-equipment">
        <h2 id="ch-equipment" className="text-base font-semibold">
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

      <section className={`mt-6 ${CARD}`} aria-labelledby="ch-rules">
        <h2 id="ch-rules" className="text-base font-semibold">
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
        Informational summary only, not legal advice. Swiss traffic law, fines and the vignette
        price change, and a posted sign always overrides the defaults shown here. Confirm the
        current rules with your rental company, your insurer and the cantonal road traffic office
        before you travel. The alcohol figure is a statistical model with wide individual variation
        — the only safe amount before driving is none.
      </p>
    </main>
  );
}
