"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ScanText } from "lucide-react";
import { CATEGORIES, scanForTells } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DEC = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const PCT = new Intl.NumberFormat("en-IN", { style: "percent", maximumFractionDigits: 1 });
const DASH = "—";

const SAMPLE = [
  "In today's fast-paced world, teams must delve into the ever-evolving landscape of remote collaboration.",
  "",
  "Our platform stands as a testament to seamless design, empowering you to harness a plethora of robust features and unlock the potential of your workflow. It is important to note that this transformative approach plays a crucial role in taking your productivity to the next level.",
].join("\n");

const ALL_CATEGORIES = Object.keys(CATEGORIES);
const DEFAULTS = { text: SAMPLE, categories: ALL_CATEGORIES };

const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [categories, setCategories] = useState(DEFAULTS.categories);
  const [copied, setCopied] = useState(false);

  const report = useMemo(() => scanForTells(text, { categories }), [text, categories]);
  const failed = Boolean(report.error);

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "AI Writing Tell Scanner",
      `Filler score: ${report.score}/100 — ${report.band}`,
      `${NUM.format(report.totalHits)} hits across ${NUM.format(report.distinctPhrases)} distinct phrases in ${NUM.format(report.words)} words (${DEC.format(report.density)} weighted hits per 1,000 words)`,
      "",
      "Phrase\tCount\tSuggested replacement",
    ];
    for (const match of report.matches) {
      lines.push(`${match.phrase}\t${match.count}\t${match.fix}`);
    }
    if (report.matches.length === 0) lines.push("(no phrases from the bank were found)");
    return lines.join("\n");
  }, [failed, report]);

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

  const toggleCategory = (key) => {
    setCategories((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  const reset = () => {
    setText(DEFAULTS.text);
    setCategories(DEFAULTS.categories);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ScanText className="h-4 w-4" aria-hidden="true" />
          AI detection
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">AI Writing Tell Scanner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Highlights the words and phrases that pile up in unedited model output — delve, tapestry,
          testament, seamless, &quot;it is important to note&quot; — and suggests a plainer
          replacement for each.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <p className={LABEL_CLASS} id="tell-cat-label">
          Categories to scan
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-labelledby="tell-cat-label">
          {ALL_CATEGORIES.map((key) => (
            <label
              key={key}
              htmlFor={`tell-cat-${key}`}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
            >
              <input
                id={`tell-cat-${key}`}
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={categories.includes(key)}
                onChange={() => toggleCategory(key)}
              />
              {CATEGORIES[key]}
            </label>
          ))}
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="tell-text">
            Draft
          </label>
          <textarea
            id="tell-text"
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
              Filler score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${report.score}/100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? DASH : `${report.band} — ${report.bandNote}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the phrase report"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
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
            ["Flagged phrases found", failed ? DASH : NUM.format(report.totalHits)],
            ["Distinct phrases", failed ? DASH : NUM.format(report.distinctPhrases)],
            [
              "Weighted hits per 1,000 words",
              failed ? DASH : DEC.format(report.density),
            ],
            ["Words untouched by a flag", failed ? DASH : PCT.format(report.cleanWordShare)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <div className="mt-4 flex flex-wrap gap-2">
            {report.byCategory.map((entry) => (
              <span
                key={entry.key}
                className="rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]"
              >
                {entry.label}: {NUM.format(entry.count)}
              </span>
            ))}
          </div>
        )}
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your draft, highlighted</h2>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7">
            {report.segments.map((segment, index) =>
              segment.hit ? (
                <mark
                  key={index}
                  title={`Try: ${segment.fix}`}
                  className="rounded bg-[var(--danger-soft)] px-1 font-semibold text-[var(--danger)]"
                >
                  {segment.text}
                </mark>
              ) : (
                <span key={index}>{segment.text}</span>
              ),
            )}
          </p>
        </section>
      )}

      {!failed && report.matches.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What to write instead</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Phrase
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Count
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Try instead
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.matches.map((match) => (
                  <tr key={match.phrase} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {match.phrase}
                      <span className="mt-0.5 block text-xs font-normal text-[var(--muted-foreground)]">
                        {match.categoryLabel}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right">{NUM.format(match.count)}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{match.fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Every word in the bank is ordinary English that a person may use on purpose. A highlight
        means &quot;check whether this is doing work&quot;, not &quot;this was generated&quot;. No
        text is uploaded — the scan runs in your browser.
      </p>
    </main>
  );
}
