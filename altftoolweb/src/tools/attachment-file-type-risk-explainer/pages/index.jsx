"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileWarning, RotateCcw } from "lucide-react";
import { assessAttachment, extensionsByFamily, FAMILIES } from "../lib";

const DEFAULT_NAME = "Invoice_4471.pdf.exe";

const SAMPLES = [
  ["Double extension", "Invoice_4471.pdf.exe"],
  ["Macro document", "Salary_Revision.docm"],
  ["Shortcut", "Statement_Nov.lnk"],
  ["Ordinary PDF", "Quarterly Report.pdf"],
];

const LEVEL_STYLE = {
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warn: "bg-[var(--warning-soft)] text-[var(--warning)]",
  info: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};
const LEVEL_LABEL = { danger: "Serious", warn: "Check", info: "Note" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [name, setName] = useState(DEFAULT_NAME);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => assessAttachment(name), [name]);
  const failed = Boolean(result.error);
  const grouped = useMemo(() => extensionsByFamily(), []);

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "Attachment File Type Risk Explainer",
      `File: ${result.name}`,
      `Extension chain: ${result.extensions.length > 0 ? result.extensions.map((ext) => `.${ext}`).join(" ") : "(none)"}`,
      `Deciding extension: ${result.primaryExtension ? `.${result.primaryExtension}` : "(none)"}`,
      `Category: ${result.familyLabel}`,
      `Risk score: ${result.score} / 100 — ${result.verdict}`,
      `What to do: ${result.advice}`,
    ];
    if (result.findings.length > 0) {
      lines.push("Findings:");
      result.findings.forEach((finding) => {
        lines.push(`- [${LEVEL_LABEL[finding.level]}] ${finding.title}: ${finding.detail}`);
      });
    }
    lines.push("Safe handling:");
    result.handling.forEach((step) => lines.push(`- ${step}`));
    return lines.join("\n");
  }, [failed, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setName(DEFAULT_NAME);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileWarning className="h-4 w-4" aria-hidden="true" />
          Attachment safety
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Attachment File Type Risk Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Type the file name exactly as your mail client shows it. The rating comes from what the
          operating system does with that extension when it is double-clicked — plus the disguises
          used to make a dangerous file look ordinary. Nothing is uploaded; only the name is read.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="attachment-name">
          Attachment file name
        </label>
        <input
          id="attachment-name"
          className={`mt-2 ${INPUT_CLASS}`}
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          On Windows, switch on View &rarr; File name extensions first, or the name you see is
          already missing the part that matters.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SAMPLES.map(([label, sample]) => (
            <button
              key={label}
              type="button"
              onClick={() => setName(sample)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {label}
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
              Risk score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${result.score} / 100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? DASH : result.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the attachment risk assessment"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the file name" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-[var(--foreground)]">
          {failed ? DASH : result.advice}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Deciding extension (the last one)",
              failed ? DASH : result.primaryExtension ? `.${result.primaryExtension}` : "none",
            ],
            [
              "Full extension chain",
              failed
                ? DASH
                : result.extensions.length > 0
                  ? result.extensions.map((ext) => `.${ext}`).join(" ")
                  : "none",
            ],
            ["Category", failed ? DASH : result.familyLabel],
            ["What that category means", failed ? DASH : result.familySummary],
            ["Blocked by Outlook by default", failed ? DASH : result.outlookBlocked ? "Yes" : "No"],
            ["In this reference", failed ? DASH : result.known ? "Yes" : "No"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="max-w-[60%] break-words text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.extensionNote && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.extensionNote}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">
          Findings{failed ? "" : ` (${result.findings.length})`}
        </h2>
        {failed ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        ) : result.findings.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            No disguise in the name itself. The file type alone still does not tell you whether the
            message is genuine.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {result.findings.map((finding) => (
              <li key={finding.id} className="rounded-lg border border-[var(--border)] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${LEVEL_STYLE[finding.level]}`}>
                    {LEVEL_LABEL[finding.level]}
                  </span>
                  <span className="text-sm font-semibold">{finding.title}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{finding.detail}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Safe handling for this file</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.handling.map((step) => (
              <li key={step} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--primary)]">&bull;</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Extension cheat sheet</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Category</th>
                <th scope="col" className="py-2 font-semibold">Extensions</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(grouped).map((family) => (
                <tr key={family} className="border-b border-[var(--border)] align-top last:border-0">
                  <td className="py-2 pr-3 font-semibold">{FAMILIES[family]?.label || family}</td>
                  <td className="py-2 font-mono text-xs leading-6 text-[var(--muted-foreground)]">
                    {grouped[family].map((ext) => `.${ext}`).join("  ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This reads the file name only — it never opens or scans the file, so a low score is not a
        clean bill of health and a high score is not proof of malware. Follow your organisation's
        reporting process for anything suspicious.
      </p>
    </main>
  );
}
