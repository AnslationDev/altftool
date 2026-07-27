"use client";

import { useMemo, useState } from "react";
import { Check, Clapperboard, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  DEFAULT_WORDS_PER_MINUTE,
  FRAME_RATES,
  MAX_WORDS_PER_MINUTE,
  MIN_WORDS_PER_MINUTE,
  SHOT_TYPES,
  buildStoryboard,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_SHOTS = [
  {
    id: "s1",
    scene: "1",
    slug: "EXT. HARBOUR — DAWN",
    type: "WS",
    action: "Fishing boats rock in flat grey light. No one on the quay yet.",
    dialogue: "",
    durationSeconds: "4",
  },
  {
    id: "s2",
    scene: "1",
    slug: "",
    type: "MS",
    action: "Mira coils a rope, watching the water line.",
    dialogue: "We need to leave now, before the tide turns.",
    durationSeconds: "4",
  },
  {
    id: "s3",
    scene: "1",
    slug: "",
    type: "CU",
    action: "Her hand tightens on the wet rope.",
    dialogue: "",
    durationSeconds: "2.5",
  },
];

const DEFAULTS = {
  title: "Harbour opener",
  frameRate: "24",
  targetRuntimeSeconds: "30",
  wordsPerMinute: String(DEFAULT_WORDS_PER_MINUTE),
};

const DASH = "—";
const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [shots, setShots] = useState(DEFAULT_SHOTS);
  const [nextId, setNextId] = useState(4);
  const [copied, setCopied] = useState(false);
  const [copiedCsv, setCopiedCsv] = useState(false);

  const setField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const result = useMemo(
    () =>
      buildStoryboard({
        title: form.title,
        frameRate: Number(form.frameRate),
        targetRuntimeSeconds: Number(form.targetRuntimeSeconds),
        wordsPerMinute: Number(form.wordsPerMinute),
        shots,
      }),
    [form, shots],
  );

  const hasError = Boolean(result.error);

  const updateShot = (id, patch) =>
    setShots((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const addShot = () => {
    const id = `s${nextId}`;
    setNextId((value) => value + 1);
    setShots((list) => [
      ...list,
      {
        id,
        scene: list.length > 0 ? list[list.length - 1].scene : "1",
        slug: "",
        type: "MS",
        action: "",
        dialogue: "",
        durationSeconds: "3",
      },
    ]);
  };

  const removeShot = (id) => setShots((list) => list.filter((item) => item.id !== id));

  const copyText = async (value, setter) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setter(true);
      setTimeout(() => setter(false), 1500);
    } catch {
      setter(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setShots(DEFAULT_SHOTS);
    setNextId(4);
    setCopied(false);
    setCopiedCsv(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Clapperboard className="h-4 w-4" aria-hidden="true" />
          Production
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Storyboard Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sequence your shots, set a duration for each one, and get running SMPTE timecode, a
          dialogue-length check and an exportable production sheet.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sb-title">
              Storyboard title
            </label>
            <input
              id="sb-title"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.title}
              onChange={setField("title")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-fps">
              Frame rate
            </label>
            <select
              id="sb-fps"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.frameRate}
              onChange={setField("frameRate")}
            >
              {FRAME_RATES.map((rate) => (
                <option key={rate} value={String(rate)}>
                  {rate} fps
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-target">
              Target runtime (seconds)
            </label>
            <input
              id="sb-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={form.targetRuntimeSeconds}
              onChange={setField("targetRuntimeSeconds")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sb-wpm">
              Speaking pace (words per minute)
            </label>
            <input
              id="sb-wpm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_WORDS_PER_MINUTE}
              max={MAX_WORDS_PER_MINUTE}
              step="5"
              value={form.wordsPerMinute}
              onChange={setField("wordsPerMinute")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Shots</h2>
          <button type="button" onClick={addShot} className={GHOST_BTN} aria-label="Add a shot">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add shot
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          {shots.map((shot, index) => (
            <div
              key={shot.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sb-scene-${shot.id}`}>
                    Scene
                  </label>
                  <input
                    id={`sb-scene-${shot.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={shot.scene}
                    onChange={(event) => updateShot(shot.id, { scene: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sb-type-${shot.id}`}>
                    Shot size
                  </label>
                  <select
                    id={`sb-type-${shot.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={shot.type}
                    onChange={(event) => updateShot(shot.id, { type: event.target.value })}
                  >
                    {SHOT_TYPES.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.key} — {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`sb-slug-${shot.id}`}>
                    Slug line (optional)
                  </label>
                  <input
                    id={`sb-slug-${shot.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={shot.slug}
                    onChange={(event) => updateShot(shot.id, { slug: event.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`sb-action-${shot.id}`}>
                    Action
                  </label>
                  <textarea
                    id={`sb-action-${shot.id}`}
                    className={`mt-2 ${TEXTAREA_CLASS}`}
                    rows={2}
                    value={shot.action}
                    onChange={(event) => updateShot(shot.id, { action: event.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`sb-dialogue-${shot.id}`}>
                    Dialogue or narration
                  </label>
                  <textarea
                    id={`sb-dialogue-${shot.id}`}
                    className={`mt-2 ${TEXTAREA_CLASS}`}
                    rows={2}
                    value={shot.dialogue}
                    onChange={(event) => updateShot(shot.id, { dialogue: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sb-dur-${shot.id}`}>
                    Duration (seconds)
                  </label>
                  <input
                    id={`sb-dur-${shot.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0.1"
                    step="0.5"
                    value={shot.durationSeconds}
                    onChange={(event) =>
                      updateShot(shot.id, { durationSeconds: event.target.value })
                    }
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeShot(shot.id)}
                    aria-label={`Remove shot ${index + 1}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove shot
                  </button>
                </div>
              </div>
            </div>
          ))}
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
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total runtime
            </p>
            <p className="mt-1 font-mono text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
              {hasError ? DASH : result.totalTimecode}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${result.shotCount} shot(s) · ${num.format(result.totalSeconds)}s · ${num.format(result.totalFrames)} frames at ${result.frameRate} fps`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText(result.markdown, setCopied)}
              aria-label="Copy the production sheet"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy sheet"}
            </button>
            <button
              type="button"
              onClick={() => copyText(result.csv, setCopiedCsv)}
              aria-label="Copy the shot list as CSV"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copiedCsv ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedCsv ? "Copied!" : "Copy CSV"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the storyboard" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Average shot length", hasError ? DASH : `${num.format(result.averageShotSeconds)}s`],
            [
              "Dialogue",
              hasError
                ? DASH
                : `${num.format(result.dialogueWords)} words · ${num.format(result.dialogueSeconds)}s`,
            ],
            ["Dialogue density", hasError ? DASH : `${num.format(result.dialogueDensityPct)}%`],
            [
              "Against target",
              hasError || result.overUnderSeconds === null
                ? DASH
                : `${result.overUnderSeconds > 0 ? "+" : ""}${num.format(result.overUnderSeconds)}s (${num.format(result.targetFillPct)}%)`,
            ],
            ["Warnings", hasError ? DASH : String(result.warnings.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Timing warnings</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Shot list</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[38rem] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">#</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Sc</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Size</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">In</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Dur</th>
                  <th scope="col" className="py-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {result.shots.map((shot) => (
                  <tr key={shot.index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3">{shot.index}</td>
                    <td className="py-2.5 pr-3">{shot.scene}</td>
                    <td className="py-2.5 pr-3 font-semibold">{shot.type}</td>
                    <td className="py-2.5 pr-3 font-mono text-xs">{shot.startTimecode}</td>
                    <td className="py-2.5 pr-3">{num.format(shot.durationSeconds)}s</td>
                    <td className="py-2.5">{shot.action || shot.slug || DASH}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Timecode is SMPTE non-drop-frame. At 29.97 and 23.976 fps the running clock drifts slightly
        from wall-clock time, which is expected — use drop-frame timecode in the edit if broadcast
        duration has to match exactly.
      </p>
    </main>
  );
}
