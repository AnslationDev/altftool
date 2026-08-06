"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Puzzle, RotateCcw, WifiOff } from "lucide-react";

import { TIER_LABELS, TIERS, analyzeManifest, formatReport } from "../lib";

const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const DEFAULT_MANIFEST = `{
  "manifest_version": 3,
  "name": "Coupon Sidekick",
  "version": "4.2.1",
  "description": "Finds discount codes while you shop.",
  "permissions": [
    "storage",
    "activeTab",
    "tabs",
    "cookies",
    "scripting",
    "webRequest",
    "nativeMessaging"
  ],
  "optional_permissions": ["history"],
  "host_permissions": ["<all_urls>"],
  "content_scripts": [
    {
      "matches": ["*://*/*"],
      "js": ["content.js"],
      "all_frames": true,
      "run_at": "document_start"
    }
  ],
  "background": { "service_worker": "sw.js" },
  "web_accessible_resources": [
    { "resources": ["panel.html"], "matches": ["<all_urls>"] }
  ]
}`;

const TIER_STYLE = {
  critical: "bg-[var(--danger-soft)] text-[var(--danger)]",
  high: "bg-[var(--warning-soft)] text-[var(--warning)]",
  moderate: "bg-[var(--muted)] text-[var(--foreground)]",
  low: "bg-[var(--success-soft)] text-[var(--success)]",
  unknown: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

function Badge({ tier }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TIER_STYLE[tier]}`}
    >
      {TIER_LABELS[tier]}
    </span>
  );
}

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
      {copied ? "Copied" : "Copy report"}
    </button>
  );
}

function PermissionTable({ caption, rows }) {
  if (rows.length === 0) return null;
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
        <caption className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          {caption}
        </caption>
        <thead>
          <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
            <th scope="col" className="py-2 pr-4 font-semibold">
              Permission
            </th>
            <th scope="col" className="py-2 pr-4 font-semibold">
              Class
            </th>
            <th scope="col" className="py-2 font-semibold">
              What it allows
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-[var(--border)] align-top">
              <td className="py-2 pr-4 font-mono text-xs break-all">{row.name}</td>
              <td className="py-2 pr-4">
                <Badge tier={row.tier} />
              </td>
              <td className="py-2 leading-6 text-[var(--muted-foreground)]">{row.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ToolHome() {
  const [text, setText] = useState(DEFAULT_MANIFEST);
  const result = useMemo(() => analyzeManifest(text), [text]);
  const report = useMemo(() => formatReport(result), [result]);

  const reset = () => {
    if (
      window.confirm(
        "Reset to the sample manifest? This discards your pasted manifest and cannot be undone.",
      )
    ) {
      setText(DEFAULT_MANIFEST);
    }
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Puzzle className="h-4 w-4" aria-hidden="true" />
          manifest.json review
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Browser Extension Permission Analyzer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste an extension&apos;s manifest.json. This page parses the permission arrays, the host
          match patterns, the content scripts, the background type and the CSP — then tells you what
          each declaration allows and which combinations add up to more than their parts.
        </p>
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
          <WifiOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Everything runs in this page. The manifest is not uploaded, and no store or reputation
            service is contacted — this reads the declarations, not the extension&apos;s code.
          </span>
        </p>
      </header>

      <section className={CARD}>
        <label className={LABEL_CLASS} htmlFor="bepa-manifest">
          manifest.json
        </label>
        <textarea
          id="bepa-manifest"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          rows={14}
          spellCheck="false"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
          Find it at <code className="font-mono">chrome://extensions</code> &rarr; Details &rarr; the
          extension folder, or in the unpacked source.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <CopyButton value={report} label="Copy the review as text" />
          <button type="button" onClick={reset} className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
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
        <>
          <section className={`mt-6 ${CARD}`} aria-live="polite">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">
                  {result.name || "Unnamed extension"}
                  {result.version ? ` ${result.version}` : ""}
                </h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {result.description || "No description declared."}
                </p>
              </div>
              <Badge tier={result.overallLevel} />
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Manifest version", result.manifestVersion === null ? "—" : result.manifestVersion],
                ["API permissions", result.totals.apiPermissions],
                ["Host permissions", result.totals.hostPermissions],
                ["Content scripts", result.totals.contentScripts],
              ].map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    {key}
                  </dt>
                  <dd className="mt-1 text-lg font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              {TIERS.map((tier) =>
                result.tierCounts[tier] > 0 ? (
                  <span
                    key={tier}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${TIER_STYLE[tier]}`}
                  >
                    {result.tierCounts[tier]} {TIER_LABELS[tier].toLowerCase()}
                  </span>
                ) : null,
              )}
            </div>

            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              The class shown is a fixed lookup against a published description of each API, plus the
              combination rules below. It is not a score, and nothing here is estimated.
            </p>

            {result.notes.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
                {result.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">Combinations that matter</h2>
            {result.combinations.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                No combination rule fired. Each declared permission still stands on its own — read
                the table below.
              </p>
            ) : (
              <ul className="mt-4 grid gap-3">
                {result.combinations.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tier={item.level} />
                      <p className="text-sm font-semibold">{item.title}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                      {item.detail}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">Declared permissions</h2>
            {result.totals.apiPermissions === 0 && result.totals.optionalApiPermissions === 0 ? (
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                No API permissions declared.
              </p>
            ) : (
              <>
                <PermissionTable caption="Granted at install" rows={result.apiPermissions} />
                <PermissionTable
                  caption="Optional — requested later, not shown in the install prompt"
                  rows={result.optionalApiPermissions}
                />
              </>
            )}
            {result.unknownPermissions.length > 0 && (
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                Not in this tool&apos;s catalogue: {result.unknownPermissions.join(", ")}. Check them
                against your browser&apos;s permission reference before signing anything off.
              </p>
            )}
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">Host access</h2>
            {result.hostPermissions.length === 0 && result.optionalHostPermissions.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                No host permissions declared. Any page access comes from content scripts or
                activeTab.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-4 font-semibold">
                        Pattern
                      </th>
                      <th scope="col" className="py-2 pr-4 font-semibold">
                        Declared in
                      </th>
                      <th scope="col" className="py-2 font-semibold">
                        Covers
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...result.hostPermissions, ...result.optionalHostPermissions].map(
                      (item, index) => (
                        <tr
                          key={`${item.pattern}-${index}`}
                          className="border-b border-[var(--border)] align-top"
                        >
                          <td className="py-2 pr-4 font-mono text-xs break-all">{item.pattern}</td>
                          <td className="py-2 pr-4 font-mono text-xs">{item.source}</td>
                          <td
                            className={`py-2 leading-6 ${
                              item.valid ? "text-[var(--muted-foreground)]" : "text-[var(--danger)]"
                            }`}
                          >
                            {item.valid ? item.label : item.error}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {result.broadestHost && (
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                Broadest access requested:{" "}
                <code className="font-mono">{result.broadestHost.pattern}</code> —{" "}
                {result.broadestHost.label}.
              </p>
            )}
          </section>

          {result.contentScripts.length > 0 && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">Content scripts</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-4 font-semibold">
                        #
                      </th>
                      <th scope="col" className="py-2 pr-4 font-semibold">
                        Matches
                      </th>
                      <th scope="col" className="py-2 pr-4 font-semibold">
                        Injected at
                      </th>
                      <th scope="col" className="py-2 font-semibold">
                        Scope
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.contentScripts.map((script) => (
                      <tr key={script.index} className="border-b border-[var(--border)] align-top">
                        <td className="py-2 pr-4 font-mono text-xs">{script.index + 1}</td>
                        <td className="py-2 pr-4 text-xs">
                          {script.matches.length === 0
                            ? "—"
                            : script.matches.map((match) => (
                                <span key={match.pattern} className="block font-mono break-all">
                                  {match.pattern}
                                </span>
                              ))}
                        </td>
                        <td className="py-2 pr-4 font-mono text-xs">{script.runAt}</td>
                        <td className="py-2 text-xs leading-6 text-[var(--muted-foreground)]">
                          {script.allFrames ? "All frames" : "Top frame only"} ·{" "}
                          {script.world === "MAIN" ? "page world" : "isolated world"} ·{" "}
                          {script.jsCount} JS, {script.cssCount} CSS
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {(result.background || result.csp || result.externallyConnectable) && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">Execution surface</h2>
              <div className="mt-4 grid gap-3">
                {result.background && (
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      Background
                    </p>
                    <p className="mt-1 font-mono text-xs break-all">
                      {result.background.type}: {result.background.file}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                      {result.background.note}
                    </p>
                  </div>
                )}
                {result.csp && (
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      Content Security Policy
                    </p>
                    {result.csp.entries.map((entry) => (
                      <p key={entry.key} className="mt-1 font-mono text-xs break-all">
                        {entry.key}: {entry.value}
                      </p>
                    ))}
                    {result.csp.findings.length === 0 ? (
                      <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                        No eval, inline or remote script source in the directives parsed.
                      </p>
                    ) : (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
                        {result.csp.findings.map((finding, index) => (
                          <li key={`${finding.source}-${index}`}>
                            <code className="font-mono text-xs">{finding.source}</code> —{" "}
                            {finding.note}
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                      {result.csp.note}
                    </p>
                  </div>
                )}
                {result.externallyConnectable && (
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      externally_connectable
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                      Pages allowed to message this extension:{" "}
                      {result.externallyConnectable.matches.length === 0
                        ? "none"
                        : result.externallyConnectable.matches
                            .map((match) => match.pattern)
                            .join(", ")}
                      {result.externallyConnectable.ids.length > 0
                        ? `; extension ids: ${result.externallyConnectable.ids.join(", ")}`
                        : ""}
                      .
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">What this cannot tell you</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
              <li>
                A manifest declares capability, not behaviour. An extension holding{" "}
                <code className="font-mono">&lt;all_urls&gt;</code> may never touch a page; one
                holding <code className="font-mono">activeTab</code> may still misuse it. Only
                reading the JavaScript settles that.
              </li>
              <li>
                Nothing here checks who published the extension, whether ownership changed hands, or
                what an update might add. Permissions can grow silently within the same class.
              </li>
              <li>
                Permissions granted at runtime through{" "}
                <code className="font-mono">chrome.permissions.request()</code> never appear in the
                manifest at all beyond the optional arrays shown above.
              </li>
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
