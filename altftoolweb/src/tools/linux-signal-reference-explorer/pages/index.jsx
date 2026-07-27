"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RadioTower, RotateCcw } from "lucide-react";

import {
  DEFAULT_ACTIONS,
  DOCKER_STOP_GRACE_SECONDS,
  K8S_GRACE_SECONDS,
  RT_SIGNAL_NOTE,
  SIGNALS,
  exitCodeFor,
  formatSignal,
  lookupSignal,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const DEFAULT_QUERY = "SIGTERM";
const QUICK = ["SIGTERM", "SIGKILL", "9", "SIGSEGV", "SIGHUP", "SIGCHLD"];

export default function ToolHome() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [copied, setCopied] = useState("");

  const result = useMemo(() => lookupSignal(query), [query]);
  const hasError = Boolean(result.error);
  const entries = hasError ? [] : result.entries;
  const first = entries[0];
  const firstExit = first ? exitCodeFor(first) : null;

  const copy = async (signal) => {
    const text = formatSignal(signal);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(signal.name);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setQuery(DEFAULT_QUERY);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <RadioTower className="h-4 w-4" aria-hidden="true" />
          Linux Admin
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Linux Signal Reference Explorer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every standard signal from signal(7): default action, whether it can be caught, the
          128+N exit code it produces, and how it behaves when your process is PID 1 in a
          container.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="sig-query">
          Signal number, name or keyword
        </label>
        <input
          id="sig-query"
          className={`mt-2 ${INPUT_CLASS} font-mono`}
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="e.g. 9, SIGTERM, ctrl+c, seccomp"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => setQuery(sample)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {sample}
            </button>
          ))}
          <button type="button" onClick={reset} aria-label="Reset to default lookup" className={GHOST_BTN}>
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Best match
            </p>
            <p className="mt-1 font-mono text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {first ? `${first.name} (${first.number})` : DASH}
            </p>
            <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--muted-foreground)]">
              {first ? first.description : "Fix the input above to see a result."}
            </p>
          </div>
          {first ? (
            <button
              type="button"
              onClick={() => copy(first)}
              aria-label={`Copy the ${first.name} summary`}
              className={PRIMARY_BTN}
            >
              {copied === first.name ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === first.name ? "Copied!" : "Copy result"}
            </button>
          ) : null}
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(first
            ? [
                ["Default action", DEFAULT_ACTIONS[first.action]],
                [
                  "Catchable / blockable",
                  first.catchable ? "Yes — a handler can override it" : "No — cannot be caught, blocked or ignored",
                ],
                [
                  "Shell exit code when fatal",
                  firstExit ? `${firstExit} (128 + ${first.number})` : "None — does not terminate by default",
                ],
                ["Send it", `kill -${first.number} <pid>  ·  kill -${first.name.replace("SIG", "")} <pid>`],
              ]
            : [
                ["Default action", DASH],
                ["Catchable / blockable", DASH],
                ["Shell exit code when fatal", DASH],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {first && first.container ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
            <span className="font-semibold">In containers: </span>
            {first.container}
          </p>
        ) : null}

        {entries.length > 1 ? (
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">
            {entries.length - 1} other match{entries.length === 2 ? "" : "es"}:{" "}
            {entries.slice(1).map((s) => s.name).join(", ")} — refine the search or use the table
            below.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">All 31 standard signals</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">No.</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Name</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Default</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Catchable</th>
                <th scope="col" className="py-2 font-semibold">Exit code</th>
              </tr>
            </thead>
            <tbody>
              {SIGNALS.map((signal) => {
                const codeValue = exitCodeFor(signal);
                return (
                  <tr key={signal.number} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-mono">{signal.number}</td>
                    <td className="py-2 pr-3">
                      <button
                        type="button"
                        onClick={() => setQuery(signal.name)}
                        aria-label={`Show details for ${signal.name}`}
                        className="font-mono font-semibold text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      >
                        {signal.name}
                      </button>
                    </td>
                    <td className="py-2 pr-3">{signal.action}</td>
                    <td className={`py-2 pr-3 font-semibold ${signal.catchable ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                      {signal.catchable ? "Yes" : "No"}
                    </td>
                    <td className="py-2 font-mono">{codeValue ?? DASH}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{RT_SIGNAL_NOTE}</p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Numbers are Linux x86-64; several differ on Alpha, SPARC and MIPS. Container shutdown:
        docker stop sends SIGTERM, then SIGKILL after {DOCKER_STOP_GRACE_SECONDS} s; Kubernetes
        allows {K8S_GRACE_SECONDS} s by default. As PID 1, a process receives no default signal
        handling — an unhandled SIGTERM is discarded, so use an init shim like tini or handle
        SIGTERM explicitly.
      </p>
    </main>
  );
}
