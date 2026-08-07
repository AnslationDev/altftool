"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Tent, TriangleAlert } from "lucide-react";

import {
  CURRENCY_DECLARATION_USD,
  ETA_FEE_USD,
  ETA_FREE_UNDER_AGE,
  ETA_VALIDITY_DAYS,
  PASSPORT_VALIDITY_MONTHS,
  PURPOSES,
  ROUTES,
  buildKenyaChecklist,
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
  routeId: "eta",
  purposeId: "tourism",
  arrivalDate: "2027-02-10",
  passportExpiry: "2029-01-01",
  etaApprovalDate: "",
  stayDays: "12",
  adults: "2",
  childrenUnder16: "0",
  childFeeUsd: "0",
  yellowFeverRisk: false,
  carryingCash: false,
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
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
      buildKenyaChecklist({
        routeId: form.routeId,
        purposeId: form.purposeId,
        arrivalDate: form.arrivalDate,
        passportExpiry: form.passportExpiry,
        etaApprovalDate: form.etaApprovalDate,
        stayDays: form.stayDays === "" ? Number.NaN : Number(form.stayDays),
        adults: form.adults === "" ? 0 : Number(form.adults),
        childrenUnder16: form.childrenUnder16 === "" ? 0 : Number(form.childrenUnder16),
        childFeeUsd: form.childFeeUsd === "" ? 0 : Number(form.childFeeUsd),
        yellowFeverRisk: form.yellowFeverRisk,
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
      "Kenya Entry Requirement Checklist",
      `Route: ${result.route.label}`,
      `Purpose: ${result.purpose.label}`,
      `Arrival: ${result.arrivalDate}  |  ${result.stayDays} day(s) against a ${result.maxStayDays}-day admission`,
      `Passport must stay valid to ${result.passportMustBeValidUntil} (yours: ${result.passportExpiry})`,
      result.needsEta
        ? `eTA cost: ${usd.format(result.etaTotalUsd)} for ${result.partySize} traveller(s)`
        : "No eTA needed on this route",
      result.etaLastEntryDate
        ? `eTA approved ${result.etaApprovalDate} must be used by ${result.etaLastEntryDate}`
        : null,
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
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Reset all inputs? This clears every entered date, party detail and checked document.",
      )
    ) {
      return;
    }
    setForm(DEFAULTS);
    setHaveIds([]);
    setCopied(false);
  };

  const chosenRoute = ROUTES.find((entry) => entry.id === form.routeId);
  const etaRoute = Boolean(chosenRoute && chosenRoute.needsEta);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Tent className="h-4 w-4" aria-hidden="true" />
          Entry rules
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Kenya Entry Requirement Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Kenya dropped visas in January 2024 and replaced them with an Electronic Travel
          Authorisation at USD {ETA_FEE_USD} plus processing. It is not the same as visa-free: the
          eTA is single entry, must be used within {ETA_VALIDITY_DAYS} days of approval, and there
          is a separate revenue authority declaration to file before you land.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ke-route">
              Entry route
            </label>
            <select
              id="ke-route"
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
            <label className={LABEL_CLASS} htmlFor="ke-purpose">
              Purpose of the visit
            </label>
            <select
              id="ke-purpose"
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
            <label className={LABEL_CLASS} htmlFor="ke-stay">
              Days you will stay
            </label>
            <input
              id="ke-stay"
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
            <label className={LABEL_CLASS} htmlFor="ke-arrival">
              Arrival date
            </label>
            <input
              id="ke-arrival"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.arrivalDate}
              onChange={(event) => setField("arrivalDate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ke-passport">
              Passport expiry date
            </label>
            <input
              id="ke-passport"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.passportExpiry}
              onChange={(event) => setField("passportExpiry", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ke-adults">
              Travellers aged {ETA_FREE_UNDER_AGE} and over
            </label>
            <input
              id="ke-adults"
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
            <label className={LABEL_CLASS} htmlFor="ke-children">
              Children under {ETA_FREE_UNDER_AGE}
            </label>
            <input
              id="ke-children"
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.childrenUnder16}
              onChange={(event) => setField("childrenUnder16", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ke-approval">
              eTA approval date (optional)
            </label>
            <input
              id="ke-approval"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.etaApprovalDate}
              onChange={(event) => setField("etaApprovalDate", event.target.value)}
              disabled={!etaRoute}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Fill this in to check the {ETA_VALIDITY_DAYS}-day window still covers your arrival.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ke-childfee">
              Fee charged per child in USD
            </label>
            <input
              id="ke-childfee"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.childFeeUsd}
              onChange={(event) => setField("childFeeUsd", event.target.value)}
              disabled={!etaRoute}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Kenya has announced a free eTA for under-{ETA_FREE_UNDER_AGE}s; change it if your case
              differs.
            </p>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Anything else that applies?
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className={CHECK_ROW} htmlFor="ke-yf">
              <input
                id="ke-yf"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={form.yellowFeverRisk}
                onChange={() => setField("yellowFeverRisk", !form.yellowFeverRisk)}
              />
              <span>Arriving from a yellow fever risk country</span>
            </label>
            <label className={CHECK_ROW} htmlFor="ke-cash">
              <input
                id="ke-cash"
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

      <section
        aria-live="polite"
        aria-atomic="true"
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Authorisation cost for the party
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : usd.format(result.etaTotalUsd)}
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
              aria-label="Copy the Kenya entry checklist"
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
              "Admission on this route",
              hasError ? DASH : `${result.maxStayDays} days (you plan ${result.stayDays})`,
            ],
            [
              "eTA per adult",
              hasError ? DASH : result.needsEta ? usd.format(result.etaPerAdultUsd) : "Not required",
            ],
            [
              "eTA per child",
              hasError ? DASH : result.needsEta ? usd.format(result.etaPerChildUsd) : "Not required",
            ],
            [
              `Passport valid to (${PASSPORT_VALIDITY_MONTHS}-month rule)`,
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
              "eTA usable until",
              hasError ? DASH : result.etaLastEntryDate ? result.etaLastEntryDate : "Not entered",
            ],
            [
              "Approval window on arrival",
              hasError
                ? DASH
                : result.etaStillValidOnArrival === null
                  ? "Not checked"
                  : result.etaStillValidOnArrival
                    ? `Valid, ${result.etaDaysMargin} day(s) to spare`
                    : "Expired or not yet issued",
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
          <h2 className="text-base font-semibold">Things people get caught by</h2>
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
                  htmlFor={`ke-d-${doc.id}`}
                >
                  <input
                    id={`ke-d-${doc.id}`}
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
        Informational only, and not immigration or medical advice. eTA fees, exemption lists and
        permitted stays are set by Kenyan authorities and have changed more than once since 2024 —
        apply on the official eTA site and confirm the current rules there. Discuss vaccination and
        malaria prevention with a travel clinic.
      </p>
    </main>
  );
}
