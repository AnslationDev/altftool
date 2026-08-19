"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck, TriangleAlert, Github } from "lucide-react";

import {
  CHECKLIST,
  CRITICAL_CAP_PERCENT,
  DEFAULT_DONE,
  GROUPS,
  planToTarget,
  scoreChecklist,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "\u2014";
const CRITICAL_COUNT = CHECKLIST.filter((item) => item.critical).length;

export default function ToolHome() {
  const [done, setDone] = useState(() => DEFAULT_DONE.slice());
  const [target, setTarget] = useState("90");
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const score = useMemo(() => scoreChecklist(done), [done]);
  const plan = useMemo(
    () => planToTarget(done, target.trim() === "" ? Number.NaN : Number(target)),
    [done, target]
  );

  const toggle = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const reset = () => {
    setDone(DEFAULT_DONE.slice());
    setTarget("90");
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (score.error) return "";
    const lines = [
      "GitHub 2FA Setup Guide",
      `Score: ${score.percent}% \u2014 ${score.bandLabel}`,
      `Controls done: ${score.completed} of ${score.total}`,
      `Critical controls missing: ${score.missingCritical.length}`,
      "",
    ];
    if (score.remaining.length === 0) {
      lines.push("Nothing left \u2014 every control is ticked.");
    } else {
      lines.push("Still to do:");
      for (const item of score.remaining) {
        lines.push(`- ${item.title}${item.critical ? " (critical)" : ""}`);
      }
    }
    return lines.join("\n");
  }, [score]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const hasScore = !score.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Github className="h-4 w-4" aria-hidden="true" />
          GitHub security
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">GitHub 2FA Setup Guide</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          GitHub requires two-factor authentication from everyone who contributes code, but 2FA alone is not the whole job. Work down the list; the score weights each control by how much it protects your code and your tokens.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]" aria-labelledby="score-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" aria-atomic="true">
            <p id="score-heading" className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Hardening score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasScore ? `${score.percent}%` : DASH}
            </p>
            <p className="mt-1 text-sm font-semibold">{hasScore ? score.bandLabel : DASH}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasScore ? score.bandHint : "Fix the problem shown below to see a score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={copied ? "Copied to clipboard" : "Copy the security checklist result"}
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={hasScore ? `Hardening score ${score.percent} out of 100` : "Score unavailable"}
        >
          <span className="block h-full bg-[var(--primary)]" style={{ width: `${hasScore ? score.percent : 0}%` }} />
        </div>

        {score.error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {score.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Controls completed", hasScore ? `${score.completed} of ${score.total}` : DASH],
            [
              "Weighted points",
              hasScore ? `${NUM.format(score.points)} / ${NUM.format(score.maxPoints)}` : DASH,
            ],
            [
              "Critical controls missing",
              hasScore ? `${score.missingCritical.length} of ${CRITICAL_COUNT}` : DASH,
            ],
            ["Score band", hasScore ? score.bandLabel : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasScore && score.capped ? (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Score held at {CRITICAL_CAP_PERCENT}% while a critical control is open. Tick every control
              marked critical to score higher.
            </span>
          </p>
        ) : null}

        {hasScore && score.nextActions.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Do these next
            </p>
            <ol className="mt-2 space-y-1 text-sm">
              {score.nextActions.map((item) => (
                <li key={item.id} className="flex gap-2">
                  <span className="font-semibold text-[var(--primary)]">+{item.weight}</span>
                  <span>{item.title}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="target-score">
              Target score (%)
            </label>
            <input
              id="target-score"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="5"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div className="self-end text-sm text-[var(--muted-foreground)]">
            <p>
              The shortest route to your target, highest-impact control first. Anything above{" "}
              {CRITICAL_CAP_PERCENT}% needs every critical control done.
            </p>
          </div>
        </div>

        <div aria-live="polite" aria-atomic="true">
          {plan.error ? (
            <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
              {plan.error}
            </p>
          ) : plan.steps.length === 0 ? (
            <p className="mt-4 flex items-center gap-2 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              Target already met.
            </p>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                {plan.steps.length} more control{plan.steps.length === 1 ? "" : "s"} takes you to{" "}
                <span className="font-semibold text-[var(--foreground)]">{plan.projectedPercent}%</span>.
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {plan.steps.map((item) => (
                  <li key={item.id} className="flex gap-2">
                    <span className="font-semibold text-[var(--primary)]">+{item.weight}</span>
                    <span>{item.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 space-y-4">
        {GROUPS.map((group) => {
          const items = CHECKLIST.filter((item) => item.group === group);
          const groupStat = hasScore ? score.groups.find((entry) => entry.name === group) : null;
          return (
            <div key={group} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">{group}</h2>
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                  {groupStat ? `${groupStat.done}/${groupStat.total} done` : DASH}
                </span>
              </div>
              <ul className="mt-3 space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <label
                      htmlFor={`step-${item.id}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                    >
                      <input
                        id={`step-${item.id}`}
                        type="checkbox"
                        checked={done.includes(item.id)}
                        onChange={() => toggle(item.id)}
                        className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{item.title}</span>
                          {item.critical ? (
                            <span className="rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--danger)]">
                              Critical
                            </span>
                          ) : null}
                          <span className="text-[11px] font-semibold text-[var(--muted-foreground)]">
                            +{item.weight}
                          </span>
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                          {item.detail}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Mistakes worth avoiding</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>Storing the recovery codes in a private repository on the same GitHub account you would be locked out of.</li>
          <li>Leaving a classic personal access token with full repo and workflow scope and no expiry date on a machine you no longer own.</li>
          <li>Assuming a deleted repository removed the secret from history &mdash; once pushed, a key must be rotated, not merely deleted.</li>
          <li>Enabling 2FA on your personal account while a CI service still authenticates as you through an old OAuth grant.</li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything you tick stays in this browser tab &mdash; the page stores no account data and never asks
        for a password or a code. Menu labels move as apps are updated, so follow the description rather
        than hunting for an exact wording, and check the provider&rsquo;s own help pages if a setting has moved.
      </p>
    </main>
  );
}
