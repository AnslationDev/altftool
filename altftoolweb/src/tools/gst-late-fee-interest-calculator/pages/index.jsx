"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

/**
 * Late fee is charged per day under CGST and an equal amount under SGST, so the
 * per-day figures below are the COMBINED (CGST + SGST) rates taxpayers actually
 * pay. Caps are the combined caps too.
 *
 * GSTR-9 is charged per day at 0.04% of turnover (0.02% CGST + 0.02% SGST) and
 * capped at 0.50% of turnover, rather than a flat rupee cap.
 */
const RETURNS = {
  "gstr-3b": {
    label: "GSTR-3B",
    note: "Monthly / quarterly summary return.",
    perDay: 50,
    perDayNil: 20,
    caps: [
      { id: "upto-1.5cr", label: "Turnover up to ₹1.5 crore", amount: 5000 },
      { id: "1.5-5cr", label: "Turnover ₹1.5 crore – ₹5 crore", amount: 10000 },
      { id: "above-5cr", label: "Turnover above ₹5 crore", amount: 10000 },
    ],
    nilCap: 500,
    chargesInterest: true,
  },
  "gstr-1": {
    label: "GSTR-1",
    note: "Outward supplies statement.",
    perDay: 50,
    perDayNil: 20,
    caps: [
      { id: "upto-1.5cr", label: "Turnover up to ₹1.5 crore", amount: 2000 },
      { id: "1.5-5cr", label: "Turnover ₹1.5 crore – ₹5 crore", amount: 5000 },
      { id: "above-5cr", label: "Turnover above ₹5 crore", amount: 10000 },
    ],
    nilCap: 500,
    // GSTR-1 carries no tax payment, so section 50 interest does not arise on it.
    chargesInterest: false,
  },
  "gstr-9": {
    label: "GSTR-9",
    note: "Annual return. Late fee and cap are turnover-linked percentages.",
    perDayPercentOfTurnover: 0.04,
    capPercentOfTurnover: 0.5,
    chargesInterest: false,
  },
};

/** Section 50(1): 18% a year on tax paid late. */
const INTEREST_RATE = 18;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) && value >= 0 ? value : 0;
};

/** Whole days between two ISO dates; 0 when the return is not actually late. */
function daysLate(dueDate, filingDate) {
  if (!dueDate || !filingDate) return 0;
  const due = new Date(`${dueDate}T00:00:00`);
  const filed = new Date(`${filingDate}T00:00:00`);
  if (Number.isNaN(due.getTime()) || Number.isNaN(filed.getTime())) return 0;
  const diff = Math.floor((filed - due) / 86400000);
  return diff > 0 ? diff : 0;
}

function compute({ returnType, isNil, turnover, taxDue, capId, days }) {
  const cfg = RETURNS[returnType];
  let lateFeeRaw = 0;
  let cap = Infinity;

  if (returnType === "gstr-9") {
    lateFeeRaw = days * (turnover * (cfg.perDayPercentOfTurnover / 100));
    cap = turnover * (cfg.capPercentOfTurnover / 100);
  } else if (isNil) {
    lateFeeRaw = days * cfg.perDayNil;
    cap = cfg.nilCap;
  } else {
    lateFeeRaw = days * cfg.perDay;
    cap = (cfg.caps.find((c) => c.id === capId) ?? cfg.caps[0]).amount;
  }

  const lateFee = Math.min(lateFeeRaw, cap);
  const capApplied = lateFeeRaw > cap;

  // Interest runs on the tax actually paid in cash, for the days of delay.
  const interest =
    cfg.chargesInterest && !isNil
      ? (taxDue * (INTEREST_RATE / 100) * days) / 365
      : 0;

  return { lateFee, lateFeeRaw, cap, capApplied, interest, total: lateFee + interest };
}

