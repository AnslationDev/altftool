"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MicVocal, RotateCcw } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import {
  FORMATS,
  MAX_SECONDS,
  MIN_SECONDS,
  PACES,
  PLATFORMS,
  buildCreatorPrompt,
} from "../lib";

const INT = new Intl.NumberFormat("en-US");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  formatId: "script",
  platformId: "instagram-reels",
  paceId: "energetic",
  seconds: "45",
  topic: "Why most sourdough starters die in week two",
  audience: "First-time bakers who bought flour and gave up",
  angle: "One fixable mistake, not a full course",
  cta: "Comment STARTER for the feeding schedule",
};

export default function ToolHome() {
  const [formatId, setFormatId] = useState(DEFAULTS.formatId);
  const [platformId, setPlatformId] = useState(DEFAULTS.platformId);
  const [paceId, setPaceId] = useState(DEFAULTS.paceId);
  const [seconds, setSeconds] = useState(DEFAULTS.seconds);
  const [topic, setTopic] = useState(DEFAULTS.topic);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [angle, setAngle] = useState(DEFAULTS.angle);
  const [cta, setCta] = useState(DEFAULTS.cta);
  const { copy: copyToClipboard, isCopied, announcement, reset: resetCopyState } =
    useCopyToClipboard();

  const result = useMemo(
    () =>
      buildCreatorPrompt({
        formatId,
        platformId,
        paceId,
        seconds: seconds.trim() === "" ? Number.NaN : Number(seconds),
        topic,
        audience,
        angle,
        cta,
      }),
    [formatId, platformId, paceId, seconds, topic, audience, angle, cta],
  );

  const copyResult = () => {
    if (result.error || !result.prompt) return;
    copyToClipboard("prompt", result.prompt, { label: "prompt" });
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset every field? This will replace your topic, audience, angle and CTA with the demo example values and cannot be undone.",
      )
    ) {
      return;
    }
    setFormatId(DEFAULTS.formatId);
    setPlatformId(DEFAULTS.platformId);
    setPaceId(DEFAULTS.paceId);
    setSeconds(DEFAULTS.seconds);
    setTopic(DEFAULTS.topic);
    setAudience(DEFAULTS.audience);
    setAngle(DEFAULTS.angle);
    setCta(DEFAULTS.cta);
    resetCopyState();
  };

  const stat = (value) => (result.error ? DASH : value);
  const touch = (setter) => (event) => {
    setter(event.target.value);
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MicVocal className="h-4 w-4" aria-hidden="true" />
          Creator prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Content Creator Prompt Pack</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Hooks, scripts, titles, descriptions and repurposing plans. The prompt carries a word
          budget calculated from your target runtime and speaking pace, plus the real title, caption
          and hashtag limits for the platform you are posting on.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">What do you want written?</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {FORMATS.map((item) => {
              const active = item.id === formatId;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setFormatId(item.id);
                    resetCopyState();
                  }}
                  className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  <span className="block font-semibold text-[var(--foreground)]">{item.label}</span>
                  <span className="mt-0.5 block text-xs leading-5">{item.blurb}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5">
          <label className={LABEL_CLASS} htmlFor="creator-topic">
            Video topic (one line)
          </label>
          <textarea
            id="creator-topic"
            className={`mt-2 ${TEXTAREA_CLASS}`}
            rows={2}
            value={topic}
            onChange={touch(setTopic)}
          />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="creator-platform">
              Platform
            </label>
            <select id="creator-platform" className={`mt-2 ${INPUT_CLASS}`} value={platformId} onChange={touch(setPlatformId)}>
              {PLATFORMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="creator-pace">
              Speaking pace
            </label>
            <select id="creator-pace" className={`mt-2 ${INPUT_CLASS}`} value={paceId} onChange={touch(setPaceId)}>
              {PACES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.wpm} wpm)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="creator-seconds">
              Target runtime (seconds)
            </label>
            <input
              id="creator-seconds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_SECONDS}
              max={MAX_SECONDS}
              step="5"
              value={seconds}
              onChange={touch(setSeconds)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="creator-cta">
              Call to action (optional)
            </label>
            <input
              id="creator-cta"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Comment STARTER for the schedule"
              value={cta}
              onChange={touch(setCta)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="creator-audience">
              Audience (optional)
            </label>
            <input
              id="creator-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="First-time bakers"
              value={audience}
              onChange={touch(setAudience)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="creator-angle">
              Angle (optional)
            </label>
            <input
              id="creator-angle"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="One fixable mistake"
              value={angle}
              onChange={touch(setAngle)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[15, 30, 45, 60, 90].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setSeconds(String(preset));
                resetCopyState();
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset}s
            </button>
          ))}
        </div>
      </section>

      {result.error ? (
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
              Script word budget
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {stat(`${INT.format(result.wordBudget || 0)} words`)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {stat(`${result.runtimeLabel} at ${result.wpm} wpm on ${result.platformLabel}`)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={isCopied("prompt") ? "Copied the generated creator prompt" : "Copy the generated creator prompt"}
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {isCopied("prompt") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("prompt") ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
          <span className="sr-only" role="status" aria-live="polite">
            {announcement}
          </span>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Deliverable", stat(result.formatLabel)],
            ["Title / headline limit", stat(`${INT.format(result.titleLimit || 0)} characters`)],
            ["Caption or description limit", stat(`${INT.format(result.captionLimit || 0)} characters`)],
            ["Hashtags allowed", stat(INT.format(result.hashtagLimit || 0))],
            [
              "Platform max for this format",
              stat(`${result.platformMaxLabel}${result.overPlatformMax ? " — your runtime is over it" : ""}`),
            ],
            ["Prompt length", stat(`${INT.format(result.promptChars || 0)} characters`)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {result.error ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your prompt</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)]">
              {result.prompt}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Platform limits change. The figures here reflect each platform&apos;s published caps at the
        time of writing, so check the current help centre before relying on one for a paid campaign.
      </p>
    </main>
  );
}
