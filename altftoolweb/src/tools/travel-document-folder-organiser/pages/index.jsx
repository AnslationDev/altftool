"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FolderCheck, RotateCcw, TriangleAlert } from "lucide-react";

import {
  CASH_DECLARATION_THRESHOLDS,
  HOLD_PLACES,
  VALIDITY_RULES,
  buildDocumentPlan,
  formatPlanText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TOGGLES = [
  ["visa", "Visa or e-visa needed"],
  ["hotel", "Hotel or host booked"],
  ["bags", "Checked or prepaid baggage"],
  ["health", "Vaccination certificate required"],
  ["insurance", "Travel insurance policy"],
  ["funds", "Proof of funds may be asked for"],
  ["invite", "Invitation / sponsorship letter"],
  ["child", "Travelling with a child"],
  ["medication", "Carrying prescription medicine"],
  ["cash", "Carrying declarable cash"],
  ["highvalue", "Carrying laptops, cameras, jewellery"],
  ["driving", "Hiring or driving a car"],
  ["transfer", "Pre-booked transfer or rail"],
  ["vat", "Claiming a VAT / GST refund"],
  ["discounts", "Student, senior or loyalty cards"],
];

const DEFAULTS = {
  tripType: "international",
  departureDate: "2026-09-01",
  returnDate: "2026-09-14",
  passportExpiry: "2030-01-15",
  passportIssued: "2022-01-10",
  validityRule: "six-month",
  travellers: "2",
  flags: { visa: true, hotel: true, bags: true, insurance: true, driving: false },
};

const DASH = "—";

export default function ToolHome() {
  const [tripType, setTripType] = useState(DEFAULTS.tripType);
  const [departureDate, setDepartureDate] = useState(DEFAULTS.departureDate);
  const [returnDate, setReturnDate] = useState(DEFAULTS.returnDate);
  const [passportExpiry, setPassportExpiry] = useState(DEFAULTS.passportExpiry);
  const [passportIssued, setPassportIssued] = useState(DEFAULTS.passportIssued);
  const [validityRule, setValidityRule] = useState(DEFAULTS.validityRule);
  const [travellers, setTravellers] = useState(DEFAULTS.travellers);
  const [flags, setFlags] = useState(DEFAULTS.flags);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildDocumentPlan({
        tripType,
        departureDate,
        returnDate,
        passportExpiry,
        passportIssued,
        validityRule,
        travellers: Number(travellers),
        flags,
      }),
    [tripType, departureDate, returnDate, passportExpiry, passportIssued, validityRule, travellers, flags],
  );

  const failed = plan.error ? null : plan.checks.filter((check) => !check.ok);

  const copyResult = async () => {
    const text = formatPlanText(plan);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTripType(DEFAULTS.tripType);
    setDepartureDate(DEFAULTS.departureDate);
    setReturnDate(DEFAULTS.returnDate);
    setPassportExpiry(DEFAULTS.passportExpiry);
    setPassportIssued(DEFAULTS.passportIssued);
    setValidityRule(DEFAULTS.validityRule);
    setTravellers(DEFAULTS.travellers);
    setFlags(DEFAULTS.flags);
    setCopied(false);
  };

  const toggle = (key) => setFlags((current) => ({ ...current, [key]: !current[key] }));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FolderCheck className="h-4 w-4" aria-hidden="true" />
          Travel paperwork
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Travel Document Folder Organiser</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Stack the folder in the order the journey asks for things — terminal door, check-in, emigration,
          security, gate, in flight, arrival, customs, car hire, hotel — and check the passport rules that
          get people turned away at the desk.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tdf-trip-type">
              Trip type
            </label>
            <select
              id="tdf-trip-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tripType}
              onChange={(event) => setTripType(event.target.value)}
            >
              <option value="international">International</option>
              <option value="domestic">Domestic</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tdf-travellers">
              Travellers
            </label>
            <input
              id="tdf-travellers"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={travellers}
              onChange={(event) => setTravellers(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tdf-depart">
              Outbound date
            </label>
            <input
              id="tdf-depart"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={departureDate}
              onChange={(event) => setDepartureDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tdf-return">
              Date you leave the destination
            </label>
            <input
              id="tdf-return"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={returnDate}
              onChange={(event) => setReturnDate(event.target.value)}
            />
          </div>

          {tripType === "international" && (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="tdf-expiry">
                  Passport expiry date
                </label>
                <input
                  id="tdf-expiry"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="date"
                  value={passportExpiry}
                  onChange={(event) => setPassportExpiry(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="tdf-issued">
                  Passport issue date
                </label>
                <input
                  id="tdf-issued"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="date"
                  value={passportIssued}
                  onChange={(event) => setPassportIssued(event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor="tdf-rule">
                  Validity rule at the destination
                </label>
                <select
                  id="tdf-rule"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={validityRule}
                  onChange={(event) => setValidityRule(event.target.value)}
                >
                  {VALIDITY_RULES.map((rule) => (
                    <option key={rule.id} value={rule.id}>
                      {rule.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">What applies to this trip?</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {TOGGLES.map(([key, label]) => (
              <label
                key={key}
                htmlFor={`tdf-flag-${key}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <input
                  id={`tdf-flag-${key}`}
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={Boolean(flags[key])}
                  onChange={() => toggle(key)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {plan.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Documents in the folder
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {plan.error ? DASH : plan.order.length}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan.error
                ? "Fix the input above to build the running order."
                : `${plan.totals.originals} originals and ${plan.totals.photocopies} photocopies for ${plan.travellers} traveller${plan.travellers === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the folder running order"
              className={GHOST_BTN}
              disabled={Boolean(plan.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy order"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Trip length", plan.error ? DASH : `${plan.tripDays} day${plan.tripDays === 1 ? "" : "s"}`],
            ["Validity rule applied", plan.error || tripType === "domestic" ? DASH : plan.ruleLabel],
            ["Keep on your person", plan.error ? DASH : `${plan.totals.byHold.person || 0} item${(plan.totals.byHold.person || 0) === 1 ? "" : "s"}`],
            ["In the folder", plan.error ? DASH : `${plan.totals.byHold.folder || 0} item${(plan.totals.byHold.folder || 0) === 1 ? "" : "s"}`],
            ["Cabin bag only", plan.error ? DASH : `${plan.totals.byHold.cabin || 0} item${(plan.totals.byHold.cabin || 0) === 1 ? "" : "s"}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!plan.error && plan.checks.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Passport checks</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {plan.checks.map((check) => (
              <li
                key={check.id}
                className={`rounded-md px-3 py-2 ${
                  check.ok
                    ? "bg-[var(--muted)] text-[var(--foreground)]"
                    : "bg-[var(--danger-soft)] text-[var(--danger)]"
                }`}
                {...(check.ok ? {} : { role: "alert" })}
              >
                <p className="font-semibold">{check.label}</p>
                <p className="mt-1 leading-6">{check.detail}</p>
              </li>
            ))}
          </ul>
          {failed && failed.length > 0 && (
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              A failed check normally means renewing before you fly. Airlines run the same test at the
              check-in desk and will refuse boarding rather than risk the carrier fine.
            </p>
          )}
        </section>
      )}

      {!plan.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Folder running order</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Load the sleeves top to bottom in this sequence.
          </p>
          <ol className="mt-4 space-y-5">
            {plan.stages.map((stage) => (
              <li key={stage.id}>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                  {stage.order}. {stage.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{stage.note}</p>
                <ul className="mt-2 space-y-2">
                  {stage.docs.map((doc) => (
                    <li
                      key={doc.id}
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-semibold">
                          <span className="text-[var(--muted-foreground)]">{doc.seq}.</span> {doc.label}
                        </p>
                        <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
                          {doc.holdLabel}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{doc.note}</p>
                      <p className="mt-1 text-xs font-semibold text-[var(--muted-foreground)]">
                        {doc.originals} original{doc.originals === 1 ? "" : "s"}
                        {doc.photocopies > 0 ? ` + ${doc.photocopies} photocopies` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>
      )}

      {!plan.error && plan.neverCheckIn.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <TriangleAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
            Never put in checked baggage
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {plan.neverCheckIn.map((label) => (
              <li
                key={label}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]"
              >
                {label}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            {HOLD_PLACES.person.note}
          </p>
          {plan.warnings.length > 0 && (
            <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
              {plan.warnings.map((warning) => (
                <li key={warning} className="rounded-md bg-[var(--muted)] px-3 py-2">
                  {warning}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {!plan.error && flags.cash && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Cash declaration thresholds</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Region</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Threshold</th>
                  <th scope="col" className="py-2 font-semibold">Form</th>
                </tr>
              </thead>
              <tbody>
                {CASH_DECLARATION_THRESHOLDS.map((row) => (
                  <tr key={row.region} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.region}</td>
                    <td className="py-2 pr-3">{row.amount}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and entry rules change. Confirm the current requirements with the destination's
        embassy or your airline's document check before you travel — the border officer's decision is final.
      </p>
    </main>
  );
}
