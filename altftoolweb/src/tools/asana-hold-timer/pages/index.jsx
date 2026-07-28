"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Pause, Play, Plus, RotateCcw, Timer, Trash2 } from "lucide-react";

import {
  PRESETS,
  computeSequence,
  formatDuration,
  segmentAtElapsed,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const TICK_MS = 200;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  presetId: "morning",
  breath: "5",
  transition: "5",
  rounds: "1",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const clonePreset = (id) => {
  const preset = PRESETS.find((item) => item.id === id) || PRESETS[0];
  return preset.poses.map((pose, index) => ({ ...pose, uid: `${preset.id}-${index}` }));
};

export default function ToolHome() {
  const [presetId, setPresetId] = useState(DEFAULTS.presetId);
  const [poses, setPoses] = useState(() => clonePreset(DEFAULTS.presetId));
  const [breath, setBreath] = useState(DEFAULTS.breath);
  const [transition, setTransition] = useState(DEFAULTS.transition);
  const [rounds, setRounds] = useState(DEFAULTS.rounds);
  const [newName, setNewName] = useState("");
  const [newSeconds, setNewSeconds] = useState("30");
  const [nextUid, setNextUid] = useState(1);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);

  const sequence = useMemo(
    () =>
      computeSequence({
        poses: poses.map(({ name, seconds, perSide }) => ({ name, seconds, perSide })),
        secondsPerBreath: toNumber(breath),
        transitionSeconds: toNumber(transition),
        rounds: toNumber(rounds),
      }),
    [poses, breath, transition, rounds],
  );

  const hasError = Boolean(sequence.error);

  useEffect(() => {
    if (!running || hasError) return undefined;
    const id = setInterval(() => setElapsed((value) => value + TICK_MS / 1000), TICK_MS);
    return () => clearInterval(id);
  }, [running, hasError]);

  const live = hasError ? null : segmentAtElapsed(sequence.segments, elapsed);

  useEffect(() => {
    if (running && !hasError && !live) setRunning(false);
  }, [running, hasError, live]);

  const stop = () => {
    setRunning(false);
    setElapsed(0);
  };

  const applyPreset = (id) => {
    setPresetId(id);
    setPoses(clonePreset(id));
    stop();
    setCopied(false);
  };

  const updatePose = (uid, patch) => {
    setPoses((current) => current.map((pose) => (pose.uid === uid ? { ...pose, ...patch } : pose)));
    stop();
    setCopied(false);
  };

  const removePose = (uid) => {
    setPoses((current) => current.filter((pose) => pose.uid !== uid));
    stop();
    setCopied(false);
  };

  const addPose = () => {
    const name = newName.trim();
    const secondsValue = toNumber(newSeconds);
    if (!name || !Number.isFinite(secondsValue)) return;
    setPoses((current) => [
      ...current,
      { uid: `custom-${nextUid}`, name, seconds: secondsValue, perSide: false },
    ]);
    setNextUid((value) => value + 1);
    setNewName("");
    stop();
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Asana sequence — ${formatDuration(sequence.totalSeconds)} total`,
      `${sequence.poseCount} poses, ${sequence.segmentCount} holds, ${sequence.rounds} round(s)`,
      `Breath length ${NUM1.format(sequence.secondsPerBreath)}s — about ${NUM0.format(sequence.totalBreaths)} breaths`,
      "",
      ...sequence.segments.map(
        (segment, index) =>
          `${index + 1}. ${segment.name}${segment.side ? ` (${segment.side})` : ""} — ${NUM0.format(segment.seconds)}s / ${NUM1.format(segment.breaths)} breaths`,
      ),
    ].join("\n");
  }, [hasError, sequence]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setPresetId(DEFAULTS.presetId);
    setPoses(clonePreset(DEFAULTS.presetId));
    setBreath(DEFAULTS.breath);
    setTransition(DEFAULTS.transition);
    setRounds(DEFAULTS.rounds);
    setNewName("");
    setNewSeconds("30");
    stop();
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Yoga sequencing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Asana Hold Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a sequence, set how long one breath takes, and the timer works out the holds, the
          breath count for each pose and the total practice length — second sides included.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ah-preset">
              Start from a sequence
            </label>
            <select
              id="ah-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={presetId}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} — {preset.poses.length} poses
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ah-breath">
              Seconds per full breath
            </label>
            <input
              id="ah-breath"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="2"
              max="20"
              step="0.5"
              value={breath}
              onChange={(event) => {
                setBreath(event.target.value);
                stop();
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ah-transition">
              Seconds between poses
            </label>
            <input
              id="ah-transition"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="1"
              value={transition}
              onChange={(event) => {
                setTransition(event.target.value);
                stop();
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ah-rounds">
              Rounds of the whole sequence
            </label>
            <input
              id="ah-rounds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="10"
              step="1"
              value={rounds}
              onChange={(event) => {
                setRounds(event.target.value);
                stop();
              }}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {sequence.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {live ? (live.inTransition ? "Change to" : "Hold") : "Practice length"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]" aria-live="polite">
              {hasError
                ? DASH
                : live
                  ? `${NUM0.format(Math.ceil(live.secondsLeft))}s`
                  : formatDuration(sequence.totalSeconds)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the sequence to see the timing."
                : live
                  ? `${live.segment.name}${live.segment.side ? ` — ${live.segment.side} side` : ""}${
                      live.inTransition
                        ? ""
                        : ` · breath ${NUM0.format(Math.floor(live.breathsDone) + 1)} of ${NUM1.format(live.segment.breaths)}`
                    }`
                  : `${NUM0.format(sequence.segmentCount)} holds · about ${NUM0.format(sequence.totalBreaths)} breaths`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRunning((value) => !value)}
              disabled={hasError}
              aria-label={running ? "Pause the sequence timer" : "Start the sequence timer"}
              className={PRIMARY_BTN}
            >
              {running ? (
                <Pause className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4" aria-hidden="true" />
              )}
              {running ? "Pause" : "Start"}
            </button>
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the asana sequence"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy sequence"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the timer" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-5 h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={live ? `Current hold ${NUM0.format(live.progress * 100)} percent complete` : "Timer idle"}
        >
          <span
            className="block h-full bg-[var(--primary)] transition-[width] duration-200 ease-linear motion-reduce:transition-none"
            style={{ width: `${live ? Math.max(0, Math.min(100, live.progress * 100)) : 0}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total practice", hasError ? DASH : formatDuration(sequence.totalSeconds)],
            ["Time held in poses", hasError ? DASH : formatDuration(sequence.holdSeconds)],
            ["Time changing poses", hasError ? DASH : formatDuration(sequence.transitionTotal)],
            ["Holds including second sides", hasError ? DASH : NUM0.format(sequence.segmentCount)],
            ["Total breaths", hasError ? DASH : NUM0.format(sequence.totalBreaths)],
            [
              "Average hold",
              hasError ? DASH : `${NUM0.format(sequence.averageHoldSeconds)} s`,
            ],
            [
              "Longest hold",
              hasError
                ? DASH
                : `${sequence.longestSegment.name} — ${NUM0.format(sequence.longestSegment.seconds)} s`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Poses in this sequence</h2>
        <ul className="mt-3 space-y-3">
          {poses.map((pose, index) => (
            <li
              key={pose.uid}
              className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-3"
            >
              <p className="text-sm font-semibold">
                {index + 1}. {pose.name}
              </p>
              <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <div>
                  <label className="sr-only" htmlFor={`ah-pose-${pose.uid}`}>
                    Hold seconds for {pose.name}
                  </label>
                  <input
                    id={`ah-pose-${pose.uid}`}
                    className={INPUT_CLASS}
                    type="number"
                    inputMode="numeric"
                    min="5"
                    max="900"
                    step="5"
                    value={pose.seconds}
                    onChange={(event) =>
                      updatePose(pose.uid, { seconds: toNumber(event.target.value) })
                    }
                  />
                </div>
                <label
                  className="flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] px-3 text-sm font-medium"
                  htmlFor={`ah-side-${pose.uid}`}
                >
                  <input
                    id={`ah-side-${pose.uid}`}
                    type="checkbox"
                    className="h-5 w-5 accent-[var(--primary)]"
                    checked={pose.perSide}
                    onChange={(event) => updatePose(pose.uid, { perSide: event.target.checked })}
                  />
                  Both sides
                </label>
                <button
                  type="button"
                  onClick={() => removePose(pose.uid)}
                  aria-label={`Remove ${pose.name} from the sequence`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] px-3 text-sm font-semibold transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_8rem_auto]">
          <div>
            <label className={LABEL_CLASS} htmlFor="ah-new-name">
              Add a pose
            </label>
            <input
              id="ah-new-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Virabhadrasana II"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ah-new-seconds">
              Seconds
            </label>
            <input
              id="ah-new-seconds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="900"
              step="5"
              value={newSeconds}
              onChange={(event) => setNewSeconds(event.target.value)}
            />
          </div>
          <button type="button" onClick={addPose} className={`${PRIMARY_BTN} sm:mt-8`}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </button>
        </div>
      </section>

      {!hasError && (
        <section className="mt-6 overflow-x-auto rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Running order</h2>
          <table className="mt-3 w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  #
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Pose
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Hold
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Breaths
                </th>
              </tr>
            </thead>
            <tbody>
              {sequence.segments.map((segment, index) => (
                <tr
                  key={segment.key}
                  className={`border-b border-[var(--border)] last:border-0 ${
                    live && !live.inTransition && live.index === index ? "bg-[var(--muted)]" : ""
                  }`}
                >
                  <td className="py-2 pr-3 font-semibold tabular-nums">{index + 1}</td>
                  <td className="py-2 pr-3">
                    {segment.name}
                    {segment.side && (
                      <span className="ml-2 text-[var(--muted-foreground)]">{segment.side}</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-right">{NUM0.format(segment.seconds)} s</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {NUM1.format(segment.breaths)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Timing is a guide, not a target. Come out of a pose early if the breath becomes ragged or you
        feel joint pain. Informational only — get personalised guidance from a qualified teacher if
        you are pregnant, recovering from injury or new to a pose.
      </p>
    </main>
  );
}
