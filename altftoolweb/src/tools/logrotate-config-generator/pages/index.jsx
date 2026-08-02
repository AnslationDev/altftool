"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileClock, RotateCcw } from "lucide-react";

import { FREQUENCIES, RETENTION_HINTS, buildLogrotateConfig } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CHECK_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  logPath: "/var/log/myapp/*.log",
  frequency: "daily",
  rotateCount: "14",
  compress: true,
  delaycompress: true,
  missingok: true,
  notifempty: true,
  dateext: true,
  copytruncate: false,
  useCreate: true,
  createMode: "0640",
  createUser: "root",
  createGroup: "adm",
  sizeType: "none",
  sizeValue: "100M",
  olddir: "",
  postrotate: "systemctl reload myapp",
  sharedscripts: true,
};

const DASH = "—";

const TOGGLES = [
  ["compress", "compress — gzip rotated logs"],
  ["delaycompress", "delaycompress — keep newest rotation uncompressed"],
  ["missingok", "missingok — no error when the log is absent"],
  ["notifempty", "notifempty — skip empty logs"],
  ["dateext", "dateext — date-stamped names instead of .1 .2"],
  ["copytruncate", "copytruncate — copy then truncate in place"],
  ["useCreate", "create — recreate the log after rotation"],
  ["sharedscripts", "sharedscripts — run postrotate once per pattern"],
];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setForm((prev) => ({
      ...prev,
      [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value,
    }));

  const result = useMemo(
    () => buildLogrotateConfig({ ...form, rotateCount: Number(form.rotateCount) }),
    [form],
  );
  const hasError = Boolean(result.error);
  const retentionHint = RETENTION_HINTS.find((hint) => hint.frequency === form.frequency);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.config);
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
          <FileClock className="h-4 w-4" aria-hidden="true" />
          Linux admin
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Logrotate Config Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a /etc/logrotate.d/ rule with frequency, retention, compression, create modes and a
          postrotate hook — directives follow logrotate(8), with warnings for conflicting choices.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lr-path">
              Log path or glob
            </label>
            <input
              id="lr-path"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={form.logPath}
              onChange={set("logPath")}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lr-freq">
              Rotation frequency
            </label>
            <select id="lr-freq" className={`mt-2 ${INPUT_CLASS}`} value={form.frequency} onChange={set("frequency")}>
              {FREQUENCIES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lr-rotate">
              Rotations to keep (rotate N)
            </label>
            <input
              id="lr-rotate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.rotateCount}
              onChange={set("rotateCount")}
            />
            {retentionHint ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Typical: {retentionHint.label}</p>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lr-sizetype">
              Size trigger
            </label>
            <select id="lr-sizetype" className={`mt-2 ${INPUT_CLASS}`} value={form.sizeType} onChange={set("sizeType")}>
              <option value="none">none</option>
              <option value="maxsize">maxsize — size OR schedule, whichever first</option>
              <option value="size">size — size only, ignores schedule</option>
              <option value="minsize">minsize — schedule, but only above this size</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lr-sizeval">
              Size value (k / M / G)
            </label>
            <input
              id="lr-sizeval"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={form.sizeValue}
              onChange={set("sizeValue")}
              disabled={form.sizeType === "none"}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lr-mode">
              create mode
            </label>
            <input
              id="lr-mode"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={form.createMode}
              onChange={set("createMode")}
              disabled={!form.useCreate || form.copytruncate}
              maxLength={4}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="lr-user">
                create user
              </label>
              <input
                id="lr-user"
                className={`mt-2 ${INPUT_CLASS} font-mono`}
                type="text"
                value={form.createUser}
                onChange={set("createUser")}
                disabled={!form.useCreate || form.copytruncate}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="lr-group">
                create group
              </label>
              <input
                id="lr-group"
                className={`mt-2 ${INPUT_CLASS} font-mono`}
                type="text"
                value={form.createGroup}
                onChange={set("createGroup")}
                disabled={!form.useCreate || form.copytruncate}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lr-post">
              postrotate command(s) — one per line, blank for none
            </label>
            <textarea
              id="lr-post"
              className="mt-2 min-h-[5.5rem] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={form.postrotate}
              onChange={set("postrotate")}
              spellCheck={false}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Directives</legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {TOGGLES.map(([key, label]) => (
              <label key={key} htmlFor={`lr-${key}`} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                <input
                  id={`lr-${key}`}
                  type="checkbox"
                  className={CHECK_CLASS}
                  checked={form[key]}
                  onChange={set(key)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger-text)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Generated rule
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.directiveCount} directives`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the logrotate config"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy config"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-[320px] p-4 text-xs leading-5">
            <code>{hasError ? "# Fix the input above to generate the rule." : result.config}</code>
          </pre>
        </div>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Install</dt>
            <dd className="text-right font-mono text-xs font-semibold">{hasError ? DASH : result.installHint}</dd>
          </div>
        </dl>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--danger-text)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span aria-hidden="true">•</span>
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Test any new rule with <code>logrotate -d</code> (dry run) before relying on it — a syntax
        error in one file can stop the whole logrotate run.
      </p>
    </main>
  );
}
