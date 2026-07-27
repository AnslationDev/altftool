"use client";

import { useMemo, useState } from "react";
import { Activity, Check, Copy, RotateCcw } from "lucide-react";

import {
  CURRENCIES,
  INTERVAL_OPTIONS,
  PRICING_MODELS,
  computeMonitoringCost,
  formatSeconds,
} from "../lib";

const COUNT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DEC = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  endpoints: "20",
  intervalSeconds: 60,
  locations: "3",
  pricingModel: "perCheck",
  pricePerBlock: "0.50",
  pricePerMonitor: "3.00",
  platformFee: "0",
  alertsPerMonth: "60",
  pricePerAlert: "0.07",
  confirmationRetries: "1",
  retryDelaySeconds: "30",
  availabilityTarget: "99.9",
  currency: "USD",
};

const intervalLabel = (seconds) => {
  if (seconds < 60) return `${seconds} seconds`;
  if (seconds < 3600) return `${seconds / 60} minute${seconds === 60 ? "" : "s"}`;
  return `${seconds / 3600} hour${seconds === 3600 ? "" : "s"}`;
};

export default function ToolHome() {
  const [endpoints, setEndpoints] = useState(DEFAULTS.endpoints);
  const [intervalSeconds, setIntervalSeconds] = useState(DEFAULTS.intervalSeconds);
  const [locations, setLocations] = useState(DEFAULTS.locations);
  const [pricingModel, setPricingModel] = useState(DEFAULTS.pricingModel);
  const [pricePerBlock, setPricePerBlock] = useState(DEFAULTS.pricePerBlock);
  const [pricePerMonitor, setPricePerMonitor] = useState(DEFAULTS.pricePerMonitor);
  const [platformFee, setPlatformFee] = useState(DEFAULTS.platformFee);
  const [alertsPerMonth, setAlertsPerMonth] = useState(DEFAULTS.alertsPerMonth);
  const [pricePerAlert, setPricePerAlert] = useState(DEFAULTS.pricePerAlert);
  const [confirmationRetries, setConfirmationRetries] = useState(DEFAULTS.confirmationRetries);
  const [retryDelaySeconds, setRetryDelaySeconds] = useState(DEFAULTS.retryDelaySeconds);
  const [availabilityTarget, setAvailabilityTarget] = useState(DEFAULTS.availabilityTarget);
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [copied, setCopied] = useState(false);

  const money = useMemo(() => {
    const entry = CURRENCIES.find((item) => item.code === currency) || CURRENCIES[0];
    const formatter = new Intl.NumberFormat(entry.locale, {
      style: "currency",
      currency: entry.code,
      maximumFractionDigits: 2,
    });
    return (value) => formatter.format(Number.isFinite(value) ? value : 0);
  }, [currency]);

  const result = useMemo(
    () =>
      computeMonitoringCost({
        endpoints: Number(endpoints),
        intervalSeconds,
        locations: Number(locations),
        pricingModel,
        pricePerBlock: Number(pricePerBlock),
        pricePerMonitor: Number(pricePerMonitor),
        platformFee: Number(platformFee),
        alertsPerMonth: Number(alertsPerMonth),
        pricePerAlert: Number(pricePerAlert),
        confirmationRetries: Number(confirmationRetries),
        retryDelaySeconds: Number(retryDelaySeconds),
        availabilityTarget: Number(availabilityTarget),
      }),
    [
      endpoints,
      intervalSeconds,
      locations,
      pricingModel,
      pricePerBlock,
      pricePerMonitor,
      platformFee,
      alertsPerMonth,
      pricePerAlert,
      confirmationRetries,
      retryDelaySeconds,
      availabilityTarget,
    ],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Uptime Monitoring Cost",
      `Endpoints: ${COUNT.format(result.endpoints)} across ${COUNT.format(result.locations)} locations`,
      `Check interval: ${intervalLabel(result.intervalSeconds)}`,
      `Check runs per month: ${COUNT.format(result.checksPerMonth)}`,
      `Monthly cost: ${money(result.monthlyCost)}`,
      `Annual cost: ${money(result.annualCost)}`,
      `Cost per endpoint per month: ${money(result.costPerEndpoint)}`,
      `Effective cost per 1,000 checks: ${money(result.costPerThousandChecks)}`,
      `Mean time to detect: ${formatSeconds(result.meanDetectionSeconds)}`,
      `Worst-case time to detect: ${formatSeconds(result.worstDetectionSeconds)}`,
      `Monthly downtime budget at ${availabilityTarget}%: ${DEC.format(result.budgetMinutes)} min`,
    ].join("\n");
  }, [hasError, result, money, availabilityTarget]);

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
    setEndpoints(DEFAULTS.endpoints);
    setIntervalSeconds(DEFAULTS.intervalSeconds);
    setLocations(DEFAULTS.locations);
    setPricingModel(DEFAULTS.pricingModel);
    setPricePerBlock(DEFAULTS.pricePerBlock);
    setPricePerMonitor(DEFAULTS.pricePerMonitor);
    setPlatformFee(DEFAULTS.platformFee);
    setAlertsPerMonth(DEFAULTS.alertsPerMonth);
    setPricePerAlert(DEFAULTS.pricePerAlert);
    setConfirmationRetries(DEFAULTS.confirmationRetries);
    setRetryDelaySeconds(DEFAULTS.retryDelaySeconds);
    setAvailabilityTarget(DEFAULTS.availabilityTarget);
    setCurrency(DEFAULTS.currency);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Activity className="h-4 w-4" aria-hidden="true" />
          Observability
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Uptime Monitoring Cost Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Price a synthetic monitoring setup before you buy it: how many check runs your interval and
          probe locations generate each month, what that costs, and how fast you would actually notice
          an outage.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="um-endpoints">
              Endpoints monitored
            </label>
            <input
              id="um-endpoints"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={endpoints}
              onChange={(event) => setEndpoints(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="um-interval">
              Check interval
            </label>
            <select
              id="um-interval"
              className={`mt-2 ${INPUT_CLASS}`}
              value={intervalSeconds}
              onChange={(event) => setIntervalSeconds(Number(event.target.value))}
            >
              {INTERVAL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  Every {intervalLabel(option)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="um-locations">
              Probe locations
            </label>
            <input
              id="um-locations"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={locations}
              onChange={(event) => setLocations(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="um-currency">
              Currency
            </label>
            <select
              id="um-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="um-model">
              Pricing model
            </label>
            <select
              id="um-model"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pricingModel}
              onChange={(event) => setPricingModel(event.target.value)}
            >
              {PRICING_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
          {pricingModel === "perCheck" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="um-block">
                Price per 1,000 check runs
              </label>
              <input
                id="um-block"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                className={`mt-2 ${INPUT_CLASS}`}
                value={pricePerBlock}
                onChange={(event) => setPricePerBlock(event.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="um-permonitor">
                Price per monitor per location, per month
              </label>
              <input
                id="um-permonitor"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                className={`mt-2 ${INPUT_CLASS}`}
                value={pricePerMonitor}
                onChange={(event) => setPricePerMonitor(event.target.value)}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="um-fee">
              Fixed platform fee per month
            </label>
            <input
              id="um-fee"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={platformFee}
              onChange={(event) => setPlatformFee(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="um-alerts">
              Paid alerts per month (SMS / voice)
            </label>
            <input
              id="um-alerts"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={alertsPerMonth}
              onChange={(event) => setAlertsPerMonth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="um-alertprice">
              Price per alert
            </label>
            <input
              id="um-alertprice"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pricePerAlert}
              onChange={(event) => setPricePerAlert(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="um-retries">
              Confirmation retries before alerting
            </label>
            <input
              id="um-retries"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={confirmationRetries}
              onChange={(event) => setConfirmationRetries(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="um-retrydelay">
              Delay between retries (seconds)
            </label>
            <input
              id="um-retrydelay"
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              className={`mt-2 ${INPUT_CLASS}`}
              value={retryDelaySeconds}
              onChange={(event) => setRetryDelaySeconds(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="um-slo">
              Availability target (%)
            </label>
            <input
              id="um-slo"
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.01"
              className={`mt-2 ${INPUT_CLASS}`}
              value={availabilityTarget}
              onChange={(event) => setAvailabilityTarget(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
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
              Monthly monitoring cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : money(result.monthlyCost)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the cost." : `${COUNT.format(result.checksPerMonth)} check runs per month`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the monitoring cost breakdown"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
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
            ["Check runs per month", hasError ? dash : COUNT.format(result.checksPerMonth)],
            ["Check runs per day", hasError ? dash : COUNT.format(result.checksPerDay)],
            ["Billable monitors", hasError ? dash : COUNT.format(result.monitorCount)],
            ["Check / monitor charge", hasError ? dash : money(result.checkCost)],
            ["Alert charge", hasError ? dash : money(result.alertCost)],
            ["Platform fee", hasError ? dash : money(result.platformFee)],
            ["Annual cost", hasError ? dash : money(result.annualCost)],
            ["Cost per endpoint per month", hasError ? dash : money(result.costPerEndpoint)],
            ["Effective cost per 1,000 checks", hasError ? dash : money(result.costPerThousandChecks)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How fast would you notice?</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {[
            ["Mean time to detect", hasError ? dash : formatSeconds(result.meanDetectionSeconds)],
            ["Worst-case time to detect", hasError ? dash : formatSeconds(result.worstDetectionSeconds)],
            ["Monthly downtime budget", hasError ? dash : `${DEC.format(result.budgetMinutes)} min`],
            ["One missed detection uses", hasError ? dash : `${DEC.format(result.budgetShare)}% of the budget`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        {!hasError && result.note && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {result.note}
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Uses an average month of 30.4375 days so annual figures are exactly twelve months. Enter your
        vendor's own list price — plans with included quotas, annual discounts and taxes will differ.
      </p>
    </main>
  );
}
