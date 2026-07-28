"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Heart, RotateCcw } from "lucide-react";

import { PERMISSIONS, auditDatingPermissions, resultToText } from "../lib";

const DEFAULT_GRANTED = ["precise-location", "photos-all", "camera", "contacts", "notifications", "ad-id", "profile-discovery"];
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary)]/25";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const BAND_TEXT = {
  minimal: "text-[var(--success)]",
  low: "text-[var(--primary)]",
  moderate: "text-[var(--warning)]",
  high: "text-[var(--danger)]",
  severe: "text-[var(--danger)]",
};

export default function ToolHome() {
  const [appName, setAppName] = useState("My dating app");
  const [granted, setGranted] = useState(DEFAULT_GRANTED);
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => auditDatingPermissions(granted), [granted]);
  const summary = useMemo(() => resultToText(result, appName), [result, appName]);

  const toggle = (id) => {
    setGranted((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setCopied(false);
  };

  const reset = () => {
    setAppName("My dating app");
    setGranted(DEFAULT_GRANTED);
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
          <Heart className="h-4 w-4" aria-hidden="true" />
          Dating app privacy
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Dating App Permission Audit
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
          Review the risky permissions and profile settings that matter most in dating apps:
          precise location, background location, all-photos access, contacts, microphone,
          tracking and broad discovery.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className={CARD}>
          <label>
            <span className={LABEL_CLASS}>App name</span>
            <input className={`${INPUT_CLASS} mt-2`} value={appName} onChange={(event) => setAppName(event.target.value)} />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={BTN} onClick={() => setGranted(DEFAULT_GRANTED)}>
              Typical dating app
            </button>
            <button type="button" className={BTN} onClick={() => setGranted(PERMISSIONS.map((permission) => permission.id))}>
              Everything granted
            </button>
            <button type="button" className={BTN} onClick={() => setGranted([])}>
              Clear all
            </button>
            <button type="button" className={BTN} onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold text-[var(--foreground)]">
              Granted permissions and profile settings
            </legend>
            <div className="mt-3 grid gap-3">
              {PERMISSIONS.map((permission) => (
                <label key={permission.id} className="flex cursor-pointer gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]">
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--primary)]" checked={granted.includes(permission.id)} onChange={() => toggle(permission.id)} />
                  <span>
                    <span className="block text-sm font-semibold text-[var(--foreground)]">
                      {permission.label}
                      <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--primary)]">
                        {permission.need}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                      {permission.reason}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <aside className={`${CARD} self-start`} data-testid="tool-output">
          {result.error ? (
            <p role="alert" className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
              {result.error}
            </p>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Privacy score
              </p>
              <p className={`mt-2 text-5xl font-bold ${BAND_TEXT[result.band.id] || "text-[var(--primary)]"}`}>
                {result.score}
                <span className="text-lg text-[var(--muted-foreground)]">/100</span>
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{result.band.label}</p>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-[var(--muted)]">
                <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${result.score}%` }} />
              </div>
              <div className="mt-5 grid gap-3 text-sm">
                {result.topRisks.map((permission) => (
                  <div key={permission.id} className="rounded-lg bg-[var(--background)] p-3 text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
                    <p className="font-semibold text-[var(--foreground)]">{permission.label}</p>
                    <p className="mt-1 text-xs leading-5">{permission.fix}</p>
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
