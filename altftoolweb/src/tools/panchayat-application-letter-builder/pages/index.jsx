"use client";

import { useMemo, useState } from "react";
import { Building2, Check, Copy, RotateCcw } from "lucide-react";

import {
  APPLICATION_TYPES,
  MGNREGA_WORK_DAYS,
  REGISTRATION_LATE_FEE_DAYS,
  REGISTRATION_NORMAL_DAYS,
  RTI_REPLY_DAYS,
  applicationTypeById,
  assessApplication,
  buildPanchayatApplication,
  formatLongDate,
  plural,
} from "../lib";

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA =
  "mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  applicantName: "Ramesh Yadav",
  fatherOrHusbandName: "Shri Mohan Yadav",
  houseNumber: "45",
  wardNumber: "3",
  villageName: "Baraut Khurd",
  panchayatName: "Baraut",
  blockName: "Chhata",
  districtName: "Mathura",
  stateName: "Uttar Pradesh",
  addressee: "",
  typeId: "drinking-water",
  applicationDate: "2026-07-28",
  eventDate: "2026-07-10",
  subjectDetail: "handpump near the primary school",
  requestDetail:
    "The handpump serving about forty households near the primary school has been out of order since the middle of June. Women and children are now walking close to a kilometre for drinking water.",
  jobCardNumber: "",
  rtiPoints: "Certified copy of the resolution sanctioning the road work in ward 3\nStatement of expenditure incurred on that work",
  supportingSignatories: "",
  phone: "87xxxxxx19",
  aadhaarLastFour: "8842",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [lifeOrLiberty, setLifeOrLiberty] = useState(false);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const type = applicationTypeById(form.typeId);

  const assessment = useMemo(
    () =>
      assessApplication({
        typeId: form.typeId,
        applicationDateISO: form.applicationDate,
        eventDateISO: form.eventDate,
        lifeOrLiberty,
      }),
    [form.typeId, form.applicationDate, form.eventDate, lifeOrLiberty],
  );

  const letter = useMemo(
    () =>
      buildPanchayatApplication({
        applicantName: form.applicantName,
        fatherOrHusbandName: form.fatherOrHusbandName,
        houseNumber: form.houseNumber,
        wardNumber: form.wardNumber,
        villageName: form.villageName,
        panchayatName: form.panchayatName,
        blockName: form.blockName,
        districtName: form.districtName,
        stateName: form.stateName,
        addressee: form.addressee,
        typeId: form.typeId,
        applicationDateISO: form.applicationDate,
        eventDateISO: form.eventDate,
        subjectDetail: form.subjectDetail,
        requestDetail: form.requestDetail,
        jobCardNumber: form.jobCardNumber,
        rtiPoints: form.rtiPoints,
        lifeOrLiberty,
        supportingSignatories: form.supportingSignatories,
        phone: form.phone,
        aadhaarLastFour: form.aadhaarLastFour,
        assessment,
      }),
    [form, lifeOrLiberty, assessment],
  );

  const error = assessment.error || letter.error || "";

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setLifeOrLiberty(false);
    setCopied("");
  };

  const headline = error
    ? DASH
    : assessment.hasStatutoryDeadline
      ? formatLongDate(assessment.deadlineISO)
      : formatLongDate(assessment.followUpISO);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Letter format
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Panchayat Application Letter Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fourteen kinds of application to a sarpanch or gram panchayat, each in the local format
          with the applicant&apos;s particulars block, the right addressee, the documents to enclose
          and — where a statute fixes one — the exact date a reply is due.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What are you applying for?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="pa-type">
              Application type
            </label>
            <select id="pa-type" className={INPUT} value={form.typeId} onChange={set("typeId")}>
              {APPLICATION_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="pa-date">
              Date of the application
            </label>
            <input id="pa-date" className={INPUT} type="date" value={form.applicationDate} onChange={set("applicationDate")} />
          </div>
          {type.needsEventDate ? (
            <div>
              <label className={LABEL} htmlFor="pa-event-date">
                {type.eventLabel || "Date of the event"}
              </label>
              <input id="pa-event-date" className={INPUT} type="date" value={form.eventDate} onChange={set("eventDate")} />
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="pa-subject-detail">
              Short description for the subject line
            </label>
            <input id="pa-subject-detail" className={INPUT} value={form.subjectDetail} onChange={set("subjectDetail")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="pa-request-detail">
              Describe the request in your own words
            </label>
            <textarea id="pa-request-detail" rows={4} className={AREA} value={form.requestDetail} onChange={set("requestDetail")} />
          </div>
          {type.id === "mgnrega-work" || type.id === "mgnrega-job-card" ? (
            <div className="sm:col-span-2">
              <label className={LABEL} htmlFor="pa-jobcard">
                Job card number (if you already have one)
              </label>
              <input id="pa-jobcard" className={INPUT} value={form.jobCardNumber} onChange={set("jobCardNumber")} />
            </div>
          ) : null}
          {type.rti ? (
            <>
              <div className="sm:col-span-2">
                <label className={LABEL} htmlFor="pa-rti-points">
                  Information sought, one item per line
                </label>
                <textarea id="pa-rti-points" rows={4} className={AREA} value={form.rtiPoints} onChange={set("rtiPoints")} />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="pa-life"
                  className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <input
                    id="pa-life"
                    type="checkbox"
                    className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                    checked={lifeOrLiberty}
                    onChange={(event) => setLifeOrLiberty(event.target.checked)}
                  />
                  <span>
                    <span className="block text-sm font-semibold">This concerns the life or liberty of a person</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      The proviso to section 7(1) then requires a reply within 48 hours instead of {RTI_REPLY_DAYS} days.
                    </span>
                  </span>
                </label>
              </div>
            </>
          ) : null}
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="pa-signatories">
              Other residents supporting the application (optional)
            </label>
            <input id="pa-signatories" className={INPUT} value={form.supportingSignatories} onChange={set("supportingSignatories")} placeholder="Sunita Devi, Mahesh Chand, Ram Singh" />
          </div>
        </div>
      </section>

      {error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {error ? "Date to watch" : assessment.hasStatutoryDeadline ? "Reply due by" : "Follow up after"}
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the dates above."
                : assessment.hasStatutoryDeadline
                  ? `Statutory: ${assessment.deadlineBasis}.`
                  : "No statute fixes a period for this request, so this is a sensible date to chase it."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={GHOST_BTN}
              aria-label="Copy the panchayat application summary"
              onClick={() =>
                copy(
                  error
                    ? ""
                    : [
                        "Panchayat application",
                        `Type: ${type.label}`,
                        `Applied on: ${formatLongDate(form.applicationDate)}`,
                        assessment.hasStatutoryDeadline
                          ? `Reply due by: ${formatLongDate(assessment.deadlineISO)}`
                          : `Follow up after: ${formatLongDate(assessment.followUpISO)}`,
                        assessment.registration
                          ? `Registration band: ${assessment.registration.band} (${plural(assessment.registration.elapsedDays, "day")} after the event)`
                          : "",
                        `Escalate to: ${type.escalation}`,
                      ]
                        .filter(Boolean)
                        .join("\n"),
                  "summary",
                )
              }
            >
              {copied === "summary" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "summary" ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Addressed to", error ? DASH : form.addressee.trim() || type.addressee],
            [
              "Statutory reply period",
              error ? DASH : assessment.hasStatutoryDeadline ? `${plural(assessment.deadlineDays, "day")} — ${assessment.deadlineBasis}` : "None fixed by statute",
            ],
            [
              "First appeal deadline (RTI)",
              error || !assessment.appealByISO ? DASH : formatLongDate(assessment.appealByISO),
            ],
            [
              `Registration band (${REGISTRATION_NORMAL_DAYS} / ${REGISTRATION_LATE_FEE_DAYS} days / 1 year)`,
              error || !assessment.registration ? DASH : assessment.registration.bandText,
            ],
            [
              "Free registration window ends",
              error || !assessment.registration ? DASH : formatLongDate(assessment.registration.freeUntilISO),
            ],
            ["Escalate to", error ? DASH : type.escalation],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 basis-2/5 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 rounded-md bg-[var(--muted)] px-3 py-3 text-xs leading-5 text-[var(--muted-foreground)]">
          <p className="font-semibold text-[var(--foreground)]">Documents to attach</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {type.docs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-3">{type.basis}</p>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your particulars</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="pa-name">
              Full name
            </label>
            <input id="pa-name" className={INPUT} value={form.applicantName} onChange={set("applicantName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pa-father">
              Father&apos;s / husband&apos;s name
            </label>
            <input id="pa-father" className={INPUT} value={form.fatherOrHusbandName} onChange={set("fatherOrHusbandName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pa-house">
              House number
            </label>
            <input id="pa-house" className={INPUT} value={form.houseNumber} onChange={set("houseNumber")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pa-ward">
              Ward number
            </label>
            <input id="pa-ward" className={INPUT} value={form.wardNumber} onChange={set("wardNumber")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pa-village">
              Village
            </label>
            <input id="pa-village" className={INPUT} value={form.villageName} onChange={set("villageName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pa-panchayat">
              Gram Panchayat
            </label>
            <input id="pa-panchayat" className={INPUT} value={form.panchayatName} onChange={set("panchayatName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pa-block">
              Block
            </label>
            <input id="pa-block" className={INPUT} value={form.blockName} onChange={set("blockName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pa-district">
              District
            </label>
            <input id="pa-district" className={INPUT} value={form.districtName} onChange={set("districtName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pa-state">
              State
            </label>
            <input id="pa-state" className={INPUT} value={form.stateName} onChange={set("stateName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pa-addressee">
              Addressed to (default: {type.addressee})
            </label>
            <input id="pa-addressee" className={INPUT} value={form.addressee} onChange={set("addressee")} placeholder={type.addressee} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pa-phone">
              Mobile
            </label>
            <input id="pa-phone" className={INPUT} value={form.phone} onChange={set("phone")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pa-aadhaar">
              Aadhaar — last four digits only
            </label>
            <input id="pa-aadhaar" className={INPUT} inputMode="numeric" maxLength={4} value={form.aadhaarLastFour} onChange={set("aadhaarLastFour")} />
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Only the last four digits of an Aadhaar number are put in the letter. Never write a full
          Aadhaar number into a document you are handing over.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your application</h2>
          <button
            type="button"
            className={PRIMARY_BTN}
            aria-label="Copy the panchayat application letter"
            onClick={() => copy(letter.error ? "" : letter.body, "letter")}
          >
            {copied === "letter" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied === "letter" ? "Copied!" : "Copy letter"}
          </button>
        </div>
        {error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {error}
          </p>
        ) : (
          <>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">{letter.wordCount} words</p>
            <pre className="mt-3 max-h-[28rem] overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
              {letter.body}
            </pre>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. What a gram panchayat can sanction, the forms it uses
        and the fees it charges are fixed by your state&apos;s Panchayati Raj Act and rules — only
        the RTI Act, MGNREGA and the Registration of Births and Deaths Act deadlines shown here are
        central. Always take a dated receipt for anything you submit. MGNREGA employment must be
        given within {MGNREGA_WORK_DAYS} days of a written demand.
      </p>
    </main>
  );
}
