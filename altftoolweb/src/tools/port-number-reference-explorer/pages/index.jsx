"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Network, RotateCcw } from "lucide-react";

import { searchPorts } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US");

const DEFAULTS = { query: "ssh", protocol: "any" };

export default function ToolHome() {
  const [query, setQuery] = useState(DEFAULTS.query);
  const [protocol, setProtocol] = useState(DEFAULTS.protocol);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => searchPorts({ query, protocol }), [query, protocol]);
  const classification = result.classification;
  const classificationError = classification && classification.error;

  const summary = useMemo(() => {
    const lines = result.matches
      .slice(0, 25)
      .map((m) => `${m.port}/${m.protocol}  ${m.service}  —  ${m.description}`);
    return [`Port search: "${query || "all"}" (${result.total} matches)`, ...lines].join("\n");
  }, [result, query]);

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setQuery(DEFAULTS.query);
    setProtocol(DEFAULTS.protocol);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Network className="h-4 w-4" aria-hidden="true" />
          Networking reference
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Port Number Reference Explorer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Search well-known and registered TCP/UDP ports by number, service name or keyword. Range
          classification follows RFC 6335: 0-1023 well-known, 1024-49151 registered, 49152-65535
          dynamic.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pnre-query">
              Port number or service name
            </label>
            <input
              id="pnre-query"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="e.g. 443, postgres, mail"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pnre-protocol">
              Transport protocol
            </label>
            <select
              id="pnre-protocol"
              className={`mt-2 ${INPUT_CLASS}`}
              value={protocol}
              onChange={(event) => setProtocol(event.target.value)}
            >
              <option value="any">Any</option>
              <option value="tcp">TCP</option>
              <option value="udp">UDP</option>
            </select>
          </div>
        </div>
      </section>

      {classificationError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {classification.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Matching ports
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {classificationError ? "—" : NUM.format(result.total)}
            </p>
            {classification && !classificationError ? (
              <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
                Port {NUM.format(classification.port)} is a {classification.label.toLowerCase()}.{" "}
                {classification.note}
              </p>
            ) : (
              <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
                {query.trim() === ""
                  ? "Showing the full reference table."
                  : "Matches on service name and description."}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={result.total === 0}
              aria-label="Copy the matching port list"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy list"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset search" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {result.total === 0 && !classificationError ? (
          <p className="mt-5 text-sm text-[var(--muted-foreground)]">
            No entry in the reference table matches. It may be an unassigned port, or a private
            application default — check the IANA registry for the authoritative answer.
          </p>
        ) : null}

        {result.total > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Port
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Protocol
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Service
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Description
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.matches.map((entry) => (
                  <tr
                    key={`${entry.port}-${entry.service}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3 font-semibold">{entry.port}</td>
                    <td className="py-2 pr-3 uppercase">{entry.protocol}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{entry.service}</td>
                    <td className="py-2 pr-3">{entry.description}</td>
                    <td className="py-2 text-xs text-[var(--muted-foreground)]">
                      {entry.source === "iana" ? "IANA-assigned" : "Conventional"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Curated reference of the most commonly encountered ports. The authoritative source is the
        IANA Service Name and Transport Protocol Port Number Registry; conventional entries are
        widely used defaults that are not formally assigned to that product.
      </p>
    </main>
  );
}
