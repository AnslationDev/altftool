"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Users } from "lucide-react";

import { PRICE_PRESETS, computeCostPerUser } from "../lib";

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

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

const DEFAULTS = {
  activeUsers: "1000",
  sessionsPerUser: "10",
  turnsPerSession: "5",
  systemTokens: "500",
  userTokens: "150",
  replyTokens: "400",
  cacheHitPercent: "0",
  inputPerMTok: "3",
  outputPerMTok: "15",
  cachedInputPerMTok: "0.3",
  pricePerUser: "20",
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
      inputPerMTok: String(preset.input),
      outputPerMTok: String(preset.output),
      cachedInputPerMTok: String(preset.cached),
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
    return computeCostPerUser({ ...parsed, resendHistory });
  }, [fields, resendHistory]);

  const ok = !result.error;
  const dash = "—";

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "LLM cost per user",
      `Active users: ${fields.activeUsers}`,
      `Sessions per user per month: ${fields.sessionsPerUser}`,
      `Messages per session: ${fields.turnsPerSession} (history ${resendHistory ? "resent" : "trimmed"})`,
      `Tokens per session: ${NUM.format(result.tokensPerSession)}`,
      `Cost per session: ${smartUsd(result.costPerSession)}`,
      `Cost per user per month: ${smartUsd(result.costPerUser)}`,
      `Total monthly cost: ${usd(result.totalMonthlyCost)}`,
      result.grossMarginPercent === null
        ? ""
        : `Gross margin at ${usd(toNumber(fields.pricePerUser))}/user: ${NUM2.format(result.grossMarginPercent)}%`,
    ]
      .filter(Boolean)
      .join("\n");
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
      <label className={LABEL_CLASS} htmlFor={`cpu-${key}`}>
        {label}
      </label>
      <input
        id={`cpu-${key}`}
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
          <Users className="h-4 w-4" aria-hidden="true" />
          AI unit economics
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">LLM Cost Per User Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn usage assumptions into a cost per monthly active user — including the quadratic token
          growth that happens when a chat resends its whole transcript on every turn.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Usage</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {numberField("activeUsers", "Monthly active users", null, "100")}
          {numberField("sessionsPerUser", "Sessions per user per month")}
          {numberField("turnsPerSession", "Messages per session", "One user message plus one reply.")}
          {numberField("systemTokens", "System prompt tokens", "Resent on every turn.", "50")}
          {numberField("userTokens", "Tokens per user message", null, "25")}
          {numberField("replyTokens", "Tokens per assistant reply", null, "25")}
        </div>

        <div className="mt-4 rounded-md border border-[var(--border)] p-3">
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="cpu-history">
            <input
              id="cpu-history"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={resendHistory}
              onChange={(event) => setResendHistory(event.target.checked)}
            />
            Resend the full conversation history on every turn
          </label>
          <p className={HINT_CLASS}>
            On by default because that is how a stateless chat completions API works. Turn it off to
            model aggressive history trimming or summarisation.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Token pricing (USD per 1M tokens)</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRICE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {numberField("inputPerMTok", "Input rate", null, "0.05")}
          {numberField("outputPerMTok", "Output rate", null, "0.05")}
          {numberField("cachedInputPerMTok", "Cached input rate", null, "0.01")}
          {numberField("cacheHitPercent", "Prompt cache hit rate (%)", "Share of prompt tokens billed at the cached rate.", "5")}
          {numberField("pricePerUser", "Your price per user per month", "Optional — used for the margin figure.", "1")}
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
              Cost per active user per month
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? smartUsd(result.costPerUser) : dash}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${usd(result.totalMonthlyCost)} per month across the whole user base`
                : "Fix the input above to see a figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy cost per user result"
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
            ["Prompt tokens per session", ok ? NUM.format(result.promptTokensPerSession) : dash],
            ["Output tokens per session", ok ? NUM.format(result.outputTokensPerSession) : dash],
            ["Cost per message", ok ? smartUsd(result.costPerMessage) : dash],
            ["Cost per session", ok ? smartUsd(result.costPerSession) : dash],
            ["Cost per user per year", ok ? smartUsd(result.costPerUserPerYear) : dash],
            ["Total tokens per month", ok ? NUM.format(result.tokensPerMonth) : dash],
            ["Total annual cost", ok ? usd(result.totalAnnualCost) : dash],
            [
              "Gross margin per user",
              ok && result.grossMarginPercent !== null
                ? `${NUM2.format(result.grossMarginPercent)}% (${smartUsd(result.marginPerUser)})`
                : dash,
            ],
            [
              "Sessions before a seat is used up",
              ok && result.breakEvenSessions !== null ? NUM.format(result.breakEvenSessions) : dash,
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
              aria-label={`Output tokens account for ${Math.round(result.outputShare)} percent of session cost`}
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
        Informational modelling only. Real bills also carry retries, tool-call round trips, moderation
        passes, embeddings and heavy-user skew — averages hide the top 1% of users who cost far more.
      </p>
    </main>
  );
}
