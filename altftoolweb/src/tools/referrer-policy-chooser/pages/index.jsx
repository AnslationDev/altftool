"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Link2, RotateCcw } from "lucide-react";

import {
  DECLARATION_SITES,
  POLICIES,
  compareReferrerPolicies,
  formatComparison,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const DEFAULTS = {
  source: "https://app.example.com/reset-password?token=a1b2c3&email=priya%40example.com",
  destination: "https://cdn.partner-analytics.net/collect.js",
  policy: "strict-origin-when-cross-origin",
};

const PRESETS = [
  {
    id: "third-party",
    label: "Third-party script",
    source: DEFAULTS.source,
    destination: DEFAULTS.destination,
  },
  {
    id: "downgrade",
    label: "HTTPS to HTTP",
    source: "https://app.example.com/invoice/8842?sig=deadbeef",
    destination: "http://legacy.partner.example/ingest",
  },
  {
    id: "internal",
    label: "Same-origin link",
    source: "https://app.example.com/reports/q3?userId=4471",
    destination: "https://app.example.com/settings",
  },
  {
    id: "outbound",
    label: "Outbound user link",
    source: "https://forum.example.com/thread/9912?invite=xyz",
    destination: "https://unrelated-site.example/page",
  },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [source, setSource] = useState(DEFAULTS.source);
  const [destination, setDestination] = useState(DEFAULTS.destination);
  const [policy, setPolicy] = useState(DEFAULTS.policy);
  const [copiedId, setCopiedId] = useState("");

  const result = useMemo(
    () => compareReferrerPolicies({ source, destination }),
    [source, destination],
  );
  const comparison = useMemo(() => formatComparison(result), [result]);
  const hasError = Boolean(result.error);
  const selected = hasError ? null : result.rows.find((row) => row.id === policy) || result.rows[0];

  const reset = () => {
    setSource(DEFAULTS.source);
    setDestination(DEFAULTS.destination);
    setPolicy(DEFAULTS.policy);
    setCopiedId("");
  };

  const copy = async (id, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      setCopiedId("");
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Link2 className="h-4 w-4" aria-hidden="true" />
          Web security config
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Referrer Policy Chooser</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter a page and where it links to, and see the exact Referer header each of the eight
          Referrer-Policy values would send — computed with the W3C algorithm, including the
          downgrade and same-origin rules.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="ref-source">
              Page the request starts from
            </label>
            <input
              id="ref-source"
              className={`mt-2 ${INPUT_CLASS}`}
              type="url"
              autoComplete="off"
              spellCheck={false}
              value={source}
              onChange={(event) => setSource(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ref-dest">
              Destination URL
            </label>
            <input
              id="ref-dest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="url"
              autoComplete="off"
              spellCheck={false}
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setSource(preset.source);
                setDestination(preset.destination);
              }}
              className={CHIP_BTN}
            >
              {preset.label}
            </button>
          ))}
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ref-policy">
              Policy to inspect
            </label>
            <select
              id="ref-policy"
              className={`mt-2 ${INPUT_CLASS}`}
              value={policy}
              onChange={(event) => setPolicy(event.target.value)}
            >
              {POLICIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                  {item.isDefault ? " (browser default)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Referer header sent
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? "—" : selected.kindLabel}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the URLs above." : selected.reason}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("table", comparison)}
              aria-label="Copy the full policy comparison"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copiedId === "table" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedId === "table" ? "Copied!" : "Copy comparison"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the chooser" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
            <code className="block whitespace-pre text-sm">
              {selected.value ? `Referer: ${selected.value}` : "(no Referer header)"}
            </code>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Same origin", hasError ? "—" : result.sameOrigin ? "Yes" : "No"],
            ["Secure-to-insecure downgrade", hasError ? "—" : result.downgrade ? "Yes" : "No"],
            [
              "Query keys that look sensitive",
              hasError ? "—" : result.leakedParams.length > 0 ? result.leakedParams.join(", ") : "None spotted",
            ],
            ["Policies that would send the full URL", hasError ? "—" : NUM.format(result.fullLeakCount)],
            ["Browser default result", hasError ? "—" : result.defaultRow.kindLabel],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && selected.exposesParams.length > 0 && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            Under this policy the destination receives {selected.exposesParams.join(", ")} in the
            Referer header. Move secrets out of the query string — a header is logged by every proxy
            and analytics tool on the path.
          </p>
        )}

        {!hasError && result.hasCredentials && (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            The source URL contains a username or password. Browsers always strip credentials from
            the referrer, but URLs like this leak through history, logs and bookmarks anyway.
          </p>
        )}
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">All eight policies for this navigation</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Policy</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Sends</th>
                    <th scope="col" className="py-2 font-semibold">Referer value</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">
                        {row.label}
                        {row.isDefault && (
                          <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
                            default
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-3">{row.kindLabel}</td>
                      <td className="py-2">
                        <code className="text-xs">{row.value || "(nothing)"}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="mt-5 space-y-3">
              {result.rows.map((row) => (
                <li key={`${row.id}-note`} className="rounded-lg border border-[var(--border)] p-3">
                  <p className="text-sm font-semibold">{row.label}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{row.summary}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    <span className="font-semibold text-[var(--foreground)]">Trade-off: </span>
                    {row.tradeoff}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Where to declare {selected.label}</h2>
            <ul className="mt-4 space-y-4">
              {DECLARATION_SITES.map((site) => {
                const snippet = site.template(selected.id);
                return (
                  <li key={site.id}>
                    <p className="text-sm font-semibold">{site.label}</p>
                    <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                      <code className="block whitespace-pre text-sm">{snippet}</code>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{site.note}</p>
                    <button
                      type="button"
                      onClick={() => copy(site.id, snippet)}
                      aria-label={`Copy the ${site.label} snippet`}
                      className={`mt-2 ${GHOST_BTN}`}
                    >
                      {copiedId === site.id ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      )}
                      {copiedId === site.id ? "Copied!" : "Copy"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Referrer policy limits what the browser sends; it is not a substitute for keeping secrets
        out of URLs. Tokens in a query string end up in server logs, browser history, bookmarks and
        anything the user pastes, whatever policy you set.
      </p>
    </main>
  );
}
