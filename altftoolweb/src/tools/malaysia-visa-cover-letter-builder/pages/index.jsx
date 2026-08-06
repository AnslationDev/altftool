"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Waves } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  PURPOSE_OPTIONS,
  SOCIAL_VISIT_STAY_DAYS,
  VISA_TYPES,
  buildMalaysiaCoverLetter,
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

const MYR = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  maximumFractionDigits: 0,
});

const DASH = "—";

const DEFAULTS = {
  fullName: "Ravi Kumar",
  nationality: "Indian",
  passportNumber: "K9900112",
  passportExpiryDate: "2031-07-07",
  occupation: "Sales director",
  employer: "Orion Traders Pvt Ltd",
  homeAddress: "22 Anna Salai, Chennai 600002, India",
  contact: "ravi@example.com, +91 98410 55555",
  visaTypeId: "single",
  purposeId: "business",
  applicationDate: "2027-01-10",
  visaIssueDate: "2027-01-16",
  arrivalDate: "2027-02-14",
  departureDate: "2027-03-01",
  entryPoint: "KLIA Terminal 1, Kuala Lumpur",
  itinerary: "14–20 Feb — Kuala Lumpur (partner meetings and factory visit)\n21–25 Feb — Penang\n26 Feb–1 Mar — Langkawi, then return flight",
  accommodation: "Hotel Stripes Kuala Lumpur (booking 21044); Eastern & Oriental Penang (booking 88123)",
  hostName: "Lim Wei Sheng, Orion Malaysia Sdn Bhd",
  budgetMyr: "6000",
  applicants: "2",
  portalFeeMyr: "",
  tiesStatement:
    "My leave is approved for these dates, I hold a mortgage on my home in Chennai, and my family and business remain in India.",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const { copy: copyToClipboard, isCopied, announcement, reset: resetCopyState } =
    useCopyToClipboard();

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const result = useMemo(() => buildMalaysiaCoverLetter(form), [form]);
  const hasError = Boolean(result.error);

  const copyLetter = async () => {
    if (hasError) return;
    await copyToClipboard("letter", result.letter, { label: "Cover letter" });
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset every field? This will replace your details with the demo example values and cannot be undone.",
      )
    ) {
      return;
    }
    setForm(DEFAULTS);
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Waves className="h-4 w-4" aria-hidden="true" />
          Visa documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Malaysia Visa Cover Letter Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write the covering letter for a Malaysia eVISA application, with the{" "}
          {SOCIAL_VISIT_STAY_DAYS}-day social visit stay counted from the day of entry, the
          three-month eVISA validity window and the free Digital Arrival Card window all worked out.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Applicant</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="my-name">Full name (as in passport)</label>
            <input id="my-name" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.fullName} onChange={set("fullName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-nationality">Nationality</label>
            <input id="my-nationality" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.nationality} onChange={set("nationality")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-passport">Passport number</label>
            <input id="my-passport" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.passportNumber} onChange={set("passportNumber")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-expiry">Passport expiry date</label>
            <input id="my-expiry" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.passportExpiryDate} onChange={set("passportExpiryDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-occupation">Occupation</label>
            <input id="my-occupation" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.occupation} onChange={set("occupation")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-employer">Employer or institution</label>
            <input id="my-employer" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.employer} onChange={set("employer")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="my-address">Home address</label>
            <input id="my-address" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.homeAddress} onChange={set("homeAddress")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="my-contact">Email and phone</label>
            <input id="my-contact" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.contact} onChange={set("contact")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Visa and trip</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="my-type">Visa type</label>
            <select id="my-type" className={`mt-2 ${INPUT_CLASS}`} value={form.visaTypeId} onChange={set("visaTypeId")}>
              {VISA_TYPES.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-purpose">Purpose of visit</label>
            <select id="my-purpose" className={`mt-2 ${INPUT_CLASS}`} value={form.purposeId} onChange={set("purposeId")}>
              {PURPOSE_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-applied">Application date</label>
            <input id="my-applied" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.applicationDate} onChange={set("applicationDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-issue">Visa issue date (if known)</label>
            <input id="my-issue" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.visaIssueDate} onChange={set("visaIssueDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-arrival">Arrival in Malaysia</label>
            <input id="my-arrival" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.arrivalDate} onChange={set("arrivalDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-departure">Departure from Malaysia</label>
            <input id="my-departure" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.departureDate} onChange={set("departureDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-entry">Airport or checkpoint of entry</label>
            <input id="my-entry" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.entryPoint} onChange={set("entryPoint")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-host">Malaysian host or business contact</label>
            <input id="my-host" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.hostName} onChange={set("hostName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-budget">Funds available (MYR)</label>
            <input id="my-budget" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" value={form.budgetMyr} onChange={set("budgetMyr")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-applicants">People applying together</label>
            <input id="my-applicants" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" max="20" value={form.applicants} onChange={set("applicants")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="my-fee">eVISA charge quoted per applicant (MYR)</label>
            <input id="my-fee" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" value={form.portalFeeMyr} onChange={set("portalFeeMyr")} placeholder="Shown on the portal before payment" />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="my-itinerary">Itinerary (one line per leg)</label>
            <textarea id="my-itinerary" rows={4} className={`mt-2 ${AREA_CLASS}`} value={form.itinerary} onChange={set("itinerary")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="my-accommodation">Accommodation</label>
            <textarea id="my-accommodation" rows={2} className={`mt-2 ${AREA_CLASS}`} value={form.accommodation} onChange={set("accommodation")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="my-ties">Ties to your home country</label>
            <textarea id="my-ties" rows={3} className={`mt-2 ${AREA_CLASS}`} value={form.tiesStatement} onChange={set("tiesStatement")} />
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
              {hasError ? DASH : `A 30-day social visit pass from your entry date would run to ${result.passEndsOn}`}
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
              {isCopied("letter") ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {isCopied("letter") ? "Copied!" : "Copy letter"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset every field to the sample values" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
        <span className="sr-only" role="status" aria-live="polite">
          {announcement}
        </span>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Digital Arrival Card window</dt>
            <dd className="mt-1 font-semibold">
              {hasError ? DASH : `${result.mdacOpensOn} to ${result.mdacClosesOn}`}
            </dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Visa must be used by</dt>
            <dd className="mt-1 font-semibold">{hasError || !result.visaUsableUntil ? DASH : result.visaUsableUntil}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Passport must stay valid to</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.passportRequiredUntil}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Funds per person per day</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : MYR.format(result.perPersonPerDayMyr)}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Days over the 30-day pass</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.daysOverPass}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">eVISA charge total</dt>
            <dd className="mt-1 font-semibold">
              {hasError || result.totalPortalFeeMyr === null ? DASH : MYR.format(result.totalPortalFeeMyr)}
            </dd>
          </div>
        </dl>

        <div aria-live="polite" role="status">
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
              Stay length, eVISA validity, passport validity, entry point and funding all pass the automatic checks.
            </p>
          ) : null}
        </div>
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
        Follows Immigration Department of Malaysia guidance on the eVISA, the social visit pass and
        the Malaysia Digital Arrival Card. Whether you need a visa at all depends on your
        nationality, and exemptions change — check the department's current list before applying.
        General information only, not immigration advice.
      </p>
    </main>
  );
}
