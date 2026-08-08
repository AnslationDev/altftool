"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, RotateCcw, ShieldCheck } from "lucide-react";

import { RISK_LEVELS, RISK_RUBRIC, explainScopes, formatScopeReport, levelLabel } from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const LEVEL_CHIP = {
  critical: "bg-[var(--danger-soft)] text-[var(--danger)]",
  high: "bg-[var(--warning-soft)] text-[var(--foreground)]",
  medium: "bg-[var(--muted)] text-[var(--foreground)]",
  low: "bg-[var(--success-soft)] text-[var(--success)]",
  unknown: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const STATUS_CHIP = {
  fail: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warn: "bg-[var(--warning-soft)] text-[var(--foreground)]",
  pass: "bg-[var(--success-soft)] text-[var(--success)]",
};

const STATUS_WORD = { fail: "Problem", warn: "Check", pass: "OK" };

const DEFAULT_INPUT =
  "https://accounts.google.com/o/oauth2/v2/auth?client_id=1234.apps.googleusercontent.com&response_type=code&redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&access_type=offline&scope=openid%20email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.readonly";

const SAMPLES = [
  { key: "google", label: "Google consent URL", value: DEFAULT_INPUT },
  {
    key: "github",
    label: "GitHub scope list",
    value: "repo public_repo workflow read:org user:email delete_repo",
  },
  {
    key: "graph",
    label: "Microsoft Graph list",
    value:
      "openid offline_access User.Read Mail.ReadWrite.All Files.Read.All Directory.ReadWrite.All Sites.ReadWrite.All",
  },
  {
    key: "slack",
    label: "Slack scope list",
    value: "channels:read, channels:history, chat:write, files:read, users:read.email",
  },
];

export default function ToolHome() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => explainScopes(input), [input]);
  const report = useMemo(() => formatScopeReport(result), [result]);

  const copyResult = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setInput(DEFAULT_INPUT);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Consent screen review
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">OAuth Scope Explainer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a scope list, or the whole authorization URL from the address bar of a consent screen.
          Every scope is translated into plain language and placed on a published risk rubric, and an
          authorization URL is also checked for PKCE, state and redirect problems. Nothing is sent
          anywhere — the catalogue ships with the page.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="oauth-input">
          Scope list or authorization URL
        </label>
        <textarea
          id="oauth-input"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          rows={6}
          spellCheck="false"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="openid email https://www.googleapis.com/auth/gmail.readonly"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {SAMPLES.map((sample) => (
            <button
              key={sample.key}
              type="button"
              onClick={() => setInput(sample.value)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {sample.label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={copyResult} className={PRIMARY_BTN} disabled={!report}>
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy review"}
          </button>
          <button type="button" onClick={reset} className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {result.error ? (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-xl bg-[var(--danger-soft)] p-4 text-sm leading-6 text-[var(--danger)]"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{result.error}</span>
        </div>
      ) : (
        <div aria-live="polite" aria-atomic="false">
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Summary</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  Scopes requested
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">{result.summary.total}</div>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  Highest level
                </div>
                <div className="mt-1">
                  <span
                    className={`inline-block rounded-md px-2 py-1 text-sm font-semibold ${LEVEL_CHIP[result.summary.highest]}`}
                  >
                    {levelLabel(result.summary.highest)}
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  Not recognised
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">
                  {result.summary.unrecognised}
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              {RISK_LEVELS.map((level) => (
                <span key={level.key} className={`rounded-md px-2 py-1 ${LEVEL_CHIP[level.key]}`}>
                  {level.label}: {result.summary.counts[level.key]}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              {result.summary.recognised} from the built-in catalogue, {result.summary.inferred} read
              from provider naming patterns, {result.summary.unrecognised} not identified.
            </p>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">What each scope grants</h2>
            <div className="mt-4 space-y-3">
              {result.scopes.map((item) => (
                <article
                  key={item.scope}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${LEVEL_CHIP[item.level]}`}
                    >
                      {levelLabel(item.level)}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      {item.provider}
                    </span>
                    {item.source === "pattern" && (
                      <span className="rounded-md bg-[var(--muted)] px-2 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
                        read from naming pattern
                      </span>
                    )}
                  </div>
                  <p className="mt-2 break-all font-mono text-xs text-[var(--muted-foreground)]">
                    {item.scope}
                  </p>
                  <p className="mt-2 text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    {item.description}
                  </p>
                  {item.access !== "unknown" && (
                    <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[var(--muted-foreground)]">
                      <div className="flex gap-1">
                        <dt className="font-semibold">Access:</dt>
                        <dd>{item.access}</dd>
                      </div>
                      <div className="flex gap-1">
                        <dt className="font-semibold">Reach:</dt>
                        <dd>
                          {item.breadth === "org"
                            ? "every account in the organisation"
                            : "your account"}
                        </dd>
                      </div>
                      <div className="flex gap-1">
                        <dt className="font-semibold">Data:</dt>
                        <dd>{item.sensitivity}</dd>
                      </div>
                      {item.destructive && (
                        <div className="flex gap-1">
                          <dt className="font-semibold">Includes:</dt>
                          <dd>permanent deletion or full control</dd>
                        </div>
                      )}
                      {item.narrow && (
                        <div className="flex gap-1">
                          <dt className="font-semibold">Limited to:</dt>
                          <dd>objects this app created or you opened with it</dd>
                        </div>
                      )}
                    </dl>
                  )}
                </article>
              ))}
            </div>
          </section>

          {(result.redundant.length > 0 || result.duplicates.length > 0) && (
            <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <h2 className="text-base font-semibold">Over-collection</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {result.redundant.map((item) => (
                  <li
                    key={`${item.scope}-${item.supersededBy}`}
                    className="rounded-lg bg-[var(--warning-soft)] p-3 text-[var(--foreground)]"
                  >
                    <span className="font-mono text-xs">{item.scope}</span> adds nothing —{" "}
                    <span className="font-mono text-xs">{item.supersededBy}</span> already covers it.
                    Asking for both usually means the scope list was copied rather than chosen.
                  </li>
                ))}
                {result.duplicates.map((item) => (
                  <li key={`dup-${item}`} className="rounded-lg border border-[var(--border)] p-3">
                    <span className="font-mono text-xs">{item}</span> is listed more than once.
                    Duplicates are ignored by the authorization server but they inflate a consent
                    screen.
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.flow && (
            <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <h2 className="text-base font-semibold">The authorization request itself</h2>
              <p className="mt-1 break-all font-mono text-xs text-[var(--muted-foreground)]">
                {result.flow.endpoint}
              </p>
              <ul className="mt-4 space-y-2">
                {result.flow.findings.map((finding) => (
                  <li
                    key={finding.title}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${STATUS_CHIP[finding.status]}`}
                      >
                        {STATUS_WORD[finding.status]}
                      </span>
                      <span className="text-sm font-semibold">{finding.title}</span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                      {finding.detail}
                    </p>
                  </li>
                ))}
              </ul>
              {result.flow.params.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                        <th scope="col" className="py-2 pr-4 font-semibold">
                          Parameter
                        </th>
                        <th scope="col" className="py-2 pr-4 font-semibold">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.flow.params.map((param) => (
                        <tr key={param.key} className="border-b border-[var(--border)] align-top">
                          <td className="py-2 pr-4 font-semibold">{param.label}</td>
                          <td className="break-all py-2 pr-4 font-mono text-xs text-[var(--muted-foreground)]">
                            {param.value || "(empty)"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">How the levels are decided</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              There is no score and no guesswork. Each scope in the catalogue records what the token may
              do, how far it reaches and how sensitive the data is, and these rules turn that into a
              level.
            </p>
            <ul className="mt-3 space-y-1 text-sm leading-6 text-[var(--muted-foreground)]">
              {RISK_RUBRIC.map(([rule, level]) => (
                <li key={rule} className="flex flex-wrap gap-2">
                  <span className="font-mono text-xs">{rule}</span>
                  {level && (
                    <span className="font-semibold text-[var(--foreground)]">
                      → {levelLabel(level)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              A scope that is neither in the catalogue nor recognisable from a provider naming pattern
              gets no level at all, rather than a made-up one. This tool never contacts the provider, so
              it cannot tell you whether an app is trustworthy — only what it is asking for.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