export default function GstLateFeeInterestCalculator() {
  const [returnType, setReturnType] = useState("gstr-3b");
  const [isNil, setIsNil] = useState(false);
  const [dueDate, setDueDate] = useState("2026-04-20");
  const [filingDate, setFilingDate] = useState("2026-05-15");
  const [turnover, setTurnover] = useState("8000000");
  const [taxDue, setTaxDue] = useState("120000");
  const [capId, setCapId] = useState("1.5-5cr");
  const [copied, setCopied] = useState(false);

  const cfg = RETURNS[returnType];
  const days = useMemo(() => daysLate(dueDate, filingDate), [dueDate, filingDate]);

  const result = useMemo(
    () =>
      compute({
        returnType,
        isNil,
        turnover: toNumber(turnover),
        taxDue: toNumber(taxDue),
        capId,
        days,
      }),
    [returnType, isNil, turnover, taxDue, capId, days],
  );

  const touch = (setter) => (value) => {
    setter(value);
    setCopied(false);
  };

  const reset = () => {
    setReturnType("gstr-3b");
    setIsNil(false);
    setDueDate("2026-04-20");
    setFilingDate("2026-05-15");
    setTurnover("8000000");
    setTaxDue("120000");
    setCapId("1.5-5cr");
    setCopied(false);
  };

  const copySummary = async () => {
    const lines = [
      `${cfg.label}${isNil ? " (nil return)" : ""}`,
      `Days late: ${days}`,
      `Late fee: ${money(result.lateFee)}${result.capApplied ? " (cap applied)" : ""}`,
      cfg.chargesInterest && !isNil
        ? `Interest @ ${INTEREST_RATE}%: ${money(result.interest)}`
        : "Interest: not applicable",
      `Total payable: ${money(result.total)}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the numbers are on screen anyway */
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-(--primary-text)">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          GST compliance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          GST Late Fee and Interest Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Late fee and section 50 interest on a delayed GSTR-1, GSTR-3B or GSTR-9, with the
          turnover-linked late fee caps applied.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-sm font-semibold">Return</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(RETURNS).map(([id, item]) => (
              <button
                key={id}
                type="button"
                onClick={() => touch(setReturnType)(id)}
                aria-pressed={returnType === id}
                className={`inline-flex min-h-11 items-center rounded-md border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)] ${
                  returnType === id
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{cfg.note}</p>
        </fieldset>

        {returnType !== "gstr-9" ? (
          <label className="mt-5 flex items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={isNil}
              onChange={(e) => touch(setIsNil)(e.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            This is a nil return (no outward supplies and no tax payable)
          </label>
        ) : null}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gst-due">
              Due date
            </label>
            <input
              id="gst-due"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={dueDate}
              onChange={(e) => touch(setDueDate)(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gst-filed">
              Actual filing date
            </label>
            <input
              id="gst-filed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={filingDate}
              onChange={(e) => touch(setFilingDate)(e.target.value)}
            />
          </div>

          {returnType === "gstr-9" ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="gst-turnover">
                Annual turnover (INR)
              </label>
              <input
                id="gst-turnover"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="100000"
                value={turnover}
                onChange={(e) => touch(setTurnover)(e.target.value)}
              />
            </div>
          ) : (
            !isNil && (
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor="gst-cap">
                  Turnover slab (sets the late fee cap)
                </label>
                <select
                  id="gst-cap"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={capId}
                  onChange={(e) => touch(setCapId)(e.target.value)}
                >
                  {cfg.caps.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} — cap {money(c.amount)}
                    </option>
                  ))}
                </select>
              </div>
            )
          )}

          {cfg.chargesInterest && !isNil ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="gst-tax">
                Tax paid late, in cash (INR)
              </label>
              <input
                id="gst-tax"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1000"
                value={taxDue}
                onChange={(e) => touch(setTaxDue)(e.target.value)}
              />
              <p className="mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]">
                Interest under section 50 runs on the cash portion only — tax settled from input
                tax credit does not attract it.
              </p>
            </div>
          ) : null}
        </div>

        <button type="button" onClick={reset} className={`mt-5 ${GHOST_BTN}`}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-sm font-semibold">
          {days > 0 ? `${days} day${days === 1 ? "" : "s"} late` : "Filed on time"}
        </h2>

        <p className="mt-2 text-4xl font-semibold text-(--primary-text)">{money(result.total)}</p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Total payable</p>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Late fee
            </dt>
            <dd className="mt-1 text-lg font-semibold">{money(result.lateFee)}</dd>
            {result.capApplied ? (
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                Capped — the uncapped fee would have been {money(result.lateFeeRaw)}.
              </p>
            ) : null}
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Interest @ {INTEREST_RATE}% p.a.
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {cfg.chargesInterest && !isNil ? money(result.interest) : "—"}
            </dd>
            {!cfg.chargesInterest ? (
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                No tax is paid through {cfg.label}, so section 50 interest does not arise.
              </p>
            ) : null}
          </div>
        </dl>

        <button type="button" onClick={copySummary} className={`mt-5 ${PRIMARY_BTN}`}>
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy summary"}
        </button>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Per-day rates and caps shown are the combined CGST + SGST amounts. Amnesty schemes and
        notification-based waivers are not applied — check the notification in force for your
        period before paying.
      </p>
    </main>
  );
}
