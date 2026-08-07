"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mail, RotateCcw } from "lucide-react";

import { SCENARIOS, planMxRecords } from "../lib";

const INPUT_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  scenario: "primary-backup",
  primaryHosts: "mx1.mailhost.com\nmx2.mailhost.com",
  secondaryHosts: "backup-mx.example.net",
  ttl: "3600",
};

const DASH = "—";

function RecordTable({ records }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
            <th scope="col" className="py-2 pr-3 font-semibold">
              Name
            </th>
            <th scope="col" className="py-2 pr-3 font-semibold">
              TTL
            </th>
            <th scope="col" className="py-2 pr-3 font-semibold">
              Type
            </th>
            <th scope="col" className="py-2 pr-3 font-semibold">
              Preference
            </th>
            <th scope="col" className="py-2 font-semibold">
              Target
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.zoneLine} className="border-b border-[var(--border)] last:border-0">
              <td className="py-2 pr-3 font-mono text-xs">{r.name}</td>
              <td className="py-2 pr-3">{r.ttl}</td>
              <td className="py-2 pr-3">{r.type}</td>
              <td className="py-2 pr-3 font-semibold text-[var(--primary)]">{r.preference}</td>
              <td className="py-2 font-mono text-xs">{r.target}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ToolHome() {
  const [scenario, setScenario] = useState(DEFAULTS.scenario);
  const [primaryHosts, setPrimaryHosts] = useState(DEFAULTS.primaryHosts);
  const [secondaryHosts, setSecondaryHosts] = useState(DEFAULTS.secondaryHosts);
  const [ttl, setTtl] = useState(DEFAULTS.ttl);
  const [copied, setCopied] = useState(false);

  const isMigration = scenario === "migration";
  const isSingle = scenario === "single";

  const result = useMemo(
    () =>
      planMxRecords({
        scenario,
        primaryHosts,
        secondaryHosts,
        ttl: ttl.trim() === "" ? NaN : Number(ttl),
      }),
    [scenario, primaryHosts, secondaryHosts, ttl],
  );
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    if (result.phases) {
      return result.phases
        .map((p) => [p.title, ...p.records.map((r) => r.zoneLine)].join("\n"))
        .join("\n\n");
    }
    return result.records.map((r) => r.zoneLine).join("\n");
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
    setScenario(DEFAULTS.scenario);
    setPrimaryHosts(DEFAULTS.primaryHosts);
    setSecondaryHosts(DEFAULTS.secondaryHosts);
    setTtl(DEFAULTS.ttl);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Mail className="h-4 w-4" aria-hidden="true" />
          Mail routing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          MX Record Priority Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Senders try the lowest MX preference first (RFC 5321). Plan the preference tiers for a
          single provider, a primary-plus-backup setup, or a phased migration between providers.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mxp-scenario">
              Scenario
            </label>
            <select
              id="mxp-scenario"
              className={`mt-2 h-11 ${INPUT_CLASS}`}
              value={scenario}
              onChange={(event) => setScenario(event.target.value)}
            >
              {SCENARIOS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mxp-primary">
              {isMigration ? "New provider's mail servers" : "Primary mail servers"}
            </label>
            <textarea
              id="mxp-primary"
              rows={3}
              className={`mt-2 ${INPUT_CLASS}`}
              placeholder={"mx1.mailhost.com\nmx2.mailhost.com"}
              value={primaryHosts}
              onChange={(event) => setPrimaryHosts(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">One hostname per line.</p>
          </div>
          {!isSingle ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="mxp-secondary">
                {isMigration ? "Old provider's mail servers" : "Backup MX servers"}
              </label>
              <textarea
                id="mxp-secondary"
                rows={3}
                className={`mt-2 ${INPUT_CLASS}`}
                placeholder="backup-mx.example.net"
                value={secondaryHosts}
                onChange={(event) => setSecondaryHosts(event.target.value)}
              />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="mxp-ttl">
              TTL (seconds)
            </label>
            <input
              id="mxp-ttl"
              className={`mt-2 h-11 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="60"
              value={ttl}
              onChange={(event) => setTtl(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {isMigration ? "Cutover record set (Phase 2)" : "MX records to publish"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.records.length}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the plan." : "record(s) in the active set"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the MX record plan"
              aria-live="polite"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && !result.phases ? (
          <div className="mt-5">
            <RecordTable records={result.records} />
          </div>
        ) : null}

        {!hasError && result.phases ? (
          <div className="mt-5 space-y-6">
            {result.phases.map((phase) => (
              <div key={phase.id}>
                <h2 className="text-sm font-semibold">{phase.title}</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{phase.description}</p>
                <div className="mt-2">
                  <RecordTable records={phase.records} />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!hasError ? (
          <ul className="mt-5 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {note}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Preference values follow the operational convention of spacing tiers by 10. Your provider's
        documentation may prescribe exact hostnames and values — theirs win for their own service.
      </p>
    </main>
  );
}
