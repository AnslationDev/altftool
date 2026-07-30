"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Eye, EyeOff, RotateCcw, ShieldCheck, WifiOff } from "lucide-react";

import { analyzeRangeResponse, buildPrefixBatch, buildPrefixLookup } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const DEFAULT_PASSWORD = "password";

function CopyButton({ value, label }) {
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
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Field({ label, value, breakAll = false }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          {label}
        </p>
        <CopyButton value={value} label={`Copy ${label}`} />
      </div>
      <p
        className={`mt-2 font-mono text-sm text-[var(--foreground)] ${
          breakAll ? "break-all" : "break-words"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function ToolHome() {
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [reveal, setReveal] = useState(true);
  const [padded, setPadded] = useState(true);
  const [batchText, setBatchText] = useState("");
  const [responseText, setResponseText] = useState("");
  const [tab, setTab] = useState("single");

  const single = useMemo(() => buildPrefixLookup(password, { padded }), [password, padded]);
  const batch = useMemo(
    () => (batchText.trim() ? buildPrefixBatch(batchText, { padded }) : null),
    [batchText, padded],
  );
  const resolved = useMemo(() => {
    if (single.error || !responseText.trim()) return null;
    return analyzeRangeResponse(responseText, single.suffix);
  }, [responseText, single]);

  const reset = () => {
    setPassword(DEFAULT_PASSWORD);
    setReveal(true);
    setPadded(true);
    setBatchText("");
    setResponseText("");
    setTab("single");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          k-anonymity lookup
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Breach Prefix Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          SHA-1 a candidate password in your browser, then split the digest the way the Pwned
          Passwords range API expects: the first five hex characters are the only part anyone else
          ever sees. Paste the response back and this page finds your suffix locally.
        </p>
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
          <WifiOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            This page makes no network request of any kind. It prepares the request and reads the
            reply — you run the request yourself, from a terminal or your own code.
          </span>
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="bpc-password">
              Candidate password
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="bpc-password"
                className={INPUT_CLASS}
                type={reveal ? "text" : "password"}
                autoComplete="off"
                spellCheck="false"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                onClick={() => setReveal((value) => !value)}
                className={GHOST_BTN}
                aria-pressed={reveal}
              >
                {reveal ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
                {reveal ? "Hide" : "Show"}
              </button>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              Hashed exactly as typed, including spaces. Nothing is stored, logged or transmitted.
            </p>
          </div>

          <label className="flex min-h-11 items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
            <input
              type="checkbox"
              checked={padded}
              onChange={(event) => setPadded(event.target.checked)}
              className="h-4 w-4 shrink-0 accent-[var(--primary)]"
            />
            <span className="text-sm">
              Request response padding{" "}
              <span className="text-[var(--muted-foreground)]">
                (adds the <code className="font-mono">Add-Padding: true</code> header so the reply
                size reveals nothing)
              </span>
            </span>
          </label>
        </div>
      </section>

      {single.error ? (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]"
        >
          {single.error}
        </p>
      ) : (
        <>
          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">What gets computed here</h2>
            <div className="mt-4 grid gap-3">
              <Field label="SHA-1 digest (never send this)" value={single.hash} breakAll />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Prefix — the only part you send" value={single.prefix} />
                <Field label="Suffix — stays in this browser" value={single.suffix} breakAll />
              </div>
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Digest bits disclosed
                </dt>
                <dd className="mt-1 text-lg font-semibold">{single.bitsDisclosed} of 160</dd>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Bits withheld
                </dt>
                <dd className="mt-1 text-lg font-semibold">{single.bitsWithheld}</dd>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Possible prefixes
                </dt>
                <dd className="mt-1 text-lg font-semibold">
                  {single.possiblePrefixes.toLocaleString()}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              Five hex characters is 20 bits, so the request narrows you to one of{" "}
              {single.possiblePrefixes.toLocaleString()} buckets and says nothing about which entry
              in that bucket — or whether you are in it at all.
            </p>
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">The request to run</h2>
            <div className="mt-4 grid gap-3">
              <Field label="Endpoint" value={single.url} breakAll />
              <Field label="curl" value={single.curl} breakAll />
              <Field label="curl, filtered to your suffix" value={single.grepCommand} breakAll />
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              {single.endpointLabel} returns one <code className="font-mono">SUFFIX:COUNT</code>{" "}
              line per stored hash sharing your prefix. A line whose suffix equals yours means the
              password appears in the corpus; the count is how many breach records contained it.
            </p>
          </section>

          <section className={`mt-6 ${CARD}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Finish the check locally</h2>
              <CopyButton value={single.suffix} label="Copy suffix to search for" />
            </div>
            <label className={`mt-4 ${LABEL_CLASS}`} htmlFor="bpc-response">
              Paste the response body
            </label>
            <textarea
              id="bpc-response"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={8}
              spellCheck="false"
              placeholder={"003D68EB55068C33ACE09247EE4C639306B:3\n012C192B2F16F82EA0EB9EF18D9D539B0DD:1"}
              value={responseText}
              onChange={(event) => setResponseText(event.target.value)}
            />
            {resolved === null ? (
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                Nothing pasted yet. The comparison happens in this page — your suffix is never sent
                anywhere to be matched.
              </p>
            ) : resolved.error ? (
              <p
                role="alert"
                className="mt-3 rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]"
              >
                {resolved.error}
              </p>
            ) : (
              <div className="mt-4 grid gap-3">
                <div
                  className={`rounded-lg p-4 ${
                    resolved.found
                      ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                      : "bg-[var(--success-soft)] text-[var(--success)]"
                  }`}
                >
                  <p className="text-sm font-semibold">
                    {resolved.found
                      ? `Suffix found — this password appears ${resolved.count.toLocaleString()} time${
                          resolved.count === 1 ? "" : "s"
                        } in the pasted bucket.`
                      : "Suffix not present in the pasted bucket."}
                  </p>
                  <p className="mt-1 text-xs leading-5">
                    {resolved.found
                      ? "Treat it as public. Change it wherever it is in use, and do not reuse it."
                      : "That means it is absent from this corpus, which is not the same as being a strong password."}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[26rem] border-collapse text-sm">
                    <caption className="sr-only">Parsed response statistics</caption>
                    <tbody>
                      {[
                        ["Lines parsed", resolved.parsedLines],
                        ["Real entries", resolved.realLines],
                        ["Padding entries (count 0)", resolved.paddingLines],
                        ["Duplicate suffixes", resolved.duplicateLines],
                        ["Lines skipped as malformed", resolved.malformedLines],
                      ].map(([key, value]) => (
                        <tr key={key} className="border-b border-[var(--border)]">
                          <th scope="row" className="py-2 pr-4 text-left font-medium">
                            {key}
                          </th>
                          <td className="py-2 text-right font-mono">{value.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap gap-2">
          {[
            ["single", "Single candidate"],
            ["batch", "Password list"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-pressed={tab === key}
              className={`inline-flex min-h-11 items-center rounded-md px-4 text-sm font-semibold transition ${
                tab === key
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "batch" ? (
          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="bpc-batch">
              One candidate per line
            </label>
            <textarea
              id="bpc-batch"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={6}
              spellCheck="false"
              placeholder={"password\nhunter2\nSummer2026!"}
              value={batchText}
              onChange={(event) => setBatchText(event.target.value)}
            />
            {batch === null ? (
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                Useful when you are auditing an exported list: candidates that share a prefix ride
                along in the same response, so you make fewer requests than you have passwords.
              </p>
            ) : batch.error ? (
              <p
                role="alert"
                className="mt-3 rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]"
              >
                {batch.error}
              </p>
            ) : (
              <>
                <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                  {batch.total} candidate{batch.total === 1 ? "" : "s"} resolve to{" "}
                  {batch.distinctPrefixes} distinct prefix
                  {batch.distinctPrefixes === 1 ? "" : "es"}, so {batch.requestsRequired} request
                  {batch.requestsRequired === 1 ? "" : "s"} covers the list.
                </p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                        <th scope="col" className="py-2 pr-4 font-semibold">
                          Line
                        </th>
                        <th scope="col" className="py-2 pr-4 font-semibold">
                          Prefix
                        </th>
                        <th scope="col" className="py-2 font-semibold">
                          Suffix
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {batch.rows.map((row, index) => (
                        <tr
                          key={`${row.hash}-${index}`}
                          className="border-b border-[var(--border)] align-top"
                        >
                          <td className="py-2 pr-4 font-mono text-xs">{index + 1}</td>
                          <td className="py-2 pr-4 font-mono">{row.prefix}</td>
                          <td className="py-2 font-mono text-xs break-all">{row.suffix}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3">
                  <CopyButton
                    value={batch.rows.map((row) => `${row.prefix} ${row.suffix}`).join("\n")}
                    label="Copy all prefixes and suffixes"
                  />
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
            One candidate at a time, using the field above. Switch to the list view to prepare a
            whole export in one pass.
          </p>
        )}
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">What this tool does not do</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            It never contacts a breach database. The range request is yours to make, from a client
            you control, so the connection cannot be attributed to this page.
          </li>
          <li>
            It does not tell you whether a password is strong. A suffix that is absent from a corpus
            only means nobody has leaked that exact string yet.
          </li>
          <li>
            It does not compute NTLM digests, which the range API also accepts under{" "}
            <code className="font-mono">?mode=ntlm</code>. Only SHA-1 is produced here.
          </li>
        </ul>
        <div className="mt-4">
          <button type="button" onClick={reset} className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>
    </main>
  );
}
