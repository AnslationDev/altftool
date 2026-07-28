"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Zap } from "lucide-react";

import {
  BILLING_COMPLAINT_TARGET_DAYS,
  COMPLAINT_TYPES,
  buildElectricityComplaintLetter,
  computeBillingDiscrepancy,
  escalationSteps,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");

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
  consumerName: "Rohan Sharma",
  consumerNumber: "1002345678",
  meterNumber: "MTR-99812",
  serviceAddress: "Flat 12, Park Residency, Shivajinagar, Pune 411005",
  discomName: "Maharashtra State Electricity Distribution Co. Ltd.",
  officeAddress: "Shivajinagar Section Office, Pune",
  billMonth: "June 2026",
  billNumber: "BL-77341",
  billDate: "2026-07-03",
  letterDate: "2026-07-10",
  complaintType: "inflated",
  previousReading: "12450",
  currentReading: "12800",
  billedUnits: "620",
  billAmount: "5580",
  averageUnits: "340",
  averageAmount: "2900",
  multiplier: "1",
  phone: "98xxxxxx01",
  email: "rohan@example.com",
  notes: "",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

const SEVERITY_COPY = {
  none: "In line with the meter — dispute rests on the reason you selected.",
  minor: "Small gap. Usually a reading-lag issue rather than an overcharge.",
  significant: "Material gap. Worth a written complaint and a meter test.",
  severe: "Large gap. Typical of an estimated bill or a defective meter.",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const discrepancy = useMemo(
    () =>
      computeBillingDiscrepancy({
        previousReading: toNumber(form.previousReading),
        currentReading: toNumber(form.currentReading),
        billedUnits: toNumber(form.billedUnits),
        billAmount: toNumber(form.billAmount),
        averageUnits: toNumber(form.averageUnits) || 0,
        averageAmount: toNumber(form.averageAmount) || 0,
        meterMultiplier: toNumber(form.multiplier),
      }),
    [
      form.previousReading,
      form.currentReading,
      form.billedUnits,
      form.billAmount,
      form.averageUnits,
      form.averageAmount,
      form.multiplier,
    ],
  );

  const letter = useMemo(
    () =>
      buildElectricityComplaintLetter({
        consumerName: form.consumerName,
        consumerNumber: form.consumerNumber,
        meterNumber: form.meterNumber,
        serviceAddress: form.serviceAddress,
        discomName: form.discomName,
        officeAddress: form.officeAddress,
        billMonth: form.billMonth,
        billNumber: form.billNumber,
        billDateISO: form.billDate,
        letterDateISO: form.letterDate,
        complaintTypeId: form.complaintType,
        previousReading: toNumber(form.previousReading),
        currentReading: toNumber(form.currentReading),
        phone: form.phone,
        email: form.email,
        extraNotes: form.notes,
        discrepancy,
      }),
    [form, discrepancy],
  );

  const steps = useMemo(() => escalationSteps(discrepancy.error ? 0 : discrepancy.billAmount), [discrepancy]);

  const error = discrepancy.error || letter.error || "";

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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Zap className="h-4 w-4" aria-hidden="true" />
          Electricity billing
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Consumer Complaint Letter for Electricity Billing
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your meter readings and the disputed bill. The tool works out how much of the demand
          the meter does not support and drafts a complaint that cites the Electricity Act, 2003
          escalation path.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Meter and bill figures</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="prev-reading">Previous meter reading</label>
            <input id="prev-reading" className={INPUT} type="number" inputMode="decimal" min="0"
              value={form.previousReading} onChange={set("previousReading")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="curr-reading">Current meter reading</label>
            <input id="curr-reading" className={INPUT} type="number" inputMode="decimal" min="0"
              value={form.currentReading} onChange={set("currentReading")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="billed-units">Units charged in the bill</label>
            <input id="billed-units" className={INPUT} type="number" inputMode="decimal" min="0"
              value={form.billedUnits} onChange={set("billedUnits")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bill-amount">Bill amount (INR)</label>
            <input id="bill-amount" className={INPUT} type="number" inputMode="decimal" min="0"
              value={form.billAmount} onChange={set("billAmount")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="avg-units">Your usual units per cycle</label>
            <input id="avg-units" className={INPUT} type="number" inputMode="decimal" min="0"
              value={form.averageUnits} onChange={set("averageUnits")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="avg-amount">Your usual bill (INR)</label>
            <input id="avg-amount" className={INPUT} type="number" inputMode="decimal" min="0"
              value={form.averageAmount} onChange={set("averageAmount")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="multiplier">Meter multiplying factor (MF)</label>
            <input id="multiplier" className={INPUT} type="number" inputMode="decimal" min="0.01" step="0.01"
              value={form.multiplier} onChange={set("multiplier")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="complaint-type">Ground of complaint</label>
            <select id="complaint-type" className={INPUT} value={form.complaintType} onChange={set("complaintType")}>
              {COMPLAINT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
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
              Amount the meter does not support
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? "—" : money(discrepancy.overcharge)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error ? "Fix the figures above to see the comparison." : SEVERITY_COPY[discrepancy.severity]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={GHOST_BTN} aria-label="Copy the billing comparison summary"
              onClick={() =>
                copy(
                  error
                    ? ""
                    : [
                        "Electricity billing dispute",
                        `Units recorded by meter: ${num(discrepancy.meteredUnits)}`,
                        `Units billed: ${num(discrepancy.billedUnits)}`,
                        `Effective rate: ${money(discrepancy.ratePerUnit)} per unit`,
                        `Amount justified by the meter: ${money(discrepancy.fairAmount)}`,
                        `Excess demanded: ${money(discrepancy.overcharge)}`,
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
            ["Units recorded by the meter", error ? "—" : num(discrepancy.meteredUnits)],
            ["Units charged in the bill", error ? "—" : num(discrepancy.billedUnits)],
            ["Gap between billed and metered units", error ? "—" : `${num(discrepancy.unitGap)} (${pct(discrepancy.unitGapPct)})`],
            ["Effective rate applied", error ? "—" : `${money(discrepancy.ratePerUnit)} per unit`],
            ["Amount justified by the meter", error ? "—" : money(discrepancy.fairAmount)],
            ["Against your usual consumption", error ? "—" : pct(discrepancy.vsAverageUnitsPct)],
            ["Against your usual bill amount", error ? "—" : pct(discrepancy.vsAverageAmountPct)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Consumer and connection details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="consumer-name">Your name</label>
            <input id="consumer-name" className={INPUT} value={form.consumerName} onChange={set("consumerName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="consumer-number">Consumer / service number</label>
            <input id="consumer-number" className={INPUT} value={form.consumerNumber} onChange={set("consumerNumber")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="meter-number">Meter number</label>
            <input id="meter-number" className={INPUT} value={form.meterNumber} onChange={set("meterNumber")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="discom">Distribution company (DISCOM)</label>
            <input id="discom" className={INPUT} value={form.discomName} onChange={set("discomName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="office-address">Section / divisional office</label>
            <input id="office-address" className={INPUT} value={form.officeAddress} onChange={set("officeAddress")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="service-address">Service address</label>
            <input id="service-address" className={INPUT} value={form.serviceAddress} onChange={set("serviceAddress")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bill-month">Billing month</label>
            <input id="bill-month" className={INPUT} value={form.billMonth} onChange={set("billMonth")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bill-number">Bill number</label>
            <input id="bill-number" className={INPUT} value={form.billNumber} onChange={set("billNumber")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bill-date">Bill date</label>
            <input id="bill-date" className={INPUT} type="date" value={form.billDate} onChange={set("billDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="letter-date">Letter date</label>
            <input id="letter-date" className={INPUT} type="date" value={form.letterDate} onChange={set("letterDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="phone">Phone</label>
            <input id="phone" className={INPUT} value={form.phone} onChange={set("phone")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="email">Email</label>
            <input id="email" className={INPUT} type="email" value={form.email} onChange={set("email")} />
          </div>
        </div>
        <div className="mt-4">
          <label className={LABEL} htmlFor="notes">Anything else the officer should know (optional)</label>
          <textarea id="notes" rows={3} className={AREA} value={form.notes} onChange={set("notes")}
            placeholder="Premises locked for the whole month, meter photograph taken on 30 June, no new appliance added..." />
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your complaint letter</h2>
          <button type="button" className={PRIMARY_BTN} aria-label="Copy the complaint letter"
            onClick={() => copy(letter.error ? "" : letter.body, "letter")}>
            {copied === "letter" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied === "letter" ? "Copied!" : "Copy letter"}
          </button>
        </div>
        {letter.error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {letter.error}
          </p>
        ) : (
          <>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              {letter.wordCount} words · reply requested by {letter.replyByLong || `${BILLING_COMPLAINT_TARGET_DAYS} days`}
            </p>
            <pre className="mt-3 max-h-[28rem] overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
              {letter.body}
            </pre>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">If they do not respond</h2>
        <ol className="mt-3 space-y-3 text-sm">
          {steps.map((step) => (
            <li key={step.stage}>
              <p className="font-semibold">{step.stage}</p>
              <p className="text-[var(--muted-foreground)]">{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Standards-of-Performance timelines, tariff slabs and
        interim-deposit rules are set by each State Electricity Regulatory Commission — check your
        state supply code, and consult a lawyer for a contested or high-value dispute.
      </p>
    </main>
  );
}
