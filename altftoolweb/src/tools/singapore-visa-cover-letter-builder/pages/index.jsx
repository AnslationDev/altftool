"use client";

import { useMemo, useState } from "react";
import { Building, Check, Copy, RotateCcw } from "lucide-react";

import {
  PURPOSE_OPTIONS,
  SPONSOR_OPTIONS,
  VISA_FEE_SGD,
  VISA_TYPES,
  buildSingaporeCoverLetter,
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

const SGD = new Intl.NumberFormat("en-SG", {
  style: "currency",
  currency: "SGD",
  maximumFractionDigits: 0,
});

const DASH = "—";

const DEFAULTS = {
  fullName: "Nadia Rahman",
  nationality: "Bangladeshi",
  passportNumber: "BM0778821",
  passportExpiryDate: "2029-05-20",
  occupation: "Financial analyst",
  employer: "Delta Bank PLC",
  homeAddress: "19 Gulshan Avenue, Dhaka 1212, Bangladesh",
  contact: "nadia@example.com, +880 171 000 2222",
  visaTypeId: "single",
  purposeId: "tourism",
  sponsorId: "agent",
  localContactName: "",
  applicationDate: "2026-08-20",
  visaIssueDate: "2026-09-01",
  arrivalDate: "2026-09-12",
  departureDate: "2026-09-21",
  onwardDestination: "Dhaka (return flight BG 085)",
  itinerary: "12–14 Sep — Marina Bay, Gardens by the Bay\n15–18 Sep — Sentosa and the Southern Islands\n19–21 Sep — Jurong Bird Paradise, then departure",
  accommodation: "Hotel Boss, 500 Jalan Sultan, Singapore 199020 (booking 90210)",
  budgetSgd: "2400",
  applicants: "2",
  tiesStatement:
    "My leave is approved for these exact dates, I am repaying a home loan in Dhaka, and my two children are enrolled in school there.",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(() => buildSingaporeCoverLetter(form), [form]);
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
          <Building className="h-4 w-4" aria-hidden="true" />
          Visa documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Singapore Visa Cover Letter Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Produce the cover letter that goes with a Form 14A entry visa application, with the
          six-month passport rule, the five-week visa validity window, the SGD {VISA_FEE_SGD}{" "}
          processing fee and your SG Arrival Card submission window all worked out.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Applicant</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-name">Full name (as in passport)</label>
            <input id="sg-name" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.fullName} onChange={set("fullName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-nationality">Nationality</label>
            <input id="sg-nationality" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.nationality} onChange={set("nationality")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-passport">Passport number</label>
            <input id="sg-passport" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.passportNumber} onChange={set("passportNumber")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-expiry">Passport expiry date</label>
            <input id="sg-expiry" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.passportExpiryDate} onChange={set("passportExpiryDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-occupation">Occupation</label>
            <input id="sg-occupation" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.occupation} onChange={set("occupation")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-employer">Employer or institution</label>
            <input id="sg-employer" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.employer} onChange={set("employer")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sg-address">Home address</label>
            <input id="sg-address" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.homeAddress} onChange={set("homeAddress")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sg-contact">Email and phone</label>
            <input id="sg-contact" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.contact} onChange={set("contact")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Application and trip</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-type">Visa type</label>
            <select id="sg-type" className={`mt-2 ${INPUT_CLASS}`} value={form.visaTypeId} onChange={set("visaTypeId")}>
              {VISA_TYPES.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-purpose">Purpose of visit</label>
            <select id="sg-purpose" className={`mt-2 ${INPUT_CLASS}`} value={form.purposeId} onChange={set("purposeId")}>
              {PURPOSE_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-sponsor">Who submits Form 14A?</label>
            <select id="sg-sponsor" className={`mt-2 ${INPUT_CLASS}`} value={form.sponsorId} onChange={set("sponsorId")}>
              {SPONSOR_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-local">Singapore local contact</label>
            <input id="sg-local" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.localContactName} onChange={set("localContactName")} placeholder="Name and status, if applicable" />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-applied">Application date</label>
            <input id="sg-applied" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.applicationDate} onChange={set("applicationDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-issue">Visa issue date (if known)</label>
            <input id="sg-issue" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.visaIssueDate} onChange={set("visaIssueDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-arrival">Arrival in Singapore</label>
            <input id="sg-arrival" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.arrivalDate} onChange={set("arrivalDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-departure">Departure from Singapore</label>
            <input id="sg-departure" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.departureDate} onChange={set("departureDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-onward">Onward or return destination</label>
            <input id="sg-onward" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.onwardDestination} onChange={set("onwardDestination")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-applicants">People applying together</label>
            <input id="sg-applicants" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" max="20" value={form.applicants} onChange={set("applicants")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sg-itinerary">Itinerary (one line per leg)</label>
            <textarea id="sg-itinerary" rows={4} className={`mt-2 ${AREA_CLASS}`} value={form.itinerary} onChange={set("itinerary")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sg-accommodation">Accommodation</label>
            <textarea id="sg-accommodation" rows={2} className={`mt-2 ${AREA_CLASS}`} value={form.accommodation} onChange={set("accommodation")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-budget">Funds available (SGD)</label>
            <input id="sg-budget" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" value={form.budgetSgd} onChange={set("budgetSgd")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sg-ties">Ties to your home country</label>
            <textarea id="sg-ties" rows={3} className={`mt-2 ${AREA_CLASS}`} value={form.tiesStatement} onChange={set("tiesStatement")} />
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
              Length of stay
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.stayDays} days`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `Short-Term Visit Passes are commonly granted for up to ${result.typicalVisitPassDays} days`}
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
            <dt className="text-[var(--muted-foreground)]">SG Arrival Card window</dt>
            <dd className="mt-1 font-semibold">
              {hasError ? DASH : `${result.sgacOpensOn} to ${result.sgacClosesOn}`}
            </dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Passport must stay valid to</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.passportRequiredUntil}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Visa valid for entry until</dt>
            <dd className="mt-1 font-semibold">{hasError || !result.visaValidUntil ? DASH : result.visaValidUntil}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Processing fee total</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : SGD.format(result.totalFeeSgd)}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Funds per person per day</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : SGD.format(result.perPersonPerDaySgd)}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Applied before arrival</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : `${result.leadDays} days`}</dd>
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
            Passport validity, visa validity window, stay length and onward ticket all pass the automatic checks.
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
        Follows published Immigration &amp; Checkpoints Authority guidance on Form 14A entry visas,
        Short-Term Visit Passes and the SG Arrival Card. Only nationals of Assessment Level I and II
        countries need a visa. General information only, not immigration advice.
      </p>
    </main>
  );
}
