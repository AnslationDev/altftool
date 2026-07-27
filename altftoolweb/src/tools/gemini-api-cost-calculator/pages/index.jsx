"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sparkles } from "lucide-react";

import {
  AUDIO_TOKENS_PER_SECOND,
  GEMINI_MODELS,
  IMAGE_TOKENS_PER_TILE,
  computeGeminiCost,
  getGeminiModel,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const usd = (value, digits = 2) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);

/** Small money figures need more decimals to stay meaningful. */
const smartUsd = (value) => {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return usd(0, 2);
  if (Math.abs(value) < 0.01) return usd(value, 6);
  if (Math.abs(value) < 1) return usd(value, 4);
  return usd(value, 2);
};

const tokens = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)} tok`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_USAGE = {
  textTokens: "2000",
  cachedTokens: "0",
  images: "0",
  tilesPerImage: "1",
  audioSeconds: "0",
  outputTokens: "500",
  requestsPerMonth: "100000",
  cacheStorageHours: "0",
};

const ratesFromModel = (model) => ({
  inputPerMTok: String(model.inputPerMTok),
  longInputPerMTok: String(model.longInputPerMTok),
  outputPerMTok: String(model.outputPerMTok),
  longOutputPerMTok: String(model.longOutputPerMTok),
  cachedInputPerMTok: String(model.cachedInputPerMTok),
  longCachedInputPerMTok: String(model.longCachedInputPerMTok),
  audioInputPerMTok: String(model.audioInputPerMTok),
  cacheStoragePerMTokHour: String(model.cacheStoragePerMTokHour),
});

export default function ToolHome() {
  const [modelId, setModelId] = useState(DEFAULT_MODEL);
  const [rates, setRates] = useState(() => ratesFromModel(getGeminiModel(DEFAULT_MODEL)));
  const [usage, setUsage] = useState(DEFAULT_USAGE);
  const [copied, setCopied] = useState(false);

  const model = getGeminiModel(modelId);

  const setUsageField = (key) => (event) =>
    setUsage((current) => ({ ...current, [key]: event.target.value }));
  const setRateField = (key) => (event) =>
    setRates((current) => ({ ...current, [key]: event.target.value }));

  const pickModel = (id) => {
    setModelId(id);
    setRates(ratesFromModel(getGeminiModel(id)));
    setCopied(false);
  };

  const result = useMemo(() => {
    const rateValues = {};
    for (const key of Object.keys(rates)) {
      const value = toNumber(rates[key]);
      if (Number.isNaN(value)) return { error: "Every per-million-token rate must be a number." };
      rateValues[key] = value;
    }
    const usageValues = {};
    for (const key of Object.keys(usage)) {
      const value = toNumber(usage[key]);
      if (Number.isNaN(value)) return { error: "Every usage field must be a number." };
      usageValues[key] = value;
    }

    return computeGeminiCost({
      pricing: { ...rateValues, longContextThreshold: model.longContextThreshold },
      ...usageValues,
    });
  }, [rates, usage, model.longContextThreshold]);

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      `Gemini API cost — ${model.label}`,
      `Prompt tokens per request: ${NUM.format(result.promptTokens)}`,
      `Output tokens per request: ${usage.outputTokens}`,
      `Tier: ${result.isLongContext ? "long context (above threshold)" : "standard"}`,
      `Cost per request: ${smartUsd(result.costPerRequest)}`,
      `Cost per 1,000 requests: ${smartUsd(result.costPer1kRequests)}`,
      `Monthly cost: ${usd(result.monthlyCost)}`,
      `Annual run rate: ${usd(result.annualCost)}`,
    ].join("\n");
  }, [result, model.label, usage.outputTokens]);

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
    setModelId(DEFAULT_MODEL);
    setRates(ratesFromModel(getGeminiModel(DEFAULT_MODEL)));
    setUsage(DEFAULT_USAGE);
    setCopied(false);
  };

  const ok = !result.error;
  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          AI cost
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Gemini API Cost Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Price a Gemini request from its token mix — text, cached context, images and audio — then
          project the monthly bill. Long-context tier switching and the cache discount are applied
          the way Google bills them.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Model</h2>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="gemini-model">
            Gemini model
          </label>
          <select
            id="gemini-model"
            className={`mt-2 ${INPUT_CLASS}`}
            value={modelId}
            onChange={(event) => pickModel(event.target.value)}
          >
            {GEMINI_MODELS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <p className={HINT_CLASS}>
            {model.longContextThreshold
              ? `Prices step up above ${NUM.format(model.longContextThreshold)} prompt tokens.`
              : "Single flat pricing tier — no long-context surcharge."}
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gemini-in-rate">
              Input rate (USD / 1M tokens)
            </label>
            <input
              id="gemini-in-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.001"
              value={rates.inputPerMTok}
              onChange={setRateField("inputPerMTok")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gemini-out-rate">
              Output rate (USD / 1M tokens)
            </label>
            <input
              id="gemini-out-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.001"
              value={rates.outputPerMTok}
              onChange={setRateField("outputPerMTok")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gemini-cached-rate">
              Cached input rate (USD / 1M tokens)
            </label>
            <input
              id="gemini-cached-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.001"
              value={rates.cachedInputPerMTok}
              onChange={setRateField("cachedInputPerMTok")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gemini-audio-rate">
              Audio input rate (USD / 1M tokens)
            </label>
            <input
              id="gemini-audio-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.001"
              value={rates.audioInputPerMTok}
              onChange={setRateField("audioInputPerMTok")}
            />
          </div>
          {model.longContextThreshold ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="gemini-long-in-rate">
                  Long-context input rate (USD / 1M)
                </label>
                <input
                  id="gemini-long-in-rate"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.001"
                  value={rates.longInputPerMTok}
                  onChange={setRateField("longInputPerMTok")}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="gemini-long-out-rate">
                  Long-context output rate (USD / 1M)
                </label>
                <input
                  id="gemini-long-out-rate"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.001"
                  value={rates.longOutputPerMTok}
                  onChange={setRateField("longOutputPerMTok")}
                />
              </div>
            </>
          ) : null}
        </div>
        <p className={HINT_CLASS}>
          Rates are pre-filled from Google&apos;s published paid-tier list prices and are fully
          editable — always confirm against the current Gemini pricing page before budgeting.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Usage per request</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gemini-text">
              Text prompt tokens
            </label>
            <input
              id="gemini-text"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={usage.textTokens}
              onChange={setUsageField("textTokens")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gemini-output">
              Output tokens
            </label>
            <input
              id="gemini-output"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="50"
              value={usage.outputTokens}
              onChange={setUsageField("outputTokens")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gemini-cached">
              Cached context tokens
            </label>
            <input
              id="gemini-cached"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              value={usage.cachedTokens}
              onChange={setUsageField("cachedTokens")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gemini-cache-hours">
              Cache storage hours per month
            </label>
            <input
              id="gemini-cache-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={usage.cacheStorageHours}
              onChange={setUsageField("cacheStorageHours")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gemini-images">
              Images per request
            </label>
            <input
              id="gemini-images"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={usage.images}
              onChange={setUsageField("images")}
            />
            <p className={HINT_CLASS}>{IMAGE_TOKENS_PER_TILE} tokens per 768px tile.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gemini-tiles">
              Tiles per image
            </label>
            <input
              id="gemini-tiles"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={usage.tilesPerImage}
              onChange={setUsageField("tilesPerImage")}
            />
            <p className={HINT_CLASS}>1 for an image no larger than 384px on its longest side.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gemini-audio">
              Audio seconds per request
            </label>
            <input
              id="gemini-audio"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={usage.audioSeconds}
              onChange={setUsageField("audioSeconds")}
            />
            <p className={HINT_CLASS}>{AUDIO_TOKENS_PER_SECOND} tokens per second of audio.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gemini-requests">
              Requests per month
            </label>
            <input
              id="gemini-requests"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              value={usage.requestsPerMonth}
              onChange={setUsageField("requestsPerMonth")}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Estimated monthly cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? usd(result.monthlyCost) : dash}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${smartUsd(result.costPerRequest)} per request on ${model.label}`
                : "Fix the input above to see a figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy Gemini cost estimate"
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
            ["Prompt tokens per request", ok ? tokens(result.promptTokens) : dash],
            ["Billing tier", ok ? (result.isLongContext ? "Long context" : "Standard") : dash],
            ["Text input cost", ok ? smartUsd(result.textCost) : dash],
            ["Image input cost", ok ? smartUsd(result.imageCost) : dash],
            ["Audio input cost", ok ? smartUsd(result.audioCost) : dash],
            ["Cached input cost", ok ? smartUsd(result.cachedCost) : dash],
            ["Output cost", ok ? smartUsd(result.outputCost) : dash],
            ["Cost per request", ok ? smartUsd(result.costPerRequest) : dash],
            ["Cost per 1,000 requests", ok ? smartUsd(result.costPer1kRequests) : dash],
            ["Context cache storage (month)", ok ? usd(result.cacheStorageCost) : dash],
            ["Annual run rate", ok ? usd(result.annualCost) : dash],
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
              aria-label={`Output tokens are ${Math.round(result.outputShare)} percent of the per-request cost`}
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

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Vendor list prices change, free-tier quotas, grounding calls,
        thinking tokens and taxes are billed separately, and your account may have negotiated rates.
      </p>
    </main>
  );
}
