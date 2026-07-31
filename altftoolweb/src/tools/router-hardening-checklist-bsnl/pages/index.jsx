"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Router, ShieldCheck } from "lucide-react";

import {
  ADMIN_URL,
  HARDENING_STEPS,
  ROUTER_MODEL_NOTE,
  formatHardeningSummary,
  scoreHardening,
} from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 motion-reduce:transform-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 motion-reduce:transform-none";

const GROUPS = Array.from(new Set(HARDENING_STEPS.map((step) => step.group)));
const DEFAULT_DONE = ["wpa2-aes"];

const BAND_TEXT = {
  hardened: "text-[var(--success)]",
  good: "text-[var(--primary)]",
  weak: "text-[var(--warning)]",
  exposed: "text-[var(--danger)]",
};

export default function ToolHome() {
  const [completed, setCompleted] = useState(DEFAULT_DONE);
  const [notApplicable, setNotApplicable] = useState([]);
  const [copied, setCopied] = useState(false);
  const result = useMemo(
    () => scoreHardening({ completed, notApplicable }),
    [completed, notApplicable],
  );
  const hasError = Boolean(result.error);
  const summary = useMemo(() => formatHardeningSummary(result), [result]);

  const toggleCompleted = (id) => {
    setCompleted((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setNotApplicable((current) => current.filter((item) => item !== id));
    setCopied(false);
  };

  const toggleSkipped = (id) => {
    const turningOn = !notApplicable.includes(id);
    setNotApplicable((current) =>
      turningOn ? [...current, id] : current.filter((item) => item !== id),
    );
    if (turningOn) {
      setCompleted((current) => current.filter((item) => item !== id));
    }
    setCopied(false);
  };

  const reset = () => {
    setCompleted(DEFAULT_DONE);
    setNotApplicable([]);
    setCopied(false);
  };

  const copySummary = async () => {
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
    <main className="mx-auto w-full max-w-5xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Router className="h-4 w-4" aria-hidden="true" />
          BSNL router security
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          BSNL Broadband Router Hardening Checklist
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
          Score BSNL Bharat Fiber and older ADSL routers for admin defaults, Telnet,
          TR-069 exposure, WPS, Wi-Fi encryption, UPnP, port forwards and firmware hygiene.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className={CARD}>
          <div className="rounded-lg bg-[var(--background)] p-4 text-sm leading-6 text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
            <strong className="text-[var(--foreground)]">Typical login:</strong>{" "}
            <span className="font-mono text-[var(--foreground)]">{ADMIN_URL}</span>.{" "}
            {ROUTER_MODEL_NOTE}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className={GHOST_BTN}
              onClick={() => {
                setCompleted(HARDENING_STEPS.map((step) => step.id));
                setNotApplicable([]);
              }}
            >
              Mark all done
            </button>
            <button type="button" className={GHOST_BTN} onClick={() => setCompleted([])}>
              Clear done
            </button>
            <button type="button" className={GHOST_BTN} onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {GROUPS.map((group) => (
              <fieldset key={group} className="rounded-lg border border-[var(--border)] p-4">
                <legend className="px-1 text-sm font-semibold text-[var(--foreground)]">
                  {group}
                </legend>
                <div className="mt-3 grid gap-3">
                  {HARDENING_STEPS.filter((step) => step.group === group).map((step) => (
                    <article key={step.id} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {step.title}
                            {step.severity === "critical" ? (
                              <span className="ml-2 rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-xs text-[var(--danger)]">
                                critical
                              </span>
                            ) : null}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                            {step.how}
                          </p>
                        </div>
                        <span className="rounded-full bg-[var(--muted)] px-2 py-1 text-xs font-semibold text-[var(--primary)]">
                          {step.minutes} min
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <label className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] px-3 text-xs font-semibold">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-[var(--primary)]"
                            checked={completed.includes(step.id)}
                            onChange={() => toggleCompleted(step.id)}
                          />
                          Done
                        </label>
                        <label className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] px-3 text-xs font-semibold">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-[var(--primary)]"
                            checked={notApplicable.includes(step.id)}
                            onChange={() => toggleSkipped(step.id)}
                          />
                          Not applicable
                        </label>
                      </div>
                    </article>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </div>

        <aside className={`${CARD} self-start`} data-testid="tool-output">
          {hasError ? (
            <p role="alert" className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
              {result.error}
            </p>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={LABEL_CLASS}>Hardening score</p>
                  <p className={`mt-2 text-5xl font-bold ${BAND_TEXT[result.band] || "text-[var(--primary)]"}`}>
                    {result.score}
                    <span className="text-lg text-[var(--muted-foreground)]">/100</span>
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
                    {result.bandLabel}
                  </p>
                </div>
                <ShieldCheck className="h-10 w-10 text-[var(--primary)]" aria-hidden="true" />
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-[var(--muted)]">
                <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${result.score}%` }} />
              </div>
              <div className="mt-5 grid gap-3 text-sm text-[var(--muted-foreground)]">
                <p>
                  {result.doneCount} done · {result.openCount} open · {result.skippedCount} marked
                  not applicable.
                </p>
                <p>
                  Critical open: <strong className="text-[var(--foreground)]">{result.openCritical}</strong>.
                  Estimated remaining time:{" "}
                  <strong className="text-[var(--foreground)]">{result.openMinutes} min</strong>.
                </p>
                {result.openSteps.slice(0, 4).map((step) => (
                  <div key={step.id} className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
                    <p className="font-semibold text-[var(--foreground)]">{step.title}</p>
                    <p className="mt-1 text-xs leading-5">{step.why}</p>
                  </div>
                ))}
              </div>
              <button type="button" className={`${PRIMARY_BTN} mt-5 w-full`} onClick={copySummary}>
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied" : "Copy summary"}
              </button>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
