"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, WandSparkles } from "lucide-react";

import {
  PRESERVE_RULES,
  READING_BANDS,
  TONES,
  buildRewritePrompt,
} from "../lib";

const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const ONE_DP = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const TWO_DP = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[170px] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SAMPLE = `Pursuant to the aforementioned agreement, the utilisation of the platform is contingent upon the customer's adherence to the stipulated terms. Notwithstanding any prior communication, the organisation reserves the unilateral right to modify service parameters, and customers shall be duly notified of such modifications within a reasonable timeframe following implementation.`;

const DEFAULTS = {
  source: SAMPLE,
  toneId: "friendly",
  bandId: "plain",
  audience: "small business owners with no legal training",
  extra: "",
  preserve: ["facts", "structure"],
};

const DASH = "—";

export default function ToolHome() {
  const [source, setSource] = useState(DEFAULTS.source);
  const [toneId, setToneId] = useState(DEFAULTS.toneId);
  const [bandId, setBandId] = useState(DEFAULTS.bandId);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [extra, setExtra] = useState(DEFAULTS.extra);
  const [preserve, setPreserve] = useState(DEFAULTS.preserve);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildRewritePrompt({
        sourceText: source,
        toneId,
        bandId,
        audience,
        extraInstruction: extra,
        preserveIds: preserve,
      }),
    [source, toneId, bandId, audience, extra, preserve],
  );

  const ok = !result.error;

  const togglePreserve = (id) =>
    setPreserve((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const copyPrompt = async () => {
    if (!ok) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSource(DEFAULTS.source);
    setToneId(DEFAULTS.toneId);
    setBandId(DEFAULTS.bandId);
    setAudience(DEFAULTS.audience);
    setExtra(DEFAULTS.extra);
    setPreserve(DEFAULTS.preserve);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <WandSparkles className="h-4 w-4" aria-hidden="true" />
          Rewrite prompt
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          AI Tone Rewrite Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Scores your text with the Flesch Reading Ease and Flesch–Kincaid formulas, then writes the
          rewrite prompt for you — with the tone, the target readability band, the size of the gap
          and the rules the model must not break.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="tone-source">
          Text to rewrite
        </label>
        <textarea
          id="tone-source"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          value={source}
          onChange={(event) => setSource(event.target.value)}
          placeholder="Paste the paragraph, email or page you want re-toned…"
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tone-tone">
              Target tone
            </label>
            <select
              id="tone-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={toneId}
              onChange={(event) => setToneId(event.target.value)}
            >
              {TONES.map((tone) => (
                <option key={tone.id} value={tone.id}>
                  {tone.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tone-band">
              Target reading level
            </label>
            <select
              id="tone-band"
              className={`mt-2 ${INPUT_CLASS}`}
              value={bandId}
              onChange={(event) => setBandId(event.target.value)}
            >
              {READING_BANDS.map((band) => (
                <option key={band.id} value={band.id}>
                  {band.label} · {band.min}–{band.max} · {band.school}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tone-audience">
              Who is reading it
            </label>
            <input
              id="tone-audience"
              type="text"
              className={`mt-2 ${INPUT_CLASS}`}
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              placeholder="e.g. first-time home buyers"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tone-extra">
              Extra instruction (optional)
            </label>
            <input
              id="tone-extra"
              type="text"
              className={`mt-2 ${INPUT_CLASS}`}
              value={extra}
              onChange={(event) => setExtra(event.target.value)}
              placeholder="e.g. keep the closing sign-off exactly as written"
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className={LABEL_CLASS}>What the rewrite must preserve</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {PRESERVE_RULES.map((rule) => (
              <label
                key={rule.id}
                htmlFor={`tone-rule-${rule.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <input
                  id={`tone-rule-${rule.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={preserve.includes(rule.id)}
                  onChange={() => togglePreserve(rule.id)}
                />
                <span>{rule.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Flesch Reading Ease now
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? ONE_DP.format(result.analysis.readingEase) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.analysis.band.label} · about ${result.analysis.band.school} reading level`
                : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              aria-label="Copy the rewrite prompt"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset every field" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Flesch–Kincaid grade level",
              ok ? ONE_DP.format(result.analysis.gradeLevel) : DASH,
            ],
            [
              "Target band",
              ok ? `${result.band.label} · ${result.band.min}–${result.band.max}` : DASH,
            ],
            [
              "Gap to target",
              ok
                ? result.gap.inBand
                  ? "Already inside the target band"
                  : `${INT.format(result.gap.points)} points ${result.gap.direction === "simpler" ? "too hard" : "too easy"}`
                : DASH,
            ],
            ["Words / sentences", ok ? `${INT.format(result.analysis.words)} / ${INT.format(result.analysis.sentences)}` : DASH],
            [
              "Words per sentence",
              ok ? ONE_DP.format(result.analysis.wordsPerSentence) : DASH,
            ],
            [
              "Syllables per word",
              ok ? TWO_DP.format(result.analysis.syllablesPerWord) : DASH,
            ],
            ["Prompt length", ok ? `${INT.format(result.words)} words` : DASH],
            ["Approximate tokens", ok ? INT.format(result.approxTokens) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && (
          <div className="mt-4 overflow-x-auto">
            <pre className="min-w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-xs leading-5 whitespace-pre-wrap text-[var(--foreground)]">
              {result.text}
            </pre>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Flesch Reading Ease bands</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Score</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Band</th>
                <th scope="col" className="py-2 text-right font-semibold">Reading level</th>
              </tr>
            </thead>
            <tbody>
              {READING_BANDS.map((band) => (
                <tr key={band.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">
                    {band.min}–{band.max}
                  </td>
                  <td className="py-2 pr-3">{band.label}</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">{band.school}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Syllables are estimated with a vowel-group heuristic rather than a pronunciation dictionary,
        so scores are close but not exact. Readability formulas measure sentence and word length
        only — they cannot tell you whether the writing is clear, accurate or legally sound.
      </p>
    </main>
  );
}
