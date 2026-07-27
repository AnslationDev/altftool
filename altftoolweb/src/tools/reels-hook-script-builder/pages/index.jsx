"use client";

import { useMemo, useState } from "react";
import { Check, Clapperboard, Copy, RotateCcw } from "lucide-react";

import {
  DEFAULT_HOOK_SECONDS,
  DEFAULT_SPEAKING_WPM,
  HOOK_STYLES,
  MAX_HOOK_SECONDS,
  MAX_SPEAKING_WPM,
  MAX_TOTAL_SECONDS,
  MIN_HOOK_SECONDS,
  MIN_SPEAKING_WPM,
  MIN_TOTAL_SECONDS,
  buildHookScript,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";
const secs = (value) => (Number.isFinite(value) ? `${NUM.format(value)}s` : DASH);

const DEFAULTS = {
  audience: "freelance designers",
  topic: "portfolio reviews",
  outcome: "more client replies",
  mistake: "showing every project",
  styleId: "mistake",
  hookSeconds: String(DEFAULT_HOOK_SECONDS),
  totalSeconds: "30",
  wpm: String(DEFAULT_SPEAKING_WPM),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [topic, setTopic] = useState(DEFAULTS.topic);
  const [outcome, setOutcome] = useState(DEFAULTS.outcome);
  const [mistake, setMistake] = useState(DEFAULTS.mistake);
  const [styleId, setStyleId] = useState(DEFAULTS.styleId);
  const [hookSeconds, setHookSeconds] = useState(DEFAULTS.hookSeconds);
  const [totalSeconds, setTotalSeconds] = useState(DEFAULTS.totalSeconds);
  const [wpm, setWpm] = useState(DEFAULTS.wpm);
  const [copied, setCopied] = useState("");

  const script = useMemo(
    () =>
      buildHookScript({
        audience,
        topic,
        outcome,
        mistake,
        styleId,
        hookSeconds: Number(hookSeconds),
        totalSeconds: Number(totalSeconds),
        wpm: Number(wpm),
      }),
    [audience, topic, outcome, mistake, styleId, hookSeconds, totalSeconds, wpm],
  );

  const hasError = Boolean(script.error);

  const fullScript = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Reels hook script — ${script.style.label}`,
      `${secs(script.totalSeconds)} Reel · ${secs(script.hookSeconds)} hook window · ${script.wpm} wpm · budget ${script.wordBudget} spoken words`,
      "",
      "HOOK OPTIONS",
    ];
    script.hooks.forEach((hook, index) => {
      lines.push(
        `${index + 1}. ${hook.line} (${hook.words} words, ${NUM.format(hook.seconds)}s${hook.fits ? "" : ` — ${hook.overBy} words over`})`,
      );
    });
    lines.push("", "BEAT SHEET");
    script.beats.forEach((beat) => {
      lines.push(
        `${NUM.format(beat.start)}s-${NUM.format(beat.end)}s ${beat.label}: ${beat.direction}`,
      );
    });
    lines.push(
      "",
      `Frame ${script.frame}. Keep burned-in text clear of the top ${script.safeZone.topPercent}%, bottom ${script.safeZone.bottomPercent}% and right ${script.safeZone.rightPercent}% of the frame.`,
    );
    return lines.join("\n");
  }, [script, hasError]);

  const copyText = async (text, key) => {
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
    setAudience(DEFAULTS.audience);
    setTopic(DEFAULTS.topic);
    setOutcome(DEFAULTS.outcome);
    setMistake(DEFAULTS.mistake);
    setStyleId(DEFAULTS.styleId);
    setHookSeconds(DEFAULTS.hookSeconds);
    setTotalSeconds(DEFAULTS.totalSeconds);
    setWpm(DEFAULTS.wpm);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Clapperboard className="h-4 w-4" aria-hidden="true" />
          Short-form scripting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Reels Hook Script Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write hooks that actually fit the first three seconds. Each line is measured against your
          speaking pace and paired with a timed beat sheet and on-screen text cues.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hook-audience">
              Who it is for
            </label>
            <input
              id="hook-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hook-topic">
              Topic
            </label>
            <input
              id="hook-topic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hook-outcome">
              Outcome they want
            </label>
            <input
              id="hook-outcome"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={outcome}
              onChange={(event) => setOutcome(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hook-mistake">
              Mistake they keep making
            </label>
            <input
              id="hook-mistake"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={mistake}
              onChange={(event) => setMistake(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hook-style">
              Hook style
            </label>
            <select
              id="hook-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={styleId}
              onChange={(event) => setStyleId(event.target.value)}
            >
              {HOOK_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hook-window">
              Hook window (seconds)
            </label>
            <input
              id="hook-window"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_HOOK_SECONDS}
              max={MAX_HOOK_SECONDS}
              step="0.5"
              value={hookSeconds}
              onChange={(event) => setHookSeconds(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hook-total">
              Reel length (seconds)
            </label>
            <input
              id="hook-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_TOTAL_SECONDS}
              max={MAX_TOTAL_SECONDS}
              step="5"
              value={totalSeconds}
              onChange={(event) => setTotalSeconds(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hook-wpm">
              Speaking pace (words per minute)
            </label>
            <input
              id="hook-wpm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_SPEAKING_WPM}
              max={MAX_SPEAKING_WPM}
              step="5"
              value={wpm}
              onChange={(event) => setWpm(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {script.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Spoken word budget for the hook
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${script.wordBudget} words`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${secs(script.hookSeconds)} at ${script.wpm} words per minute`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText(fullScript, "all")}
              disabled={hasError}
              aria-label="Copy the full hook script and beat sheet"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "all" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "all" ? "Copied!" : "Copy script"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the hook builder"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Hook style", hasError ? DASH : script.style.label],
            [
              "Hooks that fit the window",
              hasError ? DASH : `${script.fittingHooks} of ${script.hooks.length}`,
            ],
            [
              "Shortest option",
              hasError || !script.shortestHook ? DASH : `${script.shortestHook.words} words`,
            ],
            ["Frame", hasError ? DASH : script.frame],
            [
              "Keep text clear of",
              hasError
                ? DASH
                : `top ${script.safeZone.topPercent}%, bottom ${script.safeZone.bottomPercent}%, right ${script.safeZone.rightPercent}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        {!hasError && (
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{script.style.note}</p>
        )}
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Hook options</h2>
            <ul className="mt-4 space-y-3">
              {script.hooks.map((hook) => (
                <li
                  key={hook.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <p className="text-sm font-semibold leading-6">{hook.line}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[var(--muted-foreground)]">
                      {hook.words} words &middot; {NUM.format(hook.seconds)}s
                    </span>
                    <span
                      className={
                        hook.fits
                          ? "rounded-md bg-[var(--muted)] px-2 py-0.5 font-semibold text-[var(--success)]"
                          : "rounded-md bg-[var(--danger-soft)] px-2 py-0.5 font-semibold text-[var(--danger)]"
                      }
                    >
                      {hook.fits ? "Fits the window" : `${hook.overBy} words over`}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyText(hook.line, hook.id)}
                      aria-label={`Copy hook: ${hook.line}`}
                      className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      {copied === hook.id ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      )}
                      {copied === hook.id ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Beat sheet</h2>
            <ol className="mt-4 space-y-3">
              {script.beats.map((beat) => (
                <li
                  key={beat.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[var(--primary)] px-2 py-0.5 text-xs font-bold text-[var(--primary-foreground)]">
                      {NUM.format(beat.start)}s – {NUM.format(beat.end)}s
                    </span>
                    <span className="text-sm font-semibold">{beat.label}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {secs(beat.duration)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6">{beat.direction}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                    On screen: {beat.onScreen}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Hook lines are templates built from your own words — read them aloud and cut anything that
        does not survive the first three seconds. Safe-zone percentages are approximations of the
        Reels interface and shift with app updates.
      </p>
    </main>
  );
}
