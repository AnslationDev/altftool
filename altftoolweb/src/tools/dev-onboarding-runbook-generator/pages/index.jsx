"use client";

import { useMemo, useState } from "react";
import { BookOpen, Check, Copy, RotateCcw } from "lucide-react";

import {
  ACCESS_ITEMS,
  OPERATING_SYSTEMS,
  STACK_PRESETS,
  formatDuration,
  generateRunbook,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ACCESS = ["sso", "chat", "repo", "ci", "cloud", "secrets", "tickets", "errors"];

const DEFAULTS = {
  teamName: "Payments Platform",
  role: "Backend Engineer",
  stack: "node",
  os: "macos",
  buddy: "Ananya R",
  repos: "git@github.com:acme/payments-api.git\ngit@github.com:acme/payments-worker.git",
  firstTask:
    "Fix the misleading 402 message on POST /v2/payments, add a test for it, and ship it to production with your buddy watching the dashboard.",
  includeDayTwo: true,
};

const toLines = (value) => value.split("\n").map((line) => line.trim()).filter(Boolean);

export default function ToolHome() {
  const [teamName, setTeamName] = useState(DEFAULTS.teamName);
  const [role, setRole] = useState(DEFAULTS.role);
  const [stack, setStack] = useState(DEFAULTS.stack);
  const [os, setOs] = useState(DEFAULTS.os);
  const [buddy, setBuddy] = useState(DEFAULTS.buddy);
  const [repos, setRepos] = useState(DEFAULTS.repos);
  const [firstTask, setFirstTask] = useState(DEFAULTS.firstTask);
  const [includeDayTwo, setIncludeDayTwo] = useState(DEFAULTS.includeDayTwo);
  const [accessKeys, setAccessKeys] = useState(DEFAULT_ACCESS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      generateRunbook({
        teamName,
        role,
        stack,
        os,
        buddy,
        repos: toLines(repos),
        accessKeys,
        firstTask,
        includeDayTwo,
      }),
    [teamName, role, stack, os, buddy, repos, accessKeys, firstTask, includeDayTwo],
  );

  const toggleAccess = (key) =>
    setAccessKeys((list) =>
      list.includes(key) ? list.filter((item) => item !== key) : [...list, key],
    );

  const copyResult = async () => {
    if (!result.markdown) return;
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTeamName(DEFAULTS.teamName);
    setRole(DEFAULTS.role);
    setStack(DEFAULTS.stack);
    setOs(DEFAULTS.os);
    setBuddy(DEFAULTS.buddy);
    setRepos(DEFAULTS.repos);
    setFirstTask(DEFAULTS.firstTask);
    setIncludeDayTwo(DEFAULTS.includeDayTwo);
    setAccessKeys(DEFAULT_ACCESS);
    setCopied(false);
  };

  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          Onboarding
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Dev Onboarding Runbook Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Produce the checklist a new engineer follows on day one: access requests with the team
          that grants them, the exact install commands for their machine, repo clones, and a first
          task small enough to merge.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ob-team">
              Team name
            </label>
            <input
              id="ob-team"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ob-role">
              Role
            </label>
            <input
              id="ob-role"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ob-stack">
              Primary stack
            </label>
            <select
              id="ob-stack"
              className={`mt-2 ${INPUT_CLASS}`}
              value={stack}
              onChange={(event) => setStack(event.target.value)}
            >
              {STACK_PRESETS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ob-os">
              Machine
            </label>
            <select
              id="ob-os"
              className={`mt-2 ${INPUT_CLASS}`}
              value={os}
              onChange={(event) => setOs(event.target.value)}
            >
              {OPERATING_SYSTEMS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ob-buddy">
              Onboarding buddy (optional)
            </label>
            <input
              id="ob-buddy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={buddy}
              onChange={(event) => setBuddy(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ob-repos">
              Repositories to clone (one per line)
            </label>
            <textarea
              id="ob-repos"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={3}
              spellCheck={false}
              value={repos}
              onChange={(event) => setRepos(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ob-task">
              First task (optional)
            </label>
            <textarea
              id="ob-task"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={3}
              value={firstTask}
              onChange={(event) => setFirstTask(event.target.value)}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="ob-day2"
        >
          <input
            id="ob-day2"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={includeDayTwo}
            onChange={(event) => setIncludeDayTwo(event.target.checked)}
          />
          Include a day-two and first-week section
        </label>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Access to request</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Each request is budgeted at 15 minutes of waiting, so raise them all before you start
          installing anything.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {ACCESS_ITEMS.map((item) => (
            <label
              key={item.key}
              htmlFor={`ob-access-${item.key}`}
              className="flex min-h-11 items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              <input
                id={`ob-access-${item.key}`}
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={accessKeys.includes(item.key)}
                onChange={() => toggleAccess(item.key)}
              />
              <span>
                {item.label}
                <span className="block text-xs text-[var(--muted-foreground)]">
                  Granted by {item.owner}
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated setup time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? dash : formatDuration(result.estimate.totalMinutes)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? dash
                : result.estimate.fitsInOneDay
                  ? "Fits inside one 8-hour working day"
                  : "Longer than a working day — plan it over day one and two"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the onboarding runbook markdown"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy runbook"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the onboarding inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Tool installs", result.error ? dash : `${result.toolCount} (${formatDuration(result.estimate.toolMinutes)})`],
            ["Access requests", result.error ? dash : `${result.accessCount} (${formatDuration(result.estimate.accessMinutes)})`],
            ["Repositories", result.error ? dash : `${result.repoCount} (${formatDuration(result.estimate.repoMinutes)})`],
            ["Stack", result.error ? dash : result.stackLabel],
            ["Machine", result.error ? dash : result.osLabel],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!result.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">ONBOARDING.md</h2>
          <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
            <pre className="min-w-0 font-mono text-xs leading-5 text-[var(--foreground)]">
              {result.markdown}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Install commands target current release lines and may drift — check them against your
        internal baseline image before handing the runbook to a new joiner, and keep production
        access read-only until their first on-call shadow.
      </p>
    </main>
  );
}
