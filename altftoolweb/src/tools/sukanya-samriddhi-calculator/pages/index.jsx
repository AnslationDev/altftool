"use client";

import { useMemo, useState } from "react";
import {
  CalendarCheck,
  CircleAlert,
  Copy,
  GraduationCap,
  HeartHandshake,
  PiggyBank,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const MIN_DEPOSIT = 250;
const MAX_DEPOSIT = 150000;
const DEPOSIT_YEARS = 15;
const MATURITY_YEARS = 21;
const MAX_OPENING_AGE = 9;

const depositPresets = [
  { label: "₹1,000 / month", value: 12000 },
  { label: "₹50,000 / year", value: 50000 },
  { label: "Maximum ₹1.5L", value: 150000 },
];

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const pad2 = (n) => String(n).padStart(2, "0");

const toDateInput = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const formatLongDate = (date) =>
  date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

function buildDate(year, month, day) {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

function parseLocalDate(value) {
  if (typeof value !== "string") return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return buildDate(Number(match[1]), Number(match[2]), Number(match[3]));
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function addMonths(date, count) {
  const year = date.getFullYear();
  const month = date.getMonth() + count;
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(date.getDate(), lastDay));
}

function addYears(date, years) {
  return addMonths(date, years * 12);
}

function diffYMD(from, to) {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (addMonths(from, months) > to) months -= 1;
  const anchor = addMonths(from, months);
  const days = Math.round((to.getTime() - anchor.getTime()) / 86400000);
  return { years: Math.floor(months / 12), months: months % 12, days };
}

function describeGap({ years, months, days }) {
  const parts = [];
  if (years > 0) parts.push(`${years} year${years === 1 ? "" : "s"}`);
  if (months > 0) parts.push(`${months} month${months === 1 ? "" : "s"}`);
  if (!years && !months) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  return parts.join(" ");
}

const defaultDob = () => {
  const today = startOfToday();
  return toDateInput(new Date(today.getFullYear() - 4, today.getMonth(), today.getDate()));
};

function StatTile({ label, value, hint }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p>}
    </div>
  );
}

