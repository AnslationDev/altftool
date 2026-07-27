"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Ship } from "lucide-react";

import {
  ENTRY_PORTS,
  EVISA_MAX_STAY_DAYS,
  PURPOSE_OPTIONS,
  VISA_TYPES,
  buildVietnamCoverLetter,
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
  fullName: "Thomas Reilly",
  nationality: "Irish",
  passportNumber: "PA9081726",
  passportExpiryDate: "2031-04-15",
  occupation: "Software architect",
  employer: "Loop Systems Ltd",
  homeAddress: "12 Dame Street, Dublin 2, Ireland",
  contact: "thomas@example.com, +353 87 000 3333",
  visaTypeId: "single",
  purposeId: "tourism",
  applicationDate: "2026-10-01",
  arrivalDate: "2026-11-02",
  departureDate: "2026-11-25",
  requestedValidityDays: "30",
  entryPort: "Noi Bai International Airport (Hanoi)",
  exitPort: "Tan Son Nhat International Airport (Ho Chi Minh City)",
  itinerary: "2–8 Nov — Hanoi and Ha Long Bay\n9–16 Nov — Hue, Hoi An and Da Nang\n17–25 Nov — Ho Chi Minh City and the Mekong Delta",
  accommodation: "Hanoi La Siesta Premium (booking 33110); Anantara Hoi An (booking 71553)",
  travellers: "2",
  blankPages: "6",
  tiesStatement:
    "I hold a permanent role with approved leave, a mortgage on my home in Dublin, and my two children are in school there.",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(() => buildVietnamCoverLetter(form), [form]);
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
          <Ship className="h-4 w-4" aria-hidden="true" />
          Visa documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Vietnam Visa Cover Letter Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write the covering letter for a Vietnam e-visa application, with the {EVISA_MAX_STAY_DAYS}-day
          maximum applied, your valid-from and valid-to dates worked out, and a three-working-day
          decision estimate that skips weekends.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Applicant</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-name">Full name (as in passport)</label>
            <input id="vn-name" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.fullName} onChange={set("fullName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-nationality">Nationality</label>
            <input id="vn-nationality" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.nationality} onChange={set("nationality")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-passport">Passport number</label>
            <input id="vn-passport" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.passportNumber} onChange={set("passportNumber")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-expiry">Passport expiry date</label>
            <input id="vn-expiry" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.passportExpiryDate} onChange={set("passportExpiryDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-blank">Blank passport pages</label>
            <input id="vn-blank" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" max="60" value={form.blankPages} onChange={set("blankPages")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-occupation">Occupation</label>
            <input id="vn-occupation" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.occupation} onChange={set("occupation")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-employer">Employer or institution</label>
            <input id="vn-employer" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.employer} onChange={set("employer")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-contact">Email and phone</label>
            <input id="vn-contact" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.contact} onChange={set("contact")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vn-address">Home address</label>
            <input id="vn-address" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.homeAddress} onChange={set("homeAddress")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">E-visa and trip</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-type">E-visa type</label>
            <select id="vn-type" className={`mt-2 ${INPUT_CLASS}`} value={form.visaTypeId} onChange={set("visaTypeId")}>
              {VISA_TYPES.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-purpose">Purpose of visit</label>
            <select id="vn-purpose" className={`mt-2 ${INPUT_CLASS}`} value={form.purposeId} onChange={set("purposeId")}>
              {PURPOSE_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-applied">Application date</label>
            <input id="vn-applied" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.applicationDate} onChange={set("applicationDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-validity">Validity requested (days, max {EVISA_MAX_STAY_DAYS})</label>
            <input id="vn-validity" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" max={EVISA_MAX_STAY_DAYS} value={form.requestedValidityDays} onChange={set("requestedValidityDays")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-arrival">Arrival (valid-from date)</label>
            <input id="vn-arrival" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.arrivalDate} onChange={set("arrivalDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-departure">Departure from Vietnam</label>
            <input id="vn-departure" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.departureDate} onChange={set("departureDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-entry">Checkpoint of entry</label>
            <input id="vn-entry" className={`mt-2 ${INPUT_CLASS}`} type="text" list="vn-ports" value={form.entryPort} onChange={set("entryPort")} />
            <datalist id="vn-ports">
              {ENTRY_PORTS.map((port) => (
                <option key={port} value={port} />
              ))}
            </datalist>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-exit">Checkpoint of exit</label>
            <input id="vn-exit" className={`mt-2 ${INPUT_CLASS}`} type="text" list="vn-ports" value={form.exitPort} onChange={set("exitPort")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-travellers">People applying together</label>
            <input id="vn-travellers" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" max="20" value={form.travellers} onChange={set("travellers")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vn-itinerary">Itinerary (one line per leg)</label>
            <textarea id="vn-itinerary" rows={4} className={`mt-2 ${AREA_CLASS}`} value={form.itinerary} onChange={set("itinerary")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vn-accommodation">Accommodation</label>
            <textarea id="vn-accommodation" rows={2} className={`mt-2 ${AREA_CLASS}`} value={form.accommodation} onChange={set("accommodation")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vn-ties">Ties to your home country</label>
            <textarea id="vn-ties" rows={3} className={`mt-2 ${AREA_CLASS}`} value={form.tiesStatement} onChange={set("tiesStatement")} />
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
              E-visa valid to
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : result.validUntil}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${result.requestedValidityDays} days requested for a ${result.stayDays}-day stay`}
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
            <dt className="text-[var(--muted-foreground)]">Decision expected by</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.decisionBy}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Applied before arrival</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : `${result.leadDays} days`}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Fee total</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : USD.format(result.totalFeeUsd)}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Passport must stay valid to</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.passportRequiredUntil}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Days past the valid-to date</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.daysBeyondValidity}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Visa type</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.visaTypeLabel}</dd>
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
            Stay length, validity window, passport validity, blank pages and processing time all pass the automatic checks.
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
        Follows Vietnam Immigration Department guidance on the electronic visa, which has been open
        to all nationalities since 15 August 2023. The decision estimate counts working days only and
        does not model Vietnamese public holidays. Apply on the official portal — commercial
        look-alike sites charge far more than the government fee. General information, not
        immigration advice.
      </p>
    </main>
  );
}
