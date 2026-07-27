"use client";

import { useMemo, useState } from "react";
import { Cable, Check, Copy, RotateCcw } from "lucide-react";

import { AMQPS_DEFAULT_PORT, AMQP_DEFAULT_PORT, buildAmqpUri } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  scheme: "amqp",
  host: "localhost",
  port: "",
  username: "guest",
  password: "guest",
  vhost: "/",
  heartbeat: "60",
  timeout: "",
  channelMax: "",
  omitDefaultPort: false,
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setForm((prev) => ({
      ...prev,
      [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value,
    }));

  const result = useMemo(
    () =>
      buildAmqpUri({
        scheme: form.scheme,
        host: form.host,
        port: form.port,
        username: form.username,
        password: form.password,
        vhost: form.vhost,
        heartbeatSeconds: form.heartbeat,
        connectionTimeoutMs: form.timeout,
        channelMax: form.channelMax,
        omitDefaultPort: form.omitDefaultPort,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.uri);
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

  const rows = hasError
    ? [
        ["Scheme", DASH],
        ["Effective port", DASH],
        ["Vhost segment", DASH],
        ["Query string", DASH],
      ]
    : [
        ["Scheme", `${result.scheme} (${result.isTls ? "TLS" : "no TLS"})`],
        [
          "Effective port",
          `${result.effectivePort}${result.effectivePort === result.defaultPort ? " (scheme default)" : ""}`,
        ],
        ["Vhost segment", result.vhostSegment],
        ["Query string", result.queryString || "(none)"],
        ["Credentials in URI", result.hasCredentials ? "yes" : "no"],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Cable className="h-4 w-4" aria-hidden="true" />
          Message brokers
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          RabbitMQ AMQP URI Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Assemble an amqp:// or amqps:// connection URI with correctly percent-encoded
          credentials and vhost, plus heartbeat, connection_timeout and channel_max query
          parameters, following the official RabbitMQ URI specification.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="amqp-scheme">
              Scheme
            </label>
            <select
              id="amqp-scheme"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.scheme}
              onChange={set("scheme")}
            >
              <option value="amqp">amqp — plain TCP (default port {AMQP_DEFAULT_PORT})</option>
              <option value="amqps">amqps — TLS (default port {AMQPS_DEFAULT_PORT})</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amqp-host">
              Host
            </label>
            <input
              id="amqp-host"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="mq.example.com"
              value={form.host}
              onChange={set("host")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amqp-port">
              Port (blank = scheme default)
            </label>
            <input
              id="amqp-port"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="65535"
              placeholder={form.scheme === "amqps" ? String(AMQPS_DEFAULT_PORT) : String(AMQP_DEFAULT_PORT)}
              value={form.port}
              onChange={set("port")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amqp-vhost">
              Virtual host
            </label>
            <input
              id="amqp-vhost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="/"
              value={form.vhost}
              onChange={set("vhost")}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              The default vhost is named &quot;/&quot; and is encoded as %2F in the URI.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amqp-user">
              Username
            </label>
            <input
              id="amqp-user"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={form.username}
              onChange={set("username")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amqp-pass">
              Password
            </label>
            <input
              id="amqp-pass"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={form.password}
              onChange={set("password")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amqp-heartbeat">
              Heartbeat (seconds, optional)
            </label>
            <input
              id="amqp-heartbeat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="60"
              value={form.heartbeat}
              onChange={set("heartbeat")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amqp-timeout">
              Connection timeout (ms, optional)
            </label>
            <input
              id="amqp-timeout"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="30000"
              value={form.timeout}
              onChange={set("timeout")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amqp-chanmax">
              Channel max (optional, 0 = unlimited)
            </label>
            <input
              id="amqp-chanmax"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="65535"
              placeholder="2047"
              value={form.channelMax}
              onChange={set("channelMax")}
            />
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
              htmlFor="amqp-omit"
            >
              <input
                id="amqp-omit"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={form.omitDefaultPort}
                onChange={set("omitDefaultPort")}
              />
              Omit the port when it is the scheme default
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
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Connection URI
            </p>
            <div className="mt-2 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
              <code className="block whitespace-nowrap font-mono text-base font-semibold text-[var(--primary)]">
                {hasError ? DASH : result.uri}
              </code>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the AMQP connection URI"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy URI"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="break-all text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything runs in your browser — the URI is never sent anywhere. Avoid committing URIs
        containing real passwords to source control; prefer environment variables or a secrets
        manager.
      </p>
    </main>
  );
}
