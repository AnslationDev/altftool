"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Layers, RotateCcw } from "lucide-react";

import { OUTPUT_STYLES, convertEnvToCompose } from "../lib";

const TEXTAREA_CLASS =
  "min-h-48 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ENV = `NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://app:pw@db:5432/app
COUNTRY=NO
PRICE_SUFFIX=$0.99`;

const DASH = "—";

export default function ToolHome() {
  const [source, setSource] = useState(DEFAULT_ENV);
  const [style, setStyle] = useState("list");
  const [serviceName, setServiceName] = useState("app");
  const [envFileName, setEnvFileName] = useState(".env");
  const [escapeDollar, setEscapeDollar] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => convertEnvToCompose(source, { style, serviceName, envFileName, escapeDollar }),
    [source, style, serviceName, envFileName, escapeDollar],
  );
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Reset the pasted .env contents and all options back to the example? This cannot be undone.",
      )
    ) {
      return;
    }
    setSource(DEFAULT_ENV);
    setStyle("list");
    setServiceName("app");
    setEnvFileName(".env");
    setEscapeDollar(true);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Variables converted", DASH],
        ["Output style", DASH],
        ["Values with $ escaped", DASH],
      ]
    : [
        ["Variables converted", style === "env_file" ? "kept in the env file" : result.count],
        ["Output style", OUTPUT_STYLES.find((s) => s.id === style)?.label ?? style],
        ["Values with $ escaped", style === "env_file" ? "n/a" : result.escapedCount],
      ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Layers className="h-4 w-4" aria-hidden="true" />
          Docker Compose
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Env to Compose Environment Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn .env entries into a docker compose environment block — list or map form per the
          Compose Specification — with literal $ escaped as $$ and YAML-ambiguous values like NO,
          true and 3000 safely quoted. Or generate an env_file reference instead.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="compose-src">
          .env contents
        </label>
        <textarea
          id="compose-src"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          spellCheck={false}
          value={source}
          onChange={(event) => setSource(event.target.value)}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="compose-style">
              Output style
            </label>
            <select
              id="compose-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={style}
              onChange={(event) => setStyle(event.target.value)}
            >
              {OUTPUT_STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="compose-service">
              Service name
            </label>
            <input
              id="compose-service"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={serviceName}
              onChange={(event) => setServiceName(event.target.value)}
            />
          </div>
          {style === "env_file" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="compose-envfile">
                Env file path
              </label>
              <input
                id="compose-envfile"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={envFileName}
                onChange={(event) => setEnvFileName(event.target.value)}
              />
            </div>
          ) : (
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              htmlFor="compose-dollar"
            >
              <input
                id="compose-dollar"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={escapeDollar}
                onChange={(event) => setEscapeDollar(event.target.checked)}
              />
              Escape literal $ as $$ (keep compose from interpolating values)
            </label>
          )}
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
              Compose snippet
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : style === "env_file" ? "env_file" : `${result.count} vars`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the compose environment snippet"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy YAML"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset input and options to the example"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
          <pre className="font-mono text-sm leading-6 text-[var(--foreground)]">
            {hasError ? DASH : result.output}
          </pre>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="break-words text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Inlined environment values are visible to anyone who can read the compose file or run
        docker inspect — keep real secrets in an env_file outside version control or in a secrets
        manager.
      </p>
    </main>
  );
}
