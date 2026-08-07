"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Server, TriangleAlert } from "lucide-react";

import { MAX_INPUT_LENGTH, convertHtaccess } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const SAMPLE = `RewriteEngine On
RewriteBase /

RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]

RewriteRule ^index\\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]

Redirect 301 /old-page /new-page
ErrorDocument 404 /404.html
DirectoryIndex index.php index.html
Options -Indexes
Header always set X-Frame-Options "SAMEORIGIN"
ExpiresByType image/jpeg "access plus 1 year"

<FilesMatch "\\.(env|log|ini)$">
Require all denied
</FilesMatch>`;

const NUM = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [source, setSource] = useState(SAMPLE);
  const [wrapServer, setWrapServer] = useState(true);
  const [serverName, setServerName] = useState("example.com");
  const [root, setRoot] = useState("/var/www/html");
  const [keepComments, setKeepComments] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => convertHtaccess(source, { wrapServer, serverName, root, keepComments }),
    [source, wrapServer, serverName, root, keepComments],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.config);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSource(SAMPLE);
    setWrapServer(true);
    setServerName("example.com");
    setRoot("/var/www/html");
    setKeepComments(true);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Server className="h-4 w-4" aria-hidden="true" />
          Server config
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          .htaccess to NGINX Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste an Apache .htaccess file and get starter NGINX directives. Rewrite patterns gain the
          leading slash NGINX expects, %&#123;VARIABLES&#125; become $variables, and the !-f / !-d
          front-controller idiom becomes a single try_files.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="htaccess-source">
          Your .htaccess ({NUM.format(source.length)} of {NUM.format(MAX_INPUT_LENGTH)} characters)
        </label>
        <textarea
          id="htaccess-source"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          rows={14}
          spellCheck={false}
          value={source}
          onChange={(event) => setSource(event.target.value)}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="wrap-server"
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
            >
              <input
                id="wrap-server"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={wrapServer}
                onChange={(event) => setWrapServer(event.target.checked)}
              />
              Wrap the output in a server &#123; &#125; block
            </label>
          </div>
          {wrapServer && (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="server-name">
                  server_name
                </label>
                <input
                  id="server-name"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={serverName}
                  onChange={(event) => setServerName(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="server-root">
                  root
                </label>
                <input
                  id="server-root"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={root}
                  onChange={(event) => setRoot(event.target.value)}
                />
              </div>
            </>
          )}
          <div className="sm:col-span-2">
            <label
              htmlFor="keep-comments"
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
            >
              <input
                id="keep-comments"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={keepComments}
                onChange={(event) => setKeepComments(event.target.checked)}
              />
              Carry the original # comments through
            </label>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section
        aria-live="polite"
        role="status"
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Directives converted
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.directiveCount)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Paste an .htaccess file to see the NGINX equivalent."
                : `${NUM.format(result.locationCount)} location block${result.locationCount === 1 ? "" : "s"}, ${NUM.format(result.unsupported.length)} line${result.unsupported.length === 1 ? "" : "s"} left as comments`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated NGINX configuration to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy config"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the sample file" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Directives converted", hasError ? DASH : NUM.format(result.directiveCount)],
            ["Location blocks created", hasError ? DASH : NUM.format(result.locationCount)],
            ["Lines needing manual work", hasError ? DASH : NUM.format(result.unsupported.length)],
            ["Review notes", hasError ? DASH : NUM.format(result.warnings.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-full p-4 font-mono text-xs leading-6 text-[var(--foreground)]">
            {hasError ? DASH : result.config}
          </pre>
        </div>
      </section>

      {!hasError && result.warnings.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <TriangleAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
            Read before you reload
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {warning}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This is a starting point, not a drop-in replacement. NGINX reads its configuration once at
        start-up, so these directives belong in your server or location blocks. Always run{" "}
        <code className="rounded bg-[var(--muted)] px-1 py-0.5 font-mono">nginx -t</code> before
        reloading.
      </p>
    </main>
  );
}
