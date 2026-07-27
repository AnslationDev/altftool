"use client";

import { useMemo, useState } from "react";
import { Check, Clapperboard, Copy, RotateCcw } from "lucide-react";

import {
  HOOK_STYLES,
  PLATFORMS,
  TONES,
  buildReelScriptPrompt,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  platformId: "instagram-reels",
  topic: "3 meal-prep mistakes that make you quit by Wednesday",
  audience: "busy professionals trying to eat healthier",
  toneId: "energetic",
  hookStyleId: "mistake",
  cta: "Follow for one meal-prep fix every week",
  durationSec: "30",
};

const DASH = "—";

export default function ToolHome() {
  const [platformId, setPlatformId] = useState(DEFAULTS.platformId);
  const [topic, setTopic] = useState(DEFAULTS.topic);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [toneId, setToneId] = useState(DEFAULTS.toneId);
  const [hookStyleId, setHookStyleId] = useState(DEFAULTS.hookStyleId);
  const [cta, setCta] = useState(DEFAULTS.cta);
  const [durationSec, setDurationSec] = useState(DEFAULTS.durationSec);
  const [copied, setCopied] = useState(false);

  const platform = PLATFORMS.find((p) => p.id === platformId) ?? PLATFORMS[0];

  const result = useMemo(
    () =>
      buildReelScriptPrompt({
        platformId,
        topic,
        audience,
        toneId,
        hookStyleId,
        cta,
        durationSec: durationSec.trim() === "" ? Number.NaN : Number(durationSec),
      }),
    [platformId, topic, audience, toneId, hookStyleId, cta, durationSec],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setPlatformId(DEFAULTS.platformId);
    setTopic(DEFAULTS.topic);
    setAudience(DEFAULTS.audience);
    setToneId(DEFAULTS.toneId);
    setHookStyleId(DEFAULTS.hookStyleId);
    setCta(DEFAULTS.cta);
    setDurationSec(DEFAULTS.durationSec);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Clapperboard className="h-4 w-4" aria-hidden="true" />
          Video Prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Reel Script Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set the platform, topic and runtime; get an AI prompt with a second-by-second beat sheet —
          hook inside 3 seconds, payoff in the final 20%, CTA compressed at the end.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rsp-platform">
              Platform
            </label>
            <select
              id="rsp-platform"
              className={`mt-2 ${INPUT_CLASS}`}
              value={platformId}
              onChange={(e) => setPlatformId(e.target.value)}
            >
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} (max {p.maxSeconds}s)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rsp-duration">
              Runtime (seconds, 10–{platform.maxSeconds})
            </label>
            <input
              id="rsp-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max={platform.maxSeconds}
              value={durationSec}
              onChange={(e) => setDurationSec(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rsp-topic">
              Topic / promise of the video
            </label>
            <input
              id="rsp-topic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rsp-audience">
              Target viewer (optional)
            </label>
            <input
              id="rsp-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rsp-hook">
              Hook style
            </label>
            <select
              id="rsp-hook"
              className={`mt-2 ${INPUT_CLASS}`}
              value={hookStyleId}
              onChange={(e) => setHookStyleId(e.target.value)}
            >
              {HOOK_STYLES.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rsp-tone">
              Tone
            </label>
            <select
              id="rsp-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={toneId}
              onChange={(e) => setToneId(e.target.value)}
            >
              {TONES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rsp-cta">
              Call to action (optional — blank lets the model pick)
            </label>
            <input
              id="rsp-cta"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
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
              Word budget at ~2.5 words/sec
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `~${result.approxWordBudget} words`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated reel script prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
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
          {hasError ? (
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Beat sheet</dt>
              <dd className="text-right font-semibold">{DASH}</dd>
            </div>
          ) : (
            result.beats.map((b) => (
              <div key={b.name} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">
                  {b.name} <span className="text-xs">({b.note})</span>
                </dt>
                <dd className="whitespace-nowrap text-right font-semibold">
                  {b.start}s – {b.end}s
                </dd>
              </div>
            ))
          )}
        </dl>

        <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
          {hasError ? DASH : result.prompt}
        </pre>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Timing model: hook within the first 3 seconds, payoff in the final 20% of runtime, CTA in
        the last 2–5 seconds. Platform maximums reflect published limits as of mid-2025 and can
        change.
      </p>
    </main>
  );
}
