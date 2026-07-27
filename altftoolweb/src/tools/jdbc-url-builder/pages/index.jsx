"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Database, RotateCcw, TriangleAlert } from "lucide-react";

import {
  DATABASES,
  H2_MODES,
  MAX_PORT,
  MIN_PORT,
  ORACLE_STYLES,
  SQLITE_MODES,
  buildJdbcUrl,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  dbId: "postgresql",
  host: "db.internal",
  port: "",
  database: "orders",
  user: "app_user",
  tls: true,
  oracleStyle: "service",
  h2Mode: "mem",
  sqliteMode: "file",
  instance: "",
  paramKey: "",
  paramValue: "",
};

export default function ToolHome() {
  const [dbId, setDbId] = useState(DEFAULTS.dbId);
  const [host, setHost] = useState(DEFAULTS.host);
  const [port, setPort] = useState(DEFAULTS.port);
  const [database, setDatabase] = useState(DEFAULTS.database);
  const [user, setUser] = useState(DEFAULTS.user);
  const [tls, setTls] = useState(DEFAULTS.tls);
  const [oracleStyle, setOracleStyle] = useState(DEFAULTS.oracleStyle);
  const [h2Mode, setH2Mode] = useState(DEFAULTS.h2Mode);
  const [sqliteMode, setSqliteMode] = useState(DEFAULTS.sqliteMode);
  const [instance, setInstance] = useState(DEFAULTS.instance);
  const [paramKey, setParamKey] = useState(DEFAULTS.paramKey);
  const [paramValue, setParamValue] = useState(DEFAULTS.paramValue);
  const [copied, setCopied] = useState("");

  const extraParams = useMemo(
    () => (paramKey.trim() ? [[paramKey, paramValue]] : []),
    [paramKey, paramValue],
  );

  const result = useMemo(
    () =>
      buildJdbcUrl({
        dbId,
        host,
        port,
        database,
        user,
        tls,
        oracleStyle,
        h2Mode,
        sqliteMode,
        instance,
        extraParams,
      }),
    [dbId, host, port, database, user, tls, oracleStyle, h2Mode, sqliteMode, instance, extraParams],
  );

  const hasError = Boolean(result.error);
  const selected = DATABASES.find((entry) => entry.id === dbId);

  const isOracle = dbId === "oracle";
  const isSqlServer = dbId === "sqlserver";
  const isH2 = dbId === "h2";
  const isSqlite = dbId === "sqlite";
  const showHost = Boolean(selected?.needsHost) || (isH2 && h2Mode === "tcp");
  const showPort = showHost && !(isSqlServer && instance.trim() !== "");
  const showDatabase = !(isSqlite && sqliteMode === "memory");
  const showTls = Array.isArray(selected?.tlsParams) && selected.tlsParams.length > 0;
  const showUser = !isSqlite && !isH2;

  const databaseLabel = isOracle
    ? oracleStyle === "sid"
      ? "SID"
      : "Service name"
    : isSqlite
      ? "Database file path"
      : isH2 && h2Mode !== "tcp"
        ? "Database name or path"
        : "Database name";

  const copyText = async (text, key) => {
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
    setDbId(DEFAULTS.dbId);
    setHost(DEFAULTS.host);
    setPort(DEFAULTS.port);
    setDatabase(DEFAULTS.database);
    setUser(DEFAULTS.user);
    setTls(DEFAULTS.tls);
    setOracleStyle(DEFAULTS.oracleStyle);
    setH2Mode(DEFAULTS.h2Mode);
    setSqliteMode(DEFAULTS.sqliteMode);
    setInstance(DEFAULTS.instance);
    setParamKey(DEFAULTS.paramKey);
    setParamValue(DEFAULTS.paramValue);
    setCopied("");
  };

  const changeDatabase = (nextId) => {
    setDbId(nextId);
    const next = DATABASES.find((entry) => entry.id === nextId);
    setDatabase(next?.defaultDatabase ?? "");
    setPort("");
    setInstance("");
    setParamKey("");
    setParamValue("");
    setCopied("");
  };

  const rows = hasError
    ? [
        ["Driver class", DASH],
        ["Port used", DASH],
        ["Parameter style", DASH],
        ["Properties in URL", DASH],
      ]
    : [
        ["Driver class", result.driverClass],
        [
          "Port used",
          result.resolvedPort === null
            ? "No port — file or embedded connection"
            : `${result.resolvedPort}${result.portDefaulted ? " (vendor default)" : ""}`,
        ],
        [
          "Parameter style",
          result.db.paramStyle === "query"
            ? "?key=value&key=value"
            : result.db.paramStyle === "semicolon"
              ? ";key=value;key=value"
              : "None — use java.util.Properties",
        ],
        [
          "Properties in URL",
          result.params.length
            ? result.params.map(([key, value]) => `${key}=${value}`).join(", ")
            : "None",
        ],
      ];

  const snippets = hasError
    ? []
    : [
        ["Java (DriverManager)", result.snippet],
        ["Maven", result.mavenBlock],
        ["Gradle (Kotlin DSL)", result.gradle],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Database className="h-4 w-4" aria-hidden="true" />
          Developer
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">JDBC URL Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a valid JDBC connection URL for PostgreSQL, MySQL, Oracle, SQL Server, H2 or
          SQLite, with the right separator style, default port, driver class and build-file
          coordinate for each driver.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="jdbc-engine">
              Database engine
            </label>
            <select
              id="jdbc-engine"
              className={`mt-2 ${INPUT_CLASS}`}
              value={dbId}
              onChange={(event) => changeDatabase(event.target.value)}
            >
              {DATABASES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            {selected ? (
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                {selected.note}
              </p>
            ) : null}
          </div>

          {isOracle ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="jdbc-oracle-style">
                Oracle naming style
              </label>
              <select
                id="jdbc-oracle-style"
                className={`mt-2 ${INPUT_CLASS}`}
                value={oracleStyle}
                onChange={(event) => setOracleStyle(event.target.value)}
              >
                {ORACLE_STYLES.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {isH2 ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="jdbc-h2-mode">
                H2 mode
              </label>
              <select
                id="jdbc-h2-mode"
                className={`mt-2 ${INPUT_CLASS}`}
                value={h2Mode}
                onChange={(event) => setH2Mode(event.target.value)}
              >
                {H2_MODES.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {isSqlite ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="jdbc-sqlite-mode">
                SQLite storage
              </label>
              <select
                id="jdbc-sqlite-mode"
                className={`mt-2 ${INPUT_CLASS}`}
                value={sqliteMode}
                onChange={(event) => setSqliteMode(event.target.value)}
              >
                {SQLITE_MODES.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {showHost ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="jdbc-host">
                Host
              </label>
              <input
                id="jdbc-host"
                className={`mt-2 ${INPUT_CLASS} font-mono text-sm`}
                type="text"
                autoComplete="off"
                spellCheck={false}
                placeholder="db.internal"
                value={host}
                onChange={(event) => setHost(event.target.value)}
              />
            </div>
          ) : null}

          {showPort ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="jdbc-port">
                Port (blank = {selected?.defaultPort})
              </label>
              <input
                id="jdbc-port"
                className={`mt-2 ${INPUT_CLASS} font-mono text-sm`}
                type="number"
                inputMode="numeric"
                min={MIN_PORT}
                max={MAX_PORT}
                step="1"
                placeholder={String(selected?.defaultPort ?? "")}
                value={port}
                onChange={(event) => setPort(event.target.value)}
              />
            </div>
          ) : null}

          {isSqlServer ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="jdbc-instance">
                Named instance (optional, replaces the port)
              </label>
              <input
                id="jdbc-instance"
                className={`mt-2 ${INPUT_CLASS} font-mono text-sm`}
                type="text"
                autoComplete="off"
                spellCheck={false}
                placeholder="SQLEXPRESS"
                value={instance}
                onChange={(event) => setInstance(event.target.value)}
              />
            </div>
          ) : null}

          {showDatabase ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="jdbc-database">
                {databaseLabel}
              </label>
              <input
                id="jdbc-database"
                className={`mt-2 ${INPUT_CLASS} font-mono text-sm`}
                type="text"
                autoComplete="off"
                spellCheck={false}
                placeholder={selected?.defaultDatabase ?? ""}
                value={database}
                onChange={(event) => setDatabase(event.target.value)}
              />
            </div>
          ) : null}

          {showUser ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="jdbc-user">
                User name (optional)
              </label>
              <input
                id="jdbc-user"
                className={`mt-2 ${INPUT_CLASS} font-mono text-sm`}
                type="text"
                autoComplete="off"
                spellCheck={false}
                placeholder="app_user"
                value={user}
                onChange={(event) => setUser(event.target.value)}
              />
            </div>
          ) : null}

          <div>
            <label className={LABEL_CLASS} htmlFor="jdbc-param-key">
              Extra property name
            </label>
            <input
              id="jdbc-param-key"
              className={`mt-2 ${INPUT_CLASS} font-mono text-sm`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="ApplicationName"
              value={paramKey}
              onChange={(event) => setParamKey(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="jdbc-param-value">
              Extra property value
            </label>
            <input
              id="jdbc-param-value"
              className={`mt-2 ${INPUT_CLASS} font-mono text-sm`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="billing-service"
              value={paramValue}
              onChange={(event) => setParamValue(event.target.value)}
            />
          </div>

          {showTls ? (
            <div className="sm:col-span-2">
              <label
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus-within:border-[var(--primary)] focus-within:ring-[3px] focus-within:ring-[var(--primary)]/25"
                htmlFor="jdbc-tls"
              >
                <input
                  id="jdbc-tls"
                  type="checkbox"
                  className="h-5 w-5 accent-[var(--primary)] focus:outline-none"
                  checked={tls}
                  onChange={(event) => setTls(event.target.checked)}
                />
                <span>Require an encrypted connection (adds the vendor&apos;s TLS properties)</span>
              </label>
            </div>
          ) : null}
        </div>
        <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
          Never put a password in the URL. Everything here stays in your browser — pass the
          password to <code>DriverManager.getConnection(url, user, password)</code> from an
          environment variable or secret store instead.
        </p>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              JDBC URL
            </p>
            <p className="mt-1 font-mono text-lg leading-7 font-semibold break-all text-[var(--primary)] sm:text-xl">
              {hasError ? DASH : result.url}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText(result.url, "url")}
              disabled={hasError}
              aria-label="Copy the generated JDBC URL"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "url" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "url" ? "Copied!" : "Copy URL"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the builder to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-mono font-semibold break-all">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.warnings.length ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-sm font-semibold">Things to watch</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6">
            {result.warnings.map((warning) => (
              <li key={warning} className="flex gap-2 text-[var(--muted-foreground)]">
                <TriangleAlert
                  className="mt-1 h-4 w-4 shrink-0 text-[var(--primary)]"
                  aria-hidden="true"
                />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!hasError ? (
        <section className="mt-6 grid gap-4">
          {snippets.map(([label, code]) => (
            <div key={label} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">{label}</h2>
                <button
                  type="button"
                  onClick={() => copyText(code, label)}
                  aria-label={`Copy the ${label} snippet`}
                  className={GHOST_BTN}
                >
                  {copied === label ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied === label ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3 text-xs leading-6">
                <code className="font-mono">{code}</code>
              </pre>
            </div>
          ))}
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-sm font-semibold">Driver reference</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[38rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Engine
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Default port
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Driver class
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Separator
                </th>
              </tr>
            </thead>
            <tbody>
              {DATABASES.map((entry) => (
                <tr key={entry.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2.5 pr-3 font-semibold">{entry.label}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs">
                    {entry.defaultPort === null ? "n/a" : entry.defaultPort}
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-xs break-all">{entry.driverClass}</td>
                  <td className="py-2.5 font-mono text-xs">
                    {entry.paramStyle === "query"
                      ? "? &"
                      : entry.paramStyle === "semicolon"
                        ? ";"
                        : "Properties"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        URL shapes, default ports and driver class names follow each vendor&apos;s current JDBC
        documentation. Dependency versions are the latest stable releases at the time of writing —
        check your build tool before pinning.
      </p>
    </main>
  );
}
