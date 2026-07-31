"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileClock, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const RATE = 0.01; // Section 234A — 1% per month, simple
const FEE_HIGH = 5000;
const FEE_LOW = 1000;
const FEE_LOW_INCOME_LIMIT = 500000;

/**
 * The assessment year always starts in the same calendar year as the Section 139(1) due date
 * (e.g. a due date of 31 Jul 2025 falls in AY 2025-26 / FY 2024-25). The AY is therefore derived
 * from the due date rather than picked separately, so the two inputs can never disagree.
 */
const ayLabel = (ayStartYear) => {
  const fyEndShort = String(ayStartYear % 100).padStart(2, "0");
  const ayEndShort = String((ayStartYear + 1) % 100).padStart(2, "0");
  return `AY ${ayStartYear}-${ayEndShort} (FY ${ayStartYear - 1}-${fyEndShort})`;
};

const DEFAULTS = {
  dueDate: "2025-07-31",
  filingDate: "2025-11-15",
  totalIncome: "900000",
  totalTax: "85000",
  taxPaid: "40000",
  notMandatory: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const parseDate = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) ? Date.parse(`${value}T00:00:00Z`) : NaN;

const roundDown100 = (value) => (value > 0 ? Math.floor(value / 100) * 100 : 0);

/** Any part of a month counts as a full month, measured from the due date. */
function monthsBetween(fromTs, toTs) {
  if (!(toTs > fromTs)) return 0;
  const from = new Date(fromTs);
  const to = new Date(toTs);
  const months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (to.getUTCMonth() - from.getUTCMonth()) +
    (to.getUTCDate() > from.getUTCDate() ? 1 : 0);
  return Math.max(1, months);
}

/**
 * Section 234F: ₹5,000 late fee, reduced to ₹1,000 where total income does not exceed ₹5,00,000.
 * Section 234A: 1% per month simple interest on unpaid tax from the day after the due date to
 * the date of filing. After 31 December of the assessment year only an updated return under
 * Section 139(8A) is possible, which carries additional tax of 25/50/60/70% of tax plus interest.
 */
function computeLateFiling(input) {
  const { dueTs, filingTs, totalIncome, totalTax, taxPaid, notMandatory } = input;

  const isLate = filingTs > dueTs;
  const months = monthsBetween(dueTs, filingTs);
  const days = isLate ? Math.round((filingTs - dueTs) / 86400000) : 0;

  const unpaidTax = Math.max(0, totalTax - taxPaid);
  const interest234A = isLate ? roundDown100(unpaidTax) * RATE * months : 0;

  let fee234F = 0;
  if (isLate && !notMandatory) {
    fee234F = totalIncome <= FEE_LOW_INCOME_LIMIT ? FEE_LOW : FEE_HIGH;
  }

  // The assessment year is derived from the due date's own calendar year (never picked
  // separately) so it can never disagree with the due date used everywhere else below.
  const ayStartYear = new Date(dueTs).getUTCFullYear();
  const belatedDeadline = Date.UTC(ayStartYear, 11, 31); // 31 Dec of the assessment year
  const ayEnd = Date.UTC(ayStartYear + 1, 2, 31); // 31 Mar, end of the assessment year
  const belatedWindowOpen = filingTs <= belatedDeadline;

  let updatedReturn = null;
  if (!belatedWindowOpen) {
    const monthsFromAyEnd = filingTs <= ayEnd ? 1 : monthsBetween(ayEnd, filingTs);
    const percent =
      monthsFromAyEnd <= 12
        ? 25
        : monthsFromAyEnd <= 24
          ? 50
          : monthsFromAyEnd <= 36
            ? 60
            : monthsFromAyEnd <= 48
              ? 70
              : null;
    updatedReturn = {
      monthsFromAyEnd,
      percent,
      additionalTax: percent === null ? 0 : (unpaidTax + interest234A) * (percent / 100),
      closed: percent === null,
    };
  }

  const totalPayable =
    unpaidTax + interest234A + fee234F + (updatedReturn ? updatedReturn.additionalTax : 0);

  return {
    isLate,
    days,
    months,
    unpaidTax,
    interest234A,
    fee234F,
    ayStartYear,
    belatedWindowOpen,
    belatedDeadline,
    updatedReturn,
    totalPayable,
    extraCost: interest234A + fee234F + (updatedReturn ? updatedReturn.additionalTax : 0),
  };
}

