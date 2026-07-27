"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TriangleAlert, Waves } from "lucide-react";

import {
  ACCOMMODATION_TYPES,
  DEPARTURE_CLASSES,
  IMUGA_WINDOW_HOURS,
  VISA_ON_ARRIVAL_DAYS,
  buildMaldivesChecklist,
  computeReadiness,
} from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";

const DEFAULTS = {
  arrivalDate: "2026-11-05",
  passportExpiry: "2029-01-01",
  nights: "7",
  adults: "2",
  infantsUnder2: "0",
  accommodationId: "resort",
  hasBooking: true,
  availableFundsUsd: "0",
  departureClassId: "economy",
  diving: false,
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [haveIds, setHaveIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const toggleBooking = () => {
    setForm((current) => ({ ...current, hasBooking: !current.hasBooking }));
    setHaveIds([]);
  };

  const toggleHave = (id) =>
    setHaveIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const result = useMemo(
    () =>
      buildMaldivesChecklist({
        arrivalDate: form.arrivalDate,
        passportExpiry: form.passportExpiry,
        nights: form.nights === "" ? Number.NaN : Number(form.nights),
        adults: form.adults === "" ? 0 : Number(form.adults),
        infantsUnder2: form.infantsUnder2 === "" ? 0 : Number(form.infantsUnder2),
        accommodationId: form.accommodationId,
        hasBooking: form.hasBooking,
        availableFundsUsd: form.availableFundsUsd === "" ? 0 : Number(form.availableFundsUsd),
        departureClassId: form.departureClassId,
        diving: form.diving,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const readiness = useMemo(
    () => computeReadiness(hasError ? [] : result.documents, haveIds),
    [hasError, result, haveIds],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Maldives Entry Requirement Checklist",
      `Arrival: ${result.arrivalDate}  |  ${result.nights} night(s) against the free ${result.visaDays}-day visa on arrival`,
      `Party: ${result.adults} aged 2+, ${result.infantsUnder2} under 2`,
      `Stay: ${result.accommodation.label}`,
      `Passport must stay valid to ${result.passportMustBeValidUntil} (yours: ${result.passportExpiry})`,
      result.hasBooking
        ? "Funds test: not applied, you have a confirmed booking"
        : `Funds test: ${usd.format(result.fundsRequiredUsd)} required, ${usd.format(result.availableFundsUsd)} evidenced`,
      `Green Tax: ${usd.format(result.greenTaxTotalUsd)} at ${usd.format(result.greenTaxRateUsd)} per person per night`,
      `Departure charges: ${usd.format(result.departureTotalUsd)} (${result.departureClass.label})`,
      `Government charges total: ${usd.format(result.governmentChargesUsd)}`,
      `Readiness: ${readiness.have} of ${readiness.total} required items (${readiness.percent}%)`,
      "",
      ...result.warnings.map((warning) => `! ${warning}`),
      result.warnings.length ? "" : null,
      "Required:",
      ...result.requiredDocuments.map(
        (doc) => `[${haveIds.includes(doc.id) ? "x" : " "}] ${doc.label}`,
      ),
      "",
      "Worth carrying:",
      ...result.optionalDocuments.map((doc) => `[ ] ${doc.label}`),
    ]
      .filter((line) => line !== null)
      .join("\n");
  }, [hasError, result, readiness, haveIds]);

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
    setForm(DEFAULTS);
    setHaveIds([]);
    setCopied(false);
  };

  const chosenStay = ACCOMMODATION_TYPES.find((entry) => entry.id === form.accommodationId);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Waves className="h-4 w-4" aria-hidden="true" />
          Entry rules
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Maldives Entry Requirement Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every nationality gets a free {VISA_ON_ARRIVAL_DAYS}-day visa on arrival, so the things
          that actually go wrong are the IMUGA declaration inside the {IMUGA_WINDOW_HOURS}-hour
          window, a passport that clears the Maldivian rule but not the airline&apos;s, and the
          funds test that applies when nothing is booked. Set your trip below.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mv-arrival">
              Arrival date
            </label>
            <input
              id="mv-arrival"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.arrivalDate}
              onChange={(event) => setField("arrivalDate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mv-passport">
              Passport expiry date
            </label>
            <input
              id="mv-passport"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.passportExpiry}
              onChange={(event) => setField("passportExpiry", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mv-nights">
              Nights of stay
            </label>
            <input
              id="mv-nights"
              type="number"
              inputMode="numeric"
              min="1"
              max="365"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.nights}
              onChange={(event) => setField("nights", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mv-stay">
              Where you are staying
            </label>
            <select
              id="mv-stay"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.accommodationId}
              onChange={(event) => setField("accommodationId", event.target.value)}
            >
              {ACCOMMODATION_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mv-adults">
              Travellers aged 2 and over
            </label>
            <input
              id="mv-adults"
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.adults}
              onChange={(event) => setField("adults", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mv-infants">
              Children under 2 (tax exempt)
            </label>
            <input
              id="mv-infants"
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.infantsUnder2}
              onChange={(event) => setField("infantsUnder2", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mv-class">
              Class you will fly out in
            </label>
            <select
              id="mv-class"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.departureClassId}
              onChange={(event) => setField("departureClassId", event.target.value)}
            >
              {DEPARTURE_CLASSES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mv-funds">
              Funds you can evidence in USD
            </label>
            <input
              id="mv-funds"
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.availableFundsUsd}
              onChange={(event) => setField("availableFundsUsd", event.target.value)}
              disabled={form.hasBooking}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {form.hasBooking
                ? "Not needed while a confirmed booking is ticked."
                : "Immigration applies USD 100 plus USD 50 for each day of the stay."}
            </p>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Anything else that applies?
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className={CHECK_ROW} htmlFor="mv-booking">
              <input
                id="mv-booking"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={form.hasBooking}
                onChange={toggleBooking}
              />
              <span>Confirmed booking at a registered facility</span>
            </label>
            <label className={CHECK_ROW} htmlFor="mv-dive">
              <input
                id="mv-dive"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={form.diving}
                onChange={() => setField("diving", !form.diving)}
              />
              <span>Diving or snorkelling trips planned</span>
            </label>
          </div>
          {chosenStay ? (
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">{chosenStay.note}</p>
          ) : null}
        </fieldset>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Government charges on top of the room rate
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : usd.format(result.governmentChargesUsd)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the figures and the checklist."
                : `Green Tax plus departure charges — ${readiness.have} of ${readiness.total} documents ready`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Maldives entry checklist"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy checklist"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div className="mt-4">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${readiness.percent} percent of the required items are ready`}
            >
              <span
                className={`block h-full ${readiness.ready ? "bg-[var(--success)]" : "bg-[var(--primary)]"}`}
                style={{ width: `${readiness.percent}%` }}
              />
            </div>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Visa on arrival",
              hasError ? DASH : `${result.visaDays} days free (you plan ${result.nights})`,
            ],
            ["Passport valid to (Maldivian rule)", hasError ? DASH : result.passportMustBeValidUntil],
            [
              "Six-month airline rule of thumb",
              hasError
                ? DASH
                : result.meetsAirlineRuleOfThumb
                  ? "Also met"
                  : `Not met — wants ${result.airlineRuleOfThumbUntil}`,
            ],
            [
              "Funds test",
              hasError
                ? DASH
                : result.hasBooking
                  ? "Not applied — booking confirmed"
                  : `${usd.format(result.fundsRequiredUsd)} required`,
            ],
            [
              "Green Tax rate",
              hasError ? DASH : `${usd.format(result.greenTaxRateUsd)} per person per night`,
            ],
            ["Green Tax total", hasError ? DASH : usd.format(result.greenTaxTotalUsd)],
            [
              "Departure charges per person",
              hasError ? DASH : usd.format(result.departurePerPersonUsd),
            ],
            ["Departure charges total", hasError ? DASH : usd.format(result.departureTotalUsd)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.verdict}
          </p>
        )}
      </section>

      {!hasError && result.warnings.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Sort these out first</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {result.warnings.map((warning) => (
              <li key={warning} className="flex items-start gap-2">
                <TriangleAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger)]"
                  aria-hidden="true"
                />
                <span className="text-[var(--muted-foreground)]">{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Required</h2>
          <ul className="mt-3 grid gap-3">
            {result.requiredDocuments.map((doc) => (
              <li key={doc.id}>
                <label
                  className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                  htmlFor={`mv-d-${doc.id}`}
                >
                  <input
                    id={`mv-d-${doc.id}`}
                    type="checkbox"
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                    checked={haveIds.includes(doc.id)}
                    onChange={() => toggleHave(doc.id)}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{doc.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                      {doc.detail}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>

          {result.optionalDocuments.length > 0 && (
            <>
              <h2 className="mt-6 text-base font-semibold">Worth carrying</h2>
              <ul className="mt-3 grid gap-3">
                {result.optionalDocuments.map((doc) => (
                  <li
                    key={doc.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <p className="text-sm font-semibold">{doc.label}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                      {doc.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not immigration or tax advice. Green Tax, the Airport Development Fee
        and the Departure Tax are set by Maldivian legislation and have been revised more than once
        — confirm current rates with the Maldives Inland Revenue Authority, and entry conditions
        with Maldives Immigration. Departure charges are normally collected inside the air fare.
      </p>
    </main>
  );
}
