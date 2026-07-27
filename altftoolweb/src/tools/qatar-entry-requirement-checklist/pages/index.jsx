"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw, TriangleAlert } from "lucide-react";

import {
  CURRENCY_DECLARATION_QAR,
  INSURANCE_POLICY_DAYS,
  INSURANCE_POLICY_QAR,
  PASSPORT_VALIDITY_MONTHS,
  PURPOSES,
  ROUTES,
  buildQatarChecklist,
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
  routeId: "waiver-30",
  purposeId: "tourism",
  arrivalDate: "2026-12-01",
  passportExpiry: "2029-01-01",
  stayDays: "7",
  travellers: "2",
  children: "0",
  insurancePolicyQar: String(INSURANCE_POLICY_QAR),
  carryingCash: false,
  carryingMedication: false,
};

const qar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "QAR",
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
      buildQatarChecklist({
        routeId: form.routeId,
        purposeId: form.purposeId,
        arrivalDate: form.arrivalDate,
        passportExpiry: form.passportExpiry,
        stayDays: form.stayDays === "" ? Number.NaN : Number(form.stayDays),
        travellers: form.travellers === "" ? 0 : Number(form.travellers),
        children: form.children === "" ? 0 : Number(form.children),
        insurancePolicyQar:
          form.insurancePolicyQar === "" ? INSURANCE_POLICY_QAR : Number(form.insurancePolicyQar),
        carryingCash: form.carryingCash,
        carryingMedication: form.carryingMedication,
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
      "Qatar Entry Requirement Checklist",
      `Route: ${result.route.label}`,
      `Purpose: ${result.purpose.label}`,
      `Arrival: ${result.arrivalDate}  |  ${result.stayDays} day(s) against a ${result.maxStayDays}-day admission`,
      `Passport must stay valid to ${result.passportMustBeValidUntil} (yours: ${result.passportExpiry})`,
      `Health insurance: ${result.policiesPerPerson} policy period(s) per person, ${qar.format(result.insuranceTotalQar)} for the party`,
      `Visa fees: ${qar.format(result.visaFeeTotalQar)}`,
      `Government cost total: ${qar.format(result.governmentCostQar)}`,
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
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Entry rules
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Qatar Entry Requirement Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Around a hundred nationalities enter Qatar without a visa, but every visitor has needed
          health insurance from a Qatar-registered company since February 2023, and the permitted
          stay differs between the two waiver bands. Set your route and dates to test both and price
          the cover.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="qa-route">
              How you are entering
            </label>
            <select
              id="qa-route"
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
            <label className={LABEL_CLASS} htmlFor="qa-purpose">
              Purpose of the visit
            </label>
            <select
              id="qa-purpose"
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
            <label className={LABEL_CLASS} htmlFor="qa-stay">
              Days you will stay
            </label>
            <input
              id="qa-stay"
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
            <label className={LABEL_CLASS} htmlFor="qa-arrival">
              Arrival date
            </label>
            <input
              id="qa-arrival"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.arrivalDate}
              onChange={(event) => setField("arrivalDate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="qa-passport">
              Passport expiry date
            </label>
            <input
              id="qa-passport"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.passportExpiry}
              onChange={(event) => setField("passportExpiry", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="qa-travellers">
              Travellers in the party
            </label>
            <input
              id="qa-travellers"
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
            <label className={LABEL_CLASS} htmlFor="qa-children">
              How many are children
            </label>
            <input
              id="qa-children"
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
            <label className={LABEL_CLASS} htmlFor="qa-policy">
              Price of one {INSURANCE_POLICY_DAYS}-day insurance policy in QAR
            </label>
            <input
              id="qa-policy"
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.insurancePolicyQar}
              onChange={(event) => setField("insurancePolicyQar", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              The standard visitor policy has been sold at about QAR {INSURANCE_POLICY_QAR} for{" "}
              {INSURANCE_POLICY_DAYS} days. Put your own quote in if you have one.
            </p>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Anything else that applies?
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className={CHECK_ROW} htmlFor="qa-cash">
              <input
                id="qa-cash"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={form.carryingCash}
                onChange={() => setField("carryingCash", !form.carryingCash)}
              />
              <span>Carrying over {qar.format(CURRENCY_DECLARATION_QAR)} in cash</span>
            </label>
            <label className={CHECK_ROW} htmlFor="qa-meds">
              <input
                id="qa-meds"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={form.carryingMedication}
                onChange={() => setField("carryingMedication", !form.carryingMedication)}
              />
              <span>Carrying prescription medication</span>
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
              Insurance and visa cost for the party
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : qar.format(result.governmentCostQar)}
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
              aria-label="Copy the Qatar entry checklist"
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
              "Admission on arrival",
              hasError ? DASH : `${result.maxStayDays} days (you plan ${result.stayDays})`,
            ],
            [
              "With extension",
              hasError
                ? DASH
                : result.extensionDays > 0
                  ? `${result.maxStayWithExtensionDays} days`
                  : "No extension on this route",
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
              "Insurance policy periods per person",
              hasError ? DASH : String(result.policiesPerPerson),
            ],
            ["Insurance per person", hasError ? DASH : qar.format(result.insurancePerPersonQar)],
            ["Insurance for the party", hasError ? DASH : qar.format(result.insuranceTotalQar)],
            ["Visa fees", hasError ? DASH : qar.format(result.visaFeeTotalQar)],
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
          <h2 className="text-base font-semibold">Watch these</h2>
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
                  htmlFor={`qa-d-${doc.id}`}
                >
                  <input
                    id={`qa-d-${doc.id}`}
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
        Informational only, not immigration advice. Visa-waiver lists, permitted stays and insurance
        pricing are set by Qatar&apos;s Ministry of Interior and Ministry of Public Health and
        change — confirm on the official portals before booking. Work and residence need a separate
        permission arranged by a sponsor.
      </p>
    </main>
  );
}
