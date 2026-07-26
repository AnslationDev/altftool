"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const showDate = (ms) => (Number.isFinite(ms) ? DATE_FMT.format(new Date(ms)) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DAY_MS = 86400000;

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/** Parse a YYYY-MM-DD string into a UTC timestamp (midnight). */
function parseDate(raw) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(raw).trim());
  if (!match) return NaN;
  const [, y, m, d] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  if (month < 1 || month > 12 || day < 1 || day > 31) return NaN;
  const ts = Date.UTC(year, month - 1, day);
  const check = new Date(ts);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return NaN;
  }
  return ts;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

/** Add whole months to a UTC timestamp, clamping to the last valid day of the target month. */
function addMonths(ts, months) {
  const date = new Date(ts);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const targetMonth = month + months;
  const targetYear = year + Math.floor(targetMonth / 12);
  const normalisedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, normalisedMonth + 1, 0)).getUTCDate();
  return Date.UTC(targetYear, normalisedMonth, Math.min(day, lastDay));
}

const FREQUENCIES = [
  { id: "monthly", label: "Monthly", step: 1, perYear: 12 },
  { id: "quarterly", label: "Quarterly", step: 3, perYear: 4 },
  { id: "yearly", label: "Yearly (lump sum series)", step: 12, perYear: 1 },
  { id: "one-time", label: "One-time lump sum", step: 0, perYear: 0 },
];

/**
 * ELSS units carry a hard 3-year lock-in counted from the allotment date of that
 * particular instalment — so every SIP instalment frees up on its own date.
 */
function buildSchedule({ amount, count, startTs, stepMonths, asOfTs, rate }) {
  const rows = [];
  let unlockedInvested = 0;
  let lockedInvested = 0;
  let unlockedValue = 0;
  let lockedValue = 0;

  for (let i = 0; i < count; i += 1) {
    const investedOn = stepMonths > 0 ? addMonths(startTs, i * stepMonths) : startTs;
    const unlocksOn = addMonths(investedOn, 36);
    const isFree = asOfTs >= unlocksOn;
    const heldYears = Math.max(0, (asOfTs - investedOn) / (365.25 * DAY_MS));
    const value = amount * Math.pow(1 + rate / 100, heldYears);

    if (isFree) {
      unlockedInvested += amount;
      unlockedValue += value;
    } else {
      lockedInvested += amount;
      lockedValue += value;
    }

    rows.push({
      index: i + 1,
      investedOn,
      unlocksOn,
      isFree,
      daysLeft: isFree ? 0 : Math.ceil((unlocksOn - asOfTs) / DAY_MS),
      value,
    });
  }

  const next = rows.find((row) => !row.isFree) || null;
  const nextBatch = next ? rows.filter((row) => row.unlocksOn === next.unlocksOn) : [];

  return {
    rows,
    unlockedInvested,
    lockedInvested,
    unlockedValue,
    lockedValue,
    next,
    nextAmount: nextBatch.length * amount,
    fullyFreeOn: rows.length ? rows[rows.length - 1].unlocksOn : NaN,
  };
}

