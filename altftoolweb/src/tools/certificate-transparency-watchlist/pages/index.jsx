"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ScanSearch, WifiOff } from "lucide-react";

import {
  VERDICTS,
  analyzeCertificateNames,
  buildWatchlist,
  formatFindingsText,
  formatWatchlistText,
} from "../lib";

const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const DEFAULT_DOMAINS = "acmebank.com";
const DEFAULT_NAMES = `acmebank.com
*.acmebank.com
login.acmebank.com
acmebank.net
acmebonk.com
acrnebank.com
acmebank-secure.com
acmebank.com.session-verify.net
unrelated-vendor.example`;

const VERDICT_STYLE = {
  owned: "bg-[var(--success-soft)] text-[var(--success)]",
  suspicious: "bg-[var(--danger-soft)] text-[var(--danger)]",
  review: "bg-[var(--warning-soft)] text-[var(--warning)]",
  unrelated: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  invalid: "bg-[var(--warning-soft)] text-[var(--warning)]",
};

function CopyButton({ value, label, children }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button type="button" onClick={onCopy} className={GHOST_BTN} aria-label={label}>
      {copied ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4" aria-hidden="true" />
      )}
      {copied ? "Copied" : children}
    </button>
  );
}

export default function ToolHome() {
  const [domains, setDomains] = useState(DEFAULT_DOMAINS);
  const [names, setNames] = useState(DEFAULT_NAMES);
  const [tldSwaps, setTldSwaps] = useState(true);
  const [openTechnique, setOpenTechnique] = useState("omission");

  const watchlist = useMemo(() => buildWatchlist(domains, { tldSwaps }), [domains, tldSwaps]);
  const findings = useMemo(() => analyzeCertificateNames(names, domains), [names, domains]);
  const watchlistText = useMemo(() => formatWatchlistText(watchlist), [watchlist]);
  const findingsText = useMemo(() => formatFindingsText(findings), [findings]);

  const reset = () => {
    setDomains(DEFAULT_DOMAINS);
    setNames(DEFAULT_NAMES);
    setTldSwaps(true);
    setOpenTechnique("omission");
  };

  const entry = watchlist.error ? null : watchlist.entries[0];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ScanSearch className="h-4 w-4" aria-hidden="true" />
          CT log monitoring
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Certificate Transparency Watchlist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List the domains you own. This page builds the CT log queries to run and the lookalike
          names worth watching for — then classifies the certificate names you paste back, using
          punycode decoding, confusable folding and edit distance rather than a keyword list.
        </p>
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
          <WifiOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            No CT log is queried here. Certificate Transparency search needs a live index, so this
            page prepares the query, and you paste the results back for local analysis.
          </span>
        </p>
      </header>

      <section className={CARD}>
        <label className={LABEL_CLASS} htmlFor="ctw-domains">
          Domains you own (one per line)
        </label>
        <textarea
          id="ctw-domains"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          rows={4}
          spellCheck="false"
          value={domains}
          onChange={(event) => setDomains(event.target.value)}
        />
        <label className="mt-4 flex min-h-11 items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
          <input
            type="checkbox"
            checked={tldSwaps}
            onChange={(event) => setTldSwaps(event.target.checked)}
            className="h-4 w-4 shrink-0 accent-[var(--primary)]"
          />
          <span className="text-sm">
            Include TLD swaps{" "}
            <span className="text-[var(--muted-foreground)]">
              (the same label under .net, .co, .app and other common suffixes)
            </span>
          </span>
        </label>
      </section>

      {watchlist.error ? (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]"
        >
          {watchlist.error}
        </p>
      ) : (
        <>
          <section className={`mt-6 ${CARD}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Queries to run</h2>
              <CopyButton value={watchlistText} label="Copy the whole watchlist">
                Copy watchlist
              </CopyButton>
            </div>
            <div className="mt-4 grid gap-4">
              {watchlist.entries.map((item) => (
                <div
                  key={item.registrable}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <p className="font-mono text-sm font-semibold break-all">{item.registrable}</p>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                          <th scope="col" className="py-2 pr-4 font-semibold">
                            Query
                          </th>
                          <th scope="col" className="py-2 pr-4 font-semibold">
                            Search string
                          </th>
                          <th scope="col" className="py-2 font-semibold">
                            What it returns
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.queries.map((query) => (
                          <tr
                            key={query.value}
                            className="border-b border-[var(--border)] align-top"
                          >
                            <td className="py-2 pr-4">{query.label}</td>
                            <td className="py-2 pr-4 font-mono text-xs break-all">{query.value}</td>
                            <td className="py-2 leading-6 text-[var(--muted-foreground)]">
                              {query.note}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                    {item.watchNames.length} lookalike names generated for{" "}
                    <code className="font-mono">{item.registrableLabel}</code>. Feed them to whatever
                    CT monitor you use, or search them one at a time.
                  </p>
                </div>
              ))}
            </div>
            {watchlist.invalidCount > 0 && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]"
              >
                {watchlist.invalidCount} line
                {watchlist.invalidCount === 1 ? "" : "s"} could not be read as a domain:{" "}
                {watchlist.invalid.map((item) => item.input).join(", ")}
              </p>
            )}
          </section>

          {entry && (
            <section className={`mt-6 ${CARD}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold">
                  Lookalikes for {entry.registrableLabel}
                </h2>
                <CopyButton
                  value={entry.watchNames.join("\n")}
                  label="Copy the generated names"
                >
                  Copy names
                </CopyButton>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {watchlist.techniques.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setOpenTechnique(key)}
                    aria-pressed={openTechnique === key}
                    className={`inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold transition ${
                      openTechnique === key
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                    }`}
                  >
                    {label} ({entry.variants.groups[key].length})
                  </button>
                ))}
              </div>
              {watchlist.techniques
                .filter(([key]) => key === openTechnique)
                .map(([key, label, note]) => (
                  <div key={key} className="mt-4">
                    <p className="text-sm leading-6 text-[var(--muted-foreground)]">{note}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.variants.groups[key].map((variant) => (
                        <code
                          key={variant}
                          className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 font-mono text-xs break-all"
                        >
                          {variant}.{entry.suffix}
                        </code>
                      ))}
                    </div>
                    <span className="sr-only">{label}</span>
                  </div>
                ))}
              {entry.tldVariants.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm font-semibold">TLD swaps</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {entry.tldVariants.map((variant) => (
                      <code
                        key={variant}
                        className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 font-mono text-xs break-all"
                      >
                        {variant}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </>
      )}

      <section className={`mt-6 ${CARD}`}>
        <label className={LABEL_CLASS} htmlFor="ctw-names">
          Certificate names from your CT search (one per line)
        </label>
        <textarea
          id="ctw-names"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          rows={10}
          spellCheck="false"
          value={names}
          onChange={(event) => setNames(event.target.value)}
        />
        <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
          Paste the common names and SAN entries. A <code className="font-mono">CN=</code> prefix,
          a <code className="font-mono">*.</code> wildcard, a URL, a trailing dot or a tab-separated
          crt.sh row are all handled.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <CopyButton value={findingsText} label="Copy the findings as text">
            Copy findings
          </CopyButton>
          <button type="button" onClick={reset} className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {findings.error ? (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]"
        >
          {findings.error}
        </p>
      ) : (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Findings</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {["suspicious", "review", "invalid", "unrelated", "owned"].map((key) =>
              findings.counts[key] > 0 ? (
                <span
                  key={key}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${VERDICT_STYLE[key]}`}
                >
                  {findings.counts[key]} {VERDICTS[key].label.toLowerCase()}
                </span>
              ) : null,
            )}
          </div>
          {findings.duplicatesDropped > 0 && (
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              {findings.duplicatesDropped} duplicate name
              {findings.duplicatesDropped === 1 ? "" : "s"} collapsed.
            </p>
          )}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Name
                  </th>
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Verdict
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Why
                  </th>
                </tr>
              </thead>
              <tbody>
                {findings.rows.map((row, rowIndex) => (
                  <tr
                    key={`${row.name || row.input}-${rowIndex}`}
                    className="border-b border-[var(--border)] align-top"
                  >
                    <td className="py-3 pr-4">
                      <span className="block font-mono text-xs break-all">
                        {row.name || row.input}
                      </span>
                      {row.unicode && (
                        <span className="mt-1 block font-mono text-xs text-[var(--muted-foreground)] break-all">
                          renders as {row.unicode}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${VERDICT_STYLE[row.verdict]}`}
                      >
                        {VERDICTS[row.verdict].label}
                      </span>
                    </td>
                    <td className="py-3 leading-6 text-[var(--muted-foreground)]">
                      <ul className="space-y-1">
                        {row.reasons.map((reason, reasonIndex) => (
                          <li key={`${rowIndex}-${reasonIndex}`}>{reason}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">How the judgement is made</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            <strong className="font-semibold text-[var(--foreground)]">Punycode decoding.</strong>{" "}
            Any <code className="font-mono">xn--</code> label is decoded with the RFC 3492 algorithm,
            so the name is judged by what it renders as, not by its ASCII spelling.
          </li>
          <li>
            <strong className="font-semibold text-[var(--foreground)]">Confusable folding.</strong>{" "}
            Labels are reduced to a skeleton: accents stripped, Cyrillic and Greek lookalikes folded
            onto Latin, then <code className="font-mono">rn</code> to <code className="font-mono">m</code>,{" "}
            <code className="font-mono">vv</code> to <code className="font-mono">w</code>,{" "}
            <code className="font-mono">cl</code> to <code className="font-mono">d</code>. Two labels
            with the same skeleton look alike.
          </li>
          <li>
            <strong className="font-semibold text-[var(--foreground)]">Edit distance.</strong>{" "}
            Damerau-Levenshtein with adjacent transposition, against a fixed budget by label length —
            1 up to four characters, 2 up to nine, 3 beyond.
          </li>
          <li>
            <strong className="font-semibold text-[var(--foreground)]">Registrable domain.</strong>{" "}
            The comparison is anchored on the label left of the public suffix, so{" "}
            <code className="font-mono">yourbrand.com.attacker.net</code> is caught as an
            impersonation rather than treated as yours.
          </li>
        </ul>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Limits worth knowing</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            No CT log is contacted. This tool cannot tell you that a certificate exists — only
            whether a name you found looks like yours.
          </li>
          <li>
            The public-suffix table here covers common ccTLD second levels, not the full Public
            Suffix List. Under an unusual suffix the registrable domain may be split one label off.
          </li>
          <li>
            A lookalike name is not proof of an attack. Brands register their own defensive
            variants, and unrelated businesses share short words. Every verdict here comes with the
            rule that produced it so you can overrule it.
          </li>
        </ul>
      </section>
    </main>
  );
}
