"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Timer } from "lucide-react";

import {
  MAX_BACKOFF_ATTEMPTS,
  RETRY_AFTER_STATUSES,
  backoffSchedule,
  buildFromDelay,
  buildFromTarget,
  parseRetryAfter,
  toDelaySeconds,
} from "../lib";

/**
 * A fixed instant used for the very first server-rendered paint so the markup is
 * deterministic. An effect swaps in the real clock immediately after mount.
 * This is the RFC 9110 example date, Sun, 06 Nov 1994 08:49:37 GMT.
 */
const FALLBACK_NOW = 784111777000;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const DASH = "—";

const pad = (value) => String(value).padStart(2, "0");

/** Presentation helper: epoch ms -> the value a datetime-local input expects. */
const toLocalInput = (epochMs) => {
  const d = new Date(epochMs);
  if (Number.isNaN(d.getTime())) return "";
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
};

/** Presentation helper: datetime-local value -> epoch ms (interpreted as local time). */
const fromLocalInput = (value) => {
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? NaN : parsed.getTime();
};

const DEFAULTS = {
  mode: "delay",
  amount: "120",
  unit: "seconds",
  status: 429,
  base: "1",
  factor: "2",
  attempts: "6",
  cap: "3600",
  jitter: "full",
  paste: "Wed, 21 Oct 2015 07:28:00 GMT",
};

const formatSeconds = (seconds) => {
  if (!Number.isFinite(seconds)) return DASH;
  if (seconds < 60) return `${NUM.format(seconds)} s`;
  if (seconds < 3600) return `${NUM.format(seconds / 60)} min`;
  if (seconds < 86400) return `${NUM.format(seconds / 3600)} h`;
  return `${NUM.format(seconds / 86400)} d`;
};