export default function ToolHome() {
  const [amount, setAmount] = useState("5000");
  const [frequency, setFrequency] = useState("monthly");
  const [count, setCount] = useState("12");
  const [startDate, setStartDate] = useState("2023-01-10");
  const [asOf, setAsOf] = useState(todayISO());
  const [rate, setRate] = useState("12");
  const [showAll, setShowAll] = useState(false);
  const [copied, setCopied] = useState(false);

  const freq = FREQUENCIES.find((item) => item.id === frequency) || FREQUENCIES[0];

  const calc = useMemo(() => {
    const amt = toNumber(amount);
    const n = frequency === "one-time" ? 1 : toNumber(count);
    const r = toNumber(rate);
    const startTs = parseDate(startDate);
    const asOfTs = parseDate(asOf);

    if ([amt, n, r].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers for amount, instalments and expected return." };
    }
    if (!Number.isFinite(startTs)) return { error: "Enter a valid first investment date (YYYY-MM-DD)." };
    if (!Number.isFinite(asOfTs)) return { error: "Enter a valid 'as on' date (YYYY-MM-DD)." };
    if (amt <= 0) return { error: "Instalment amount must be greater than zero." };
    if (!Number.isInteger(n) || n < 1 || n > 600) {
      return { error: "Number of instalments must be a whole number between 1 and 600." };
    }
    if (r < -50 || r > 50) return { error: "Expected return should be between -50% and 50% per year." };
    if (asOfTs < startTs) return { error: "The 'as on' date cannot be before the first investment date." };

    const schedule = buildSchedule({
      amount: amt,
      count: n,
      startTs,
      stepMonths: freq.step,
      asOfTs,
      rate: r,
    });

    const invested = amt * n;
    return {
      ...schedule,
      amount: amt,
      count: n,
      invested,
      asOfTs,
      unlockedShare: invested > 0 ? (schedule.unlockedInvested / invested) * 100 : 0,
    };
  }, [amount, count, rate, startDate, asOf, frequency, freq.step]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "ELSS Lock-in Tracker",
      `Instalment: ${money(calc.amount)} ${freq.label.toLowerCase()} x ${calc.count}`,
      `Total invested: ${money(calc.invested)}`,
      `As on: ${showDate(calc.asOfTs)}`,
      `Free to redeem: ${money(calc.unlockedInvested)} invested (${NUM.format(calc.unlockedShare)}% of corpus)`,
      `Still locked: ${money(calc.lockedInvested)} invested`,
      `Estimated value now — free: ${money(calc.unlockedValue)}, locked: ${money(calc.lockedValue)}`,
      calc.next
        ? `Next unlock: ${money(calc.nextAmount)} on ${showDate(calc.next.unlocksOn)} (${calc.next.daysLeft} days away)`
        : "Every instalment has cleared its 3-year lock-in.",
      `Entire investment free from: ${showDate(calc.fullyFreeOn)}`,
    ].join("\n");
  }, [calc, freq.label]);

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
    setAmount("5000");
    setFrequency("monthly");
    setCount("12");
    setStartDate("2023-01-10");
    setAsOf(todayISO());
    setRate("12");
    setShowAll(false);
    setCopied(false);
  };

  const visibleRows = calc.error ? [] : showAll ? calc.rows : calc.rows.slice(0, 12);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Mutual funds
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">ELSS Lock-in Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every ELSS instalment is locked for three years from its own allotment date. Enter your SIP
          and see exactly which instalments are already free to redeem, which are still locked and
          when the next tranche opens up.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="elss-amount">
              Instalment amount (INR)
            </label>
            <input
              id="elss-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="elss-frequency">
              Investment frequency
            </label>
            <select
              id="elss-frequency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={frequency}
              onChange={(event) => setFrequency(event.target.value)}
            >
              {FREQUENCIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="elss-count">
              Number of instalments
            </label>
            <input
              id="elss-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="600"
              step="1"
              value={frequency === "one-time" ? "1" : count}
              disabled={frequency === "one-time"}
              onChange={(event) => setCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="elss-start">
              First investment date
            </label>
            <input
              id="elss-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="elss-asof">
              Show status as on
            </label>
            <input
              id="elss-asof"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={asOf}
              onChange={(event) => setAsOf(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="elss-rate">
              Assumed return (% per year)
            </label>
            <input
              id="elss-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-50"
              max="50"
              step="0.5"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
        </div>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Free to redeem as on {showDate(calc.asOfTs)}
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.unlockedInvested)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {NUM.format(calc.unlockedShare)}% of {money(calc.invested)} invested has cleared the
                  3-year lock-in
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy ELSS lock-in result"
                  className={GHOST_BTN}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Total invested", money(calc.invested)],
                ["Invested amount still locked", money(calc.lockedInvested)],
                ["Estimated value of unlocked units", money(calc.unlockedValue)],
                ["Estimated value of locked units", money(calc.lockedValue)],
                [
                  "Next instalment to unlock",
                  calc.next
                    ? `${money(calc.nextAmount)} on ${showDate(calc.next.unlocksOn)} (${calc.next.daysLeft} days)`
                    : "Nothing pending",
                ],
                ["Entire investment free from", showDate(calc.fullyFreeOn)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5">
              <div
                className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`${NUM.format(calc.unlockedShare)} percent unlocked, ${NUM.format(100 - calc.unlockedShare)} percent still locked`}
              >
                <span
                  className="block h-full bg-[var(--success)]"
                  style={{ width: `${Math.max(0, Math.min(100, calc.unlockedShare))}%` }}
                />
                <span
                  className="block h-full bg-[var(--primary)]"
                  style={{ width: `${Math.max(0, Math.min(100, 100 - calc.unlockedShare))}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Unlocked {NUM.format(calc.unlockedShare)}% · Locked {NUM.format(100 - calc.unlockedShare)}%
              </p>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Instalment-wise unlock calendar</h2>
              {calc.rows.length > 12 && (
                <button
                  type="button"
                  onClick={() => setShowAll((value) => !value)}
                  aria-expanded={showAll}
                  className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {showAll ? "Show first 12" : `Show all ${calc.rows.length}`}
                </button>
              )}
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">#</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Invested on</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Unlocks on</th>
                    <th scope="col" className="py-2 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.index} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.index}</td>
                      <td className="py-2 pr-3">{showDate(row.investedOn)}</td>
                      <td className="py-2 pr-3">{showDate(row.unlocksOn)}</td>
                      <td className="py-2 text-right">
                        <span
                          className={
                            row.isFree
                              ? "rounded-md bg-[var(--success-soft)] px-2 py-1 text-xs font-semibold text-[var(--success)]"
                              : "rounded-md bg-[var(--warning-soft)] px-2 py-1 text-xs font-semibold text-[var(--warning)]"
                          }
                        >
                          {row.isFree ? "Free" : `${row.daysLeft}d left`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. ELSS units are locked for 36 months from the date of allotment,
        which can differ from your debit date by a day or two. Growth figures assume a constant
        return and ignore exit loads, taxes and actual NAV movement.
      </p>
    </main>
  );
}
