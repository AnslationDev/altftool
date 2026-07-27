"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Copy, RotateCcw } from "lucide-react";

import { PRESETS, SPECIALS, buildCronLine, nextRuns } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CHECK_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  expression: "30 2 * * *",
  command: "/usr/local/bin/backup.sh",
  workingDir: "",
  logFile: "/var/log/backup.log",
  redirectStderr: true,
  lockFile: "/tmp/backup.lock",
  mailTo: "",
  setShell: true,
  shellValue: "/bin/bash",
  setPath: true,
  pathValue: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
  timeoutSeconds: "",
};

const DASH = "—";

const RUN_FORMAT = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);
  // Captured once at mount; nextRuns takes it as an argument so lib stays pure.
  const [now] = useState(() => new Date());

  const set = (key) => (event) =>
    setForm((prev) => ({
      ...prev,
      [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value,
    }));

  const result = useMemo(() => buildCronLine(form), [form]);
  const hasError = Boolean(result.error);

  const upcoming = useMemo(
    () => (hasError ? [] : nextRuns(result.parsed, now, 5)),
    [hasError, result, now],
  );

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.block);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Clock className="h-4 w-4" aria-hidden="true" />
          Scheduling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Crontab Line Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a safe crontab entry: the schedule is validated and read back in plain English, the
          next runs are previewed, and the command is wrapped with logging and a flock guard.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cron-expr">
              Schedule (minute hour day month weekday, or @daily style)
            </label>
            <input
              id="cron-expr"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={form.expression}
              onChange={set("expression")}
              autoComplete="off"
              spellCheck={false}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.expression}
                  type="button"
                  title={preset.label}
                  onClick={() => setForm((prev) => ({ ...prev, expression: preset.expression }))}
                  className={CHIP_BTN}
                >
                  {preset.label}
                </button>
              ))}
              {SPECIALS.filter((s) => s.id !== "@yearly").map((special) => (
                <button
                  key={special.id}
                  type="button"
                  title={special.label}
                  onClick={() => setForm((prev) => ({ ...prev, expression: special.id }))}
                  className={CHIP_BTN}
                >
                  {special.id}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cron-cmd">
              Command to run
            </label>
            <input
              id="cron-cmd"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={form.command}
              onChange={set("command")}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cron-log">
              Log file (blank = cron mail)
            </label>
            <input
              id="cron-log"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={form.logFile}
              onChange={set("logFile")}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cron-lock">
              Lock file for flock (blank = no lock)
            </label>
            <input
              id="cron-lock"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={form.lockFile}
              onChange={set("lockFile")}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cron-dir">
              Working directory (optional)
            </label>
            <input
              id="cron-dir"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={form.workingDir}
              onChange={set("workingDir")}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cron-timeout">
              Timeout in seconds (optional)
            </label>
            <input
              id="cron-timeout"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.timeoutSeconds}
              onChange={set("timeoutSeconds")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cron-mailto">
              MAILTO (blank = leave unset)
            </label>
            <input
              id="cron-mailto"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={form.mailTo}
              onChange={set("mailTo")}
              placeholder="ops@example.com"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="flex flex-col justify-end gap-1">
            <label htmlFor="cron-stderr" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
              <input
                id="cron-stderr"
                type="checkbox"
                className={CHECK_CLASS}
                checked={form.redirectStderr}
                onChange={set("redirectStderr")}
              />
              Redirect stderr into the log (2&gt;&amp;1)
            </label>
            <label htmlFor="cron-setpath" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
              <input
                id="cron-setpath"
                type="checkbox"
                className={CHECK_CLASS}
                checked={form.setPath}
                onChange={set("setPath")}
              />
              Set a sane PATH in the crontab
            </label>
            <label htmlFor="cron-setshell" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
              <input
                id="cron-setshell"
                type="checkbox"
                className={CHECK_CLASS}
                checked={form.setShell}
                onChange={set("setShell")}
              />
              Set SHELL=/bin/bash
            </label>
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              In plain English
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.description || "Once each time the machine boots."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the crontab block"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy crontab block"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-[320px] p-4 text-xs leading-5">
            <code>{hasError ? "# Fix the input above to build the crontab entry." : result.block}</code>
          </pre>
        </div>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {(hasError ? [[`Next runs`, DASH]] : []).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
          {!hasError &&
            (upcoming.length > 0
              ? upcoming.map((run, index) => (
                  <div key={run.toISOString()} className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">
                      {index === 0 ? "Next run (your timezone)" : `Then`}
                    </dt>
                    <dd className="text-right font-mono font-semibold">{RUN_FORMAT.format(run)}</dd>
                  </div>
                ))
              : (
                  <div className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">Next runs</dt>
                    <dd className="text-right font-semibold">
                      {result.parsed?.special === "@reboot"
                        ? "At every system boot"
                        : "Never fires — check the day/month combination"}
                    </dd>
                  </div>
                ))}
        </dl>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--primary)]">
                  •
                </span>
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Install with <code>crontab -e</code>. Field syntax follows Vixie cron (man 5 crontab);
        remember that when both day-of-month and day-of-week are set, cron runs on either match.
      </p>
    </main>
  );
}
