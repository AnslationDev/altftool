"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Palette, RotateCcw } from "lucide-react";

import {
  ASPECT_RATIOS,
  CLIP_USABLE_TOKENS,
  MAX_WEIGHT,
  MIN_WEIGHT,
  NEGATIVE_PRESETS,
  STYLE_AXES,
  buildStyleSheet,
} from "../lib";

const INT = new Intl.NumberFormat("en-US");
const DEC1 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-20 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_SELECTIONS = {
  medium: ["35mm film photograph"],
  lighting: ["overcast, diffused light"],
  lens: ["24mm wide angle, slight edge distortion"],
  composition: ["generous negative space, subject small in frame"],
  colour: ["desaturated, film-like colour"],
  finish: ["fine grain, visible halation"],
};

const DEFAULTS = {
  subject: "a lighthouse on a wet basalt shore",
  extraPhrases: "no people, low tide",
  emphasisAxis: "lighting",
  emphasisWeight: "1.3",
  aspect: "3:2",
  extraNegatives: "",
  negatives: ["text, watermark, signature", "blurry, out of focus"],
};

export default function ToolHome() {
  const [subject, setSubject] = useState(DEFAULTS.subject);
  const [selections, setSelections] = useState(DEFAULT_SELECTIONS);
  const [extraPhrases, setExtraPhrases] = useState(DEFAULTS.extraPhrases);
  const [emphasisAxis, setEmphasisAxis] = useState(DEFAULTS.emphasisAxis);
  const [emphasisWeight, setEmphasisWeight] = useState(DEFAULTS.emphasisWeight);
  const [aspect, setAspect] = useState(DEFAULTS.aspect);
  const [negatives, setNegatives] = useState(DEFAULTS.negatives);
  const [extraNegatives, setExtraNegatives] = useState(DEFAULTS.extraNegatives);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildStyleSheet({
        subject,
        selections,
        extraPhrases,
        emphasisAxis,
        emphasisWeight: emphasisWeight.trim() === "" ? Number.NaN : Number(emphasisWeight),
        negatives,
        extraNegatives,
        aspect,
      }),
    [subject, selections, extraPhrases, emphasisAxis, emphasisWeight, negatives, extraNegatives, aspect],
  );

  const togglePhrase = (axisId, phrase) => {
    setSelections((current) => {
      const list = current[axisId] || [];
      const next = list.includes(phrase) ? list.filter((item) => item !== phrase) : [...list, phrase];
      return { ...current, [axisId]: next };
    });
    setCopied(false);
  };

  const toggleNegative = (phrase) => {
    setNegatives((current) =>
      current.includes(phrase) ? current.filter((item) => item !== phrase) : [...current, phrase],
    );
    setCopied(false);
  };

  const copyResult = async () => {
    if (result.error || !result.sheet) return;
    try {
      await navigator.clipboard.writeText(result.sheet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSubject(DEFAULTS.subject);
    setSelections(DEFAULT_SELECTIONS);
    setExtraPhrases(DEFAULTS.extraPhrases);
    setEmphasisAxis(DEFAULTS.emphasisAxis);
    setEmphasisWeight(DEFAULTS.emphasisWeight);
    setAspect(DEFAULTS.aspect);
    setNegatives(DEFAULTS.negatives);
    setExtraNegatives(DEFAULTS.extraNegatives);
    setCopied(false);
  };

  const stat = (value) => (result.error ? DASH : value);
  const touch = (setter) => (event) => {
    setter(event.target.value);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Palette className="h-4 w-4" aria-hidden="true" />
          Image prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">AI Art Style Reference Sheet</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A style is reproducible when you can name it on every axis. Pick phrases for medium,
          lighting, lens, composition, colour, era, finish and mood, and keep the sheet to reuse
          across prompts. Coverage and a CLIP token estimate are calculated as you go.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="style-subject">
            Subject
          </label>
          <input id="style-subject" className={`mt-2 ${INPUT_CLASS}`} type="text" value={subject} onChange={touch(setSubject)} />
        </div>

        <div className="mt-5 grid gap-5">
          {STYLE_AXES.map((axis) => (
            <fieldset key={axis.id}>
              <legend className="text-sm font-semibold text-[var(--foreground)]">
                {axis.label}
                <span className="ml-2 font-normal text-[var(--muted-foreground)]">{axis.hint}</span>
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {axis.phrases.map((phrase) => {
                  const active = (selections[axis.id] || []).includes(phrase);
                  return (
                    <button
                      key={phrase}
                      type="button"
                      aria-pressed={active}
                      onClick={() => togglePhrase(axis.id, phrase)}
                      className={`min-h-11 rounded-md border px-3 text-left text-sm transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                        active
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {phrase}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="style-extra">
              Your own phrases (comma separated)
            </label>
            <textarea id="style-extra" className={`mt-2 ${TEXTAREA_CLASS}`} rows={2} value={extraPhrases} onChange={touch(setExtraPhrases)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="style-negatives-extra">
              Extra negative phrases (comma separated)
            </label>
            <textarea
              id="style-negatives-extra"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={2}
              value={extraNegatives}
              onChange={touch(setExtraNegatives)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="style-emphasis">
              Emphasise one axis
            </label>
            <select id="style-emphasis" className={`mt-2 ${INPUT_CLASS}`} value={emphasisAxis} onChange={touch(setEmphasisAxis)}>
              <option value="">No emphasis</option>
              {STYLE_AXES.map((axis) => (
                <option key={axis.id} value={axis.id}>
                  {axis.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="style-weight">
              Emphasis weight ({MIN_WEIGHT.toFixed(1)}-{MAX_WEIGHT.toFixed(1)})
            </label>
            <input
              id="style-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_WEIGHT}
              max={MAX_WEIGHT}
              step="0.05"
              value={emphasisWeight}
              onChange={touch(setEmphasisWeight)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="style-aspect">
              Aspect ratio
            </label>
            <select id="style-aspect" className={`mt-2 ${INPUT_CLASS}`} value={aspect} onChange={touch(setAspect)}>
              <option value="">Not specified</option>
              {ASPECT_RATIOS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Negative prompt presets</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {NEGATIVE_PRESETS.map((phrase) => {
              const active = negatives.includes(phrase);
              return (
                <button
                  key={phrase}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleNegative(phrase)}
                  className={`min-h-11 rounded-md border px-3 text-left text-sm transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {phrase}
                </button>
              );
            })}
          </div>
        </fieldset>
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
              Style coverage
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {stat(`${DEC1.format(result.coverage || 0)}%`)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {stat(
                result.missingAxes && result.missingAxes.length > 0
                  ? `Not yet named: ${result.missingAxes.join(", ")}`
                  : "Every axis is named",
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the style reference sheet"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy sheet"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Style phrases in the prompt", stat(INT.format(result.styleCount || 0))],
            [
              "Estimated CLIP tokens",
              stat(
                `${INT.format(result.tokenEstimate || 0)} of ${CLIP_USABLE_TOKENS}${
                  result.overTokenLimit ? " — over the first chunk" : ""
                }`,
              ),
            ],
            ["Axes named", stat(`${INT.format((result.coveredAxes || []).length)} of ${STYLE_AXES.length}`)],
            ["Negative phrases", stat(INT.format(result.negativeCount || 0))],
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
          <h2 className="text-base font-semibold">Your reference sheet</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)]">
              {result.sheet}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Token counts are an approximation — real byte-pair encoding splits long or unusual words into
        several tokens. Weight syntax in brackets is understood by AUTOMATIC1111 and ComfyUI; other
        tools will read it as literal text.
      </p>
    </main>
  );
}
