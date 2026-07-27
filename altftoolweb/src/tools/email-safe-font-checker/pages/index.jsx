"use client";

import { useMemo, useState } from "react";
import { CaseSensitive, Check, Copy, RotateCcw } from "lucide-react";
import { SAFE_STACKS, analyzeStack, formatReport } from "../lib";

const PCT = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  stack: "Inter, 'Helvetica Neue', Arial, sans-serif",
  webfontFamily: "Inter",
  sample: "Your February update is here",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SOURCE_LABEL = {
  installed: "Pre-installed",
  webfont: "Webfont loaded",
  generic: "Generic keyword",
  "system-alias": "System UI alias",
  "client-default": "Client default",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(
    () => analyzeStack({ stack: form.stack, webfontFamily: form.webfontFamily }),
    [form.stack, form.webfontFamily],
  );

  const failed = Boolean(result.error);
  const report = useMemo(() => formatReport(result), [result]);

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CaseSensitive className="h-4 w-4" aria-hidden="true" />
          Email typography
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Email Safe Font Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a CSS font-family stack and see, client by client, which family actually renders.
          Two things decide it: whether the client honours <code>@font-face</code>, and which
          families the operating system already has installed.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="font-stack">
            font-family stack
          </label>
          <input
            id="font-stack"
            className={`mt-2 ${INPUT_CLASS}`}
            type="text"
            value={form.stack}
            onChange={(event) => setField("stack", event.target.value)}
            placeholder="Georgia, 'Times New Roman', serif"
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="font-webfont">
              Family loaded via @font-face (optional)
            </label>
            <input
              id="font-webfont"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.webfontFamily}
              onChange={(event) => setField("webfontFamily", event.target.value)}
              placeholder="Inter"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="font-sample">
              Preview text
            </label>
            <input
              id="font-sample"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.sample}
              onChange={(event) => setField("sample", event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SAFE_STACKS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={CHIP_BTN}
              onClick={() => setField("stack", preset.stack)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Subscribers who see your first choice
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : PCT.format(result.exactShare)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Enter a stack to resolve it."
                : `${result.exactCount} of ${result.clientCount} clients render ${result.intended}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={GHOST_BTN}
              aria-label="Copy the font stack report"
              onClick={() => copy(report, "report")}
              disabled={failed}
            >
              {copied === "report" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "report" ? "Copied!" : "Copy report"}
            </button>
            <button type="button" className={PRIMARY_BTN} aria-label="Reset all inputs" onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Rendered on this device with your stack
          </p>
          <p
            className="mt-2 text-2xl leading-snug"
            style={{ fontFamily: failed ? undefined : result.families.join(", ") }}
          >
            {form.sample || DASH}
          </p>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Families in the stack", failed ? DASH : String(result.families.length)],
            ["Ends in a generic keyword", failed ? DASH : result.hasGenericTail ? "Yes" : "No"],
            [
              "Clients falling through to their own default",
              failed ? DASH : String(result.defaultCount),
            ],
            ["Overall", failed ? DASH : result.verdict === "safe" ? "Safe to send" : "Needs a tweak"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Suggested safe stack
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <code className="break-all text-sm font-semibold">{result.suggestedStack}</code>
              <button
                type="button"
                className={GHOST_BTN}
                aria-label="Copy the suggested font stack"
                onClick={() => copy(result.suggestedStack, "stack")}
              >
                {copied === "stack" ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied === "stack" ? "Copied!" : "Copy stack"}
              </button>
            </div>
          </div>
        )}
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Client by client</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Client</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Renders</th>
                  <th scope="col" className="py-2 font-semibold">Why</th>
                </tr>
              </thead>
              <tbody>
                {result.clients.map((client) => (
                  <tr key={client.id} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2.5 pr-3">
                      <span className="font-semibold">{client.name}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">{client.note}</span>
                    </td>
                    <td
                      className={`py-2.5 pr-3 font-semibold ${
                        client.exact ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {client.rendered}
                    </td>
                    <td className="py-2.5 text-xs text-[var(--muted-foreground)]">
                      {SOURCE_LABEL[client.source] || client.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-5 text-sm font-semibold">What subscribers end up seeing</h3>
          <ul className="mt-2 flex flex-wrap gap-2 text-xs">
            {result.renderedBreakdown.map((item) => (
              <li
                key={item.name}
                className="rounded-md border border-[var(--border)] px-2.5 py-1.5 font-semibold text-[var(--muted-foreground)]"
              >
                {item.name} · {PCT.format(item.share)}
              </li>
            ))}
          </ul>

          {result.warnings.length > 0 && (
            <>
              <h3 className="mt-5 text-sm font-semibold">Warnings</h3>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
                {result.warnings.map((warning) => (
                  <li key={warning} className="border-l-2 border-[var(--primary)] pl-3">
                    {warning}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Client behaviour and bundled font sets change over time and vary by version, corporate
        policy and user settings. Treat this as a planning guide, then confirm with a real
        rendering test before a large send.
      </p>
    </main>
  );
}
