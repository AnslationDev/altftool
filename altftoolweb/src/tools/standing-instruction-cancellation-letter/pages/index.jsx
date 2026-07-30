"use client";

import { useMemo, useState } from "react";
import { Ban, Check, Copy, RotateCcw } from "lucide-react";

import {
  BANK_CREDIT_WORKING_DAYS,
  FREQUENCIES,
  LIMITED_LIABILITY_WORKING_DAYS,
  MANDATE_CHANNELS,
  WEEKLY_OFF_PATTERNS,
  ZERO_LIABILITY_WORKING_DAYS,
  assessCancellation,
  buildCancellationDocuments,
  channelById,
  formatLongDate,
  plural,
  validateIFSC,
  validateUMRN,
  verdictText,
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

const DASH = "—";

const DEFAULTS = {
  channelId: "nach",
  lodgementDate: "2026-07-29",
  nextDebitDate: "2026-08-10",
  requiredWorkingDays: "5",
  weeklyOff: "bank",
  holidayText: "2026-08-15",
  customerName: "Rohit Menon",
  accountNumber: "002401512345",
  ifsc: "ICIC0000241",
  bankName: "ICICI Bank",
  branchName: "Baner Branch",
  branchAddress: "Baner Road, Pune, Maharashtra 411045",
  billerName: "FitZone Gyms Pvt Ltd",
  billerAddress: "Aundh, Pune, Maharashtra 411007",
  mandateReference: "ICIC00000000012345678",
  amountInput: "2499",
  frequency: "monthly",
  reason: "Membership not being renewed after the current term",
  phone: "97xxxxxx33",
  email: "rohit.menon@example.com",
};

const stateClass = (state) =>
  state === "invalid"
    ? "text-[var(--danger)]"
    : state === "ok"
      ? "text-[var(--success)]"
      : "text-[var(--muted-foreground)]";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const channel = channelById(form.channelId);

  const assessment = useMemo(
    () =>
      assessCancellation({
        lodgementISO: form.lodgementDate,
        nextDebitISO: form.nextDebitDate,
        requiredWorkingDays: form.requiredWorkingDays,
        weeklyOff: form.weeklyOff,
        holidayText: form.holidayText,
      }),
    [form.lodgementDate, form.nextDebitDate, form.requiredWorkingDays, form.weeklyOff, form.holidayText],
  );

  const documents = useMemo(
    () =>
      buildCancellationDocuments({
        channelId: form.channelId,
        customerName: form.customerName,
        accountNumber: form.accountNumber,
        ifsc: form.ifsc,
        bankName: form.bankName,
        branchName: form.branchName,
        branchAddress: form.branchAddress,
        billerName: form.billerName,
        billerAddress: form.billerAddress,
        mandateReference: form.mandateReference,
        amountInput: form.amountInput,
        frequency: form.frequency,
        reason: form.reason,
        lodgementISO: form.lodgementDate,
        nextDebitISO: form.nextDebitDate,
        phone: form.phone,
        email: form.email,
        assessment,
      }),
    [form, assessment],
  );

  const error = assessment.error || documents.error || "";
  const umrn = channel.checkUmrn ? validateUMRN(form.mandateReference) : null;
  const ifsc = validateIFSC(form.ifsc);

  const applyChannel = (event) => {
    const nextId = event.target.value;
    const next = channelById(nextId);
    setForm((prev) => ({
      ...prev,
      channelId: nextId,
      requiredWorkingDays: String(next.defaultLeadDays),
    }));
  };

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
    setCopied("");
  };

  const headline = error
    ? DASH
    : assessment.mode === "after-debit"
      ? "Already debited"
      : plural(assessment.workingDaysAvailable, "working day");

  const headlineTone =
    error || assessment.mode === "after-debit" || !assessment.inTime
      ? "text-[var(--danger)]"
      : "text-[var(--success)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Ban className="h-4 w-4" aria-hidden="true" />
          Auto-debit cancellation
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Standing Instruction Cancellation Letter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Counts the clear working days between the day you lodge the cancellation and the next
          debit — Sundays, the 2nd and 4th Saturday and any bank holidays you paste in are all taken
          out — then tells you the last working day on which you could still have lodged it, and
          drafts both letters: one to your bank and one to the company collecting the money.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What you are cancelling, and when</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="si-channel">
              Type of standing instruction
            </label>
            <select id="si-channel" className={INPUT} value={form.channelId} onChange={applyChannel}>
              {MANDATE_CHANNELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="si-lodgement">
              Date you are lodging the cancellation
            </label>
            <input
              id="si-lodgement"
              className={INPUT}
              type="date"
              value={form.lodgementDate}
              onChange={set("lodgementDate")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="si-debit">
              Next scheduled debit date
            </label>
            <input
              id="si-debit"
              className={INPUT}
              type="date"
              value={form.nextDebitDate}
              onChange={set("nextDebitDate")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="si-lead">
              Notice period asked for (working days)
            </label>
            <input
              id="si-lead"
              className={INPUT}
              type="number"
              min="0"
              max="90"
              value={form.requiredWorkingDays}
              onChange={set("requiredWorkingDays")}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Pre-filled with {channel.defaultLeadDays} for this channel. That figure is common
              practice, not a regulation — put in the number your own bank or AMC states.
            </p>
          </div>
          <div>
            <label className={LABEL} htmlFor="si-weekly-off">
              Working week to count against
            </label>
            <select id="si-weekly-off" className={INPUT} value={form.weeklyOff} onChange={set("weeklyOff")}>
              {WEEKLY_OFF_PATTERNS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="si-holidays">
              Bank holidays to exclude (YYYY-MM-DD, one per line or comma separated)
            </label>
            <textarea
              id="si-holidays"
              rows={2}
              className={AREA}
              value={form.holidayText}
              onChange={set("holidayText")}
              placeholder="2026-08-15"
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Bank holidays are state-specific and this tool has no holiday list built in — paste
              the dates from your own state&apos;s calendar.
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Clear working days before the debit
            </p>
            <p className={`mt-1 text-3xl font-semibold sm:text-4xl ${headlineTone}`}>{headline}</p>
            <p className="mt-1 max-w-prose text-sm text-[var(--muted-foreground)]">
              {error ? "Fix the fields above." : verdictText(assessment, channel)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={GHOST_BTN}
              aria-label="Copy the timing summary"
              onClick={() =>
                copy(
                  error
                    ? ""
                    : [
                        `Standing instruction cancellation — ${channel.label}`,
                        `Lodged: ${formatLongDate(form.lodgementDate)} (${assessment.lodgementWeekday})`,
                        `Next debit: ${formatLongDate(form.nextDebitDate)} (${assessment.debitWeekday})`,
                        `Clear working days between them: ${assessment.workingDaysAvailable}`,
                        `Notice period assumed: ${assessment.requiredWorkingDays} working days`,
                        `Last safe lodgement date: ${formatLongDate(assessment.lastSafeLodgementISO)}`,
                      ].join("\n"),
                  "summary",
                )
              }
            >
              {copied === "summary" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
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
            [
              "Lodging on",
              error ? DASH : `${assessment.lodgementWeekday} — ${assessment.lodgementIsWorkingDay ? "a working day" : "a non-working day"}`,
            ],
            [
              "Debit falls on",
              error ? DASH : `${assessment.debitWeekday} — ${assessment.debitIsWorkingDay ? "a working day" : "a non-working day"}`,
            ],
            ["Calendar days between them", error ? DASH : plural(assessment.calendarDays, "day")],
            ["Clear working days between them", error ? DASH : String(assessment.workingDaysAvailable)],
            ["Notice period assumed", error ? DASH : plural(assessment.requiredWorkingDays, "working day")],
            [
              "Last day you could safely lodge",
              error || !assessment.lastSafeLodgementISO ? DASH : formatLongDate(assessment.lastSafeLodgementISO),
            ],
            ["Holidays excluded", error ? DASH : plural(assessment.holidayCount, "date")],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!error && assessment.mode === "after-debit" ? (
          <div className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-3 text-xs leading-5 text-[var(--danger)]">
            <p className="font-semibold">The debit is already behind you — this is now a dispute</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>
                You are lodging on working day {assessment.workingDaysSinceDebit} after the
                transaction.
              </li>
              <li>
                Zero-liability window ({ZERO_LIABILITY_WORKING_DAYS} working days) runs to{" "}
                {formatLongDate(assessment.zeroLiabilityByISO)}.
              </li>
              <li>
                Limited-liability window ({LIMITED_LIABILITY_WORKING_DAYS} working days) runs to{" "}
                {formatLongDate(assessment.limitedLiabilityByISO)}.
              </li>
              <li>
                Once notified, the bank has {BANK_CREDIT_WORKING_DAYS} working days to credit the
                amount — that lands on {formatLongDate(assessment.bankCreditDueISO)}.
              </li>
            </ul>
            <p className="mt-2">
              Windows are from the RBI circular on limiting customer liability in unauthorised
              electronic banking transactions dated 6 July 2017, counted here from the debit date.
              The circular counts from the day you receive the bank&apos;s communication about the
              transaction, so use your SMS or email timestamp if it is later.
            </p>
          </div>
        ) : null}

        <div className="mt-4 rounded-md bg-[var(--muted)] px-3 py-3 text-xs leading-5 text-[var(--muted-foreground)]">
          <p className="font-semibold text-[var(--foreground)]">About a {channel.label}</p>
          <p className="mt-1">{channel.note}</p>
          <p className="mt-1">Lodge it with: {channel.lodgeWith}.</p>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Mandate and account details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="si-name">
              Your full name
            </label>
            <input id="si-name" className={INPUT} value={form.customerName} onChange={set("customerName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="si-account">
              Account number
            </label>
            <input id="si-account" className={INPUT} value={form.accountNumber} onChange={set("accountNumber")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="si-bank">
              Bank or card issuer
            </label>
            <input id="si-bank" className={INPUT} value={form.bankName} onChange={set("bankName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="si-branch">
              Branch
            </label>
            <input id="si-branch" className={INPUT} value={form.branchName} onChange={set("branchName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="si-ifsc">
              IFSC
            </label>
            <input id="si-ifsc" className={INPUT} value={form.ifsc} onChange={set("ifsc")} />
            <p className={`mt-1 text-xs ${stateClass(ifsc.state)}`}>{ifsc.message}</p>
          </div>
          <div>
            <label className={LABEL} htmlFor="si-ref">
              {channel.refLabel}
            </label>
            <input
              id="si-ref"
              className={INPUT}
              value={form.mandateReference}
              onChange={set("mandateReference")}
            />
            {umrn ? <p className={`mt-1 text-xs ${stateClass(umrn.state)}`}>{umrn.message}</p> : null}
          </div>
          <div>
            <label className={LABEL} htmlFor="si-amount">
              Amount per debit (₹)
            </label>
            <input
              id="si-amount"
              className={INPUT}
              inputMode="decimal"
              value={form.amountInput}
              onChange={set("amountInput")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="si-frequency">
              Frequency
            </label>
            <select id="si-frequency" className={INPUT} value={form.frequency} onChange={set("frequency")}>
              {FREQUENCIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="si-biller">
              Company collecting the money
            </label>
            <input id="si-biller" className={INPUT} value={form.billerName} onChange={set("billerName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="si-phone">
              Phone
            </label>
            <input id="si-phone" className={INPUT} value={form.phone} onChange={set("phone")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="si-email">
              Email
            </label>
            <input id="si-email" className={INPUT} type="email" value={form.email} onChange={set("email")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="si-branch-address">
              Branch address
            </label>
            <textarea
              id="si-branch-address"
              rows={2}
              className={AREA}
              value={form.branchAddress}
              onChange={set("branchAddress")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="si-biller-address">
              Company address
            </label>
            <textarea
              id="si-biller-address"
              rows={2}
              className={AREA}
              value={form.billerAddress}
              onChange={set("billerAddress")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="si-reason">
              Reason for cancelling (optional)
            </label>
            <textarea id="si-reason" rows={2} className={AREA} value={form.reason} onChange={set("reason")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Letter to your bank</h2>
          <button
            type="button"
            className={PRIMARY_BTN}
            aria-label="Copy the letter to the bank"
            onClick={() => copy(documents.error ? "" : documents.bankLetter, "bank")}
          >
            {copied === "bank" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied === "bank" ? "Copied!" : "Copy bank letter"}
          </button>
        </div>
        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {error}
          </p>
        ) : (
          <>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">{documents.bankWordCount} words</p>
            <pre className="mt-3 max-h-[28rem] overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
              {documents.bankLetter}
            </pre>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Notice to the company collecting the money</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Send this on the same day. Cancelling only at the bank leaves the biller presenting
              debits, and cancelling only with the biller leaves the mandate live at the bank.
            </p>
          </div>
          <button
            type="button"
            className={GHOST_BTN}
            aria-label="Copy the notice to the biller"
            onClick={() => copy(documents.error ? "" : documents.billerNotice, "biller")}
          >
            {copied === "biller" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied === "biller" ? "Copied!" : "Copy notice"}
          </button>
        </div>
        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {error}
          </p>
        ) : (
          <>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">{documents.billerWordCount} words</p>
            <pre className="mt-3 max-h-[28rem] overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
              {documents.billerNotice}
            </pre>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal or financial advice. The UMRN and IFSC checks look at length
        and character pattern only — nothing is verified against NPCI or any bank, because this tool
        makes no network calls and everything runs in your browser. Notice periods differ by bank,
        AMC and merchant; the figure in the box is editable for exactly that reason.
      </p>
    </main>
  );
}
