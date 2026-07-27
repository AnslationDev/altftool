"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MailCheck, RotateCcw } from "lucide-react";

import { ALIGNMENT_MODES, FO_OPTIONS, POLICIES, buildDmarcRecord } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  domain: "example.com",
  policy: "none",
  subdomainPolicy: "inherit",
  pct: "100",
  rua: "dmarc-reports@example.com",
  ruf: "",
  adkim: "r",
  aspf: "r",
  fo: [],
  ri: "86400",
};

const DASH = "—";

export default function ToolHome() {
  const [domain, setDomain] = useState(DEFAULTS.domain);
  const [policy, setPolicy] = useState(DEFAULTS.policy);
  const [subdomainPolicy, setSubdomainPolicy] = useState(DEFAULTS.subdomainPolicy);
  const [pct, setPct] = useState(DEFAULTS.pct);
  const [rua, setRua] = useState(DEFAULTS.rua);
  const [ruf, setRuf] = useState(DEFAULTS.ruf);
  const [adkim, setAdkim] = useState(DEFAULTS.adkim);
  const [aspf, setAspf] = useState(DEFAULTS.aspf);
  const [fo, setFo] = useState(DEFAULTS.fo);
  const [ri, setRi] = useState(DEFAULTS.ri);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildDmarcRecord({
        domain,
        policy,
        subdomainPolicy,
        pct: pct.trim() === "" ? NaN : Number(pct),
        rua,
        ruf,
        adkim,
        aspf,
        fo,
        ri: ri.trim() === "" ? NaN : Number(ri),
      }),
    [domain, policy, subdomainPolicy, pct, rua, ruf, adkim, aspf, fo, ri],
  );
  const hasError = Boolean(result.error);

  const toggleFo = (id) => {
    setFo((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(
        `${result.recordName}\tTXT\t"${result.recordValue}"`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setDomain(DEFAULTS.domain);
    setPolicy(DEFAULTS.policy);
    setSubdomainPolicy(DEFAULTS.subdomainPolicy);
    setPct(DEFAULTS.pct);
    setRua(DEFAULTS.rua);
    setRuf(DEFAULTS.ruf);
    setAdkim(DEFAULTS.adkim);
    setAspf(DEFAULTS.aspf);
    setFo(DEFAULTS.fo);
    setRi(DEFAULTS.ri);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MailCheck className="h-4 w-4" aria-hidden="true" />
          Email authentication
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">DMARC Record Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build the _dmarc TXT record for your domain per RFC 7489 — policy, subdomain policy,
          SPF/DKIM alignment, sampling percentage and report addresses — with sanity warnings before
          you tighten enforcement.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dmg-domain">
              Domain
            </label>
            <input
              id="dmg-domain"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="example.com"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dmg-policy">
              Policy (p)
            </label>
            <select
              id="dmg-policy"
              className={`mt-2 ${INPUT_CLASS}`}
              value={policy}
              onChange={(event) => setPolicy(event.target.value)}
            >
              {POLICIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dmg-sp">
              Subdomain policy (sp)
            </label>
            <select
              id="dmg-sp"
              className={`mt-2 ${INPUT_CLASS}`}
              value={subdomainPolicy}
              onChange={(event) => setSubdomainPolicy(event.target.value)}
            >
              <option value="inherit">Inherit from p (default)</option>
              {POLICIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dmg-pct">
              Percentage sampled (pct, 0-100)
            </label>
            <input
              id="dmg-pct"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              value={pct}
              onChange={(event) => setPct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dmg-rua">
              Aggregate reports to (rua)
            </label>
            <input
              id="dmg-rua"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="dmarc-reports@example.com"
              value={rua}
              onChange={(event) => setRua(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dmg-ruf">
              Forensic reports to (ruf, optional)
            </label>
            <input
              id="dmg-ruf"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="leave empty to skip"
              value={ruf}
              onChange={(event) => setRuf(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dmg-adkim">
              DKIM alignment (adkim)
            </label>
            <select
              id="dmg-adkim"
              className={`mt-2 ${INPUT_CLASS}`}
              value={adkim}
              onChange={(event) => setAdkim(event.target.value)}
            >
              {ALIGNMENT_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dmg-aspf">
              SPF alignment (aspf)
            </label>
            <select
              id="dmg-aspf"
              className={`mt-2 ${INPUT_CLASS}`}
              value={aspf}
              onChange={(event) => setAspf(event.target.value)}
            >
              {ALIGNMENT_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dmg-ri">
              Aggregate report interval (ri, seconds)
            </label>
            <input
              id="dmg-ri"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="3600"
              value={ri}
              onChange={(event) => setRi(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Failure reporting options (fo)</legend>
          <div className="mt-2 space-y-1">
            {FO_OPTIONS.map((option) => (
              <label
                key={option.id}
                htmlFor={`dmg-fo-${option.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              >
                <input
                  id={`dmg-fo-${option.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={fo.includes(option.id)}
                  onChange={() => toggleFo(option.id)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
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
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Publish as TXT at
            </p>
            <p className="mt-1 break-all font-mono text-xl font-semibold text-[var(--primary)] sm:text-2xl">
              {hasError ? DASH : result.recordName}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the DMARC record"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy record"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
          <code className="whitespace-pre font-mono text-sm">
            {hasError ? DASH : `"${result.recordValue}"`}
          </code>
        </div>

        {!hasError ? (
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {result.tags.map(([tag, value]) => (
              <div key={tag} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="shrink-0 font-mono text-[var(--muted-foreground)]">{tag}</dt>
                <dd className="min-w-0 break-all text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm">
            {result.warnings.map((w) => (
              <li key={w} className="rounded-md bg-[var(--muted)] px-3 py-2 text-[var(--muted-foreground)]">
                {w}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational tool. DMARC only works on top of SPF and/or DKIM — publish those first, start
        at p=none with reports, and tighten to quarantine and reject once legitimate senders are
        aligned.
      </p>
    </main>
  );
}
