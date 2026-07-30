"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, ShoppingBag, Trash2 } from "lucide-react";

import {
  AFTER_STEPS,
  CORE_RULE,
  CYBERCRIME_HELPLINE,
  CYBERCRIME_PORTAL,
  DEMAND_LADDER,
  RED_FLAGS,
  SAFE_PRACTICE,
  assessDeal,
  formatBriefing,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${Number.isFinite(value) ? value.toFixed(1) : "0.0"}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_CLASS = {
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--muted)] text-[var(--foreground)]",
  muted: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const DEFAULTS = {
  asking: "35000",
  market: "70000",
  demands: ["5000", "2500", "7500"],
  flags: ["id-card-photo", "no-meeting", "advance-before-inspection"],
};

export default function ToolHome() {
  const [asking, setAsking] = useState(DEFAULTS.asking);
  const [market, setMarket] = useState(DEFAULTS.market);
  const [demands, setDemands] = useState(DEFAULTS.demands);
  const [flags, setFlags] = useState(DEFAULTS.flags);
  const [copied, setCopied] = useState(false);

  const assessment = useMemo(
    () =>
      assessDeal({
        askingPrice: Number(asking),
        marketPrice: Number(market),
        advance: Number(demands[0] || 0),
        demands: demands.map(Number),
        flags,
      }),
    [asking, market, demands, flags],
  );

  const briefing = useMemo(() => formatBriefing(assessment), [assessment]);

  const toggleFlag = (id) => {
    setFlags((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setCopied(false);
  };

  const updateDemand = (index, value) => {
    setDemands((current) => current.map((item, i) => (i === index ? value : item)));
    setCopied(false);
  };

  const addDemand = () => {
    setDemands((current) => [...current, "0"]);
    setCopied(false);
  };

  const removeDemand = (index) => {
    setDemands((current) => (current.length > 1 ? current.filter((_, i) => i !== index) : current));
    setCopied(false);
  };

  const reset = () => {
    setAsking(DEFAULTS.asking);
    setMarket(DEFAULTS.market);
    setDemands(DEFAULTS.demands);
    setFlags(DEFAULTS.flags);
    setCopied(false);
  };

  const copyBriefing = async () => {
    if (!briefing) return;
    try {
      await navigator.clipboard.writeText(briefing);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const dash = "—";
  const failed = Boolean(assessment.error);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          Scam literacy
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Army Officer Marketplace Scam Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A bargain listing, a service ID card sent over chat, a posting at short notice, and an
          advance that keeps growing. Here is the structure of it, and what your exposure adds up to.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-lg leading-7 font-semibold text-[var(--primary)]">{CORE_RULE}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The uniform in the story is doing one job: making a refusal to meet sound reasonable. Real
          defence personnel buy and sell like everyone else, in person, with the goods present.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The deal</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="deal-asking">
              Price being asked (INR)
            </label>
            <input
              id="deal-asking"
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              className={`mt-2 ${INPUT_CLASS}`}
              value={asking}
              onChange={(event) => {
                setAsking(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="deal-market">
              Realistic market price (INR)
            </label>
            <input
              id="deal-market"
              type="number"
              inputMode="decimal"
              min="1"
              step="500"
              className={`mt-2 ${INPUT_CLASS}`}
              value={market}
              onChange={(event) => {
                setMarket(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>

        <h3 className="mt-6 text-sm font-semibold">Money demanded before you have the item</h3>
        <div className="mt-3 space-y-3">
          {demands.map((demand, index) => (
            <div key={`demand-${index}`} className="flex items-end gap-2">
              <div className="flex-1">
                <label className={LABEL_CLASS} htmlFor={`demand-${index}`}>
                  Demand {index + 1}
                  {DEMAND_LADDER[index] ? ` — ${DEMAND_LADDER[index].label}` : ""}
                </label>
                <input
                  id={`demand-${index}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="500"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={demand}
                  onChange={(event) => updateDemand(index, event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeDemand(index)}
                aria-label={`Remove demand ${index + 1}`}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addDemand} className={`mt-3 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add another demand
        </button>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {assessment.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              At risk before you see the item
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--danger)]">
              {failed ? dash : money(assessment.atRisk)}
            </p>
            {!failed && (
              <p className="mt-2 inline-flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE_CLASS[assessment.band.tone]}`}
                >
                  {assessment.band.label}
                </span>
                <span className="text-sm text-[var(--muted-foreground)]">
                  {assessment.ladder.count} demand(s) so far
                </span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyBriefing}
              aria-label="Copy the deal assessment"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy assessment"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checker" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Below the market price by", failed ? dash : pct(assessment.discount.percent)],
            [
              "First advance as a share of the price",
              failed ? dash : pct(assessment.exposure.percent),
            ],
            [
              "Total demanded so far",
              failed
                ? dash
                : `${money(assessment.ladder.total)}${
                    assessment.ladder.multipleOfFirst
                      ? ` (${assessment.ladder.multipleOfFirst.toFixed(1)}x the first ask)`
                      : ""
                  }`,
            ],
            ["Red-flag score", failed ? dash : `${assessment.risk.score} of ${assessment.risk.max}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <>
            <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {assessment.band.advice}
            </p>
            {assessment.structural.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-[var(--danger)]">
                {assessment.structural.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {assessment.ladder.steps.length > 1 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Demand
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">
                        Amount
                      </th>
                      <th scope="col" className="py-2 text-right font-semibold">
                        Running total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessment.ladder.steps.map((step) => (
                      <tr key={step.index} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 font-semibold">{step.index}</td>
                        <td className="py-2 pr-3 text-right">{money(step.amount)}</td>
                        <td className="py-2 text-right font-semibold">{money(step.running)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What has actually happened?</h2>
        <div className="mt-4 space-y-3">
          {RED_FLAGS.map((flag) => (
            <div key={flag.id}>
              <label
                htmlFor={`flag-${flag.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm leading-6"
              >
                <input
                  id={`flag-${flag.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
                  checked={flags.includes(flag.id)}
                  onChange={() => toggleFlag(flag.id)}
                />
                {flag.label}
              </label>
              {flags.includes(flag.id) && (
                <p className="mt-1 pl-8 text-sm leading-6 text-[var(--muted-foreground)]">{flag.why}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The escalation, in the order it arrives</h2>
        <ol className="mt-4 space-y-3">
          {DEMAND_LADDER.map((step, index) => (
            <li key={step.id} className="rounded-lg border border-[var(--border)] p-4">
              <p className="text-sm font-semibold">
                {index + 1}. {step.label}
              </p>
              <p className="mt-1 text-sm leading-6 italic text-[var(--muted-foreground)]">
                &ldquo;{step.excuse}&rdquo;
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
          Every rung is framed as the last one. The final rung inverts the story: a request you must
          approve to &quot;get everything back&quot;, which debits you again.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Buying and selling safely</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {SAFE_PRACTICE.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h3 className="mt-5 text-sm font-semibold">If you have already paid</h3>
        <ol className="mt-2 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {AFTER_STEPS.map((step, index) => (
            <li key={step}>
              <span className="font-semibold text-[var(--foreground)]">{index + 1}.</span> {step}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm font-semibold">
          Helpline {CYBERCRIME_HELPLINE} · {CYBERCRIME_PORTAL}
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. The score is a structural screen, not a judgement about
        any individual: a genuine seller can look suspicious and a careful stranger can still be
        honest. Meeting in person and paying on handover is what removes the risk.
      </p>
    </main>
  );
}
