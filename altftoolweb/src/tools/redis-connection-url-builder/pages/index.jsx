"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Server } from "lucide-react";

import { buildRedisUrl } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CODE_BOX =
  "mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)]";

const DEFAULTS = {
  tls: false,
  host: "localhost",
  port: "6379",
  dbIndex: "0",
  username: "",
  password: "",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const result = useMemo(() => buildRedisUrl(form), [form]);
  const hasError = Boolean(result.error);

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const copyText = async (text, which) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Server className="h-4 w-4" aria-hidden="true" />
          Database connectivity
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Redis Connection URL Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a redis:// or rediss:// URL with logical database index, Redis 6 ACL username or
          legacy password auth, and TLS — plus the redis-cli -u command to test it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label
          className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold text-[var(--foreground)]"
          htmlFor="rd-tls"
        >
          <input
            id="rd-tls"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={form.tls}
            onChange={(event) => {
              const { checked } = event.target;
              setForm((previous) => ({ ...previous, tls: checked }));
            }}
          />
          Use TLS — rediss:// (required by most managed Redis services)
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rd-host">
              Host (name, IPv4 or IPv6)
            </label>
            <input id="rd-host" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.host} onChange={setField("host")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rd-port">
              Port (blank = default 6379)
            </label>
            <input id="rd-port" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="1" max="65535" value={form.port} onChange={setField("port")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rd-db">
              Database index (0–15 by default)
            </label>
            <input id="rd-db" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="0" step="1" value={form.dbIndex} onChange={setField("dbIndex")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rd-user">
              ACL username (Redis 6+, optional)
            </label>
            <input id="rd-user" className={`mt-2 ${INPUT_CLASS}`} type="text" autoComplete="off" placeholder="blank = legacy AUTH / default user" value={form.username} onChange={setField("username")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rd-pass">
              Password (optional, encoded for you)
            </label>
            <input id="rd-pass" className={`mt-2 ${INPUT_CLASS}`} type="text" autoComplete="off" spellCheck={false} value={form.password} onChange={setField("password")} />
          </div>
        </div>
      </section>

      {hasError ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      {!hasError && result.warning ? (
        <p className="mt-6 rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-medium text-[var(--muted-foreground)]">
          {result.warning}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Connection URL
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {hasError ? DASH : form.tls ? "rediss://" : "redis://"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText(result.url, "url")}
              disabled={hasError}
              aria-label="Copy the Redis connection URL"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "url" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "url" ? "Copied!" : "Copy URL"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <pre className={CODE_BOX}>{hasError ? DASH : result.url}</pre>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Test with redis-cli</h2>
            <button
              type="button"
              onClick={() => copyText(result.cliCommand, "cli")}
              disabled={hasError}
              aria-label="Copy the redis-cli command"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "cli" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "cli" ? "Copied!" : "Copy command"}
            </button>
          </div>
          <pre className={CODE_BOX}>{hasError ? DASH : result.cliCommand}</pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything runs locally in your browser. A URL without a username uses legacy AUTH
        (redis://:password@host); Redis 6 ACL users go before the colon. Avoid pasting real
        production passwords into shell history — use environment variables or a secrets
        manager.
      </p>
    </main>
  );
}
