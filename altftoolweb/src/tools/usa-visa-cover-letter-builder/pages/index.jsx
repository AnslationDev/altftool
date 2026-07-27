"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import {
  FUNDING_OPTIONS,
  MRV_FEE_USD,
  PURPOSE_OPTIONS,
  VISA_CLASSES,
  buildUsaCoverLetter,
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

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const DASH = "—";

const DEFAULTS = {
  fullName: "Rahul Verma",
  nationality: "Indian",
  passportNumber: "M8812345",
  passportExpiryDate: "2030-06-30",
  occupation: "Marketing manager",
  employer: "Kestrel Foods Pvt Ltd",
  homeAddress: "44 Nehru Nagar, Pune 411014, India",
  contact: "rahul@example.com, +91 90000 11111",
  visaClassId: "b2",
  purposeId: "family",
  ds160Number: "AA00XR7Q2B",
  feePaidDate: "2026-06-01",
  interviewDate: "2026-09-15",
  consulateCity: "Mumbai",
  arrivalDate: "2026-11-05",
  departureDate: "2026-11-26",
  itinerary: "5–12 Nov — Naperville, Illinois (staying with family)\n13–19 Nov — New York City (sightseeing)\n20–26 Nov — Washington, D.C. and return",
  accommodation: "Host residence, 118 Oak Lane, Naperville IL 60540; Hotel Edison, New York (booking 55210)",
  fundingId: "relative",
  hostName: "Sunita Verma (sister, US permanent resident)",
  budgetUsd: "6000",
  travellers: "2",
  tiesStatement:
    "My leave is approved for these exact dates, I am repaying a home loan on my flat in Pune, and my two school-age children remain in India with my spouse.",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(() => buildUsaCoverLetter(form), [form]);
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
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Visa documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          USA Visa Cover Letter Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Produce a B-1/B-2 cover letter that states your purpose, itinerary, funding and ties, and
          check the passport six-month rule, the one-year life of the US${MRV_FEE_USD} MRV receipt
          and your interview-to-travel gap.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Applicant</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="uv-name">Full name (as in passport)</label>
            <input id="uv-name" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.fullName} onChange={set("fullName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="uv-nationality">Nationality</label>
            <input id="uv-nationality" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.nationality} onChange={set("nationality")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="uv-passport">Passport number</label>
            <input id="uv-passport" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.passportNumber} onChange={set("passportNumber")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="uv-expiry">Passport expiry date</label>
            <input id="uv-expiry" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.passportExpiryDate} onChange={set("passportExpiryDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="uv-occupation">Occupation</label>
            <input id="uv-occupation" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.occupation} onChange={set("occupation")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="uv-employer">Employer or institution</label>
            <input id="uv-employer" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.employer} onChange={set("employer")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="uv-address">Home address</label>
            <input id="uv-address" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.homeAddress} onChange={set("homeAddress")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="uv-contact">Email and phone</label>
            <input id="uv-contact" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.contact} onChange={set("contact")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Application and interview</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="uv-class">Visa class</label>
            <select id="uv-class" className={`mt-2 ${INPUT_CLASS}`} value={form.visaClassId} onChange={set("visaClassId")}>
              {VISA_CLASSES.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="uv-purpose">Purpose of travel</label>
            <select id="uv-purpose" className={`mt-2 ${INPUT_CLASS}`} value={form.purposeId} onChange={set("purposeId")}>
              {PURPOSE_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="uv-ds160">DS-160 confirmation number</label>
            <input id="uv-ds160" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.ds160Number} onChange={set("ds160Number")} placeholder="AA00ABC123" />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="uv-consulate">Embassy or consulate city</label>
            <input id="uv-consulate" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.consulateCity} onChange={set("consulateCity")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="uv-fee">MRV fee paid on</label>
            <input id="uv-fee" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.feePaidDate} onChange={set("feePaidDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="uv-interview">Interview date</label>
            <input id="uv-interview" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.interviewDate} onChange={set("interviewDate")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Trip</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="uv-arrival">Arrival in the United States</label>
            <input id="uv-arrival" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.arrivalDate} onChange={set("arrivalDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="uv-departure">Departure from the United States</label>
            <input id="uv-departure" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.departureDate} onChange={set("departureDate")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="uv-itinerary">Itinerary (one line per leg)</label>
            <textarea id="uv-itinerary" rows={4} className={`mt-2 ${AREA_CLASS}`} value={form.itinerary} onChange={set("itinerary")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="uv-accommodation">Accommodation or host address</label>
            <textarea id="uv-accommodation" rows={2} className={`mt-2 ${AREA_CLASS}`} value={form.accommodation} onChange={set("accommodation")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Funding and ties</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="uv-funding">Who is paying?</label>
            <select id="uv-funding" className={`mt-2 ${INPUT_CLASS}`} value={form.fundingId} onChange={set("fundingId")}>
              {FUNDING_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="uv-host">US host or sponsor</label>
            <input id="uv-host" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.hostName} onChange={set("hostName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="uv-budget">Funds available (USD)</label>
            <input id="uv-budget" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" value={form.budgetUsd} onChange={set("budgetUsd")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="uv-travellers">Travellers covered by that budget</label>
            <input id="uv-travellers" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" max="20" value={form.travellers} onChange={set("travellers")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="uv-ties">Ties to your home country (214(b) statement)</label>
            <textarea id="uv-ties" rows={3} className={`mt-2 ${AREA_CLASS}`} value={form.tiesStatement} onChange={set("tiesStatement")} />
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
                : `Visitors are normally admitted for up to ${result.typicalAdmissionDays} days by the CBP officer`}
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
            <dt className="text-[var(--muted-foreground)]">Funds per person per day</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : USD.format(result.perPersonPerDayUsd)}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Passport must stay valid to</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.passportRequiredUntil}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">MRV receipt valid until</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.mrvReceiptExpiry}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Interview to departure</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : `${result.daysFromInterviewToTravel} days`}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">MRV fee</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : USD.format(result.mrvFeeUsd)}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Visa class</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.visaClassLabel}</dd>
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
            Passport validity, MRV receipt life, DS-160 format and the interview-to-travel gap all look consistent.
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
        <h2 className="text-base font-semibold">Interview document checklist</h2>
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
        Based on published Department of State guidance on Form DS-160, the MRV fee and visitor
        visas, and on section 214(b) of the Immigration and Nationality Act. General information
        only — not legal or immigration advice. Consult a licensed attorney about your own case.
      </p>
    </main>
  );
}
