"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, RotateCcw, ScanSearch } from "lucide-react";

import { analyseUrl, formatUrlReport } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const SAMPLE_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SEVERITY_CHIP = {
  high: "bg-[var(--danger-soft)] text-[var(--danger)]",
  medium: "bg-[var(--warning-soft)] text-[var(--foreground)]",
  low: "bg-[var(--muted)] text-[var(--foreground)]",
  info: "bg-[var(--success-soft)] text-[var(--success)]",
};

const SEVERITY_WORD = { high: "High", medium: "Medium", low: "Low", info: "Note" };

const DEFAULT_URL =
  "http://paypal.com.secure-login.tk/verify?url=aHR0cHM6Ly9ldmlsLmV4YW1wbGUvc3RlYWw=";

const SAMPLES = [
  { key: "subdomain", label: "Brand in the subdomain", value: DEFAULT_URL },
  { key: "puny", label: "Punycode homograph", value: "https://xn--pypal-4ve.com/account/verify" },
  { key: "userinfo", label: "Credentials before the host", value: "https://www.paypal.com@evil.tld/login" },
  { key: "ip", label: "IP address in disguise", value: "http://2130706433/admin" },
  { key: "redirect", label: "Open redirect", value: "https://accounts.example.com/o/auth?continue=https%3A%2F%2Fevil.example%2Fx" },
  { key: "clean", label: "An ordinary link", value: "https://www.paypal.com/signin" },
];

