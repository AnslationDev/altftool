"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Palette, RotateCcw } from "lucide-react";

import {
  CLIP_USABLE_TOKENS,
  COLOR_TREATMENTS,
  COMPOSITIONS,
  DETAIL_LEVELS,
  LIGHTING,
  MAX_MOVEMENTS,
  MEDIA,
  MOVEMENTS,
  buildStylePrompt,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[88px] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const DEFAULTS = {
  subject: "a lighthouse on a rocky headland at dawn",
  movementIds: ["ukiyo-e"],
  mediumId: "linocut",
  lightingId: "golden",
  compositionId: "thirds",
  colorId: "movement",
  detailId: "balanced",
  extraNotes: "",
};

export default function ToolHome() {
  const [subject, setSubject] = useState(DEFAULTS.subject);
  const [movementIds, setMovementIds] = useState(DEFAULTS.movementIds);
  const [mediumId, setMediumId] = useState(DEFAULTS.mediumId);
  const [lightingId, setLightingId] = useState(DEFAULTS.lightingId);
  const [compositionId, setCompositionId] = useState(DEFAULTS.compositionId);
  const [colorId, setColorId] = useState(DEFAULTS.colorId);
  const [detailId, setDetailId] = useState(DEFAULTS.detailId);
  const [extraNotes, setExtraNotes] = useState(DEFAULTS.extraNotes);
  const [copied, setCopied] = useState("");

  const result = useMemo(
    () =>
      buildStylePrompt({
        subject,
        movementIds,
        mediumId,
        lightingId,
        compositionId,
        colorId,
        detailId,
        extraNotes,
      }),
    [subject, movementIds, mediumId, lightingId, compositionId, colorId, detailId, extraNotes]
  );

  const failed = Boolean(result.error);
  const dash = "—";

  const copy = async (key, text) => {
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
    setSubject(DEFAULTS.subject);
    setMovementIds(DEFAULTS.movementIds);
    setMediumId(DEFAULTS.mediumId);
    setLightingId(DEFAULTS.lightingId);
    setCompositionId(DEFAULTS.compositionId);
    setColorId(DEFAULTS.colorId);
    setDetailId(DEFAULTS.detailId);
    setExtraNotes(DEFAULTS.extraNotes);
    setCopied("");
  };

  const toggleMovement = (id) =>
    setMovementIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Palette className="h-4 w-4" aria-hidden="true" />
          Image prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Art Style Prompt Explorer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sixteen movements with their real hallmarks, palettes and blind spots. Pick up to{" "}
          {MAX_MOVEMENTS}, add a medium and light, and get a prompt plus a negative prompt built from
          what that style structurally avoids.
        </p>
      </header>

      <section className={CARD}>
        <label className={LABEL_CLASS} htmlFor="style-subject">
          Subject
        </label>
        <textarea
          id="style-subject"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="What is in the picture? e.g. a fox asleep on a stack of books"
        />
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="movements-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="movements-heading" className="text-base font-semibold">
            Art movements
          </h2>
          <span
            className={`text-xs font-semibold ${movementIds.length > MAX_MOVEMENTS ? "text-[var(--warning)]" : "text-[var(--muted-foreground)]"}`}
          >
            {movementIds.length} selected · {MAX_MOVEMENTS} is the practical ceiling
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {MOVEMENTS.map((movement) => {
            const active = movementIds.includes(movement.id);
            return (
              <button
                key={movement.id}
                type="button"
                onClick={() => toggleMovement(movement.id)}
                aria-pressed={active}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  active
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                }`}
              >
                {movement.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="treatment-heading">
        <h2 id="treatment-heading" className="text-base font-semibold">
          Medium, light and framing
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="style-medium">
              Medium
            </label>
            <select
              id="style-medium"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mediumId}
              onChange={(event) => setMediumId(event.target.value)}
            >
              {MEDIA.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="style-lighting">
              Lighting
            </label>
            <select
              id="style-lighting"
              className={`mt-2 ${INPUT_CLASS}`}
              value={lightingId}
              onChange={(event) => setLightingId(event.target.value)}
            >
              {LIGHTING.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="style-composition">
              Composition
            </label>
            <select
              id="style-composition"
              className={`mt-2 ${INPUT_CLASS}`}
              value={compositionId}
              onChange={(event) => setCompositionId(event.target.value)}
            >
              {COMPOSITIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="style-colour">
              Colour treatment
            </label>
            <select
              id="style-colour"
              className={`mt-2 ${INPUT_CLASS}`}
              value={colorId}
              onChange={(event) => setColorId(event.target.value)}
            >
              {COLOR_TREATMENTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="style-detail">
              Detail density
            </label>
            <select
              id="style-detail"
              className={`mt-2 ${INPUT_CLASS}`}
              value={detailId}
              onChange={(event) => setDetailId(event.target.value)}
            >
              {DETAIL_LEVELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="style-notes">
              Extra notes (optional)
            </label>
            <input
              id="style-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={extraNotes}
              onChange={(event) => setExtraNotes(event.target.value)}
              placeholder="e.g. coiled rope in the foreground"
            />
          </div>
        </div>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`} aria-labelledby="result-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              id="result-heading"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Estimated prompt length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? dash : `${result.tokens} tok`}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${failed ? "text-[var(--muted-foreground)]" : result.withinClip ? "text-[var(--success)]" : "text-[var(--warning)]"}`}
            >
              {failed
                ? dash
                : result.withinClip
                  ? `Fits the ${CLIP_USABLE_TOKENS}-token CLIP window`
                  : `Over the ${CLIP_USABLE_TOKENS}-token CLIP window`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("prompt", result.prompt)}
              aria-label="Copy the full prompt"
              className={GHOST_BTN}
            >
              {copied === "prompt" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "prompt" ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all choices" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Words in prompt", failed ? dash : String(result.wordCount)],
            ["Movements blended", failed ? dash : String(result.movements.length)],
            ["Trimmed version", failed ? dash : `${result.shortTokens} tokens`],
            [
              "Style conflicts found",
              failed ? dash : result.conflicts.length ? String(result.conflicts.length) : "none",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <div className="mt-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Prompt</h3>
              <p className="mt-2 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 break-words">
                {result.prompt}
              </p>
            </div>

            {!result.withinClip && (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">Trimmed to fit CLIP</h3>
                  <button
                    type="button"
                    onClick={() => copy("short", result.shortPrompt)}
                    aria-label="Copy the trimmed prompt"
                    className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    {copied === "short" ? "Copied!" : "Copy trimmed"}
                  </button>
                </div>
                <p className="mt-2 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 break-words">
                  {result.shortPrompt}
                </p>
                {result.droppedSegments.length ? (
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    Dropped: {result.droppedSegments.join(", ")}
                  </p>
                ) : null}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Negative prompt</h3>
                <button
                  type="button"
                  onClick={() => copy("negative", result.negativePrompt)}
                  aria-label="Copy the negative prompt"
                  className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {copied === "negative" ? "Copied!" : "Copy negatives"}
                </button>
              </div>
              <p className="mt-2 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 break-words">
                {result.negativePrompt}
              </p>
            </div>
          </div>
        )}

        {!failed && result.warnings.length ? (
          <ul className="mt-5 space-y-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {!failed && (
        <section className={`mt-6 ${CARD}`} aria-labelledby="reference-heading">
          <h2 id="reference-heading" className="text-base font-semibold">
            What you selected
          </h2>
          <div className="mt-4 space-y-4">
            {result.movements.map((movement) => (
              <div
                key={movement.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold">{movement.label}</h3>
                  <span className="text-xs text-[var(--muted-foreground)]">{movement.era}</span>
                </div>
                <ul className="mt-2 space-y-1 text-sm leading-6 text-[var(--muted-foreground)]">
                  {movement.hallmarks.map((hallmark) => (
                    <li key={hallmark} className="flex gap-2">
                      <span aria-hidden="true" className="text-[var(--primary)]">
                        ·
                      </span>
                      <span>{hallmark}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  <span className="font-semibold">Palette:</span> {movement.palette}
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  <span className="font-semibold">Never:</span> {movement.avoid.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Token counts are estimates from the standard English heuristics, not a real tokeniser run.
        Naming a living artist to imitate their style raises ethical and, in some jurisdictions,
        legal questions — describe the techniques instead.
      </p>
    </main>
  );
}
