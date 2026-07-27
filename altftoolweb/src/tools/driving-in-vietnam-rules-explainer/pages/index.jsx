"use client";

import { useMemo, useState } from "react";
import { Check, Copy, CarFront, RotateCcw } from "lucide-react";

import {
  assessTrip,
  COUNTRY,
  IDP_HELD_OPTIONS,
  LICENCE_ORIGINS,
  LICENCE_POINTS,
  ROAD_CLASSES,
  VEHICLE_TYPES,
} from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";

const VND = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const VERDICT_LABEL = {
  ok: "You may drive",
  "idp-needed": "You need a 1968 Vienna permit first",
  "not-valid": "Your licence is not valid here",
};

const VERDICT_TONE = {
  ok: "bg-[var(--success-soft)] text-[var(--success-text)]",
  "idp-needed": "bg-[var(--warning-soft)] text-[var(--warning-text)]",
  "not-valid": "bg-[var(--danger-soft)] text-[var(--danger-text)]",
};

const DEFAULTS = {
  vehicleId: "car",
  roadId: "rural-single",
  licenceOrigin: "geneva-1949",
  idpHeld: "geneva-1949",
  ageYears: "34",
  stayDays: "14",
  breathMgPerL: "0",
};

export default function ToolHome() {
  const [vehicleId, setVehicleId] = useState(DEFAULTS.vehicleId);
  const [roadId, setRoadId] = useState(DEFAULTS.roadId);
  const [licenceOrigin, setLicenceOrigin] = useState(DEFAULTS.licenceOrigin);
  const [idpHeld, setIdpHeld] = useState(DEFAULTS.idpHeld);
  const [ageYears, setAgeYears] = useState(DEFAULTS.ageYears);
  const [stayDays, setStayDays] = useState(DEFAULTS.stayDays);
  const [breathMgPerL, setBreathMgPerL] = useState(DEFAULTS.breathMgPerL);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      assessTrip({
        vehicleId,
        roadId,
        licenceOrigin,
        idpHeld,
        ageYears,
        stayDays,
        breathMgPerL,
      }),
    [vehicleId, roadId, licenceOrigin, idpHeld, ageYears, stayDays, breathMgPerL],
  );

  const hasError = Boolean(result.error);
  const limit = hasError ? null : result.limit;
  const licence = hasError ? null : result.licence;
  const alcohol = hasError ? null : result.alcohol;

  const headline = hasError
    ? DASH
    : limit.banned
      ? "Not allowed"
      : `${NUM.format(limit.kmh)} km/h`;

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Driving in ${COUNTRY.name} — visitor summary`,
      `Traffic drives on the ${COUNTRY.driveSide}.`,
      "",
      `Vehicle: ${limit.vehicleLabel}`,
      `Road: ${limit.roadLabel}`,
      limit.banned
        ? "This vehicle class may not use this road at all."
        : `Default limit: ${limit.kmh} km/h (${limit.mph} mph)${limit.signed ? " — signed ceiling, obey the gantry" : ""}`,
      `Source: ${limit.source}`,
      "",
      `Licence issued in: ${licence.origin.label}`,
      `Permit held: ${licence.permit.label}`,
      `Verdict: ${VERDICT_LABEL[licence.verdict]}`,
      licence.reason,
      "",
      `Alcohol: ${alcohol.bandLabel}`,
      alcohol.legal
        ? alcohol.summary
        : `Fine ${VND.format(alcohol.fineVndFrom)}–${VND.format(alcohol.fineVndTo)}, licence suspended ${alcohol.suspensionMonthsFrom}–${alcohol.suspensionMonthsTo} months.`,
      "",
      ...licence.warnings.map((line) => `• ${line}`),
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, limit, licence, alcohol]);

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
    setRoadId(DEFAULTS.roadId);
    setLicenceOrigin(DEFAULTS.licenceOrigin);
    setIdpHeld(DEFAULTS.idpHeld);
    setAgeYears(DEFAULTS.ageYears);
    setStayDays(DEFAULTS.stayDays);
    setBreathMgPerL(DEFAULTS.breathMgPerL);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <CarFront className="h-4 w-4" aria-hidden="true" />
          Driving abroad
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Driving in Vietnam Rules Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Vietnam drives on the {COUNTRY.driveSide} and posts every limit in km/h. Pick your vehicle
          and road to see the default speed limit under Circular 31/2019/TT-BGTVT, then check whether
          the licence and permit you hold are recognised at all.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-vehicle">
              What are you driving?
            </label>
            <select
              id="vn-vehicle"
              className={`mt-2 ${INPUT_CLASS}`}
              value={vehicleId}
              onChange={(event) => setVehicleId(event.target.value)}
            >
              {VEHICLE_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="vn-road">
              What kind of road?
            </label>
            <select
              id="vn-road"
              className={`mt-2 ${INPUT_CLASS}`}
              value={roadId}
              onChange={(event) => setRoadId(event.target.value)}
            >
              {ROAD_CLASSES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vn-origin">
              Where was your driving licence issued?
            </label>
            <select
              id="vn-origin"
              className={`mt-2 ${INPUT_CLASS}`}
              value={licenceOrigin}
              onChange={(event) => setLicenceOrigin(event.target.value)}
            >
              {LICENCE_ORIGINS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vn-idp">
              What permit do you already hold?
            </label>
            <select
              id="vn-idp"
              className={`mt-2 ${INPUT_CLASS}`}
              value={idpHeld}
              onChange={(event) => setIdpHeld(event.target.value)}
            >
              {IDP_HELD_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="vn-age">
              Your age (years)
            </label>
            <input
              id="vn-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="110"
              step="1"
              value={ageYears}
              onChange={(event) => setAgeYears(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="vn-stay">
              Days in Vietnam
            </label>
            <input
              id="vn-stay"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="3650"
              step="1"
              value={stayDays}
              onChange={(event) => setStayDays(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vn-breath">
              Breath alcohol reading (mg per litre) — leave at 0
            </label>
            <input
              id="vn-breath"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="5"
              step="0.01"
              value={breathMgPerL}
              onChange={(event) => setBreathMgPerL(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              There is no legal allowance in Vietnam. Enter a reading only to see which penalty band
              it falls in.
            </p>
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Default speed limit
            </p>
            <p className="mt-1 text-4xl leading-tight font-semibold text-[var(--primary)]">
              {headline}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the limit."
                : limit.banned
                  ? limit.note
                  : `${NUM.format(limit.mph)} mph · ${limit.source}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Vietnam driving summary"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset every answer to the defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Traffic drives on the", hasError ? DASH : COUNTRY.driveSide],
            ["Speeds are posted in", hasError ? DASH : COUNTRY.speedUnit],
            ["Minimum age for a car", hasError ? DASH : `${COUNTRY.minimumCarAgeYears} years`],
            [
              "Licence verdict",
              hasError ? DASH : VERDICT_LABEL[licence.verdict],
            ],
            [
              "Alcohol limit",
              hasError ? DASH : "0 — any reading is an offence",
            ],
            ["Licence points per year", hasError ? DASH : NUM.format(LICENCE_POINTS)],
            [
              "Emergency numbers",
              hasError ? DASH : COUNTRY.emergencyNumbers.map(([code]) => code).join(" · "),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasError ? null : (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">{limit.note}</p>
        )}
      </section>

      {hasError ? null : (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Can you drive here?</h2>
          <p className={`mt-3 rounded-md px-3 py-2 text-sm leading-6 ${VERDICT_TONE[licence.verdict]}`}>
            <span className="font-semibold">{VERDICT_LABEL[licence.verdict]}. </span>
            {licence.reason}
          </p>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            {licence.origin.note}
          </p>
          {licence.blockers.length > 0 ? (
            <p
              role="alert"
              className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {licence.blockers.join(" ")}
            </p>
          ) : null}
          {licence.warnings.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {licence.warnings.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--warning)]">
                    &bull;
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      )}

      {hasError ? null : (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">
            Speed limits for {limit.vehicleLabel.toLowerCase()}
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
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
                {result.speeds.map((row) => (
                  <tr
                    key={row.roadId}
                    className="border-b border-[var(--border)] align-top last:border-0"
                  >
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{row.roadLabel}</span>
                      {row.roadId === limit.roadId ? (
                        <span className="ml-2 inline-block rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-[var(--primary-text)] uppercase">
                          Selected
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold whitespace-nowrap">
                      {row.banned ? "Banned" : NUM.format(row.kmh)}
                    </td>
                    <td className="py-2 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                      {row.banned ? DASH : NUM.format(row.mph)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            These are the defaults. A posted sign always overrides them, and the expressway figure is
            the statutory ceiling rather than a target.
          </p>
        </section>
      )}

      {hasError ? null : (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Alcohol</h2>
          <p
            className={`mt-3 rounded-md px-3 py-2 text-sm leading-6 ${
              alcohol.legal
                ? "bg-[var(--success-soft)] text-[var(--success-text)]"
                : "bg-[var(--danger-soft)] text-[var(--danger-text)]"
            }`}
          >
            <span className="font-semibold">{alcohol.bandLabel}. </span>
            {alcohol.summary}
          </p>
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Breath reading entered", `${alcohol.breathMgPerL} mg/L`],
              ["Equivalent in blood", `${alcohol.bloodMgPer100Ml} mg/100 mL`],
              [
                "Fine under Decree 168/2024",
                alcohol.legal
                  ? "None"
                  : `${VND.format(alcohol.fineVndFrom)} – ${VND.format(alcohol.fineVndTo)}`,
              ],
              [
                "Licence suspension",
                alcohol.legal
                  ? "None"
                  : `${alcohol.suspensionMonthsFrom}–${alcohol.suspensionMonthsTo} months`,
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Fine amounts are those set by Decree 168/2024/ND-CP, in force from 1 January 2025, and are
            revised from time to time. The zero threshold in Article 9(2) of Law 36/2024/QH15 is the
            part that does not move.
          </p>
        </section>
      )}

      {hasError ? null : (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Rules visitors trip over</h2>
          <dl className="mt-3 space-y-3 text-sm">
            {result.keyRules.map(([title, body]) => (
              <div key={title}>
                <dt className="font-semibold">{title}</dt>
                <dd className="mt-0.5 leading-6 text-[var(--muted-foreground)]">{body}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {hasError ? null : (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Carry with you</h2>
          <dl className="mt-3 space-y-3 text-sm">
            {result.equipment.map(([title, body]) => (
              <div key={title}>
                <dt className="font-semibold">{title}</dt>
                <dd className="mt-0.5 leading-6 text-[var(--muted-foreground)]">{body}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            {COUNTRY.fuelNote} {COUNTRY.tollNote}
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Speed defaults come from Circular 31/2019/TT-BGTVT, the
        alcohol prohibition from Article 9(2) of Law 36/2024/QH15 and the penalties from Decree
        168/2024/ND-CP. Confirm your own position with the Department of Transport or your embassy
        before you drive. Nothing you enter leaves your browser.
      </p>
    </main>
  );
}
