"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, IdCard, RotateCcw } from "lucide-react";

import {
  checkIdpRequirement,
  COUNTRY_LONG_NAME,
  COUNTRY_NAME,
  IDP_HELD_OPTIONS,
  LICENCE_ORIGINS,
  STATES,
  STAY_PURPOSES,
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

const todayIso = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const prettyDate = (iso) => {
  if (!iso) return DASH;
  const [year, month, day] = iso.split("-");
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(Number(year), Number(month) - 1, Number(day)));
};

const DEFAULTS = {
  licenceOrigin: "eu-latin",
  idpHeld: "none",
  stateId: "other",
  ageYears: "34",
  stayPurpose: "visit",
};

export default function ToolHome() {
  const [licenceOrigin, setLicenceOrigin] = useState(DEFAULTS.licenceOrigin);
  const [idpHeld, setIdpHeld] = useState(DEFAULTS.idpHeld);
  const [stateId, setStateId] = useState(DEFAULTS.stateId);
  const [stayPurpose, setStayPurpose] = useState(DEFAULTS.stayPurpose);
  const [ageYears, setAgeYears] = useState(DEFAULTS.ageYears);
  const [arrivalDate, setArrivalDate] = useState(todayIso);
  const [departureDate, setDepartureDate] = useState("");
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(copyTimerRef.current), []);

  const result = useMemo(
    () =>
      checkIdpRequirement({
        licenceOrigin,
        idpHeld,
        stateId,
        arrivalDate,
        departureDate,
        ageYears: Number(ageYears),
        stayPurpose,
      }),
    [licenceOrigin, idpHeld, stateId, arrivalDate, departureDate, ageYears, stayPurpose],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `IDP requirement for ${COUNTRY_LONG_NAME}`,
      `Verdict: ${result.verdictLabel}`,
      `Licence issued in: ${result.originLabel}`,
      `Permit held: ${result.idpLabel}`,
      `Driving in: ${result.stateLabel}`,
      `Arrival: ${prettyDate(arrivalDate)}`,
      `How long the foreign licence works: ${result.windowLabel}`,
      result.windowEndDate ? `Local licence needed by: ${prettyDate(result.windowEndDate)}` : null,
      `IDP format recognised: ${result.acceptedFormats}`,
      `Drives on the ${result.drivesOn}`,
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
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setLicenceOrigin(DEFAULTS.licenceOrigin);
    setIdpHeld(DEFAULTS.idpHeld);
    setStateId(DEFAULTS.stateId);
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
          There is no federal driving licence in the United States, so the answer depends on the
          language of your licence and the state you drive in. This checker applies Article 24 of the
          1949 Geneva Convention and the state rules that follow from it.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="us-origin">
              Where was your driving licence issued?
            </label>
            <select
              id="us-origin"
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
            <label className={LABEL_CLASS} htmlFor="us-idp">
              What do you already hold?
            </label>
            <select
              id="us-idp"
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
            <label className={LABEL_CLASS} htmlFor="us-state">
              Which state will you drive in?
            </label>
            <select
              id="us-state"
              className={`mt-2 ${INPUT_CLASS}`}
              value={stateId}
              onChange={(event) => setStateId(event.target.value)}
            >
              {STATES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="us-purpose">
              Why are you in the United States?
            </label>
            <select
              id="us-purpose"
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
            <label className={LABEL_CLASS} htmlFor="us-arrival">
              Date you arrive
            </label>
            <input
              id="us-arrival"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={arrivalDate}
              onChange={(event) => setArrivalDate(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="us-departure">
              Date you leave (optional)
            </label>
            <input
              id="us-departure"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={departureDate}
              onChange={(event) => setDepartureDate(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
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

      <section className={`mt-6 ${CARD}`} aria-live="polite" aria-atomic="true">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Verdict for {hasError ? COUNTRY_NAME : result.stateLabel}
            </p>
            <p className="mt-1 text-3xl leading-tight font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : result.verdictLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the IDP verdict for the United States"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Licence issued in", hasError ? DASH : result.originLabel],
            ["How long your licence works here", hasError ? DASH : result.windowLabel],
            [
              "State licence needed by",
              hasError || !result.windowEndDate
                ? DASH
                : `${prettyDate(result.windowEndDate)} (${result.daysRemaining} days from arrival)`,
            ],
            [
              "Length of stay entered",
              hasError || result.stayDays === null ? DASH : `${result.stayDays} days`,
            ],
            ["Lowest state driving age", hasError ? DASH : `${result.minimumAge} years`],
            ["IDP format recognised here", hasError ? DASH : result.acceptedFormats],
            ["Traffic drives on the", hasError ? DASH : result.drivesOn],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasError ? null : (
          <>
            <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
              {result.originNote}
            </p>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              {result.stateNote}
            </p>
          </>
        )}
      </section>

      {hasError ? null : (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">How long each state gives a new resident</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    State
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Deadline
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    IDP for non-English licence
                  </th>
                </tr>
              </thead>
              <tbody>
                {STATES.filter((row) => row.id !== "other").map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[var(--border)] align-top last:border-0"
                  >
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">
                      {row.newResidentDays === 0 ? "Immediately" : `${row.newResidentDays} days`}
                    </td>
                    <td className="py-2 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                      {row.idpRequiredForNonEnglish ? "Required" : "Not stated"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            A sample, not the full fifty. Deadlines run from the day you establish residency - taking
            a job, signing a lease, registering a car - not from the day you land. Confirm with the
            state motor vehicle agency.
          </p>
        </section>
      )}

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
        country that issued your licence and cannot be bought online from a third party. State
        deadlines and DMV practice change - confirm with the relevant state motor vehicle agency
        before you drive.
      </p>
    </main>
  );
}
