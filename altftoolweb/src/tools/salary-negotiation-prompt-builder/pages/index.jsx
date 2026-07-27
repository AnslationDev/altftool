"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Handshake, RotateCcw } from "lucide-react";
import {
  COUNTERPART_STYLES,
  LEVERS,
  TONES,
  buildSalaryNegotiationPrompt,
} from "../lib";

const DEFAULTS = {
  role: "Senior Data Engineer",
  company: "Acme Analytics",
  currency: "USD",
  currentSalary: "120000",
  targetSalary: "145000",
  marketLow: "130000",
  marketHigh: "170000",
  counterpartStyle: "budget-constrained",
  tone: "collaborative",
  rounds: "4",
  levers: ["Base salary", "Signing bonus", "Guaranteed review date"],
  achievements: "Cut pipeline cost 31% and led the migration that unblocked the Q3 launch.",
  constraints: "I would stay for the right package; I am not looking to leave.",
};

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "SGD", "AED"];

const INPUT =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const toggleLever = (lever) =>
    setForm((prev) => ({
      ...prev,
      levers: prev.levers.includes(lever)
        ? prev.levers.filter((item) => item !== lever)
        : [...prev.levers, lever],
    }));

  const result = useMemo(
    () =>
      buildSalaryNegotiationPrompt({
        role: form.role,
        company: form.company,
        currency: form.currency,
        currentSalary: form.currentSalary === "" ? 0 : Number(form.currentSalary),
        targetSalary: form.targetSalary === "" ? 0 : Number(form.targetSalary),
        marketLow: form.marketLow === "" ? 0 : Number(form.marketLow),
        marketHigh: form.marketHigh === "" ? 0 : Number(form.marketHigh),
        counterpartStyle: form.counterpartStyle,
        tone: form.tone,
        rounds: form.rounds === "" ? 0 : Number(form.rounds),
        levers: form.levers,
        achievements: form.achievements,
        constraints: form.constraints,
      }),
    [form],
  );

  const failed = Boolean(result.error);

  const money = useMemo(() => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: form.currency || "USD",
        maximumFractionDigits: 0,
      });
    } catch {
      return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
    }
  }, [form.currency]);

  const copyResult = async () => {
    if (failed) return;
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
    ["Ask vs current pay", failed || result.increasePct === null ? DASH : `+${money.format(result.increaseAmount)} (${result.increasePct}%)`],
    ["Band midpoint", failed || result.midpoint === null ? DASH : money.format(result.midpoint)],
    ["Compa-ratio (ask ÷ midpoint)", failed || result.compaRatio === null ? DASH : result.compaRatio.toFixed(2)],
    ["Range penetration", failed || result.penetration === null ? DASH : `${result.penetration}%`],
    ["Prompt length", failed ? DASH : `${result.wordCount} words · ~${result.tokenEstimate} tokens`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Handshake className="h-4 w-4" aria-hidden="true" />
          Career prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Salary Negotiation Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn your numbers into a roleplay prompt you can paste into any chat model, so you
          rehearse the conversation before you have it for real.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="sn-role">Role or job title</label>
            <input id="sn-role" className={`mt-2 ${INPUT}`} value={form.role} onChange={set("role")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="sn-company">Company (optional)</label>
            <input id="sn-company" className={`mt-2 ${INPUT}`} value={form.company} onChange={set("company")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="sn-currency">Currency</label>
            <select id="sn-currency" className={`mt-2 ${INPUT}`} value={form.currency} onChange={set("currency")}>
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="sn-rounds">Rounds to rehearse</label>
            <input id="sn-rounds" className={`mt-2 ${INPUT}`} type="number" inputMode="numeric" min="1" max="10" value={form.rounds} onChange={set("rounds")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="sn-current">Current annual pay</label>
            <input id="sn-current" className={`mt-2 ${INPUT}`} type="number" inputMode="decimal" min="0" step="1000" value={form.currentSalary} onChange={set("currentSalary")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="sn-target">Pay you will ask for</label>
            <input id="sn-target" className={`mt-2 ${INPUT}`} type="number" inputMode="decimal" min="0" step="1000" value={form.targetSalary} onChange={set("targetSalary")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="sn-low">Market range — minimum</label>
            <input id="sn-low" className={`mt-2 ${INPUT}`} type="number" inputMode="decimal" min="0" step="1000" value={form.marketLow} onChange={set("marketLow")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="sn-high">Market range — maximum</label>
            <input id="sn-high" className={`mt-2 ${INPUT}`} type="number" inputMode="decimal" min="0" step="1000" value={form.marketHigh} onChange={set("marketHigh")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="sn-style">Who you are practising against</label>
            <select id="sn-style" className={`mt-2 ${INPUT}`} value={form.counterpartStyle} onChange={set("counterpartStyle")}>
              {Object.entries(COUNTERPART_STYLES).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="sn-tone">Your tone</label>
            <select id="sn-tone" className={`mt-2 ${INPUT}`} value={form.tone} onChange={set("tone")}>
              {Object.keys(TONES).map((key) => (
                <option key={key} value={key}>{key[0].toUpperCase() + key.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL}>Levers you are willing to trade</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {LEVERS.map((lever) => {
              const active = form.levers.includes(lever);
              return (
                <button
                  key={lever}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleLever(lever)}
                  className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {lever}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4">
          <div>
            <label className={LABEL} htmlFor="sn-ach">Evidence you can point to</label>
            <textarea id="sn-ach" rows={2} className={`mt-2 ${TEXTAREA}`} value={form.achievements} onChange={set("achievements")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="sn-con">Constraints on your side</label>
            <textarea id="sn-con" rows={2} className={`mt-2 ${TEXTAREA}`} value={form.constraints} onChange={set("constraints")} />
          </div>
        </div>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Range penetration of your ask
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed || result.penetration === null ? DASH : `${result.penetration}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {failed ? "Fix the highlighted input to generate your prompt." : result.bandVerdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} disabled={failed} aria-label="Copy the negotiation roleplay prompt" className={`${GHOST_BTN} disabled:opacity-50`}>
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
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your prompt</h2>
        <div className="mt-3 overflow-x-auto">
          <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-4 text-sm leading-6 text-[var(--foreground)] ring-1 ring-[var(--border)]">
            {failed ? DASH : result.prompt}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Compa-ratio and range penetration describe the numbers you entered — they
        are not a valuation of your work, and a chat model is a rehearsal partner, not a compensation
        or employment-law adviser.
      </p>
    </main>
  );
}
