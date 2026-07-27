"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessagesSquare, RotateCcw } from "lucide-react";
import { computeConversationCost } from "../lib";

const CURRENCIES = [
  { code: "USD", locale: "en-US" },
  { code: "EUR", locale: "de-DE" },
  { code: "GBP", locale: "en-GB" },
  { code: "INR", locale: "en-IN" },
];

const DEFAULTS = {
  turns: "6",
  systemTokens: "800",
  userTokens: "120",
  assistantTokens: "260",
  inputPricePerM: "3",
  outputPricePerM: "15",
  cachedPricePerM: "0.3",
  cacheHitPct: "0",
  escalationPct: "20",
  agentMinutes: "7",
  agentHourlyCost: "24",
  humanOnlyMinutes: "12",
  conversationsPerMonth: "20000",
  currency: "USD",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US");
const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

const CONVERSATION_FIELDS = [
  { key: "turns", label: "Assistant replies per conversation", min: "1", max: "200", step: "1" },
  { key: "systemTokens", label: "System prompt + retrieved context tokens", min: "0", step: "50" },
  { key: "userTokens", label: "Tokens in one user message", min: "0", step: "10" },
  { key: "assistantTokens", label: "Tokens in one assistant reply", min: "0", step: "10" },
];

const HUMAN_FIELDS = [
  { key: "escalationPct", label: "Conversations escalated to a human (%)", min: "0", max: "100", step: "1" },
  { key: "agentMinutes", label: "Agent minutes on an escalated conversation", min: "0", step: "1" },
  { key: "humanOnlyMinutes", label: "Minutes the same job takes with no AI", min: "0", step: "1" },
  { key: "conversationsPerMonth", label: "Conversations per month", min: "0", step: "100" },
];

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));

  const currency = CURRENCIES.find((item) => item.code === values.currency) || CURRENCIES[0];
  const money = useMemo(() => {
    const formatter = new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: 2,
    });
    return (value) => (Number.isFinite(value) ? formatter.format(value) : "—");
  }, [currency]);
  const fine = useMemo(() => {
    const formatter = new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: 5,
    });
    return (value) => (Number.isFinite(value) ? formatter.format(value) : "—");
  }, [currency]);

  const result = useMemo(
    () =>
      computeConversationCost({
        turns: toNumber(values.turns),
        systemTokens: toNumber(values.systemTokens),
        userTokens: toNumber(values.userTokens),
        assistantTokens: toNumber(values.assistantTokens),
        inputPricePerM: toNumber(values.inputPricePerM),
        outputPricePerM: toNumber(values.outputPricePerM),
        cachedPricePerM: toNumber(values.cachedPricePerM),
        cacheHitPct: toNumber(values.cacheHitPct),
        escalationPct: toNumber(values.escalationPct),
        agentMinutes: toNumber(values.agentMinutes),
        agentHourlyCost: toNumber(values.agentHourlyCost),
        humanOnlyMinutes: toNumber(values.humanOnlyMinutes),
        conversationsPerMonth: toNumber(values.conversationsPerMonth),
      }),
    [values],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const summary = hasError
    ? ""
    : [
        "Cost Per Conversation Calculator",
        `Model cost per conversation: ${fine(result.aiCost)}`,
        `Expected human escalation cost: ${fine(result.expectedHumanCost)}`,
        `All-in cost per conversation: ${fine(result.totalPerConversation)}`,
        `Human-only comparison: ${fine(result.humanOnlyCost)}`,
        `Monthly total: ${money(result.monthlyTotalCost)}`,
        `Input tokens per conversation: ${NUM.format(result.totalInputTokens)} (${NUM.format(result.historyTokens)} of it resent transcript)`,
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
    setValues(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MessagesSquare className="h-4 w-4" aria-hidden="true" />
          Unit economics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cost Per Conversation Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Chat APIs are stateless, so every turn resends the whole transcript. This calculator
          accounts for that growth, applies prompt caching, adds the cost of human escalation and
          compares the result with handling the conversation entirely by hand.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Shape of one conversation</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="conv-currency">
              Currency
            </label>
            <select
              id="conv-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.currency}
              onChange={set("currency")}
            >
              {CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code}
                </option>
              ))}
            </select>
          </div>
          {CONVERSATION_FIELDS.map((field) => (
            <div key={field.key}>
              <label className={LABEL_CLASS} htmlFor={`conv-${field.key}`}>
                {field.label}
              </label>
              <input
                id={`conv-${field.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                max={field.max}
                step={field.step}
                value={values[field.key]}
                onChange={set(field.key)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Model pricing</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {[
            { key: "inputPricePerM", label: `Input price per 1M tokens (${currency.code})`, step: "0.1" },
            { key: "outputPricePerM", label: `Output price per 1M tokens (${currency.code})`, step: "0.1" },
            { key: "cachedPricePerM", label: `Cached input price per 1M tokens (${currency.code})`, step: "0.05" },
            { key: "cacheHitPct", label: "Input tokens served from cache (%)", step: "5", max: "100" },
          ].map((field) => (
            <div key={field.key}>
              <label className={LABEL_CLASS} htmlFor={`conv-${field.key}`}>
                {field.label}
              </label>
              <input
                id={`conv-${field.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max={field.max}
                step={field.step}
                value={values[field.key]}
                onChange={set(field.key)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">People and volume</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {HUMAN_FIELDS.map((field) => (
            <div key={field.key}>
              <label className={LABEL_CLASS} htmlFor={`conv-${field.key}`}>
                {field.label}
              </label>
              <input
                id={`conv-${field.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                max={field.max}
                step={field.step}
                value={values[field.key]}
                onChange={set(field.key)}
              />
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS} htmlFor="conv-agentHourlyCost">
              Fully loaded agent cost per hour ({currency.code})
            </label>
            <input
              id="conv-agentHourlyCost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={values.agentHourlyCost}
              onChange={set("agentHourlyCost")}
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
              All-in cost per conversation
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : fine(result.totalPerConversation)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${fine(result.aiCost)} model + ${fine(result.expectedHumanCost)} expected escalation`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy cost per conversation result"
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
            ["Input tokens billed", hasError ? dash : NUM.format(result.totalInputTokens)],
            ["…of which resent transcript", hasError ? dash : NUM.format(result.historyTokens)],
            ["Output tokens billed", hasError ? dash : NUM.format(result.totalOutputTokens)],
            ["Input cost", hasError ? dash : fine(result.inputCost)],
            ["Output cost", hasError ? dash : fine(result.outputCost)],
            ["Cost of one escalation", hasError ? dash : money(result.agentCostPerEscalation)],
            ["Same conversation, human only", hasError ? dash : money(result.humanOnlyCost)],
            [
              "Saving per conversation",
              hasError || result.savingPct === null
                ? dash
                : `${money(result.savingPerConversation)} (${result.savingPct}%)`,
            ],
            ["Monthly model spend", hasError ? dash : money(result.monthlyAiCost)],
            ["Monthly all-in spend", hasError ? dash : money(result.monthlyTotalCost)],
            ["Monthly saving vs human only", hasError ? dash : money(result.monthlySaving)],
            [
              "Turns before model cost matches a human",
              hasError || result.breakEvenTurns === null ? dash : String(result.breakEvenTurns),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.notes.length > 0 && (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. Real bills also include retries, tool calls, embeddings, moderation passes
        and any platform fee per conversation — add those separately before quoting a figure to
        finance.
      </p>
    </main>
  );
}
