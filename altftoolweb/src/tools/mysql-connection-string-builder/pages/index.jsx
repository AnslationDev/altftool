"use client";

import { useMemo, useState } from "react";
import { Check, Copy, DatabaseZap, RotateCcw } from "lucide-react";

import { CHARSET_OPTIONS, SSL_MODES, buildMysqlConnection } from "../lib";

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
  host: "localhost",
  port: "3306",
  database: "appdb",
  user: "app_user",
  password: "",
  charset: "utf8mb4",
  timezone: "",
  sslMode: "REQUIRED",
  connectTimeoutSeconds: "10",
  connectionLimit: "",
  parseTime: true,
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const result = useMemo(() => buildMysqlConnection(form), [form]);
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

  const outputs = hasError
    ? []
    : [
        { id: "uri", label: "URI (Node mysql2 / SQLAlchemy style)", value: result.uri },
        { id: "go", label: "Go DSN (go-sql-driver/mysql)", value: result.goDsn },
        { id: "jdbc", label: "JDBC URL (Connector/J)", value: result.jdbc },
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <DatabaseZap className="h-4 w-4" aria-hidden="true" />
          Database connectivity
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          MySQL Connection String Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One set of inputs, three correct outputs: a mysql:// URI, a Go DSN and a JDBC URL —
          with charset, time zone, TLS mode, timeout and pool limit mapped to each driver's own
          parameter names.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="my-host">
              Host
            </label>
            <input id="my-host" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.host} onChange={setField("host")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-port">
              Port (blank = default 3306)
            </label>
            <input id="my-port" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="1" max="65535" value={form.port} onChange={setField("port")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-db">
              Database (schema) name
            </label>
            <input id="my-db" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.database} onChange={setField("database")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-user">
              User (optional)
            </label>
            <input id="my-user" className={`mt-2 ${INPUT_CLASS}`} type="text" autoComplete="off" value={form.user} onChange={setField("user")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-pass">
              Password (optional, encoded for the URI)
            </label>
            <input id="my-pass" className={`mt-2 ${INPUT_CLASS}`} type="text" autoComplete="off" spellCheck={false} value={form.password} onChange={setField("password")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-charset">
              Character set
            </label>
            <select id="my-charset" className={`mt-2 ${INPUT_CLASS}`} value={form.charset} onChange={setField("charset")}>
              {CHARSET_OPTIONS.map((option) => (
                <option key={option || "none"} value={option}>
                  {option === "" ? "(omit)" : option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-tz">
              Time zone (IANA name, optional)
            </label>
            <input id="my-tz" className={`mt-2 ${INPUT_CLASS}`} type="text" placeholder="e.g. UTC or Asia/Kolkata" value={form.timezone} onChange={setField("timezone")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-ssl">
              TLS / SSL mode
            </label>
            <select id="my-ssl" className={`mt-2 ${INPUT_CLASS}`} value={form.sslMode} onChange={setField("sslMode")}>
              {SSL_MODES.map((mode) => (
                <option key={mode.value || "default"} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-timeout">
              Connect timeout in seconds (optional)
            </label>
            <input id="my-timeout" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="1" value={form.connectTimeoutSeconds} onChange={setField("connectTimeoutSeconds")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-pool">
              connectionLimit — mysql2 pool (optional)
            </label>
            <input id="my-pool" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="1" value={form.connectionLimit} onChange={setField("connectionLimit")} />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="my-parsetime"
        >
          <input
            id="my-parsetime"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={form.parseTime}
            onChange={(event) => {
              const { checked } = event.target;
              setForm((previous) => ({ ...previous, parseTime: checked }));
            }}
          />
          parseTime=true in the Go DSN (scan DATE/DATETIME into time.Time)
        </label>
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
              Generated strings
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : "3 formats"}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the connection strings."
                : "Each format uses its own parameter names — copy the one your driver expects."}
            </p>
          </div>
          <button type="button" onClick={reset} aria-label="Reset all fields to defaults" className={PRIMARY_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>

        {hasError ? (
          <pre className={CODE_BOX}>{DASH}</pre>
        ) : (
          outputs.map((output) => (
            <div key={output.id} className="mt-5 first:mt-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">{output.label}</h2>
                <button
                  type="button"
                  onClick={() => copyText(output.value, output.id)}
                  aria-label={`Copy the ${output.label}`}
                  className={GHOST_BTN}
                >
                  {copied === output.id ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied === output.id ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className={CODE_BOX}>{output.value}</pre>
            </div>
          ))
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything runs locally in your browser. REQUIRED encrypts but does not verify the
        server certificate — use VERIFY_CA or VERIFY_IDENTITY for production over untrusted
        networks, and keep real passwords in a secrets manager.
      </p>
    </main>
  );
}
