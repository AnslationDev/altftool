"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Youtube } from "lucide-react";
import {
  YT_LONG_FORM_CREATOR_SHARE,
  YT_SHORTS_CREATOR_SHARE,
  buildScenarios,
  cpmToRpm,
  estimateEarnings,
} from "../lib";

const DEFAULTS = {
  monthlyViews: "250000",
  rpm: "120",
  lowRpm: "60",
  highRpm: "200",
  months: "12",
  cpm: "400",
  monetizedRate: "55",
  currency: "INR",
  format: "long",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return String(raw).trim() === "" ? NaN : value;
};

export default function ToolHome() {
  const [monthlyViews, setMonthlyViews] = useState(DEFAULTS.monthlyViews);
  const [rpm, setRpm] = useState(DEFAULTS.rpm);
  const [lowRpm, setLowRpm] = useState(DEFAULTS.lowRpm);
  const [highRpm, setHighRpm] = useState(DEFAULTS.highRpm);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [cpm, setCpm] = useState(DEFAULTS.cpm);
  const [monetizedRate, setMonetizedRate] = useState(DEFAULTS.monetizedRate);
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [format, setFormat] = useState(DEFAULTS.format);
  const [copied, setCopied] = useState(false);

  const money = useMemo(() => {
    const locale = currency === "INR" ? "en-IN" : "en-US";
    const fmt = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    return (value) => (Number.isFinite(value) ? fmt.format(value) : DASH);
  }, [currency]);

  const moneyFine = useMemo(() => {
    const locale = currency === "INR" ? "en-IN" : "en-US";
    const fmt = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    });
    return (value) => (Number.isFinite(value) ? fmt.format(value) : DASH);
  }, [currency]);

  const countFmt = useMemo(
    () => new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US"),
    [currency],
  );

  const share = format === "shorts" ? YT_SHORTS_CREATOR_SHARE : YT_LONG_FORM_CREATOR_SHARE;

  const result = useMemo(
    () =>
      estimateEarnings({
        monthlyViews: toNumber(monthlyViews),
        rpm: toNumber(rpm),
        months: toNumber(months),
      }),
    [monthlyViews, rpm, months],
  );

  const scenarios = useMemo(
    () =>
      buildScenarios({
        monthlyViews: toNumber(monthlyViews),
        lowRpm: toNumber(lowRpm),
        expectedRpm: toNumber(rpm),
        highRpm: toNumber(highRpm),
        months: toNumber(months),
      }),
    [monthlyViews, lowRpm, rpm, highRpm, months],
  );

  const derived = useMemo(
    () =>
      cpmToRpm({
        cpm: toNumber(cpm),
        monetizedPlaybackRate: toNumber(monetizedRate),
        creatorShare: share,
      }),
    [cpm, monetizedRate, share],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "YouTube RPM Earnings Estimate",
      `Monthly views: ${countFmt.format(result.monthlyViews)}`,
      `RPM: ${moneyFine(result.rpm)} per 1,000 views`,
      `Estimated monthly revenue: ${money(result.monthly)}`,
      `Over ${result.months} month(s): ${money(result.period)}`,
      `Annualised: ${money(result.annual)}`,
      scenarios.error
        ? ""
        : scenarios.rows
            .map((row) => `${row.label} (RPM ${moneyFine(row.rpm)}): ${money(row.monthly)}/month`)
            .join("\n"),
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, result, scenarios, money, moneyFine, countFmt]);

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
    setMonthlyViews(DEFAULTS.monthlyViews);
    setRpm(DEFAULTS.rpm);
    setLowRpm(DEFAULTS.lowRpm);
    setHighRpm(DEFAULTS.highRpm);
    setMonths(DEFAULTS.months);
    setCpm(DEFAULTS.cpm);
    setMonetizedRate(DEFAULTS.monetizedRate);
    setCurrency(DEFAULTS.currency);
    setFormat(DEFAULTS.format);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Youtube className="h-4 w-4" aria-hidden="true" />
          Creator earnings
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          YouTube RPM Earnings Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          RPM is revenue you keep per 1,000 total views, so earnings are simply views divided by
          1,000 times RPM. Enter your own numbers from YouTube Analytics for a realistic band.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-views">
              Monthly views
            </label>
            <input
              id="yt-views"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              value={monthlyViews}
              onChange={(event) => setMonthlyViews(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-currency">
              Currency
            </label>
            <select
              id="yt-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              <option value="INR">INR (Indian rupee)</option>
              <option value="USD">USD (US dollar)</option>
              <option value="GBP">GBP (pound sterling)</option>
              <option value="EUR">EUR (euro)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-rpm">
              Expected RPM (per 1,000 views)
            </label>
            <input
              id="yt-rpm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={rpm}
              onChange={(event) => setRpm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-months">
              Period (months)
            </label>
            <input
              id="yt-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-low">
              Conservative RPM
            </label>
            <input
              id="yt-low"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={lowRpm}
              onChange={(event) => setLowRpm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-high">
              Optimistic RPM
            </label>
            <input
              id="yt-high"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={highRpm}
              onChange={(event) => setHighRpm(event.target.value)}
            />
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated monthly revenue
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.monthly) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${countFmt.format(result.monthlyViews)} views a month at ${moneyFine(result.rpm)} RPM`
                : "Fix the input above to see a figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy YouTube earnings estimate"
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
            ["Revenue over the chosen period", ok ? money(result.period) : DASH],
            ["Views over the chosen period", ok ? countFmt.format(result.periodViews) : DASH],
            ["Annualised revenue (12 months)", ok ? money(result.annual) : DASH],
            ["Revenue per 1,000 views", ok ? moneyFine(result.perThousandViews) : DASH],
            ["Revenue per single view", ok ? moneyFine(result.perView) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Scenario band</h2>
        {scenarios.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {scenarios.error}
          </p>
        ) : (
          <>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Scenario
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      RPM
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Per month
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Per year
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.rows.map((row) => (
                    <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.label}</td>
                      <td className="py-2 pr-3 text-right">{moneyFine(row.rpm)}</td>
                      <td className="py-2 pr-3 text-right">{money(row.monthly)}</td>
                      <td className="py-2 text-right">{money(row.annual)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              Spread between the conservative and optimistic year: {money(scenarios.spread)}.
            </p>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Cross-check from CPM</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          If you only know the advertiser-side CPM, this converts it into the RPM it implies.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-cpm">
              CPM (advertiser cost per 1,000 impressions)
            </label>
            <input
              id="yt-cpm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={cpm}
              onChange={(event) => setCpm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yt-monetized">
              Monetized playback rate (%)
            </label>
            <input
              id="yt-monetized"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={monetizedRate}
              onChange={(event) => setMonetizedRate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="yt-format">
              Format (sets the creator revenue share)
            </label>
            <select
              id="yt-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              <option value="long">Long-form watch page — creator keeps 55%</option>
              <option value="shorts">Shorts creator pool — creator keeps 45%</option>
            </select>
          </div>
        </div>

        {derived.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {derived.error}
          </p>
        ) : (
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["RPM implied by this CPM", moneyFine(derived.rpm)],
              ["Creator share of every 1,000 monetized playbacks", moneyFine(derived.creatorPerThousandMonetized)],
              ["Creator revenue share applied", `${Math.round(derived.creatorShare * 100)}%`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
        {!derived.error ? (
          <button
            type="button"
            onClick={() => setRpm(String(Math.round(derived.rpm * 100) / 100))}
            className={`mt-4 ${GHOST_BTN}`}
          >
            Use this RPM above
          </button>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Actual payouts vary with geography, season, advertiser demand
        and content category, and YouTube deducts applicable taxes before payment.
      </p>
    </main>
  );
}
