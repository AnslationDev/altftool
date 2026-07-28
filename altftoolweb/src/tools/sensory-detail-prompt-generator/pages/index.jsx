"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RefreshCw, RotateCcw, Sparkles } from "lucide-react";

import {
  MIN_SENSES_PER_SCENE,
  SENSES,
  SETTINGS,
  SIGHT_DOMINANCE_SHARE,
  analyseSenses,
  generatePrompts,
  promptsToText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const SAMPLE_DRAFT =
  "She saw the light shift across the water. The shadows looked longer now, and the pale glow of the far bank shone through the dark.";

const DEFAULTS = {
  setting: "night-train",
  seed: 1,
  senses: SENSES.map((sense) => sense.id),
  draft: SAMPLE_DRAFT,
};

export default function ToolHome() {
  const [setting, setSetting] = useState(DEFAULTS.setting);
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [senses, setSenses] = useState(DEFAULTS.senses);
  const [draft, setDraft] = useState(DEFAULTS.draft);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => generatePrompts({ setting, seed, senses }), [setting, seed, senses]);
  const scan = useMemo(() => analyseSenses(draft), [draft]);

  const plainText = useMemo(() => promptsToText(result), [result]);
  const hasError = Boolean(result.error);

  const toggleSense = (id) => {
    setSenses((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyResult = async () => {
    if (!plainText) return;
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSetting(DEFAULTS.setting);
    setSeed(DEFAULTS.seed);
    setSenses(DEFAULTS.senses);
    setDraft(DEFAULTS.draft);
    setCopied(false);
  };

  const maxCount = scan.error ? 0 : Math.max(1, ...scan.results.map((item) => item.count));

  const stats = hasError
    ? [
        ["Setting", DASH],
        ["Senses included", DASH],
        ["Prompt set", DASH],
      ]
    : [
        ["Setting", result.settingLabel],
        ["Senses included", `${result.count} of ${SENSES.length}`],
        ["Prompt set", `#${result.seed}`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Scene craft
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Sensory Detail Prompt Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Most drafts run entirely on sight. Pick a setting and get one specific question per sense —
          including smell and the body&apos;s own sense of balance, breath and effort — then paste
          your paragraph to see which channels it is actually using.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sdp-setting">
              Setting
            </label>
            <select
              id="sdp-setting"
              className={`mt-2 ${INPUT_CLASS}`}
              value={setting}
              onChange={(event) => setSetting(event.target.value)}
            >
              {SETTINGS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sdp-seed">
              Prompt set number
            </label>
            <input
              id="sdp-seed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              step="1"
              value={seed}
              onChange={(event) => setSeed(Number(event.target.value) || 0)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Senses to prompt</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {SENSES.map((sense) => {
              const active = senses.includes(sense.id);
              return (
                <label
                  key={sense.id}
                  htmlFor={`sdp-sense-${sense.id}`}
                  className={`flex min-h-11 cursor-pointer items-start gap-2 rounded-md border p-3 text-sm transition ${
                    active
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`sdp-sense-${sense.id}`}
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                    checked={active}
                    onChange={() => toggleSense(sense.id)}
                  />
                  <span>
                    <span className="font-semibold">{sense.label}</span>
                    <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                      {sense.hint}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Prompts generated
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.count}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Choose a setting and at least one sense."
                : "Prompt sets are reproducible — note the number to come back to the same questions."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSeed((current) => current + 1)}
              aria-label="Generate a different set of prompts"
              className={GHOST_BTN}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              New set
            </button>
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated sensory prompts"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompts"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {stats.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your prompts</h2>
          <ol className="mt-4 space-y-3">
            {result.prompts.map((item) => (
              <li key={item.sense} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                  {item.label}
                </p>
                <p className="mt-1.5 text-sm leading-6">{item.prompt}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Scan a paragraph for sense balance</h2>
        <label className="mt-3 block text-sm font-semibold text-[var(--foreground)]" htmlFor="sdp-draft">
          Your draft
        </label>
        <textarea
          id="sdp-draft"
          rows={5}
          className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />

        {scan.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {scan.error}
          </p>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <p className="text-4xl font-semibold text-[var(--primary)]">
                {scan.sensesCovered}/{SENSES.length}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                senses in play · {scan.total} sense words in {scan.words} words
              </p>
            </div>

            <ul className="mt-4 space-y-2">
              {scan.results.map((item) => (
                <li key={item.id}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {item.count === 0 ? "not used" : `${item.count} · ${item.share}%`}
                    </span>
                  </div>
                  <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                    <span
                      className="block h-full bg-[var(--primary)]"
                      style={{ width: `${Math.round((item.count / maxCount) * 100)}%` }}
                    />
                  </div>
                  {item.hits.length > 0 && (
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {item.hits.map((hit) => hit.word).join(", ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2">
              {scan.thin && (
                <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                  Only {scan.sensesCovered} sense{scan.sensesCovered === 1 ? "" : "s"} detected. Most
                  craft advice is to work at least {MIN_SENSES_PER_SCENE} into any scene that matters.
                </p>
              )}
              {scan.sightDominant && (
                <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                  {scan.sightShare}% of the sense words here are visual, above the{" "}
                  {Math.round(SIGHT_DOMINANCE_SHARE * 100)}% this tool treats as sight-dominated.
                  {scan.missing.length > 0 ? ` Try a prompt for ${scan.missing[0]}.` : ""}
                </p>
              )}
              {scan.missing.length > 0 && (
                <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                  Missing entirely: {scan.missing.join(", ")}.
                </p>
              )}
            </div>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The scan matches a fixed word list, so a scene can be intensely physical without scoring
        well — and a list of sense words is not the same as good writing. Use it to spot a channel
        you have forgotten, not as a target to hit.
      </p>
    </main>
  );
}
