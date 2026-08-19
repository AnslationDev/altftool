"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Compass, Copy, RotateCcw } from "lucide-react";

import {
  FUNDING_OPTIONS,
  PURPOSE_OPTIONS,
  STREAM_OPTIONS,
  buildAustraliaCoverLetter,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const AUD = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const DASH = "—";

const DEFAULTS = {
  fullName: "Daniel Okoye",
  nationality: "Nigerian",
  passportNumber: "A0293847",
  passportExpiryDate: "2030-01-31",
  occupation: "Civil engineer",
  employer: "Harbourline Engineering Ltd",
  homeAddress: "8 Awolowo Way, Ikeja, Lagos, Nigeria",
  contact: "daniel@example.com, +234 803 000 1111",
  streamId: "tourist",
  purposeId: "family",
  applicationDate: "2026-07-15",
  arrivalDate: "2026-10-02",
  departureDate: "2026-11-05",
  itinerary: "2–14 Oct — Sydney (staying with family)\n15–25 Oct — Melbourne and Great Ocean Road\n26 Oct–5 Nov — Brisbane, then return flight",
  accommodation: "Host residence, 14 Church Street, Parramatta NSW; Vibe Hotel Melbourne (booking 30117)",
  hostName: "Chidi Okoye (brother, Australian citizen)",
  fundingId: "self",
  budgetAud: "9000",
  applicants: "2",
  chargeAud: "",
  priorDaysIn18Months: "0",
  tiesStatement:
    "I hold a permanent engineering role with approved leave, own a flat in Lagos with an outstanding mortgage, and my wife and two children remain in Nigeria.",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(copyTimeoutRef.current), []);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(() => buildAustraliaCoverLetter(form), [form]);
  const hasError = Boolean(result.error);

  const copyLetter = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.letter);
      setCopied(true);
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Compass className="h-4 w-4" aria-hidden="true" />
          Visa documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Australia Visa Cover Letter Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write the statement that goes with a Visitor visa (subclass 600) application. It frames the
          genuine visitor test, shows which 3, 6 or 12-month stay period covers your dates, and
          applies the twelve-months-in-eighteen limit under condition 8558.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Applicant</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="av-name">Full name (as in passport)</label>
            <input id="av-name" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.fullName} onChange={set("fullName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="av-nationality">Nationality</label>
            <input id="av-nationality" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.nationality} onChange={set("nationality")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="av-passport">Passport number</label>
            <input id="av-passport" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.passportNumber} onChange={set("passportNumber")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="av-expiry">Passport expiry date</label>
            <input id="av-expiry" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.passportExpiryDate} onChange={set("passportExpiryDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="av-occupation">Occupation</label>
            <input id="av-occupation" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.occupation} onChange={set("occupation")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="av-employer">Employer or institution</label>
            <input id="av-employer" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.employer} onChange={set("employer")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="av-address">Home address</label>
            <input id="av-address" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.homeAddress} onChange={set("homeAddress")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="av-contact">Email and phone</label>
            <input id="av-contact" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.contact} onChange={set("contact")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Application and trip</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="av-stream">Subclass 600 stream</label>
            <select id="av-stream" className={`mt-2 ${INPUT_CLASS}`} value={form.streamId} onChange={set("streamId")}>
              {STREAM_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="av-purpose">Purpose of visit</label>
            <select id="av-purpose" className={`mt-2 ${INPUT_CLASS}`} value={form.purposeId} onChange={set("purposeId")}>
              {PURPOSE_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="av-applied">Application (lodgement) date</label>
            <input id="av-applied" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.applicationDate} onChange={set("applicationDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="av-applicants">People applying together</label>
            <input id="av-applicants" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" max="20" value={form.applicants} onChange={set("applicants")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="av-arrival">Arrival in Australia</label>
            <input id="av-arrival" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.arrivalDate} onChange={set("arrivalDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="av-departure">Departure from Australia</label>
            <input id="av-departure" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.departureDate} onChange={set("departureDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="av-prior">Days in Australia in the last 18 months</label>
            <input id="av-prior" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" max="548" value={form.priorDaysIn18Months} onChange={set("priorDaysIn18Months")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="av-charge">Visa application charge per applicant (AUD)</label>
            <input id="av-charge" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" value={form.chargeAud} onChange={set("chargeAud")} placeholder="Check Home Affairs pricing" />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="av-itinerary">Itinerary (one line per leg)</label>
            <textarea id="av-itinerary" rows={4} className={`mt-2 ${AREA_CLASS}`} value={form.itinerary} onChange={set("itinerary")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="av-accommodation">Accommodation</label>
            <textarea id="av-accommodation" rows={2} className={`mt-2 ${AREA_CLASS}`} value={form.accommodation} onChange={set("accommodation")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Host, funding and ties</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="av-host">Australian host or sponsor</label>
            <input id="av-host" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.hostName} onChange={set("hostName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="av-funding">Who is paying?</label>
            <select id="av-funding" className={`mt-2 ${INPUT_CLASS}`} value={form.fundingId} onChange={set("fundingId")}>
              {FUNDING_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="av-budget">Funds available (AUD)</label>
            <input id="av-budget" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" value={form.budgetAud} onChange={set("budgetAud")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="av-ties">Ties to your home country</label>
            <textarea id="av-ties" rows={3} className={`mt-2 ${AREA_CLASS}`} value={form.tiesStatement} onChange={set("tiesStatement")} />
          </div>
        </div>
      </section>

      {hasError ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section aria-live="polite" aria-atomic="true" className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Length of stay
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.stayDays} days`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : result.grantMonths
                  ? `Fits a ${result.grantMonths}-month stay period ending ${result.grantEndsOn}`
                  : "Longer than the 12-month maximum for a Visitor visa"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLetter}
              disabled={hasError}
              aria-label="Copy the finished statement to the clipboard"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy letter"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset every field to the sample values" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Days in the 18-month window</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : `${result.daysIn18MonthWindow} of 365`}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Days left under condition 8558</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.daysLeftUnder8558}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Condition 8558 window closes</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.condition8558WindowEnds}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Funds per person per day</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : AUD.format(result.perPersonPerDayAud)}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Lodged before arrival</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : `${result.leadDays} days`}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Total application charge</dt>
            <dd className="mt-1 font-semibold">
              {hasError || result.totalChargeAud === null ? DASH : AUD.format(result.totalChargeAud)}
            </dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Stream</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.streamLabel}</dd>
          </div>
        </dl>

        {!hasError && result.warnings.length ? (
          <ul className="mt-4 space-y-2">
            {result.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
        {!hasError && !result.warnings.length ? (
          <p className="mt-4 rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--success)]">
            Stay length, condition 8558, study limit, lodgement timing and funding all pass the automatic checks.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your statement</h2>
        <pre className="mt-3 max-h-[28rem] overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6 whitespace-pre-wrap">
          {hasError ? DASH : result.letter}
        </pre>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Document checklist</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(hasError ? [] : result.checklist).map((item) => (
            <li key={item} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
          {hasError ? <li className="text-[var(--muted-foreground)]">{DASH}</li> : null}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Based on the Visitor visa (subclass 600) criteria in the Migration Regulations 1994,
        including the genuine visitor requirement, Public Interest Criterion 4020 and visa conditions
        8501, 8503 and 8558. Application charges are indexed each 1 July — check the Home Affairs
        pricing estimator. General information only; only a registered migration agent or Australian
        legal practitioner can advise on your application.
      </p>
    </main>
  );
}
