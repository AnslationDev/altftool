"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ServerCog } from "lucide-react";

import { AUTH_MODES, buildSqlServerConnection } from "../lib";

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
  instanceName: "",
  port: "1433",
  database: "appdb",
  authMode: "sql",
  user: "app_user",
  password: "",
  encrypt: true,
  trustServerCertificate: false,
  timeoutSeconds: "15",
  applicationName: "",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const result = useMemo(() => buildSqlServerConnection(form), [form]);
  const hasError = Boolean(result.error);

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const setChecked = (key) => (event) => {
    const { checked } = event.target;
    setForm((previous) => ({ ...previous, [key]: checked }));
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

  const isSqlAuth = form.authMode === "sql";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ServerCog className="h-4 w-4" aria-hidden="true" />
          Database connectivity
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          SQL Server Connection String Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build matching ADO.NET and JDBC connection strings — named instances, encryption,
          TrustServerCertificate, timeouts and application name — with each format's own
          escaping rules applied for you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ms-host">
              Host
            </label>
            <input id="ms-host" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.host} onChange={setField("host")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ms-instance">
              Instance name (optional, e.g. SQLEXPRESS)
            </label>
            <input id="ms-instance" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.instanceName} onChange={setField("instanceName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ms-port">
              Port (blank = default 1433 / SQL Browser)
            </label>
            <input id="ms-port" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="1" max="65535" value={form.port} onChange={setField("port")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ms-db">
              Database name
            </label>
            <input id="ms-db" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.database} onChange={setField("database")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ms-auth">
              Authentication
            </label>
            <select id="ms-auth" className={`mt-2 ${INPUT_CLASS}`} value={form.authMode} onChange={setField("authMode")}>
              {AUTH_MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
          {isSqlAuth ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="ms-user">
                  User (login)
                </label>
                <input id="ms-user" className={`mt-2 ${INPUT_CLASS}`} type="text" autoComplete="off" value={form.user} onChange={setField("user")} />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ms-pass">
                  Password (escaped for you)
                </label>
                <input id="ms-pass" className={`mt-2 ${INPUT_CLASS}`} type="text" autoComplete="off" spellCheck={false} value={form.password} onChange={setField("password")} />
              </div>
            </>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="ms-timeout">
              Connection timeout in seconds (optional)
            </label>
            <input id="ms-timeout" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="0" value={form.timeoutSeconds} onChange={setField("timeoutSeconds")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ms-app">
              Application name (optional)
            </label>
            <input id="ms-app" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.applicationName} onChange={setField("applicationName")} />
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]" htmlFor="ms-encrypt">
            <input
              id="ms-encrypt"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={form.encrypt}
              onChange={setChecked("encrypt")}
            />
            Encrypt=True (default in modern SqlClient and JDBC drivers)
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]" htmlFor="ms-trust">
            <input
              id="ms-trust"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={form.trustServerCertificate}
              onChange={setChecked("trustServerCertificate")}
            />
            TrustServerCertificate=True (skips certificate validation — dev/test only)
          </label>
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
              Generated strings
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : "2 formats"}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the connection strings."
                : "ADO.NET for .NET applications, JDBC for Java — same settings, each format's own syntax."}
            </p>
          </div>
          <button type="button" onClick={reset} aria-label="Reset all fields to defaults" className={PRIMARY_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">ADO.NET (SqlClient)</h2>
            <button
              type="button"
              onClick={() => copyText(result.adoNet, "ado")}
              disabled={hasError}
              aria-label="Copy the ADO.NET connection string"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "ado" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "ado" ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className={CODE_BOX}>{hasError ? DASH : result.adoNet}</pre>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">JDBC (Microsoft JDBC Driver)</h2>
            <button
              type="button"
              onClick={() => copyText(result.jdbc, "jdbc")}
              disabled={hasError}
              aria-label="Copy the JDBC connection URL"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "jdbc" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "jdbc" ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className={CODE_BOX}>{hasError ? DASH : result.jdbc}</pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything runs locally in your browser. Leave TrustServerCertificate off in production —
        it disables the certificate check that makes encryption meaningful. Named instances
        without a fixed port need the SQL Server Browser service reachable on UDP 1434.
      </p>
    </main>
  );
}
