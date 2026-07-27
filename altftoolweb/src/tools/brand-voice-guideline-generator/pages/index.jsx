"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Megaphone, RotateCcw } from "lucide-react";

import { VOICE_DIMENSIONS, buildVoiceGuide } from "../lib";

const DEFAULTS = {
  brandName: "Northwind",
  audience: "small business owners",
  formality: 65,
  humour: 45,
  respect: 35,
  enthusiasm: 60,
  bannedWords: "synergy, ninja, rockstar",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [brandName, setBrandName] = useState(DEFAULTS.brandName);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [dials, setDials] = useState({
    formality: DEFAULTS.formality,
    humour: DEFAULTS.humour,
    respect: DEFAULTS.respect,
    enthusiasm: DEFAULTS.enthusiasm,
  });
  const [bannedWords, setBannedWords] = useState(DEFAULTS.bannedWords);
  const [copied, setCopied] = useState(false);

  const guide = useMemo(
    () => buildVoiceGuide({ brandName, audience, dials, bannedWords }),
    [brandName, audience, dials, bannedWords],
  );

  const hasError = Boolean(guide.error);
  const dash = "—";

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(guide.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setBrandName(DEFAULTS.brandName);
    setAudience(DEFAULTS.audience);
    setDials({
      formality: DEFAULTS.formality,
      humour: DEFAULTS.humour,
      respect: DEFAULTS.respect,
      enthusiasm: DEFAULTS.enthusiasm,
    });
    setBannedWords(DEFAULTS.bannedWords);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Megaphone className="h-4 w-4" aria-hidden="true" />
          Brand voice
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Brand Voice Guideline Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set four tone dials — formality, humour, deference and energy — and get a shareable voice
          guide with do and don&apos;t rules, preferred wording and reading-level targets.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="voice-brand">
              Brand or product name
            </label>
            <input
              id="voice-brand"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={brandName}
              onChange={(event) => setBrandName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="voice-audience">
              Primary audience (optional)
            </label>
            <input
              id="voice-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-5">
          {VOICE_DIMENSIONS.map((dimension) => (
            <div key={dimension.key}>
              <label className={LABEL_CLASS} htmlFor={`voice-${dimension.key}`}>
                {dimension.label}: {dimension.lowPole} ↔ {dimension.highPole}
              </label>
              <input
                id={`voice-${dimension.key}`}
                className="mt-3 h-11 w-full cursor-pointer accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                type="range"
                min="0"
                max="100"
                step="5"
                value={dials[dimension.key]}
                onChange={(event) =>
                  setDials((current) => ({ ...current, [dimension.key]: Number(event.target.value) }))
                }
              />
              <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                <span>{dimension.lowPole}</span>
                <span className="font-semibold text-[var(--foreground)]">{dials[dimension.key]}/100</span>
                <span>{dimension.highPole}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <label className={LABEL_CLASS} htmlFor="voice-banned">
            Words to ban (comma or line separated)
          </label>
          <textarea
            id="voice-banned"
            className={`mt-2 ${AREA_CLASS}`}
            value={bannedWords}
            onChange={(event) => setBannedWords(event.target.value)}
          />
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {guide.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Target reading level
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `Grade ${guide.mechanics.readingGrade}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? dash : `Flesch-Kincaid, around ${guide.mechanics.sentenceWords} words per sentence`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the brand voice guide as Markdown"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy guide"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-3 text-sm leading-6">
          {hasError ? dash : guide.statement}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Contractions", dash],
                ["Exclamation marks", dash],
                ["Emoji", dash],
                ["Point of view", dash],
              ]
            : [
                ["Contractions", guide.mechanics.contractions ? "Use by default" : "Avoid in policy, legal and error copy"],
                [
                  "Exclamation marks",
                  guide.mechanics.exclamationBudget === 0
                    ? "None"
                    : `Max ${guide.mechanics.exclamationBudget} per 100 words`,
                ],
                ["Emoji", guide.mechanics.emoji ? "Allowed in social and celebration copy" : "Not used"],
                ["Point of view", guide.mechanics.person],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">How each dial reads</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Dimension</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Setting</th>
                    <th scope="col" className="py-2 font-semibold">Reads as</th>
                  </tr>
                </thead>
                <tbody>
                  {guide.axes.map((axis) => (
                    <tr key={axis.key} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{axis.label}</td>
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{axis.value}/100</td>
                      <td className="py-2">{axis.statement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold text-[var(--success)]">Do</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6">
                {guide.dos.map((item) => (
                  <li key={`${item.axis}-${item.text}`} className="flex gap-2">
                    <span aria-hidden="true" className="text-[var(--success)]">+</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold text-[var(--danger)]">Don&apos;t</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6">
                {guide.donts.map((item) => (
                  <li key={`${item.axis}-${item.text}`} className="flex gap-2">
                    <span aria-hidden="true" className="text-[var(--danger)]">−</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Word choices</h2>
            <p className="mt-3 text-sm font-semibold text-[var(--muted-foreground)]">Prefer</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {guide.prefer.map((word) => (
                <span
                  key={`p-${word}`}
                  className="rounded-md bg-[var(--muted)] px-2 py-1 text-sm text-[var(--foreground)]"
                >
                  {word}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm font-semibold text-[var(--muted-foreground)]">Avoid</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {guide.avoid.map((word) => (
                <span
                  key={`a-${word}`}
                  className="rounded-md bg-[var(--danger-soft)] px-2 py-1 text-sm text-[var(--danger)]"
                >
                  {word}
                </span>
              ))}
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Tone dials follow the Nielsen Norman Group four-dimension model. Reading-level targets follow
        plain-language guidance and are a starting point — test the copy with your own readers before
        adopting it as policy.
      </p>
    </main>
  );
}