function GrowthBars({ rows }) {
  const max = rows.length ? rows[rows.length - 1].closing : 1;
  const labelled = new Set([1, 5, 10, 15, 18, 21]);
  return (
    <div aria-hidden="true" className="mt-6">
      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
        Closing balance, account year by year
      </p>
      <div className="mt-3 flex h-40 items-end gap-1">
        {rows.map((row) => (
          <div key={row.year} className="flex h-full flex-1 flex-col justify-end">
            <div
              title={`Year ${row.year} (age ${row.age}): ${formatINR(row.closing)}`}
              className="w-full rounded-t-sm transition-all"
              style={{
                height: `${Math.max((row.closing / max) * 100, 2)}%`,
                background: row.year > DEPOSIT_YEARS ? "var(--anslation-ds-success)" : "var(--primary)",
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1">
        {rows.map((row) => (
          <div key={row.year} className="flex-1 text-center text-[10px] text-[var(--muted-foreground)]">
            {labelled.has(row.year) ? row.year : ""}
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-[var(--muted-foreground)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--primary)" }} />
          Years 1-15: you deposit
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--anslation-ds-success)" }} />
          Years 16-21: interest only
        </span>
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [dob, setDob] = useState(defaultDob);
  const [deposit, setDeposit] = useState(50000);
  const [rate, setRate] = useState(8.2);
  const [startYearInput, setStartYearInput] = useState(null);
  const [copied, setCopied] = useState(false);

  const today = useMemo(() => startOfToday(), []);
  const dobDate = useMemo(() => parseLocalDate(dob), [dob]);

  const safeDeposit = clamp(Number(deposit) || 0, MIN_DEPOSIT, MAX_DEPOSIT);
  const safeRate = clamp(Number(rate) || 0, 0.1, 20);

  const eligibility = useMemo(() => {
    if (!dobDate) return { status: "invalid", message: "Enter your daughter's date of birth to begin." };
    if (dobDate > today) return { status: "invalid", message: "Date of birth cannot be in the future." };
    const tenthBirthday = addYears(dobDate, 10);
    const age = diffYMD(dobDate, today);
    if (today >= tenthBirthday) {
      return { status: "ineligible", age, tenthBirthday };
    }
    return { status: "eligible", age, tenthBirthday, window: diffYMD(today, tenthBirthday) };
  }, [dobDate, today]);

  const startYearOptions = useMemo(() => {
    if (!dobDate) return [];
    const birthYear = dobDate.getFullYear();
    return Array.from({ length: MAX_OPENING_AGE + 1 }, (_, index) => {
      const year = birthYear + index;
      return { year, age: index, passed: year < today.getFullYear() };
    });
  }, [dobDate, today]);

  const startYear = useMemo(() => {
    if (!startYearOptions.length) return null;
    const years = startYearOptions.map((option) => option.year);
    if (startYearInput !== null && years.includes(startYearInput)) return startYearInput;
    const preferred = years.find((year) => year >= today.getFullYear());
    return preferred ?? years[years.length - 1];
  }, [startYearOptions, startYearInput, today]);

  const result = useMemo(() => {
    if (!dobDate || !startYear) return null;
    const birthYear = dobDate.getFullYear();
    const openingDate = buildDate(startYear, dobDate.getMonth() + 1, dobDate.getDate());
    if (!openingDate) return null;

    const r = safeRate / 100;
    const rows = [];
    let balance = 0;
    for (let year = 1; year <= MATURITY_YEARS; year += 1) {
      const yearDeposit = year <= DEPOSIT_YEARS ? safeDeposit : 0;
      const opening = balance + yearDeposit;
      const interest = opening * r;
      balance = opening + interest;
      rows.push({
        year,
        calendarYear: startYear + year - 1,
        age: startYear + year - 1 - birthYear,
        deposit: yearDeposit,
        interest,
        closing: balance,
      });
    }

    const invested = safeDeposit * DEPOSIT_YEARS;
    const ageAtOpening = startYear - birthYear;
    const yearIndexAt18 = 19 - ageAtOpening;
    const withdrawalBase =
      yearIndexAt18 >= 2 && yearIndexAt18 <= MATURITY_YEARS ? rows[yearIndexAt18 - 2].closing : null;

    return {
      rows,
      invested,
      maturity: balance,
      interest: balance - invested,
      multiple: invested > 0 ? balance / invested : 0,
      openingDate,
      maturityDate: addYears(openingDate, MATURITY_YEARS),
      lastDepositDate: addYears(openingDate, DEPOSIT_YEARS),
      ageAtOpening,
      ageAtMaturity: startYear + MATURITY_YEARS - birthYear,
      withdrawalLimit: withdrawalBase === null ? null : withdrawalBase * 0.5,
      withdrawalYear: yearIndexAt18 >= 2 && yearIndexAt18 <= MATURITY_YEARS ? startYear + yearIndexAt18 - 1 : null,
    };
  }, [dobDate, startYear, safeDeposit, safeRate]);

  const summary = useMemo(() => {
    if (!result) return "";
    return [
      "Sukanya Samriddhi Yojana Calculator",
      `Daughter's date of birth: ${formatLongDate(dobDate)}`,
      `Account opened: ${formatLongDate(result.openingDate)} (age ${result.ageAtOpening})`,
      `Yearly deposit: ${formatINR(safeDeposit)} for ${DEPOSIT_YEARS} years`,
      `Interest rate: ${safeRate}% p.a., compounded yearly`,
      "",
      `Maturity amount: ${formatINR(result.maturity)}`,
      `Maturity date: ${formatLongDate(result.maturityDate)} (she turns ${result.ageAtMaturity})`,
      `Total deposited: ${formatINR(result.invested)}`,
      `Total interest earned: ${formatINR(result.interest)}`,
      `Effective multiple: ${result.multiple.toFixed(2)}x`,
      "",
      `Last deposit due: ${formatLongDate(result.lastDepositDate)} (deposits run for the first 15 years only)`,
      result.withdrawalLimit !== null
        ? `Education withdrawal at 18 (${result.withdrawalYear}): up to ${formatINR(result.withdrawalLimit)} (50% of the previous year's balance)`
        : "Education withdrawal at 18: 50% of the previous financial year's balance",
      "Tax status: EEE - deposits under Section 80C, interest tax-free, maturity tax-free",
      `Generated: ${new Date().toLocaleString()}`,
    ].join("\n");
  }, [result, dobDate, safeDeposit, safeRate]);

  const copySummary = async () => {
    if (!summary) return;
    const success = await safeCopyText(summary);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const resetAll = () => {
    setDob(defaultDob());
    setDeposit(50000);
    setRate(8.2);
    setStartYearInput(null);
  };

  const ruleCards = [
    {
      icon: GraduationCap,
      title: "Partial withdrawal at 18",
      body:
        result?.withdrawalLimit !== null && result?.withdrawalLimit !== undefined
          ? `Once she turns 18 (or clears class 10), you may withdraw up to 50% of the balance held at the end of the previous financial year — about ${formatINR(
              result.withdrawalLimit
            )} in ${result.withdrawalYear} on these inputs. It is meant for higher-education fees and needs proof of admission. Take it as one lump sum or in up to five yearly instalments.`
          : "Once she turns 18 (or clears class 10), you may withdraw up to 50% of the balance held at the end of the previous financial year, against proof of admission for higher education. Take it as one lump sum or in up to five yearly instalments.",
    },
    {
      icon: HeartHandshake,
      title: "Premature closure for marriage",
      body: "The account can be closed early only after she turns 18, and only for her marriage. The request must be filed between one month before and three months after the wedding date, with age proof. Closing for any other reason before 21 is not allowed unless there is a medical emergency or the account holder dies.",
    },
    {
      icon: ShieldCheck,
      title: "EEE tax status",
      body: "Sukanya Samriddhi is exempt-exempt-exempt: deposits qualify for a Section 80C deduction up to ₹1.5 lakh, the yearly interest is fully tax-free, and the entire maturity amount is tax-free in her hands.",
    },
    {
      icon: CalendarCheck,
      title: "Keep the account alive",
      body: `Deposit at least ${formatINR(MIN_DEPOSIT)} each financial year for the first 15 years. Miss a year and the account goes dormant — revive it by paying ₹50 penalty per missed year plus the ₹250 minimum. A dormant account still earns interest until it matures at 21.`,
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <PiggyBank className="h-4 w-4" />
            Girl child savings scheme
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Sukanya Samriddhi Yojana Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Model the real scheme: you deposit for the first 15 years, interest keeps compounding until the
            account matures 21 years after opening. See the maturity amount, the exact maturity date, and
            every rupee of interest along the way.
          </p>
        </section>

        {eligibility.status === "invalid" && (
          <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center gap-2 text-[var(--anslation-ds-danger)]">
              <CircleAlert className="h-5 w-5" />
              <p className="font-semibold">{eligibility.message}</p>
            </div>
          </section>
        )}

        {eligibility.status === "eligible" && (
          <section
            aria-live="polite"
            className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase"
                style={{ background: "var(--muted)", color: "var(--anslation-ds-success)" }}
              >
                <CalendarCheck className="h-4 w-4" />
                Eligible
              </span>
              <p className="text-sm text-[var(--muted-foreground)]">
                She is{" "}
                <strong className="text-[var(--foreground)]">
                  {eligibility.age.years} years {eligibility.age.months} months
                </strong>{" "}
                old. You have{" "}
                <strong className="text-[var(--foreground)]">{describeGap(eligibility.window)}</strong> left to
                open the account — the window closes on her 10th birthday,{" "}
                {formatLongDate(eligibility.tenthBirthday)}.
              </p>
            </div>
          </section>
        )}

        {eligibility.status === "ineligible" && (
          <section
            aria-live="polite"
            className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]"
          >
            <div className="flex items-start gap-3">
              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--anslation-ds-danger)]" />
              <div>
                <p className="font-semibold text-[var(--anslation-ds-danger)]">
                  A new Sukanya Samriddhi account can no longer be opened
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                  She is {eligibility.age.years} years {eligibility.age.months} months old, and the scheme only
                  accepts a girl child below 10. Her 10th birthday was {formatLongDate(eligibility.tenthBirthday)}.
                  If an account was already opened before then, it stays valid — the projection below is a what-if
                  based on a past start year. Otherwise, look at PPF, a long-term equity fund, or an RD for the
                  same goal.
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid gap-5">
              <label className="block">
                <span className="text-sm font-semibold">Daughter&apos;s date of birth</span>
                <input
                  type="date"
                  value={dob}
                  max={toDateInput(today)}
                  onChange={(event) => {
                    setDob(event.target.value);
                    setStartYearInput(null);
                  }}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                  The account must be opened before she turns 10.
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Yearly deposit (₹)</span>
                <input
                  type="number"
                  min={MIN_DEPOSIT}
                  max={MAX_DEPOSIT}
                  step={250}
                  value={deposit}
                  onChange={(event) => setDeposit(Number(event.target.value))}
                  onBlur={() => setDeposit(safeDeposit)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <input
                  type="range"
                  min={MIN_DEPOSIT}
                  max={MAX_DEPOSIT}
                  step={250}
                  value={safeDeposit}
                  onChange={(event) => setDeposit(Number(event.target.value))}
                  aria-label="Yearly deposit slider"
                  className="mt-3 w-full"
                  style={{ accentColor: "var(--primary)" }}
                />
                <span className="mt-1 flex justify-between text-xs text-[var(--muted-foreground)]">
                  <span>₹250 min</span>
                  <span>₹1,50,000 max / year</span>
                </span>
                <span className="mt-3 grid gap-2 sm:grid-cols-3 2xl:grid-cols-1">
                  {depositPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setDeposit(preset.value)}
                      className={`rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${
                        safeDeposit === preset.value
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Interest rate (% p.a.)</span>
                <input
                  type="number"
                  min={0.1}
                  max={20}
                  step={0.1}
                  value={rate}
                  onChange={(event) => setRate(Number(event.target.value))}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                  The notified rate is 8.2%. The government reviews it every quarter, so treat long projections
                  as an estimate.
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Deposit start year</span>
                <select
                  value={startYear ?? ""}
                  onChange={(event) => setStartYearInput(Number(event.target.value))}
                  disabled={!startYearOptions.length}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {startYearOptions.map((option) => (
                    <option key={option.year} value={option.year}>
                      {option.year} — she turns {option.age}
                      {option.passed ? " (passed)" : ""}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                  Only years before her 10th birthday are listed. Opening earlier means more compounding years.
                </span>
              </label>

              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-1 justify-self-start text-xs font-semibold text-[var(--primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset to defaults
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            {result ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Maturity after {MATURITY_YEARS} years
                  </p>
                  <button
                    type="button"
                    onClick={copySummary}
                    className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy summary"}
                  </button>
                </div>

                <div aria-live="polite" className="mt-4">
                  <div className="inline-block rounded-lg bg-[var(--muted)] p-5">
                    <p className="text-4xl font-semibold text-[var(--primary)]">{formatINR(result.maturity)}</p>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                      Payable on {formatLongDate(result.maturityDate)}, when she turns {result.ageAtMaturity}.
                    </p>
                  </div>

                  <div className="tool-compact-grid mt-6">
                    <StatTile
                      label="Total deposited"
                      value={formatINR(result.invested)}
                      hint={`${formatINR(safeDeposit)} × ${DEPOSIT_YEARS} years`}
                    />
                    <StatTile
                      label="Total interest"
                      value={formatINR(result.interest)}
                      hint={`${((result.interest / result.maturity) * 100).toFixed(1)}% of the maturity value`}
                    />
                    <StatTile
                      label="Effective multiple"
                      value={`${result.multiple.toFixed(2)}x`}
                      hint="of what you put in"
                    />
                  </div>

                  <div className="tool-compact-grid mt-3">
                    <StatTile
                      label="Account opens"
                      value={formatLongDate(result.openingDate)}
                      hint={`She is ${result.ageAtOpening} at opening`}
                    />
                    <StatTile
                      label="Last deposit due"
                      value={formatLongDate(result.lastDepositDate)}
                      hint="Deposits stop after 15 years"
                    />
                    <StatTile
                      label="Growth-only phase"
                      value={`${MATURITY_YEARS - DEPOSIT_YEARS} years`}
                      hint={`Adds ${formatINR(
                        result.maturity - result.rows[DEPOSIT_YEARS - 1].closing
                      )} with no deposits`}
                    />
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
                  Formula: each year, balance = (balance + deposit) × (1 + {safeRate}%). Deposits run for years
                  1-15 only; years 16-21 earn interest on the untouched balance. Deposits are assumed as one
                  lump sum at the start of each year — bank calculators that assume 12 monthly instalments will
                  show a slightly lower figure, because your money starts compounding later.
                </p>

                <GrowthBars rows={result.rows} />
              </>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">
                Enter a valid date of birth to see the projection.
              </p>
            )}
          </div>
        </section>

        {result && (
          <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="text-lg font-semibold">Year-wise growth</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Every deposit, every interest credit, and her age at each step — all {MATURITY_YEARS} years.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    <th className="px-3 py-2">Year</th>
                    <th className="px-3 py-2">Her age</th>
                    <th className="px-3 py-2">Deposit</th>
                    <th className="px-3 py-2">Interest earned</th>
                    <th className="px-3 py-2">Closing balance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={row.year} className="border-b border-[var(--border)] last:border-b-0">
                      <td className="px-3 py-2 font-semibold">
                        {row.year}
                        <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">
                          {row.calendarYear}
                        </span>
                        {row.year === DEPOSIT_YEARS && (
                          <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--primary)]">
                            Last deposit
                          </span>
                        )}
                        {row.year === MATURITY_YEARS && (
                          <span
                            className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                            style={{ background: "var(--muted)", color: "var(--anslation-ds-success)" }}
                          >
                            Matures
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">{row.age}</td>
                      <td className="px-3 py-2">
                        {row.deposit > 0 ? (
                          formatINR(row.deposit)
                        ) : (
                          <span className="text-[var(--muted-foreground)]">— no deposit</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-[var(--anslation-ds-success)]">{formatINR(row.interest)}</td>
                      <td className="px-3 py-2 font-semibold">{formatINR(row.closing)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          {ruleCards.map((card) => (
            <div
              key={card.title}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]"
            >
              <div className="flex items-center gap-2">
                <card.icon className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="font-semibold">{card.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{card.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            Projections assume the rate you entered holds for all 21 years. The actual Sukanya Samriddhi rate is
            reset every quarter by the Ministry of Finance, so the real maturity amount will differ. Confirm the
            current rate and rules with your post office or bank before you commit.
          </p>
        </section>
      </div>
    </main>
  );
}
