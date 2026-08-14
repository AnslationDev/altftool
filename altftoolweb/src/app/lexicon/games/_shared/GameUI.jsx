"use client";

import Link from "next/link";
import { ArrowRight, Check, RotateCcw, Trophy, X } from "lucide-react";

/*
 * The parts every game screen is built from.
 *
 * Four games, one set of controls. The scoreboard is the piece that has to be
 * right: it is the only region that changes without the reader moving focus,
 * so it is the only region that is announced. Everything else on the screen is
 * reached by Tab and announces itself.
 *
 * Sizing rule throughout: every control is at least 2.75rem tall (44px, the
 * smallest reliably tappable target) and every row of them wraps rather than
 * scrolling sideways.
 */

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

export const BTN_PRIMARY = `inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground no-underline transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none ${FOCUS}`;

export const BTN_QUIET = `inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground no-underline transition hover:border-border-strong hover:text-primary disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none ${FOCUS}`;

export const BTN_CHOICE = `flex w-full min-h-[2.75rem] items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-left transition hover:border-border-strong disabled:cursor-default motion-reduce:transition-none ${FOCUS}`;

/*
 * Tone -> how a settled round is drawn.
 *
 * The accent rule is set through an inline custom property rather than a
 * `border-success` utility. Both would be semantic, but a colour utility and
 * `border-border` on the same element resolve by stylesheet order rather than
 * by the order they are written in the class string, and the one that loses is
 * whichever Tailwind happened to emit second.
 */
const TONES = {
  correct: { accent: "var(--success)", text: "text-success", Icon: Check, word: "Correct" },
  wrong: { accent: "var(--danger)", text: "text-danger", Icon: X, word: "Not this time" },
  info: { accent: "var(--border-strong)", text: "text-muted-foreground", Icon: null, word: "" },
};

export function toneOf(name) {
  return TONES[name] || TONES.info;
}

/**
 * Score, streak and progress.
 *
 * `aria-live="polite"` and nothing more aggressive: the answer feedback lands
 * here too, and an assertive region would cut across the reader mid-sentence
 * every time they pressed a key.
 */
export function Scoreboard({ score, asked, streak, best, roundNumber, roundCount, message }) {
  return (
    <div
      aria-live="polite"
      className="rounded-lg border border-border bg-surface-soft p-4 sm:p-5"
    >
      <dl className="flex flex-wrap gap-x-8 gap-y-3">
        <Stat value={`${score}/${asked}`} label="Right" />
        <Stat value={streak} label="Streak" />
        <Stat value={best} label="Best streak" />
        <Stat value={`${Math.min(roundNumber, roundCount)} of ${roundCount}`} label="Round" />
      </dl>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-foreground">{message}</p>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <dd className="font-mono text-xl font-semibold tabular-nums text-foreground">{value}</dd>
      <dt className="mt-0.5 text-xs text-muted-foreground">{label}</dt>
    </div>
  );
}

/** The banner above the reveal: right or wrong, said in one word plus an icon. */
export function Verdict({ tone }) {
  const meta = toneOf(tone);
  if (!meta.Icon) return null;
  return (
    <p className={`flex items-center gap-2 font-semibold ${meta.text}`}>
      <meta.Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      {meta.word}
    </p>
  );
}

/** The panel that opens once a round is settled: the answer, and where to read more. */
export function Reveal({ tone = "info", children, slug, word }) {
  const meta = toneOf(tone);
  return (
    <div
      className="rounded-lg border border-l-[3px] border-border bg-surface p-4 sm:p-5"
      style={{ borderLeftColor: meta.accent }}
    >
      <Verdict tone={tone} />
      <div className="mt-3 space-y-3">{children}</div>
      {slug ? (
        <Link
          href={`/lexicon/word/${slug}`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary no-underline hover:underline"
        >
          Read the full entry for {word} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

/** End of the last round. Score, a one-line read on it, and a way back in. */
export function Summary({ score, total, best, onRestart, children }) {
  const share = total === 0 ? 0 : Math.round((score / total) * 100);
  return (
    <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
      <p className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <Trophy className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        {score} of {total} — {share}%
      </p>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
        Longest streak: {best}. {children}
      </p>
      <button type="button" onClick={onRestart} className={`mt-4 ${BTN_PRIMARY}`}>
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Play again, reshuffled
      </button>
    </div>
  );
}

/** The restart control that sits with the round controls while a game is running. */
export function RestartButton({ onRestart, label = "Restart" }) {
  return (
    <button type="button" onClick={onRestart} className={BTN_QUIET}>
      <RotateCcw className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

/** One round's frame: the headword slot, then whatever the game puts under it. */
export function RoundShell({ children }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 sm:p-7">{children}</section>
  );
}
