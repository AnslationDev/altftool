"use client";

import { useMemo, useState } from "react";
import { Briefcase, Check, Copy, RotateCcw, ShieldAlert } from "lucide-react";
import { AREAS, CHECKLIST, GDPR_BREACH_NOTIFY_HOURS, MAX_CLIENTS, assessFreelancerKit } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_DONE = ["acc-mfa", "mn-account"];
const DEFAULT_ACTIVE = "6";
const DEFAULT_PAST = "14";

export default function ToolHome() {
  const [done, setDone] = useState(DEFAULT_DONE);
  const [activeClients, setActiveClients] = useState(DEFAULT_ACTIVE);
  const [pastClients, setPastClients] = useState(DEFAULT_PAST);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      assessFreelancerKit({
        doneIds: done,
        activeClients: activeClients.trim() === "" ? NaN : Number(activeClients),
        pastClients: pastClients.trim() === "" ? NaN : Number(pastClients),
      }),
    [done, activeClients, pastClients],
  );
  const ok = !result.error;

  const toggle = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Freelancer Privacy Starter Kit",
      `Separation score: ${Math.round(result.percent)}% (${result.band.label})`,
      `Controls done: ${result.completed} of ${result.total}`,
      `Client datasets held: ${result.totalDatasets} (${result.activeClients} active, ${result.pastClients} past)`,
      `Blast radius of one compromised login: ~${result.blastRadius} client datasets`,
      `Weakest area: ${result.weakestArea ? result.weakestArea.area : "n/a"}`,
      "",
      "Still open:",
      ...result.remaining.map((item) => `- ${item.title}${item.critical ? " (critical)" : ""}`),
    ].join("\n");
  }, [ok, result]);

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
    setDone(DEFAULT_DONE);
    setActiveClients(DEFAULT_ACTIVE);
    setPastClients(DEFAULT_PAST);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Briefcase className="h-4 w-4" aria-hidden="true" />
          Solo practice
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Freelancer Privacy Starter Kit
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Seventeen controls that keep your home address, your personal accounts and each client's
          data apart. Enter how many client datasets you hold and see how far a single compromised
          login would reach today.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-active">
              Active clients
            </label>
            <input
              id="fl-active"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_CLIENTS}
              step="1"
              value={activeClients}
              onChange={(event) => {
                setActiveClients(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-past">
              Past clients whose files you still hold
            </label>
            <input
              id="fl-past"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_CLIENTS}
              step="1"
              value={pastClients}
              onChange={(event) => {
                setPastClients(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Count folders, drives and mailboxes you could still open today, including archives you
          keep &quot;just in case&quot;.
        </p>
      </section>

      {!ok && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Separation score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${Math.round(result.percent)}%` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.band.label} — ${result.band.note}`
                : "Fix the client counts above to see the score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the separation score and open controls"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok && (
          <div className="mt-4">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Separation score ${Math.round(result.percent)} percent`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.percent))}%` }}
              />
            </div>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Controls completed", ok ? `${result.completed} of ${result.total}` : DASH],
            ["Client datasets held", ok ? NUM.format(result.totalDatasets) : DASH],
            [
              "Blast radius of one compromised login",
              ok ? `about ${NUM.format(result.blastRadius)} client datasets` : DASH,
            ],
            [
              "Held past the active relationship",
              ok ? `${NUM.format(result.pastClients)} (${Math.round(result.staleShare)}%)` : DASH,
            ],
            ["Critical controls still open", ok ? `${result.openCritical.length}` : DASH],
            ["Weakest area", ok && result.weakestArea ? result.weakestArea.area : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.nextStep && (
          <p className="mt-4 rounded-md border border-[var(--border)] px-3 py-2 text-sm">
            <span className="font-semibold">Do next: </span>
            {result.nextStep.title}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The full kit</h2>
        {AREAS.map((area) => {
          const areaStat = ok ? result.areaBreakdown.find((entry) => entry.area === area) : null;
          return (
            <div key={area} className="mt-5 first:mt-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {area}
                </h3>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {areaStat ? `${areaStat.done}/${areaStat.total} done` : DASH}
                </span>
              </div>
              <ul className="mt-2 space-y-2">
                {CHECKLIST.filter((item) => item.area === area).map((item) => {
                  const checked = done.includes(item.id);
                  return (
                    <li key={item.id} className="rounded-lg border border-[var(--border)] p-3">
                      <div className="flex items-start gap-3">
                        <input
                          id={`fl-${item.id}`}
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(item.id)}
                          className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                        />
                        <div className="min-w-0">
                          <label
                            htmlFor={`fl-${item.id}`}
                            className="block cursor-pointer text-sm font-semibold"
                          >
                            {item.title}
                          </label>
                          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{item.action}</p>
                          <p className="mt-1 text-xs text-[var(--muted-foreground)]">Why: {item.why}</p>
                          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                            {item.weight} separation point{item.weight === 1 ? "" : "s"}
                            {item.critical ? " · critical" : ""}
                          </p>
                          {item.critical && !checked && (
                            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--danger)]">
                              <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                              Open critical
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guidance, not legal advice. Where you handle personal data for a client under
        the GDPR you are usually a processor and the client is the controller, whose notification
        clock is {GDPR_BREACH_NOTIFY_HOURS} hours to the supervisory authority; your own contractual
        deadline is normally shorter. Check your obligations with a qualified adviser for the
        jurisdictions you and your clients operate in.
      </p>
    </main>
  );
}
