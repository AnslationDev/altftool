"use client";

import { useMemo, useState } from "react";
import { Check, Copy, KeyRound, RotateCcw } from "lucide-react";

import {
  LETTER_MODES,
  MAX_NOTICE_DAYS,
  PROPERTY_USES,
  REPAIR_ITEMS,
  TPA_MONTHLY_NOTICE_DAYS,
  VACATE_REASONS,
  assessRepairRequest,
  assessVacateNotice,
  buildRepairRequest,
  buildVacateNotice,
  formatINR,
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

const DEFAULT_REPAIRS = ["seepage", "plumbing"];

const DEFAULTS = {
  tenantName: "Sneha Kulkarni",
  landlordName: "Mr. Vivek Deshpande",
  landlordAddress: "9, Sadashiv Peth, Pune 411030",
  premisesAddress: "Flat 302, Ashirwad Apartments, Aundh, Pune 411007",
  agreementDate: "2024-09-01",
  noticeDate: "2026-07-28",
  intendedVacate: "2026-08-31",
  noticePeriodDays: "30",
  monthlyRent: "25000",
  securityDeposit: "50000",
  damageDeductions: "3000",
  propertyUseId: "residential",
  reasonId: "job-relocation",
  reasonDetail: "",
  refundAccountDetails: "",
  handoverTimeNote: "",
  reportedDate: "2026-07-08",
  letterDate: "2026-07-28",
  allowedDays: "15",
  repairDetail: "The seepage is on the north wall of the bedroom and has spread since the last rain.",
  phone: "94xxxxxx52",
  email: "sneha.kulkarni@example.com",
};

const DASH = "—";

export default function ToolHome() {
  const [mode, setMode] = useState(LETTER_MODES.VACATE);
  const [form, setForm] = useState(DEFAULTS);
  const [repairs, setRepairs] = useState(DEFAULT_REPAIRS);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const toggleRepair = (id) =>
    setRepairs((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const vacate = useMemo(
    () =>
      assessVacateNotice({
        noticeDateISO: form.noticeDate,
        intendedVacateISO: form.intendedVacate,
        noticePeriodDays: Number(form.noticePeriodDays),
        monthlyRent: Number(form.monthlyRent),
        securityDeposit: Number(form.securityDeposit),
        damageDeductions: Number(form.damageDeductions),
        propertyUseId: form.propertyUseId,
      }),
    [
      form.noticeDate,
      form.intendedVacate,
      form.noticePeriodDays,
      form.monthlyRent,
      form.securityDeposit,
      form.damageDeductions,
      form.propertyUseId,
    ],
  );

  const repair = useMemo(
    () =>
      assessRepairRequest({
        reportedDateISO: form.reportedDate,
        letterDateISO: form.letterDate,
        allowedDays: Number(form.allowedDays),
        monthlyRent: Number(form.monthlyRent),
      }),
    [form.reportedDate, form.letterDate, form.allowedDays, form.monthlyRent],
  );

  const isVacate = mode === LETTER_MODES.VACATE;
  const assessment = isVacate ? vacate : repair;

  const letter = useMemo(() => {
    const shared = {
      tenantName: form.tenantName,
      landlordName: form.landlordName,
      landlordAddress: form.landlordAddress,
      premisesAddress: form.premisesAddress,
      agreementDateISO: form.agreementDate,
      phone: form.phone,
      email: form.email,
    };
    return isVacate
      ? buildVacateNotice({
          ...shared,
          noticeDateISO: form.noticeDate,
          intendedVacateISO: form.intendedVacate,
          reasonId: form.reasonId,
          reasonDetail: form.reasonDetail,
          refundAccountDetails: form.refundAccountDetails,
          handoverTimeNote: form.handoverTimeNote,
          assessment: vacate,
        })
      : buildRepairRequest({
          ...shared,
          reportedDateISO: form.reportedDate,
          letterDateISO: form.letterDate,
          repairIds: repairs,
          repairDetail: form.repairDetail,
          assessment: repair,
        });
  }, [form, isVacate, repairs, vacate, repair]);

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
    setRepairs(DEFAULT_REPAIRS);
    setMode(LETTER_MODES.VACATE);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Letter format
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Landlord Notice Letter Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two letters in one place: a notice to vacate that checks your notice period and works out
          the deposit refund, and a repair request that cites the landlord&apos;s duty under section
          108(f) of the Transfer of Property Act, 1882.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-base font-semibold">Which letter do you need?</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              [LETTER_MODES.VACATE, "Notice to vacate", "Ending the tenancy and asking for the deposit back."],
              [LETTER_MODES.REPAIR, "Repair request", "Asking the landlord to fix something they are responsible for."],
            ].map(([value, title, hint]) => (
              <label
                key={value}
                htmlFor={`ln-mode-${value}`}
                className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border p-3 ${
                  mode === value ? "border-[var(--primary)] bg-[var(--muted)]" : "border-[var(--border)] bg-[var(--background)]"
                }`}
              >
                <input
                  id={`ln-mode-${value}`}
                  type="radio"
                  name="ln-mode"
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={mode === value}
                  onChange={() => setMode(value)}
                />
                <span>
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="block text-xs text-[var(--muted-foreground)]">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {isVacate ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Notice, rent and deposit</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="ln-notice-date">
                Date of this notice
              </label>
              <input id="ln-notice-date" className={INPUT} type="date" value={form.noticeDate} onChange={set("noticeDate")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="ln-vacate-date">
                Date you will vacate
              </label>
              <input id="ln-vacate-date" className={INPUT} type="date" value={form.intendedVacate} onChange={set("intendedVacate")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="ln-notice-days">
                Notice period in the agreement (days)
              </label>
              <input
                id="ln-notice-days"
                className={INPUT}
                type="number"
                inputMode="numeric"
                min="0"
                max={MAX_NOTICE_DAYS}
                step="1"
                value={form.noticePeriodDays}
                onChange={set("noticePeriodDays")}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="ln-use">
                Premises are let for
              </label>
              <select id="ln-use" className={INPUT} value={form.propertyUseId} onChange={set("propertyUseId")}>
                {PROPERTY_USES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="ln-rent">
                Monthly rent
              </label>
              <input id="ln-rent" className={INPUT} type="number" inputMode="decimal" min="0" step="500" value={form.monthlyRent} onChange={set("monthlyRent")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="ln-deposit">
                Security deposit held
              </label>
              <input id="ln-deposit" className={INPUT} type="number" inputMode="decimal" min="0" step="1000" value={form.securityDeposit} onChange={set("securityDeposit")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="ln-deductions">
                Deductions you agree to
              </label>
              <input id="ln-deductions" className={INPUT} type="number" inputMode="decimal" min="0" step="500" value={form.damageDeductions} onChange={set("damageDeductions")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="ln-reason">
                Reason for vacating
              </label>
              <select id="ln-reason" className={INPUT} value={form.reasonId} onChange={set("reasonId")}>
                {VACATE_REASONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL} htmlFor="ln-reason-detail">
                {form.reasonId === "other" ? "Describe the reason" : "Anything to add (optional)"}
              </label>
              <textarea id="ln-reason-detail" rows={2} className={AREA} value={form.reasonDetail} onChange={set("reasonDetail")} />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL} htmlFor="ln-refund-account">
                Where the deposit should be refunded (optional)
              </label>
              <input id="ln-refund-account" className={INPUT} value={form.refundAccountDetails} onChange={set("refundAccountDetails")} placeholder="Account name, bank, account number, IFSC" />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL} htmlFor="ln-handover-note">
                Handover note (optional)
              </label>
              <input id="ln-handover-note" className={INPUT} value={form.handoverTimeNote} onChange={set("handoverTimeNote")} placeholder="I can hand over between 10 am and 6 pm on that day." />
            </div>
          </div>
        </section>
      ) : (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">The problem and the timeline</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="ln-reported-date">
                First reported on
              </label>
              <input id="ln-reported-date" className={INPUT} type="date" value={form.reportedDate} onChange={set("reportedDate")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="ln-letter-date">
                Date of this letter
              </label>
              <input id="ln-letter-date" className={INPUT} type="date" value={form.letterDate} onChange={set("letterDate")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="ln-allowed-days">
                Days you are allowing for the repair
              </label>
              <input
                id="ln-allowed-days"
                className={INPUT}
                type="number"
                inputMode="numeric"
                min="1"
                max={MAX_NOTICE_DAYS}
                step="1"
                value={form.allowedDays}
                onChange={set("allowedDays")}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="ln-rent-repair">
                Monthly rent
              </label>
              <input id="ln-rent-repair" className={INPUT} type="number" inputMode="decimal" min="0" step="500" value={form.monthlyRent} onChange={set("monthlyRent")} />
            </div>
          </div>

          <p className="mt-5 text-sm font-semibold">What needs fixing?</p>
          <div className="mt-3 grid gap-2">
            {REPAIR_ITEMS.map((item) => (
              <label
                key={item.id}
                htmlFor={`ln-rep-${item.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <input
                  id={`ln-rep-${item.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={repairs.includes(item.id)}
                  onChange={() => toggleRepair(item.id)}
                />
                <span className="text-sm">
                  {item.label}
                  <span className="ml-2 text-xs text-[var(--muted-foreground)]">
                    {item.landlordDuty ? "usually the landlord's" : "usually the tenant's"}
                  </span>
                </span>
              </label>
            ))}
          </div>

          <div className="mt-4">
            <label className={LABEL} htmlFor="ln-repair-detail">
              Describe the problem
            </label>
            <textarea id="ln-repair-detail" rows={3} className={AREA} value={form.repairDetail} onChange={set("repairDetail")} />
          </div>
        </section>
      )}

      {error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {isVacate ? "Deposit you should get back" : "Repair due by"}
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {error ? DASH : isVacate ? formatINR(Math.max(0, vacate.expectedRefund)) : formatLongDate(repair.deadlineISO)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the details above."
                : isVacate
                  ? vacate.noticeIsSufficient
                    ? `${plural(vacate.noticeGivenDays, "day")} of notice — meets the agreed period.`
                    : `Short by ${plural(vacate.shortfallDays, "day")}; rent in lieu of ${formatINR(vacate.shortfallRent)} is offered in the notice.`
                  : `Pending ${plural(repair.pendingDays, "day")} since you first reported it.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={GHOST_BTN}
              aria-label="Copy the landlord notice summary"
              onClick={() =>
                copy(
                  error
                    ? ""
                    : isVacate
                      ? [
                          "Notice to vacate",
                          `Notice dated: ${formatLongDate(form.noticeDate)}`,
                          `Vacating on: ${formatLongDate(form.intendedVacate)}`,
                          `Notice given: ${plural(vacate.noticeGivenDays, "day")} against ${plural(vacate.requiredDays, "day")} required`,
                          `Rent in lieu of short notice: ${formatINR(vacate.shortfallRent)}`,
                          `Deposit refund expected: ${formatINR(vacate.expectedRefund)}`,
                        ].join("\n")
                      : [
                          "Repair request",
                          `First reported: ${formatLongDate(form.reportedDate)}`,
                          `Pending: ${plural(repair.pendingDays, "day")}`,
                          `Repair requested by: ${formatLongDate(repair.deadlineISO)}`,
                        ].join("\n"),
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
          {(isVacate
            ? [
                ["Notice actually given", error ? DASH : plural(vacate.noticeGivenDays, "day")],
                ["Earliest date the agreed notice allows", error ? DASH : formatLongDate(vacate.earliestVacateISO)],
                ["Shortfall in notice", error ? DASH : plural(vacate.shortfallDays, "day")],
                ["Rent per day (30-day pro-rata)", error ? DASH : formatINR(vacate.dailyRent)],
                ["Rent in lieu of short notice", error ? DASH : formatINR(vacate.shortfallRent)],
                ["Deposit held", error ? DASH : formatINR(vacate.deposit)],
                ["Agreed deductions", error ? DASH : formatINR(vacate.deductions)],
                [
                  vacate.refundIsNegative ? "Balance payable by you" : "Deposit refund expected",
                  error ? DASH : formatINR(Math.abs(vacate.expectedRefund)),
                ],
                [
                  `Model Tenancy Act deposit cap (${vacate.depositMonths || 2} months)`,
                  error ? DASH : `${formatINR(vacate.depositCap)}${vacate.depositOverCap > 0 ? ` — over by ${formatINR(vacate.depositOverCap)}` : ""}`,
                ],
                [
                  "If you overstay, MTA compensation",
                  error ? DASH : `${formatINR(vacate.overstayFirstMonthly)}/month for 2 months, then ${formatINR(vacate.overstayLaterMonthly)}/month`,
                ],
              ]
            : [
                ["Days the problem has been pending", error ? DASH : plural(repair.pendingDays, "day")],
                ["Time you are allowing", error ? DASH : plural(repair.allowedDays, "day")],
                ["Repair requested by", error ? DASH : formatLongDate(repair.deadlineISO)],
                [
                  "Tone of the letter",
                  error ? DASH : repair.tone === "polite" ? "Polite first request" : repair.tone === "firm" ? "Firm reminder" : "Final written request",
                ],
                ["Items that are the landlord's duty", error ? DASH : String(letter.landlordItems?.length ?? 0)],
                ["Items you are handling yourself", error ? DASH : String(letter.tenantItems?.length ?? 0)],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
          Where a rent agreement is silent, section 106 of the Transfer of Property Act, 1882 treats
          an ordinary lease as month to month, terminable by {TPA_MONTHLY_NOTICE_DAYS} days&apos;
          written notice, counted from the date the other side receives it.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Names, address and contact</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="ln-tenant">
              Your name (tenant)
            </label>
            <input id="ln-tenant" className={INPUT} value={form.tenantName} onChange={set("tenantName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ln-landlord">
              Landlord&apos;s name
            </label>
            <input id="ln-landlord" className={INPUT} value={form.landlordName} onChange={set("landlordName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ln-agreement-date">
              Rent agreement date
            </label>
            <input id="ln-agreement-date" className={INPUT} type="date" value={form.agreementDate} onChange={set("agreementDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ln-phone">
              Phone
            </label>
            <input id="ln-phone" className={INPUT} value={form.phone} onChange={set("phone")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="ln-email">
              Email
            </label>
            <input id="ln-email" className={INPUT} type="email" value={form.email} onChange={set("email")} />
          </div>
        </div>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL} htmlFor="ln-premises">
              Address of the rented premises
            </label>
            <textarea id="ln-premises" rows={2} className={AREA} value={form.premisesAddress} onChange={set("premisesAddress")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ln-landlord-address">
              Landlord&apos;s address
            </label>
            <textarea id="ln-landlord-address" rows={2} className={AREA} value={form.landlordAddress} onChange={set("landlordAddress")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">{isVacate ? "Your notice to vacate" : "Your repair request"}</h2>
          <button
            type="button"
            className={PRIMARY_BTN}
            aria-label="Copy the landlord letter"
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
        Informational only, not legal advice. Your rent agreement, and any rent control or tenancy
        law in force in your state, override the general rules cited here. The Model Tenancy Act,
        2021 is a model law and binds you only where your state or union territory has enacted its
        own version. Send the letter by a method that gives you proof of delivery.
      </p>
    </main>
  );
}
