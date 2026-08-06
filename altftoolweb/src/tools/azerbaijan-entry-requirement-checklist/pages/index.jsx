"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Stamp, TriangleAlert } from "lucide-react";

import {
  CURRENCY_DECLARATION_USD,
  PASSPORT_VALIDITY_MONTHS_BEYOND_STAY,
  PURPOSES,
  REGISTRATION_THRESHOLD_DAYS,
  ROUTES,
  buildAzerbaijanChecklist,
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
  routeId: "evisa-standard",
  purposeId: "tourism",
  arrivalDate: "2027-05-10",
  passportExpiry: "2029-01-01",
  stayDays: "10",
  travellers: "2",
  children: "0",
  leavingAndReturning: false,
  carryingCash: false,
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

  const changeRoute = (routeId) => {
    setForm((current) => ({ ...current, routeId }));
    setHaveIds([]);
  };

  const toggleHave = (id) =>
    setHaveIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const result = useMemo(
    () =>
      buildAzerbaijanChecklist({
        routeId: form.routeId,
        purposeId: form.purposeId,
        arrivalDate: form.arrivalDate,
        passportExpiry: form.passportExpiry,
        stayDays: form.stayDays === "" ? Number.NaN : Number(form.stayDays),
        travellers: form.travellers === "" ? 0 : Number(form.travellers),
        children: form.children === "" ? 0 : Number(form.children),
        leavingAndReturning: form.leavingAndReturning,
        carryingCash: form.carryingCash,
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
      "Azerbaijan Entry Requirement Checklist",
      `Route: ${result.route.label} (${result.route.processingText})`,
      `Purpose: ${result.purpose.label}`,
      `Arrival ${result.arrivalDate}, departure ${result.departureDate} — ${result.stayDays} day(s) against a ${result.maxStayDays}-day admission`,
      `Passport must stay valid to ${result.passportMustBeValidUntil} (yours: ${result.passportExpiry})`,
      result.needsRegistration
        ? `Register with the State Migration Service by ${result.registrationDeadline}`
        : `No registration needed — stays of ${REGISTRATION_THRESHOLD_DAYS} days or less are exempt`,
      result.feeUnknown
        ? "Visa cost: fee varies by mission — contact the embassy directly"
        : `Visa cost: ${usd.format(result.visaFeeTotalUsd)} for ${result.travellers} traveller(s)${result.needsSecondVisa ? ", including a second visa for the return leg" : ""}`,
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

  const chosenRoute = ROUTES.find((entry) => entry.id === form.routeId);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Stamp className="h-4 w-4" aria-hidden="true" />
          Entry rules
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Azerbaijan Entry Requirement Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two things catch visitors: the ASAN e-visa is single entry with a fixed 30-day stay, and a
          stay past {REGISTRATION_THRESHOLD_DAYS} days has to be registered with the State Migration
          Service — the fine for missing that is collected at the airport on the way out. Set your
          dates to get both deadlines.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="az-route">
              Entry route
            </label>
            <select
              id="az-route"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.routeId}
              onChange={(event) => changeRoute(event.target.value)}
            >
              {ROUTES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {chosenRoute ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{chosenRoute.note}</p>
            ) : null}
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="az-purpose">
              Purpose of the visit
            </label>
            <select
              id="az-purpose"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.purposeId}
              onChange={(event) => setField("purposeId", event.target.value)}
            >
              {PURPOSES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="az-stay">
              Days you will stay
            </label>
            <input
              id="az-stay"
              type="number"
              inputMode="numeric"
              min="1"
              max="365"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.stayDays}
              onChange={(event) => setField("stayDays", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="az-arrival">
              Arrival date
            </label>
            <input
              id="az-arrival"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.arrivalDate}
              onChange={(event) => setField("arrivalDate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="az-passport">
              Passport expiry date
            </label>
            <input
              id="az-passport"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.passportExpiry}
              onChange={(event) => setField("passportExpiry", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="az-travellers">
              Travellers in the party
            </label>
            <input
              id="az-travellers"
              type="number"
              inputMode="numeric"
              min="1"
              max="60"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.travellers}
              onChange={(event) => setField("travellers", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="az-children">
              How many are children
            </label>
            <input
              id="az-children"
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.children}
              onChange={(event) => setField("children", event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Anything else that applies?
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className={CHECK_ROW} htmlFor="az-reentry">
              <input
                id="az-reentry"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={form.leavingAndReturning}
                onChange={() => setField("leavingAndReturning", !form.leavingAndReturning)}
              />
              <span>Leaving and coming back (Georgia, Iran)</span>
            </label>
            <label className={CHECK_ROW} htmlFor="az-cash">
              <input
                id="az-cash"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={form.carryingCash}
                onChange={() => setField("carryingCash", !form.carryingCash)}
              />
              <span>Carrying over {usd.format(CURRENCY_DECLARATION_USD)} in cash</span>
            </label>
          </div>
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
              Visa cost for the party
            </p>
            <p
              className={
                hasError || result.feeUnknown
                  ? "mt-1 text-xl font-semibold text-[var(--primary)] sm:text-2xl"
                  : "mt-1 text-4xl font-semibold text-[var(--primary)]"
              }
            >
              {hasError
                ? DASH
                : result.feeUnknown
                  ? "Fee varies by mission — contact the embassy"
                  : usd.format(result.visaFeeTotalUsd)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the figures and the checklist."
                : `${readiness.have} of ${readiness.total} required documents in hand`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Azerbaijan entry checklist"
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
            ["Processing", hasError ? DASH : result.route.processingText],
            [
              "Admission on this route",
              hasError ? DASH : `${result.maxStayDays} days (you plan ${result.stayDays})`,
            ],
            ["Departure date", hasError ? DASH : result.departureDate],
            [
              `Passport valid to (${PASSPORT_VALIDITY_MONTHS_BEYOND_STAY} months past departure)`,
              hasError ? DASH : result.passportMustBeValidUntil,
            ],
            [
              "Passport check",
              hasError
                ? DASH
                : result.passportOk
                  ? "Passes"
                  : `Short by ${result.passportShortfallDays} day(s)`,
            ],
            [
              "Migration Service registration",
              hasError
                ? DASH
                : result.needsRegistration
                  ? `Due by ${result.registrationDeadline}`
                  : "Not needed for this stay",
            ],
            [
              "Visa fee per traveller",
              hasError
                ? DASH
                : result.feeUnknown
                  ? "Set by the mission"
                  : usd.format(result.visaFeePerPersonUsd),
            ],
            [
              "Entries",
              hasError ? DASH : result.route.singleEntry ? "Single entry" : "Multiple entries",
            ],
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
          <h2 className="text-base font-semibold">Deadlines and traps</h2>
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
                  htmlFor={`az-d-${doc.id}`}
                >
                  <input
                    id={`az-d-${doc.id}`}
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
        Informational only, not immigration advice. e-Visa fees, visa-free lists and stay limits are
        set by Azerbaijan&apos;s State Migration Service and Ministry of Foreign Affairs and change
        — apply on the official ASAN Visa portal and confirm the current rules there before paying.
      </p>
    </main>
  );
}
