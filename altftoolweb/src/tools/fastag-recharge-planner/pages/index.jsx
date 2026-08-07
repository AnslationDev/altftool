"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, CreditCard, RotateCcw } from "lucide-react";
import { RETURN_TRIP_MULTIPLIER, planRecharges, topUpCoverage } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SEED_TODAY = "2026-01-01";
const DEFAULTS = {
  fare: "85",
  trips: "5",
  balance: "1200",
  threshold: "200",
  targetDays: "30",
  pass: "0",
  sameDayReturn: true,
};

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

const toNumber = (raw) => {
  if (String(raw).trim() === "") return NaN;
  return Number(String(raw).replace(/,/g, "").trim());
};

export default function ToolHome() {
  const [today, setToday] = useState(SEED_TODAY);
  const [fare, setFare] = useState(DEFAULTS.fare);
  const [trips, setTrips] = useState(DEFAULTS.trips);
  const [sameDayReturn, setSameDayReturn] = useState(DEFAULTS.sameDayReturn);
  const [balance, setBalance] = useState(DEFAULTS.balance);
  const [threshold, setThreshold] = useState(DEFAULTS.threshold);
  const [targetDays, setTargetDays] = useState(DEFAULTS.targetDays);
  const [pass, setPass] = useState(DEFAULTS.pass);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setToday(localIsoDate());
  }, []);

  const result = useMemo(
    () =>
      planRecharges({
        oneWayFare: toNumber(fare),
        tripsPerWeek: toNumber(trips),
        sameDayReturn,
        balance: toNumber(balance),
        threshold: toNumber(threshold),
        targetDays: toNumber(targetDays),
        today,
        monthlyPass: toNumber(pass),
      }),
    [fare, trips, sameDayReturn, balance, threshold, targetDays, today, pass],
  );

  const failed = Boolean(result.error);

  const coverage = useMemo(() => {
    if (failed) return { error: result.error };
    return topUpCoverage(result.recommendedTopUp, result.dailyBurn, result.costPerTrip);
  }, [failed, result]);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "FASTag Recharge Planner",
      `Cost per journey: ${money2(result.costPerTrip)}${sameDayReturn ? " (same-day return)" : " (one way)"}`,
      `Daily burn: ${money2(result.dailyBurn)} · monthly ${money(result.monthlySpend)} · yearly ${money(result.annualSpend)}`,
      result.daysOfCover === null
        ? result.rechargeMessage
        : `Balance lasts ${result.daysOfCover} days — recharge by ${prettyDate(result.rechargeOn)}`,
      `Recommended top-up: ${money(result.recommendedTopUp)} to cover ${targetDays} days`,
      `Recharges per year: about ${result.rechargesPerYearWhole}`,
      sameDayReturn
        ? `Return-journey concession saves ${money(result.annualConcessionSaving)} a year`
        : "No return-journey concession applied",
    ].join("\n");
  }, [failed, result, sameDayReturn, targetDays]);

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
    setFare(DEFAULTS.fare);
    setTrips(DEFAULTS.trips);
    setSameDayReturn(DEFAULTS.sameDayReturn);
    setBalance(DEFAULTS.balance);
    setThreshold(DEFAULTS.threshold);
    setTargetDays(DEFAULTS.targetDays);
    setPass(DEFAULTS.pass);
    setCopied(false);
  };

  const urgent = !failed && result.daysOfCover !== null && result.daysOfCover <= 3;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CreditCard className="h-4 w-4" aria-hidden="true" />
          Vehicle compliance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Fastag Recharge Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn your toll habit into a burn rate: how long the current balance lasts, what to top up,
          and how much the same-day return concession — {RETURN_TRIP_MULTIPLIER} times the one-way fee
          instead of two full fares — saves you over a year.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fare">
              One-way toll fee (INR)
            </label>
            <input
              id="fare"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={fare}
              onChange={(event) => setFare(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trips">
              {sameDayReturn ? "Round trips per week" : "Single crossings per week"}
            </label>
            <input
              id="trips"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="200"
              step="1"
              value={trips}
              onChange={(event) => setTrips(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="balance">
              Current FASTag balance (INR)
            </label>
            <input
              id="balance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={balance}
              onChange={(event) => setBalance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="threshold">
              Buffer you never want to go below (INR)
            </label>
            <input
              id="threshold"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              NHAI dropped the minimum-balance rule for car, jeep and van tags in 2021 — this is your
              own cushion.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="target-days">
              I want each recharge to last (days)
            </label>
            <input
              id="target-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="365"
              step="1"
              value={targetDays}
              onChange={(event) => setTargetDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pass">
              Local monthly pass price, if offered (INR)
            </label>
            <input
              id="pass"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={pass}
              onChange={(event) => setPass(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Leave at 0 if you do not qualify. Set it to compare against pay-per-use.
            </p>
          </div>
        </div>

        <div className="mt-4 flex min-h-11 items-center gap-3">
          <input
            id="same-day"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={sameDayReturn}
            onChange={(event) => setSameDayReturn(event.target.checked)}
          />
          <label className="text-sm font-semibold" htmlFor="same-day">
            I come back through the same plaza within 24 hours
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" aria-atomic="true">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recommended top-up
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                urgent ? "text-[var(--danger)]" : "text-[var(--primary)]"
              }`}
            >
              {failed ? "—" : money(result.recommendedTopUp)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? "Fix the highlighted input to see the plan." : result.rechargeMessage}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the FASTag recharge plan"
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
            [
              sameDayReturn ? "Cost of one same-day round trip" : "Cost of one crossing",
              failed ? "—" : money2(result.costPerTrip),
            ],
            ["Spend per week", failed ? "—" : money(result.weeklySpend)],
            ["Burn per day", failed ? "—" : money2(result.dailyBurn)],
            ["Spend per month", failed ? "—" : money(result.monthlySpend)],
            ["Spend per year", failed ? "—" : money(result.annualSpend)],
            ["Balance above your buffer", failed ? "—" : money(result.usableBalance)],
            [
              "Days of cover left",
              failed || result.daysOfCover === null ? "—" : `${result.daysOfCover} days`,
            ],
            ["Recharge by", failed || !result.rechargeOn ? "—" : prettyDate(result.rechargeOn)],
            [
              "That top-up buys",
              failed || coverage.error ? "—" : `${coverage.days} days · ${coverage.trips} journeys`,
            ],
            [
              "Recharges per year",
              failed ? "—" : `about ${result.rechargesPerYearWhole} (${result.rechargesPerYear} exactly)`,
            ],
            [
              "Return-journey concession saves",
              failed
                ? "—"
                : sameDayReturn
                  ? `${money2(result.savingPerReturnTrip)} per trip · ${money(result.annualConcessionSaving)} a year`
                  : "Not applied",
            ],
            [
              "Monthly pass verdict",
              failed || !result.passVerdict
                ? "No pass entered"
                : result.passVerdict.better === "pass"
                  ? `Pass is cheaper by ${money(result.passVerdict.saving)} a month`
                  : `Pay-per-use is cheaper by ${money(result.passVerdict.saving)} a month`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && result.schedule.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Next six recharges</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Recharge on</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Amount</th>
                  <th scope="col" className="py-2 font-semibold">Covers until</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.date} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3 font-semibold">{prettyDate(row.date)}</td>
                    <td className="py-2.5 pr-3 text-right">{money(row.amount)}</td>
                    <td className="py-2.5 text-[var(--muted-foreground)]">
                      {prettyDate(row.coversUntil)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. Toll rates are notified plaza by plaza and revised each year, the same-day
        return concession applies only where the return journey is through the same plaza within 24
        hours, and local monthly passes are limited to eligible non-commercial vehicles registered near
        the plaza. Check your plaza&apos;s current rate board and your issuing bank&apos;s terms.
      </p>
    </main>
  );
}
