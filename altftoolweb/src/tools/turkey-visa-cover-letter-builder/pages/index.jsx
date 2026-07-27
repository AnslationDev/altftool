"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import {
  MAX_STAY_DAYS_PER_180,
  PASSPORT_DAYS_BEYOND_STAY,
  PURPOSE_OPTIONS,
  VISA_TYPES,
  buildTurkeyCoverLetter,
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
  fullName: "Sofia Almeida",
  nationality: "Brazilian",
  passportNumber: "FT884422",
  passportExpiryDate: "2029-03-01",
  occupation: "Architect",
  employer: "Atelier Norte Ltda",
  homeAddress: "Rua das Flores 45, Porto Alegre, Brazil",
  contact: "sofia@example.com, +55 51 90000 1111",
  visaTypeId: "evisa-30-single",
  purposeId: "tourism",
  applicationDate: "2027-04-20",
  visaIssueDate: "2027-04-20",
  arrivalDate: "2027-05-10",
  departureDate: "2027-05-28",
  entryPoint: "Istanbul Airport (IST)",
  itinerary: "10–17 May — Istanbul (Sultanahmet, Bosphorus, Kadıköy)\n18–23 May — Cappadocia (Göreme, Uçhisar)\n24–28 May — Antalya and the coast, then return flight",
  accommodation: "Sirkeci Mansion, Istanbul (booking 30012); Museum Hotel, Uçhisar (booking 66401)",
  hostName: "",
  budgetEur: "2200",
  travellers: "2",
  priorDaysUsed: "0",
  tiesStatement:
    "My leave is approved for these dates, I run an architecture practice in Porto Alegre with projects under contract, and my family lives there.",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(() => buildTurkeyCoverLetter(form), [form]);
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
          Turkey Visa Cover Letter Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write the covering letter for a Türkiye e-Visa or consulate visa, with the{" "}
          {MAX_STAY_DAYS_PER_180}-days-in-180 rule applied and the date your passport must stay valid
          to — {PASSPORT_DAYS_BEYOND_STAY} days beyond your duration of stay — calculated for you.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Applicant</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-name">Full name (as in passport)</label>
            <input id="tr-name" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.fullName} onChange={set("fullName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-nationality">Nationality</label>
            <input id="tr-nationality" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.nationality} onChange={set("nationality")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-passport">Passport number</label>
            <input id="tr-passport" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.passportNumber} onChange={set("passportNumber")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-expiry">Passport expiry date</label>
            <input id="tr-expiry" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.passportExpiryDate} onChange={set("passportExpiryDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-occupation">Occupation</label>
            <input id="tr-occupation" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.occupation} onChange={set("occupation")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-employer">Employer or institution</label>
            <input id="tr-employer" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.employer} onChange={set("employer")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tr-address">Home address</label>
            <input id="tr-address" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.homeAddress} onChange={set("homeAddress")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tr-contact">Email and phone</label>
            <input id="tr-contact" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.contact} onChange={set("contact")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Visa and trip</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-type">Visa type and stay allowance</label>
            <select id="tr-type" className={`mt-2 ${INPUT_CLASS}`} value={form.visaTypeId} onChange={set("visaTypeId")}>
              {VISA_TYPES.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-purpose">Purpose of visit</label>
            <select id="tr-purpose" className={`mt-2 ${INPUT_CLASS}`} value={form.purposeId} onChange={set("purposeId")}>
              {PURPOSE_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-applied">Application date</label>
            <input id="tr-applied" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.applicationDate} onChange={set("applicationDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-issue">Visa issue date (if known)</label>
            <input id="tr-issue" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.visaIssueDate} onChange={set("visaIssueDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-arrival">Arrival in Türkiye</label>
            <input id="tr-arrival" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.arrivalDate} onChange={set("arrivalDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-departure">Departure from Türkiye</label>
            <input id="tr-departure" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.departureDate} onChange={set("departureDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-entry">Airport or border of entry</label>
            <input id="tr-entry" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.entryPoint} onChange={set("entryPoint")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-prior">Days in Türkiye in the last 180</label>
            <input id="tr-prior" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" max="180" value={form.priorDaysUsed} onChange={set("priorDaysUsed")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-host">Turkish host or business contact</label>
            <input id="tr-host" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.hostName} onChange={set("hostName")} placeholder="Leave blank for independent travel" />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-travellers">Travellers together</label>
            <input id="tr-travellers" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" max="20" value={form.travellers} onChange={set("travellers")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tr-budget">Funds available (EUR)</label>
            <input id="tr-budget" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" value={form.budgetEur} onChange={set("budgetEur")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tr-itinerary">Itinerary (one line per leg)</label>
            <textarea id="tr-itinerary" rows={4} className={`mt-2 ${AREA_CLASS}`} value={form.itinerary} onChange={set("itinerary")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tr-accommodation">Accommodation</label>
            <textarea id="tr-accommodation" rows={2} className={`mt-2 ${AREA_CLASS}`} value={form.accommodation} onChange={set("accommodation")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tr-ties">Ties to your home country</label>
            <textarea id="tr-ties" rows={3} className={`mt-2 ${AREA_CLASS}`} value={form.tiesStatement} onChange={set("tiesStatement")} />
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
              Passport must stay valid to
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : result.passportRequiredUntil}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${PASSPORT_DAYS_BEYOND_STAY} days beyond a ${result.stayAllowanceDays}-day stay ending ${result.stayEndsOn}`}
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
            <dt className="text-[var(--muted-foreground)]">Days of presence this trip</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.tripDays}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Used in the 180-day window</dt>
            <dd className="mt-1 font-semibold">
              {hasError ? DASH : `${result.daysUsedInWindow} of ${MAX_STAY_DAYS_PER_180}`}
            </dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Days left under 90/180</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.daysRemaining}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Visa valid for entry until</dt>
            <dd className="mt-1 font-semibold">{hasError || !result.visaValidUntil ? DASH : result.visaValidUntil}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Funds per person per day</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : EUR.format(result.perPersonPerDayEur)}</dd>
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
            Stay allowance, the 90/180 rule, passport validity and visa validity all pass the automatic checks.
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
        Follows Republic of Türkiye Ministry of Foreign Affairs guidance on visas, the e-Visa system
        and the 60-days-beyond-stay passport rule. Eligibility, stay length and fees depend on your
        nationality — check the official e-Visa site, and beware paid look-alike portals. General
        information only, not immigration advice.
      </p>
    </main>
  );
}
