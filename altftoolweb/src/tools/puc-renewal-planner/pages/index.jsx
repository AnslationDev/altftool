"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Leaf, RotateCcw } from "lucide-react";
import {
  FIRST_CERTIFICATE_MONTHS,
  NO_PUC_PENALTY_INR,
  RENEWAL_MONTHS,
  VEHICLE_CATEGORIES,
  addMonths,
  planPuc,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SEED_TODAY = "2026-01-01";
const DEFAULT_BUFFER = "10";
const DEFAULT_HORIZON = "5";
const DEFAULT_CATEGORY = "car-petrol";

function localIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

const prettyDate = (iso) => {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))));
};

const dayPhrase = (days) => {
  if (!Number.isFinite(days)) return "—";
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days === 0) return "today";
  return `in ${days} days`;
};

const toNumber = (raw) => {
  if (String(raw).trim() === "") return NaN;
  return Number(String(raw).replace(/,/g, "").trim());
};

export default function ToolHome() {
  const [today, setToday] = useState(SEED_TODAY);
  const [issueDate, setIssueDate] = useState(() => addMonths(SEED_TODAY, -4));
  const [isFirst, setIsFirst] = useState(false);
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORY);
  const [fee, setFee] = useState("");
  const [buffer, setBuffer] = useState(DEFAULT_BUFFER);
  const [horizon, setHorizon] = useState(DEFAULT_HORIZON);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const real = localIsoDate();
    setToday(real);
    setIssueDate(addMonths(real, -4));
  }, []);

  const result = useMemo(() => {
    const feeValue = fee.trim() === "" ? undefined : toNumber(fee);
    return planPuc({
      issueDate,
      isFirstCertificate: isFirst,
      today,
      categoryId,
      fee: feeValue,
      bufferDays: toNumber(buffer),
      horizonYears: toNumber(horizon),
    });
  }, [issueDate, isFirst, today, categoryId, fee, buffer, horizon]);

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "PUC Renewal Planner",
      `Vehicle: ${result.categoryLabel}`,
      `Certificate issued: ${prettyDate(result.issueDate)} (valid ${result.validityMonths} months)`,
      `Valid until: ${prettyDate(result.expiryDate)} — ${dayPhrase(result.daysLeft)}`,
      `Book the next test from: ${prettyDate(result.bookFrom)}`,
      `Test fee: ${money(result.testFee)} · ${result.testsPerYear} tests a year · ${money(result.annualCost)} per year`,
      `Next ${result.horizonYears} years: ${result.horizonTests} tests, ${money(result.horizonCost)}`,
    ].join("\n");
  }, [failed, result]);

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
    setIssueDate(addMonths(today, -4));
    setIsFirst(false);
    setCategoryId(DEFAULT_CATEGORY);
    setFee("");
    setBuffer(DEFAULT_BUFFER);
    setHorizon(DEFAULT_HORIZON);
    setCopied(false);
  };

  const expired = !failed && result.daysLeft < 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Leaf className="h-4 w-4" aria-hidden="true" />
          Vehicle compliance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">PUC Renewal Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A PUC certificate lasts {FIRST_CERTIFICATE_MONTHS} months on a newly registered vehicle and{" "}
          {RENEWAL_MONTHS} months on every renewal after that. Enter the date on your current
          certificate to get the expiry, the day to book the next test, and the running cost.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="issue-date">
              Date on the current certificate
            </label>
            <input
              id="issue-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={issueDate}
              onChange={(event) => setIssueDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="today">
              Check against date
            </label>
            <input
              id="today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="category">
              Vehicle category
            </label>
            <select
              id="category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              {VEHICLE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fee">
              Test fee you pay (INR)
            </label>
            <input
              id="fee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              placeholder="Use category default"
              value={fee}
              onChange={(event) => setFee(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              PUC charges are notified state by state and displayed at the centre.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="buffer">
              Book the test this many days early
            </label>
            <input
              id="buffer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="180"
              step="1"
              value={buffer}
              onChange={(event) => setBuffer(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="horizon">
              Plan ahead (years)
            </label>
            <input
              id="horizon"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="20"
              step="1"
              value={horizon}
              onChange={(event) => setHorizon(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex min-h-11 items-center gap-3">
          <input
            id="is-first"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={isFirst}
            onChange={(event) => setIsFirst(event.target.checked)}
          />
          <label className="text-sm font-semibold" htmlFor="is-first">
            This is the first certificate, issued with a brand-new vehicle (valid{" "}
            {FIRST_CERTIFICATE_MONTHS} months)
          </label>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Certificate valid until
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                expired ? "text-[var(--danger)]" : "text-[var(--primary)]"
              }`}
            >
              {failed ? "—" : prettyDate(result.expiryDate)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see the plan."
                : `${result.statusLabel} · expires ${dayPhrase(result.daysLeft)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the PUC renewal plan"
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
            ["Vehicle category", failed ? "—" : result.categoryLabel],
            [
              "Validity of this certificate",
              failed ? "—" : `${result.validityMonths} months from ${prettyDate(result.issueDate)}`,
            ],
            [
              "Book the next test from",
              failed ? "—" : `${prettyDate(result.bookFrom)} (${dayPhrase(result.daysUntilBooking)})`,
            ],
            ["Fee per test", failed ? "—" : money(result.testFee)],
            ["Tests per year after the first", failed ? "—" : String(result.testsPerYear)],
            ["Cost per year", failed ? "—" : money(result.annualCost)],
            [
              `Tests over ${failed ? "—" : result.horizonYears} years`,
              failed ? "—" : `${result.horizonTests} tests`,
            ],
            ["Cost over that period", failed ? "—" : money(result.horizonCost)],
            [
              "Exposure if you drive without it",
              failed ? "—" : expired ? `Up to ${money(NO_PUC_PENALTY_INR)}` : "None while in date",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Upcoming test schedule</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Test by</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Book from</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Valid until</th>
                  <th scope="col" className="py-2 text-right font-semibold">Fee</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.testOn} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3 font-semibold">{prettyDate(row.testOn)}</td>
                    <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">
                      {prettyDate(row.bookFrom)}
                    </td>
                    <td className="py-2.5 pr-3">{prettyDate(row.validUntil)}</td>
                    <td className="py-2.5 text-right">{money(row.fee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Validity follows Rule 115(7) of the Central Motor Vehicles Rules, 1989 and
        the penalty figure is the central amount in section 190(2) of the Motor Vehicles Act, 1988;
        state governments notify their own test charges and may vary enforcement. A vehicle that fails
        the emission test has to be repaired and retested before a certificate is issued.
      </p>
    </main>
  );
}
