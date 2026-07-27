"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Minus, RotateCcw } from "lucide-react";
import { checkTells, replaceEmDashes, EM_DASH_FLAG_PER_1000 } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DEC = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const SAMPLE = [
  "The landscape of remote work has shifted; moreover, teams now expect asynchronous defaults by design.",
  "",
  "Furthermore, managers must adapt their rituals, their tooling, and their expectations. Ultimately, the winners will be the teams that document decisions, share context, and trust each other. It is not just a policy change — it is a cultural one.",
  "",
  "Additionally, the tools we choose shape the habits we keep, the meetings we hold, and the trust we build. Indeed, that is the whole point.",
].join("\n");

const REPLACEMENTS = [
  { value: ", ", label: "comma" },
  { value: ". ", label: "full stop" },
  { value: " - ", label: "spaced hyphen" },
  { value: " (", label: "opening bracket" },
];

const DEFAULTS = { text: SAMPLE, threshold: String(EM_DASH_FLAG_PER_1000), replacement: ", " };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [threshold, setThreshold] = useState(DEFAULTS.threshold);
  const [replacement, setReplacement] = useState(DEFAULTS.replacement);
  const [copied, setCopied] = useState("");

  const report = useMemo(
    () => checkTells(text, { emDashFlagPer1000: Number(threshold) }),
    [text, threshold],
  );
  const failed = Boolean(report.error);

  const cleaned = useMemo(() => replaceEmDashes(text, replacement), [text, replacement]);

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "Em Dash AI Tell Checker",
      `Tell score: ${report.score}/100 — ${report.band}`,
      `${NUM.format(report.words)} words · ${NUM.format(report.sentenceCount)} sentences · ${NUM.format(report.paragraphCount)} paragraphs`,
      `Em dashes: ${NUM.format(report.emDashCount)} (${DEC.format(report.emDashPer1000)} per 1,000 words)`,
      "",
      "Tells:",
    ];
    for (const tell of report.tells) {
      lines.push(
        `${tell.flagged ? "[flag]" : "[ ok ]"} ${tell.label}: ${tell.id.endsWith("rhythm") ? DEC.format(tell.rate) : `${NUM.format(tell.count)} (${DEC.format(tell.rate)}/1k)`}`,
      );
    }
    return lines.join("\n");
  }, [failed, report]);

  const copy = async (value, key) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setText(DEFAULTS.text);
    setThreshold(DEFAULTS.threshold);
    setReplacement(DEFAULTS.replacement);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Minus className="h-4 w-4" aria-hidden="true" />
          AI detection
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Em Dash AI Tell Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Counts em dashes, curly quotes, semicolons, sentence-initial connectives and rule-of-three
          lists in your draft, reports each as a rate per 1,000 words, and shows exactly where they
          are.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ed-threshold">
              Em dash flag threshold (per 1,000 words)
            </label>
            <input
              id="ed-threshold"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ed-replacement">
              Replace em dashes with
            </label>
            <select
              id="ed-replacement"
              className={`mt-2 ${INPUT_CLASS}`}
              value={replacement}
              onChange={(event) => setReplacement(event.target.value)}
            >
              {REPLACEMENTS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="ed-text">
            Draft
          </label>
          <textarea
            id="ed-text"
            rows={10}
            className={`mt-2 ${TEXTAREA_CLASS}`}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {report.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Em dashes per 1,000 words
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : DEC.format(report.emDashPer1000)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? DASH
                : `${NUM.format(report.emDashCount)} em dash${report.emDashCount === 1 ? "" : "es"} in ${NUM.format(report.words)} words · overall tell score ${report.score}/100 (${report.band})`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy(summary, "report")}
              aria-label="Copy tell report"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied === "report" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "report" ? "Copied!" : "Copy report"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the draft"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Words", failed ? DASH : NUM.format(report.words)],
            ["Sentences", failed ? DASH : NUM.format(report.sentenceCount)],
            ["Paragraphs", failed ? DASH : NUM.format(report.paragraphCount)],
            [
              "Average sentence length",
              failed ? DASH : `${DEC.format(report.averageSentenceWords)} words`,
            ],
            ["Semicolons", failed ? DASH : NUM.format(report.semicolonCount)],
            ["Curly quotes", failed ? DASH : NUM.format(report.smartQuoteCount)],
            ["Ellipsis characters", failed ? DASH : NUM.format(report.ellipsisCount)],
            [
              "Sentence-length variation",
              failed || report.sentenceCv === null ? DASH : DEC.format(report.sentenceCv),
            ],
            [
              "Paragraph-length variation",
              failed || report.paragraphCv === null ? DASH : DEC.format(report.paragraphCv),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Tell by tell</h2>
          <ul className="mt-3 space-y-3">
            {report.tells.map((tell) => (
              <li
                key={tell.id}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{tell.label}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      tell.flagged
                        ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {tell.id.endsWith("rhythm")
                      ? `variation ${DEC.format(tell.rate)}`
                      : `${NUM.format(tell.count)} · ${DEC.format(tell.rate)}/1k`}
                  </span>
                </div>
                {tell.flagged && (
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{tell.fix}</p>
                )}
                {tell.snippets.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {tell.snippets.map((snippet, index) => (
                      <li
                        key={`${tell.id}-${index}`}
                        className="rounded bg-[var(--muted)] px-2 py-1 text-xs leading-5 text-[var(--foreground)]"
                      >
                        {snippet}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!failed && report.emDashCount > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Draft with em dashes replaced</h2>
            <button
              type="button"
              onClick={() => copy(cleaned, "cleaned")}
              aria-label="Copy the draft with em dashes replaced"
              className={GHOST_BTN}
            >
              {copied === "cleaned" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "cleaned" ? "Copied!" : "Copy draft"}
            </button>
          </div>
          <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-md bg-[var(--muted)] p-3 text-sm leading-6 text-[var(--foreground)]">
            {cleaned}
          </pre>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Mechanical replacement — re-read each spot, since a comma is not always the right
            substitute for a dash.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The thresholds here are this tool&apos;s editorial defaults, not measured corpus frequencies.
        Punctuation habits vary by writer and house style, so a high score means &quot;re-read
        this&quot;, never &quot;a machine wrote this&quot;.
      </p>
    </main>
  );
}
