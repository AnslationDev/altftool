"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, ListChecks, RotateCcw } from "lucide-react";

import {
  CHECKLIST_PHASES,
  THRESHOLDS,
  buildReport,
  prioritiseChecklist,
  scanDraft,
  scoreChecklist,
} from "../lib";

const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const ONE_DP = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[200px] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SAMPLE_DRAFT = `In today's fast-paced digital age, businesses must delve into the ever-evolving landscape of customer experience. It is important to note that a robust solution can unlock the potential of your team. Moreover, seamless integration plays a pivotal role in modern operations. Furthermore, companies that harness the power of automation often see significant improvement. Additionally, the realm of analytics offers a myriad of opportunities for growth. In conclusion, organisations should embark on a journey toward a truly data-driven culture.`;

const DASH = "—";

export default function ToolHome() {
  const [draft, setDraft] = useState(SAMPLE_DRAFT);
  const [checked, setChecked] = useState([]);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const scan = useMemo(() => scanDraft(draft), [draft]);
  const score = useMemo(() => scoreChecklist(checked), [checked]);
  const items = useMemo(() => prioritiseChecklist(scan), [scan]);
  const report = useMemo(() => buildReport({ scan, score }), [scan, score]);

  const scanOk = !scan.error;

  const toggle = (id) =>
    setChecked((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const copyReport = async () => {
    if (report.error) return;
    try {
      await navigator.clipboard.writeText(report.text);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        copyTimeoutRef.current = null;
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    const hasChanges = draft !== SAMPLE_DRAFT || checked.length > 0;
    if (hasChanges && !window.confirm("Reset will replace your draft with the sample text and clear all checked edits. Continue?")) {
      return;
    }
    setDraft(SAMPLE_DRAFT);
    setChecked([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Editing workflow
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">AI Humanizer Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste an AI draft. The scan measures the habits that make writing read mechanically —
          over-used connectors, uniform sentence length, dash density, repeated openers —
          and pushes the matching edits to the top of a fifteen-step checklist.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="ahc-draft">
          Your draft
        </label>
        <textarea
          id="ahc-draft"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Paste the AI draft you want to rewrite in your own voice…"
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Text stays in your browser — nothing is uploaded.
        </p>
      </section>

      {scan.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {scan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Checklist completed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]" aria-live="polite" aria-atomic="true">
              {INT.format(score.percent)}%
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {INT.format(score.doneCount)} of {INT.format(score.totalCount)} edits ticked, weighted
              by impact
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyReport}
              aria-label="Copy the scan and checklist report"
              className={GHOST_BTN}
              disabled={Boolean(report.error)}
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
              aria-label="Reset the draft and checklist"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={`Checklist ${INT.format(score.percent)} percent complete`}
        >
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${Math.max(0, Math.min(100, score.percent))}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" aria-atomic="true">
          {[
            ["Signals raised", scanOk ? `${INT.format(scan.flagCount)} of ${INT.format(scan.flagTotal)}` : DASH],
            ["Words / sentences", scanOk ? `${INT.format(scan.words)} / ${INT.format(scan.sentences)}` : DASH],
            [
              "Mean sentence length",
              scanOk ? `${ONE_DP.format(scan.meanSentenceWords)} words` : DASH,
            ],
            [
              "Sentence-length variation",
              scanOk ? `${ONE_DP.format(scan.sentenceStdDev)} words std dev` : DASH,
            ],
            [
              "Shortest / longest sentence",
              scanOk
                ? `${INT.format(scan.shortestSentenceWords)} / ${INT.format(scan.longestSentenceWords)} words`
                : DASH,
            ],
            [
              "Over-used phrases",
              scanOk
                ? `${INT.format(scan.phraseCount)} (${ONE_DP.format(scan.rates.phrasePerThousand)} per 1,000 words)`
                : DASH,
            ],
            [
              "Hedge words",
              scanOk
                ? `${INT.format(scan.hedgeCount)} (${ONE_DP.format(scan.rates.hedgePerThousand)} per 1,000)`
                : DASH,
            ],
            [
              "Em / en dashes",
              scanOk
                ? `${INT.format(scan.dashCount)} (${ONE_DP.format(scan.rates.dashPerThousand)} per 1,000)`
                : DASH,
            ],
            [
              "-ly adverbs",
              scanOk
                ? `${INT.format(scan.adverbCount)} (${ONE_DP.format(scan.rates.adverbPerThousand)} per 1,000)`
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {scanOk && scan.phraseHits.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold">Phrases to cut</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {scan.phraseHits.map((hit) => (
                <li
                  key={hit.phrase}
                  className="rounded-md bg-[var(--muted)] px-2.5 py-1 text-xs font-medium text-[var(--muted-foreground)]"
                >
                  {hit.phrase} × {INT.format(hit.hits)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {scanOk && scan.repeatedOpeners.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold">Repeated sentence openers</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {scan.repeatedOpeners.map((item) => (
                <li
                  key={item.word}
                  className="rounded-md bg-[var(--muted)] px-2.5 py-1 text-xs font-medium text-[var(--muted-foreground)]"
                >
                  “{item.word}” starts {INT.format(item.count)} sentences
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">The edits, most urgent first</h2>
          <button
            type="button"
            onClick={() => setChecked([])}
            className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            Clear ticks
          </button>
        </div>
        <ul className="mt-3 grid gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <label
                htmlFor={`ahc-${item.id}`}
                className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border px-3 py-3 transition ${
                  item.flagged
                    ? "border-[var(--primary)] bg-[var(--muted)]"
                    : "border-[var(--border)] bg-[var(--background)]"
                }`}
              >
                <input
                  id={`ahc-${item.id}`}
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={checked.includes(item.id)}
                  onChange={() => toggle(item.id)}
                />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{item.action}</span>
                    {item.flagged && (
                      <span className="rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--danger)]">
                        signal raised
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                    {item.phase} · weight {INT.format(item.weight)} · {item.why}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Phases: {CHECKLIST_PHASES.join(" → ")}. Items whose signal fired in the scan are pinned to
          the top.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Where the thresholds come from</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Signal</th>
                <th scope="col" className="py-2 text-right font-semibold">Threshold</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Sentence-length std dev", `below ${INT.format(THRESHOLDS.lowBurstinessStdDev)} words`],
                ["Mean sentence length", `above ${INT.format(THRESHOLDS.longMeanSentenceWords)} words`],
                ["Over-used phrases", `above ${INT.format(THRESHOLDS.phrasePerThousandWords)} per 1,000 words`],
                ["Hedge words", `above ${INT.format(THRESHOLDS.hedgePerThousandWords)} per 1,000 words`],
                ["Em / en dashes", `above ${INT.format(THRESHOLDS.dashPerThousandWords)} per 1,000 words`],
                ["-ly adverbs", `above ${INT.format(THRESHOLDS.adverbPerThousandWords)} per 1,000 words`],
                ["Repeated opener", `same word starts ${INT.format(THRESHOLDS.repeatedOpenerCount)}+ sentences`],
              ].map(([label, value]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{label}</td>
                  <td className="py-2 text-right font-semibold">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This is an editing aid, not an AI detector. Raised signals mean the prose reads
        mechanically; they are not evidence about who or what wrote it, and no AI-detection score
        should be used to accuse anyone.
      </p>
    </main>
  );
}
