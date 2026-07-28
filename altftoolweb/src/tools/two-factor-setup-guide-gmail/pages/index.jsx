"use client";

import { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  KeyRound,
  Mail,
  RotateCcw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import {
  BACKUP_CODE_COUNT,
  BACKUP_CODE_LENGTH,
  METHOD_COMPARISON,
  PHASES,
  SURFACES,
  computeProgress,
  filterSteps,
} from "../lib";

const PHASE_OPTIONS = [{ id: "all", label: "All stages" }, ...PHASES];

const CARD = "rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm";
const INPUT =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function percentLabel(value) {
  return `${Math.round(Number.isFinite(value) ? value : 0)}%`;
}

export default function ToolHome() {
  const [surface, setSurface] = useState("web");
  const [phase, setPhase] = useState("all");
  const [done, setDone] = useState([]);
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => filterSteps({ surface, phase }), [phase, surface]);
  const progress = useMemo(() => computeProgress({ completed: done, surface }), [done, surface]);
  const doneSet = useMemo(() => new Set(done), [done]);
  const selectedSurface = SURFACES.find((entry) => entry.id === surface) || SURFACES[0];
  const score = progress.error ? 0 : Math.round(progress.percent);

  const toggle = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

  const reset = () => {
    setSurface("web");
    setPhase("all");
    setDone([]);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (progress.error) return "";
    const lines = [
      "Gmail / Google 2FA Setup Guide",
      `Device path: ${selectedSurface.label}`,
      `Score: ${percentLabel(progress.percent)} — ${progress.level}`,
      `Completed: ${progress.done} of ${progress.total}`,
      `Critical done: ${progress.criticalDone} of ${progress.criticalTotal}`,
      progress.nextStep ? `Next: ${progress.nextStep.title}` : "Next: all applicable steps are done",
    ];
    return lines.join("\n");
  }, [progress, selectedSurface.label]);

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
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className={CARD}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
              <Mail className="h-4 w-4" aria-hidden="true" />
              Google account security
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Gmail 2FA Setup Guide
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
              Turn on Google 2-Step Verification, add passkeys or security keys, remove weak SMS
              fallback, and save recovery codes. This checklist runs only in your browser and never
              connects to your Google account.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 lg:max-w-sm">
            <p className="font-bold">Safety note</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              Use this as a checklist while you work inside your own Google Account settings. Never
              paste passwords, backup codes, or authenticator secrets here.
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
              <p className="mt-2 text-5xl font-black text-[var(--primary)]">{score}%</p>
              <p className="mt-1 text-sm font-bold">{progress.error ? "Check setup" : progress.level}</p>
            </div>
            <ShieldCheck className="h-10 w-10 text-[var(--primary)]" aria-hidden="true" />
          </div>

          <div
            className="mt-5 h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`Gmail 2FA hardening score ${score} percent`}
          >
            <span className="block h-full bg-[var(--primary)]" style={{ width: `${score}%` }} />
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-[var(--muted)] p-3">
              <dt className="text-[var(--muted-foreground)]">Done</dt>
              <dd className="mt-1 text-xl font-bold">
                {progress.error ? "—" : `${progress.done}/${progress.total}`}
              </dd>
            </div>
            <div className="rounded-lg bg-[var(--muted)] p-3">
              <dt className="text-[var(--muted-foreground)]">Critical</dt>
              <dd className="mt-1 text-xl font-bold">
                {progress.error ? "—" : `${progress.criticalDone}/${progress.criticalTotal}`}
              </dd>
            </div>
          </dl>

          {progress.nextStep ? (
            <div className="mt-4 rounded-lg border border-[var(--primary)] bg-[var(--primary-soft)] p-3 text-sm">
              <p className="font-bold text-[var(--primary)]">Do next</p>
              <p className="mt-1 text-[var(--foreground)]">{progress.nextStep.title}</p>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className={GHOST_BTN} onClick={copySummary}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied" : "Copy summary"}
            </button>
            <button type="button" className={PRIMARY_BTN} onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className={CARD}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Device path</span>
              <select className={INPUT} value={surface} onChange={(event) => setSurface(event.target.value)}>
                {SURFACES.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Stage</span>
              <select className={INPUT} value={phase} onChange={(event) => setPhase(event.target.value)}>
                {PHASE_OPTIONS.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 rounded-lg bg-[var(--muted)] p-3 text-sm text-[var(--muted-foreground)]">
            <Smartphone className="mr-2 inline h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            {selectedSurface.note}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--border)] p-3">
              <p className="text-sm font-bold">Backup codes</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Google gives {BACKUP_CODE_COUNT} one-time codes, each {BACKUP_CODE_LENGTH} digits.
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border)] p-3">
              <p className="text-sm font-bold">Best upgrade</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Passkeys or hardware keys are phishing-resistant because they bind to google.com.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={CARD}>
        <div className="mb-4 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          <h2 className="text-xl font-bold">Checklist</h2>
        </div>
        {filtered.error ? (
          <p role="alert" className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {filtered.error}
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.items.map((step) => {
              const checked = doneSet.has(step.id);
              return (
                <label
                  key={step.id}
                  className="flex cursor-pointer gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 transition hover:border-[var(--primary)]"
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                    checked={checked}
                    onChange={() => toggle(step.id)}
                  />
                  <span>
                    <span className="flex flex-wrap items-center gap-2 font-bold">
                      {step.title}
                      <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
                        {step.weight}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                      {step.detail}
                    </span>
                    <span className="mt-2 block text-xs font-semibold text-[var(--primary)]">
                      {step.where}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </section>

      <section className={CARD}>
        <h2 className="text-xl font-bold">Second-factor comparison</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <tr>
                <th className="py-3 pr-4">Method</th>
                <th className="py-3 pr-4">Strength</th>
                <th className="py-3 pr-4">Phishing-resistant</th>
                <th className="py-3">Why it matters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {METHOD_COMPARISON.map((row) => (
                <tr key={row.method}>
                  <td className="py-3 pr-4 font-semibold">{row.method}</td>
                  <td className="py-3 pr-4">{row.strength}</td>
                  <td className="py-3 pr-4">
                    {row.phishingResistant ? (
                      <span className="inline-flex items-center gap-1 text-[var(--success)]">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Yes
                      </span>
                    ) : (
                      <span className="text-[var(--muted-foreground)]">No</span>
                    )}
                  </td>
                  <td className="py-3 text-[var(--muted-foreground)]">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