export default function ToolHome() {
  const [nowMs, setNowMs] = useState(FALLBACK_NOW);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [targetLocal, setTargetLocal] = useState(() => toLocalInput(FALLBACK_NOW + 15 * 60000));
  const [statusCode, setStatusCode] = useState(DEFAULTS.status);
  const [paste, setPaste] = useState(DEFAULTS.paste);
  const [base, setBase] = useState(DEFAULTS.base);
  const [factor, setFactor] = useState(DEFAULTS.factor);
  const [attempts, setAttempts] = useState(DEFAULTS.attempts);
  const [cap, setCap] = useState(DEFAULTS.cap);
  const [jitter, setJitter] = useState(DEFAULTS.jitter);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const stamp = Date.now();
    setNowMs(stamp);
    setTargetLocal(toLocalInput(stamp + 15 * 60000));
  }, []);

  const status = useMemo(
    () => RETRY_AFTER_STATUSES.find((entry) => entry.code === statusCode) ?? RETRY_AFTER_STATUSES[0],
    [statusCode],
  );

  const header = useMemo(() => {
    if (mode === "delay") {
      const seconds = toDelaySeconds(amount, unit);
      if (seconds === null) return { error: "Enter the wait as a number." };
      return buildFromDelay({ delaySeconds: seconds, nowMs });
    }
    return buildFromTarget({ targetMs: fromLocalInput(targetLocal), nowMs });
  }, [mode, amount, unit, targetLocal, nowMs]);

  const backoff = useMemo(
    () =>
      backoffSchedule({
        baseSeconds: Number(base),
        factor: Number(factor),
        attempts: Number(attempts),
        maxSeconds: Number(cap),
        jitter,
      }),
    [base, factor, attempts, cap, jitter],
  );

  const parsed = useMemo(() => parseRetryAfter(paste, nowMs), [paste, nowMs]);

  const summary = useMemo(() => {
    if (header.error) return "";
    return [
      `HTTP/1.1 ${status.label}`,
      header.secondsHeader,
      "",
      "# or, equivalently, as an HTTP-date:",
      `# ${header.dateHeader}`,
    ].join("\n");
  }, [header, status]);

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    const stamp = Date.now();
    setNowMs(stamp);
    setMode(DEFAULTS.mode);
    setAmount(DEFAULTS.amount);
    setUnit(DEFAULTS.unit);
    setTargetLocal(toLocalInput(stamp + 15 * 60000));
    setStatusCode(DEFAULTS.status);
    setPaste(DEFAULTS.paste);
    setBase(DEFAULTS.base);
    setFactor(DEFAULTS.factor);
    setAttempts(DEFAULTS.attempts);
    setCap(DEFAULTS.cap);
    setJitter(DEFAULTS.jitter);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          RFC 9110 §10.2.3
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Retry-After Header Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Produce a Retry-After value that clients will actually honour — whole seconds or an
          IMF-fixdate in GMT — and plan the backoff schedule behind it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="How the wait is specified"
        >
          {[
            ["delay", "Wait a fixed amount"],
            ["target", "Come back at a set time"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              aria-pressed={mode === value}
              className={`min-h-11 flex-1 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                mode === value
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {mode === "delay" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="ra-amount">
                  Wait
                </label>
                <input
                  id="ra-amount"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ra-unit">
                  Unit
                </label>
                <select
                  id="ra-unit"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                >
                  <option value="seconds">seconds</option>
                  <option value="minutes">minutes</option>
                  <option value="hours">hours</option>
                  <option value="days">days</option>
                </select>
              </div>
            </>
          ) : (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="ra-target">
                Retry at (your local time)
              </label>
              <input
                id="ra-target"
                className={`mt-2 ${INPUT_CLASS}`}
                type="datetime-local"
                value={targetLocal}
                onChange={(event) => setTargetLocal(event.target.value)}
              />
            </div>
          )}

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ra-status">
              Response status
            </label>
            <select
              id="ra-status"
              className={`mt-2 ${INPUT_CLASS}`}
              value={statusCode}
              onChange={(event) => setStatusCode(Number(event.target.value))}
            >
              {RETRY_AFTER_STATUSES.map((entry) => (
                <option key={entry.code} value={entry.code}>
                  {entry.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              {status.guidance} <span className="font-semibold">({status.spec})</span>
            </p>
          </div>
        </div>
      </section>

      {header.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {header.error}
          </p>
          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Header value
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["delay-seconds form", "HTTP-date form", "Effective wait"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold text-[var(--muted-foreground)]">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Send this header
              </p>
              <p className="mt-1 break-all font-mono text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
                {header.secondsHeader}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {formatSeconds(header.delaySeconds)} from now
                {header.inPast ? " — the instant you picked has already passed, so this clamps to 0." : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copy(summary, "summary")}
                aria-label="Copy the Retry-After header"
                className={GHOST_BTN}
              >
                {copied === "summary" ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied === "summary" ? "Copied!" : "Copy result"}
              </button>
              <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              ["delay-seconds form", header.secondsHeader],
              ["HTTP-date form", header.dateHeader],
              ["Effective wait", formatSeconds(header.delaySeconds)],
              ["Whole seconds sent", `${header.delaySeconds}`],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="min-w-0 break-all text-right font-mono font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Prefer delay-seconds unless you are announcing a maintenance window that ends at a known
            wall-clock time. A date depends on the client&apos;s clock being right; a count of seconds
            does not.
          </p>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Backoff schedule for repeat offenders</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Grow the value you send on each successive rejection so a client that keeps hammering backs
          off instead of retrying at a fixed cadence.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ra-base">
              Base delay (seconds)
            </label>
            <input
              id="ra-base"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.5"
              value={base}
              onChange={(event) => setBase(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ra-factor">
              Multiplier per attempt
            </label>
            <input
              id="ra-factor"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.1"
              value={factor}
              onChange={(event) => setFactor(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ra-attempts">
              Attempts to show (max {MAX_BACKOFF_ATTEMPTS})
            </label>
            <input
              id="ra-attempts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_BACKOFF_ATTEMPTS}
              step="1"
              value={attempts}
              onChange={(event) => setAttempts(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ra-cap">
              Cap (seconds)
            </label>
            <input
              id="ra-cap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="60"
              value={cap}
              onChange={(event) => setCap(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ra-jitter">
              Jitter strategy
            </label>
            <select
              id="ra-jitter"
              className={`mt-2 ${INPUT_CLASS}`}
              value={jitter}
              onChange={(event) => setJitter(event.target.value)}
            >
              <option value="none">None — every client waits the same</option>
              <option value="full">Full — pick uniformly from 0 to the cap</option>
              <option value="equal">Equal — half the cap plus a random half</option>
            </select>
          </div>
        </div>

        {backoff.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {backoff.error}
          </p>
        ) : (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Attempt
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Retry-After
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Client waits
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Elapsed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {backoff.rows.map((row) => (
                    <tr key={row.attempt} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">
                        {row.attempt}
                        {row.wasCapped ? (
                          <span className="ml-1 text-xs font-normal text-[var(--muted-foreground)]">capped</span>
                        ) : null}
                      </td>
                      <td className="py-2 pr-3 text-right font-mono">{row.headerSeconds}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {row.jitterLow === row.jitterHigh
                          ? formatSeconds(row.jitterHigh)
                          : `${formatSeconds(row.jitterLow)} – ${formatSeconds(row.jitterHigh)}`}
                      </td>
                      <td className="py-2 text-right">
                        {row.cumulativeMin === row.cumulativeMax
                          ? formatSeconds(row.cumulativeMax)
                          : `${formatSeconds(row.cumulativeMin)} – ${formatSeconds(row.cumulativeMax)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              Total wait across all {backoff.rows.length} attempts:{" "}
              {backoff.totalMin === backoff.totalMax
                ? formatSeconds(backoff.totalMax)
                : `${formatSeconds(backoff.totalMin)} to ${formatSeconds(backoff.totalMax)}`}
              . Jitter is shown as the range a client draws from — the header itself always carries a
              whole number.
            </p>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Check a value you already have</h2>
        <label className="mt-3 block" htmlFor="ra-paste">
          <span className={LABEL_CLASS}>Retry-After value (without the field name)</span>
        </label>
        <input
          id="ra-paste"
          className={`mt-2 ${INPUT_CLASS} font-mono`}
          type="text"
          value={paste}
          onChange={(event) => setPaste(event.target.value)}
        />
        {parsed.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {parsed.error}
          </p>
        ) : (
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {[
              ["Interpreted as", parsed.kind === "seconds" ? "delay-seconds" : "HTTP-date"],
              ["Normalised", parsed.normalised],
              ["Wait from now", formatSeconds(parsed.seconds)],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="min-w-0 break-all text-right font-mono font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
        {!parsed.error && parsed.note ? (
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{parsed.note}</p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Dates are rendered in GMT as IMF-fixdate, the only form RFC 9110 permits a sender to
        generate. Values are rounded up to whole seconds so a client never returns early.
      </p>
    </main>
  );
}
