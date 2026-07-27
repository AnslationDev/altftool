"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Receipt, RotateCcw } from "lucide-react";

import { PRICE_TIERS, computeCostPerThousand } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const usd = (value, digits = 2) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);

const smartUsd = (value) => {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return usd(0, 2);
  if (Math.abs(value) < 0.01) return usd(value, 6);
  if (Math.abs(value) < 1) return usd(value, 4);
  return usd(value, 2);
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

const DEFAULTS = {
  inputTokens: "1200",
  outputTokens: "350",
  inputPerMTok: "0.15",
  outputPerMTok: "0.6",
  cachedInputPerMTok: "0.015",
  cacheHitPercent: "0",
  retryPercent: "0",
  requestsPerMonth: "1000000",
};

export default function ToolHome() {
  const [fields, setFields] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setFields((current) => ({ ...current, [key]: event.target.value }));

  const applyTier = (tier) => {
    setFields((current) => ({
      ...current,
      inputPerMTok: String(tier.input),
      outputPerMTok: String(tier.output),
      cachedInputPerMTok: String(tier.cached),
    }));
    setCopied(false);
  };

  const result = useMemo(() => {
    const parsed = {};
    for (const key of Object.keys(DEFAULTS)) {
      const value = toNumber(fields[key]);
      if (Number.isNaN(value)) return { error: "Every field must be a number." };
      parsed[key] = value;
    }
    return computeCostPerThousand(parsed);
  }, [fields]);

  const ok = !result.error;
  const dash = "—";

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "AI cost per 1,000 requests",
      `Tokens per request: ${fields.inputTokens} in / ${fields.outputTokens} out`,
      `Rates: ${fields.inputPerMTok} in / ${fields.outputPerMTok} out per 1M tokens`,
      `Cost per request: ${smartUsd(result.costPerRequest)}`,
      `Cost per 1,000 requests: ${smartUsd(result.costPer1000)}`,
      `Cost per million requests: ${usd(result.costPerMillion)}`,
      `Monthly cost at ${fields.requestsPerMonth} requests: ${usd(result.monthlyCost)}`,
    ].join("\n");
  }, [ok, result, fields]);

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
    setFields(DEFAULTS);
    setCopied(false);
  };

  const numberField = (key, label, hint, step = "1") => (
    <div>
      <label className={LABEL_CLASS} htmlFor={`k-${key}`}>
        {label}
      </label>
      <input
        id={`k-${key}`}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="decimal"
        min="0"
        step={step}
        value={fields[key]}
        onChange={set(key)}
      />
      {hint ? <p className={HINT_CLASS}>{hint}</p> : null}
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          AI cost
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">AI Cost Per 1000 Requests Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Vendors price in dollars per million tokens; product teams think in requests. Convert
          between the two, with retries and prompt caching counted the way they bill.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Request profile</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {numberField("inputTokens", "Input tokens per request", "System prompt, context and user text.", "50")}
          {numberField("outputTokens", "Output tokens per request", null, "50")}
          {numberField("retryPercent", "Retry rate (%)", "Failed attempts are billed too.", "1")}
          {numberField("requestsPerMonth", "Requests per month", null, "1000")}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Rates (USD per 1M tokens)</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRICE_TIERS.map((tier) => (
            <button key={tier.id} type="button" onClick={() => applyTier(tier)} className={CHIP_BTN}>
              {tier.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {numberField("inputPerMTok", "Input rate", null, "0.05")}
          {numberField("outputPerMTok", "Output rate", null, "0.05")}
          {numberField("cachedInputPerMTok", "Cached input rate", null, "0.005")}
          {numberField("cacheHitPercent", "Prompt cache hit rate (%)", null, "5")}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Cost per 1,000 requests
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? smartUsd(result.costPer1000) : dash}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${smartUsd(result.costPerRequest)} per request · ${usd(result.costPerMillion)} per million`
                : "Fix the input above to see a figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy cost per 1000 requests result"
              className={GHOST_BTN}
              disabled={!ok}
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
            ["Fresh input cost per request", ok ? smartUsd(result.freshInputCost) : dash],
            ["Cached input cost per request", ok ? smartUsd(result.cachedInputCost) : dash],
            ["Output cost per request", ok ? smartUsd(result.outputCost) : dash],
            ["Billed tokens per request", ok ? NUM.format(result.billedTokensPerRequest) : dash],
            ["Cost per 10,000 requests", ok ? smartUsd(result.costPer10k) : dash],
            ["Cost per 100,000 requests", ok ? usd(result.costPer100k) : dash],
            ["Cost per 1,000,000 requests", ok ? usd(result.costPerMillion) : dash],
            ["Retry surcharge per 1,000", ok ? smartUsd(result.retryCostPer1000) : dash],
            ["Monthly cost", ok ? usd(result.monthlyCost) : dash],
            ["Annual cost", ok ? usd(result.annualCost) : dash],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Output is ${Math.round(result.outputShare)} percent of the request cost`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, 100 - result.outputShare))}%` }}
              />
              <span
                className="block h-full bg-[var(--success)]"
                style={{ width: `${Math.max(0, Math.min(100, result.outputShare))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Input {Math.round(100 - result.outputShare)}% · Output {Math.round(result.outputShare)}%
            </p>
          </div>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Same request across price tiers</h2>
          <p className={HINT_CLASS}>
            Illustrative capability bands, not a quote for any named model — replace the rates above
            with the ones on your invoice for an exact figure.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Tier</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">In / Out</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Per 1,000</th>
                  <th scope="col" className="py-2 text-right font-semibold">Per month</th>
                </tr>
              </thead>
              <tbody>
                {result.comparison.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM2.format(row.input)} / {NUM2.format(row.output)}
                    </td>
                    <td className="py-2 pr-3 text-right">{smartUsd(row.costPer1000)}</td>
                    <td className="py-2 text-right">{usd(row.monthlyCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Real invoices also carry embeddings, tool-call round trips,
        moderation passes, image or audio tokens, and any minimum commitments in your contract.
      </p>
    </main>
  );
}
