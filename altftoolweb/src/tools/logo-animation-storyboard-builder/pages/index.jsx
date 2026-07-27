"use client";

import { useMemo, useState } from "react";
import { Check, Clapperboard, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  DEFAULT_BEATS,
  EASINGS,
  FRAME_RATES,
  LONG_BEAT_MS,
  MIN_PERCEPTIBLE_MS,
  PAUSABLE_THRESHOLD_MS,
  buildStoryboard,
  storyboardToText,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");
const MS = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DASH = "—";

const makeDefaultBeats = () =>
  DEFAULT_BEATS.map((beat, index) => ({ ...beat, id: index + 1, weight: String(beat.weight) }));

const DEFAULT_TOTAL_MS = "3000";
const DEFAULT_FPS = "30";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const LEVEL_CLASS = {
  error: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  info: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [beats, setBeats] = useState(makeDefaultBeats);
  const [totalMs, setTotalMs] = useState(DEFAULT_TOTAL_MS);
  const [fps, setFps] = useState(DEFAULT_FPS);
  const [copied, setCopied] = useState(false);

  const storyboard = useMemo(
    () =>
      buildStoryboard({
        beats: beats.map((beat) => ({
          name: beat.name,
          weight: Number(beat.weight),
          easing: beat.easing,
          note: beat.note,
        })),
        totalMs: Number(totalMs),
        fps: Number(fps),
      }),
    [beats, totalMs, fps],
  );

  const shotList = useMemo(() => storyboardToText(storyboard), [storyboard]);

  const updateBeat = (id, field, value) => {
    setBeats((previous) => previous.map((beat) => (beat.id === id ? { ...beat, [field]: value } : beat)));
    setCopied(false);
  };

  const addBeat = () => {
    setBeats((previous) => {
      const nextId = previous.reduce((max, beat) => Math.max(max, beat.id), 0) + 1;
      return [
        ...previous,
        { id: nextId, name: `Beat ${previous.length + 1}`, weight: "1", easing: "standard", note: "" },
      ];
    });
    setCopied(false);
  };

  const removeBeat = (id) => {
    setBeats((previous) => (previous.length > 1 ? previous.filter((beat) => beat.id !== id) : previous));
    setCopied(false);
  };

  const copyResult = async () => {
    if (!shotList) return;
    try {
      await navigator.clipboard.writeText(shotList);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setBeats(makeDefaultBeats());
    setTotalMs(DEFAULT_TOTAL_MS);
    setFps(DEFAULT_FPS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Clapperboard className="h-4 w-4" aria-hidden="true" />
          Motion planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Logo Animation Storyboard Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Give each beat of a logo reveal a relative weight and get whole-frame in and out points,
          SMPTE timecodes and a CSS easing curve for every step — before you open the editor.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-total">
              Total sting length (ms)
            </label>
            <input
              id="sb-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="100"
              step="100"
              value={totalMs}
              onChange={(event) => setTotalMs(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-fps">
              Frame rate
            </label>
            <select
              id="sb-fps"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fps}
              onChange={(event) => setFps(event.target.value)}
            >
              {FRAME_RATES.map((rate) => (
                <option key={rate} value={String(rate)}>
                  {rate} fps
                </option>
              ))}
            </select>
          </div>
        </div>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Beats
        </h2>
        <div className="mt-3 space-y-3">
          {beats.map((beat, index) => (
            <div key={beat.id} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sb-name-${beat.id}`}>
                    Beat {index + 1} name
                  </label>
                  <input
                    id={`sb-name-${beat.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={beat.name}
                    onChange={(event) => updateBeat(beat.id, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sb-weight-${beat.id}`}>
                    Relative weight
                  </label>
                  <input
                    id={`sb-weight-${beat.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    value={beat.weight}
                    onChange={(event) => updateBeat(beat.id, "weight", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sb-easing-${beat.id}`}>
                    Easing
                  </label>
                  <select
                    id={`sb-easing-${beat.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={beat.easing}
                    onChange={(event) => updateBeat(beat.id, "easing", event.target.value)}
                  >
                    {EASINGS.map((easing) => (
                      <option key={easing.id} value={easing.id}>
                        {easing.name} — {easing.use}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sb-note-${beat.id}`}>
                    What happens
                  </label>
                  <input
                    id={`sb-note-${beat.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={beat.note}
                    onChange={(event) => updateBeat(beat.id, "note", event.target.value)}
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeBeat(beat.id)}
                  disabled={beats.length === 1}
                  aria-label={`Remove beat ${index + 1}`}
                  className={`${GHOST_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addBeat} className={`mt-3 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add a beat
        </button>
      </section>

      {storyboard.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {storyboard.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Timeline length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {storyboard.error ? DASH : `${NUM.format(storyboard.totalFrames)} f`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {storyboard.error
                ? "Fix the settings above"
                : `${MS.format(storyboard.totalMs)}ms at ${storyboard.fps}fps, ending at ${storyboard.endTimecode}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the shot list"
              className={GHOST_BTN}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy shot list"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the storyboard" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!storyboard.error && (
          <div
            className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label="Relative length of each beat"
          >
            {storyboard.rows.map((row, index) => (
              <span
                key={row.index}
                className={index % 2 === 0 ? "block h-full bg-[var(--primary)]" : "block h-full bg-[var(--primary)]/50"}
                style={{ width: `${row.share}%` }}
              />
            ))}
          </div>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[460px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Beat</th>
                <th scope="col" className="py-2 pr-3 font-semibold">In</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Out</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Frames</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">ms</th>
                <th scope="col" className="py-2 font-semibold">Easing</th>
              </tr>
            </thead>
            <tbody>
              {storyboard.error ? (
                <tr>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 pr-3 text-right">{DASH}</td>
                  <td className="py-2 pr-3 text-right">{DASH}</td>
                  <td className="py-2">{DASH}</td>
                </tr>
              ) : (
                storyboard.rows.map((row) => (
                  <tr key={row.index} className="border-b border-[var(--border)] align-top last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{row.name}</span>
                      {row.note ? (
                        <span className="block text-xs text-[var(--muted-foreground)]">{row.note}</span>
                      ) : null}
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {PCT.format(row.share)}% of the sting
                      </span>
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs">{row.startTimecode}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{row.endTimecode}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{NUM.format(row.frames)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {MS.format(row.durationMs)}
                    </td>
                    <td className="py-2 font-mono text-xs break-all">{row.easingCss}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!storyboard.error && storyboard.issues.length > 0 && (
          <ul className="mt-5 space-y-2">
            {storyboard.issues.map((issue) => (
              <li
                key={issue.message}
                role={issue.level === "error" ? "alert" : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium ${LEVEL_CLASS[issue.level]}`}
              >
                {issue.message}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!storyboard.error && shotList && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Shot list</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-full whitespace-pre rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5">
              {shotList}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Beats shorter than {MIN_PERCEPTIBLE_MS}ms read as a cut rather than a move, and a single
        element moving for longer than about {LONG_BEAT_MS}ms starts to feel slow. Auto-playing motion
        that runs past {PAUSABLE_THRESHOLD_MS / 1000} seconds needs a pause control under WCAG 2.1 SC
        2.2.2, and every timing here should also have a reduced-motion fallback.
      </p>
    </main>
  );
}
