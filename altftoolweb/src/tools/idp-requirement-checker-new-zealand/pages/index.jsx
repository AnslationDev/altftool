"use client";

import { useMemo, useState } from "react";
import { Check, Copy, IdCard, RotateCcw } from "lucide-react";

import {
  checkIdpRequirement,
  COUNTRY_NAME,
  IDP_HELD_OPTIONS,
  LICENCE_ORIGINS,
  STAY_PURPOSES,
  VISITOR_WINDOW_MONTHS,
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

const TONE_CLASS = {
  danger: "bg-[var(--danger-soft)] text-[var(--danger-text)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning-text)]",
  success: "bg-[var(--success-soft)] text-[var(--success-text)]",
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const prettyDate = (iso) => {
  if (!iso) return DASH;
  const [year, month, day] = iso.split("-");
  return new Intl.DateTimeFormat("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(Number(year), Number(month) - 1, Number(day)));
};

const EXEMPT_LABEL = {
  true: "Yes - convert without a test",
  false: "No - theory and practical tests required",
};

const DEFAULTS = {
  licenceOrigin: "eu-latin",
  idpHeld: "none",
  ageYears: "34",
  stayPurpose: "visit",
};

export default function ToolHome() {
  const [licenceOrigin, setLicenceOrigin] = useState(DEFAULTS.licenceOrigin);
  const [idpHeld, setIdpHeld] = useState(DEFAULTS.idpHeld);
  const [stayPurpose, setStayPurpose] = useState(DEFAULTS.stayPurpose);
  const [ageYears, setAgeYears] = useState(DEFAULTS.ageYears);
  const [arrivalDate, setArrivalDate] = useState(todayIso);
  const [departureDate, setDepartureDate] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      checkIdpRequirement({
        licenceOrigin,
        idpHeld,
        arrivalDate,
        departureDate,
        ageYears: Number(ageYears),
        stayPurpose,
      }),
    [licenceOrigin, idpHeld, arrivalDate, departureDate, ageYears, stayPurpose],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `IDP requirement for ${COUNTRY_NAME}`,
      `Verdict: ${result.verdictLabel}`,
      `Licence issued in: ${result.originLabel}`,
      `Permit held: ${result.idpLabel}`,
      `Last arrival: ${prettyDate(arrivalDate)}`,
      `Visitor window: ${result.windowLabel}`,
      result.windowEndDate
        ? `Window closes: ${prettyDate(result.windowEndDate)}${
            result.windowExpired
              ? ` (EXPIRED ${Math.abs(result.daysRemaining)} days ago)`
              : ` (${result.daysRemaining} days left)`
          }`
        : null,
      `Traffic drives on the ${result.drivesOn}`,
      `Alcohol limit: ${result.breathLimit} mcg/L breath, ${result.bloodLimit} mg/100 mL blood`,
      `Legal basis: ${result.legalBasis}`,
      "",
      result.reason,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result, arrivalDate]);

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
    setLicenceOrigin(DEFAULTS.licenceOrigin);
    setIdpHeld(DEFAULTS.idpHeld);
    setStayPurpose(DEFAULTS.stayPurpose);
    setAgeYears(DEFAULTS.ageYears);
    setArrivalDate(todayIso());
    setDepartureDate("");
    setCopied(false);
  };

  const toneClass = hasError ? TONE_CLASS.danger : TONE_CLASS[result.tone];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <IdCard className="h-4 w-4" aria-hidden="true" />
          Driving abroad
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          IDP Requirement Checker for {COUNTRY_NAME}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          New Zealand lets you drive on a valid overseas licence for {VISITOR_WINDOW_MONTHS} months
          from the day you last arrived, provided the licence is in English or comes with an approved
          translation or an International Driving Permit. This checker applies the Land Transport
          (Driver Licensing) Rule 1999 and dates that window.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="nz-origin">
              Where was your driving licence issued?
            </label>
            <select
              id="nz-origin"
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
            <label className={LABEL_CLASS} htmlFor="nz-idp">
              What do you already hold?
            </label>
            <select
              id="nz-idp"
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

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="nz-purpose">
              Why are you in New Zealand?
            </label>
            <select
              id="nz-purpose"
              className={`mt-2 ${INPUT_CLASS}`}
              value={stayPurpose}
              onChange={(event) => setStayPurpose(event.target.value)}
            >
              {STAY_PURPOSES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="nz-arrival">
              Date you last arrived
            </label>
            <input
              id="nz-arrival"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={arrivalDate}
              onChange={(event) => setArrivalDate(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="nz-departure">
              Date you leave (optional)
            </label>
            <input
              id="nz-departure"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={departureDate}
              onChange={(event) => setDepartureDate(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="nz-age">
              Your age (years)
            </label>
            <input
              id="nz-age"
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

      <section className={`mt-6 ${CARD}`} role="status" aria-live="polite">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Verdict for {COUNTRY_NAME}
            </p>
            <p className="mt-1 text-3xl leading-tight font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : result.verdictLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the IDP verdict for New Zealand"
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
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all answers"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasError ? null : (
          <p className={`mt-4 rounded-md px-3 py-2 text-sm leading-6 ${toneClass}`}>
            {result.reason}
          </p>
        )}

        {hasError || !result.windowExpired ? null : (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger-text)]"
          >
            This visitor window closed on {prettyDate(result.windowEndDate)}. Driving on this
            overseas licence in {COUNTRY_NAME} today is no longer lawful unless you have since
            converted to a New Zealand licence, or this reflects an arrival date since renewed by
            leaving and re-entering the country.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Licence issued in", hasError ? DASH : result.originLabel],
            ["Visitor window", hasError ? DASH : result.windowLabel],
            [
              "Window closes",
              hasError || !result.windowEndDate
                ? DASH
                : result.windowExpired
                  ? `${prettyDate(result.windowEndDate)} (expired ${Math.abs(result.daysRemaining)} days ago)`
                  : `${prettyDate(result.windowEndDate)} (${result.daysRemaining} days left)`,
            ],
            [
              "Length of stay entered",
              hasError || result.stayDays === null ? DASH : `${result.stayDays} days`,
            ],
            [
              "Converts without a test",
              hasError || result.exempt === null || result.exempt === undefined
                ? DASH
                : EXEMPT_LABEL[String(result.exempt)],
            ],
            ["Minimum driving age", hasError ? DASH : `${result.minimumAge} years`],
            ["IDP formats accepted here", hasError ? DASH : result.acceptedFormats],
            ["Traffic drives on the", hasError ? DASH : result.drivesOn],
            [
              "Alcohol limit",
              hasError
                ? DASH
                : `${result.breathLimit} mcg/L breath · ${result.bloodLimit} mg/100 mL blood`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasError ? null : (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">{result.originNote}</p>
        )}
      </section>

      {!hasError && result.warnings.length > 0 ? (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Watch out for</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.warnings.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--warning)]">
                  &bull;
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasError ? null : (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Carry in the car</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.checklist.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--primary)]">
                  &bull;
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            Legal basis: {result.legalBasis}
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. An International Driving Permit must be issued in the
        country that issued your licence and cannot be bought online from a third party. The
        exempt-country list and approved translators change - confirm with the NZ Transport Agency
        before you drive.
      </p>
    </main>
  );
}
