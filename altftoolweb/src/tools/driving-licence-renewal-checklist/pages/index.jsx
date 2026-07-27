"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Check, Copy, IdCard, RotateCcw } from "lucide-react";
import {
  GRACE_DAYS,
  LICENCE_TYPES,
  MEDICAL_CERTIFICATE_AGE,
  TEST_AFTER_YEARS,
  addYears,
  planLicenceRenewal,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SEED_TODAY = "2026-01-01";

function localIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

const prettyDate = (iso) => {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))));
};

export default function ToolHome() {
  const [applyOn, setApplyOn] = useState(SEED_TODAY);
  const [dob, setDob] = useState("1985-06-15");
  const [expiryDate, setExpiryDate] = useState(() => addYears(SEED_TODAY, 0));
  const [licenceType, setLicenceType] = useState("non-transport");
  const [changedAddress, setChangedAddress] = useState(false);
  const [done, setDone] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const real = localIsoDate();
    setApplyOn(real);
    setExpiryDate(real);
  }, []);

  const result = useMemo(
    () => planLicenceRenewal({ dob, expiryDate, applyOn, licenceType, changedAddress }),
    [dob, expiryDate, applyOn, licenceType, changedAddress],
  );

  const failed = Boolean(result.error);

  const required = failed ? [] : result.checklist.filter((item) => item.required);
  const optional = failed ? [] : result.checklist.filter((item) => !item.required);
  const completed = required.filter((item) => done[item.id]).length;

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Driving Licence Renewal Checklist",
      `Licence type: ${result.typeLabel}`,
      `Current expiry: ${prettyDate(result.expiryDate)} · applying on ${prettyDate(result.applyOn)}`,
      result.expired
        ? `Lapsed ${result.daysLate} days ago (grace ended ${prettyDate(result.graceEnds)})`
        : `${result.daysToExpiry} days still to run`,
      `Renewal takes effect from ${prettyDate(result.effectiveFrom)} — new expiry ${prettyDate(result.newExpiry)} (${result.validityBasis})`,
      `Fee: ${money(result.totalFee)}`,
      `Medical certificate in Form 1A: ${result.medicalRequired ? "required" : "not required"}`,
      `Driving test: ${result.testMayBeRequired ? "may be demanded" : "not expected"}`,
      "",
      "Documents to carry:",
      ...required.map((item) => `- ${item.label}`),
    ].join("\n");
  }, [failed, result, required]);

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
    const real = localIsoDate();
    setApplyOn(real);
    setExpiryDate(real);
    setDob("1985-06-15");
    setLicenceType("non-transport");
    setChangedAddress(false);
    setDone({});
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <IdCard className="h-4 w-4" aria-hidden="true" />
          Vehicle compliance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Driving Licence Renewal Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your date of birth and the expiry on the card to get the documents the RTO will ask
          for, the fee including any late charge, and how long the renewed licence will last under
          section 14(2) of the Motor Vehicles Act.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dob">
              Date of birth
            </label>
            <input
              id="dob"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={dob}
              onChange={(event) => setDob(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="expiry">
              Licence valid until
            </label>
            <input
              id="expiry"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={expiryDate}
              onChange={(event) => setExpiryDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="apply-on">
              Applying on
            </label>
            <input
              id="apply-on"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={applyOn}
              onChange={(event) => setApplyOn(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="licence-type">
              Licence type
            </label>
            <select
              id="licence-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={licenceType}
              onChange={(event) => setLicenceType(event.target.value)}
            >
              {LICENCE_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex min-h-11 items-center gap-3">
          <input
            id="changed-address"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={changedAddress}
            onChange={(event) => setChangedAddress(event.target.checked)}
          />
          <label className="text-sm font-semibold" htmlFor="changed-address">
            My address has changed since the licence was issued
          </label>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total fee to renew
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? "—" : money(result.totalFee)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to build the checklist."
                : `${result.requiredCount} documents to carry · renewed licence valid to ${prettyDate(result.newExpiry)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the licence renewal checklist"
              className={GHOST_BTN}
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
            ["Your age on the application date", failed ? "—" : `${result.ageAtApplication} years`],
            [
              "Licence status",
              failed
                ? "—"
                : result.expired
                  ? `Lapsed ${result.daysLate} days ago`
                  : `${result.daysToExpiry} days still valid`,
            ],
            [
              `Grace period (${GRACE_DAYS} days) ends`,
              failed ? "—" : prettyDate(result.graceEnds),
            ],
            ["Renewal takes effect from", failed ? "—" : prettyDate(result.effectiveFrom)],
            ["New expiry date", failed ? "—" : prettyDate(result.newExpiry)],
            ["How that validity is worked out", failed ? "—" : result.validityBasis],
            ["Base renewal fee", failed ? "—" : money(result.baseFee)],
            [
              "Late fee",
              failed
                ? "—"
                : result.lateFee > 0
                  ? `${money(result.lateFee)} (${result.lateYears} year${result.lateYears === 1 ? "" : "s"} past the grace period)`
                  : "None",
            ],
            [
              "Test of competence fee",
              failed ? "—" : result.testFee > 0 ? money(result.testFee) : "Not applicable",
            ],
            [
              "Medical certificate (Form 1A)",
              failed ? "—" : result.medicalRequired ? "Required" : "Not required",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.effectiveBasis}
            {result.testMayBeRequired
              ? ` The licence has been out of force for more than ${TEST_AFTER_YEARS} years, so the licensing authority may require you to pass the driving test again.`
              : ""}
          </p>
        )}
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Documents to carry</h2>
            <span className="inline-flex items-center gap-2 rounded-md bg-[var(--muted)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              {completed} of {required.length} ready
            </span>
          </div>
          <ul className="mt-4 grid gap-3">
            {required.map((item) => (
              <li key={item.id} className="flex items-start gap-3 rounded-lg border border-[var(--border)] p-3">
                <input
                  id={`chk-${item.id}`}
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
                  checked={Boolean(done[item.id])}
                  onChange={(event) =>
                    setDone((current) => ({ ...current, [item.id]: event.target.checked }))
                  }
                />
                <label className="text-sm" htmlFor={`chk-${item.id}`}>
                  <span className="font-semibold">{item.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                    {item.note}
                  </span>
                </label>
              </li>
            ))}
          </ul>

          {optional.length > 0 && (
            <>
              <h3 className="mt-6 text-sm font-semibold text-[var(--muted-foreground)]">
                Not needed in your case
              </h3>
              <ul className="mt-2 grid gap-2 text-xs leading-5 text-[var(--muted-foreground)]">
                {optional.map((item) => (
                  <li key={item.id}>
                    {item.label} — {item.note}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">How the renewal runs</h2>
          <ol className="mt-3 grid gap-3 text-sm leading-6">
            {result.steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-semibold text-[var(--primary)]">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Fees follow the Central Motor Vehicles Rules, 1989 fee
        table and states add smart-card, postal and service charges on top; medical certificates are
        required from age {MEDICAL_CERTIFICATE_AGE} and for every transport licence. Confirm the
        current requirement for your state on the Parivahan Sarathi portal or at your RTO.
      </p>
    </main>
  );
}
