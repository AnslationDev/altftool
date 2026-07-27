"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mic, RotateCcw } from "lucide-react";

import {
  CURRENCIES,
  DEFAULT_WPM,
  EXCLUSIVITY,
  TERMS,
  TERRITORIES,
  USAGE_TYPES,
  compareTerms,
  computeVoiceoverQuote,
  formatMoney,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  currency: "INR",
  wordCount: "300",
  wpm: String(DEFAULT_WPM),
  rate: "5000",
  minimum: "5000",
  usageId: "radio",
  territoryId: "national",
  termId: "m12",
  exclusivityId: "none",
  rush: "0",
  agent: "0",
  discount: "0",
};

const toNumber = (value) => (String(value).trim() === "" ? NaN : Number(value));

export default function ToolHome() {
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [wordCount, setWordCount] = useState(DEFAULTS.wordCount);
  const [wpm, setWpm] = useState(DEFAULTS.wpm);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [minimum, setMinimum] = useState(DEFAULTS.minimum);
  const [usageId, setUsageId] = useState(DEFAULTS.usageId);
  const [territoryId, setTerritoryId] = useState(DEFAULTS.territoryId);
  const [termId, setTermId] = useState(DEFAULTS.termId);
  const [exclusivityId, setExclusivityId] = useState(DEFAULTS.exclusivityId);
  const [rush, setRush] = useState(DEFAULTS.rush);
  const [agent, setAgent] = useState(DEFAULTS.agent);
  const [discount, setDiscount] = useState(DEFAULTS.discount);
  const [copied, setCopied] = useState(false);

  const params = useMemo(
    () => ({
      wordCount: toNumber(wordCount),
      wordsPerMinute: toNumber(wpm),
      ratePerFinishedMinute: toNumber(rate),
      minimumSessionFee: toNumber(minimum),
      usageId,
      territoryId,
      termId,
      exclusivityId,
      rushPercent: toNumber(rush),
      agentPercent: toNumber(agent),
      discountPercent: toNumber(discount),
    }),
    [wordCount, wpm, rate, minimum, usageId, territoryId, termId, exclusivityId, rush, agent, discount],
  );

  const quote = useMemo(() => computeVoiceoverQuote(params), [params]);
  const terms = useMemo(() => compareTerms(params), [params]);

  const money = (value) => formatMoney(value, currency);

  const summary = useMemo(() => {
    if (quote.error) return "";
    return [
      "Voiceover quote",
      `Script: ${NUM.format(quote.words)} words ≈ ${NUM2.format(quote.finishedMinutes)} finished minutes at ${NUM.format(quote.wordsPerMinute)} wpm`,
      `Session fee: ${money(quote.sessionFee)}${quote.minimumApplied ? " (minimum applied)" : ""}`,
      `Usage: ${quote.usageLabel} · ${quote.territoryLabel} · ${quote.termLabel} · ${quote.exclusivityLabel}`,
      `Usage multiplier: ${NUM2.format(quote.usageFactor)}x session fee`,
      `Usage fee: ${money(quote.usageFee)}`,
      `Rush: ${money(quote.rushFee)} · Discount: -${money(quote.discountValue)} · Agent: ${money(quote.agentFee)}`,
      `Total: ${money(quote.total)}`,
      `Performer net of agent commission: ${money(quote.performerNet)}`,
    ].join("\n");
  }, [quote, currency]);

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
    setCurrency(DEFAULTS.currency);
    setWordCount(DEFAULTS.wordCount);
    setWpm(DEFAULTS.wpm);
    setRate(DEFAULTS.rate);
    setMinimum(DEFAULTS.minimum);
    setUsageId(DEFAULTS.usageId);
    setTerritoryId(DEFAULTS.territoryId);
    setTermId(DEFAULTS.termId);
    setExclusivityId(DEFAULTS.exclusivityId);
    setRush(DEFAULTS.rush);
    setAgent(DEFAULTS.agent);
    setDiscount(DEFAULTS.discount);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Mic className="h-4 w-4" aria-hidden="true" />
          Audio publishing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Voiceover Rate Card Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Quote a read the way the industry prices one: a session fee for the recording, plus a
          usage fee that scales with media, territory, licence term and exclusivity.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Script and session fee</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vo-currency">
              Currency
            </label>
            <select
              id="vo-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {CURRENCIES.map((entry) => (
                <option key={entry.code} value={entry.code}>
                  {entry.code} — {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vo-words">
              Script word count
            </label>
            <input
              id="vo-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10"
              value={wordCount}
              onChange={(event) => setWordCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vo-wpm">
              Read pace (words per minute)
            </label>
            <input
              id="vo-wpm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="80"
              max="260"
              step="5"
              value={wpm}
              onChange={(event) => setWpm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vo-rate">
              Rate per finished minute
            </label>
            <input
              id="vo-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vo-minimum">
              Minimum session fee
            </label>
            <input
              id="vo-minimum"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={minimum}
              onChange={(event) => setMinimum(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Licence</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vo-usage">
              Where it runs
            </label>
            <select
              id="vo-usage"
              className={`mt-2 ${INPUT_CLASS}`}
              value={usageId}
              onChange={(event) => setUsageId(event.target.value)}
            >
              {USAGE_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label} (×{option.multiplier})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vo-territory">
              Territory
            </label>
            <select
              id="vo-territory"
              className={`mt-2 ${INPUT_CLASS}`}
              value={territoryId}
              onChange={(event) => setTerritoryId(event.target.value)}
            >
              {TERRITORIES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label} (×{option.multiplier})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vo-term">
              Licence term
            </label>
            <select
              id="vo-term"
              className={`mt-2 ${INPUT_CLASS}`}
              value={termId}
              onChange={(event) => setTermId(event.target.value)}
            >
              {TERMS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label} (×{option.multiplier})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vo-exclusivity">
              Exclusivity
            </label>
            <select
              id="vo-exclusivity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={exclusivityId}
              onChange={(event) => setExclusivityId(event.target.value)}
            >
              {EXCLUSIVITY.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label} (+{Math.round(option.uplift * 100)}%)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vo-rush">
              Rush surcharge (%)
            </label>
            <input
              id="vo-rush"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="300"
              step="5"
              value={rush}
              onChange={(event) => setRush(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vo-discount">
              Discount (%)
            </label>
            <input
              id="vo-discount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="90"
              step="5"
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vo-agent">
              Agent commission (%)
            </label>
            <input
              id="vo-agent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={agent}
              onChange={(event) => setAgent(event.target.value)}
            />
          </div>
        </div>
      </section>

      {quote.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {quote.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Quote total
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {quote.error ? DASH : money(quote.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {quote.error
                ? "Fix the inputs above to price the job."
                : `${NUM2.format(quote.finishedMinutes)} finished minutes · ${quote.termLabel} · ${quote.territoryLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the voiceover quote"
              className={GHOST_BTN}
              disabled={Boolean(quote.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy quote"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Session fee",
              quote.error
                ? DASH
                : `${money(quote.sessionFee)}${quote.minimumApplied ? " (minimum)" : ""}`,
            ],
            [
              "Usage multiplier",
              quote.error
                ? DASH
                : `${NUM2.format(quote.usageMultiplier)} × ${NUM2.format(quote.territoryMultiplier)} × ${NUM2.format(quote.termMultiplier)} × ${NUM2.format(1 + quote.exclusivityUplift)} = ${NUM2.format(quote.usageFactor)}`,
            ],
            ["Usage fee", quote.error ? DASH : money(quote.usageFee)],
            ["Subtotal", quote.error ? DASH : money(quote.subtotal)],
            ["Rush surcharge", quote.error ? DASH : money(quote.rushFee)],
            ["Discount", quote.error ? DASH : `-${money(quote.discountValue)}`],
            ["Agent commission", quote.error ? DASH : money(quote.agentFee)],
            ["Performer receives", quote.error ? DASH : money(quote.performerNet)],
            ["Effective rate per finished minute", quote.error ? DASH : money(quote.perFinishedMinute)],
            ["Effective rate per word", quote.error ? DASH : money(quote.perWord)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What the licence term is worth</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Term</th>
                <th scope="col" className="py-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {terms.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-[var(--border)] last:border-0 ${row.id === termId ? "font-semibold text-[var(--primary)]" : ""}`}
                >
                  <td className="py-2 pr-3">{row.label}</td>
                  <td className="py-2 text-right">{row.total === null ? DASH : money(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The multipliers are editable planning defaults that follow the structure of published rate
        guides; they are not an official rate card. Real fees vary by market, language, union status
        and agent, and union agreements such as SAG-AFTRA set their own minimums. Informational only,
        not financial or legal advice.
      </p>
    </main>
  );
}
