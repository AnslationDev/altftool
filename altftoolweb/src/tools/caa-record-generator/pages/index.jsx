"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck } from "lucide-react";

import { KNOWN_CAS, buildCaaRecords } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DEFAULTS = {
  domain: "example.com",
  ttl: "3600",
  selectedCAs: ["letsencrypt.org"],
  customCA: "",
  wildcardMode: "same",
  wildcardCAs: "",
  iodef: "",
  critical: false,
};

const DASH = "—";

export default function ToolHome() {
  const [domain, setDomain] = useState(DEFAULTS.domain);
  const [ttl, setTtl] = useState(DEFAULTS.ttl);
  const [selectedCAs, setSelectedCAs] = useState(DEFAULTS.selectedCAs);
  const [customCA, setCustomCA] = useState(DEFAULTS.customCA);
  const [wildcardMode, setWildcardMode] = useState(DEFAULTS.wildcardMode);
  const [wildcardCAs, setWildcardCAs] = useState(DEFAULTS.wildcardCAs);
  const [iodef, setIodef] = useState(DEFAULTS.iodef);
  const [critical, setCritical] = useState(DEFAULTS.critical);
  const [copied, setCopied] = useState(false);

  const issueCAs = useMemo(() => {
    const custom = customCA
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return [...selectedCAs, ...custom];
  }, [selectedCAs, customCA]);

  const result = useMemo(
    () =>
      buildCaaRecords({
        domain,
        ttl: ttl.trim() === "" ? NaN : Number(ttl),
        issueCAs,
        wildcardMode,
        wildcardCAs: wildcardCAs.split(/[\s,]+/).filter(Boolean),
        iodef,
        critical,
      }),
    [domain, ttl, issueCAs, wildcardMode, wildcardCAs, iodef, critical],
  );
  const hasError = Boolean(result.error);

  const toggleCa = (id) => {
    setSelectedCAs((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.zoneLines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setDomain(DEFAULTS.domain);
    setTtl(DEFAULTS.ttl);
    setSelectedCAs(DEFAULTS.selectedCAs);
    setCustomCA(DEFAULTS.customCA);
    setWildcardMode(DEFAULTS.wildcardMode);
    setWildcardCAs(DEFAULTS.wildcardCAs);
    setIodef(DEFAULTS.iodef);
    setCritical(DEFAULTS.critical);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Certificate security
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">CAA Record Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Publish RFC 8659 CAA records to lock certificate issuance to the authorities you actually
          use. Every public CA has been required to obey CAA since September 2017.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="caa-domain">
              Domain
            </label>
            <input
              id="caa-domain"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="example.com"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="caa-ttl">
              TTL (seconds)
            </label>
            <input
              id="caa-ttl"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="60"
              value={ttl}
              onChange={(event) => setTtl(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">
            Certificate authorities allowed to issue (select none to forbid all issuance)
          </legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {KNOWN_CAS.map((ca) => (
              <label
                key={ca.id}
                htmlFor={`caa-ca-${ca.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              >
                <input
                  id={`caa-ca-${ca.id}`}
                  type="checkbox"
                  className={CHECKBOX_CLASS}
                  checked={selectedCAs.includes(ca.id)}
                  onChange={() => toggleCa(ca.id)}
                />
                <span>
                  {ca.label}{" "}
                  <span className="font-mono text-xs text-[var(--muted-foreground)]">({ca.id})</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="caa-custom">
              Other CA identifiers (optional, comma separated)
            </label>
            <input
              id="caa-custom"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="e.g. actalis.it"
              value={customCA}
              onChange={(event) => setCustomCA(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="caa-wildmode">
              Wildcard certificates (issuewild)
            </label>
            <select
              id="caa-wildmode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={wildcardMode}
              onChange={(event) => setWildcardMode(event.target.value)}
            >
              <option value="same">Same CAs as normal certificates</option>
              <option value="custom">Different CA list for wildcards</option>
              <option value="forbid">Forbid wildcard issuance entirely</option>
            </select>
          </div>
          {wildcardMode === "custom" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="caa-wildcas">
                Wildcard CA identifiers (comma separated)
              </label>
              <input
                id="caa-wildcas"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                placeholder="digicert.com"
                value={wildcardCAs}
                onChange={(event) => setWildcardCAs(event.target.value)}
              />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="caa-iodef">
              Violation reports to (iodef, optional)
            </label>
            <input
              id="caa-iodef"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="mailto:security@example.com"
              value={iodef}
              onChange={(event) => setIodef(event.target.value)}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm"
          htmlFor="caa-critical"
        >
          <input
            id="caa-critical"
            type="checkbox"
            className={CHECKBOX_CLASS}
            checked={critical}
            onChange={(event) => setCritical(event.target.checked)}
          />
          Set the issuer-critical flag (128) — CAs that do not understand a property must refuse to
          issue
        </label>
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
              CAA record set
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.records.length}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the records." : "record(s) to publish"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the CAA records"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy records"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
          <code className="block whitespace-pre font-mono text-sm leading-6">
            {hasError ? DASH : result.zoneLines.join("\n")}
          </code>
        </div>

        {!hasError ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {note}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational tool. Before publishing, confirm the exact CA identifier your certificate
        provider documents — some brands issue under a parent CA&apos;s identifier. A wrong CAA
        record silently breaks certificate renewals.
      </p>
    </main>
  );
}
