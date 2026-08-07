"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, Eye, RotateCcw, ShieldCheck, XCircle } from "lucide-react";

import { CATEGORY_LABELS, SAMPLE_TEXT, formatReport, scanText } from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const TH = "py-2 pr-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]";

const RISK_TEXT = {
  high: "text-[var(--danger)]",
  medium: "text-[var(--warning)]",
  low: "text-[var(--muted-foreground)]",
};
const RISK_WRAP = {
  high: "border-l-4 border-[var(--danger)] bg-[var(--danger-soft)]",
  medium: "border-l-4 border-[var(--warning)] bg-[var(--warning-soft)]",
  low: "border-l-4 border-[var(--border)] bg-[var(--muted)]",
};

const VERDICT = {
  high: {
    title: "Deceptive content found",
    detail: "At least one high-risk signal: something here is not what it appears to be.",
    Icon: XCircle,
    text: "text-[var(--danger)]",
    wrap: "bg-[var(--danger-soft)]",
  },
  medium: {
    title: "Worth a second look",
    detail:
      "Nothing high-risk, but characters are present that behave differently from what they resemble.",
    Icon: AlertTriangle,
    text: "text-[var(--warning)]",
    wrap: "bg-[var(--warning-soft)]",
  },
  clean: {
    title: "No hidden or deceptive characters",
    detail: "Every codepoint is ordinary, visible, and each word stays within one script.",
    Icon: ShieldCheck,
    text: "text-[var(--success)]",
    wrap: "bg-[var(--success-soft)]",
  },
};

