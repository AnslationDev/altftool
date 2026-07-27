"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Megaphone, RotateCcw } from "lucide-react";
import { scanCaption } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const SAMPLE = [
  "Stop scrolling — this one changes everything.",
  "",
  "✨ Elevate your storytelling",
  "🚀 Unlock consistent reach",
  "💡 Harness what already works",
  "",
  "It's not just a strategy, it's a habit.",
  "",
  "#motivation #success #mindset #contentcreator #viral #reels",
].join("\n");

const DEFAULTS = { text: SAMPLE, platform: "instagram" };

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
  const [platform, setPlatform] = useState(DEFAULTS.platform);
  const [copied, setCopied] = useState(false);

  const report = useMemo(() => scanCaption(text, { platform }), [text, platform]);
  const failed = Boolean(report.error);

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "AI Social Caption Detector",
      `Signal score: ${report.score}/100 — ${report.band}`,
      `${NUM.format(report.wordCount)} words · ${NUM.format(report.charCount)} characters · ${NUM.format(report.emojiCount)} emoji · ${NUM.format(report.hashtagCount)} hashtags`,
      "",
      "Signals triggered:",
    ];
    if (report.triggered.length === 0) lines.push("- none");
    for (const signal of report.triggered) {
      lines.push(`- ${signal.label} (${signal.points}/${signal.max}): ${signal.detail}`);
    }
    for (const note of report.platformNotes) lines.push(`- Platform: ${note}`);
    lines.push("", "Heuristic style signals, not proof of authorship.");
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

  const reset = () => {
    setText(DEFAULTS.text);
    setPlatform(DEFAULTS.platform);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Megaphone className="h-4 w-4" aria-hidden="true" />
          AI detection
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Social Caption Detector
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Scores a caption on nine stylistic tells that show up in unedited model output — em
          dashes, stock hooks, emoji bullet lists, hashtag padding and machine-even sentence rhythm.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="asc-platform">
              Platform
            </label>
            <select
              id="asc-platform"
              className={`mt-2 ${INPUT_CLASS}`}
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
            >
              <option value="generic">Any platform</option>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="x">X / Twitter</option>
            </select>
          </div>
          <div className="flex items-end">
            <p className="text-xs leading-5 text-[var(--muted-foreground)]">
              Platform only adds length and hashtag-limit checks. The style score is the same
              everywhere.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="asc-text">
            Caption
          </label>
          <textarea
            id="asc-text"
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
              AI signal score
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
              aria-label="Copy caption scan report"
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
              aria-label="Reset the caption"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!failed && (
          <div
            className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`AI signal score ${report.score} out of 100`}
          >
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: `${Math.max(2, report.score)}%` }}
            />
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Words", failed ? DASH : NUM.format(report.wordCount)],
            ["Characters", failed ? DASH : NUM.format(report.charCount)],
            ["Sentences", failed ? DASH : NUM.format(report.sentenceCount)],
            ["Em dashes", failed ? DASH : NUM.format(report.emDashCount)],
            ["Emoji", failed ? DASH : NUM.format(report.emojiCount)],
            [
              "Hashtags",
              failed
                ? DASH
                : `${NUM.format(report.hashtagCount)} (${NUM.format(report.genericHashtagCount)} generic)`,
            ],
            [
              "Sentence-length variation",
              failed || report.rhythmCv === null ? DASH : report.rhythmCv.toFixed(2),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && report.platformNotes.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Platform limits</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {report.platformNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      )}

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Signal breakdown</h2>
          <ul className="mt-3 space-y-3">
            {report.signals.map((signal) => (
              <li
                key={signal.id}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{signal.label}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      signal.points > 0
                        ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {signal.points} / {signal.max}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                  {signal.detail}
                </p>
                {signal.evidence.length > 0 && (
                  <p className="mt-2 flex flex-wrap gap-1.5">
                    {signal.evidence.map((item, index) => (
                      <span
                        key={`${signal.id}-${index}`}
                        className="max-w-full truncate rounded bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--foreground)]"
                      >
                        {item}
                      </span>
                    ))}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These are style heuristics, not a classifier. A high score means the caption follows
        conventions common in unedited model output — it is not evidence that a person did or did
        not write it. Never use it to accuse someone.
      </p>
    </main>
  );
}
