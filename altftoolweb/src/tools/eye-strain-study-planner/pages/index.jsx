"use client";

import { useMemo, useState } from "react";
import { BookOpen, Check, Copy, Eye, Monitor, RotateCcw } from "lucide-react";

import { EYE_MICRO_BREAK_SECONDS, planEyeFriendlyStudy } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  total: "180",
  block: "25",
  share: "60",
  rest: "5",
};

const DASH = "—";

export default function ToolHome() {
  const [total, setTotal] = useState(DEFAULTS.total);
  const [block, setBlock] = useState(DEFAULTS.block);
  const [share, setShare] = useState(DEFAULTS.share);
  const [rest, setRest] = useState(DEFAULTS.rest);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planEyeFriendlyStudy({
        totalMinutes: total.trim() === "" ? Number.NaN : Number(total),
        blockMinutes: Number(block),
        screenSharePercent: Number(share),
        restMinutes: Number(rest),
      }),
    [total, block, share, rest],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const { blocks, totals } = result;
    return [
      `Eye-friendly study plan — ${NUM.format(totals.studyMinutes)} min study, ${NUM.format(totals.elapsedMinutes)} min elapsed`,
      `Screen time: ${NUM.format(totals.screenMinutes)} min · Paper time: ${NUM.format(totals.paperMinutes)} min`,
      `20-20-20 micro-breaks: ${totals.microBreakCount} · Rest breaks: ${totals.restBreakCount} (${NUM.format(totals.restMinutesTotal)} min)`,
      "",
      ...blocks.map(
        (b) =>
          `Block ${b.index} (${b.type === "screen" ? "Screen" : "Paper"}, ${b.minutes} min)${b.microBreaks > 0 ? ` — ${b.microBreaks} eye micro-break${b.microBreaks === 1 ? "" : "s"}` : ""}`,
      ),
    ].join("\n");
  }, [hasError, result]);

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
    setTotal(DEFAULTS.total);
    setBlock(DEFAULTS.block);
    setShare(DEFAULTS.share);
    setRest(DEFAULTS.rest);
    setCopied(false);
  };

  const totals = hasError ? null : result.totals;

  const rows = hasError
    ? [
        ["Screen time", DASH],
        ["Paper time", DASH],
        ["20-20-20 micro-breaks", DASH],
        ["Rest breaks between blocks", DASH],
        ["Total elapsed (incl. rests)", DASH],
      ]
    : [
        ["Screen time", `${NUM.format(totals.screenMinutes)} min (${totals.screenBlockCount} blocks)`],
        ["Paper time", `${NUM.format(totals.paperMinutes)} min (${totals.paperBlockCount} blocks)`],
        [
          "20-20-20 micro-breaks",
          `${NUM.format(totals.microBreakCount)} × ${EYE_MICRO_BREAK_SECONDS} s`,
        ],
        [
          "Rest breaks between blocks",
          `${NUM.format(totals.restBreakCount)} (${NUM.format(totals.restMinutesTotal)} min)`,
        ],
        ["Total elapsed (incl. rests)", `${NUM.format(totals.elapsedMinutes)} min`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Eye className="h-4 w-4" aria-hidden="true" />
          Exam wellness
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Eye Strain Study Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Split a study session into alternating screen and paper blocks, spread evenly through the
          day, with 20-20-20 micro-breaks marked inside every screen block.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="esp-total">
              Total study time (minutes)
            </label>
            <input
              id="esp-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="25"
              max="720"
              step="5"
              value={total}
              onChange={(event) => setTotal(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="esp-block">
              Block length (minutes)
            </label>
            <input
              id="esp-block"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="15"
              max="120"
              step="5"
              value={block}
              onChange={(event) => setBlock(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="esp-share">
              Share of blocks on screen (%)
            </label>
            <input
              id="esp-share"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="10"
              value={share}
              onChange={(event) => setShare(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              How much of your material is on a screen versus books or notes.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="esp-rest">
              Rest between blocks (minutes)
            </label>
            <input
              id="esp-rest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="30"
              step="1"
              value={rest}
              onChange={(event) => setRest(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Screen time in this plan
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(totals.screenMinutes)} min`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a plan."
                : `Out of ${NUM.format(totals.studyMinutes)} study minutes, with ${totals.microBreakCount} eye micro-break${totals.microBreakCount === 1 ? "" : "s"} scheduled inside screen blocks.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the eye-friendly study plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Block sequence</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {result.blocks.map((b) => (
              <li
                key={b.index}
                className="flex items-center justify-between gap-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              >
                <span className="inline-flex items-center gap-2 font-semibold">
                  {b.type === "screen" ? (
                    <Monitor className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
                  ) : (
                    <BookOpen className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden="true" />
                  )}
                  Block {b.index} — {b.type === "screen" ? "Screen" : "Paper"}
                </span>
                <span className="text-right text-[var(--muted-foreground)]">
                  {b.minutes} min
                  {b.microBreaks > 0
                    ? ` · ${b.microBreaks} eye break${b.microBreaks === 1 ? "" : "s"}`
                    : ""}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General wellbeing information, not medical advice. Alternating tasks and the 20-20-20 rule
        follow optometric guidance on digital eye strain; see an eye-care professional for
        persistent headaches, blur or dryness.
      </p>
    </main>
  );
}
