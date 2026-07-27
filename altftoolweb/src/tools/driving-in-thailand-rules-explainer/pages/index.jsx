"use client";

import { useMemo, useState } from "react";
import { CarFront, Check, Copy, RotateCcw, TriangleAlert, Wine } from "lucide-react";

import {
  COUNTRY,
  LICENCE_ORIGINS,
  LICENCE_STATUSES,
  VEHICLE_TYPES,
  assessTrip,
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
  licenceStatus: "full",
  licenceOrigin: "idp",
  vehicleType: "motorcycle",
  motorcycleEntitlement: false,
  stayDays: "14",
  speedValue: "120",
  speedUnit: "kmh",
  drinks: "2",
  drinkVolumeMl: "330",
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
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const CHECKBOX_LABEL =
  "inline-flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)]";

export default function ToolHome() {
  const [ageYears, setAgeYears] = useState(DEFAULTS.ageYears);
  const [licenceStatus, setLicenceStatus] = useState(DEFAULTS.licenceStatus);
  const [licenceOrigin, setLicenceOrigin] = useState(DEFAULTS.licenceOrigin);
  const [vehicleType, setVehicleType] = useState(DEFAULTS.vehicleType);
  const [motorcycleEntitlement, setMotorcycleEntitlement] = useState(DEFAULTS.motorcycleEntitlement);
  const [stayDays, setStayDays] = useState(DEFAULTS.stayDays);
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
        licenceStatus,
        licenceOrigin,
        vehicleType,
        motorcycleEntitlement,
        stayDays,
      }),
    [ageYears, licenceStatus, licenceOrigin, vehicleType, motorcycleEntitlement, stayDays],
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
      `Driving in ${COUNTRY.name} ${DASH} rules summary`,
      `Drive on the ${COUNTRY.driveSide}; ${COUNTRY.steeringWheelSide}-hand-drive cars; speeds in ${COUNTRY.speedUnit}.`,
      `Your blood-alcohol limit: ${BAC.format(trip.alcohol.limitBacPercent)}% (${trip.alcohol.limitMgPer100Ml} mg per 100 ml).`,
      `Vehicle: ${trip.permit.vehicle.label}. Legally licensed for it: ${trip.permit.canDrive ? "yes" : "no"}.`,
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
    setLicenceStatus(DEFAULTS.licenceStatus);
    setLicenceOrigin(DEFAULTS.licenceOrigin);
    setVehicleType(DEFAULTS.vehicleType);
    setMotorcycleEntitlement(DEFAULTS.motorcycleEntitlement);
    setStayDays(DEFAULTS.stayDays);
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
          Driving in Thailand Rules Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Thailand drives on the left with signs in km/h. The rule that costs visitors most is not
          about speed: a car licence carries no motorbike entitlement, and riding a scooter without
          one leaves you uninsured. Check that first, then the limits.
        </p>
      </header>

      <section className={CARD} aria-labelledby="th-details">
        <h2 id="th-details" className="text-base font-semibold">
          Your details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="th-vehicle">
              What you plan to drive
            </label>
            <select
              id="th-vehicle"
              className={`mt-2 ${INPUT_CLASS}`}
              value={vehicleType}
              onChange={(event) => setVehicleType(event.target.value)}
            >
              {VEHICLE_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className={CHECKBOX_LABEL} htmlFor="th-motorcycle">
              <input
                id="th-motorcycle"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={motorcycleEntitlement}
                onChange={(event) => setMotorcycleEntitlement(event.target.checked)}
              />
              My licence covers motorcycles
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="th-origin">
              What documents you will carry
            </label>
            <select
              id="th-origin"
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
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="th-status">
              Type of licence you hold
            </label>
            <select
              id="th-status"
              className={`mt-2 ${INPUT_CLASS}`}
              value={licenceStatus}
              onChange={(event) => setLicenceStatus(event.target.value)}
            >
              {LICENCE_STATUSES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="th-age">
              Your age (years)
            </label>
            <input
              id="th-age"
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
            <label className={LABEL_CLASS} htmlFor="th-stay">
              Length of stay (days)
            </label>
            <input
              id="th-stay"
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
              Your legal blood-alcohol limit in Thailand
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${BAC.format(trip.alcohol.limitBacPercent)} %` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${trip.alcohol.limitMgPer100Ml} mg per 100 ml of blood · ${trip.alcohol.category}`
                : "Fix the highlighted input to see your limit."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the Thai driving rules summary"
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
            ["Legally licensed for this vehicle", ok ? (trip.permit.canDrive ? "Yes" : "No — see the warnings below") : DASH],
            ["Minimum age for a car", `${COUNTRY.minimumDrivingAgeYears} years`],
            ["Minimum age for a small motorbike", `${COUNTRY.minimumMotorcycleAgeYears} years`],
            ["Typical car-hire minimum age", `${COUNTRY.typicalRentalMinimumAgeYears} years`],
            ["Legal drinking age", `${COUNTRY.drinkingAgeYears} years`],
            ["Why this alcohol limit", ok ? trip.alcohol.reason : DASH],
            ["What happens if you exceed it", ok ? trip.alcohol.penalty : DASH],
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

        {ok && trip.alcohol.notes.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {trip.alcohol.notes.map((item) => (
              <li
                key={item}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning-text)]"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : null}

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

      <section className={`mt-6 ${CARD}`} aria-labelledby="th-speeds">
        <h2 id="th-speeds" className="text-base font-semibold">
          Speed limits for cars
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
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Motorcycles, buses and trucks carry lower limits than cars on the same road, and a posted
          sign always overrides these defaults.
        </p>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="th-convert">
        <h2 id="th-convert" className="text-base font-semibold">
          Convert a speed
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="th-speed-value">
              Speed
            </label>
            <input
              id="th-speed-value"
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
            <label className={LABEL_CLASS} htmlFor="th-speed-unit">
              Entered in
            </label>
            <select
              id="th-speed-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={speedUnit}
              onChange={(event) => setSpeedUnit(event.target.value)}
            >
              <option value="kmh">km/h (Thai signs)</option>
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

      <section className={`mt-6 ${CARD}`} aria-labelledby="th-alcohol">
        <h2 id="th-alcohol" className="flex items-center gap-2 text-base font-semibold">
          <Wine className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          Morning-after estimate
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          A Widmark-equation estimate of where your blood alcohol sits, shown in both percent and
          the milligrams per 100 ml that Thai law uses. It is a rough model, never a green light to
          drive.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="th-drinks">
              Number of drinks
            </label>
            <input
              id="th-drinks"
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
            <label className={LABEL_CLASS} htmlFor="th-volume">
              Size of each drink (ml)
            </label>
            <input
              id="th-volume"
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
            <label className={LABEL_CLASS} htmlFor="th-abv">
              Strength (% ABV)
            </label>
            <input
              id="th-abv"
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
            <label className={LABEL_CLASS} htmlFor="th-weight">
              Body weight (kg)
            </label>
            <input
              id="th-weight"
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
            <label className={LABEL_CLASS} htmlFor="th-sex">
              Body composition factor
            </label>
            <select
              id="th-sex"
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
            <label className={LABEL_CLASS} htmlFor="th-hours">
              Hours since the first drink
            </label>
            <input
              id="th-hours"
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
              bac.error ? DASH : `${BAC.format(bac.bacPercent)} % (${NUM.format(bac.mgPer100Ml)} mg per 100 ml)`,
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

      <section className={`mt-6 ${CARD}`} aria-labelledby="th-equipment">
        <h2 id="th-equipment" className="text-base font-semibold">
          What has to be in the vehicle
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

      <section className={`mt-6 ${CARD}`} aria-labelledby="th-rules">
        <h2 id="th-rules" className="text-base font-semibold">
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
        Informational summary only, not legal or insurance advice. Thai traffic law and penalties
        change, and a posted sign always overrides the defaults shown here. Confirm the current
        rules and your own cover with your rental company, your insurer and an official source
        before you travel. The alcohol figure is a statistical model with wide individual variation
        — the only safe amount before driving is none.
      </p>
    </main>
  );
}
