"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Flag, RotateCcw } from "lucide-react";

import {
  PURPOSE_OPTIONS,
  SHORT_TERM_MAX_STAY_DAYS,
  VISA_TYPES,
  buildKoreaCoverLetter,
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
  fullName: "Amara Nwosu",
  nationality: "Nigerian",
  passportNumber: "B7788990",
  passportExpiryDate: "2030-10-10",
  occupation: "Product manager",
  employer: "Kite Media Ltd",
  homeAddress: "3 Bode Thomas Street, Surulere, Lagos, Nigeria",
  contact: "amara@example.com, +234 802 000 4444",
  visaTypeId: "c39-single",
  purposeId: "tourism",
  applicationDate: "2027-01-15",
  visaIssueDate: "2027-02-01",
  consulateCity: "Abuja",
  arrivalDate: "2027-03-20",
  departureDate: "2027-04-05",
  itinerary: "20–27 Mar — Seoul (Gyeongbokgung, Bukchon, Hongdae)\n28 Mar–1 Apr — Busan (Gamcheon, Haeundae)\n2–5 Apr — Jeju Island, then return flight",
  accommodation: "Nine Tree Hotel Myeongdong, Seoul (booking 55021); Lotte Hotel Busan (booking 60418)",
  inviterName: "",
  budgetUsd: "3000",
  applicants: "2",
  tiesStatement:
    "My leave is approved for these exact dates, I am repaying a mortgage on my flat in Lagos, and my two children are enrolled in school there.",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    },
    [],
  );

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(() => buildKoreaCoverLetter(form), [form]);
  const hasError = Boolean(result.error);
  const canCopyLetter = !hasError && !result.letterBlocked;

  const copyLetter = async () => {
    if (!canCopyLetter) return;
    try {
      await navigator.clipboard.writeText(result.letter);
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    const hasRealInput = Object.keys(DEFAULTS).some((key) => form[key] !== DEFAULTS[key]);
    if (
      hasRealInput &&
      !window.confirm(
        "Reset every field back to the sample values? This discards whatever you've entered, including passport, address and financial details.",
      )
    ) {
      return;
    }
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Flag className="h-4 w-4" aria-hidden="true" />
          Visa documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          South Korea Visa Cover Letter Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write the covering letter for a C-3 short-term visit visa, with the{" "}
          {SHORT_TERM_MAX_STAY_DAYS}-day sojourn limit counted from the day of entry, the
          three-month single-entry validity rule and the consular fee worked out for your party.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Applicant</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-name">Full name (as in passport)</label>
            <input id="kr-name" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.fullName} onChange={set("fullName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-nationality">Nationality</label>
            <input id="kr-nationality" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.nationality} onChange={set("nationality")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-passport">Passport number</label>
            <input id="kr-passport" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.passportNumber} onChange={set("passportNumber")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-expiry">Passport expiry date</label>
            <input id="kr-expiry" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.passportExpiryDate} onChange={set("passportExpiryDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-occupation">Occupation</label>
            <input id="kr-occupation" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.occupation} onChange={set("occupation")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-employer">Employer or institution</label>
            <input id="kr-employer" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.employer} onChange={set("employer")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kr-address">Home address</label>
            <input id="kr-address" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.homeAddress} onChange={set("homeAddress")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kr-contact">Email and phone</label>
            <input id="kr-contact" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.contact} onChange={set("contact")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Visa and trip</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-type">Visa type</label>
            <select id="kr-type" className={`mt-2 ${INPUT_CLASS}`} value={form.visaTypeId} onChange={set("visaTypeId")}>
              {VISA_TYPES.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-purpose">Purpose of visit</label>
            <select id="kr-purpose" className={`mt-2 ${INPUT_CLASS}`} value={form.purposeId} onChange={set("purposeId")}>
              {PURPOSE_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-applied">Application date</label>
            <input id="kr-applied" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.applicationDate} onChange={set("applicationDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-issue">Expected visa issue date</label>
            <input id="kr-issue" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.visaIssueDate} onChange={set("visaIssueDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-consulate">Embassy or consulate city</label>
            <input id="kr-consulate" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.consulateCity} onChange={set("consulateCity")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-applicants">People applying together</label>
            <input id="kr-applicants" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" max="20" value={form.applicants} onChange={set("applicants")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-arrival">Arrival in Korea</label>
            <input id="kr-arrival" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.arrivalDate} onChange={set("arrivalDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-departure">Departure from Korea</label>
            <input id="kr-departure" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.departureDate} onChange={set("departureDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-inviter">Korean host or business contact</label>
            <input id="kr-inviter" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.inviterName} onChange={set("inviterName")} placeholder="Leave blank for independent travel" />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-budget">Funds available (USD)</label>
            <input id="kr-budget" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" value={form.budgetUsd} onChange={set("budgetUsd")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kr-itinerary">Itinerary (one line per leg)</label>
            <textarea id="kr-itinerary" rows={4} className={`mt-2 ${AREA_CLASS}`} value={form.itinerary} onChange={set("itinerary")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kr-accommodation">Accommodation</label>
            <textarea id="kr-accommodation" rows={2} className={`mt-2 ${AREA_CLASS}`} value={form.accommodation} onChange={set("accommodation")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kr-ties">Ties to your home country</label>
            <textarea id="kr-ties" rows={3} className={`mt-2 ${AREA_CLASS}`} value={form.tiesStatement} onChange={set("tiesStatement")} />
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
              Sojourn on these dates
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.stayDays} days`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `A 90-day sojourn from your entry date would end on ${result.sojournLimit}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLetter}
              disabled={!canCopyLetter}
              aria-label={
                result.letterBlocked
                  ? "Cover letter unavailable because the itinerary exceeds 90 days"
                  : copied
                    ? "Cover letter copied to the clipboard"
                    : "Copy the finished cover letter to the clipboard"
              }
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
            <dt className="text-[var(--muted-foreground)]">Sojourn days left unused</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.sojournDaysLeft}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Visa must be used by</dt>
            <dd className="mt-1 font-semibold">{hasError || !result.visaUsableUntil ? DASH : result.visaUsableUntil}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Consular fee total</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : USD.format(result.totalFeeUsd)}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Funds per person per day</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : USD.format(result.perPersonPerDayUsd)}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Passport must stay valid to</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.passportRequiredUntil}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Applied before arrival</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : `${result.leadDays} days`}</dd>
          </div>
        </dl>

        {!hasError && result.warnings.length ? (
          <ul className="mt-4 space-y-2" aria-live="polite" role="status">
            {result.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
        {!hasError && !result.warnings.length ? (
          <p className="mt-4 rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--success)]">
            Sojourn length, visa validity, passport validity, funding and lodgement timing all pass the automatic checks.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your cover letter</h2>
        {!hasError && result.letterBlocked ? (
          <p role="alert" className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {result.letterBlockingReason} Update the travel dates before copying or submitting a letter.
          </p>
        ) : (
          <pre className="mt-3 max-h-[28rem] overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6 whitespace-pre-wrap">
            {hasError ? DASH : result.letter}
          </pre>
        )}
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
        Based on published Korean Ministry of Foreign Affairs and HiKorea guidance on C-3 short-term
        visit visas. Fees and required documents vary by mission and by nationality, and some
        countries have fee-waiver agreements — confirm with the embassy that has jurisdiction over
        where you live. General information only, not immigration advice.
      </p>
    </main>
  );
}
