"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageSquare, RotateCcw } from "lucide-react";

import { BOT_PRESETS, computeChatbotCost } from "../lib";

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
  conversationsPerMonth: "50000",
  turns: "4",
  systemTokens: "800",
  ragTokens: "2000",
  userTokens: "60",
  replyTokens: "220",
  cacheHitPercent: "0",
  inputPerMTok: "1",
  outputPerMTok: "5",
  cachedInputPerMTok: "0.1",
  embeddingCostPerConversation: "0.0001",
  deflectionPercent: "60",
  humanCostPerConversation: "4",
};

export default function ToolHome() {
  const [fields, setFields] = useState(DEFAULTS);
  const [resendHistory, setResendHistory] = useState(true);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setFields((current) => ({ ...current, [key]: event.target.value }));

  const applyPreset = (preset) => {
    setFields((current) => ({
      ...current,
      systemTokens: String(preset.systemTokens),
      ragTokens: String(preset.ragTokens),
      userTokens: String(preset.userTokens),
      replyTokens: String(preset.replyTokens),
      turns: String(preset.turns),
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
    return computeChatbotCost({ ...parsed, resendHistory });
  }, [fields, resendHistory]);

  const ok = !result.error;
  const dash = "—";

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Chatbot monthly cost estimate",
      `Conversations per month: ${fields.conversationsPerMonth}`,
      `Turns per conversation: ${fields.turns} (history ${resendHistory ? "resent" : "trimmed"})`,
      `Tokens per conversation: ${NUM.format(result.tokensPerConversation)}`,
      `Cost per conversation: ${smartUsd(result.costPerConversation)}`,
      `Monthly cost: ${usd(result.monthlyCost)}`,
      `Annual cost: ${usd(result.annualCost)}`,
      `Agent cost avoided: ${usd(result.humanCostAvoided)}`,
      `Net monthly saving: ${usd(result.netSaving)}`,
    ].join("\n");
  }, [ok, result, fields, resendHistory]);

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
    setResendHistory(true);
    setCopied(false);
  };

  const numberField = (key, label, hint, step = "1") => (
    <div>
      <label className={LABEL_CLASS} htmlFor={`bot-${key}`}>
        {label}
      </label>
      <input
        id={`bot-${key}`}
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
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          AI cost
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Chatbot Monthly Cost Estimator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Price a support bot properly: system prompt and retrieved context are resent on every turn,
          and so is the transcript. Then set the token bill against the agent time it deflects.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Conversation shape</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {BOT_PRESETS.map((preset) => (
            <button key={preset.id} type="button" onClick={() => applyPreset(preset)} className={CHIP_BTN}>
              {preset.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {numberField("conversationsPerMonth", "Conversations per month", null, "1000")}
          {numberField("turns", "Turns per conversation", "One user question plus one bot reply.")}
          {numberField("systemTokens", "System prompt tokens", "Persona, policy and tool definitions.", "50")}
          {numberField("ragTokens", "Retrieved context tokens per turn", "Knowledge-base chunks injected per turn.", "100")}
          {numberField("userTokens", "Tokens per user message", null, "10")}
          {numberField("replyTokens", "Tokens per bot reply", null, "10")}
        </div>
        <div className="mt-4 rounded-md border border-[var(--border)] p-3">
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="bot-history">
            <input
              id="bot-history"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={resendHistory}
              onChange={(event) => setResendHistory(event.target.checked)}
            />
            Resend the transcript on every turn
          </label>
          <p className={HINT_CLASS}>
            Uncheck to model a bot that answers each question standalone or summarises earlier turns.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Pricing and deflection</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {numberField("inputPerMTok", "Input rate (USD / 1M tokens)", null, "0.05")}
          {numberField("outputPerMTok", "Output rate (USD / 1M tokens)", null, "0.05")}
          {numberField("cachedInputPerMTok", "Cached input rate (USD / 1M)", null, "0.01")}
          {numberField("cacheHitPercent", "Prompt cache hit rate (%)", null, "5")}
          {numberField("embeddingCostPerConversation", "Retrieval cost per conversation (USD)", "Embedding plus vector search, if you meter it.", "0.0001")}
          {numberField("deflectionPercent", "Deflection rate (%)", "Share of conversations resolved without a human.", "5")}
          {numberField("humanCostPerConversation", "Fully loaded agent cost per contact (USD)", null, "0.5")}
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
              Estimated monthly token bill
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? usd(result.monthlyCost) : dash}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${smartUsd(result.costPerConversation)} per conversation`
                : "Fix the input above to see a figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy chatbot cost estimate"
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
            ["Prompt tokens per conversation", ok ? NUM.format(result.promptTokensPerConversation) : dash],
            ["Output tokens per conversation", ok ? NUM.format(result.outputTokensPerConversation) : dash],
            ["Tokens per month", ok ? NUM.format(result.tokensPerMonth) : dash],
            ["Cost per turn", ok ? smartUsd(result.costPerTurn) : dash],
            ["Model cost per conversation", ok ? smartUsd(result.llmCostPerConversation) : dash],
            ["Annual cost", ok ? usd(result.annualCost) : dash],
            ["Conversations deflected", ok ? NUM.format(result.deflected) : dash],
            ["Conversations escalated", ok ? NUM.format(result.escalated) : dash],
            ["Agent cost avoided", ok ? usd(result.humanCostAvoided) : dash],
            ["Net monthly saving", ok ? usd(result.netSaving) : dash],
            ["Return on bot spend", ok && result.roiPercent !== null ? `${NUM.format(result.roiPercent)}%` : dash],
            [
              "Deflection needed to break even",
              ok && result.breakEvenDeflectionPercent !== null
                ? `${NUM2.format(result.breakEvenDeflectionPercent)}%`
                : dash,
            ],
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
              aria-label={`Cost per conversation is ${Math.round(result.inputShare)} percent input tokens, ${Math.round(result.outputShare)} percent output tokens, and ${Math.round(result.retrievalShare)} percent retrieval and embedding cost`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.inputShare))}%` }}
              />
              <span
                className="block h-full bg-[var(--success)]"
                style={{ width: `${Math.max(0, Math.min(100, result.outputShare))}%` }}
              />
              <span
                className="block h-full bg-[var(--info)]"
                style={{ width: `${Math.max(0, Math.min(100, result.retrievalShare))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Input {Math.round(result.inputShare)}% · Output {Math.round(result.outputShare)}% · Retrieval{" "}
              {Math.round(result.retrievalShare)}%
            </p>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. It excludes evaluation runs, guardrail and moderation calls,
        failed generations, human review of escalations, and the platform fees your vendor may add.
      </p>
    </main>
  );
}
