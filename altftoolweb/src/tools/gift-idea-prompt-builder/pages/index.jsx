"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gift, RotateCcw } from "lucide-react";

import { GIFT_CATEGORIES, OCCASIONS, buildGiftPrompt } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  relationship: "my younger sister",
  age: "24",
  interests: "ceramics, cozy cafes, weekend travel, sketching",
  dislikes: "generic perfume, clutter",
  occasion: "Birthday",
  currency: "USD",
  totalBudget: "160",
  recipients: "1",
  reservePct: "12",
  mainSharePct: "75",
  todayISO: "2026-07-28",
  occasionISO: "2026-08-12",
  ideaCount: "8",
  categories: ["Experiences", "Practical and used daily", "Personalised keepsake"],
};

const money = (value, currency) => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${currency} ${Math.round(value).toLocaleString("en-US")}`;
  }
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildGiftPrompt({
        relationship: form.relationship,
        recipientAge: form.age,
        interests: form.interests,
        dislikes: form.dislikes,
        occasion: form.occasion,
        currency: form.currency,
        totalBudget: Number(form.totalBudget),
        recipients: Number(form.recipients),
        reservePct: Number(form.reservePct),
        mainSharePct: Number(form.mainSharePct),
        todayISO: form.todayISO,
        occasionISO: form.occasionISO,
        categories: form.categories,
        ideaCount: Number(form.ideaCount),
      }),
    [form],
  );

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const toggleCategory = (category) => {
    setForm((current) => ({
      ...current,
      categories: current.categories.includes(category)
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category],
    }));
  };

  const copyPrompt = async () => {
    if (!result.prompt) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gift className="h-4 w-4" aria-hidden="true" />
          Better prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Gift Idea Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn budget, lead time, interests and safety constraints into a focused prompt for useful,
          non-generic gift recommendations.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Who is it for?", "relationship", "text"],
            ["Recipient age", "age", "number"],
            ["Total budget", "totalBudget", "number"],
            ["Currency", "currency", "text"],
            ["Recipients", "recipients", "number"],
            ["Ideas to ask for", "ideaCount", "number"],
            ["Tax/shipping reserve %", "reservePct", "number"],
            ["Main gift share %", "mainSharePct", "number"],
            ["Today", "todayISO", "date"],
            ["Occasion date", "occasionISO", "date"],
          ].map(([label, key, type]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`gift-${key}`}>
                {label}
              </label>
              <input
                id={`gift-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type={type}
                value={form[key]}
                onChange={(event) => update(key, event.target.value)}
              />
            </div>
          ))}

          <div>
            <label className={LABEL_CLASS} htmlFor="gift-occasion">
              Occasion
            </label>
            <select id="gift-occasion" className={`mt-2 ${INPUT_CLASS}`} value={form.occasion} onChange={(event) => update("occasion", event.target.value)}>
              {OCCASIONS.map((occasion) => (
                <option key={occasion} value={occasion}>
                  {occasion}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gift-interests">
              Interests
            </label>
            <textarea id="gift-interests" className="mt-2 min-h-20 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none" value={form.interests} onChange={(event) => update("interests", event.target.value)} />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gift-dislikes">
              Avoid
            </label>
            <textarea id="gift-dislikes" className="mt-2 min-h-20 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none" value={form.dislikes} onChange={(event) => update("dislikes", event.target.value)} />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Preferred categories</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {GIFT_CATEGORIES.map((category) => (
              <label key={category} className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm">
                <input type="checkbox" checked={form.categories.includes(category)} onChange={() => toggleCategory(category)} />
                {category}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {result.error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-[var(--surface-soft)] p-3">
              <p className="text-xs text-[var(--muted-foreground)]">Per person</p>
              <p className="mt-1 font-semibold">{money(result.perGift, form.currency)}</p>
            </div>
            <div className="rounded-lg bg-[var(--surface-soft)] p-3">
              <p className="text-xs text-[var(--muted-foreground)]">Main gift</p>
              <p className="mt-1 font-semibold">{money(result.mainGift, form.currency)}</p>
            </div>
            <div className="rounded-lg bg-[var(--surface-soft)] p-3">
              <p className="text-xs text-[var(--muted-foreground)]">Lead time</p>
              <p className="mt-1 font-semibold">{result.leadTime ? result.leadTime.label : "Not set"}</p>
            </div>
            <div className="rounded-lg bg-[var(--surface-soft)] p-3">
              <p className="text-xs text-[var(--muted-foreground)]">Prompt size</p>
              <p className="mt-1 font-semibold">{result.tokenEstimate} tokens est.</p>
            </div>
          </div>

          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--surface-soft)] p-4 text-sm leading-6">{result.prompt}</pre>

          <div className="mt-5 flex flex-wrap gap-2">
            <button className={GHOST_BTN} type="button" onClick={() => setForm(DEFAULTS)}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <button className={PRIMARY_BTN} type="button" onClick={copyPrompt}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied" : "Copy prompt"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
