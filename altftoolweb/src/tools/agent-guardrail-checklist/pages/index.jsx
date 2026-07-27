"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck } from "lucide-react";

import { CATEGORIES, scoreChecklist, WEIGHTS } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const WEIGHT_BADGES = {
  critical: "Critical",
  important: "Important",
  recommended: "Recommended",
};

/** A plausible mid-flight state so the page shows a real verdict at first paint. */
const DEFAULT_CHECKED = [
  "leastPrivilege",
  "toolAllowlist",
  "spendCap",
  "loopBreaker",
  "irreversibleGate",
  "secretsIsolation",
  "auditLog",
];

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [checked, setChecked] = useState(DEFAULT_CHECKED);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => scoreChecklist({ checked }), [checked]);

  const toggle = (id) => () => {
    setChecked((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyReport = async () => {
    const lines = [
      "Agent guardrail review",
      `Verdict: ${result.verdict}`,
      `Score: ${result.score}/${result.maxScore} (${result.percent}%)`,
      `Items done: ${result.checkedCount}/${result.totalCount}`,
      "",
      ...result.byCategory.map(
        (category) => `${category.title}: ${category.done}/${category.total} (${category.score}/${category.max} pts)`,
      ),
    ];
    if (result.missingCritical.length > 0) {
      lines.push("", "Missing critical guardrails:");
      for (const item of result.missingCritical) {
        lines.push(`- [${item.category}] ${item.label}`);
      }
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setChecked(DEFAULT_CHECKED);
    setCopied(false);
  };

  const levelTone =
    result.level === "ready"
      ? "text-[var(--success)]"
      : result.level === "blocked"
        ? "text-[var(--danger)]"
        : "text-[var(--primary)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Agent design
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Agent Guardrail Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Review permissions, spend caps, confirmation gates, injection defences and monitoring
          before shipping an autonomous agent. Items follow OWASP&apos;s LLM Top 10 (Excessive
          Agency, Prompt Injection) — a missing critical item blocks the verdict regardless of
          score.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Guardrail score
            </p>
            <p className={`mt-1 text-4xl font-semibold ${levelTone}`}>{result.percent}%</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">{result.verdict}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyReport}
              aria-label="Copy the guardrail review report"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the checklist to the example state"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Weighted score", `${NUM.format(result.score)} / ${NUM.format(result.maxScore)} pts`],
            ["Items done", `${NUM.format(result.checkedCount)} / ${NUM.format(result.totalCount)}`],
            ["Critical gaps", NUM.format(result.missingCritical.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {result.missingCritical.length > 0 ? (
        <section
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
        >
          <p className="font-semibold">
            {result.missingCritical.length} critical guardrail
            {result.missingCritical.length === 1 ? "" : "s"} missing:
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {result.missingCritical.map((item) => (
              <li key={item.id}>{item.label}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {CATEGORIES.map((category) => {
        const summary = result.byCategory.find((entry) => entry.id === category.id);
        return (
          <section
            key={category.id}
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-semibold">{category.title}</h2>
              <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                {summary ? `${summary.done}/${summary.total}` : ""}
              </p>
            </div>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{category.note}</p>
            <div className="mt-3 grid gap-2">
              {category.items.map((item) => (
                <label
                  key={item.id}
                  htmlFor={`gr-${item.id}`}
                  className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
                >
                  <input
                    id={`gr-${item.id}`}
                    type="checkbox"
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                    checked={checked.includes(item.id)}
                    onChange={toggle(item.id)}
                  />
                  <span className="flex-1">
                    {item.label}
                    <span
                      className={`ml-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        item.weight === "critical"
                          ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                          : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      {WEIGHT_BADGES[item.weight]} · {WEIGHTS[item.weight]} pts
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        );
      })}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A checklist is a floor, not a certification — pair it with a real security review for
        agents that touch money, production systems or personal data. Scoring runs entirely in your
        browser.
      </p>
    </main>
  );
}
