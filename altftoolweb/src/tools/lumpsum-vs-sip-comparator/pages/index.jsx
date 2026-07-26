"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const DEFAULTS = {
  lumpsum: "600000",
  years: "10",
  returnRate: "12",
  sip: "5000",
  matchTotal: true,
};

const inr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const num = (value, digits = 2) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(
    Number.isFinite(value) ? value : 0
  );

const inputClass =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none disabled:opacity-60";
const labelClass = "text-sm font-medium text-[var(--foreground)]";
const hintClass = "mt-1 text-xs text-[var(--muted-foreground)]";
const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const ghostButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function lumpsumValue(principal, monthlyRate, months) {
  return principal * Math.pow(1 + monthlyRate, months);
}

// SIP instalment paid at the start of every month (standard Indian SIP convention).
function sipValue(instalment, monthlyRate, months) {
  if (months <= 0) return 0;
  if (monthlyRate === 0) return instalment * months;
  return instalment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
}

export default function ToolHome() {
  const [lumpsum, setLumpsum] = useState(DEFAULTS.lumpsum);
  const [years, setYears] = useState(DEFAULTS.years);
  const [returnRate, setReturnRate] = useState(DEFAULTS.returnRate);
  const [sip, setSip] = useState(DEFAULTS.sip);
  const [matchTotal, setMatchTotal] = useState(DEFAULTS.matchTotal);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(
    () => ({
      lumpsum: Number(lumpsum),
      years: Number(years),
      returnRate: Number(returnRate),
      sip: Number(sip),
    }),
    [lumpsum, years, returnRate, sip]
  );

  const error = useMemo(() => {
    const { lumpsum: p, years: y, returnRate: r, sip: m } = parsed;
    if (![p, y, r, m].every((value) => Number.isFinite(value))) {
      return "Please enter numbers in every field.";
    }
    if (p <= 0) return "Lumpsum amount must be greater than zero.";
    if (y <= 0 || y > 50) return "Investment period should be between 1 and 50 years.";
    if (r < 0 || r > 30) return "Expected return should be between 0% and 30% per year.";
    if (!matchTotal && m <= 0) return "Monthly SIP amount must be greater than zero.";
    return "";
  }, [parsed, matchTotal]);

  const result = useMemo(() => {
    if (error) return null;

    const months = Math.round(parsed.years * 12);
    const monthlyRate = parsed.returnRate / 1200;
    const sipAmount = matchTotal ? parsed.lumpsum / months : parsed.sip;

    const lumpsumFinal = lumpsumValue(parsed.lumpsum, monthlyRate, months);
    const sipFinal = sipValue(sipAmount, monthlyRate, months);
    const sipInvested = sipAmount * months;

    const yearly = [];
    for (let year = 1; year <= Math.min(parsed.years, 30); year += 1) {
      const m = year * 12;
      yearly.push({
        year,
        lumpsum: lumpsumValue(parsed.lumpsum, monthlyRate, m),
        sip: sipValue(sipAmount, monthlyRate, m),
        sipInvested: sipAmount * m,
      });
    }

    return {
      months,
      sipAmount,
      lumpsumFinal,
      lumpsumGain: lumpsumFinal - parsed.lumpsum,
      sipFinal,
      sipInvested,
      sipGain: sipFinal - sipInvested,
      difference: lumpsumFinal - sipFinal,
      lumpsumMultiple: parsed.lumpsum > 0 ? lumpsumFinal / parsed.lumpsum : 0,
      sipMultiple: sipInvested > 0 ? sipFinal / sipInvested : 0,
      yearly,
    };
  }, [error, parsed, matchTotal]);

  const winner = useMemo(() => {
    if (!result) return null;
    if (Math.abs(result.difference) < 1) return "tie";
    return result.difference > 0 ? "lumpsum" : "sip";
  }, [result]);

  const summaryText = useMemo(() => {
    if (!result) return "";
    return [
      "Lumpsum vs SIP Comparator — ALTFTool",
      `Period: ${num(parsed.years)} years (${result.months} months) at ${num(parsed.returnRate)}% p.a.`,
      "",
      `Lumpsum invested: ${inr(parsed.lumpsum)}`,
      `Lumpsum final corpus: ${inr(result.lumpsumFinal)} (gain ${inr(result.lumpsumGain)})`,
      "",
      `SIP instalment: ${inr(result.sipAmount)} per month`,
      `SIP total invested: ${inr(result.sipInvested)}`,
      `SIP final corpus: ${inr(result.sipFinal)} (gain ${inr(result.sipGain)})`,
      "",
      winner === "tie"
        ? "Both routes end up with the same corpus."
        : winner === "lumpsum"
          ? `Lumpsum ends ${inr(Math.abs(result.difference))} ahead.`
          : `SIP ends ${inr(Math.abs(result.difference))} ahead.`,
    ].join("\n");
  }, [parsed, result, winner]);

  const handleCopy = async () => {
    if (!summaryText) return;
    const ok = await safeCopyText(summaryText);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReset = () => {
    setLumpsum(DEFAULTS.lumpsum);
    setYears(DEFAULTS.years);
    setReturnRate(DEFAULTS.returnRate);
    setSip(DEFAULTS.sip);
    setMatchTotal(DEFAULTS.matchTotal);
    setCopied(false);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          Mutual funds
        </div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
          Lumpsum vs SIP Comparator
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
          Put a one-time investment head to head with a monthly SIP over the same period and return,
          and see which route builds the larger corpus.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          aria-label="Investment inputs"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="lvs-lumpsum">
                Lumpsum amount (₹)
              </label>
              <input
                id="lvs-lumpsum"
                type="number"
                inputMode="decimal"
                min="0"
                step="10000"
                className={`mt-2 ${inputClass}`}
                value={lumpsum}
                onChange={(event) => setLumpsum(event.target.value)}
              />
              <p className={hintClass}>{inr(parsed.lumpsum)} invested on day one.</p>
            </div>

            <div>
              <label className={labelClass} htmlFor="lvs-years">
                Investment period (years)
              </label>
              <input
                id="lvs-years"
                type="number"
                inputMode="decimal"
                min="1"
                max="50"
                step="1"
                className={`mt-2 ${inputClass}`}
                value={years}
                onChange={(event) => setYears(event.target.value)}
              />
              <p className={hintClass}>Same holding period for both routes.</p>
            </div>

            <div>
              <label className={labelClass} htmlFor="lvs-return">
                Expected return (% per year)
              </label>
              <input
                id="lvs-return"
                type="number"
                inputMode="decimal"
                min="0"
                max="30"
                step="0.1"
                className={`mt-2 ${inputClass}`}
                value={returnRate}
                onChange={(event) => setReturnRate(event.target.value)}
              />
              <p className={hintClass}>Compounded monthly for both routes.</p>
            </div>

            <div>
              <label className={labelClass} htmlFor="lvs-sip">
                Monthly SIP (₹)
              </label>
              <input
                id="lvs-sip"
                type="number"
                inputMode="decimal"
                min="0"
                step="500"
                className={`mt-2 ${inputClass}`}
                value={matchTotal && result ? Math.round(result.sipAmount) : sip}
                onChange={(event) => setSip(event.target.value)}
                disabled={matchTotal}
              />
              <p className={hintClass}>
                {matchTotal
                  ? "Auto-set so both routes invest the same total money."
                  : "Custom instalment — totals will differ."}
              </p>
            </div>
          </div>

          <label className="mt-4 flex items-start gap-3 text-sm text-[var(--foreground)]">
            <input
              type="checkbox"
              id="lvs-match"
              checked={matchTotal}
              onChange={(event) => setMatchTotal(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            />
            <span>
              Spread the same total money across the SIP
              <span className="block text-xs text-[var(--muted-foreground)]">
                Uncheck to test any monthly amount you like.
              </span>
            </span>
          </label>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className={primaryButton}
              onClick={handleCopy}
              disabled={!result}
              aria-label="Copy the lumpsum versus SIP comparison to clipboard"
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
              className={ghostButton}
              onClick={handleReset}
              aria-label="Reset all inputs to default values"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </section>

        <section
          className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            {winner === "tie"
              ? "Difference between the two routes"
              : winner === "sip"
                ? "SIP corpus is bigger by"
                : "Lumpsum corpus is bigger by"}
          </p>
          <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
            {result ? inr(Math.abs(result.difference)) : "—"}
          </p>
          {result ? (
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {winner === "tie"
                ? "Both routes finish level."
                : winner === "lumpsum"
                  ? "Money invested earlier stays invested longer, so it compounds more."
                  : "The SIP wins here because its instalments add up to more money than the lumpsum."}
            </p>
          ) : null}

          {result ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Lumpsum
                </p>
                <p className="mt-1 text-xl font-semibold text-[var(--foreground)]">
                  {inr(result.lumpsumFinal)}
                </p>
                <dl className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-[var(--muted-foreground)]">Invested</dt>
                    <dd className="text-[var(--foreground)]">{inr(parsed.lumpsum)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[var(--muted-foreground)]">Gain</dt>
                    <dd className="text-[var(--success)]">{inr(result.lumpsumGain)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[var(--muted-foreground)]">Money multiple</dt>
                    <dd className="text-[var(--foreground)]">{num(result.lumpsumMultiple)}x</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg border border-[var(--border)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  SIP · {inr(result.sipAmount)}/month
                </p>
                <p className="mt-1 text-xl font-semibold text-[var(--foreground)]">
                  {inr(result.sipFinal)}
                </p>
                <dl className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-[var(--muted-foreground)]">Invested</dt>
                    <dd className="text-[var(--foreground)]">{inr(result.sipInvested)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[var(--muted-foreground)]">Gain</dt>
                    <dd className="text-[var(--success)]">{inr(result.sipGain)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[var(--muted-foreground)]">Money multiple</dt>
                    <dd className="text-[var(--foreground)]">{num(result.sipMultiple)}x</dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-[var(--muted-foreground)]">
              Fix the highlighted input to compare the two routes.
            </p>
          )}

          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            Both routes assume a steady {num(parsed.returnRate)}% a year. In real markets a SIP buys
            more units when prices fall, so a falling-then-rising market usually favours the SIP,
            while a straight bull run favours the lumpsum.
          </p>
        </section>
      </div>

      {result ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Growth year by year</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Year
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Lumpsum value
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    SIP invested
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    SIP value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {result.yearly.map((row) => (
                  <tr key={row.year}>
                    <td className="py-2 pr-3 font-medium text-[var(--foreground)]">{row.year}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{inr(row.lumpsum)}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {inr(row.sipInvested)}
                    </td>
                    <td className="py-2 font-medium text-[var(--foreground)]">{inr(row.sip)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
