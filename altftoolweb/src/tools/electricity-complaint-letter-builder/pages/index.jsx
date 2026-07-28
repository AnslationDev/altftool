"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Zap } from "lucide-react";

import {
  COMPLAINT_TYPES,
  SEC_56_LIMITATION_YEARS,
  SEC_56_NOTICE_CLEAR_DAYS,
  assessComplaint,
  buildElectricityComplaint,
  complaintTypeById,
  computeExpectedBill,
  formatINR,
  formatLongDate,
  formatNumber,
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
  consumerName: "Kavita Rao",
  consumerNumber: "150-3345-2211",
  meterNumber: "MTR-88214",
  connectionAddress: "H.No. 14, Gandhi Nagar, Hyderabad 500080",
  discomName: "TGSPDCL",
  subDivision: "Ameerpet",
  officeAddress: "Ameerpet, Hyderabad 500016",
  addressee: "",
  letterDate: "2026-07-28",
  billDate: "2026-07-10",
  billMonth: "July 2026",
  billedAmount: "5480",
  previousReading: "4520",
  currentReading: "4805",
  multiplyingFactor: "1",
  tariffPerUnit: "7.5",
  fixedCharge: "120",
  otherCharges: "45",
  averageMonthlyUnits: "240",
  complaintTypeId: "inflated-bill",
  complaintDetail: "",
  earlierComplaintRef: "CMP/2026/44120",
  earlierComplaintDate: "2026-07-15",
  arrearAmount: "2100",
  arrearFirstDue: "2023-05-10",
  disconnectionNoticeDate: "",
  phone: "90xxxxxx77",
  email: "kavita.rao@example.com",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const type = complaintTypeById(form.complaintTypeId);

  const expectedBill = useMemo(() => {
    if (!type.needsReadings) return null;
    return computeExpectedBill({
      previousReading: Number(form.previousReading),
      currentReading: Number(form.currentReading),
      multiplyingFactor: Number(form.multiplyingFactor),
      tariffPerUnit: Number(form.tariffPerUnit),
      fixedCharge: Number(form.fixedCharge),
      otherCharges: Number(form.otherCharges),
    });
  }, [
    type.needsReadings,
    form.previousReading,
    form.currentReading,
    form.multiplyingFactor,
    form.tariffPerUnit,
    form.fixedCharge,
    form.otherCharges,
  ]);

  const assessment = useMemo(
    () =>
      assessComplaint({
        billedAmount: Number(form.billedAmount),
        expectedBill,
        averageMonthlyUnits: Number(form.averageMonthlyUnits),
        letterDateISO: form.letterDate,
        billDateISO: form.billDate,
        arrearFirstDueISO: form.arrearFirstDue,
        disconnectionNoticeDateISO: form.disconnectionNoticeDate,
        complaintTypeId: form.complaintTypeId,
      }),
    [
      form.billedAmount,
      expectedBill,
      form.averageMonthlyUnits,
      form.letterDate,
      form.billDate,
      form.arrearFirstDue,
      form.disconnectionNoticeDate,
      form.complaintTypeId,
    ],
  );

  const letter = useMemo(
    () =>
      buildElectricityComplaint({
        consumerName: form.consumerName,
        consumerNumber: form.consumerNumber,
        meterNumber: form.meterNumber,
        connectionAddress: form.connectionAddress,
        discomName: form.discomName,
        subDivision: form.subDivision,
        officeAddress: form.officeAddress,
        addressee: form.addressee,
        letterDateISO: form.letterDate,
        billDateISO: form.billDate,
        billMonth: form.billMonth,
        billedAmount: Number(form.billedAmount),
        complaintTypeId: form.complaintTypeId,
        complaintDetail: form.complaintDetail,
        earlierComplaintRef: form.earlierComplaintRef,
        earlierComplaintDateISO: form.earlierComplaintDate,
        arrearAmount: Number(form.arrearAmount),
        arrearFirstDueISO: form.arrearFirstDue,
        disconnectionNoticeDateISO: form.disconnectionNoticeDate,
        phone: form.phone,
        email: form.email,
        expectedBill,
        assessment,
      }),
    [form, expectedBill, assessment],
  );

  const billError = expectedBill?.error || "";
  const error = billError || assessment.error || letter.error || "";

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
    : expectedBill && !expectedBill.error && assessment.excessBilled !== null
      ? formatINR(Math.abs(assessment.excessBilled))
      : type.label;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Zap className="h-4 w-4" aria-hidden="true" />
          Letter format
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Electricity Complaint Letter Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Recomputes the bill from your own meter readings, checks an old arrear against the
          two-year bar in section 56(2) of the Electricity Act, 2003, and counts the fifteen clear
          days a disconnection notice needs — then writes the complaint.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What is the complaint?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="ec-type">
              Complaint type
            </label>
            <select id="ec-type" className={INPUT} value={form.complaintTypeId} onChange={set("complaintTypeId")}>
              {COMPLAINT_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="ec-letter-date">
              Date of this letter
            </label>
            <input id="ec-letter-date" className={INPUT} type="date" value={form.letterDate} onChange={set("letterDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ec-bill-date">
              Date on the bill
            </label>
            <input id="ec-bill-date" className={INPUT} type="date" value={form.billDate} onChange={set("billDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ec-bill-month">
              Billing month
            </label>
            <input id="ec-bill-month" className={INPUT} value={form.billMonth} onChange={set("billMonth")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ec-billed">
              Amount the bill demands
            </label>
            <input id="ec-billed" className={INPUT} type="number" inputMode="decimal" min="0" step="1" value={form.billedAmount} onChange={set("billedAmount")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="ec-detail">
              Describe the problem in your own words (optional)
            </label>
            <textarea id="ec-detail" rows={3} className={AREA} value={form.complaintDetail} onChange={set("complaintDetail")} placeholder="The bill for July shows 285 units against my usual 240, and the meter reader did not visit the premises this cycle." />
          </div>
        </div>
      </section>

      {type.needsReadings ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Recompute the bill from the meter</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Units = (current reading − previous reading) × multiplying factor. Use the average
            per-unit rate from your tariff order; slabs and duties differ by state.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="ec-prev">
                Previous meter reading
              </label>
              <input id="ec-prev" className={INPUT} type="number" inputMode="decimal" min="0" step="1" value={form.previousReading} onChange={set("previousReading")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="ec-curr">
                Current meter reading
              </label>
              <input id="ec-curr" className={INPUT} type="number" inputMode="decimal" min="0" step="1" value={form.currentReading} onChange={set("currentReading")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="ec-mf">
                Multiplying factor (1 on a domestic meter)
              </label>
              <input id="ec-mf" className={INPUT} type="number" inputMode="decimal" min="0" step="1" value={form.multiplyingFactor} onChange={set("multiplyingFactor")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="ec-tariff">
                Average tariff per unit
              </label>
              <input id="ec-tariff" className={INPUT} type="number" inputMode="decimal" min="0" step="0.1" value={form.tariffPerUnit} onChange={set("tariffPerUnit")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="ec-fixed">
                Fixed charges
              </label>
              <input id="ec-fixed" className={INPUT} type="number" inputMode="decimal" min="0" step="10" value={form.fixedCharge} onChange={set("fixedCharge")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="ec-other">
                Duty and other charges
              </label>
              <input id="ec-other" className={INPUT} type="number" inputMode="decimal" min="0" step="10" value={form.otherCharges} onChange={set("otherCharges")} />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL} htmlFor="ec-average">
                Your usual monthly consumption (units)
              </label>
              <input id="ec-average" className={INPUT} type="number" inputMode="decimal" min="0" step="1" value={form.averageMonthlyUnits} onChange={set("averageMonthlyUnits")} />
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Arrears and disconnection (optional)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="ec-arrear-amount">
              Arrear shown on the bill
            </label>
            <input id="ec-arrear-amount" className={INPUT} type="number" inputMode="decimal" min="0" step="1" value={form.arrearAmount} onChange={set("arrearAmount")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ec-arrear-due">
              Date the arrear first became due
            </label>
            <input id="ec-arrear-due" className={INPUT} type="date" value={form.arrearFirstDue} onChange={set("arrearFirstDue")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ec-disc-date">
              Date on the disconnection notice
            </label>
            <input id="ec-disc-date" className={INPUT} type="date" value={form.disconnectionNoticeDate} onChange={set("disconnectionNoticeDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ec-earlier-ref">
              Earlier complaint reference
            </label>
            <input id="ec-earlier-ref" className={INPUT} value={form.earlierComplaintRef} onChange={set("earlierComplaintRef")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ec-earlier-date">
              Date of that earlier complaint
            </label>
            <input id="ec-earlier-date" className={INPUT} type="date" value={form.earlierComplaintDate} onChange={set("earlierComplaintDate")} />
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
              {expectedBill && !expectedBill.error && assessment.excessBilled < 0
                ? "Short-billed by"
                : "Excess demanded over your working"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the readings and dates above."
                : expectedBill && !expectedBill.error
                  ? `Your working gives ${formatINR(expectedBill.total)} for ${formatNumber(expectedBill.units)} units; the bill demands ${formatINR(Number(form.billedAmount))}.`
                  : "This complaint does not turn on meter readings — the letter states the grievance and the relief asked for."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={GHOST_BTN}
              aria-label="Copy the electricity complaint summary"
              onClick={() =>
                copy(
                  error
                    ? ""
                    : [
                        "Electricity complaint",
                        `Type: ${type.label}`,
                        `Consumer number: ${form.consumerNumber}`,
                        expectedBill && !expectedBill.error
                          ? `Units on my working: ${formatNumber(expectedBill.units)} — total ${formatINR(expectedBill.total)}`
                          : "No meter working attached",
                        `Amount demanded: ${formatINR(Number(form.billedAmount))}`,
                        assessment.arrear
                          ? `Arrear first due ${formatLongDate(form.arrearFirstDue)} — two-year bar date ${formatLongDate(assessment.arrear.barDateISO)}`
                          : "No arrear entered",
                        assessment.disconnection
                          ? `Earliest lawful disconnection: ${formatLongDate(assessment.disconnection.earliestISO)}`
                          : "No disconnection notice entered",
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
            [
              "Units on your own working",
              error || !expectedBill || expectedBill.error ? DASH : `${formatNumber(expectedBill.units)} kWh`,
            ],
            [
              "Total on your own working",
              error || !expectedBill || expectedBill.error ? DASH : formatINR(expectedBill.total),
            ],
            [
              "Consumption against your usual month",
              error || assessment.unitsVsAverage === null ? DASH : `${formatNumber(assessment.unitsVsAverage)}%`,
            ],
            [
              `Two-year bar on the arrear (s.56(2), ${SEC_56_LIMITATION_YEARS} years)`,
              error || !assessment.arrear
                ? DASH
                : `${formatLongDate(assessment.arrear.barDateISO)}${assessment.arrear.beyondTwoYears ? ` — passed ${plural(assessment.arrear.daysPastBar, "day")} ago` : " — not yet reached"}`,
            ],
            [
              `Earliest lawful disconnection (s.56(1), ${SEC_56_NOTICE_CLEAR_DAYS} clear days)`,
              error || !assessment.disconnection
                ? DASH
                : `${formatLongDate(assessment.disconnection.earliestISO)}${assessment.disconnection.alreadyPast ? " — already passed" : ` — ${plural(assessment.disconnection.daysLeft, "day")} away`}`,
            ],
            ["Age of the bill", error || assessment.billAgeDays === null ? DASH : plural(assessment.billAgeDays, "day")],
            ["Addressed to", error ? DASH : form.addressee.trim() || type.addressee],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Consumer and office details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="ec-name">
              Your name (as on the bill)
            </label>
            <input id="ec-name" className={INPUT} value={form.consumerName} onChange={set("consumerName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ec-consumer">
              Consumer number
            </label>
            <input id="ec-consumer" className={INPUT} value={form.consumerNumber} onChange={set("consumerNumber")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ec-meter">
              Meter number
            </label>
            <input id="ec-meter" className={INPUT} value={form.meterNumber} onChange={set("meterNumber")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ec-discom">
              Distribution company
            </label>
            <input id="ec-discom" className={INPUT} value={form.discomName} onChange={set("discomName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ec-subdivision">
              Sub-division
            </label>
            <input id="ec-subdivision" className={INPUT} value={form.subDivision} onChange={set("subDivision")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ec-addressee">
              Addressed to (default: {type.addressee})
            </label>
            <input id="ec-addressee" className={INPUT} value={form.addressee} onChange={set("addressee")} placeholder={type.addressee} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ec-phone">
              Phone
            </label>
            <input id="ec-phone" className={INPUT} value={form.phone} onChange={set("phone")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ec-email">
              Email
            </label>
            <input id="ec-email" className={INPUT} type="email" value={form.email} onChange={set("email")} />
          </div>
        </div>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL} htmlFor="ec-connection-address">
              Address of the connection
            </label>
            <textarea id="ec-connection-address" rows={2} className={AREA} value={form.connectionAddress} onChange={set("connectionAddress")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ec-office-address">
              Address of the office
            </label>
            <textarea id="ec-office-address" rows={2} className={AREA} value={form.officeAddress} onChange={set("officeAddress")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your complaint letter</h2>
          <button
            type="button"
            className={PRIMARY_BTN}
            aria-label="Copy the electricity complaint letter"
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
        Informational only, not legal advice. Tariff slabs, duties and standards of performance are
        fixed by your State Electricity Regulatory Commission, so treat the recomputed total as an
        estimate. If the licensee&apos;s grievance forum does not resolve the complaint, section
        42(6) of the Electricity Act, 2003 lets you approach the Ombudsman.
      </p>
    </main>
  );
}
