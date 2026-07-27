"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ScrollText } from "lucide-react";

import {
  COMBINED_VARIABLES,
  ESCAPE_MODES,
  NGINX_LOG_VARIABLES,
  buildLogFormat,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DASH = "—";

const DEFAULTS = {
  formatName: "main_timed",
  style: "plain",
  escapeMode: "default",
  selected: [...COMBINED_VARIABLES, "$request_time", "$upstream_response_time"],
};

export default function ToolHome() {
  const [formatName, setFormatName] = useState(DEFAULTS.formatName);
  const [style, setStyle] = useState(DEFAULTS.style);
  const [escapeMode, setEscapeMode] = useState(DEFAULTS.escapeMode);
  const [selected, setSelected] = useState(DEFAULTS.selected);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildLogFormat({
        formatName,
        style,
        escapeMode: style === "json" ? "json" : escapeMode,
        variableNames: selected,
      }),
    [formatName, style, escapeMode, selected],
  );

  const hasError = Boolean(result.error);

  const toggle = (name) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    );
  };

  const loadCombined = () => {
    setSelected([...COMBINED_VARIABLES]);
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(`${result.directive}\n${result.accessLog}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setFormatName(DEFAULTS.formatName);
    setStyle(DEFAULTS.style);
    setEscapeMode(DEFAULTS.escapeMode);
    setSelected(DEFAULTS.selected);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ScrollText className="h-4 w-4" aria-hidden="true" />
          Web server configs
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Nginx Log Format Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick nginx variables in the order you want them logged and get the log_format
          directive, the access_log line and a realistic sample log entry — as a classic
          combined-style line or as JSON with escape=json.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-name">
              Format name
            </label>
            <input
              id="lf-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={formatName}
              onChange={(event) => setFormatName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-style">
              Output style
            </label>
            <select
              id="lf-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={style}
              onChange={(event) => setStyle(event.target.value)}
            >
              <option value="plain">Plain line (combined-style)</option>
              <option value="json">JSON object per line</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-escape">
              Escape mode
            </label>
            <select
              id="lf-escape"
              className={`mt-2 ${INPUT_CLASS}`}
              value={style === "json" ? "json" : escapeMode}
              disabled={style === "json"}
              onChange={(event) => setEscapeMode(event.target.value)}
            >
              {ESCAPE_MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
            {style === "json" ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                JSON output always uses escape=json so values stay valid JSON strings.
              </p>
            ) : null}
          </div>
          <div className="flex items-end">
            <button type="button" onClick={loadCombined} className={GHOST_BTN}>
              Load nginx&apos;s &quot;combined&quot; variable set
            </button>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">
            Variables (click order = column order)
          </legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {NGINX_LOG_VARIABLES.map((variable) => {
              const position = selected.indexOf(variable.name);
              return (
                <label
                  key={variable.name}
                  htmlFor={`lf-var-${variable.name.slice(1)}`}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-[var(--muted)]"
                >
                  <input
                    id={`lf-var-${variable.name.slice(1)}`}
                    type="checkbox"
                    className={CHECK_CLASS}
                    checked={position !== -1}
                    onChange={() => toggle(variable.name)}
                  />
                  <span className="min-w-0">
                    <span className="font-mono text-xs">{variable.name}</span>
                    {position !== -1 ? (
                      <span className="ml-1 rounded bg-[var(--muted)] px-1 text-xs font-semibold text-[var(--primary)]">
                        #{position + 1}
                      </span>
                    ) : null}
                    <span className="block truncate text-xs text-[var(--muted-foreground)]">
                      {variable.desc}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
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
              Variables in format
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.variableCount}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the log_format and access_log directives"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy directives"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the builder to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-4 space-y-4 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              log_format directive (http block)
            </dt>
            <dd className="mt-1 overflow-x-auto rounded-lg bg-[var(--muted)] p-3">
              <pre className="whitespace-pre text-xs leading-5">
                <code>{hasError ? DASH : result.directive}</code>
              </pre>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              access_log directive
            </dt>
            <dd className="mt-1 overflow-x-auto rounded-lg bg-[var(--muted)] p-3">
              <pre className="whitespace-pre text-xs leading-5">
                <code>{hasError ? DASH : result.accessLog}</code>
              </pre>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Sample log line
            </dt>
            <dd className="mt-1 overflow-x-auto rounded-lg bg-[var(--muted)] p-3">
              <pre className="whitespace-pre text-xs leading-5">
                <code>{hasError ? DASH : result.sampleLine}</code>
              </pre>
            </dd>
          </div>
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Declare log_format inside the http block before any access_log that references it.
        escape=json needs nginx 1.11.8+ and escape=none needs 1.13.10+. Sample IPs use
        documentation ranges from RFC 5737.
      </p>
    </main>
  );
}
