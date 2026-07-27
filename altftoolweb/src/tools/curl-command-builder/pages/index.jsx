"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Terminal } from "lucide-react";
import { AUTH_TYPES, BODY_TYPES, HTTP_VERSIONS, METHODS, buildCurlCommand } from "../lib";

const DEFAULTS = {
  url: "https://api.example.com/v1/users",
  method: "POST",
  headerLines: "Accept: application/json",
  queryLines: "",
  authType: "bearer",
  username: "",
  password: "",
  token: "$API_TOKEN",
  apiKeyHeader: "X-API-Key",
  apiKeyValue: "",
  bodyType: "json",
  body: '{\n  "name": "Ada Lovelace",\n  "role": "admin"\n}',
  formLines: "field=value",
  bodyFilePath: "./payload.json",
  followRedirects: true,
  insecure: false,
  silent: false,
  showErrors: false,
  includeHeaders: false,
  verbose: false,
  compressed: true,
  outputFile: "",
  remoteName: false,
  maxTime: "30",
  connectTimeout: "5",
  retries: "0",
  proxy: "",
  httpVersion: "default",
  cookieJar: "",
  writeOutStatus: false,
  multiline: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)]";

export default function ToolHome() {
  const [state, setState] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const update = (key) => (value) => setState((prev) => ({ ...prev, [key]: value }));
  const onText = (key) => (event) => update(key)(event.target.value);
  const onCheck = (key) => (event) => update(key)(event.target.checked);

  const result = useMemo(() => buildCurlCommand(state), [state]);

  const copyResult = async () => {
    if (!result.command) return;
    try {
      await navigator.clipboard.writeText(result.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setState(DEFAULTS);
    setCopied(false);
  };

  const showBodyText = state.bodyType === "json" || state.bodyType === "raw";
  const showFormFields = state.bodyType === "form" || state.bodyType === "multipart";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Terminal className="h-4 w-4" aria-hidden="true" />
          Shell tooling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Curl Command Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe the request and get a correct curl command back, with shell-safe quoting, an
          explanation of every flag, and warnings about the mistakes that silently break API calls.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="curl-url">
              Request URL
            </label>
            <input
              id="curl-url"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              value={state.url}
              onChange={onText("url")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="curl-method">
              Method
            </label>
            <select id="curl-method" className={`mt-2 ${INPUT_CLASS}`} value={state.method} onChange={onText("method")}>
              {METHODS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="curl-httpversion">
              HTTP version
            </label>
            <select
              id="curl-httpversion"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.httpVersion}
              onChange={onText("httpVersion")}
            >
              {HTTP_VERSIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="curl-query">
              Query parameters (key=value, one per line)
            </label>
            <textarea
              id="curl-query"
              className={`mt-2 ${AREA_CLASS}`}
              rows={2}
              spellCheck={false}
              value={state.queryLines}
              onChange={onText("queryLines")}
            />
            <p className={HINT_CLASS}>Values are percent-encoded for you before they are appended.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="curl-headers">
              Extra headers (Name: value, one per line)
            </label>
            <textarea
              id="curl-headers"
              className={`mt-2 ${AREA_CLASS}`}
              rows={2}
              spellCheck={false}
              value={state.headerLines}
              onChange={onText("headerLines")}
            />
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Authentication</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="curl-auth">
              Auth type
            </label>
            <select id="curl-auth" className={`mt-2 ${INPUT_CLASS}`} value={state.authType} onChange={onText("authType")}>
              {AUTH_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {state.authType === "basic" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="curl-user">
                  Username
                </label>
                <input
                  id="curl-user"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  autoComplete="off"
                  value={state.username}
                  onChange={onText("username")}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="curl-pass">
                  Password (leave blank to be prompted)
                </label>
                <input
                  id="curl-pass"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  autoComplete="off"
                  value={state.password}
                  onChange={onText("password")}
                />
              </div>
            </>
          ) : null}
          {state.authType === "bearer" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="curl-token">
                Bearer token
              </label>
              <input
                id="curl-token"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={state.token}
                onChange={onText("token")}
              />
              <p className={HINT_CLASS}>Point at a shell variable such as $API_TOKEN to keep it out of history.</p>
            </div>
          ) : null}
          {state.authType === "apikey" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="curl-keyheader">
                  Header name
                </label>
                <input
                  id="curl-keyheader"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={state.apiKeyHeader}
                  onChange={onText("apiKeyHeader")}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="curl-keyvalue">
                  Header value
                </label>
                <input
                  id="curl-keyvalue"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={state.apiKeyValue}
                  onChange={onText("apiKeyValue")}
                />
              </div>
            </>
          ) : null}
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Request body</h2>
        <div className="mt-3 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="curl-bodytype">
              Body type
            </label>
            <select id="curl-bodytype" className={`mt-2 ${INPUT_CLASS}`} value={state.bodyType} onChange={onText("bodyType")}>
              {BODY_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {showBodyText ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="curl-body">
                Body content
              </label>
              <textarea
                id="curl-body"
                className={`mt-2 ${AREA_CLASS}`}
                rows={5}
                spellCheck={false}
                value={state.body}
                onChange={onText("body")}
              />
            </div>
          ) : null}
          {showFormFields ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="curl-form">
                Form fields (key=value, one per line)
              </label>
              <textarea
                id="curl-form"
                className={`mt-2 ${AREA_CLASS}`}
                rows={3}
                spellCheck={false}
                value={state.formLines}
                onChange={onText("formLines")}
              />
              <p className={HINT_CLASS}>For a multipart upload write file=@/path/to/file.png.</p>
            </div>
          ) : null}
          {state.bodyType === "file" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="curl-bodyfile">
                Path to body file
              </label>
              <input
                id="curl-bodyfile"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={state.bodyFilePath}
                onChange={onText("bodyFilePath")}
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Transfer and output</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="curl-connect">
              Connect timeout (seconds)
            </label>
            <input
              id="curl-connect"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={state.connectTimeout}
              onChange={onText("connectTimeout")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="curl-maxtime">
              Max total time (seconds)
            </label>
            <input
              id="curl-maxtime"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={state.maxTime}
              onChange={onText("maxTime")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="curl-retries">
              Retries
            </label>
            <input
              id="curl-retries"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={state.retries}
              onChange={onText("retries")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="curl-proxy">
              Proxy (optional)
            </label>
            <input
              id="curl-proxy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="http://127.0.0.1:8080"
              value={state.proxy}
              onChange={onText("proxy")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="curl-output">
              Save response to file (-o)
            </label>
            <input
              id="curl-output"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={state.outputFile}
              onChange={onText("outputFile")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="curl-cookies">
              Cookie jar file (optional)
            </label>
            <input
              id="curl-cookies"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={state.cookieJar}
              onChange={onText("cookieJar")}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {[
            ["curl-follow", "Follow redirects (-L)", "followRedirects"],
            ["curl-compressed", "Accept compression (--compressed)", "compressed"],
            ["curl-silent", "Silent (-s)", "silent"],
            ["curl-showerr", "Show errors when silent (-S)", "showErrors"],
            ["curl-include", "Include response headers (-i)", "includeHeaders"],
            ["curl-verbose", "Verbose (-v)", "verbose"],
            ["curl-remote", "Save as remote name (-O)", "remoteName"],
            ["curl-writeout", "Print status and timing (-w)", "writeOutStatus"],
            ["curl-insecure", "Skip TLS verification (-k)", "insecure"],
            ["curl-multiline", "Wrap onto multiple lines", "multiline"],
          ].map(([id, label, key]) => (
            <label key={id} htmlFor={id} className={CHECK_CLASS}>
              <input
                id={id}
                type="checkbox"
                className="accent-[var(--primary)]"
                checked={Boolean(state[key])}
                onChange={onCheck(key)}
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Your curl command
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated curl command"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy command"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {result.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : null}

        <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-4">
          <code className="block whitespace-pre font-mono text-sm font-semibold text-[var(--primary)]">
            {result.error ? "—" : result.command}
          </code>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Method sent</dt>
            <dd className="text-right font-semibold">{result.error ? "—" : result.method}</dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="shrink-0 text-[var(--muted-foreground)]">Final URL</dt>
            <dd className="break-all text-right font-semibold">{result.error ? "—" : result.url}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Custom headers</dt>
            <dd className="text-right font-semibold">{result.error ? "—" : result.headerCount}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Body</dt>
            <dd className="text-right font-semibold">{result.error ? "—" : result.bodyType}</dd>
          </div>
        </dl>
      </section>

      {!result.error && result.flags.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What each flag does</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Flag</th>
                  <th scope="col" className="py-2 font-semibold">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {result.flags.map(([flag, meaning]) => (
                  <tr key={`${flag}-${meaning}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-mono font-semibold text-[var(--primary)]">{flag}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!result.error && result.warnings.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Things to check</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--primary)]">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything is generated in your browser — no request is ever sent from this page, and nothing
        you type here leaves the device.
      </p>
    </main>
  );
}