export default function ToolHome() {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => analyseUrl(url), [url]);
  const report = useMemo(() => formatUrlReport(result), [result]);

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
    setUrl(DEFAULT_URL);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ScanSearch className="h-4 w-4" aria-hidden="true" />
          Read before you click
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Phishing URL X-Ray</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a link you were sent and it is taken apart as text — never opened, never resolved.
          Punycode labels are decoded with the real RFC 3492 algorithm, mixed writing systems are
          flagged, confusable characters are folded and compared against well-known brand names, the
          registrable domain is separated from the subdomains anyone can invent, alternate IP
          notations are converted, and redirect parameters are unwrapped through percent- and
          base64-encoding.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="url-input">
          The link
        </label>
        <input
          id="url-input"
          className={`mt-2 ${INPUT_CLASS}`}
          type="text"
          inputMode="url"
          spellCheck="false"
          autoComplete="off"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/path?next=…"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {SAMPLES.map((sample) => (
            <button key={sample.key} type="button" onClick={() => setUrl(sample.value)} className={SAMPLE_BTN}>
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
            {copied ? "Copied" : "Copy findings"}
          </button>
          <button type="button" onClick={reset} className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          The address is read as a string in this page. No request is made to it, so inspecting a
          hostile link does not count as a click or tell the sender your address is live.
        </p>
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
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Findings</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <span className={`rounded-md px-2 py-1 ${SEVERITY_CHIP.high}`}>High: {result.counts.high}</span>
              <span className={`rounded-md px-2 py-1 ${SEVERITY_CHIP.medium}`}>
                Medium: {result.counts.medium}
              </span>
              <span className={`rounded-md px-2 py-1 ${SEVERITY_CHIP.low}`}>Low: {result.counts.low}</span>
            </div>
            <ul className="mt-4 space-y-2">
              {result.findings.map((finding) => (
                <li
                  key={finding.title}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${SEVERITY_CHIP[finding.severity]}`}
                    >
                      {SEVERITY_WORD[finding.severity]}
                    </span>
                    <span className="text-sm font-semibold">{finding.title}</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{finding.detail}</p>
                </li>
              ))}
            </ul>
          </section>

          {result.parsed && (
            <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <h2 className="text-base font-semibold">How the address breaks down</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                  <tbody>
                    <Row label="Scheme" value={result.scheme} />
                    {result.userinfo && <Row label="Before the @" value={result.userinfo} />}
                    <Row label="Host" value={result.host} />
                    {result.numeric && <Row label="Resolves to" value={result.numeric.dotted} />}
                    {result.domain && result.domain.registrable && (
                      <Row label="Registrable domain" value={result.domain.registrable} strong />
                    )}
                    {result.domain && result.domain.subdomain && (
                      <Row label="Subdomain" value={result.domain.subdomain} />
                    )}
                    {result.port && <Row label="Port" value={result.port} />}
                    <Row label="Path" value={result.path} />
                    {result.fragment && <Row label="Fragment" value={result.fragment} />}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                Only the registrable domain says who owns the link. Everything to the left of it is chosen
                by that same owner, and everything after the first slash is chosen by them too. The
                public-suffix list used here is a common subset, not the full one.
              </p>
            </section>
          )}

          {result.labels && result.labels.length > 0 && (
            <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <h2 className="text-base font-semibold">Host labels</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-4 font-semibold">As written</th>
                      <th scope="col" className="py-2 pr-4 font-semibold">As displayed</th>
                      <th scope="col" className="py-2 pr-4 font-semibold">Scripts</th>
                      <th scope="col" className="py-2 pr-4 font-semibold">Folded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.labels.map((label, index) => (
                      <tr
                        key={`${label.raw}-${index}`}
                        className="border-b border-[var(--border)] align-top"
                      >
                        <td className="break-all py-2 pr-4 font-mono text-xs">{label.raw}</td>
                        <td className="break-all py-2 pr-4 font-mono text-xs">
                          {label.punycode ? label.decoded || "(invalid punycode)" : label.display}
                        </td>
                        <td className="py-2 pr-4 text-xs text-[var(--muted-foreground)]">
                          {label.scripts.join(", ")}
                        </td>
                        <td className="break-all py-2 pr-4 font-mono text-xs text-[var(--muted-foreground)]">
                          {label.skeleton}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                &quot;Folded&quot; is the confusable skeleton: diacritics stripped, Cyrillic, Greek and
                Armenian lookalikes mapped to their Latin twins, the digits used as letters replaced, and
                &quot;rn&quot; collapsed to &quot;m&quot;. Two labels that fold to the same string are
                meant to be indistinguishable when you read them.
              </p>
            </section>
          )}

          {result.redirects && result.redirects.length > 0 && (
            <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <h2 className="text-base font-semibold">Redirect parameters</h2>
              <ul className="mt-3 space-y-2">
                {result.redirects.map((redirect) => (
                  <li
                    key={redirect.param}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm"
                  >
                    <div className="font-semibold">
                      {redirect.param}
                      {redirect.encoding !== "plain" ? ` (${redirect.encoding})` : ""}
                    </div>
                    <div className="mt-1 break-all font-mono text-xs text-[var(--muted-foreground)]">
                      {redirect.target}
                    </div>
                    <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                      Lands on {redirect.targetHost || "an unreadable host"}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.query && result.query.length > 0 && (
            <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <h2 className="text-base font-semibold">Query string</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-4 font-semibold">Name</th>
                      <th scope="col" className="py-2 pr-4 font-semibold">Decoded value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.query.map((param, index) => (
                      <tr
                        key={`${param.key}-${index}`}
                        className="border-b border-[var(--border)] align-top"
                      >
                        <td className="break-all py-2 pr-4 font-mono text-xs">{param.key}</td>
                        <td className="break-all py-2 pr-4 font-mono text-xs text-[var(--muted-foreground)]">
                          {param.value || "(empty)"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">What this cannot tell you</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              Everything here comes from the characters in the address. There is no reputation lookup, no
              blocklist, no WHOIS, no certificate check and no following of the redirect chain, because
              all of those need a network request and this tool makes none. A newly registered domain
              with a perfectly ordinary name produces zero findings and can still be a phishing site.
              Treat a clean result as &quot;nothing structurally deceptive&quot;, and reach the real site
              through a bookmark or by typing the address yourself before you sign in.
            </p>
          </section>
        </>
      )}
    </main>
  );
}

function Row({ label, value, strong }) {
  return (
    <tr className="border-b border-[var(--border)] align-top">
      <th scope="row" className="w-40 py-2 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
        {label}
      </th>
      <td
        className={`break-all py-2 font-mono text-xs ${strong ? "font-semibold text-[var(--primary)]" : ""}`}
      >
        {value}
      </td>
    </tr>
  );
}
