"use client";

import { useMemo, useState } from "react";
import { Ban, Check, Copy, RotateCcw, ScaleIcon } from "lucide-react";

import {
  ELIGIBILITY_BARS,
  FILING_STATUS_OPTIONS,
  TAXPAYER_CATEGORIES,
  computeItrU,
  listAssessmentYears,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const DASH = "—";

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const prettyDate = (iso) => {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return DASH;
  const stamp = Date.parse(`${iso}T00:00:00Z`);
  if (!Number.isFinite(stamp)) return DASH;
  return DATE_FMT.format(new Date(stamp));
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const YEAR_OPTIONS = listAssessmentYears(2019, 2027);

const DEFAULTS = {
  assessmentYear: "2023-24",
  category: "non-audit",
  filingDate: "2026-07-29",
  filingStatus: "no-return",
  taxDue: "50000",
  totalIncome: "800000",
  interest234C: "0",
};

const todayIso = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export default function ToolHome() {
  const [assessmentYear, setAssessmentYear] = useState(DEFAULTS.assessmentYear);
  const [category, setCategory] = useState(DEFAULTS.category);
  const [filingDate, setFilingDate] = useState(() => todayIso());
  const [filingStatus, setFilingStatus] = useState(DEFAULTS.filingStatus);
  const [taxDue, setTaxDue] = useState(DEFAULTS.taxDue);
  const [totalIncome, setTotalIncome] = useState(DEFAULTS.totalIncome);
  const [interest234C, setInterest234C] = useState(DEFAULTS.interest234C);
  const [bars, setBars] = useState({});
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeItrU({
        assessmentYear,
        category,
        filingDate,
        filingStatus,
        taxDue: taxDue.trim() === "" ? "" : Number(taxDue),
        totalIncome: totalIncome.trim() === "" ? "" : Number(totalIncome),
        interest234C: interest234C.trim() === "" ? 0 : Number(interest234C),
        bars,
      }),
    [assessmentYear, category, filingDate, filingStatus, taxDue, totalIncome, interest234C, bars],
  );

  const hasError = Boolean(result.error);
  const eligible = !hasError && result.eligible === true;
  const cost = eligible ? result.cost : null;

  const toggleBar = (id) => {
    setBars((current) => ({ ...current, [id]: !current[id] }));
  };

  const reset = () => {
    setAssessmentYear(DEFAULTS.assessmentYear);
    setCategory(DEFAULTS.category);
    setFilingDate(todayIso());
    setFilingStatus(DEFAULTS.filingStatus);
    setTaxDue(DEFAULTS.taxDue);
    setTotalIncome(DEFAULTS.totalIncome);
    setInterest234C(DEFAULTS.interest234C);
    setBars({});
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `ITR-U — AY ${result.assessmentYear} (FY ${result.financialYear})`,
      `Filing date assumed: ${result.filingDate}`,
      `Section 139(8A) form applying: ${result.regime.label}`,
      `Window deadline: ${result.deadline}`,
    ];
    if (!eligible) {
      lines.push(`VERDICT: NOT ELIGIBLE — ${result.barHeadline}`);
      lines.push(`Bar: ${result.barSection} — ${result.barDetail}`);
      return lines.join("\n");
    }
    lines.push(`VERDICT: eligible on the inputs given, ${NUM.format(result.daysLeft)} days left`);
    lines.push(`Section 140B slab: ${cost.additionalTaxPercent}% (${result.tier.clause})`);
    lines.push(`Tax due: ${money(cost.taxDue)}`);
    lines.push(`Section 234A interest (${cost.months234A} months @ 1%): ${money(cost.interest234A)}`);
    lines.push(`Section 234B interest (${cost.months234B} months @ 1%): ${money(cost.interest234B)}`);
    lines.push(`Section 234C interest: ${money(cost.interest234C)}`);
    lines.push(
      `Section 140B additional tax (${cost.additionalTaxPercent}% of ${money(cost.additionalTaxBase)}): ${money(cost.additionalTax)}`,
    );
    lines.push(`Section 234F fee: ${money(cost.lateFee234F)}`);
    lines.push(`TOTAL PAYABLE BEFORE FILING: ${money(cost.total)}`);
    return lines.join("\n");
  }, [hasError, eligible, result, cost]);

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

  const rows = cost
    ? [
        ["Tax due on the disclosed income", money(cost.taxDue)],
        [
          `Section 234A interest — ${cost.months234A} month${cost.months234A === 1 ? "" : "s"} at 1%`,
          money(cost.interest234A),
        ],
        [
          `Section 234B interest — ${cost.months234B} month${cost.months234B === 1 ? "" : "s"} at 1%`,
          money(cost.interest234B),
        ],
        ["Section 234C interest (as entered)", money(cost.interest234C)],
        ["Aggregate of tax and interest — the section 140B(3) base", money(cost.additionalTaxBase)],
        [
          `Section 140B additional tax at ${cost.additionalTaxPercent}%`,
          money(cost.additionalTax),
        ],
        ["Section 234F fee", money(cost.lateFee234F)],
        ["Total payable before the return can be furnished", money(cost.total)],
      ]
    : [
        ["Tax due on the disclosed income", DASH],
        ["Section 234A interest", DASH],
        ["Section 234B interest", DASH],
        ["Section 234C interest (as entered)", DASH],
        ["Aggregate of tax and interest — the section 140B(3) base", DASH],
        ["Section 140B additional tax", DASH],
        ["Section 234F fee", DASH],
        ["Total payable before the return can be furnished", DASH],
      ];

  const barCount = ELIGIBILITY_BARS.filter((bar) => bars[bar.id]).length;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ScaleIcon className="h-4 w-4" aria-hidden="true" />
          Section 139(8A)
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          ITR-U Eligibility Gate &amp; Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Section 139(8A) bars an updated return far more often than it allows one. This page runs
          the statutory bars first, then names the window your assessment year falls in and prices
          the return under section 140B. It reports the figures the sections produce and stops
          there.
        </p>
      </header>

      {/* ---------------- Gate ---------------- */}
      <section className={`${CARD} mb-5`} aria-labelledby="gate-heading">
        <h2 id="gate-heading" className="text-base font-semibold">
          Step 1 — the section 139(8A) bars
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick anything that is true. A single tick closes the door: the provisos to section
          139(8A) are absolute, not weighed against each other.
        </p>
        <ul className="mt-4 space-y-2">
          {ELIGIBILITY_BARS.map((bar) => {
            const checked = bars[bar.id] === true;
            return (
              <li key={bar.id}>
                <label
                  htmlFor={`bar-${bar.id}`}
                  className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border p-3 text-sm leading-6 transition ${
                    checked
                      ? "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                  }`}
                >
                  <input
                    id={`bar-${bar.id}`}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBar(bar.id)}
                    className="mt-1 h-5 w-5 shrink-0 accent-[var(--danger)]"
                  />
                  <span>
                    {bar.label}
                    <span className="mt-0.5 block text-xs font-medium text-[var(--muted-foreground)]">
                      {bar.section}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          {barCount === 0
            ? "Nothing ticked, so no proviso in section 139(8A) is engaged on these answers."
            : `${barCount} bar${barCount === 1 ? "" : "s"} ticked.`}
        </p>
      </section>

      {/* ---------------- Year and date ---------------- */}
      <section className={`${CARD} mb-5`} aria-labelledby="year-heading">
        <h2 id="year-heading" className="text-base font-semibold">
          Step 2 — the year and the filing date
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="assessment-year">
              Assessment year
            </label>
            <select
              id="assessment-year"
              className={`${INPUT_CLASS} mt-1`}
              value={assessmentYear}
              onChange={(event) => setAssessmentYear(event.target.value)}
            >
              {YEAR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  AY {option.value} (FY {option.financialYear})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="filing-date">
              Date the ITR-U would be furnished
            </label>
            <input
              id="filing-date"
              type="date"
              className={`${INPUT_CLASS} mt-1`}
              value={filingDate}
              onChange={(event) => setFilingDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="category">
              Which section 139(1) due date applied
            </label>
            <select
              id="category"
              className={`${INPUT_CLASS} mt-1`}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {TAXPAYER_CATEGORIES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="filing-status">
              Was a return already filed for this year
            </label>
            <select
              id="filing-status"
              className={`${INPUT_CLASS} mt-1`}
              value={filingStatus}
              onChange={(event) => setFilingStatus(event.target.value)}
            >
              {FILING_STATUS_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          {FILING_STATUS_OPTIONS.find((option) => option.id === filingStatus)?.hint}
        </p>
      </section>

      {/* ---------------- Money ---------------- */}
      <section className={`${CARD} mb-5`} aria-labelledby="money-heading">
        <h2 id="money-heading" className="text-base font-semibold">
          Step 3 — the money
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tax-due">
              Tax due on the income being disclosed (₹)
            </label>
            <input
              id="tax-due"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              className={`${INPUT_CLASS} mt-1`}
              value={taxDue}
              onChange={(event) => setTaxDue(event.target.value)}
            />
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              Net of TDS, TCS, advance tax, relief and credits. Include surcharge and cess —
              the Explanation to section 140B(3) says tax includes both.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="total-income">
              Total income of the updated return (₹)
            </label>
            <input
              id="total-income"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              className={`${INPUT_CLASS} mt-1`}
              value={totalIncome}
              onChange={(event) => setTotalIncome(event.target.value)}
            />
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              Only used to pick the section 234F slab: ₹1,000 up to ₹5,00,000, ₹5,000 above it.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="interest-234c">
              Section 234C interest already worked out (₹)
            </label>
            <input
              id="interest-234c"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              className={`${INPUT_CLASS} mt-1`}
              value={interest234C}
              onChange={(event) => setInterest234C(event.target.value)}
            />
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              Section 234C depends on what you paid at each of the four advance-tax instalment
              dates, which this page does not collect. Leave it at zero if no instalment fell
              short.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- Result ---------------- */}
      <section className={CARD} aria-labelledby="result-heading">
        <h2 id="result-heading" className="sr-only">
          Result
        </h2>

        {hasError ? (
          <p
            role="alert"
            className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : eligible ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total payable before the updated return can be furnished
            </p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
              {money(cost.total)}
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--success)]">
              No proviso to section 139(8A) is engaged on the answers given, and the window is
              open until {prettyDate(result.deadline)} — {NUM.format(result.daysLeft)} day
              {result.daysLeft === 1 ? "" : "s"} away.
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              Section 140B slab {cost.additionalTaxPercent}% under {result.tier.clause}, introduced
              by the {result.tier.introducedBy}. It applies because the return would be furnished on
              or before {prettyDate(result.tier.closesOn)}, that being {result.tier.label.replace("Furnished within ", "")}.
            </p>
          </div>
        ) : (
          <div>
            <p className="inline-flex items-center gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-semibold text-[var(--danger)]">
              <Ban className="h-4 w-4 shrink-0" aria-hidden="true" />
              {result.barHeadline}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">{result.barDetail}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Rule that produced this: {result.barSection}
            </p>
          </div>
        )}

        {!hasError && (
          <dl className="mt-5 divide-y divide-[var(--border)] border-t border-[var(--border)] text-sm">
            <div className="flex items-start justify-between gap-4 py-2">
              <dt className="text-[var(--muted-foreground)]">
                Section 139(8A) form applying to AY {result.assessmentYear}
              </dt>
              <dd className="text-right font-semibold">{result.regime.label}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-2">
              <dt className="text-[var(--muted-foreground)]">End of the relevant assessment year</dt>
              <dd className="text-right font-semibold">{prettyDate(result.assessmentYearEnd)}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-2">
              <dt className="text-[var(--muted-foreground)]">
                Last date for an updated return ({result.regime.windowMonths} months)
              </dt>
              <dd className="text-right font-semibold">{prettyDate(result.deadline)}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-2">
              <dt className="text-[var(--muted-foreground)]">Due date under section 139(1)</dt>
              <dd className="text-right font-semibold">{prettyDate(result.dueDate139_1)}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-2">
              <dt className="text-[var(--muted-foreground)]">
                Belated or revised cut-off, sections 139(4) and 139(5)
              </dt>
              <dd className="text-right font-semibold">{prettyDate(result.belatedDeadline)}</dd>
            </div>
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.regime.statute}
          </p>
        )}

        {!hasError && cost && (
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {cost.lateFeeReason} Interest under sections 234A and 234B is charged on{" "}
            {money(cost.interestBase)}, the tax rounded down to the nearest ₹100 under rule 119A of
            the Income-tax Rules, 1962. The section 234F fee is excluded from the section 140B(3)
            base, following Part B-ATI of Form ITR-U.
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={copyResult}
            disabled={hasError}
            aria-label="Copy the ITR-U result to the clipboard"
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset all inputs">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {/* ---------------- Slab table ---------------- */}
      {!hasError && result.tiers.length > 0 && (
        <section className={`${CARD} mt-5`} aria-labelledby="slab-heading">
          <h2 id="slab-heading" className="text-base font-semibold">
            Section 140B(3) slabs for AY {result.assessmentYear}
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Furnished on or before
                  </th>
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Additional tax
                  </th>
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Clause
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Introduced by
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {result.tiers.map((tier) => {
                  const active = result.tier && result.tier.percent === tier.percent;
                  return (
                    <tr
                      key={tier.percent}
                      className={active ? "font-semibold text-[var(--primary)]" : undefined}
                    >
                      <td className="py-2 pr-4 whitespace-nowrap">{prettyDate(tier.closesOn)}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{tier.percent}%</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{tier.clause}</td>
                      <td className="py-2 whitespace-nowrap">{tier.introducedBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.carryForwardCondition}
          </p>
        </section>
      )}

      <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
        Statutory dates only. Section 139(1) due dates are extended by CBDT circular in many years,
        and an extended due date shifts the section 234A count. Figures follow sections 139(8A),
        140B, 234A, 234B, 234C and 234F of the Income-tax Act, 1961 and rule 119A of the Income-tax
        Rules, 1962, as read on 29 July 2026.
      </p>
    </main>
  );
}
