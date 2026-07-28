"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Instagram,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import {
  CHECKLIST,
  CRITICAL_CAP_PERCENT,
  DEFAULT_DONE,
  GROUPS,
  scoreChecklist,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const CARD = "rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [done, setDone] = useState(() => DEFAULT_DONE.slice());
  const [copied, setCopied] = useState(false);
  const doneSet = useMemo(() => new Set(done), [done]);
  const score = useMemo(() => scoreChecklist(done), [done]);

  const toggle = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

  const reset = () => {
    setDone(DEFAULT_DONE.slice());
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (score.error) return "";
    const lines = [
      "Instagram 2FA Setup Guide",
      `Score: ${score.percent}% — ${score.bandLabel}`,
      `Controls done: ${score.completed} of ${score.total}`,
      `Critical controls missing: ${score.missingCritical.length}`,
      "",
      "Next actions:",
      ...(score.nextActions.length
        ? score.nextActions.map((item) => `- ${item.title}`)
        : ["- Every listed control is complete"]),
    ];
    return lines.join("\n");
  }, [score]);

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

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className={CARD}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
              <Instagram className="h-4 w-4" aria-hidden="true" />
              Instagram account security
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Instagram 2FA Setup Guide
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
              Harden an Instagram account against password leaks, SIM swaps, phishing DMs,
              connected-app abuse and forgotten sessions. Everything runs locally; never enter
              your password, backup codes or authenticator secret here.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 lg:max-w-sm">
            <p className="font-bold">Recovery-first checklist</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              Save backup codes and verify recovery contact details before removing SMS or signing
              out old devices, so you do not lock yourself out.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className={CARD}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Hardening score
              </p>
              <p className="mt-2 text-5xl font-black text-[var(--primary)]">
                {score.error ? "—" : `${score.percent}%`}
              </p>
              <p className="mt-1 text-sm font-bold">{score.error ? "Check setup" : score.bandLabel}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {score.error ? score.error : score.bandHint}
              </p>
            </div>
            <ShieldCheck className="h-10 w-10 text-[var(--primary)]" aria-hidden="true" />
          </div>
          <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]">
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: `${score.error ? 0 : score.percent}%` }}
            />
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-[var(--muted)] p-3">
              <dt className="text-[var(--muted-foreground)]">Done</dt>
              <dd className="mt-1 text-xl font-bold">
                {score.error ? "—" : `${score.completed}/${score.total}`}
              </dd>
            </div>
            <div className="rounded-lg bg-[var(--muted)] p-3">
              <dt className="text-[var(--muted-foreground)]">Points</dt>
              <dd className="mt-1 text-xl font-bold">
                {score.error ? "—" : `${NUM.format(score.points)}/${NUM.format(score.maxPoints)}`}
              </dd>
            </div>
          </dl>

          {score.capped ? (
            <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Score is capped at {CRITICAL_CAP_PERCENT}% until every critical sign-in and recovery
                control is complete.
              </span>
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className={GHOST_BTN} onClick={copyResult}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied" : "Copy result"}
            </button>
            <button type="button" className={PRIMARY_BTN} onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className={CARD}>
          <h2 className="text-xl font-bold">Next best actions</h2>
          <ol className="mt-4 space-y-3">
            {score.nextActions.map((item) => (
              <li key={item.id} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{item.title}</p>
                  <span className="rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-xs font-bold text-[var(--primary)]">
                    +{item.weight}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{item.where}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {GROUPS.map((group) => {
        const items = CHECKLIST.filter((item) => item.group === group);
        if (items.length === 0) return null;
        return (
          <section key={group} className={CARD}>
            <h2 className="text-xl font-bold">{group}</h2>
            <div className="mt-4 space-y-3">
              {items.map((item) => {
                const checked = doneSet.has(item.id);
                return (
                  <label
                    key={item.id}
                    className="flex cursor-pointer gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 transition hover:border-[var(--primary)]"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                      checked={checked}
                      onChange={() => toggle(item.id)}
                    />
                    <span>
                      <span className="flex flex-wrap items-center gap-2 font-bold">
                        {item.title}
                        {item.critical ? (
                          <span className="rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-xs text-[var(--danger)]">
                            Critical
                          </span>
                        ) : null}
                        <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                          +{item.weight}
                        </span>
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                        {item.detail}
                      </span>
                      <span className="mt-2 block text-xs font-semibold text-[var(--primary)]">
                        {item.where}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