const formatDate = (ts) =>
  new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

export default function ToolHome() {
  const [dueDate, setDueDate] = useState(DEFAULTS.dueDate);
  const [filingDate, setFilingDate] = useState(DEFAULTS.filingDate);
  const [totalIncome, setTotalIncome] = useState(DEFAULTS.totalIncome);
  const [totalTax, setTotalTax] = useState(DEFAULTS.totalTax);
  const [taxPaid, setTaxPaid] = useState(DEFAULTS.taxPaid);
  const [notMandatory, setNotMandatory] = useState(DEFAULTS.notMandatory);
  const [copied, setCopied] = useState(false);

  const derivedAyStartYear = useMemo(() => {
    const dueTs = parseDate(dueDate);
    return Number.isNaN(dueTs) ? null : new Date(dueTs).getUTCFullYear();
  }, [dueDate]);

  const result = useMemo(() => {
    const income = toNumber(totalIncome);
    const tax = toNumber(totalTax);
    const paid = toNumber(taxPaid);
    const dueTs = parseDate(dueDate);
    const filingTs = parseDate(filingDate);

    if ([income, tax, paid].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every amount field." };
    }
    if (income < 0 || tax < 0 || paid < 0) {
      return { error: "Amounts cannot be negative." };
    }
    if (Number.isNaN(dueTs) || Number.isNaN(filingTs)) {
      return { error: "Enter a valid due date and filing date." };
    }

    return computeLateFiling({
      dueTs,
      filingTs,
      totalIncome: income,
      totalTax: tax,
      taxPaid: paid,
      notMandatory,
    });
  }, [totalIncome, totalTax, taxPaid, dueDate, filingDate, notMandatory]);

  const summary = useMemo(() => {
    if (result.error) return "";
    const lines = [
      "Belated Return Late Fee & Interest",
      `Due date: ${dueDate} · Filed: ${filingDate}`,
      result.isLate
        ? `Delay: ${NUM.format(result.days)} days (${result.months} month${result.months === 1 ? "" : "s"} for interest)`
        : "Filed on or before the due date",
      `Late fee under 234F: ${money(result.fee234F)}`,
      `Interest under 234A: ${money(result.interest234A)}`,
      `Unpaid tax: ${money(result.unpaidTax)}`,
    ];
    if (result.updatedReturn && !result.updatedReturn.closed) {
      lines.push(
        `Additional tax u/s 139(8A) at ${result.updatedReturn.percent}%: ${money(result.updatedReturn.additionalTax)}`,
      );
    }
    lines.push(`Total payable: ${money(result.totalPayable)}`);
    return lines.join("\n");
  }, [result, dueDate, filingDate]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setDueDate(DEFAULTS.dueDate);
    setFilingDate(DEFAULTS.filingDate);
    setTotalIncome(DEFAULTS.totalIncome);
    setTotalTax(DEFAULTS.totalTax);
    setTaxPaid(DEFAULTS.taxPaid);
    setNotMandatory(DEFAULTS.notMandatory);
    setCopied(false);
  };

  const presets = [
    { label: "31 Jul — no audit", month: "07", day: "31" },
    { label: "31 Oct — audit case", month: "10", day: "31" },
    { label: "30 Nov — transfer pricing", month: "11", day: "30" },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileClock className="h-4 w-4" aria-hidden="true" />
          Income tax
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Belated Return Late Fee Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out the Section 234F late filing fee and the Section 234A interest on unpaid tax for
          a return filed after the due date — plus the additional tax if you have slipped past
          31 December and can only file an updated return.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="late-due">
              Original due date u/s 139(1)
            </label>
            <input
              id="late-due"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
          <div>
            <p className={LABEL_CLASS} id="late-ay-label">
              Assessment year
            </p>
            <div
              aria-labelledby="late-ay-label"
              className="mt-2 flex h-11 w-full items-center rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 font-medium text-[var(--foreground)]"
            >
              {derivedAyStartYear === null ? "—" : ayLabel(derivedAyStartYear)}
            </div>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Derived from the due date on the left, so it always matches.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="late-filed">
              Date the return is / was filed
            </label>
            <input
              id="late-filed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={filingDate}
              onChange={(event) => setFilingDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="late-income">
              Total income for the year (₹)
            </label>
            <input
              id="late-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={totalIncome}
              onChange={(event) => setTotalIncome(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="late-tax">
              Total tax liability incl. cess (₹)
            </label>
            <input
              id="late-tax"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={totalTax}
              onChange={(event) => setTotalTax(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="late-paid">
              TDS + advance tax already paid (₹)
            </label>
            <input
              id="late-paid"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={taxPaid}
              onChange={(event) => setTaxPaid(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={CHIP_BTN}
              onClick={() => {
                const year = derivedAyStartYear ?? DEFAULTS.dueDate.slice(0, 4);
                setDueDate(`${year}-${preset.month}-${preset.day}`);
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <label
          htmlFor="late-not-mandatory"
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--foreground)]"
        >
          <input
            id="late-not-mandatory"
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={notMandatory}
            onChange={(event) => setNotMandatory(event.target.checked)}
          />
          Filing was not compulsory for me (income below the basic exemption limit and none of the
          mandatory-filing conditions apply)
        </label>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Extra cost of filing late
              </p>
              <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                {money(result.extraCost)}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {result.isLate
                  ? `${NUM.format(result.days)} days late · charged as ${result.months} month${result.months === 1 ? "" : "s"}`
                  : "Filed on or before the due date — no fee or 234A interest"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyResult}
                aria-label="Copy belated return late fee result"
                className={GHOST_BTN}
              >
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset all inputs"
                className={PRIMARY_BTN}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              ["Late filing fee u/s 234F", money(result.fee234F)],
              [
                `Interest u/s 234A (1% × ${result.months} month${result.months === 1 ? "" : "s"})`,
                money(result.interest234A),
              ],
              ["Unpaid tax (self-assessment tax)", money(result.unpaidTax)],
              ...(result.updatedReturn && !result.updatedReturn.closed
                ? [
                    [
                      `Additional tax u/s 139(8A) at ${result.updatedReturn.percent}%`,
                      money(result.updatedReturn.additionalTax),
                    ],
                  ]
                : []),
              ["Total payable before filing", money(result.totalPayable)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          {result.belatedWindowOpen ? (
            <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
              A belated return under Section 139(4) can still be filed up to{" "}
              {formatDate(result.belatedDeadline)}.
            </p>
          ) : result.updatedReturn?.closed ? (
            <p
              role="alert"
              className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              This date is more than 48 months after the end of the assessment year — even an
              updated return under Section 139(8A) is no longer possible.
            </p>
          ) : (
            <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
              The belated window closed on {formatDate(result.belatedDeadline)}. Only an updated
              return (ITR-U) under Section 139(8A) is possible, with additional tax of{" "}
              {result.updatedReturn.percent}% of tax plus interest. An updated return cannot be used
              to claim a refund or increase a loss.
            </p>
          )}

          {result.isLate && (
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">
              Filing late also means business and capital losses cannot be carried forward — only a
              house-property loss survives a belated return.
            </p>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate based on Sections 139(1), 139(4), 139(8A), 234A and 234F of the
        Income-tax Act, 1961. Due dates are sometimes extended by CBDT circular — set the due date
        field to whatever applied to you. Confirm the final figures on the income tax portal.
      </p>
    </main>
  );
}
