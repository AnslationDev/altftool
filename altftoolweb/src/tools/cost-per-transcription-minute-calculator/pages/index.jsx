"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mic, RotateCcw } from "lucide-react";

import { SPEAKING_RATE_PRESETS, computeTranscriptionCost, projectMonthly } from "../lib";

const DEFAULTS = {
  files: "10",
  minutesPerFile: "6",
  sttPricePerAudioMinute: "0.006",
  summarise: true,
  wordsPerMinute: "150",
  promptTokensPerFile: "300",
  summaryPercent: "10",
  inputPricePerMillion: "0.25",
  outputPricePerMillion: "1.25",
  cleanupMinutesPerAudioHour: "0",
  hourlyRate: "0",
  monthlyAudioHours: "100",
  currency: "USD",
};

const CURRENCIES = [
  { code: "USD", label: "USD $" },
  { code: "INR", label: "INR ₹" },
  { code: "EUR", label: "EUR €" },
  { code: "GBP", label: "GBP £" },
];

const LOCALE_FOR = { USD: "en-US", INR: "en-IN", EUR: "en-IE", GBP: "en-GB" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const currency = form.currency;

  const fmt = useMemo(() => {
    const locale = LOCALE_FOR[currency] || "en-US";
    return {
      money: new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }),
      unit: new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 5,
      }),
      num: new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
      dec: new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }),
    };
  }, [currency]);

  const result = useMemo(
    () =>
      computeTranscriptionCost({
        files: toNumber(form.files),
        minutesPerFile: toNumber(form.minutesPerFile),
        sttPricePerAudioMinute: toNumber(form.sttPricePerAudioMinute),
        summarise: form.summarise,
        wordsPerMinute: toNumber(form.wordsPerMinute),
        promptTokensPerFile: toNumber(form.promptTokensPerFile),
        summaryPercent: toNumber(form.summaryPercent),
        inputPricePerMillion: toNumber(form.inputPricePerMillion),
        outputPricePerMillion: toNumber(form.outputPricePerMillion),
        cleanupMinutesPerAudioHour: toNumber(form.cleanupMinutesPerAudioHour),
        hourlyRate: toNumber(form.hourlyRate),
      }),
    [form],
  );

  const monthly = useMemo(
    () => projectMonthly(result, toNumber(form.monthlyAudioHours)),
    [result, form.monthlyAudioHours],
  );

  const failed = Boolean(result.error);
  const money = (value) => (failed ? DASH : fmt.money.format(value));
  const unit = (value) => (failed ? DASH : fmt.unit.format(value));
  const num = (value) => (failed ? DASH : fmt.num.format(value));
  const dec = (value) => (failed ? DASH : fmt.dec.format(value));

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "Cost Per Transcription Minute",
      `Audio: ${fmt.num.format(result.files)} files, ${fmt.dec.format(result.totalAudioMinutes)} minutes (${fmt.dec.format(result.totalAudioHours)} hours)`,
      `Estimated transcript: ${fmt.num.format(result.transcriptWords)} words, ${fmt.num.format(result.transcriptTokens)} tokens`,
      `Speech-to-text cost: ${fmt.money.format(result.sttCost)}`,
      `Summarisation cost: ${fmt.money.format(result.llmCost)}`,
      `Human cleanup cost: ${fmt.money.format(result.cleanupCost)}`,
      `Total cost: ${fmt.money.format(result.totalCost)}`,
      `Cost per audio minute: ${fmt.unit.format(result.costPerAudioMinute)}`,
      `Cost per audio hour: ${fmt.unit.format(result.costPerAudioHour)}`,
      `Cost per file: ${fmt.unit.format(result.costPerFile)}`,
    ];
    if (!monthly.error) {
      lines.push(
        `At ${fmt.dec.format(monthly.monthlyAudioHours)} audio hours a month: ${fmt.money.format(monthly.monthlyCost)} per month, ${fmt.money.format(monthly.annualCost)} per year`,
      );
    }
    return lines.join("\n");
  }, [failed, fmt, result, monthly]);

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const audioFields = [
    { key: "files", id: "ctm-files", label: "Number of recordings", step: "1", min: "1" },
    { key: "minutesPerFile", id: "ctm-length", label: "Minutes per recording", step: "1", min: "0" },
    { key: "sttPricePerAudioMinute", id: "ctm-stt", label: `Speech-to-text price per audio minute (${currency})`, step: "0.001", min: "0" },
    { key: "wordsPerMinute", id: "ctm-wpm", label: "Speaking rate (words per minute)", step: "5", min: "1" },
  ];

  const llmFields = [
    { key: "promptTokensPerFile", id: "ctm-prompt", label: "Instruction tokens per file", step: "50", min: "0" },
    { key: "summaryPercent", id: "ctm-summary", label: "Summary length (% of transcript)", step: "1", min: "0", max: "100" },
    { key: "inputPricePerMillion", id: "ctm-in", label: `Input token price per 1M (${currency})`, step: "0.01", min: "0" },
    { key: "outputPricePerMillion", id: "ctm-out", label: `Output token price per 1M (${currency})`, step: "0.01", min: "0" },
  ];

  const humanFields = [
    { key: "cleanupMinutesPerAudioHour", id: "ctm-clean", label: "Proofing minutes per audio hour", step: "5", min: "0" },
    { key: "hourlyRate", id: "ctm-rate", label: `Proofreader hourly cost (${currency})`, step: "1", min: "0" },
  ];

  const renderFields = (fields) =>
    fields.map((field) => (
      <div key={field.key}>
        <label className={LABEL_CLASS} htmlFor={field.id}>
          {field.label}
        </label>
        <input
          id={field.id}
          className={`mt-2 ${INPUT_CLASS}`}
          type="number"
          inputMode="decimal"
          min={field.min}
          max={field.max}
          step={field.step}
          value={form[field.key]}
          onChange={setField(field.key)}
        />
      </div>
    ));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Mic className="h-4 w-4" aria-hidden="true" />
          Audio pipeline cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cost Per Transcription Minute Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Speech-to-text is billed per audio minute, summarisation per token. This adds both, plus
          any human proofing, and reports the result per audio minute, per hour and per file.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Audio and transcription</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ctm-currency">
              Currency
            </label>
            <select
              id="ctm-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.currency}
              onChange={setField("currency")}
            >
              {CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {renderFields(audioFields)}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {SPEAKING_RATE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() =>
                setForm((prev) => ({ ...prev, wordsPerMinute: String(preset.wordsPerMinute) }))
              }
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label} · {preset.wordsPerMinute} wpm
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">AI summarisation</h2>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold" htmlFor="ctm-summarise">
            <input
              id="ctm-summarise"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              checked={form.summarise}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, summarise: event.target.checked }))
              }
            />
            Summarise the transcript
          </label>
        </div>
        {form.summarise && (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">{renderFields(llmFields)}</div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Human proofing (optional)</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">{renderFields(humanFields)}</div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cost per audio minute
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {unit(result.costPerAudioMinute)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? "Fix the inputs to see a result." : `${unit(result.costPerAudioHour)} per audio hour`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy transcription cost result"
              className={GHOST_BTN}
              disabled={failed}
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
            ["Total audio", failed ? DASH : `${dec(result.totalAudioMinutes)} min (${dec(result.totalAudioHours)} h)`],
            ["Estimated transcript words", num(result.transcriptWords)],
            ["Estimated transcript tokens", num(result.transcriptTokens)],
            ["Speech-to-text cost", money(result.sttCost)],
            ["Summary input tokens", num(result.inputTokens)],
            ["Summary output tokens", num(result.outputTokens)],
            ["Summarisation cost", money(result.llmCost)],
            ["Human proofing hours", dec(result.cleanupHours)],
            ["Human proofing cost", money(result.cleanupCost)],
            ["Total cost", money(result.totalCost)],
            ["Cost per file", unit(result.costPerFile)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Speech-to-text ${dec(result.sttShare)} percent, summarisation ${dec(result.llmShare)} percent, proofing ${dec(result.cleanupShare)} percent of total cost`}
            >
              <span className="block h-full bg-[var(--primary)]" style={{ width: `${result.sttShare}%` }} />
              <span className="block h-full bg-[var(--success)]" style={{ width: `${result.llmShare}%` }} />
              <span className="block h-full bg-[var(--danger)]" style={{ width: `${result.cleanupShare}%` }} />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Speech-to-text {dec(result.sttShare)}% · Summarisation {dec(result.llmShare)}% · Proofing{" "}
              {dec(result.cleanupShare)}%
            </p>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Monthly volume</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ctm-monthly">
              Audio hours per month
            </label>
            <input
              id="ctm-monthly"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={form.monthlyAudioHours}
              onChange={setField("monthlyAudioHours")}
            />
          </div>
          <div className="rounded-md bg-[var(--muted)] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Projected spend
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {monthly.error ? DASH : `${fmt.money.format(monthly.monthlyCost)} / month`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {monthly.error ? monthly.error : `${fmt.money.format(monthly.annualCost)} per year`}
            </p>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Transcript length is derived from your speaking rate, and token
        counts use the common English approximation of about three-quarters of a word per token —
        actual tokenisation varies by language and by model. Confirm against your provider&apos;s
        usage dashboard before committing to a budget.
      </p>
    </main>
  );
}
