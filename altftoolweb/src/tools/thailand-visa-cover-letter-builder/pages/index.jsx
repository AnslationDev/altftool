"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Palmtree, RotateCcw } from "lucide-react";

import { PURPOSE_OPTIONS, VISA_TYPES, buildThailandCoverLetter } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const THB = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const DASH = "—";

const DEFAULTS = {
  fullName: "Priya Sharma",
  nationality: "Indian",
  passportNumber: "S1122334",
  passportExpiryDate: "2029-08-31",
  occupation: "Graphic designer",
  employer: "Pixel Studio LLP",
  homeAddress: "5 Park Street, Kolkata 700016, India",
  contact: "priya@example.com, +91 98300 44444",
  visaTypeId: "tr-single",
  purposeId: "tourism",
  applicationDate: "2026-10-01",
  arrivalDate: "2026-11-10",
  departureDate: "2026-12-15",
  planExtension: "no",
  itinerary: "10–20 Nov — Bangkok (Grand Palace, Chatuchak)\n21 Nov–5 Dec — Chiang Mai and Pai\n6–15 Dec — Krabi and Railay, then return flight",
  accommodation: "Riva Surya Bangkok (booking 44821); Tamarind Village Chiang Mai (booking 71190)",
  onwardDestination: "Kolkata (return flight TG 313)",
  fundsThb: "60000",
  travellers: "2",
  tiesStatement:
    "My leave is approved for these dates, I hold a studio lease in Kolkata running to 2028, and my parents live with me there.",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(
    () => buildThailandCoverLetter({ ...form, planExtension: form.planExtension === "yes" }),
    [form],
  );
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
          <Palmtree className="h-4 w-4" aria-hidden="true" />
          Visa documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Thailand Visa Cover Letter Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write the covering letter for a Thai e-Visa tourist application, and see the exact
          permitted-to-stay date 60 days after entry, the funds you must evidence, your Digital
          Arrival Card window and any overstay fine your dates would trigger.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Applicant</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="th-name">Full name (as in passport)</label>
            <input id="th-name" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.fullName} onChange={set("fullName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="th-nationality">Nationality</label>
            <input id="th-nationality" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.nationality} onChange={set("nationality")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="th-passport">Passport number</label>
            <input id="th-passport" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.passportNumber} onChange={set("passportNumber")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="th-expiry">Passport expiry date</label>
            <input id="th-expiry" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.passportExpiryDate} onChange={set("passportExpiryDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="th-occupation">Occupation</label>
            <input id="th-occupation" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.occupation} onChange={set("occupation")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="th-employer">Employer or institution</label>
            <input id="th-employer" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.employer} onChange={set("employer")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="th-address">Home address</label>
            <input id="th-address" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.homeAddress} onChange={set("homeAddress")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="th-contact">Email and phone</label>
            <input id="th-contact" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.contact} onChange={set("contact")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Visa and trip</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="th-type">Visa type</label>
            <select id="th-type" className={`mt-2 ${INPUT_CLASS}`} value={form.visaTypeId} onChange={set("visaTypeId")}>
              {VISA_TYPES.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="th-purpose">Purpose of visit</label>
            <select id="th-purpose" className={`mt-2 ${INPUT_CLASS}`} value={form.purposeId} onChange={set("purposeId")}>
              {PURPOSE_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="th-applied">e-Visa application date</label>
            <input id="th-applied" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.applicationDate} onChange={set("applicationDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="th-extension">Plan to extend by 30 days?</label>
            <select id="th-extension" className={`mt-2 ${INPUT_CLASS}`} value={form.planExtension} onChange={set("planExtension")}>
              <option value="no">No — leaving within the stamped period</option>
              <option value="yes">Yes — will extend at an Immigration office</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="th-arrival">Arrival in Thailand</label>
            <input id="th-arrival" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.arrivalDate} onChange={set("arrivalDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="th-departure">Departure from Thailand</label>
            <input id="th-departure" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.departureDate} onChange={set("departureDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="th-onward">Onward or return destination</label>
            <input id="th-onward" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.onwardDestination} onChange={set("onwardDestination")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="th-travellers">Travellers together</label>
            <input id="th-travellers" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" max="20" value={form.travellers} onChange={set("travellers")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="th-funds">Funds you can evidence (THB)</label>
            <input id="th-funds" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" value={form.fundsThb} onChange={set("fundsThb")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="th-itinerary">Itinerary (one line per leg)</label>
            <textarea id="th-itinerary" rows={4} className={`mt-2 ${AREA_CLASS}`} value={form.itinerary} onChange={set("itinerary")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="th-accommodation">Accommodation</label>
            <textarea id="th-accommodation" rows={2} className={`mt-2 ${AREA_CLASS}`} value={form.accommodation} onChange={set("accommodation")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="th-ties">Ties to your home country</label>
            <textarea id="th-ties" rows={3} className={`mt-2 ${AREA_CLASS}`} value={form.tiesStatement} onChange={set("tiesStatement")} />
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
              Permitted to stay until
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : result.permittedUntil}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `Your plan is a ${result.stayDays}-day stay`}
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
            <dt className="text-[var(--muted-foreground)]">With a 30-day extension</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.extendedUntil}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Overstay on these dates</dt>
            <dd className="mt-1 font-semibold">
              {hasError ? DASH : result.overstayDays === 0 ? "None" : `${result.overstayDays} days — ${THB.format(result.fineThb)} fine`}
            </dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Funds you must evidence</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : THB.format(result.requiredFundsThb)}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Digital Arrival Card window</dt>
            <dd className="mt-1 font-semibold">
              {hasError ? DASH : `${result.tdacOpensOn} to ${result.tdacClosesOn}`}
            </dd>
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
            Stay length, passport validity, funds evidence and onward travel all pass the automatic checks.
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
        Based on Royal Thai Government e-Visa guidance and Immigration Bureau rules on tourist visas,
        extensions, arrival cards and overstay penalties. Consular requirements differ slightly by
        country — check your local Royal Thai Embassy page. General information only, not
        immigration advice.
      </p>
    </main>
  );
}
