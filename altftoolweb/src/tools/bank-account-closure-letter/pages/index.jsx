"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import {
  ACCOUNT_TYPES,
  CLOSURE_REASONS,
  DEA_FUND_TRANSFER_YEARS,
  ENCLOSURE_ITEMS,
  FEE_BAND,
  FREE_CLOSURE_AFTER_MONTHS,
  FREE_CLOSURE_COOLING_DAYS,
  INOPERATIVE_AFTER_YEARS,
  MAX_CLOSURE_CHARGE,
  assessClosure,
  buildClosureLetter,
  formatAccountAge,
  formatINR,
  formatLongDate,
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

const PAYOUT_MODES = [
  ["neft", "NEFT to another account"],
  ["cheque", "Banker's cheque / demand draft"],
  ["cash", "Cash at the counter"],
];

const DEFAULT_ENCLOSURES = ["cheque", "debit-card", "passbook", "closure-form", "nef"];

const DEFAULTS = {
  holderName: "Meera Iyer",
  jointHolderNames: "",
  accountNumber: "50100234567890",
  accountTypeId: "savings",
  customerId: "CID-99201",
  bankName: "HDFC Bank",
  branchName: "Koramangala",
  branchAddress: "80 Feet Road, Koramangala, Bengaluru 560095",
  addressee: "The Branch Manager",
  reasonId: "consolidate",
  reasonDetail: "",
  openingDate: "2018-03-15",
  lastTransaction: "2026-06-30",
  closureDate: "2026-07-28",
  closureCharge: "500",
  balanceAmount: "12480.50",
  payoutMode: "neft",
  destinationBank: "State Bank of India",
  destinationAccount: "30012345678",
  destinationIfsc: "SBIN0001234",
  destinationHolder: "Meera Iyer",
  registeredPhone: "98xxxxxx14",
  registeredEmail: "meera.iyer@example.com",
  postalAddress: "Flat 402, Palm Grove, Bengaluru 560034",
};

