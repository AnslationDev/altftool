"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Stamp } from "lucide-react";

import {
  FEE_BANDS,
  FUNDING_OPTIONS,
  MAX_STAY_DAYS,
  MIN_INSURANCE_COVER_EUR,
  PURPOSE_OPTIONS,
  buildSchengenCoverLetter,
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

const EUR = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const DASH = "—";

const DEFAULTS = {
  fullName: "Aarti Menon",
  nationality: "Indian",
  passportNumber: "Z1234567",
  passportIssueDate: "2021-02-15",
  passportExpiryDate: "2031-02-14",
  occupation: "Software engineer",
  employer: "Nova Systems Pvt Ltd",
  homeAddress: "12 MG Road, Bengaluru 560001, India",
  contact: "aarti@example.com, +91 98765 43210",
  mainDestination: "France",
  consulateCity: "Bengaluru",
  purposeId: "tourism",
  entryDate: "2026-09-10",
  exitDate: "2026-09-24",
  applicationDate: "2026-07-20",
  itinerary: "10–14 Sep — Paris (Louvre, Versailles day trip)\n15–19 Sep — Lyon (Vieux Lyon, Fourvière)\n20–24 Sep — Nice (Promenade des Anglais, Èze)",
  accommodation: "Hôtel du Marais, Paris (booking 88213); Ibis Lyon Centre (booking 44190); Hôtel Nice Riviera (booking 20877)",
  fundingId: "self",
  sponsorName: "",
  budgetEur: "2400",
  insurerName: "Bajaj Allianz Travel Elite",
  insuranceCoverEur: "30000",
  priorDaysUsed: "0",
  feeBandId: "adult",
  tiesStatement: "I have approved leave from work, an ongoing home loan in Bengaluru and dependent parents living with me.",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(() => buildSchengenCoverLetter(form), [form]);
  const hasError = Boolean(result.error);

  const copyLetter = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
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
          <Stamp className="h-4 w-4" aria-hidden="true" />
          Visa documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Schengen Visa Cover Letter Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fill in your trip details and get a printable Type C cover letter, plus a check against the
          90/180-day rule, the three-month passport rule and the EUR {MIN_INSURANCE_COVER_EUR.toLocaleString("en-US")}{" "}
          insurance minimum.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Applicant</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-name">Full name (as in passport)</label>
            <input id="sv-name" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.fullName} onChange={set("fullName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-nationality">Nationality</label>
            <input id="sv-nationality" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.nationality} onChange={set("nationality")} placeholder="e.g. Indian" />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-passport">Passport number</label>
            <input id="sv-passport" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.passportNumber} onChange={set("passportNumber")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-occupation">Occupation</label>
            <input id="sv-occupation" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.occupation} onChange={set("occupation")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-issue">Passport issue date</label>
            <input id="sv-issue" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.passportIssueDate} onChange={set("passportIssueDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-expiry">Passport expiry date</label>
            <input id="sv-expiry" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.passportExpiryDate} onChange={set("passportExpiryDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-employer">Employer or institution</label>
            <input id="sv-employer" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.employer} onChange={set("employer")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-contact">Email and phone</label>
            <input id="sv-contact" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.contact} onChange={set("contact")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sv-address">Home address</label>
            <input id="sv-address" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.homeAddress} onChange={set("homeAddress")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Trip</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-destination">Main destination (most nights)</label>
            <input id="sv-destination" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.mainDestination} onChange={set("mainDestination")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-consulate">Consulate / VAC city</label>
            <input id="sv-consulate" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.consulateCity} onChange={set("consulateCity")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-purpose">Purpose of travel</label>
            <select id="sv-purpose" className={`mt-2 ${INPUT_CLASS}`} value={form.purposeId} onChange={set("purposeId")}>
              {PURPOSE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-applied">Application date</label>
            <input id="sv-applied" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.applicationDate} onChange={set("applicationDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-entry">Arrival in Schengen area</label>
            <input id="sv-entry" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.entryDate} onChange={set("entryDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-exit">Departure from Schengen area</label>
            <input id="sv-exit" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.exitDate} onChange={set("exitDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-prior">Days already used in the last 180</label>
            <input id="sv-prior" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" max="180" value={form.priorDaysUsed} onChange={set("priorDaysUsed")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-fee">Fee band</label>
            <select id="sv-fee" className={`mt-2 ${INPUT_CLASS}`} value={form.feeBandId} onChange={set("feeBandId")}>
              {FEE_BANDS.map((band) => (
                <option key={band.id} value={band.id}>{band.label}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sv-itinerary">Itinerary (one line per leg)</label>
            <textarea id="sv-itinerary" rows={4} className={`mt-2 ${AREA_CLASS}`} value={form.itinerary} onChange={set("itinerary")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sv-accommodation">Accommodation</label>
            <textarea id="sv-accommodation" rows={2} className={`mt-2 ${AREA_CLASS}`} value={form.accommodation} onChange={set("accommodation")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Money, insurance and ties</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-funding">Who is paying?</label>
            <select id="sv-funding" className={`mt-2 ${INPUT_CLASS}`} value={form.fundingId} onChange={set("fundingId")}>
              {FUNDING_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-sponsor">Sponsor name (if any)</label>
            <input id="sv-sponsor" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.sponsorName} onChange={set("sponsorName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-budget">Funds available (EUR)</label>
            <input id="sv-budget" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" value={form.budgetEur} onChange={set("budgetEur")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-cover">Insurance cover (EUR)</label>
            <input id="sv-cover" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" value={form.insuranceCoverEur} onChange={set("insuranceCoverEur")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sv-insurer">Insurer name</label>
            <input id="sv-insurer" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.insurerName} onChange={set("insurerName")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sv-ties">Ties to your home country</label>
            <textarea id="sv-ties" rows={2} className={`mt-2 ${AREA_CLASS}`} value={form.tiesStatement} onChange={set("tiesStatement")} />
          </div>
        </div>
      </section>

      {hasError ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Days of presence this trip
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.tripDays}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${result.daysUsedInWindow} of ${MAX_STAY_DAYS} days used in the 180-day window`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLetter}
              disabled={hasError}
              aria-label="Copy the finished cover letter to the clipboard"
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
            <dt className="text-[var(--muted-foreground)]">Days left in the window</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.daysRemaining}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Budget per day</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : EUR.format(result.dailyBudgetEur)}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Lodged before departure</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : `${result.leadDays} days`}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Decision usually takes</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.decisionWindow}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Passport must stay valid to</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.passportRequiredUntil}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Visa fee</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : EUR.format(result.feeEur)}</dd>
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
            Every automatic check passed: stay within 90/180, passport validity, lodging window and insurance cover.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your cover letter</h2>
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
        Checks follow the Visa Code (Regulation (EC) No 810/2009) and the Schengen Borders Code
        (Regulation (EU) 2016/399). This is general information, not immigration advice — consulate
        practice and required documents vary by country and by visa application centre.
      </p>
    </main>
  );
}
