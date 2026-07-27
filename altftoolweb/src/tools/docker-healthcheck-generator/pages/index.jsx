"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HeartPulse, RotateCcw } from "lucide-react";

import {
  CHECK_TYPES,
  INTERVAL_DEFAULT,
  RETRIES_DEFAULT,
  START_INTERVAL_DEFAULT,
  buildHealthcheck,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

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
  checkType: "curl",
  port: "8080",
  path: "/health",
  customCommand: "",
  interval: String(INTERVAL_DEFAULT),
  timeout: "5",
  retries: String(RETRIES_DEFAULT),
  startPeriod: "10",
  useStartInterval: false,
  startInterval: String(START_INTERVAL_DEFAULT),
};

export default function ToolHome() {
  const [checkType, setCheckType] = useState(DEFAULTS.checkType);
  const [port, setPort] = useState(DEFAULTS.port);
  const [path, setPath] = useState(DEFAULTS.path);
  const [customCommand, setCustomCommand] = useState(DEFAULTS.customCommand);
  const [interval, setInterval] = useState(DEFAULTS.interval);
  const [timeout, setTimeout_] = useState(DEFAULTS.timeout);
  const [retries, setRetries] = useState(DEFAULTS.retries);
  const [startPeriod, setStartPeriod] = useState(DEFAULTS.startPeriod);
  const [useStartInterval, setUseStartInterval] = useState(DEFAULTS.useStartInterval);
  const [startInterval, setStartInterval] = useState(DEFAULTS.startInterval);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildHealthcheck({
        checkType,
        port: port.trim() === "" ? Number.NaN : Number(port),
        path,
        customCommand,
        intervalSeconds: interval.trim() === "" ? Number.NaN : Number(interval),
        timeoutSeconds: timeout.trim() === "" ? Number.NaN : Number(timeout),
        retries: retries.trim() === "" ? Number.NaN : Number(retries),
        startPeriodSeconds: startPeriod.trim() === "" ? Number.NaN : Number(startPeriod),
        useStartInterval,
        startIntervalSeconds: startInterval.trim() === "" ? Number.NaN : Number(startInterval),
      }),
    [
      checkType,
      port,
      path,
      customCommand,
      interval,
      timeout,
      retries,
      startPeriod,
      useStartInterval,
      startInterval,
    ],
  );

  const hasError = Boolean(result.error);
  const needsPort = checkType === "curl" || checkType === "wget" || checkType === "tcp";
  const needsPath = checkType === "curl" || checkType === "wget";

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(`${result.dockerfile}\n\n${result.compose}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setCheckType(DEFAULTS.checkType);
    setPort(DEFAULTS.port);
    setPath(DEFAULTS.path);
    setCustomCommand(DEFAULTS.customCommand);
    setInterval(DEFAULTS.interval);
    setTimeout_(DEFAULTS.timeout);
    setRetries(DEFAULTS.retries);
    setStartPeriod(DEFAULTS.startPeriod);
    setUseStartInterval(DEFAULTS.useStartInterval);
    setStartInterval(DEFAULTS.startInterval);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HeartPulse className="h-4 w-4" aria-hidden="true" />
          Containers
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Docker Healthcheck Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a Dockerfile HEALTHCHECK instruction and the matching compose healthcheck
          block, and see the worst-case time before Docker marks a failing container
          unhealthy: (retries − 1) × interval + timeout.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hc-type">
              Probe type
            </label>
            <select
              id="hc-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={checkType}
              onChange={(event) => setCheckType(event.target.value)}
            >
              {CHECK_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          {needsPort ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="hc-port">
                Container port
              </label>
              <input
                id="hc-port"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                max="65535"
                step="1"
                value={port}
                onChange={(event) => setPort(event.target.value)}
              />
            </div>
          ) : null}
          {needsPath ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="hc-path">
                Health endpoint path
              </label>
              <input
                id="hc-path"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={path}
                onChange={(event) => setPath(event.target.value)}
              />
            </div>
          ) : null}
          {checkType === "custom" ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="hc-custom">
                Probe command (runs inside the container)
              </label>
              <input
                id="hc-custom"
                className={`mt-2 font-mono ${INPUT_CLASS}`}
                type="text"
                placeholder="pg_isready -U postgres || exit 1"
                value={customCommand}
                onChange={(event) => setCustomCommand(event.target.value)}
              />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="hc-interval">
              Interval (s) — default {INTERVAL_DEFAULT}
            </label>
            <input
              id="hc-interval"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={interval}
              onChange={(event) => setInterval(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hc-timeout">
              Timeout (s) — default 30, keep small
            </label>
            <input
              id="hc-timeout"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={timeout}
              onChange={(event) => setTimeout_(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hc-retries">
              Retries — default {RETRIES_DEFAULT}
            </label>
            <input
              id="hc-retries"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={retries}
              onChange={(event) => setRetries(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hc-start">
              Start period (s) — grace at boot
            </label>
            <input
              id="hc-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={startPeriod}
              onChange={(event) => setStartPeriod(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="hc-usi">
              <input
                id="hc-usi"
                type="checkbox"
                className={CHECK_CLASS}
                checked={useStartInterval}
                onChange={(event) => setUseStartInterval(event.target.checked)}
              />
              Add --start-interval (Engine 25.0+)
            </label>
          </div>
          {useStartInterval ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="hc-si">
                Start interval (s) — default {START_INTERVAL_DEFAULT}
              </label>
              <input
                id="hc-si"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={startInterval}
                onChange={(event) => setStartInterval(event.target.value)}
              />
            </div>
          ) : null}
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
              Worst-case time to unhealthy
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.worstCaseSeconds)}s`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the timing."
                : "From the first failing probe's start, after the start period has passed."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the HEALTHCHECK instruction and compose block"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy both"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all options to defaults"
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
              Dockerfile
            </dt>
            <dd className="mt-1 overflow-x-auto rounded-lg bg-[var(--muted)] p-3">
              <pre className="whitespace-pre text-xs leading-5">
                <code>{hasError ? DASH : result.dockerfile}</code>
              </pre>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              docker-compose service block
            </dt>
            <dd className="mt-1 overflow-x-auto rounded-lg bg-[var(--muted)] p-3">
              <pre className="whitespace-pre text-xs leading-5">
                <code>{hasError ? DASH : result.compose}</code>
              </pre>
            </dd>
          </div>
        </dl>

        {!hasError && result.notes.length > 0 ? (
          <ul className="mt-4 space-y-1 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--primary)]" />
                {note}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Probe exit code 0 means healthy and 1 unhealthy (2 is reserved). Inspect results with
        docker inspect --format &#39;{"{{json .State.Health}}"}&#39; &lt;container&gt;.
      </p>
    </main>
  );
}
