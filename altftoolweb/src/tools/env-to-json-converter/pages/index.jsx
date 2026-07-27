"use client";

import { useMemo, useState } from "react";
import { Braces, Check, Copy, RotateCcw } from "lucide-react";

import { envToJson, jsonToEnv } from "../lib";

const TEXTAREA_CLASS =
  "min-h-48 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CHECK_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ENV = `NODE_ENV=production
PORT=3000
DEBUG=false
DB__HOST=db.internal
DB__PORT=5432
VERSION="1.10"`;

const DEFAULT_JSON = `{
  "db": { "host": "db.internal", "port": 5432 },
  "debug": false,
  "tag": "42"
}`;

const DASH = "—";

export default function ToolHome() {
  const [direction, setDirection] = useState("env-to-json");
  const [envSource, setEnvSource] = useState(DEFAULT_ENV);
  const [jsonSource, setJsonSource] = useState(DEFAULT_JSON);
  const [coerceTypes, setCoerceTypes] = useState(true);
  const [nested, setNested] = useState(true);
  const [delimiter, setDelimiter] = useState("__");
  const [copied, setCopied] = useState(false);

  const toJson = direction === "env-to-json";

  const result = useMemo(
    () =>
      toJson
        ? envToJson(envSource, { coerceTypes, nested, delimiter })
        : jsonToEnv(jsonSource, { delimiter }),
    [toJson, envSource, jsonSource, coerceTypes, nested, delimiter],
  );
  const hasError = Boolean(result.error);
  const outputText = hasError ? "" : toJson ? result.json : result.output;

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setDirection("env-to-json");
    setEnvSource(DEFAULT_ENV);
    setJsonSource(DEFAULT_JSON);
    setCoerceTypes(true);
    setNested(true);
    setDelimiter("__");
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Entries converted", DASH],
        ["Direction", DASH],
        ["Delimiter", DASH],
      ]
    : [
        ["Entries converted", result.count],
        ["Direction", toJson ? ".env → JSON" : "JSON → .env"],
        ["Delimiter", delimiter || "(none)"],
      ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Braces className="h-4 w-4" aria-hidden="true" />
          Environment config
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Env to JSON Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert dotenv files to JSON — or back — with optional type coercion (true, 42, null)
          and double-underscore nesting (DB__HOST → db.host), the convention used by ASP.NET Core
          configuration and nconf. Quoted values like &quot;42&quot; always stay strings.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ej-direction">
              Direction
            </label>
            <select
              id="ej-direction"
              className={`mt-2 ${INPUT_CLASS}`}
              value={direction}
              onChange={(event) => setDirection(event.target.value)}
            >
              <option value="env-to-json">.env → JSON</option>
              <option value="json-to-env">JSON → .env</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ej-delim">
              Nesting delimiter
            </label>
            <input
              id="ej-delim"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={delimiter}
              onChange={(event) => setDelimiter(event.target.value)}
            />
          </div>
          {toJson ? (
            <>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="ej-coerce">
                <input
                  id="ej-coerce"
                  type="checkbox"
                  className={CHECK_CLASS}
                  checked={coerceTypes}
                  onChange={(event) => setCoerceTypes(event.target.checked)}
                />
                Coerce types (true/false, numbers, null)
              </label>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="ej-nested">
                <input
                  id="ej-nested"
                  type="checkbox"
                  className={CHECK_CLASS}
                  checked={nested}
                  onChange={(event) => setNested(event.target.checked)}
                />
                Nest keys on the delimiter (DB__HOST → DB.HOST)
              </label>
            </>
          ) : null}
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="ej-src">
            {toJson ? ".env contents" : "JSON object"}
          </label>
          <textarea
            id="ej-src"
            className={`mt-2 ${TEXTAREA_CLASS}`}
            spellCheck={false}
            value={toJson ? envSource : jsonSource}
            onChange={(event) =>
              toJson ? setEnvSource(event.target.value) : setJsonSource(event.target.value)
            }
          />
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
              {toJson ? "JSON output" : ".env output"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.count} entries`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the converted output"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              aria-label="Reset inputs and options to the example"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
          <pre className="font-mono text-sm leading-6 text-[var(--foreground)]">
            {hasError ? DASH : outputText}
          </pre>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Conversion happens entirely in your browser. Remember that real environment variables are
        always strings at runtime — coerced types exist only in the JSON representation.
      </p>
    </main>
  );
}
