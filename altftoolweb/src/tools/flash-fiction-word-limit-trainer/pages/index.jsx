"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Target } from "lucide-react";
import {
  LIMIT_PRESETS,
  MAX_LIMIT,
  MIN_LIMIT,
  READ_ALOUD_WPM,
  SILENT_READING_WPM,
  analyseDraft,
  formatDuration,
} from "../lib";

const SAMPLE = `The pass closed three weeks early, which the almanac had no opinion about. We stood at the barrier and read the notice twice, as if the second reading might soften it.

Anil said we should go back. He said it the way people say things they want argued out of them. Nobody argued. We turned around and walked, and the mountain kept its shape behind us, and none of us looked at it again.`;

const DEFAULTS = {
  presetId: "drabble",
  customLimit: 100,
  splitHyphens: false,
  text: SAMPLE,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-IN");
const DEC = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

export default function ToolHome() {
  const [presetId, setPresetId] = useState(DEFAULTS.presetId);
  const [customLimit, setCustomLimit] = useState(String(DEFAULTS.customLimit));
  const [splitHyphens, setSplitHyphens] = useState(DEFAULTS.splitHyphens);
  const [text, setText] = useState(DEFAULTS.text);
  const [copied, setCopied] = useState(false);

  const preset = LIMIT_PRESETS.find((item) => item.id === presetId) || null;
  const limit = preset ? preset.limit : Number(customLimit);
  const exact = preset ? preset.exact : false;

  const report = useMemo(
    () => analyseDraft({ text, limit, exact, splitHyphens }),
    [text, limit, exact, splitHyphens],
  );

  const summary = useMemo(() => {
    if (report.error) return "";
    return [
      `Flash fiction word budget — ${preset ? preset.label : "Custom"} (${NUM.format(report.limit)} words)`,
      `Words: ${NUM.format(report.words)} / ${NUM.format(report.limit)} (${DEC.format(report.percentUsed)}%)`,
      report.status === "over"
        ? `Over by: ${NUM.format(report.over)}`
        : `Headroom: ${NUM.format(report.headroom)}`,
      `Sentences: ${NUM.format(report.sentences)} (average ${DEC.format(report.averageSentenceWords)} words, longest ${NUM.format(report.longestSentence)})`,
      `Cuttable words flagged: ${NUM.format(report.cuttableWords)}`,
      `Read aloud: ${formatDuration(report.readAloudSeconds)}`,
    ].join("\n");
  }, [report, preset]);

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
    setPresetId(DEFAULTS.presetId);
    setCustomLimit(String(DEFAULTS.customLimit));
    setSplitHyphens(DEFAULTS.splitHyphens);
    setText(DEFAULTS.text);
    setCopied(false);
  };

  const barPercent = report.error ? 0 : report.barPercent;
  const overBudget = !report.error && report.status === "over";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Target className="h-4 w-4" aria-hidden="true" />
          Flash fiction
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Flash Fiction Word Limit Trainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Live word counting against a fixed budget, using the contest rule that a hyphenated
          compound counts as one word. When you go over, it tells you which words to cut first.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ff-preset">
              Form / limit
            </label>
            <select
              id="ff-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={presetId}
              onChange={(event) => setPresetId(event.target.value)}
            >
              {LIMIT_PRESETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — {item.exact ? "exactly" : "up to"} {item.limit} words
                </option>
              ))}
              <option value="custom">Custom limit</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ff-custom">
              Custom word limit
            </label>
            <input
              id="ff-custom"
              className={`mt-2 ${INPUT_CLASS} disabled:opacity-50`}
              type="number"
              inputMode="numeric"
              min={MIN_LIMIT}
              max={MAX_LIMIT}
              step="10"
              value={customLimit}
              disabled={Boolean(preset)}
              onChange={(event) => setCustomLimit(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {preset ? preset.note : `Between ${MIN_LIMIT} and ${NUM.format(MAX_LIMIT)} words.`}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <input
            id="ff-hyphen"
            type="checkbox"
            className="mt-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={splitHyphens}
            onChange={(event) => setSplitHyphens(event.target.checked)}
          />
          <label className="text-sm leading-6" htmlFor="ff-hyphen">
            Count each half of a hyphenated compound separately
            <span className="block text-xs text-[var(--muted-foreground)]">
              Off by default — most guidelines count “well-lit” as one word. Turn on only if your
              contest says otherwise.
            </span>
          </label>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="ff-text">
            Your draft
          </label>
          <textarea
            id="ff-text"
            className="mt-2 min-h-56 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-medium leading-7 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste or write your story here. The counter excludes the title — paste the body only."
          />
        </div>
      </section>

      {report.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {report.error}
          </p>
          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Word count
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">—</p>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Word count
                </p>
                <p
                  className={`mt-1 text-4xl font-semibold ${overBudget ? "text-[var(--danger)]" : "text-[var(--primary)]"}`}
                >
                  {NUM.format(report.words)}
                  <span className="text-2xl text-[var(--muted-foreground)]"> / {NUM.format(report.limit)}</span>
                </p>
                <p
                  className={`mt-1 text-sm font-medium ${overBudget ? "text-[var(--danger)]" : "text-[var(--muted-foreground)]"}`}
                  aria-live="polite"
                >
                  {report.message}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copyResult} aria-label="Copy word budget report" className={GHOST_BTN}>
                  {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copied ? "Copied!" : "Copy report"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset the trainer" className={PRIMARY_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <div
              className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${DEC.format(report.percentUsed)} percent of the word budget used`}
            >
              <span
                className={`block h-full ${overBudget ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
                style={{ width: `${barPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {DEC.format(report.percentUsed)}% of budget used
            </p>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                [overBudget ? "Words over budget" : "Words still available", NUM.format(overBudget ? report.over : report.headroom)],
                ["Sentences", NUM.format(report.sentences)],
                ["Paragraphs", NUM.format(report.paragraphs)],
                ["Average sentence length", `${DEC.format(report.averageSentenceWords)} words`],
                ["Longest sentence", `${NUM.format(report.longestSentence)} words`],
                ["Distinct words", `${NUM.format(report.uniqueWords)} (${DEC.format(report.uniqueRatioPercent)}% of total)`],
                ["Characters (with spaces)", NUM.format(report.characters)],
                [`Read aloud at ${READ_ALOUD_WPM} wpm`, formatDuration(report.readAloudSeconds)],
                [`Silent read at ${SILENT_READING_WPM} wpm`, formatDuration(report.silentReadSeconds)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Cut these first</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {report.cuttableWords > 0
                ? `${NUM.format(report.cuttableWords)} word${report.cuttableWords === 1 ? "" : "s"} in your draft are the usual first casualties. Removing all of them would take you to ${NUM.format(report.wordsAfterCuts)} words.`
                : "Nothing flagged — no intensifiers, hedges or filter verbs found in this draft."}
            </p>
            {report.cutCandidates.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">Word</th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">Uses</th>
                      <th scope="col" className="py-2 font-semibold">Why it is flagged</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.cutCandidates.map((item) => (
                      <tr key={item.word} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 font-semibold">{item.word}</td>
                        <td className="py-2 pr-3 text-right">{NUM.format(item.count)}</td>
                        <td className="py-2 text-[var(--muted-foreground)]">
                          {item.group}: {item.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Counting rules differ slightly between competitions — some exclude the title, some count
        “well-lit” as two words. Check the guidelines you are submitting to and match the settings
        above before you trust the final number.
      </p>
    </main>
  );
}
