"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Server } from "lucide-react";

import { HSTS_DEFAULT_MAX_AGE, MODES, buildCaddyfile } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DASH = "—";

const DEFAULTS = {
  siteAddress: "example.com",
  mode: "reverse_proxy",
  upstream: "localhost:3000",
  root: "/srv/mysite",
  spa: false,
  compress: true,
  securityHeaders: true,
  hsts: false,
  hstsMaxAge: String(HSTS_DEFAULT_MAX_AGE),
  wwwRedirect: false,
  logging: true,
};

export default function ToolHome() {
  const [siteAddress, setSiteAddress] = useState(DEFAULTS.siteAddress);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [upstream, setUpstream] = useState(DEFAULTS.upstream);
  const [root, setRoot] = useState(DEFAULTS.root);
  const [spa, setSpa] = useState(DEFAULTS.spa);
  const [compress, setCompress] = useState(DEFAULTS.compress);
  const [securityHeaders, setSecurityHeaders] = useState(DEFAULTS.securityHeaders);
  const [hsts, setHsts] = useState(DEFAULTS.hsts);
  const [hstsMaxAge, setHstsMaxAge] = useState(DEFAULTS.hstsMaxAge);
  const [wwwRedirect, setWwwRedirect] = useState(DEFAULTS.wwwRedirect);
  const [logging, setLogging] = useState(DEFAULTS.logging);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildCaddyfile({
        siteAddress,
        mode,
        upstream,
        root,
        spa,
        compress,
        securityHeaders,
        hsts,
        hstsMaxAge: hstsMaxAge.trim() === "" ? Number.NaN : Number(hstsMaxAge),
        wwwRedirect,
        logging,
      }),
    [
      siteAddress,
      mode,
      upstream,
      root,
      spa,
      compress,
      securityHeaders,
      hsts,
      hstsMaxAge,
      wwwRedirect,
      logging,
    ],
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
    setSiteAddress(DEFAULTS.siteAddress);
    setMode(DEFAULTS.mode);
    setUpstream(DEFAULTS.upstream);
    setRoot(DEFAULTS.root);
    setSpa(DEFAULTS.spa);
    setCompress(DEFAULTS.compress);
    setSecurityHeaders(DEFAULTS.securityHeaders);
    setHsts(DEFAULTS.hsts);
    setHstsMaxAge(DEFAULTS.hstsMaxAge);
    setWwwRedirect(DEFAULTS.wwwRedirect);
    setLogging(DEFAULTS.logging);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Server className="h-4 w-4" aria-hidden="true" />
          Web server configs
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Caddyfile Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Assemble a Caddy v2 site block — reverse proxy or static file server — with
          compression, security headers, optional HSTS, www redirect and access logging.
          Hostname addresses get automatic HTTPS from Caddy itself.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cf-address">
              Site address
            </label>
            <input
              id="cf-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={siteAddress}
              onChange={(event) => setSiteAddress(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              example.com, app.example.com, or :8080 for plain HTTP on a port.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cf-mode">
              Serve mode
            </label>
            <select
              id="cf-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              {MODES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {mode === "reverse_proxy" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="cf-upstream">
                Upstream (app server)
              </label>
              <input
                id="cf-upstream"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={upstream}
                onChange={(event) => setUpstream(event.target.value)}
              />
            </div>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="cf-root">
                  Web root
                </label>
                <input
                  id="cf-root"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={root}
                  onChange={(event) => setRoot(event.target.value)}
                />
              </div>
              <div className="flex items-end">
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="cf-spa">
                  <input
                    id="cf-spa"
                    type="checkbox"
                    className={CHECK_CLASS}
                    checked={spa}
                    onChange={(event) => setSpa(event.target.checked)}
                  />
                  SPA fallback — try_files {"{path}"} /index.html
                </label>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 grid gap-1 sm:grid-cols-2">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="cf-compress">
            <input
              id="cf-compress"
              type="checkbox"
              className={CHECK_CLASS}
              checked={compress}
              onChange={(event) => setCompress(event.target.checked)}
            />
            encode zstd gzip — response compression
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="cf-sec">
            <input
              id="cf-sec"
              type="checkbox"
              className={CHECK_CLASS}
              checked={securityHeaders}
              onChange={(event) => setSecurityHeaders(event.target.checked)}
            />
            Baseline security headers (nosniff, frame, referrer)
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="cf-www">
            <input
              id="cf-www"
              type="checkbox"
              className={CHECK_CLASS}
              checked={wwwRedirect}
              onChange={(event) => setWwwRedirect(event.target.checked)}
            />
            Redirect www.{"<domain>"} to the bare domain
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="cf-log">
            <input
              id="cf-log"
              type="checkbox"
              className={CHECK_CLASS}
              checked={logging}
              onChange={(event) => setLogging(event.target.checked)}
            />
            Access log to /var/log/caddy/
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="cf-hsts">
            <input
              id="cf-hsts"
              type="checkbox"
              className={CHECK_CLASS}
              checked={hsts}
              onChange={(event) => setHsts(event.target.checked)}
            />
            HSTS — Strict-Transport-Security
          </label>
          {hsts ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="cf-hsts-age">
                HSTS max-age (seconds)
              </label>
              <input
                id="cf-hsts-age"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                step="86400"
                value={hstsMaxAge}
                onChange={(event) => setHstsMaxAge(event.target.value)}
              />
            </div>
          ) : null}
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Directives in Caddyfile
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.directiveCount}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated Caddyfile"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy Caddyfile"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all options to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg bg-[var(--muted)] p-4">
          <pre className="whitespace-pre text-xs leading-5 text-[var(--foreground)]">
            <code>{hasError ? DASH : result.config}</code>
          </pre>
        </div>

        {!hasError && result.notes.length > 0 ? (
          <ul className="mt-4 space-y-1 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--primary)]" />
                {note}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Save as Caddyfile, validate with caddy validate, then run caddy run or reload with
        caddy reload. DNS for the hostname must point at this server before automatic HTTPS
        can issue a certificate.
      </p>
    </main>
  );
}
