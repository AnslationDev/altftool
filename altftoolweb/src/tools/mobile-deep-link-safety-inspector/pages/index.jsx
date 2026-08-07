"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, Link2, RotateCcw, ShieldCheck, Smartphone, XCircle } from "lucide-react";

import { EXAMPLES, SAMPLE_LINK, formatReport, inspectDeepLink } from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "inline-flex min-h-11 items-center rounded-full border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const TH = "py-2 pr-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]";

const LEVEL_TEXT = {
  high: "text-[var(--danger)]",
  medium: "text-[var(--warning)]",
  low: "text-[var(--muted-foreground)]",
};
const LEVEL_WRAP = {
  high: "border-l-4 border-[var(--danger)] bg-[var(--danger-soft)]",
  medium: "border-l-4 border-[var(--warning)] bg-[var(--warning-soft)]",
  low: "border-l-4 border-[var(--border)] bg-[var(--muted)]",
};

const VERDICT = {
  high: {
    title: "Do not follow this link without understanding it",
    detail: "At least one finding here changes what the link does, not just how it looks.",
    Icon: XCircle,
    text: "text-[var(--danger)]",
    wrap: "bg-[var(--danger-soft)]",
  },
  medium: {
    title: "Nothing conclusive, several things to check",
    detail: "The link behaves in ways that are legitimate in some apps and abused in others.",
    Icon: AlertTriangle,
    text: "text-[var(--warning)]",
    wrap: "bg-[var(--warning-soft)]",
  },
  low: {
    title: "Nothing structurally suspicious",
    detail: "No hidden host, no redirect chain, no dangerous scheme and no credential in the URL.",
    Icon: ShieldCheck,
    text: "text-[var(--success)]",
    wrap: "bg-[var(--success-soft)]",
  },
};

const DASH = "—";

function Row({ label, value, mono }) {
  return (
    <div className="grid gap-1 border-b border-[var(--border)] py-2 last:border-0 sm:grid-cols-[10rem_1fr] sm:gap-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
        {label}
      </dt>
      <dd className={`break-all text-sm text-[var(--foreground)] ${mono ? "font-mono text-xs" : ""}`}>
        {value || DASH}
      </dd>
    </div>
  );
}

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button type="button" className={GHOST_BTN} onClick={copy} disabled={!text}>
      {copied ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4" aria-hidden="true" />
      )}
      {copied ? "Copied" : label}
    </button>
  );
}