const DASH = "—";

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
  const [text, setText] = useState(SAMPLE_TEXT);
  const [fold, setFold] = useState(false);

  const result = useMemo(() => scanText(text), [text]);
  const report = useMemo(() => formatReport(result), [result]);
  const cleanedOutput = result.error ? "" : fold ? result.asciiFolded : result.cleaned;
  const verdict = result.error ? null : VERDICT[result.verdict];
  const VerdictIcon = verdict ? verdict.Icon : null;

  const reset = () => {
    setText(SAMPLE_TEXT);
    setFold(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Eye className="h-4 w-4" aria-hidden="true" />
          Nothing leaves this tab
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Hidden Unicode &amp; Homograph Scanner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every codepoint is examined: invisible and zero-width characters, bidirectional controls
          and whether they are balanced, tag characters carrying a hidden ASCII payload, and letters
          borrowed from another script to imitate Latin ones. Hostnames are converted to and from
          Punycode with the RFC 3492 algorithm, so you can see what a browser actually resolves.
        </p>
      </header>

      <section className={CARD}>
        <label className={LABEL_CLASS} htmlFor="scan-input">
          Text to scan — a message, a URL, a filename, a diff hunk
        </label>
        <textarea
          id="scan-input"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          rows={8}
          spellCheck={false}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste anything you are about to trust"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={report} label="Copy report" />
          <button type="button" className={GHOST_BTN} onClick={() => setText("")}>
            Clear
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset}>
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
        <>
          <section
            className={`mt-6 rounded-xl p-5 ${verdict.wrap}`}
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex items-start gap-3">
              <VerdictIcon className={`mt-0.5 h-6 w-6 shrink-0 ${verdict.text}`} aria-hidden="true" />
              <div>
                <h2 className={`text-lg font-bold ${verdict.text}`}>{verdict.title}</h2>
                <p className="mt-1 text-sm leading-6">{verdict.detail}</p>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  {result.counts.codepoints} codepoints · {result.counts.characters} UTF-16 units ·{" "}
                  {result.counts.flagged} flagged ({result.counts.distinct} distinct) ·{" "}
                  {result.counts.high} high risk
                </p>
              </div>
            </div>
          </section>

          {result.findings.length ? (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">What was found</h2>
              <ul className="mt-3 space-y-2">
                {result.findings.map((item, index) => (
                  <li
                    key={`${item.title}-${index}`}
                    className={`rounded-lg p-3 ${RISK_WRAP[item.level] || RISK_WRAP.low}`}
                  >
                    <p className={`text-sm font-semibold ${RISK_TEXT[item.level] || ""}`}>
                      {item.title}
                    </p>
                    <p className="mt-1 break-words text-sm leading-6">{item.detail}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {result.tagPayload ? (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">Decoded tag-character payload</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Codepoints U+E0020 to U+E007E map one-to-one onto printable ASCII and draw nothing at
                all. This is what they spell.
              </p>
              <pre className="mt-3 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm">
                {result.tagPayload}
              </pre>
            </section>
          ) : null}

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">Text with every flagged character marked</h2>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Invisible characters are replaced by their codepoint; look-alike letters keep their
              glyph with the codepoint beside it.
            </p>
            <div className="mt-3 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
              <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-7">
                {result.segments.map((segment, index) =>
                  segment.kind === "text" ? (
                    <span key={index}>{segment.text}</span>
                  ) : (
                    <mark
                      key={index}
                      title={`${segment.item.hex} ${segment.item.name}`}
                      className={`rounded px-1 text-xs font-semibold ${
                        segment.item.risk === "high"
                          ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                          : "bg-[var(--warning-soft)] text-[var(--warning)]"
                      }`}
                    >
                      {segment.item.category === "confusable" ? `${segment.text} ` : ""}
                      {segment.item.hex}
                    </mark>
                  ),
                )}
              </pre>
            </div>
          </section>

          {result.groups.length ? (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">Every flagged codepoint</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th scope="col" className={TH}>
                        Codepoint
                      </th>
                      <th scope="col" className={TH}>
                        Name
                      </th>
                      <th scope="col" className={TH}>
                        Category
                      </th>
                      <th scope="col" className={TH}>
                        Risk
                      </th>
                      <th scope="col" className={TH}>
                        Count
                      </th>
                      <th scope="col" className={TH}>
                        First at
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.groups.map((group) => (
                      <tr
                        key={group.codepoint}
                        className="border-b border-[var(--border)] align-top last:border-0"
                      >
                        <td className="py-2 pr-3 font-mono text-xs">{group.hex}</td>
                        <td className="py-2 pr-3">
                          <span className="font-medium">{group.name}</span>
                          <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                            {group.note}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-xs">
                          {CATEGORY_LABELS[group.category] || group.category}
                        </td>
                        <td className={`py-2 pr-3 text-xs font-semibold ${RISK_TEXT[group.risk]}`}>
                          {group.risk}
                        </td>
                        <td className="py-2 pr-3 font-mono text-xs">{group.count}</td>
                        <td className="py-2 whitespace-nowrap font-mono text-xs">
                          line {group.positions[0].line}, col {group.positions[0].column}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {result.hosts.length ? (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">Hostnames</h2>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Converted both ways with RFC 3492 Bootstring. The A-label is what travels on the wire
                and what a certificate is issued for.
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th scope="col" className={TH}>
                        As written
                      </th>
                      <th scope="col" className={TH}>
                        Renders as
                      </th>
                      <th scope="col" className={TH}>
                        A-label (wire form)
                      </th>
                      <th scope="col" className={TH}>
                        Reads as
                      </th>
                      <th scope="col" className={TH}>
                        Scripts
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    {result.hosts.map((host) => (
                      <tr key={host.host} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 break-all">{host.host}</td>
                        <td className="py-2 pr-3 break-all">{host.unicode}</td>
                        <td className="py-2 pr-3 break-all">{host.ascii}</td>
                        <td
                          className={`py-2 pr-3 break-all ${host.imitates ? "text-[var(--danger)]" : ""}`}
                        >
                          {host.imitates || DASH}
                        </td>
                        <td className="py-2 break-words">
                          {host.scripts.length ? host.scripts.join(" + ") : "Common"}
                          {host.mixedScript ? (
                            <span className="ml-1 text-[var(--danger)]">mixed</span>
                          ) : null}
                          {host.wholeScriptConfusable ? (
                            <span className="ml-1 text-[var(--danger)]">whole-script</span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {result.tokens.length ? (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">Words that are not what they look like</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th scope="col" className={TH}>
                        As written
                      </th>
                      <th scope="col" className={TH}>
                        Folded to Latin
                      </th>
                      <th scope="col" className={TH}>
                        Scripts
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    {result.tokens.map((token) => (
                      <tr key={token.token} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 break-all">{token.token}</td>
                        <td className="py-2 pr-3 break-all text-[var(--primary)]">
                          {token.skeleton}
                        </td>
                        <td className="py-2 break-words">
                          {token.scripts.length ? token.scripts.join(" + ") : "Common"}
                          {token.mixedScript ? (
                            <span className="ml-1 text-[var(--danger)]">mixed</span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          <section className={`mt-6 ${CARD}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Cleaned text</h2>
              <label className="inline-flex min-h-11 items-center gap-2 text-sm" htmlFor="fold-toggle">
                <input
                  id="fold-toggle"
                  type="checkbox"
                  checked={fold}
                  onChange={(event) => setFold(event.target.checked)}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                Also fold look-alike letters to Latin
              </label>
            </div>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Invisible characters, control codes and private-use codepoints are removed, and unusual
              spaces become plain spaces. Folding look-alikes is off by default because it rewrites
              genuinely non-Latin text.
            </p>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm">
              {cleanedOutput}
            </pre>
            <div className="mt-3">
              <CopyButton text={cleanedOutput} label="Copy cleaned text" />
            </div>
          </section>

          <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-5">
            <h2 className="text-base font-semibold">Where this stops</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.limits.map((note) => (
                <li key={note}>{note}</li>
              ))}
              <li>
                No domain is looked up. Whether a hostname is registered, who owns it, or whether a
                certificate exists for it are questions this page cannot answer offline.
              </li>
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
