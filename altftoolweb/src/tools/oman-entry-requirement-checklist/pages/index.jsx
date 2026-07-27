"use client";

import { useMemo, useState } from "react";
import { Check, Compass, Copy, RotateCcw, TriangleAlert } from "lucide-react";

import {
  CURRENCY_DECLARATION_OMR,
  PASSPORT_VALIDITY_MONTHS,
  PURPOSES,
  ROUTES,
  VISA_FREE_FUNDS_OMR,
  buildOmanChecklist,
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
  routeId: "visa-free",
  purposeId: "tourism",
  arrivalDate: "2027-01-20",
  passportExpiry: "2029-01-01",
  stayDays: "10",
  travellers: "2",
  children: "0",
  fundsOmr: String(VISA_FREE_FUNDS_OMR),
  carryingCash: false,
};

const omr = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "OMR",
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
      buildOmanChecklist({
        routeId: form.routeId,
        purposeId: form.purposeId,
        arrivalDate: form.arrivalDate,
        passportExpiry: form.passportExpiry,
        stayDays: form.stayDays === "" ? Number.NaN : Number(form.stayDays),
        travellers: form.travellers === "" ? 0 : Number(form.travellers),
        children: form.children === "" ? 0 : Number(form.children),
        fundsOmr: form.fundsOmr === "" ? 0 : Number(form.fundsOmr),
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
      "Oman Entry Requirement Checklist",
      `Route: ${result.route.label}`,
      `Purpose: ${result.purpose.label}`,
      `Arrival: ${result.arrivalDate}  |  ${result.stayDays} day(s) against a ${result.maxStayDays}-day admission`,
      `Passport must stay valid to ${result.passportMustBeValidUntil} (yours: ${result.passportExpiry})`,
      `Visa cost: ${omr.format(result.visaFeeTotalOmr)} for ${result.travellers} traveller(s)`,
      result.fundsRequiredOmr
        ? `Funds to evidence: ${omr.format(result.fundsRequiredOmr)} — you entered ${omr.format(result.fundsOmr)}`
        : "Funds evidence: not part of this route",
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
          <Compass className="h-4 w-4" aria-hidden="true" />
          Entry rules
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Oman Entry Requirement Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Oman waives the visa for citizens of just over a hundred countries, but only for 14 days
          and only with a hotel booking, insurance, a return ticket and funds. Anything longer
          starts as a Royal Oman Police e-visa applied for before you fly. Compare the routes for
          your dates below.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="om-route">
              Entry route
            </label>
            <select
              id="om-route"
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
            <label className={LABEL_CLASS} htmlFor="om-purpose">
              Purpose of the visit
            </label>
            <select
              id="om-purpose"
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
            <label className={LABEL_CLASS} htmlFor="om-stay">
              Days you will stay
            </label>
            <input
              id="om-stay"
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
            <label className={LABEL_CLASS} htmlFor="om-arrival">
              Arrival date
            </label>
            <input
              id="om-arrival"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.arrivalDate}
              onChange={(event) => setField("arrivalDate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="om-passport">
              Passport or ID expiry date
            </label>
            <input
              id="om-passport"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.passportExpiry}
              onChange={(event) => setField("passportExpiry", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="om-travellers">
              Travellers in the party
            </label>
            <input
              id="om-travellers"
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
            <label className={LABEL_CLASS} htmlFor="om-children">
              How many are children
            </label>
            <input
              id="om-children"
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
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="om-funds">
              Funds you can evidence, in Omani rials
            </label>
            <input
              id="om-funds"
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.fundsOmr}
              onChange={(event) => setField("fundsOmr", event.target.value)}
              disabled={!(chosenRoute && chosenRoute.requiresFundsEvidence)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {chosenRoute && chosenRoute.requiresFundsEvidence
                ? `The visa-free route commonly asks for about OMR ${VISA_FREE_FUNDS_OMR} or the equivalent.`
                : "Funds evidence is a condition of the visa-free route, not of the paid e-visas."}
            </p>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Anything else that applies?
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className={CHECK_ROW} htmlFor="om-cash">
              <input
                id="om-cash"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={form.carryingCash}
                onChange={() => setField("carryingCash", !form.carryingCash)}
              />
              <span>Carrying over {omr.format(CURRENCY_DECLARATION_OMR)} in cash</span>
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
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : omr.format(result.visaFeeTotalOmr)}
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
              aria-label="Copy the Oman entry checklist"
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
              "With extension",
              hasError
                ? DASH
                : result.extensionDays > 0
                  ? `${result.maxStayWithExtensionDays} days`
                  : "Not extendable",
            ],
            ["Visa fee per traveller", hasError ? DASH : omr.format(result.visaFeePerPersonOmr)],
            [
              `Document valid to (${PASSPORT_VALIDITY_MONTHS}-month rule)`,
              hasError ? DASH : result.passportMustBeValidUntil,
            ],
            [
              "Document check",
              hasError
                ? DASH
                : result.passportOk
                  ? "Passes"
                  : `Short by ${result.passportShortfallDays} day(s)`,
            ],
            [
              "Funds test",
              hasError
                ? DASH
                : result.fundsRequiredOmr === 0
                  ? "Not part of this route"
                  : result.fundsOk
                    ? `Met (${omr.format(result.fundsRequiredOmr)})`
                    : `Short by ${omr.format(result.fundsShortfallOmr)}`,
            ],
            ["Required items", hasError ? DASH : String(result.requiredDocuments.length)],
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
            {result.cheaperOption
              ? ` A cheaper option covers this length of trip: ${result.cheaperOption.label}.`
              : ""}
          </p>
        )}
      </section>

      {!hasError && result.warnings.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Check these before booking</h2>
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
                  htmlFor={`om-d-${doc.id}`}
                >
                  <input
                    id={`om-d-${doc.id}`}
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
        Informational only, not immigration advice. Visa categories, fees and the visa-free list are
        set by the Royal Oman Police and change — check the official e-visa portal before paying,
        and apply there rather than through a reseller. Work needs a sponsored permit arranged
        before travel.
      </p>
    </main>
  );
}
