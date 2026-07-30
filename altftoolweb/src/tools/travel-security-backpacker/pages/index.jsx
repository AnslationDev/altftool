"use client";

import { useMemo, useState } from "react";
import { Backpack, Check, Copy, RotateCcw } from "lucide-react";

import { DEFAULT_TARGET_PERCENT, MEASURES, TIERS, assessBackpackerSecurity } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const DASH = "—";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm transition hover:border-[var(--primary)] focus-within:border-[var(--primary)] focus-within:ring-[3px] focus-within:ring-[var(--primary)]/25";
const CHECKBOX = "mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus:outline-none";
const FIELD =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";

const TONE_TEXT = {
  success: "text-[var(--success)]",
  warning: "text-[var(--primary)]",
  danger: "text-[var(--danger)]",
};

/** First paint: the handful of habits most travellers already have. */
const DEFAULT_ADOPTED = ["strong-passcode", "find-my", "cloud-backup", "offline-map", "padlock"];
const DEFAULT_BUDGET = "3000";

const TIERED = TIERS.map((tier, index) => {
  const lower = index === 0 ? -1 : TIERS[index - 1].max;
  return {
    ...tier,
    items: MEASURES.filter((measure) => measure.cost > lower && measure.cost <= tier.max),
  };
});

function toggle(list, id) {
  return list.includes(id) ? list.filter((value) => value !== id) : [...list, id];
}

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [adoptedIds, setAdoptedIds] = useState(DEFAULT_ADOPTED);
  const [budget, setBudget] = useState(DEFAULT_BUDGET);
  const [target, setTarget] = useState(DEFAULT_TARGET_PERCENT);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      assessBackpackerSecurity({
        adoptedIds,
        budgetInr: toNumber(budget),
        targetPercent: target,
      }),
    [adoptedIds, budget, target],
  );
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Backpacker security check",
      `Overall coverage: ${result.overallPercent}% — ${result.band.label}`,
      `Measures in place: ${result.adoptedCount} of ${result.totalMeasures}`,
      "",
      "By domain:",
      ...result.domains.map((domain) => `${domain.label}: ${domain.percent}%`),
      "",
      result.freeRemaining.length
        ? `Free measures still unticked (${result.freeRemaining.length}):\n${result.freeRemaining.map((item) => `- ${item.label}`).join("\n")}`
        : "All free measures are in place.",
      "",
      result.plan.length
        ? `Kit plan within ${INR.format(result.budgetInr)}:\n${result.plan
            .map((item, index) => `${index + 1}. ${item.label} — ${INR.format(item.cost)}`)
            .join("\n")}\nTotal ${INR.format(result.planCost)}, coverage rises to ${result.afterOverall}%.`
        : "No further purchases needed at this target.",
      "",
      result.verdict,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result]);

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
    setAdoptedIds(DEFAULT_ADOPTED);
    setBudget(DEFAULT_BUDGET);
    setTarget(DEFAULT_TARGET_PERCENT);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Measures in place", DASH],
        ["Free measures still open", DASH],
        ["Plan cost within budget", DASH],
        ["Coverage after the plan", DASH],
        ["Cost to reach the target everywhere", DASH],
      ]
    : [
        [
          "Measures in place",
          `${NUM.format(result.adoptedCount)} of ${NUM.format(result.totalMeasures)}`,
        ],
        ["Free measures still open", NUM.format(result.freeRemaining.length)],
        [
          "Plan cost within budget",
          `${INR.format(result.planCost)} for ${NUM.format(result.plan.length)} item(s)`,
        ],
        ["Coverage after the plan", `${NUM.format(result.afterOverall)}%`],
        ["Cost to reach the target everywhere", INR.format(result.costToTarget)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Backpack className="h-4 w-4" aria-hidden="true" />
          Travel security
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Backpacker Digital Safety Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick what you already do. Coverage is scored across six risk domains, and the planner
          works out the cheapest set of additions that closes the biggest gaps — free habits
          first, always, because they outperform anything you can buy.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="kit-budget">
              Budget for new kit (INR)
            </label>
            <input
              id="kit-budget"
              className={`mt-2 ${FIELD}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="kit-target">
              Coverage target per domain
            </label>
            <select
              id="kit-target"
              className={`mt-2 ${FIELD}`}
              value={target}
              onChange={(event) => setTarget(Number(event.target.value))}
            >
              {[50, 60, 70, 80, 90, 100].map((value) => (
                <option key={value} value={value}>
                  {value}%
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {TIERED.map((tier) => (
        <section
          key={tier.id}
          className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        >
          <h2 className="text-base font-semibold">{tier.label}</h2>
          <div className="mt-3 grid gap-2">
            {tier.items.map((measure) => (
              <label key={measure.id} className={CHECK_ROW} htmlFor={`m-${measure.id}`}>
                <input
                  id={`m-${measure.id}`}
                  type="checkbox"
                  className={CHECKBOX}
                  checked={adoptedIds.includes(measure.id)}
                  onChange={() => setAdoptedIds((current) => toggle(current, measure.id))}
                />
                <span className="leading-6">
                  <span className="font-medium">{measure.label}</span>
                  {measure.cost > 0 ? (
                    <span className="ml-2 rounded-sm bg-[var(--muted)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--primary)]">
                      about {INR.format(measure.cost)}
                    </span>
                  ) : (
                    <span className="ml-2 rounded-sm bg-[var(--muted)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--success)]">
                      free
                    </span>
                  )}
                  <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                    {measure.why}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </section>
      ))}

      {hasError ? (
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
              Overall coverage
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${hasError ? "text-[var(--muted-foreground)]" : TONE_TEXT[result.band.tone]}`}
            >
              {hasError ? DASH : `${NUM.format(result.overallPercent)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm font-semibold">
              {hasError ? DASH : result.band.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the backpacker security plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the checklist to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
          {hasError ? "Fix the input above to see a plan." : result.verdict}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <div className="mt-5 grid gap-3">
            {result.domains.map((domain) => (
              <div key={domain.id}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span>{domain.label}</span>
                  <span
                    className={`font-semibold ${domain.meetsTarget ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
                  >
                    {NUM.format(domain.percent)}%
                  </span>
                </div>
                <div
                  className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="img"
                  aria-label={`${domain.label}: ${domain.percent} percent covered`}
                >
                  <span
                    className={`block h-full ${domain.meetsTarget ? "bg-[var(--success)]" : "bg-[var(--primary)]"}`}
                    style={{ width: `${Math.max(0, Math.min(100, domain.percent))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {!hasError && result.freeRemaining.length ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Free measures still unticked</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Do these before you spend anything.
          </p>
          <ul className="mt-3 grid gap-1.5 text-sm leading-6">
            {result.freeRemaining.map((item) => (
              <li key={item.id} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--success)]">
                  &bull;
                </span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!hasError && result.plan.length ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Buy in this order</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[24rem] text-left text-sm">
              <caption className="sr-only">Cheapest-first kit plan within budget</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    #
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Measure
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.plan.map((item, index) => (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{index + 1}</td>
                    <td className="py-2.5 pr-3">{item.label}</td>
                    <td className="py-2.5 font-semibold">
                      {item.cost > 0 ? INR.format(item.cost) : "Free"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Total {INR.format(result.planCost)} — overall coverage rises from{" "}
            {NUM.format(result.overallPercent)}% to {NUM.format(result.afterOverall)}%.
          </p>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Prices are indicative Indian retail figures for the cheapest usable version of each item
        and will vary by brand and city. Coverage points are consistent editorial ratings, not
        measured risk. Nothing you tick here leaves your browser.
      </p>
    </main>
  );
}