export default function ToolHome() {
  const [link, setLink] = useState(SAMPLE_LINK);

  const result = useMemo(() => inspectDeepLink(link), [link]);
  const report = useMemo(() => formatReport(result), [result]);
  const verdict = result.error ? null : VERDICT[result.verdict];
  const VerdictIcon = verdict ? verdict.Icon : null;
  const intent = result.error ? null : result.intent;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Smartphone className="h-4 w-4" aria-hidden="true" />
          Parsed locally, nothing opened
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Mobile Deep-Link Safety Inspector
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste one link. Android <code className="font-mono text-xs">intent://</code> URIs are taken
          apart the way <code className="font-mono text-xs">Intent.parseUri</code> reads them —
          action, package, component, typed extras and every bit of the launchFlags mask. The
          browser_fallback_url is followed, redirect parameters are decoded layer by layer, and the
          authority is checked for the tricks that make a link look like it goes somewhere else.
        </p>
      </header>

      <section className={CARD}>
        <label className={LABEL_CLASS} htmlFor="deep-link">
          Deep link
        </label>
        <input
          id="deep-link"
          className={`mt-2 ${INPUT_CLASS}`}
          type="text"
          spellCheck={false}
          autoComplete="off"
          value={link}
          onChange={(event) => setLink(event.target.value)}
          placeholder="intent://path#Intent;scheme=myapp;package=com.example;end"
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          The link is never opened, resolved or requested — it is only read.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example.label}
              type="button"
              className={CHIP_BTN}
              onClick={() => setLink(example.value)}
            >
              {example.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={report} label="Copy report" />
          <button type="button" className={GHOST_BTN} onClick={() => setLink("")}>
            Clear
          </button>
          <button type="button" className={GHOST_BTN} onClick={() => setLink(SAMPLE_LINK)}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset to sample
          </button>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : (
        <div aria-live="polite" role="status">
          <section className={`mt-6 rounded-xl p-5 ${verdict.wrap}`}>
            <div className="flex items-start gap-3">
              <VerdictIcon className={`mt-0.5 h-6 w-6 shrink-0 ${verdict.text}`} aria-hidden="true" />
              <div className="min-w-0">
                <h2 className={`text-lg font-bold ${verdict.text}`}>{verdict.title}</h2>
                <p className="mt-1 text-sm leading-6">{verdict.detail}</p>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  {result.typeLabel} · {result.counts.high} high · {result.counts.medium} medium ·{" "}
                  {result.counts.low} note
                </p>
              </div>
            </div>
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">What this link resolves to</h2>
            <dl className="mt-2">
              <Row label="Effective URI" value={result.effective.uri} mono />
              <Row label="Scheme" value={result.effective.scheme} mono />
              <Row label="Host" value={result.authority.host} mono />
              {result.authority.hasUserinfo ? (
                <Row label="Userinfo (not the host)" value={result.authority.userinfo} mono />
              ) : null}
              <Row label="Port" value={result.authority.port} mono />
              <Row label="Path" value={result.effective.path} mono />
            </dl>
            {result.effective.params.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th scope="col" className={TH}>
                        Query parameter
                      </th>
                      <th scope="col" className={TH}>
                        Decoded value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    {result.effective.params.map((param, index) => (
                      <tr
                        key={`${param.key}-${index}`}
                        className="border-b border-[var(--border)] last:border-0"
                      >
                        <td className="py-2 pr-3 break-all">{param.key}</td>
                        <td className="py-2 break-all">{param.value || DASH}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">Findings</h2>
            {result.findings.length ? (
              <ul className="mt-3 space-y-2">
                {result.findings.map((item, index) => (
                  <li
                    key={`${item.title}-${index}`}
                    className={`rounded-lg p-3 ${LEVEL_WRAP[item.level] || LEVEL_WRAP.low}`}
                  >
                    <p className={`text-sm font-semibold ${LEVEL_TEXT[item.level] || ""}`}>
                      {item.title}
                    </p>
                    <p className="mt-1 break-words text-sm leading-6">{item.detail}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Nothing to report about this link.
              </p>
            )}
          </section>

          {intent ? (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">Intent fields</h2>
              <dl className="mt-2">
                <Row label="Target URI" value={intent.targetUri} mono />
                <Row label="action" value={intent.action} mono />
                <Row label="category" value={intent.categories.join(", ")} mono />
                <Row label="package" value={intent.package} mono />
                <Row label="component" value={intent.component} mono />
                <Row label="SEL (selector)" value={intent.selector} mono />
                <Row
                  label="Terminated"
                  value={intent.terminated ? "yes, ends with ;end" : "no ;end terminator"}
                />
              </dl>

              {intent.extras.length ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th scope="col" className={TH}>
                          Extra
                        </th>
                        <th scope="col" className={TH}>
                          Type
                        </th>
                        <th scope="col" className={TH}>
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-xs">
                      {intent.extras.map((extra, index) => (
                        <tr
                          key={`${extra.name}-${index}`}
                          className="border-b border-[var(--border)] last:border-0"
                        >
                          <td className="py-2 pr-3 break-all">
                            {extra.prefix}
                            {extra.name}
                          </td>
                          <td className="py-2 pr-3">{extra.type}</td>
                          <td className="py-2 break-all">{extra.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {intent.launchFlags ? (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold">
                    launchFlags{" "}
                    <span className="font-mono text-xs text-[var(--muted-foreground)]">
                      {intent.launchFlags.hex || intent.launchFlags.raw}
                    </span>
                  </h3>
                  {intent.launchFlags.error ? (
                    <p
                      role="alert"
                      className="mt-2 rounded-lg bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                    >
                      {intent.launchFlags.error}
                    </p>
                  ) : (
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                        <thead>
                          <tr className="border-b border-[var(--border)]">
                            <th scope="col" className={TH}>
                              Bit
                            </th>
                            <th scope="col" className={TH}>
                              Constant
                            </th>
                            <th scope="col" className={TH}>
                              What it does
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {intent.launchFlags.flags.map((flag) => (
                            <tr
                              key={flag.name}
                              className="border-b border-[var(--border)] align-top last:border-0"
                            >
                              <td className="py-2 pr-3 font-mono text-xs">{flag.hex}</td>
                              <td
                                className={`py-2 pr-3 font-mono text-xs font-semibold ${LEVEL_TEXT[flag.risk] || ""}`}
                              >
                                {flag.name}
                              </td>
                              <td className="py-2 text-xs leading-5">{flag.note}</td>
                            </tr>
                          ))}
                          {intent.launchFlags.unknownBits ? (
                            <tr>
                              <td className="py-2 pr-3 font-mono text-xs">
                                {intent.launchFlags.unknownBits}
                              </td>
                              <td className="py-2 pr-3 font-mono text-xs">unnamed bits</td>
                              <td className="py-2 text-xs leading-5">
                                Set, but not one of the documented Intent constants on this list.
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : null}
            </section>
          ) : null}

          {result.fallback ? (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">Fallback destination</h2>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Chrome navigates here whenever no installed app handles the intent — which is every
                device without the app.
              </p>
              <dl className="mt-2">
                <Row label="As written" value={result.fallback.raw} mono />
                <Row label="Decoded" value={result.fallback.decoded} mono />
                <Row label="Host" value={result.fallback.host} mono />
                <Row
                  label="Encoding layers"
                  value={`${result.fallback.encodingLayers} percent-decode pass${result.fallback.encodingLayers === 1 ? "" : "es"} before it stops changing`}
                />
              </dl>
            </section>
          ) : null}

          {result.hops.length ? (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">Redirect parameters</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th scope="col" className={TH}>
                        Parameter
                      </th>
                      <th scope="col" className={TH}>
                        Decodes to
                      </th>
                      <th scope="col" className={TH}>
                        Layers
                      </th>
                      <th scope="col" className={TH}>
                        Destination
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    {result.hops.map((hop, index) => (
                      <tr
                        key={`${hop.param}-${index}`}
                        className="border-b border-[var(--border)] last:border-0"
                      >
                        <td className="py-2 pr-3 break-all">{hop.param}</td>
                        <td className="py-2 pr-3 break-all">{hop.decoded}</td>
                        <td className="py-2 pr-3">{hop.encodingLayers}</td>
                        <td className={`py-2 break-all ${hop.sameSite ? "" : "text-[var(--danger)]"}`}>
                          {hop.relative ? "same site (relative path)" : hop.host || DASH}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {result.wellKnown ? (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">Files that decide whether this opens the app</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                An https link only bypasses the browser if the host publishes an association file
                naming the app. Open these two by hand — this page does not fetch them.
              </p>
              <dl className="mt-2">
                <Row label="Android" value={result.wellKnown.assetLinks} mono />
                <Row label="iOS" value={result.wellKnown.appSiteAssociation} mono />
              </dl>
            </section>
          ) : null}

          <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Link2 className="h-4 w-4" aria-hidden="true" />
              What this cannot tell you
            </h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.limits.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </main>
  );
}