const BAND_COPY = {
  [FEE_BAND.COOLING]: `Within the ${FREE_CLOSURE_COOLING_DAYS}-day window — no closure charge is normally levied.`,
  [FEE_BAND.CHARGEABLE]: `Between ${FREE_CLOSURE_COOLING_DAYS} days and ${FREE_CLOSURE_AFTER_MONTHS} months — a closure charge may apply.`,
  [FEE_BAND.MATURE]: `Past ${FREE_CLOSURE_AFTER_MONTHS} months — closure is normally free of charge.`,
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [enclosures, setEnclosures] = useState(DEFAULT_ENCLOSURES);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const toggleEnclosure = (id) =>
    setEnclosures((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const assessment = useMemo(
    () =>
      assessClosure({
        openingDateISO: form.openingDate,
        closureDateISO: form.closureDate,
        closureCharge: Number(form.closureCharge),
        lastTransactionISO: form.lastTransaction,
      }),
    [form.openingDate, form.closureDate, form.closureCharge, form.lastTransaction],
  );

  const letter = useMemo(
    () =>
      buildClosureLetter({
        holderName: form.holderName,
        jointHolderNames: form.jointHolderNames,
        accountNumber: form.accountNumber,
        accountTypeId: form.accountTypeId,
        customerId: form.customerId,
        branchName: form.branchName,
        bankName: form.bankName,
        branchAddress: form.branchAddress,
        addressee: form.addressee,
        reasonId: form.reasonId,
        reasonDetail: form.reasonDetail,
        closureDateISO: form.closureDate,
        balanceAmount: Number(form.balanceAmount),
        destinationBank: form.destinationBank,
        destinationAccount: form.destinationAccount,
        destinationIfsc: form.destinationIfsc,
        destinationHolder: form.destinationHolder,
        payoutMode: form.payoutMode,
        enclosureIds: enclosures,
        registeredPhone: form.registeredPhone,
        registeredEmail: form.registeredEmail,
        postalAddress: form.postalAddress,
        assessment,
      }),
    [form, enclosures, assessment],
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
    setEnclosures(DEFAULT_ENCLOSURES);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Letter format
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Bank Account Closure Letter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the account details and where the closing balance should go. The tool works out
          which closure-charge band your account falls in, then writes the request with the
          enclosures and confirmations branches ask for.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Account and timing</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="bc-type">
              Account type
            </label>
            <select id="bc-type" className={INPUT} value={form.accountTypeId} onChange={set("accountTypeId")}>
              {ACCOUNT_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="bc-reason">
              Why are you closing it?
            </label>
            <select id="bc-reason" className={INPUT} value={form.reasonId} onChange={set("reasonId")}>
              {CLOSURE_REASONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="bc-opening">
              Account opening date
            </label>
            <input id="bc-opening" className={INPUT} type="date" value={form.openingDate} onChange={set("openingDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bc-closure-date">
              Date of this request
            </label>
            <input id="bc-closure-date" className={INPUT} type="date" value={form.closureDate} onChange={set("closureDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bc-last-txn">
              Last customer transaction
            </label>
            <input id="bc-last-txn" className={INPUT} type="date" value={form.lastTransaction} onChange={set("lastTransaction")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bc-charge">
              Bank&apos;s closure charge (0 to {MAX_CLOSURE_CHARGE})
            </label>
            <input
              id="bc-charge"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max={MAX_CLOSURE_CHARGE}
              step="50"
              value={form.closureCharge}
              onChange={set("closureCharge")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="bc-balance">
              Closing balance
            </label>
            <input
              id="bc-balance"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={form.balanceAmount}
              onChange={set("balanceAmount")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="bc-payout">
              Pay the balance by
            </label>
            <select id="bc-payout" className={INPUT} value={form.payoutMode} onChange={set("payoutMode")}>
              {PAYOUT_MODES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="bc-reason-detail">
              {form.reasonId === "other" ? "Describe the reason" : "Anything to add (optional)"}
            </label>
            <textarea id="bc-reason-detail" rows={2} className={AREA} value={form.reasonDetail} onChange={set("reasonDetail")} />
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
              Closure charge you should expect
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? DASH : formatINR(assessment.expectedCharge)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error ? "Fix the dates above." : BAND_COPY[assessment.band]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={GHOST_BTN}
              aria-label="Copy the account closure summary"
              onClick={() =>
                copy(
                  error
                    ? ""
                    : [
                        "Bank account closure request",
                        `Account age on closure date: ${formatAccountAge(assessment.ageMonths)} (${assessment.ageDays} days)`,
                        `Closure charge band: ${BAND_COPY[assessment.band]}`,
                        `Expected closure charge: ${formatINR(assessment.expectedCharge)}`,
                        `Closing balance: ${formatINR(Number(form.balanceAmount))}`,
                        `Request dated: ${formatLongDate(form.closureDate)}`,
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
            ["Account age on the closure date", error ? DASH : `${formatAccountAge(assessment.ageMonths)} (${assessment.ageDays} days)`],
            [`Free-closure window ends`, error ? DASH : formatLongDate(assessment.freeUntilISO)],
            [`Charge window ends (${FREE_CLOSURE_AFTER_MONTHS} months)`, error ? DASH : formatLongDate(assessment.chargeEndsISO)],
            ["Closing balance to be transferred", error ? DASH : formatINR(Number(form.balanceAmount))],
            [`Would turn inoperative (${INOPERATIVE_AFTER_YEARS} years idle)`, error ? DASH : formatLongDate(assessment.inoperativeOnISO)],
            [`Would go to the DEA Fund (${DEA_FUND_TRANSFER_YEARS} years idle)`, error ? DASH : formatLongDate(assessment.deaFundOnISO)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What you are handing in</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Tick what goes with the letter — each ticked item is listed as an enclosure.
        </p>
        <div className="mt-4 grid gap-3">
          {ENCLOSURE_ITEMS.map((item) => (
            <label
              key={item.id}
              htmlFor={`bc-enc-${item.id}`}
              className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <input
                id={`bc-enc-${item.id}`}
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={enclosures.includes(item.id)}
                onChange={() => toggleEnclosure(item.id)}
              />
              <span>
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="block text-xs text-[var(--muted-foreground)]">{item.detail}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your details and the branch</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="bc-holder">
              Account holder name
            </label>
            <input id="bc-holder" className={INPUT} value={form.holderName} onChange={set("holderName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bc-joint">
              Joint holder names (optional)
            </label>
            <input id="bc-joint" className={INPUT} value={form.jointHolderNames} onChange={set("jointHolderNames")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bc-account">
              Account number
            </label>
            <input id="bc-account" className={INPUT} value={form.accountNumber} onChange={set("accountNumber")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bc-cid">
              Customer ID (optional)
            </label>
            <input id="bc-cid" className={INPUT} value={form.customerId} onChange={set("customerId")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bc-bank">
              Bank name
            </label>
            <input id="bc-bank" className={INPUT} value={form.bankName} onChange={set("bankName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bc-branch">
              Branch name
            </label>
            <input id="bc-branch" className={INPUT} value={form.branchName} onChange={set("branchName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bc-addressee">
              Addressed to
            </label>
            <input id="bc-addressee" className={INPUT} value={form.addressee} onChange={set("addressee")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bc-phone">
              Registered mobile
            </label>
            <input id="bc-phone" className={INPUT} value={form.registeredPhone} onChange={set("registeredPhone")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="bc-email">
              Registered email
            </label>
            <input id="bc-email" className={INPUT} type="email" value={form.registeredEmail} onChange={set("registeredEmail")} />
          </div>
        </div>
        <div className="mt-4">
          <label className={LABEL} htmlFor="bc-branch-address">
            Branch address
          </label>
          <textarea id="bc-branch-address" rows={2} className={AREA} value={form.branchAddress} onChange={set("branchAddress")} />
        </div>
        <div className="mt-4">
          <label className={LABEL} htmlFor="bc-postal">
            Your postal address
          </label>
          <textarea id="bc-postal" rows={2} className={AREA} value={form.postalAddress} onChange={set("postalAddress")} />
        </div>
      </section>

      {form.payoutMode === "neft" ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Where the balance should go</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="bc-dest-holder">
                Destination account holder
              </label>
              <input id="bc-dest-holder" className={INPUT} value={form.destinationHolder} onChange={set("destinationHolder")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="bc-dest-bank">
                Destination bank
              </label>
              <input id="bc-dest-bank" className={INPUT} value={form.destinationBank} onChange={set("destinationBank")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="bc-dest-account">
                Destination account number
              </label>
              <input id="bc-dest-account" className={INPUT} value={form.destinationAccount} onChange={set("destinationAccount")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="bc-dest-ifsc">
                Destination IFSC
              </label>
              <input id="bc-dest-ifsc" className={INPUT} value={form.destinationIfsc} onChange={set("destinationIfsc")} />
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your closure letter</h2>
          <button
            type="button"
            className={PRIMARY_BTN}
            aria-label="Copy the bank account closure letter"
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
        Informational only, not financial advice. Every bank publishes its own schedule of charges
        and closure form, and a joint account needs every holder&apos;s signature. Nothing you type
        here leaves your browser — still, avoid sharing a full account number when you do not have
        to.
      </p>
    </main>
  );
}
