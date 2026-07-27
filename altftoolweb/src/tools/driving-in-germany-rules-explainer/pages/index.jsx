"use client";

import { useMemo, useState } from "react";
import { CarFront, Check, Copy, RotateCcw, TriangleAlert, Wine } from "lucide-react";

import {
  COUNTRY,
  LICENCE_ORIGINS,
  assessTrip,
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
  licenceHeldYears: "10",
  licenceOrigin: "non_eu_latin",
  stayDays: "14",
  towingTrailer: false,
  drinks: "2",
  drinkVolumeMl: "500",
  abvPercent: "5",
  bodyWeightKg: "75",
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
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

function speedText(row) {
  if (row.kmh == null) {
    return row.advisoryKmh
      ? `No general limit (advisory ${row.advisoryKmh} km/h · ${row.advisoryMph} mph)`
      : "No general limit";
  }
  return `${row.kmh} km/h · ${row.mph} mph`;
}

export default function ToolHome() {
  const [ageYears, setAgeYears] = useState(DEFAULTS.ageYears);
  const [licenceHeldYears, setLicenceHeldYears] = useState(DEFAULTS.licenceHeldYears);
  const [licenceOrigin, setLicenceOrigin] = useState(DEFAULTS.licenceOrigin);
  const [stayDays, setStayDays] = useState(DEFAULTS.stayDays);
  const [towingTrailer, setTowingTrailer] = useState(DEFAULTS.towingTrailer);

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
        licenceHeldYears,
        licenceOrigin,
        stayDays,
        towingTrailer,
      }),
    [ageYears, licenceHeldYears, licenceOrigin, stayDays, towingTrailer],
  );

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

  const summary = useMemo(() => {
    if (trip.error) return "";
    const lines = [
      `Driving in ${COUNTRY.name} ${DASH} rules summary`,
      `Drive on the ${trip.country.driveSide}; ${trip.country.steeringWheelSide}-hand-drive cars.`,
      `Your blood-alcohol limit: ${BAC.format(trip.alcohol.limitBacPercent)}% (${trip.alcohol.category}).`,
      `Minimum driving age: ${trip.country.minimumDrivingAgeYears}.`,
      `International Driving Permit needed: ${trip.permit.needsIdp ? "yes" : "no"}.`,
      "",
      "Speed limits:",
      ...trip.speeds.map((row) => `  ${row.label}: ${speedText(row)}`),
      "",
      `Emergency: ${trip.country.emergencyNumbers.map(([n, w]) => `${n} (${w})`).join(", ")}`,
    ];
    return lines.join("\n");
  }, [trip]);

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
    setLicenceHeldYears(DEFAULTS.licenceHeldYears);
    setLicenceOrigin(DEFAULTS.licenceOrigin);
    setStayDays(DEFAULTS.stayDays);
    setTowingTrailer(DEFAULTS.towingTrailer);
    setDrinks(DEFAULTS.drinks);
    setDrinkVolumeMl(DEFAULTS.drinkVolumeMl);
    setAbvPercent(DEFAULTS.abvPercent);
    setBodyWeightKg(DEFAULTS.bodyWeightKg);
    setSex(DEFAULTS.sex);
    setHoursSinceFirstDrink(DEFAULTS.hoursSinceFirstDrink);
    setCopied(false);
  };

  const ok = !trip.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CarFront className="h-4 w-4" aria-hidden="true" />
          Driving abroad
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Driving in {COUNTRY.name} Rules Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Which side of the road, the speed limits in both km/h and mph, the blood-alcohol limit
          that applies to <em>you</em>, and whether your licence needs an International Driving
          Permit before you collect a hire car in {COUNTRY.localName}.
        </p>
      </header>

      <section className={CARD} aria-labelledby="driver-details">
        <h2 id="driver-details" className="text-base font-semibold">
          Your details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="de-age">
              Your age (years)
            </label>
            <input
              id="de-age"
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
            <label className={LABEL_CLASS} htmlFor="de-held">
              Licence held for (years)
            </label>
            <input
              id="de-held"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="80"
              step="0.5"
              value={licenceHeldYears}
              onChange={(event) => setLicenceHeldYears(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="de-origin">
              Where your licence was issued
            </label>
            <select
              id="de-origin"
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
            <label className={LABEL_CLASS} htmlFor="de-stay">
              Length of stay (days)
            </label>
            <input
              id="de-stay"
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
          <div className="flex items-end">
            <label
              className="inline-flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="de-towing"
            >
              <input
                id="de-towing"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={towingTrailer}
                onChange={(event) => setTowingTrailer(event.target.checked)}
              />
              Towing a caravan or trailer
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

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your legal blood-alcohol limit in {COUNTRY.name}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${BAC.format(trip.alcohol.limitBacPercent)} %` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${trip.alcohol.category} · ${trip.alcohol.breathMgPerL} mg per litre of breath`
                : "Fix the highlighted input to see your limit."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={`Copy the driving rules summary for ${COUNTRY.name}`}
              className={GHOST_BTN}
              disabled={!ok}
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
            ["Typical car-hire minimum age", `${COUNTRY.typicalRentalMinimumAgeYears} years`],
            ["International Driving Permit", ok ? (trip.permit.needsIdp ? "Recommended / required with your licence" : "Not needed") : DASH],
            ["Foreign licence recognised for", ok ? (trip.permit.recognitionDays ? `${trip.permit.recognitionDays} days of residence` : "As long as it stays valid") : DASH],
            ["Why this alcohol limit", ok ? trip.alcohol.reason : DASH],
            ["Penalty for exceeding it", ok ? trip.alcohol.penalty : DASH],
            ["Emergency numbers", COUNTRY.emergencyNumbers.map(([number, use]) => `${number} — ${use}`).join(" · ")],
            ["Tolls and city access", COUNTRY.tolls],
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

      <section className={`mt-6 ${CARD}`} aria-labelledby="speed-limits">
        <h2 id="speed-limits" className="text-base font-semibold">
          Speed limits{towingTrailer ? " (with a trailer)" : ""}
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
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0 align-top">
                      <td className="py-2.5 pr-3">
                        <span className="font-semibold">{row.label}</span>
                        <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">{row.note}</span>
                      </td>
                      <td className="py-2.5 pr-3 text-right font-semibold">
                        {row.kmh == null ? "none" : row.kmh}
                      </td>
                      <td className="py-2.5 text-right text-[var(--muted-foreground)]">
                        {row.mph == null ? DASH : row.mph}
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="alcohol-estimator">
        <h2 id="alcohol-estimator" className="flex items-center gap-2 text-base font-semibold">
          <Wine className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          Morning-after estimate
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          A Widmark-equation estimate of where your blood alcohol sits, so you can see how many
          hours a night out actually costs you. It is a rough model, never a green light to drive.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="de-drinks">
              Number of drinks
            </label>
            <input
              id="de-drinks"
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
            <label className={LABEL_CLASS} htmlFor="de-volume">
              Size of each drink (ml)
            </label>
            <input
              id="de-volume"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="2000"
              step="10"
              value={drinkVolumeMl}
              onChange={(event) => setDrinkVolumeMl(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="de-abv">
              Strength (% ABV)
            </label>
            <input
              id="de-abv"
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
            <label className={LABEL_CLASS} htmlFor="de-weight">
              Body weight (kg)
            </label>
            <input
              id="de-weight"
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
            <label className={LABEL_CLASS} htmlFor="de-sex">
              Body composition factor
            </label>
            <select
              id="de-sex"
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
            <label className={LABEL_CLASS} htmlFor="de-hours">
              Hours since the first drink
            </label>
            <input
              id="de-hours"
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
            ["Pure alcohol consumed", bac.error ? DASH : `${NUM.format(bac.gramsAlcohol)} g (${NUM.format(bac.standardDrinks)} standard drinks)`],
            ["Estimated blood alcohol now", bac.error ? DASH : `${BAC.format(bac.bacPercent)} % (${NUM.format(bac.perMille)} per mille)`],
            ["Estimated breath alcohol", bac.error ? DASH : `${NUM.format(bac.breathMgPerL)} mg/l`],
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

      <section className={`mt-6 ${CARD}`} aria-labelledby="equipment">
        <h2 id="equipment" className="text-base font-semibold">
          What must be in the car
        </h2>
        <ul className="mt-3 space-y-3 text-sm">
          {trip.equipment
            ? trip.equipment.map(([item, detail]) => (
                <li key={item}>
                  <span className="font-semibold">{item}</span>
                  <span className="block text-[var(--muted-foreground)]">{detail}</span>
                </li>
              ))
            : null}
        </ul>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="key-rules">
        <h2 id="key-rules" className="text-base font-semibold">
          Rules that catch visitors out
        </h2>
        <ul className="mt-3 space-y-3 text-sm">
          {trip.keyRules
            ? trip.keyRules.map(([title, detail]) => (
                <li key={title}>
                  <span className="font-semibold">{title}</span>
                  <span className="block text-[var(--muted-foreground)]">{detail}</span>
                </li>
              ))
            : null}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational summary only, not legal advice. Traffic law and fines change, and signposted
        limits always override the defaults shown here. Check the current rules with your rental
        company, your insurer and an official source before you travel. The alcohol figure is a
        statistical model with wide individual variation — the only safe amount before driving is
        none.
      </p>
    </main>
  );
}
