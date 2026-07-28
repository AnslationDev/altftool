"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Globe, Loader2, RotateCcw, Search } from "lucide-react";

import {
  domainTimeline,
  formatRdapDate,
  normaliseDomain,
  parseRdapDomain,
  RDAP_BOOTSTRAP_BASE,
  rdapUrlFor,
  recordToText,
  STATUS_MEANINGS,
} from "../lib";

const DEFAULTS = { input: "example.com", server: RDAP_BOOTSTRAP_BASE };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] py-2 last:border-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="max-w-[60%] text-right text-sm font-semibold break-words text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

export default function ToolHome() {
  const [input, setInput] = useState(DEFAULTS.input);
  const [server, setServer] = useState(DEFAULTS.server);
  const [record, setRecord] = useState(null);
  const [fetchedAtIso, setFetchedAtIso] = useState(null);
  const [lookupError, setLookupError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const cleaned = useMemo(() => normaliseDomain(input), [input]);
  const target = useMemo(() => rdapUrlFor(input, server), [input, server]);

  const timeline = useMemo(() => {
    if (!record || record.error || !fetchedAtIso) return null;
    return domainTimeline({ registrationIso: record.registrationIso, expiryIso: record.expiryIso, asOfIso: fetchedAtIso });
  }, [record, fetchedAtIso]);

  const inputError = cleaned.error || target.error || null;
  const error = inputError || lookupError || null;

  async function lookup(event) {
    if (event) event.preventDefault();
    if (inputError) return;
    setLoading(true);
    setLookupError("");
    setRecord(null);
    try {
      const response = await fetch(target.url, { headers: { Accept: "application/rdap+json" } });
      const text = await response.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }
      if (response.status === 404) {
        setLookupError(`No registration record for ${cleaned.domain} — the RDAP server returned 404, which usually means the domain is not registered.`);
        return;
      }
      if (response.status === 429) {
        setLookupError("The RDAP server is rate-limiting this address. Wait a minute and try again.");
        return;
      }
      if (!response.ok && !json) {
        setLookupError(`The RDAP server replied with HTTP ${response.status}.`);
        return;
      }
      const parsed = parseRdapDomain(json);
      if (parsed.error) {
        setLookupError(parsed.error);
        return;
      }
      setRecord(parsed);
      setFetchedAtIso(new Date().toISOString());
    } catch {
      setLookupError(
        "The lookup could not reach the RDAP server. Some registries do not send the CORS headers a browser needs — try the registry's own RDAP address in the advanced field, or check your connection.",
      );
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setInput(DEFAULTS.input);
    setServer(DEFAULTS.server);
    setRecord(null);
    setFetchedAtIso(null);
    setLookupError("");
    setCopied(false);
  }

  async function copyResult() {
    if (!record || record.error) return;
    try {
      await navigator.clipboard.writeText(recordToText(record, timeline));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Globe className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          WHOIS Lookup
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Queries the authoritative RDAP server for the TLD through the IANA bootstrap service, then explains every field.
        </p>
      </header>

      <form className="grid gap-4" onSubmit={lookup}>
        <div>
          <label className={LABEL_CLASS} htmlFor="wl-domain">
            Domain name
          </label>
          <input id="wl-domain" className={`mt-1 ${INPUT_CLASS}`} value={input} onChange={(e) => setInput(e.target.value)} placeholder="example.com" autoComplete="off" spellCheck={false} />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="wl-server">
            RDAP server (advanced — leave as the bootstrap unless a registry blocks it)
          </label>
          <input id="wl-server" className={`mt-1 ${INPUT_CLASS}`} value={server} onChange={(e) => setServer(e.target.value)} spellCheck={false} />
        </div>

        {inputError ? (
          <p className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
            {inputError}
          </p>
        ) : (
          <dl className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <Row label="Domain to query" value={cleaned.domain} />
            <Row label="Top-level domain" value={`.${cleaned.tld}`} />
            <Row label="RDAP request URL" value={target.url} />
          </dl>
        )}

        <div className="flex flex-wrap gap-3">
          <button type="submit" className={PRIMARY_BTN} disabled={loading || Boolean(inputError)} aria-label="Look up this domain's registration record">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
            {loading ? "Looking up…" : "Look up"}
          </button>
          <button type="button" className={PRIMARY_BTN} onClick={copyResult} disabled={!record} aria-label="Copy the registration record to the clipboard">
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset the lookup form">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </form>

      {lookupError ? (
        <p className="mt-5 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
          {lookupError}
        </p>
      ) : null}

      {record && !error ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <p className="text-sm text-[var(--muted-foreground)]">Registered with</p>
            <p className="text-3xl font-bold tracking-tight break-words text-[var(--foreground)]">{record.registrar ?? "Not disclosed"}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{record.domain}</p>
            <dl className="mt-4">
              <Row label="Created" value={formatRdapDate(record.registrationIso) ?? DASH} />
              <Row label="Expires" value={formatRdapDate(record.expiryIso) ?? DASH} />
              <Row label="Last changed" value={formatRdapDate(record.lastChangedIso) ?? DASH} />
              <Row label="Domain age" value={timeline && timeline.ageDays !== null ? `${NUM.format(timeline.ageDays)} days (${NUM1.format(timeline.ageYears)} years)` : DASH} />
              <Row
                label="Days to expiry"
                value={
                  timeline && timeline.daysToExpiry !== null
                    ? timeline.expired
                      ? `Expired ${NUM.format(Math.abs(timeline.daysToExpiry))} days ago`
                      : NUM.format(timeline.daysToExpiry)
                    : DASH
                }
              />
              <Row label="Registry handle" value={record.handle ?? DASH} />
              <Row label="IANA registrar ID" value={record.registrarIanaId ?? DASH} />
              <Row label="DNSSEC" value={record.dnssecSigned === null ? DASH : record.dnssecSigned ? "Signed" : "Unsigned"} />
              <Row label="Registrar abuse contact" value={record.abuseEmail ?? DASH} />
              <Row label="Registrant" value={record.registrant ?? "Redacted for privacy"} />
            </dl>
            {timeline && timeline.expiringSoon ? (
              <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
                This domain expires within 30 days.
              </p>
            ) : null}
          </div>

          <div className="grid gap-4">
            <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Status codes</h2>
              {record.statuses.length === 0 ? (
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">The registry returned no status codes.</p>
              ) : (
                <ul className="mt-2 grid gap-2">
                  {record.statuses.map((status) => (
                    <li key={status.code} className="rounded-md border border-[var(--border)] px-3 py-2">
                      <p className="font-mono text-sm text-[var(--foreground)]">{status.code}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{status.meaning}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Nameservers</h2>
              {record.nameservers.length === 0 ? (
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">No nameservers are delegated — the domain will not resolve.</p>
              ) : (
                <ul className="mt-2 grid gap-1">
                  {record.nameservers.map((ns) => (
                    <li key={ns} className="font-mono text-sm break-all text-[var(--foreground)]">
                      {ns}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">EPP status code reference</h2>
        <div className="mt-2 overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-[var(--card)] text-left text-[var(--muted-foreground)]">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">Code</th>
                <th scope="col" className="px-4 py-2 font-medium">What it means</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(STATUS_MEANINGS).map(([code, meaning]) => (
                <tr key={code} className="border-t border-[var(--border)]">
                  <td className="px-4 py-2 font-mono text-[var(--foreground)]">{code}</td>
                  <td className="px-4 py-2 text-[var(--muted-foreground)]">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Registrant names and addresses are usually redacted under data-protection rules, so most public records show only the registrar, the dates, the
          nameservers and the status codes.
        </p>
      </section>
    </div>
  );
}
