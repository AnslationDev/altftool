"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Network, RotateCcw } from "lucide-react";

import { NETWORK_MODES, explainReachability } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  mode: "user-bridge",
  appPort: "80",
  published: true,
  hostPort: "8080",
};

const DASH = "—";

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [appPort, setAppPort] = useState(DEFAULTS.appPort);
  const [published, setPublished] = useState(DEFAULTS.published);
  const [hostPort, setHostPort] = useState(DEFAULTS.hostPort);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      explainReachability({
        mode,
        appPort: appPort.trim() === "" ? Number.NaN : Number(appPort),
        published,
        hostPort: hostPort.trim() === "" ? Number.NaN : Number(hostPort),
      }),
    [mode, appPort, published, hostPort],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Docker network mode: ${result.mode.label}`,
      `Run flag: ${result.mode.flag}`,
      `From the host: ${result.fromHost}`,
      `From the LAN: ${result.fromLan}`,
      `From another container: ${result.fromPeer}`,
      `DNS by container name: ${result.dnsByName ? "yes" : "no"}`,
      ...result.notes.map((n) => `Note: ${n}`),
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
    setMode(DEFAULTS.mode);
    setAppPort(DEFAULTS.appPort);
    setPublished(DEFAULTS.published);
    setHostPort(DEFAULTS.hostPort);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["From the Docker host", DASH],
        ["From the LAN", DASH],
        ["From another container", DASH],
        ["DNS by container name", DASH],
      ]
    : [
        ["From the Docker host", result.fromHost],
        ["From the LAN", result.fromLan],
        ["From another container", result.fromPeer],
        ["DNS by container name", result.dnsByName ? "Yes — embedded DNS" : "No"],
        ["-p publish flag effective", result.publishEffective ? "Yes" : "No"],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Network className="h-4 w-4" aria-hidden="true" />
          Containers
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Docker Network Mode Explainer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a network mode and your app port to see exactly how the container is reached from the
          host, the LAN and other containers — and whether <code>-p</code> even does anything.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dnm-mode">
              Network mode
            </label>
            <select
              id="dnm-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              {NETWORK_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dnm-app-port">
              Port the app listens on (inside the container)
            </label>
            <input
              id="dnm-app-port"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="65535"
              value={appPort}
              onChange={(event) => setAppPort(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dnm-host-port">
              Published host port (the left side of -p)
            </label>
            <input
              id="dnm-host-port"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="65535"
              value={hostPort}
              disabled={!published}
              onChange={(event) => setHostPort(event.target.value)}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="dnm-published"
        >
          <input
            id="dnm-published"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={published}
            onChange={(event) => setPublished(event.target.checked)}
          />
          I pass a publish flag: <code>-p {hasError ? "host" : hostPort}:{appPort || "port"}</code>
        </label>
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
              Selected mode
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.mode.label}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : result.mode.summary}
            </p>
            {!hasError && result.mode.flag ? (
              <p className="mt-2 rounded-md bg-[var(--muted)] px-3 py-2 font-mono text-xs">
                {result.mode.flag}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the network mode explanation"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="font-semibold sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.notes.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {note}
              </li>
            ))}
          </ul>
        ) : null}

        {!hasError && result.mode.linuxOnlyNote ? (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Platform: {result.mode.linuxOnlyNote}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">All modes at a glance</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Mode</th>
                <th scope="col" className="py-2 pr-3 font-semibold">DNS by name</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Needs -p</th>
                <th scope="col" className="py-2 font-semibold">Isolated from host</th>
              </tr>
            </thead>
            <tbody>
              {NETWORK_MODES.map((m) => (
                <tr key={m.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{m.label}</td>
                  <td className="py-2 pr-3">{m.dnsByName ? "Yes" : "No"}</td>
                  <td className="py-2 pr-3">{m.needsPublish ? "Yes" : "No"}</td>
                  <td className="py-2">{m.isolationFromHost ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Behaviour described is the Docker Engine default on Linux. Docker Desktop on macOS and
        Windows runs containers inside a VM, so host networking and macvlan differ there.
      </p>
    </main>
  );
}
