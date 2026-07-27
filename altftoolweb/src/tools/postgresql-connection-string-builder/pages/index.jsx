"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Database, RotateCcw } from "lucide-react";

import { SSL_MODES, URI_SCHEMES, buildPostgresConnection } from "../lib";

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
  scheme: "postgresql",
  host: "localhost",
  port: "5432",
  database: "appdb",
  user: "app_user",
  password: "",
  sslmode: "require",
  connectTimeout: "10",
  applicationName: "",
  schema: "",
  poolMaxConns: "",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const result = useMemo(() => buildPostgresConnection(form), [form]);
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
          <Database className="h-4 w-4" aria-hidden="true" />
          Database connectivity
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          PostgreSQL Connection String Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a libpq connection URI and the equivalent keyword/value DSN, with sslmode,
          connect_timeout, application_name, search_path and pool settings — special characters
          percent-encoded for you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-scheme">
              URI scheme
            </label>
            <select id="pg-scheme" className={`mt-2 ${INPUT_CLASS}`} value={form.scheme} onChange={setField("scheme")}>
              {URI_SCHEMES.map((scheme) => (
                <option key={scheme} value={scheme}>
                  {scheme}://
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-host">
              Host (name, IPv4 or IPv6)
            </label>
            <input id="pg-host" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.host} onChange={setField("host")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-port">
              Port (blank = default 5432)
            </label>
            <input id="pg-port" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="1" max="65535" value={form.port} onChange={setField("port")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-db">
              Database name
            </label>
            <input id="pg-db" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.database} onChange={setField("database")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-user">
              User (optional)
            </label>
            <input id="pg-user" className={`mt-2 ${INPUT_CLASS}`} type="text" autoComplete="off" value={form.user} onChange={setField("user")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-pass">
              Password (optional, encoded for you)
            </label>
            <input id="pg-pass" className={`mt-2 ${INPUT_CLASS}`} type="text" autoComplete="off" spellCheck={false} value={form.password} onChange={setField("password")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-ssl">
              sslmode
            </label>
            <select id="pg-ssl" className={`mt-2 ${INPUT_CLASS}`} value={form.sslmode} onChange={setField("sslmode")}>
              {SSL_MODES.map((mode) => (
                <option key={mode.value || "default"} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-timeout">
              connect_timeout in seconds (optional)
            </label>
            <input id="pg-timeout" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="1" value={form.connectTimeout} onChange={setField("connectTimeout")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-app">
              application_name (optional)
            </label>
            <input id="pg-app" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.applicationName} onChange={setField("applicationName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-schema">
              Schema / search_path (optional)
            </label>
            <input id="pg-schema" className={`mt-2 ${INPUT_CLASS}`} type="text" placeholder="e.g. tenant1" value={form.schema} onChange={setField("schema")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-pool">
              pool_max_conns (pgxpool only, optional)
            </label>
            <input id="pg-pool" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="1" value={form.poolMaxConns} onChange={setField("poolMaxConns")} />
          </div>
        </div>
      </section>

      {hasError ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Connection URI
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {hasError ? DASH : `${form.scheme}://`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText(result.uri, "uri")}
              disabled={hasError}
              aria-label="Copy the PostgreSQL connection URI"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "uri" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "uri" ? "Copied!" : "Copy URI"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <pre className={CODE_BOX}>{hasError ? DASH : result.uri}</pre>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Keyword/value DSN</h2>
            <button
              type="button"
              onClick={() => copyText(result.keywordValue, "kv")}
              disabled={hasError}
              aria-label="Copy the keyword value DSN"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "kv" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "kv" ? "Copied!" : "Copy DSN"}
            </button>
          </div>
          <pre className={CODE_BOX}>{hasError ? DASH : result.keywordValue}</pre>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Query parameters set</dt>
            <dd className="text-right font-semibold">{hasError ? DASH : result.params.length}</dd>
          </div>
          {!hasError &&
            result.params.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="font-mono text-xs text-[var(--muted-foreground)]">{key}</dt>
                <dd className="break-all text-right font-mono text-xs font-semibold">{value}</dd>
              </div>
            ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything runs in your browser — nothing you type here is sent anywhere. Prefer
        sslmode=verify-full for production traffic over untrusted networks, and keep real
        passwords in a secrets manager or .pgpass rather than in shell history.
      </p>
    </main>
  );
}
