"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Heart, RotateCcw } from "lucide-react";

import { BUDGET_MODELS, CURRENCIES, PRIORITIES, buildWeddingPrompt } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  totalBudget: "2000000",
  currency: "INR",
  guests: "250",
  monthsToGo: "8",
  model: "multi-event",
  priority: "food",
  city: "Jaipur",
  mustHave: "Live sangeet band",
  dealBreaker: "Cash bar",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(() => buildWeddingPrompt(form), [form]);
  const ok = !result.error;

  const money = useMemo(() => {
    const code = result.currency || form.currency;
    const locale = result.currencyLocale || "en-IN";
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    });
    return (value) => formatter.format(Number.isFinite(value) ? value : 0);
  }, [result.currency, result.currencyLocale, form.currency]);

  const copyPrompt = async () => {
    if (!ok) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
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

  const rows = [
    ["Catering budget per plate", ok ? money(result.plateBudget) : DASH],
    ["Contingency held back", ok ? money(result.contingencyAmount) : DASH],
    ["Committed spend to plan against", ok ? money(result.spendableTotal) : DASH],
    ["Guests", ok ? `${result.guests}` : DASH],
    ["Planning phase", ok ? `${result.phaseLabel} (${result.months} months to go)` : DASH],
    ["Budget model", ok ? result.modelLabel : DASH],
    ["Protected first", ok ? result.priorityLabel : DASH],
    ["Prompt size", ok ? `${result.wordCount} words, ~${result.tokenEstimate} tokens` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Heart className="h-4 w-4" aria-hidden="true" />
          Everyday prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Wedding Planning Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the budget, headcount and months remaining. You get a category split, the real cost
          per guest, the plate budget your caterer will actually work to, and a planning prompt that
          carries all three so the assistant stops guessing.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wp-budget">
              Total budget
            </label>
            <input
              id="wp-budget"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={form.totalBudget}
              onChange={set("totalBudget")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wp-currency">
              Currency
            </label>
            <select id="wp-currency" className={`mt-2 ${INPUT_CLASS}`} value={form.currency} onChange={set("currency")}>
              {CURRENCIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wp-guests">
              Guest count
            </label>
            <input
              id="wp-guests"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="2"
              max="5000"
              step="1"
              value={form.guests}
              onChange={set("guests")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wp-months">
              Months until the wedding
            </label>
            <input
              id="wp-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="1"
              value={form.monthsToGo}
              onChange={set("monthsToGo")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wp-model">
              Budget model
            </label>
            <select id="wp-model" className={`mt-2 ${INPUT_CLASS}`} value={form.model} onChange={set("model")}>
              {BUDGET_MODELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wp-priority">
              What you will not compromise on
            </label>
            <select id="wp-priority" className={`mt-2 ${INPUT_CLASS}`} value={form.priority} onChange={set("priority")}>
              {PRIORITIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wp-city">
              City or region (optional)
            </label>
            <input id="wp-city" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.city} onChange={set("city")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wp-must">
              Non-negotiable (optional)
            </label>
            <input id="wp-must" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.mustHave} onChange={set("mustHave")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wp-avoid">
              Explicitly avoid (optional)
            </label>
            <input
              id="wp-avoid"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.dealBreaker}
              onChange={set("dealBreaker")}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              All-in cost per guest
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.costPerGuest) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `${money(result.total)} across ${result.guests} guests` : "Fix the input above to build the prompt"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={!ok}
              aria-label="Copy the generated wedding planning prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Budget split</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Category</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Share</th>
                <th scope="col" className="py-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {ok ? (
                result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{row.percent}%</td>
                    <td className="py-2 text-right font-semibold">{money(row.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-2 pr-3" colSpan={3}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">{result.phaseLabel} — what belongs to this phase</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.phaseTasks.map((task) => (
              <li key={task} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--primary)]">
                  •
                </span>
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your prompt</h2>
        <div className="mt-3 overflow-x-auto">
          <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)]">
            {ok ? result.prompt : DASH}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The category percentages are planning rules of thumb, not market prices, and real quotes vary
        widely by city, season and day of the week. Nothing here is financial advice — confirm every
        figure with the vendors you actually intend to book before committing money.
      </p>
    </main>
  );
}
