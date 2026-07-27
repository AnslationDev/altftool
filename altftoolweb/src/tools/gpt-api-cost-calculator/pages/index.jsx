"use client";

import { useMemo, useState } from "react";
import { Calculator, Check, Copy, RotateCcw } from "lucide-react";

import { DAYS_PER_MONTH, GPT_MODELS, computeGptCost } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const USD_SMALL = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 6 });
const NUM = new Intl.NumberFormat("en-US");
const PCT = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });

const DEFAULTS = {
  modelId: "gpt-5.1",
  requestsPerDay: "5000",
  inputTokens: "1200",
  outputTokens: "400",
  cachedShare: "0",
  useBatch: false,
};

export default function ToolHome() {
  const [modelId, setModelId] = useState(DEFAULTS.modelId);
  const [requestsPerDay, setRequestsPerDay] = useState(DEFAULTS.requestsPerDay);
  const [inputTokens, setInputTokens] = useState(DEFAULTS.inputTokens);
  const [outputTokens, setOutputTokens] = useState(DEFAULTS.outputTokens);
  const [cachedShare, setCachedShare] = useState(DEFAULTS.cachedShare);
  const [useBatch, setUseBatch] = useState(DEFAULTS.useBatch);
  const [rates, setRates] = useState(null); // null => use preset for selected model
  const [copied, setCopied] = useState(false);

  const preset = GPT_MODELS.find((m) => m.id === modelId) ?? GPT_MODELS[0];
  const activeRates = rates ?? {
    input: String(preset.input),
    cachedInput: String(preset.cachedInput),
    output: String(preset.output),
  };

  const pickModel = (id) => {
    setModelId(id);
    setRates(null); // reset to the new model's preset rates
  };

  const setRate = (key, value) => {
    setRates({ ...activeRates, [key]: value });
  };

  const result = useMemo(
    () =>
      computeGptCost({
        requestsPerDay: requestsPerDay.trim() === "" ? Number.NaN : Number(requestsPerDay),
        inputTokens: inputTokens.trim() === "" ? Number.NaN : Number(inputTokens),
        outputTokens: outputTokens.trim() === "" ? Number.NaN : Number(outputTokens),
        inputRate: Number(activeRates.input),
        cachedInputRate: Number(activeRates.cachedInput),
        outputRate: Number(activeRates.output),
        cachedShare: cachedShare.trim() === "" ? 0 : Number(cachedShare),
        useBatch,
      }),
    [requestsPerDay, inputTokens, outputTokens, activeRates, cachedShare, useBatch],
  );

  const hasError = Boolean(result.error);

  const summary = hasError
    ? ""
    : [
        `GPT API cost estimate (${preset.label})`,
        `Requests: ${NUM.format(Number(requestsPerDay))}/day`,
        `Tokens per request: ${NUM.format(Number(inputTokens))} in / ${NUM.format(Number(outputTokens))} out`,
        `Cost per request: ${USD_SMALL.format(result.costPerRequest)}`,
        `Per 1,000 requests: ${USD.format(result.costPer1kRequests)}`,
        `Daily: ${USD.format(result.dailyCost)}`,
        `Monthly (${DAYS_PER_MONTH} days): ${USD.format(result.monthlyCost)}`,
      ].join("\n");

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
    setModelId(DEFAULTS.modelId);
    setRequestsPerDay(DEFAULTS.requestsPerDay);
    setInputTokens(DEFAULTS.inputTokens);
    setOutputTokens(DEFAULTS.outputTokens);
    setCachedShare(DEFAULTS.cachedShare);
    setUseBatch(DEFAULTS.useBatch);
    setRates(null);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Calculator className="h-4 w-4" aria-hidden="true" />
          AI Cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">GPT API Cost Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Project OpenAI API spend from request volume and average token counts — with cached-input
          discounts and the 50% Batch API rate. Rates are editable, so you can match the current
          pricing page exactly.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gpt-model">
              Model (loads preset rates)
            </label>
            <select
              id="gpt-model"
              className={`mt-2 ${INPUT_CLASS}`}
              value={modelId}
              onChange={(event) => pickModel(event.target.value)}
            >
              {GPT_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gpt-reqs">
              Requests per day
            </label>
            <input id="gpt-reqs" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="0" step="100" value={requestsPerDay} onChange={(e) => setRequestsPerDay(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gpt-cache">
              Cached input share (%)
            </label>
            <input id="gpt-cache" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="0" max="100" step="5" value={cachedShare} onChange={(e) => setCachedShare(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gpt-in">
              Avg input tokens / request
            </label>
            <input id="gpt-in" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="0" step="100" value={inputTokens} onChange={(e) => setInputTokens(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gpt-out">
              Avg output tokens / request
            </label>
            <input id="gpt-out" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="0" step="50" value={outputTokens} onChange={(e) => setOutputTokens(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gpt-rate-in">
              Input $ / 1M tokens
            </label>
            <input id="gpt-rate-in" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.01" value={activeRates.input} onChange={(e) => setRate("input", e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gpt-rate-cached">
              Cached input $ / 1M tokens
            </label>
            <input id="gpt-rate-cached" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.005" value={activeRates.cachedInput} onChange={(e) => setRate("cachedInput", e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gpt-rate-out">
              Output $ / 1M tokens
            </label>
            <input id="gpt-rate-out" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.01" value={activeRates.output} onChange={(e) => setRate("output", e.target.value)} />
          </div>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 self-end text-sm font-semibold" htmlFor="gpt-batch">
            <input id="gpt-batch" type="checkbox" className="h-5 w-5 shrink-0 accent-[var(--primary)]" checked={useBatch} onChange={(e) => setUseBatch(e.target.checked)} />
            Batch API (50% discount)
          </label>
        </div>
      </section>

      {hasError ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated monthly spend
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : USD.format(result.monthlyCost)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${DAYS_PER_MONTH}-day month · ${NUM.format(result.monthlyRequests)} requests · ${NUM.format(result.monthlyTokens)} tokens`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} disabled={hasError} aria-label="Copy the GPT cost estimate" className={`${GHOST_BTN} disabled:opacity-50`}>
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
          {(hasError
            ? [
                ["Cost per request", DASH],
                ["Cost per 1,000 requests", DASH],
                ["Daily cost", DASH],
                ["Yearly cost", DASH],
              ]
            : [
                ["Cost per request", USD_SMALL.format(result.costPerRequest)],
                ["Cost per 1,000 requests", USD.format(result.costPer1kRequests)],
                ["Daily cost", USD.format(result.dailyCost)],
                ["Yearly cost (365 days)", USD.format(result.yearlyCost)],
                ["Input share of cost", PCT.format(result.inputShareOfCost)],
                ["Output share of cost", PCT.format(result.outputShareOfCost)],
                ["Monthly saving from caching", USD.format(result.cacheSavingsPerMonth)],
                ["Batch discount applied", result.batchApplied ? "Yes — 50%" : "No"],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Preset rates reflect OpenAI's published per-1M-token prices and
        can change with new model releases — verify against the official pricing page before
        budgeting. Fine-tuned models, audio tokens and tool surcharges bill differently.
      </p>
    </main>
  );
}
