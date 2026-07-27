"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mountain, RotateCcw } from "lucide-react";

import {
  FUNDING_OPTIONS,
  PURPOSE_OPTIONS,
  SUPER_VISA_MIN_INSURANCE_CAD,
  VISA_TYPES,
  buildCanadaCoverLetter,
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

const CAD = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

const DASH = "—";

const DEFAULTS = {
  fullName: "Meera Iyer",
  nationality: "Indian",
  passportNumber: "P4455667",
  passportExpiryDate: "2029-12-31",
  occupation: "School principal",
  employer: "Vidya Public School",
  homeAddress: "7 Lake Road, Chennai 600028, India",
  contact: "meera@example.com, +91 98400 22222",
  uciNumber: "1122334455",
  visaTypeId: "trv-multiple",
  purposeId: "family",
  applicationDate: "2026-05-01",
  arrivalDate: "2026-07-04",
  departureDate: "2026-08-15",
  itinerary: "4–20 Jul — Toronto (staying with family)\n21–31 Jul — Ottawa and Montréal\n1–15 Aug — Vancouver, then return flight",
  accommodation: "Host residence, 22 Bristol Road, Mississauga ON; Sandman Hotel Vancouver (booking 71204)",
  hostName: "Anil Iyer (son, Canadian citizen)",
  fundingId: "self",
  budgetCad: "12000",
  applicants: "2",
  needBiometrics: "yes",
  biometricsGivenDate: "2020-03-01",
  insuranceCad: "",
  tiesStatement:
    "I am employed until retirement in 2032, own my home in Chennai, and my younger son and elderly mother live with me in India.",
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
    () => buildCanadaCoverLetter({ ...form, needBiometrics: form.needBiometrics === "yes" }),
    [form],
  );
  const hasError = Boolean(result.error);
  const isSuperVisa = form.visaTypeId === "super";

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
          <Mountain className="h-4 w-4" aria-hidden="true" />
          Visa documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Canada Visa Cover Letter Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write the letter of explanation that goes with your IMM 5257 visitor visa or super visa
          application, with fee totals, the six-month stay check and the CAD{" "}
          {SUPER_VISA_MIN_INSURANCE_CAD.toLocaleString("en-CA")} super visa insurance rule applied
          automatically.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Applicant</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-name">Full name (as in passport)</label>
            <input id="cv-name" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.fullName} onChange={set("fullName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-nationality">Nationality</label>
            <input id="cv-nationality" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.nationality} onChange={set("nationality")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-passport">Passport number</label>
            <input id="cv-passport" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.passportNumber} onChange={set("passportNumber")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-expiry">Passport expiry date</label>
            <input id="cv-expiry" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.passportExpiryDate} onChange={set("passportExpiryDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-uci">UCI number (if you have one)</label>
            <input id="cv-uci" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.uciNumber} onChange={set("uciNumber")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-occupation">Occupation</label>
            <input id="cv-occupation" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.occupation} onChange={set("occupation")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-employer">Employer or institution</label>
            <input id="cv-employer" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.employer} onChange={set("employer")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-contact">Email and phone</label>
            <input id="cv-contact" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.contact} onChange={set("contact")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cv-address">Home address</label>
            <input id="cv-address" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.homeAddress} onChange={set("homeAddress")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Application and trip</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-type">Visa type</label>
            <select id="cv-type" className={`mt-2 ${INPUT_CLASS}`} value={form.visaTypeId} onChange={set("visaTypeId")}>
              {VISA_TYPES.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-purpose">Purpose of visit</label>
            <select id="cv-purpose" className={`mt-2 ${INPUT_CLASS}`} value={form.purposeId} onChange={set("purposeId")}>
              {PURPOSE_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-applied">Application date</label>
            <input id="cv-applied" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.applicationDate} onChange={set("applicationDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-applicants">People applying together</label>
            <input id="cv-applicants" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" max="20" value={form.applicants} onChange={set("applicants")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-arrival">Arrival in Canada</label>
            <input id="cv-arrival" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.arrivalDate} onChange={set("arrivalDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-departure">Departure from Canada</label>
            <input id="cv-departure" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.departureDate} onChange={set("departureDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-bio">Biometrics needed this time?</label>
            <select id="cv-bio" className={`mt-2 ${INPUT_CLASS}`} value={form.needBiometrics} onChange={set("needBiometrics")}>
              <option value="yes">Yes — pay the biometrics fee</option>
              <option value="no">No — still valid from an earlier application</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-biodate">Biometrics last given on</label>
            <input id="cv-biodate" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.biometricsGivenDate} onChange={set("biometricsGivenDate")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cv-itinerary">Itinerary (one line per leg)</label>
            <textarea id="cv-itinerary" rows={4} className={`mt-2 ${AREA_CLASS}`} value={form.itinerary} onChange={set("itinerary")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cv-accommodation">Accommodation</label>
            <textarea id="cv-accommodation" rows={2} className={`mt-2 ${AREA_CLASS}`} value={form.accommodation} onChange={set("accommodation")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Host, funding and ties</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-host">Canadian host and their status</label>
            <input id="cv-host" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.hostName} onChange={set("hostName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-funding">Who is paying?</label>
            <select id="cv-funding" className={`mt-2 ${INPUT_CLASS}`} value={form.fundingId} onChange={set("fundingId")}>
              {FUNDING_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-budget">Funds available (CAD)</label>
            <input id="cv-budget" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" value={form.budgetCad} onChange={set("budgetCad")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-insurance">
              Emergency medical cover (CAD){isSuperVisa ? " — required" : " — optional"}
            </label>
            <input id="cv-insurance" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" value={form.insuranceCad} onChange={set("insuranceCad")} placeholder="100000" />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cv-ties">Ties to your home country</label>
            <textarea id="cv-ties" rows={3} className={`mt-2 ${AREA_CLASS}`} value={form.tiesStatement} onChange={set("tiesStatement")} />
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
              Government fees
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : CAD.format(result.totalFeeCad)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${CAD.format(result.visaFeeCad)} visa + ${CAD.format(result.biometricsFeeCad)} biometrics for ${result.applicants} applicant(s)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLetter}
              disabled={hasError}
              aria-label="Copy the finished letter of explanation to the clipboard"
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
            <dt className="text-[var(--muted-foreground)]">Length of visit</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : `${result.stayDays} days`}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Six-month stay would end</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : result.standardStayEnds}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Funds per person per day</dt>
            <dd className="mt-1 font-semibold">{hasError ? DASH : CAD.format(result.perPersonPerDayCad)}</dd>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <dt className="text-[var(--muted-foreground)]">Biometrics valid until</dt>
            <dd className="mt-1 font-semibold">
              {hasError || !result.biometricsValidUntil ? DASH : result.biometricsValidUntil}
            </dd>
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
            Stay length, biometrics validity, funding and insurance all pass the automatic checks.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your letter of explanation</h2>
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
        Fees and rules follow published IRCC guidance for temporary resident visas and the super
        visa, and the leave-by-end-of-stay requirement in the Immigration and Refugee Protection Act.
        Fees and the minimum necessary income table are updated periodically — confirm current
        figures on canada.ca. General information only, not immigration advice.
      </p>
    </main>
  );
}
