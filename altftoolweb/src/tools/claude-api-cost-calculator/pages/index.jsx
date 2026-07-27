"use client";

import { useMemo, useState } from "react";
import { Calculator, Check, Copy, RotateCcw } from "lucide-react";

import { CLAUDE_MODELS, DAYS_PER_MONTH, computeClaudeCost } from "../lib";

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
  modelId: "claude-sonnet-5",
  requestsPerDay: "2000",
  inputTokens: "2000",
  outputTokens: "600",
  cacheReadShare: "0",
  cacheWriteShare: "0",
  cacheTtl: "5m",
  useBatch: false,
};

export default function ToolHome() {
  const [modelId, setModelId] = useState(DEFAULTS.modelId);
  const [requestsPerDay, setRequestsPerDay] = useState(DEFAULTS.requestsPerDay);
  const [inputTokens, setInputTokens] = useState(DEFAULTS.inputTokens);
  const [outputTokens, setOutputTokens] = useState(DEFAULTS.outputTokens);
  const [cacheReadShare, setCacheReadShare] = useState(DEFAULTS.cacheReadShare);
  const [cacheWriteShare, setCacheWriteShare] = useState(DEFAULTS.cacheWriteShare);
  const [cacheTtl, setCacheTtl] = useState(DEFAULTS.cacheTtl);
  const [useBatch, setUseBatch] = useState(DEFAULTS.useBatch);
  const [rates, setRates] = useState(null); // null => preset for selected model
  const [copied, setCopied] = useState(false);

  const preset = CLAUDE_MODELS.find((m) => m.id === modelId) ?? CLAUDE_MODELS[0];
  const activeRates = rates ?? { input: String(preset.input), output: String(preset.output) };

  const pickModel = (id) => {
    setModelId(id);
    setRates(null);
  };

  const result = useMemo(
    () =>
      computeClaudeCost({
        requestsPerDay: requestsPerDay.trim() === "" ? Number.NaN : Number(requestsPerDay),
        inputTokens: inputTokens.trim() === "" ? Number.NaN : Number(inputTokens),
        outputTokens: outputTokens.trim() === "" ? Number.NaN : Number(outputTokens),
        inputRate: Number(activeRates.input),
        outputRate: Number(activeRates.output),
        cacheReadShare: cacheReadShare.trim() === "" ? 0 : Number(cacheReadShare),
        cacheWriteShare: cacheWriteShare.trim() === "" ? 0 : Number(cacheWriteShare),
        cacheTtl,
        useBatch,
      }),
    [requestsPerDay, inputTokens, outputTokens, activeRates, cacheReadShare, cacheWriteShare, cacheTtl, useBatch],
  );

  const hasError = Boolean(result.error);

  const summary = hasError
    ? ""
    : [
        `Claude API cost estimate (${preset.label})`,
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
    setCacheReadShare(DEFAULTS.cacheReadShare);
    setCacheWriteShare(DEFAULTS.cacheWriteShare);
    setCacheTtl(DEFAULTS.cacheTtl);
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
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Claude API Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Project Anthropic Claude API spend from request volume and token counts — including
          prompt-cache reads at 0.1x, cache writes at 1.25x or 2x, and the 50% Message Batches
          discount. All rates are editable.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cl-model">
              Model (loads preset rates)
            </label>
            <select id="cl-model" className={`mt-2 ${INPUT_CLASS}`} value={modelId} onChange={(e) => pickModel(e.target.value)}>
              {CLAUDE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cl-reqs">
              Requests per day
            </label>
            <input id="cl-reqs" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="0" step="100" value={requestsPerDay} onChange={(e) => setRequestsPerDay(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cl-in">
              Avg input tokens / request
            </label>
            <input id="cl-in" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="0" step="100" value={inputTokens} onChange={(e) => setInputTokens(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cl-out">
              Avg output tokens / request
            </label>
            <input id="cl-out" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="0" step="50" value={outputTokens} onChange={(e) => setOutputTokens(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cl-ttl">
              Cache TTL (write premium)
            </label>
            <select id="cl-ttl" className={`mt-2 ${INPUT_CLASS}`} value={cacheTtl} onChange={(e) => setCacheTtl(e.target.value)}>
              <option value="5m">5 minutes — writes at 1.25x</option>
              <option value="1h">1 hour — writes at 2x</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cl-read">
              Input served from cache (%)
            </label>
            <input id="cl-read" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="0" max="100" step="5" value={cacheReadShare} onChange={(e) => setCacheReadShare(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cl-write">
              Input written to cache (%)
            </label>
            <input id="cl-write" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="0" max="100" step="5" value={cacheWriteShare} onChange={(e) => setCacheWriteShare(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cl-rate-in">
              Input $ / 1M tokens
            </label>
            <input id="cl-rate-in" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.5" value={activeRates.input} onChange={(e) => setRates({ ...activeRates, input: e.target.value })} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cl-rate-out">
              Output $ / 1M tokens
            </label>
            <input id="cl-rate-out" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.5" value={activeRates.output} onChange={(e) => setRates({ ...activeRates, output: e.target.value })} />
          </div>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold sm:col-span-2" htmlFor="cl-batch">
            <input id="cl-batch" type="checkbox" className="h-5 w-5 shrink-0 accent-[var(--primary)]" checked={useBatch} onChange={(e) => setUseBatch(e.target.checked)} />
            Message Batches API (50% discount)
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
            <button type="button" onClick={copyResult} disabled={hasError} aria-label="Copy the Claude cost estimate" className={`${GHOST_BTN} disabled:opacity-50`}>
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
        Informational estimate only. Presets reflect Anthropic's published first-party API rates —
        Amazon Bedrock and Vertex AI price separately, and rates change with model releases. Verify
        against the official pricing page before budgeting; thinking tokens bill as output.
      </p>
    </main>
  );
}
