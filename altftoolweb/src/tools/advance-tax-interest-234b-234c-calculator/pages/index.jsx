"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const RATE = 0.01; // 1% per month, simple interest
const ADVANCE_TAX_THRESHOLD = 10000;

const FY_OPTIONS = [2022, 2023, 2024, 2025, 2026];

const DEFAULTS = {
  fyStartYear: "2024",
  scheme: "regular",
  senior: false,
  totalTax: "250000",
  credits: "50000",
  jun: "0",
  sep: "30000",
  dec: "90000",
  mar: "150000",
  lateMar: "0",
  payDate: "2025-07-25",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

/** Rule 119A — interest is computed on the amount rounded down to a multiple of ₹100. */
const roundDown100 = (value) => (value > 0 ? Math.floor(value / 100) * 100 : 0);

/**
 * Section 234C (deferment): 1% per month for 3 months on the shortfall at each of the
 * 15 Jun / 15 Sep / 15 Dec instalments and 1% for one month on the 15 Mar shortfall.
 * Safe harbours: no interest if at least 12% is paid by 15 Jun or 36% by 15 Sep.
 * Presumptive taxpayers (44AD / 44ADA) pay 100% by 15 March in a single instalment.
 *
 * Section 234B (default): 1% per month from 1 April of the assessment year to the date the
 * balance tax is paid, when advance tax paid is less than 90% of the assessed tax.
 */
function computeInterest(input) {
  const {
    totalTax,
    credits,
    jun,
    sep,
    dec,
    mar,
    lateMar,
    scheme,
    senior,
    fyStartYear,
    payDate,
  } = input;

  const assessedTax = Math.max(0, totalTax - credits);
  const totalAdvance = mar + lateMar;
  const belowThreshold = assessedTax < ADVANCE_TAX_THRESHOLD;
  const exempt = senior || belowThreshold;

  const schedule = [];
  let interest234C = 0;

  if (!exempt) {
    if (scheme === "presumptive") {
      const required = assessedTax;
      const shortfall = mar >= required ? 0 : roundDown100(required - mar);
      const interest = shortfall * RATE;
      interest234C += interest;
      schedule.push({
        due: "15 March",
        percent: 100,
        required,
        paid: mar,
        shortfall,
        months: 1,
        interest,
        waived: false,
      });
    } else {
      const instalments = [
        { due: "15 June", pct: 0.15, safe: 0.12, months: 3, paid: jun },
        { due: "15 September", pct: 0.45, safe: 0.36, months: 3, paid: sep },
        { due: "15 December", pct: 0.75, safe: 0.75, months: 3, paid: dec },
        { due: "15 March", pct: 1, safe: 1, months: 1, paid: mar },
      ];
      for (const item of instalments) {
        const required = assessedTax * item.pct;
        const waived = item.paid < required && item.paid >= assessedTax * item.safe;
        const shortfall =
          item.paid >= required || waived ? 0 : roundDown100(required - item.paid);
        const interest = shortfall * RATE * item.months;
        interest234C += interest;
        schedule.push({
          due: item.due,
          percent: item.pct * 100,
          required,
          paid: item.paid,
          shortfall,
          months: item.months,
          interest,
          waived,
        });
      }
    }
  }

  // 234B runs from 1 April of the assessment year; any part of a month counts as a full month.
  const ayYear = fyStartYear + 1;
  const ayStart = Date.UTC(ayYear, 3, 1);
  const parsed = Date.parse(`${payDate}T00:00:00Z`);
  let months234B = 0;
  if (Number.isFinite(parsed) && parsed >= ayStart) {
    const paid = new Date(parsed);
    months234B = (paid.getUTCFullYear() - ayYear) * 12 + (paid.getUTCMonth() + 1 - 3);
  }

  const applies234B = !exempt && totalAdvance < assessedTax * 0.9;
  const shortfall234B = applies234B ? roundDown100(assessedTax - totalAdvance) : 0;
  const interest234B = shortfall234B * RATE * months234B;

  return {
    assessedTax,
    totalAdvance,
    exempt,
    belowThreshold,
    schedule,
    interest234C,
    months234B,
    applies234B,
    shortfall234B,
    interest234B,
    total: interest234B + interest234C,
    balanceTax: Math.max(0, assessedTax - totalAdvance),
  };
}

export default function ToolHome() {
  const [fyStartYear, setFyStartYear] = useState(DEFAULTS.fyStartYear);
  const [scheme, setScheme] = useState(DEFAULTS.scheme);
  const [senior, setSenior] = useState(DEFAULTS.senior);
  const [totalTax, setTotalTax] = useState(DEFAULTS.totalTax);
  const [credits, setCredits] = useState(DEFAULTS.credits);
  const [jun, setJun] = useState(DEFAULTS.jun);
  const [sep, setSep] = useState(DEFAULTS.sep);
  const [dec, setDec] = useState(DEFAULTS.dec);
  const [mar, setMar] = useState(DEFAULTS.mar);
  const [lateMar, setLateMar] = useState(DEFAULTS.lateMar);
  const [payDate, setPayDate] = useState(DEFAULTS.payDate);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const values = {
      totalTax: toNumber(totalTax),
      credits: toNumber(credits),
      jun: toNumber(jun),
      sep: toNumber(sep),
      dec: toNumber(dec),
      mar: toNumber(mar),
      lateMar: toNumber(lateMar),
    };

    if (Object.values(values).some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (Object.values(values).some((value) => value < 0)) {
      return { error: "Amounts cannot be negative." };
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(payDate) || Number.isNaN(Date.parse(`${payDate}T00:00:00Z`))) {
      return { error: "Enter a valid date for the payment of the balance tax." };
    }
    if (scheme === "regular" && (values.sep < values.jun || values.dec < values.sep || values.mar < values.dec)) {
      return {
        error:
          "Instalment figures are cumulative — each one must be at least as large as the previous instalment.",
      };
    }

    return computeInterest({
      ...values,
      scheme,
      senior,
      fyStartYear: Number(fyStartYear),
      payDate,
    });
  }, [totalTax, credits, jun, sep, dec, mar, lateMar, scheme, senior, fyStartYear, payDate]);

  const summary = useMemo(() => {
    if (result.error) return "";
    const fy = Number(fyStartYear);
    return [
      "Advance Tax Interest — Sections 234B & 234C",
      `Financial year ${fy}-${String((fy + 1) % 100).padStart(2, "0")} (AY ${fy + 1}-${String((fy + 2) % 100).padStart(2, "0")})`,
      `Assessed tax (tax less TDS/TCS/relief): ${money(result.assessedTax)}`,
      `Advance tax paid: ${money(result.totalAdvance)}`,
      `Interest under 234C (deferment): ${money(result.interest234C)}`,
      `Interest under 234B (${result.months234B} month${result.months234B === 1 ? "" : "s"}): ${money(result.interest234B)}`,
      `Total interest: ${money(result.total)}`,
      `Balance tax before interest: ${money(result.balanceTax)}`,
      `Total payable with interest: ${money(result.balanceTax + result.total)}`,
    ].join("\n");
  }, [result, fyStartYear]);

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
    setFyStartYear(DEFAULTS.fyStartYear);
    setScheme(DEFAULTS.scheme);
    setSenior(DEFAULTS.senior);
    setTotalTax(DEFAULTS.totalTax);
    setCredits(DEFAULTS.credits);
    setJun(DEFAULTS.jun);
    setSep(DEFAULTS.sep);
    setDec(DEFAULTS.dec);
    setMar(DEFAULTS.mar);
    setLateMar(DEFAULTS.lateMar);
    setPayDate(DEFAULTS.payDate);
    setCopied(false);
  };

  const instalmentFields = [
    { id: "adv-jun", label: "Paid by 15 June (cumulative ₹)", value: jun, setter: setJun },
    { id: "adv-sep", label: "Paid by 15 September (cumulative ₹)", value: sep, setter: setSep },
    { id: "adv-dec", label: "Paid by 15 December (cumulative ₹)", value: dec, setter: setDec },
    { id: "adv-mar", label: "Paid by 15 March (cumulative ₹)", value: mar, setter: setMar },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Income tax
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Advance Tax Interest 234B &amp; 234C Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your tax liability, TDS credit and what you actually paid at each instalment date.
          The calculator applies the 1% per month rules — including the 12% and 36% safe harbours —
          and shows the interest instalment by instalment.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="adv-fy">
              Financial year
            </label>
            <select
              id="adv-fy"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fyStartYear}
              onChange={(event) => setFyStartYear(event.target.value)}
            >
              {FY_OPTIONS.map((year) => (
                <option key={year} value={String(year)}>
                  FY {year}-{String((year + 1) % 100).padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="adv-scheme">
              Taxpayer type
            </label>
            <select
              id="adv-scheme"
              className={`mt-2 ${INPUT_CLASS}`}
              value={scheme}
              onChange={(event) => {
                const value = event.target.value;
                setScheme(value);
                // Presumptive taxation (44AD/44ADA) requires business/professional
                // income, which is mutually exclusive with the senior-citizen
                // exemption below (that exemption only applies with no such income).
                if (value === "presumptive" && senior) setSenior(false);
              }}
            >
              <option value="regular">Regular — four instalments</option>
              <option value="presumptive" disabled={senior}>
                Presumptive 44AD / 44ADA — one instalment
              </option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="adv-tax">
              Total tax liability incl. surcharge &amp; cess (₹)
            </label>
            <input
              id="adv-tax"
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
            <label className={LABEL_CLASS} htmlFor="adv-credits">
              TDS + TCS + relief / MAT credit (₹)
            </label>
            <input
              id="adv-credits"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={credits}
              onChange={(event) => setCredits(event.target.value)}
            />
          </div>

          {scheme === "regular" ? (
            instalmentFields.map((field) => (
              <div key={field.id}>
                <label className={LABEL_CLASS} htmlFor={field.id}>
                  {field.label}
                </label>
                <input
                  id={field.id}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1000"
                  value={field.value}
                  onChange={(event) => field.setter(event.target.value)}
                />
              </div>
            ))
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="adv-mar-single">
                Advance tax paid by 15 March (₹)
              </label>
              <input
                id="adv-mar-single"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1000"
                value={mar}
                onChange={(event) => setMar(event.target.value)}
              />
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="adv-late">
              Extra advance tax paid 16–31 March (₹)
            </label>
            <input
              id="adv-late"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={lateMar}
              onChange={(event) => setLateMar(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Counts for 234B but is too late to avoid the 15 March 234C instalment.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="adv-paydate">
              Date balance tax paid / return filed
            </label>
            <input
              id="adv-paydate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={payDate}
              onChange={(event) => setPayDate(event.target.value)}
            />
          </div>
        </div>

        <label
          htmlFor="adv-senior"
          className={`mt-4 flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--foreground)] ${
            scheme === "presumptive" ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          }`}
        >
          <input
            id="adv-senior"
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={senior}
            disabled={scheme === "presumptive"}
            onChange={(event) => {
              const checked = event.target.checked;
              setSenior(checked);
              // The presumptive scheme requires business/professional income,
              // which rules out this exemption — keep the two consistent.
              if (checked && scheme === "presumptive") setScheme("regular");
            }}
          />
          Resident senior citizen (60+) with no income from business or profession
        </label>
        {scheme === "presumptive" && (
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Not available with presumptive taxation (44AD/44ADA) — that scheme requires business or
            professional income, which is mutually exclusive with this exemption.
          </p>
        )}
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div aria-live="polite" aria-atomic="true">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Total interest under 234B + 234C
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(result.total)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  on assessed tax of {money(result.assessedTax)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy advance tax interest result"
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
                ["Assessed tax (tax − TDS/TCS/relief)", money(result.assessedTax)],
                ["Advance tax paid during the year", money(result.totalAdvance)],
                ["Interest under Section 234C (deferment)", money(result.interest234C)],
                [
                  `Interest under Section 234B (${result.months234B} month${result.months234B === 1 ? "" : "s"})`,
                  money(result.interest234B),
                ],
                ["Balance tax before interest", money(result.balanceTax)],
                ["Total payable with interest", money(result.balanceTax + result.total)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            {result.exempt && (
              <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
                {result.belowThreshold
                  ? "Assessed tax is below ₹10,000, so advance tax is not payable and no 234B or 234C interest arises."
                  : "A resident senior citizen without business or professional income is not liable to pay advance tax, so 234B and 234C do not apply."}
              </p>
            )}

            {!result.exempt && !result.applies234B && (
              <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
                Advance tax paid is at least 90% of the assessed tax, so no interest arises under
                Section 234B.
              </p>
            )}
          </section>

          {!result.exempt && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Section 234C — instalment by instalment</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">Due date</th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">Required</th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">Paid</th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">Shortfall</th>
                      <th scope="col" className="py-2 text-right font-semibold">Interest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.map((row) => (
                      <tr key={row.due} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 font-semibold">
                          {row.due}
                          <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                            {row.percent}% · {row.months} month{row.months === 1 ? "" : "s"}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-right">{money(row.required)}</td>
                        <td className="py-2 pr-3 text-right">{money(row.paid)}</td>
                        <td className="py-2 pr-3 text-right">
                          {row.waived ? (
                            <span className="text-[var(--success)]">Safe harbour</span>
                          ) : (
                            money(row.shortfall)
                          )}
                        </td>
                        <td className="py-2 text-right font-semibold">{money(row.interest)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                No 234C interest arises on the first instalment if at least 12% of the assessed tax
                is paid by 15 June, or on the second if at least 36% is paid by 15 September.
                Shortfalls are rounded down to the nearest ₹100 under Rule 119A.
              </p>
            </section>
          )}
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate based on Sections 208, 211, 234B and 234C of the Income-tax Act,
        1961. Interest under Section 234A for late filing is calculated separately. Capital gains
        and lottery income received after an instalment date have their own relief — check with a
        tax adviser.
      </p>
    </main>
  );
}
