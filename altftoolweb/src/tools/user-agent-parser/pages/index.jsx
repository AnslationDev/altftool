"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy, MonitorSmartphone, RotateCcw } from "lucide-react";
import { SAMPLE_USER_AGENTS, parseUserAgent } from "../lib";

const DASH = "—";
const DEFAULT_UA = SAMPLE_USER_AGENTS[0].value;

export default function UserAgentParser() {
  const [input, setInput] = useState(DEFAULT_UA);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => parseUserAgent(input), [input]);
  const figures = result.error ? null : result;

  const summary = useMemo(() => {
    if (!figures) return "";
    return [
      `User-Agent: ${figures.userAgent}`,
      `Browser: ${figures.browser.name}${figures.browser.version ? ` ${figures.browser.version}` : ""}`,
      `Engine: ${figures.engine.name}${figures.engine.version ? ` ${figures.engine.version}` : ""}`,
      `Operating system: ${figures.os.name}${figures.os.version ? ` ${figures.os.version}` : ""}`,
      `Device type: ${figures.device.type}`,
      `CPU: ${figures.cpu}`,
      `Automated client: ${figures.isBot ? "yes" : "no"}`,
    ].join("\n");
  }, [figures]);

  const copyResult = useCallback(async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [summary]);

  const useMyUserAgent = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.userAgent) {
      setInput(navigator.userAgent);
      setCopied(false);
    }
  }, []);

  const reset = useCallback(() => {
    setInput(DEFAULT_UA);
    setCopied(false);
  }, []);

  const rows = figures
    ? [
        ["Browser", figures.browser.name],
        ["Browser version", figures.browser.version || DASH],
        ["Major version", figures.browser.major || DASH],
        ["Rendering engine", figures.engine.name],
        ["Engine version", figures.engine.version || DASH],
        ["Operating system", figures.os.name],
        ["OS version", figures.os.version || DASH],
        ["Device type", figures.device.type],
        ["Vendor", figures.device.vendor || DASH],
        ["CPU architecture", figures.cpu],
        ["Automated client", figures.isBot ? "Yes" : "No"],
      ]
    : [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <MonitorSmartphone aria-hidden="true" className="mt-1 h-6 w-6 text-[var(--primary)]" />
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">User Agent Parser</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Paste a User-Agent header and see which browser, engine, operating system, device class
            and CPU it describes — plus the compatibility tokens that make it confusing.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="uap-input" className="text-sm font-medium text-[var(--foreground)]">
          User-Agent string
        </label>
        <textarea
          id="uap-input"
          rows={4}
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setCopied(false);
          }}
          spellCheck={false}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm break-all text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
        />
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        <label htmlFor="uap-sample" className="text-sm font-medium text-[var(--foreground)]">
          Load a sample
        </label>
        <select
          id="uap-sample"
          value=""
          onChange={(event) => {
            const found = SAMPLE_USER_AGENTS.find((entry) => entry.label === event.target.value);
            if (found) {
              setInput(found.value);
              setCopied(false);
            }
          }}
          className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
        >
          <option value="">Choose a sample…</option>
          {SAMPLE_USER_AGENTS.map((entry) => (
            <option key={entry.label} value={entry.label}>
              {entry.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={useMyUserAgent}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          <MonitorSmartphone aria-hidden="true" className="h-4 w-4" />
          Use my browser
        </button>
        <button
          type="button"
          onClick={copyResult}
          disabled={!figures}
          aria-label="Copy parsed User-Agent breakdown to clipboard"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] disabled:opacity-50 motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          {copied ? (
            <Check aria-hidden="true" className="h-4 w-4 text-[var(--success)]" />
          ) : (
            <Copy aria-hidden="true" className="h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy result"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          Reset
        </button>
      </div>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm text-[var(--muted-foreground)]">Detected browser</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight break-words text-[var(--foreground)] sm:text-4xl">
          {figures ? `${figures.browser.name}${figures.browser.major ? ` ${figures.browser.major}` : ""}` : DASH}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {figures
            ? `${figures.os.name}${figures.os.version ? ` ${figures.os.version}` : ""} · ${figures.device.type}`
            : "Paste a User-Agent above"}
        </p>

        {result.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : null}

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {rows.length ? (
            rows.map(([label, value]) => (
              <div
                key={label}
                className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2"
              >
                <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
                <dd className="max-w-[60%] truncate text-right font-medium text-[var(--foreground)]">
                  {value}
                </dd>
              </div>
            ))
          ) : (
            <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-sm text-[var(--muted-foreground)]">Breakdown</dt>
              <dd className="font-medium text-[var(--foreground)]">{DASH}</dd>
            </div>
          )}
        </dl>
      </section>

      {figures && figures.notes.length ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Things worth knowing</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
            {figures.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {figures && figures.tokens.length ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Product tokens</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th scope="col" className="py-2 pr-4 font-medium text-[var(--muted-foreground)]">
                    #
                  </th>
                  <th scope="col" className="py-2 font-medium text-[var(--muted-foreground)]">
                    Token
                  </th>
                </tr>
              </thead>
              <tbody>
                {figures.tokens.map((token, index) => (
                  <tr key={`${index}-${token}`} className="border-b border-[var(--border)]">
                    <td className="py-2 pr-4 text-[var(--muted-foreground)]">{index + 1}</td>
                    <td className="py-2 font-mono break-all text-[var(--foreground)]">{token}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
