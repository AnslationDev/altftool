"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MapPin, RotateCcw } from "lucide-react";

import {
  OVD_UPDATE_MONTHS,
  RECIPIENTS,
  RTO_INTIMATION_DAYS,
  UTILITY_BILL_MAX_AGE_MONTHS,
  assessAddressChange,
  buildAddressChangeLetter,
  formatLongDate,
  plural,
  recipientById,
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
  senderName: "Rohit Menon",
  recipientId: "bank",
  organisationName: "ICICI Bank",
  branchOrOffice: "Baner Branch",
  organisationAddress: "Baner Road, Pune, Maharashtra 411045",
  addressee: "",
  referenceNumber: "002401512345",
  oldAddress: "12, Shanti Nagar, Kothrud, Pune 411038",
  newAddress: "B-704, Riverdale Heights, Baner, Pune 411045",
  moveDate: "2026-07-01",
  letterDate: "2026-07-28",
  proofDocument: "Electricity bill for the new address",
  proofBillDate: "2026-07-05",
  phone: "97xxxxxx33",
  email: "rohit.menon@example.com",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const recipient = recipientById(form.recipientId);

  const assessment = useMemo(
    () =>
      assessAddressChange({
        moveDateISO: form.moveDate,
        letterDateISO: form.letterDate,
        proofBillDateISO: form.proofBillDate,
      }),
    [form.moveDate, form.letterDate, form.proofBillDate],
  );

  const letter = useMemo(
    () =>
      buildAddressChangeLetter({
        senderName: form.senderName,
        recipientId: form.recipientId,
        organisationName: form.organisationName,
        branchOrOffice: form.branchOrOffice,
        organisationAddress: form.organisationAddress,
        addressee: form.addressee,
        referenceNumber: form.referenceNumber,
        oldAddress: form.oldAddress,
        newAddress: form.newAddress,
        moveDateISO: form.moveDate,
        letterDateISO: form.letterDate,
        proofDocument: form.proofDocument,
        proofBillDateISO: form.proofBillDate,
        phone: form.phone,
        email: form.email,
        assessment,
      }),
    [form, assessment],
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
    setCopied("");
  };

  const headlineValue = error
    ? DASH
    : assessment.movedAlready
      ? plural(assessment.daysSinceMove, "day")
      : `in ${plural(assessment.daysSinceMove, "day")}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          Letter format
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Address Change Request Letter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick who you are writing to and the tool changes the addressee, the reference number it
          asks for and the list of accepted address proofs — then checks the RTO&apos;s{" "}
          {RTO_INTIMATION_DAYS}-day deadline and whether your utility bill is still fresh enough to
          be used as proof.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Who and when</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="ac-recipient">
              Writing to
            </label>
            <select id="ac-recipient" className={INPUT} value={form.recipientId} onChange={set("recipientId")}>
              {RECIPIENTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="ac-move-date">
              Date you moved (or will move)
            </label>
            <input id="ac-move-date" className={INPUT} type="date" value={form.moveDate} onChange={set("moveDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ac-letter-date">
              Date of this letter
            </label>
            <input id="ac-letter-date" className={INPUT} type="date" value={form.letterDate} onChange={set("letterDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ac-proof-doc">
              Proof of address you are enclosing
            </label>
            <input id="ac-proof-doc" className={INPUT} value={form.proofDocument} onChange={set("proofDocument")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ac-proof-date">
              Date on that document
            </label>
            <input id="ac-proof-date" className={INPUT} type="date" value={form.proofBillDate} onChange={set("proofBillDate")} />
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
              {error ? "Time since the move" : assessment.movedAlready ? "Time since the move" : "Time until the move"}
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">{headlineValue}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the dates above."
                : recipient.isRto
                  ? assessment.rtoOverdue
                    ? `Past the ${RTO_INTIMATION_DAYS}-day deadline in section 49 of the Motor Vehicles Act by ${plural(assessment.rtoOverdueBy, "day")}.`
                    : `${plural(assessment.rtoDaysLeft, "day")} left before the section 49 deadline.`
                  : "Notify the bank, school, employer and utilities as soon as the move is fixed."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={GHOST_BTN}
              aria-label="Copy the address change timing summary"
              onClick={() =>
                copy(
                  error
                    ? ""
                    : [
                        "Address change request",
                        `Writing to: ${recipient.label}`,
                        `Move date: ${formatLongDate(form.moveDate)}`,
                        `Letter dated: ${formatLongDate(form.letterDate)}`,
                        `RTO section 49 deadline: ${formatLongDate(assessment.rtoDeadlineISO)}`,
                        assessment.billValidUntilISO
                          ? `Address proof usable until: ${formatLongDate(assessment.billValidUntilISO)}`
                          : "No dated address proof entered",
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
          {[
            [`RTO intimation due (${RTO_INTIMATION_DAYS} days from the move)`, error ? DASH : formatLongDate(assessment.rtoDeadlineISO)],
            [
              "Address proof age",
              error ? DASH : assessment.billAgeDays === null ? "No dated document entered" : plural(assessment.billAgeDays, "day"),
            ],
            [
              `Usable as proof until (${UTILITY_BILL_MAX_AGE_MONTHS} months)`,
              error ? DASH : assessment.billValidUntilISO ? formatLongDate(assessment.billValidUntilISO) : "Not applicable",
            ],
            [
              "Still within the two-month rule",
              error ? DASH : assessment.billAcceptable === null ? "Not applicable" : assessment.billAcceptable ? "Yes" : "No — get a newer bill",
            ],
            [
              recipient.kycRule ? `Updated OVD due by (${OVD_UPDATE_MONTHS} months)` : "KYC re-submission rule",
              error ? DASH : recipient.kycRule ? formatLongDate(assessment.ovdDueISO) : "Not applicable to this recipient",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 rounded-md bg-[var(--muted)] px-3 py-3 text-xs leading-5 text-[var(--muted-foreground)]">
          <p className="font-semibold text-[var(--foreground)]">
            Documents {recipient.label.toLowerCase()} usually accept
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {recipient.proofs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your details and the addresses</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="ac-name">
              Your full name
            </label>
            <input id="ac-name" className={INPUT} value={form.senderName} onChange={set("senderName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ac-ref">
              {recipient.refLabel}
            </label>
            <input id="ac-ref" className={INPUT} value={form.referenceNumber} onChange={set("referenceNumber")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ac-org">
              {recipient.orgLabel}
            </label>
            <input id="ac-org" className={INPUT} value={form.organisationName} onChange={set("organisationName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ac-branch">
              Branch or office (optional)
            </label>
            <input id="ac-branch" className={INPUT} value={form.branchOrOffice} onChange={set("branchOrOffice")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ac-addressee">
              Addressed to (default: {recipient.addressee})
            </label>
            <input id="ac-addressee" className={INPUT} value={form.addressee} onChange={set("addressee")} placeholder={recipient.addressee} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ac-phone">
              Phone
            </label>
            <input id="ac-phone" className={INPUT} value={form.phone} onChange={set("phone")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="ac-email">
              Email
            </label>
            <input id="ac-email" className={INPUT} type="email" value={form.email} onChange={set("email")} />
          </div>
        </div>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL} htmlFor="ac-org-address">
              Address of the office you are writing to
            </label>
            <textarea id="ac-org-address" rows={2} className={AREA} value={form.organisationAddress} onChange={set("organisationAddress")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ac-old-address">
              Old address
            </label>
            <textarea id="ac-old-address" rows={2} className={AREA} value={form.oldAddress} onChange={set("oldAddress")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ac-new-address">
              New address
            </label>
            <textarea id="ac-new-address" rows={2} className={AREA} value={form.newAddress} onChange={set("newAddress")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your address change letter</h2>
          <button
            type="button"
            className={PRIMARY_BTN}
            aria-label="Copy the address change request letter"
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
        Informational only, not legal advice. Every bank, board and RTO adds its own form and fee on
        top of the rules cited here. Aadhaar, PAN and electoral roll addresses are updated through
        their own online portals rather than by letter.
      </p>
    </main>
  );
}
