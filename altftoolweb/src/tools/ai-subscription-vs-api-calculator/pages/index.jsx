"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import { PLAN_PRESETS, comparePlanAndApi } from "../lib";

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
  planPricePerSeat: "20",
  seats: "5",
  messagesPerMonth: "300",
  inputTokens: "800",
  outputTokens: "400",
  inputPerMTok: "3",
  outputPerMTok: "15",
  cachedInputPerMTok: "0.3",
  cacheHitPercent: "0",
  workingDaysPerMonth: "22",
};

export default function ToolHome() {
  const [fields, setFields] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setFields((current) => ({ ...current, [key]: event.target.value }));

  const result = useMemo(() => {
    const parsed = {};
    for (const key of Object.keys(DEFAULTS)) {
      const value = toNumber(fields[key]);
      if (Number.isNaN(value)) return { error: "Every field must be a number." };
      parsed[key] = value;
    }
    return comparePlanAndApi(parsed);
  }, [fields]);

  const ok = !result.error;
  const dash = "—";

  const verdict = !ok
    ? ""
    : result.cheaper === "api"
      ? "Pay-per-token API is cheaper"
      : result.cheaper === "plan"
        ? "The flat plan is cheaper"
        : "The two cost the same";

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "AI subscription vs API",
      `Plan: ${usd(toNumber(fields.planPricePerSeat))} per seat × ${fields.seats} seats = ${usd(result.planCostTotal)}`,
      `API: ${smartUsd(result.costPerMessage)} per message × ${fields.messagesPerMonth} messages = ${usd(result.apiCostTotal)}`,
      `Verdict: ${verdict}`,
      `Monthly difference: ${usd(Math.abs(result.monthlyDifference))}`,
      result.breakEvenMessages === null
        ? ""
        : `Break-even: ${NUM.format(result.breakEvenMessages)} messages per seat per month`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, result, fields, verdict]);

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
      <label className={LABEL_CLASS} htmlFor={`sub-${key}`}>
        {label}
      </label>
      <input
        id={`sub-${key}`}
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

  const utilisation = ok && result.utilisationPercent !== null ? result.utilisationPercent : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          AI cost
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">AI Subscription vs API Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A seat price is fixed; a token bill is linear. They cross at exactly one usage level — this
          works out where that is for your prompt sizes, and how much of the plan you actually use.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The flat plan</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {PLAN_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setFields((current) => ({ ...current, planPricePerSeat: String(preset.price) }));
                setCopied(false);
              }}
              className={CHIP_BTN}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {numberField("planPricePerSeat", "Plan price per seat per month (USD)", null, "5")}
          {numberField("seats", "Seats")}
          {numberField("workingDaysPerMonth", "Working days per month", "Used to express break-even per day.")}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The API alternative</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {numberField("messagesPerMonth", "Messages per seat per month", null, "10")}
          {numberField("inputTokens", "Input tokens per message", "Include system prompt and context.", "50")}
          {numberField("outputTokens", "Output tokens per message", null, "50")}
          {numberField("inputPerMTok", "Input rate (USD / 1M tokens)", null, "0.05")}
          {numberField("outputPerMTok", "Output rate (USD / 1M tokens)", null, "0.05")}
          {numberField("cachedInputPerMTok", "Cached input rate (USD / 1M)", null, "0.01")}
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
              Break-even usage per seat
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok && result.breakEvenMessages !== null
                ? `${NUM.format(result.breakEvenMessages)} msg/mo`
                : dash}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.breakEvenMessages !== null
                  ? `${verdict} today — about ${NUM.format(result.breakEvenPerDay ?? 0)} messages a working day to justify the seat.`
                  : `${verdict}. A free plan or a zero token price has no crossover point.`
                : "Fix the input above to see a figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy subscription versus API comparison"
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
            ["Cost per message on the API", ok ? smartUsd(result.costPerMessage) : dash],
            ["  of which input", ok ? smartUsd(result.inputCostPerMessage) : dash],
            ["  of which output", ok ? smartUsd(result.outputCostPerMessage) : dash],
            ["API cost per seat per month", ok ? smartUsd(result.apiCostPerSeat) : dash],
            ["API cost for the whole team", ok ? usd(result.apiCostTotal) : dash],
            ["Plan cost for the whole team", ok ? usd(result.planCostTotal) : dash],
            [
              "Monthly difference",
              ok
                ? `${usd(Math.abs(result.monthlyDifference))} in favour of ${result.cheaper === "api" ? "the API" : result.cheaper === "plan" ? "the plan" : "neither"}`
                : dash,
            ],
            ["Annual difference", ok ? usd(Math.abs(result.annualDifference)) : dash],
            [
              "Plan value used",
              utilisation !== null ? `${NUM2.format(utilisation)}%` : dash,
            ],
            [
              "Messages of headroom left",
              ok && result.messagesUntilBreakEven !== null
                ? NUM.format(result.messagesUntilBreakEven)
                : dash,
            ],
            [
              "Effective plan cost per message",
              ok && result.effectivePlanCostPerMessage !== null
                ? smartUsd(result.effectivePlanCostPerMessage)
                : dash,
            ],
            ["Tokens per seat per month", ok ? NUM.format(result.tokensPerMonthPerSeat) : dash],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label.trim()}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {utilisation !== null ? (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`You are using ${Math.round(utilisation)} percent of the subscription's value`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, utilisation))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {utilisation >= 100
                ? "You are past the break-even point — the flat plan is the better deal."
                : `You are using ${NUM2.format(utilisation)}% of what the seat costs.`}
            </p>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational comparison only. Flat plans usually bundle apps, storage, rate-limit headroom
        and support that raw API access does not, and API usage carries engineering and monitoring
        cost that no token price captures.
      </p>
    </main>
  );
}
