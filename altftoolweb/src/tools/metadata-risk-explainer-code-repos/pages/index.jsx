"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GitBranch, RotateCcw } from "lucide-react";

import { MANUAL_CHECKS, ROUTINE_WINDOW_HOURS, analyseRepoExposure } from "../lib";

const SAMPLE_LOG = `2026-07-27T09:14:03+05:30 alice.rao@northwind.io feat: add billing guard
2026-07-27T11:02:11+05:30 alice.rao@northwind.io fix: rounding on refunds
2026-07-27T18:45:20+05:30 alice.rao@northwind.io test: cover edge case
2026-07-28T09:52:40+05:30 alice.rao@northwind.io chore: bump dependencies
2026-07-28T23:40:55+05:30 alice.rao@northwind.io refactor: split invoice module
2026-07-25T14:22:00+05:30 alice.rao@northwind.io docs: update readme
2026-07-26T02:10:00+05:30 alice.rao@northwind.io fix: retry backoff`;

const TEXTAREA_CLASS =
  "min-h-40 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const pad = (value) => String(value).padStart(2, "0");
const percent = (value) => `${Math.round(value * 100)}%`;

export default function ToolHome() {
  const [logText, setLogText] = useState(SAMPLE_LOG);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => analyseRepoExposure({ logText }), [logText]);
  const hasError = Boolean(result.error);
  const peakHour = hasError ? 0 : Math.max(...result.hourCounts, 1);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Repository metadata exposure",
      `Commits analysed: ${result.commitCount} (${result.firstDate} to ${result.lastDate})`,
      `Exposure score: ${result.score}/100 (${result.band.label})`,
      `Identity ${result.identityPoints}/30 · Location ${result.locationPoints}/20 · Routine ${result.routinePoints}/30 · Off-hours ${result.offHoursPoints}/20`,
      `UTC offsets seen: ${result.distinctOffsets.join(", ") || "none"}`,
      `Busiest ${ROUTINE_WINDOW_HOURS}-hour window: ${pad(result.windowStartHour)}:00-${pad(result.windowEndHour)}:00 local, holding ${percent(result.concentrationShare)} of commits`,
      `Weekend commits: ${percent(result.weekendShare)} · Between 00:00 and 05:59: ${percent(result.lateNightShare)}`,
    ].join("\n");
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
    setLogText(SAMPLE_LOG);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GitBranch className="h-4 w-4" aria-hidden="true" />
          Metadata literacy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Code Repository Metadata Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every commit publishes an author email and a timestamp with your UTC offset. Paste a log
          and see the identity, location and daily routine a stranger can read off it. Nothing is
          uploaded — the parsing runs in your browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className="block text-sm font-semibold" htmlFor="repo-log">
          Paste git log output
        </label>
        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
          Generate it with{" "}
          <code className="rounded bg-[var(--muted)] px-1 py-0.5 font-mono">
            git log --date=iso-strict --pretty=&quot;%aI %ae %s&quot;
          </code>
          . Plain <code className="rounded bg-[var(--muted)] px-1 py-0.5 font-mono">git log</code>{" "}
          output works too.
        </p>
        <textarea
          id="repo-log"
          className={`mt-3 ${TEXTAREA_CLASS}`}
          value={logText}
          spellCheck={false}
          onChange={(event) => {
            setLogText(event.target.value);
            setCopied(false);
          }}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyResult}
            aria-label="Copy repository exposure summary"
            className={GHOST_BTN}
            disabled={hasError}
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
            aria-label="Reset to the sample log"
            className={PRIMARY_BTN}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
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
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Exposure score
        </p>
        <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
          {hasError ? "—" : `${result.score}/100`}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError ? "—" : `${result.band.label} · ${result.band.advice}`}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Commits analysed",
              hasError
                ? "—"
                : `${result.commitCount} (${result.firstDate} to ${result.lastDate})`,
            ],
            ["Identity", hasError ? "—" : `${result.identityPoints} of 30 points`],
            ["Location", hasError ? "—" : `${result.locationPoints} of 20 points`],
            ["Routine predictability", hasError ? "—" : `${result.routinePoints} of 30 points`],
            ["Off-hours pattern", hasError ? "—" : `${result.offHoursPoints} of 20 points`],
            [
              "UTC offsets seen",
              hasError ? "—" : result.distinctOffsets.join(", ") || "none",
            ],
            [
              `Busiest ${ROUTINE_WINDOW_HOURS}-hour window`,
              hasError
                ? "—"
                : `${pad(result.windowStartHour)}:00-${pad(result.windowEndHour)}:00 (${percent(result.concentrationShare)} of commits)`,
            ],
            ["Weekend commits", hasError ? "—" : percent(result.weekendShare)],
            ["Commits 00:00-05:59", hasError ? "—" : percent(result.lateNightShare)],
            ["Lines skipped", hasError ? "—" : String(result.skippedLines)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Commits by local hour</h2>
          <div className="mt-4 overflow-x-auto">
            <div className="flex min-w-[320px] items-end gap-1" role="img" aria-label={`Busiest local hour is ${pad(result.busiestHour)}:00`}>
              {result.hourCounts.map((count, hour) => (
                <div key={hour} className="flex flex-1 flex-col items-center gap-1">
                  <span
                    className="w-full rounded-t bg-[var(--primary)]"
                    style={{ height: `${8 + (count / peakHour) * 72}px`, opacity: count ? 1 : 0.15 }}
                  />
                  {hour % 3 === 0 ? (
                    <span className="text-[10px] text-[var(--muted-foreground)]">{pad(hour)}</span>
                  ) : (
                    <span className="text-[10px] text-transparent">.</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Busiest hour: {pad(result.busiestHour)}:00 local. Anyone reading the public history sees
            this same shape, which is why a consistent pattern is enough to infer when you are at a
            keyboard and when you are asleep.
          </p>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What the log gives away</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6">
            {result.identityReasons.map((reason) => (
              <li key={reason} className="text-[var(--foreground)]">
                {reason}
              </li>
            ))}
            <li>{result.locationReason}</li>
            {result.offHoursReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
            {result.emails.length > 0 && (
              <li className="text-[var(--muted-foreground)]">
                Addresses found: {result.emails.map((entry) => entry.email).join(", ")}
              </li>
            )}
          </ul>
          <h3 className="mt-5 text-sm font-semibold">Fixes</h3>
          <ul className="mt-2 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
            <li>
              Set a per-repository commit address:{" "}
              <code className="rounded bg-[var(--muted)] px-1 py-0.5 font-mono text-xs">
                git config user.email &quot;ID+handle@users.noreply.github.com&quot;
              </code>{" "}
              and enable the hosting platform&apos;s setting that blocks pushes exposing your real
              address.
            </li>
            <li>
              Rewriting history changes the commit hashes, so coordinate with everyone who has a
              clone before you rewrite a shared branch.
            </li>
            <li>
              Timestamps and offsets cannot be hidden without rewriting history — the practical fix
              is to be deliberate about which work you publish under which identity.
            </li>
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Also check by hand</h2>
        <dl className="mt-3 grid gap-3 text-sm leading-6">
          {MANUAL_CHECKS.map(([title, detail]) => (
            <div key={title}>
              <dt className="font-semibold">{title}</dt>
              <dd className="text-[var(--muted-foreground)]">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational analysis of text you paste, run entirely in your browser. The scoring is a
        disclosure rubric, not a statistical model, and a short log is a small sample — treat the
        result as a prompt to look, not a verdict.
      </p>
    </main>
  );
}
