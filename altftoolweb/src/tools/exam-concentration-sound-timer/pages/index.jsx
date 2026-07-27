"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Pause, Play, Plus, RotateCcw, Timer, Trash2 } from "lucide-react";

import {
  BED_SLOPES,
  CUE_TONES,
  DEFAULT_WARNING_LEAD_MIN,
  READING_TIME_PRESETS,
  SOUND_BEDS,
  blockAtElapsed,
  buildExamPlan,
  cueIsDue,
  formatClock,
  formatCountdown,
  formatDuration,
  gainFromDb,
  generateBedSamples,
  minutesFromSeconds,
  secondsLeftInBlock,
  secondsLeftInPaper,
} from "../lib";

const DEC = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_SECTIONS = [
  { key: "s1", name: "Section A — one markers", marks: "20", bed: "brown" },
  { key: "s2", name: "Section B — short answers", marks: "30", bed: "brown" },
  { key: "s3", name: "Section C — long answers", marks: "50", bed: "rain" },
];

const DEFAULTS = {
  totalMinutes: "180",
  readingMinutes: "15",
  reviewMinutes: "10",
  startClock: "09:30",
  warningLeadMin: String(DEFAULT_WARNING_LEAD_MIN),
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : Number.NaN;
};

export default function ToolHome() {
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [totalMinutes, setTotalMinutes] = useState(DEFAULTS.totalMinutes);
  const [readingMinutes, setReadingMinutes] = useState(DEFAULTS.readingMinutes);
  const [reviewMinutes, setReviewMinutes] = useState(DEFAULTS.reviewMinutes);
  const [startClock, setStartClock] = useState(DEFAULTS.startClock);
  const [warningLeadMin, setWarningLeadMin] = useState(DEFAULTS.warningLeadMin);
  const [nextKey, setNextKey] = useState(4);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [running, setRunning] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [copied, setCopied] = useState(false);

  const audioRef = useRef(null);
  const firedRef = useRef(new Set());

  const plan = useMemo(
    () =>
      buildExamPlan({
        sections: sections.map((section) => ({
          name: section.name,
          marks: toNumber(section.marks),
          bed: section.bed,
        })),
        totalMinutes: toNumber(totalMinutes),
        readingMinutes: toNumber(readingMinutes),
        reviewMinutes: toNumber(reviewMinutes),
        startClock,
        warningLeadMin: toNumber(warningLeadMin),
      }),
    [sections, totalMinutes, readingMinutes, reviewMinutes, startClock, warningLeadMin],
  );

  const hasError = Boolean(plan.error);
  const elapsedMin = minutesFromSeconds(elapsedSec);
  const currentBlock = hasError ? null : blockAtElapsed(plan.blocks, elapsedMin);
  const remainingSec = hasError ? 0 : secondsLeftInPaper(plan.scheduledMinutes, elapsedSec);
  const blockRemainingSec = secondsLeftInBlock(currentBlock, elapsedSec);

  const teardown = useCallback(() => {
    const graph = audioRef.current;
    audioRef.current = null;
    if (!graph) return;
    try {
      graph.source.stop();
    } catch {
      /* already stopped */
    }
    graph.ctx.close().catch(() => {});
  }, []);

  useEffect(() => teardown, [teardown]);

  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const Ctor = typeof window !== "undefined" ? window.AudioContext || window.webkitAudioContext : null;
    if (!Ctor) return null;
    try {
      const ctx = new Ctor();
      const samples = generateBedSamples(Math.round(ctx.sampleRate * 6), BED_SLOPES.brown, 4242);
      if (!samples) {
        ctx.close().catch(() => {});
        return null;
      }
      const buffer = ctx.createBuffer(1, samples.length, ctx.sampleRate);
      buffer.copyToChannel(samples, 0);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const highpass = ctx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 40;
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 700;
      const bedGain = ctx.createGain();
      bedGain.gain.value = 0;
      source.connect(highpass).connect(lowpass).connect(bedGain).connect(ctx.destination);
      source.start();
      audioRef.current = { ctx, source, highpass, lowpass, bedGain };
      return audioRef.current;
    } catch {
      return null;
    }
  }, []);

  const playCue = useCallback((type) => {
    const graph = audioRef.current;
    const tone = CUE_TONES[type];
    if (!graph || !tone) return;
    const { ctx } = graph;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = tone.freqHz;
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + tone.seconds);
    osc.connect(envelope).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + tone.seconds + 0.05);
  }, []);

  // Tick
  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => setElapsedSec((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // Stop at the end
  useEffect(() => {
    if (!running || hasError) return;
    if (elapsedSec >= plan.scheduledMinutes * 60) setRunning(false);
  }, [running, hasError, elapsedSec, plan.scheduledMinutes]);

  // Bed follows the current block
  useEffect(() => {
    const graph = audioRef.current;
    if (!graph) return;
    const bed = SOUND_BEDS[currentBlock?.bed] || SOUND_BEDS.silence;
    const target = soundOn && running && bed.id !== "silence" ? gainFromDb(bed.levelDb) : 0;
    graph.bedGain.gain.setTargetAtTime(target, graph.ctx.currentTime, 0.6);
    if (bed.lowpassHz > 0) graph.lowpass.frequency.setTargetAtTime(bed.lowpassHz, graph.ctx.currentTime, 0.3);
    if (bed.highpassHz > 0) graph.highpass.frequency.setTargetAtTime(bed.highpassHz, graph.ctx.currentTime, 0.3);
  }, [currentBlock, soundOn, running]);

  // Fire cues
  useEffect(() => {
    if (!running || hasError || !soundOn) return;
    const fired = firedRef.current;
    for (const cue of plan.cues) {
      const key = `${cue.type}-${cue.blockId}-${cue.atMin}`;
      if (fired.has(key)) continue;
      if (cueIsDue(cue.atMin, elapsedSec)) {
        fired.add(key);
        playCue(cue.type);
      }
    }
  }, [elapsedSec, running, hasError, soundOn, plan.cues, playCue]);

  const start = () => {
    if (hasError) return;
    ensureAudio();
    setRunning(true);
  };

  const pause = () => setRunning(false);

  const resetTimer = () => {
    setRunning(false);
    setElapsedSec(0);
    firedRef.current = new Set();
    const graph = audioRef.current;
    if (graph) graph.bedGain.gain.setTargetAtTime(0, graph.ctx.currentTime, 0.2);
  };

  const updateSection = (key, field, value) => {
    setSections((list) => list.map((item) => (item.key === key ? { ...item, [field]: value } : item)));
  };

  const addSection = () => {
    setSections((list) => [
      ...list,
      { key: `s${nextKey}`, name: `Section ${String.fromCharCode(64 + list.length + 1)}`, marks: "20", bed: "brown" },
    ]);
    setNextKey((value) => value + 1);
  };

  const removeSection = (key) => {
    setSections((list) => (list.length > 1 ? list.filter((item) => item.key !== key) : list));
  };

  const resetAll = () => {
    setSections(DEFAULT_SECTIONS);
    setTotalMinutes(DEFAULTS.totalMinutes);
    setReadingMinutes(DEFAULTS.readingMinutes);
    setReviewMinutes(DEFAULTS.reviewMinutes);
    setStartClock(DEFAULTS.startClock);
    setWarningLeadMin(DEFAULTS.warningLeadMin);
    setCopied(false);
    resetTimer();
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Exam Concentration Sound Timer",
      `Paper: ${plan.totalMinutes} min, ${plan.totalMarks} marks`,
      `Writing time after reading and review: ${plan.writingMinutes} min`,
      `Pace: ${DEC.format(plan.minutesPerMark)} min per mark (${Math.round(plan.secondsPerMark)} s per mark)`,
      "",
      ...plan.blocks.map(
        (block) =>
          `${block.startClock}-${block.endClock}  ${block.name} — ${formatDuration(block.minutes)}${
            block.marks ? ` (${block.marks} marks)` : ""
          }`,
      ),
      "",
      `Pens down at ${plan.finishClock}`,
    ].join("\n");
  }, [plan, hasError]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Exam pacing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Exam Concentration Sound Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Split the paper across its sections in proportion to marks, get the clock time you should
          be finishing each one, and run it as timed sound blocks with warning cues.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ecs-total">
              Total paper time (minutes)
            </label>
            <input
              id="ecs-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="480"
              step="5"
              value={totalMinutes}
              onChange={(event) => setTotalMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ecs-start">
              Paper starts at (24-hour)
            </label>
            <input
              id="ecs-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={startClock}
              onChange={(event) => setStartClock(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ecs-reading">
              Reading time (minutes)
            </label>
            <input
              id="ecs-reading"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={readingMinutes}
              onChange={(event) => setReadingMinutes(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {READING_TIME_PRESETS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setReadingMinutes(String(item.minutes))}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="ecs-review">
                Review (min)
              </label>
              <input
                id="ecs-review"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="5"
                value={reviewMinutes}
                onChange={(event) => setReviewMinutes(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="ecs-warn">
                Warning at (min left)
              </label>
              <input
                id="ecs-warn"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={warningLeadMin}
                onChange={(event) => setWarningLeadMin(event.target.value)}
              />
            </div>
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Sections of the paper</h2>
        <ul className="mt-3 space-y-3">
          {sections.map((section, index) => (
            <li key={section.key} className="rounded-md border border-[var(--border)] p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`ecs-name-${section.key}`}>
                    Section {index + 1} name
                  </label>
                  <input
                    id={`ecs-name-${section.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={section.name}
                    onChange={(event) => updateSection(section.key, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`ecs-marks-${section.key}`}>
                    Marks
                  </label>
                  <input
                    id={`ecs-marks-${section.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={section.marks}
                    onChange={(event) => updateSection(section.key, "marks", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`ecs-bed-${section.key}`}>
                    Sound bed
                  </label>
                  <select
                    id={`ecs-bed-${section.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={section.bed}
                    onChange={(event) => updateSection(section.key, "bed", event.target.value)}
                  >
                    {Object.values(SOUND_BEDS).map((bed) => (
                      <option key={bed.id} value={bed.id}>
                        {bed.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {sections.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeSection(section.key)}
                  aria-label={`Remove ${section.name || `section ${index + 1}`}`}
                  className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              ) : null}
            </li>
          ))}
        </ul>
        <button type="button" onClick={addSection} className={`mt-3 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add section
        </button>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Time you can spend per mark
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : `${Math.round(plan.secondsPerMark)} s`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "—"
                : `${DEC.format(plan.minutesPerMark)} min per mark across ${plan.totalMarks} marks`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={running ? pause : start}
              aria-label={running ? "Pause the exam timer" : "Start the exam timer"}
              className={PRIMARY_BTN}
              disabled={hasError}
            >
              {running ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {running ? "Pause" : elapsedSec > 0 ? "Resume" : "Start"}
            </button>
            <button type="button" onClick={resetTimer} aria-label="Reset the timer" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset timer
            </button>
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the exam block plan"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold" htmlFor="ecs-sound">
            <input
              id="ecs-sound"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={soundOn}
              onChange={(event) => setSoundOn(event.target.checked)}
            />
            Sound bed and cue tones
          </label>
          <button type="button" onClick={resetAll} className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset everything
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Writing time after reading and review", hasError ? "—" : formatDuration(plan.writingMinutes)],
            ["Now running", hasError ? "—" : currentBlock ? currentBlock.name : running ? "Finished" : "Not started"],
            ["Left in this block", hasError || !currentBlock ? "—" : formatCountdown(blockRemainingSec)],
            ["Left in the whole paper", hasError ? "—" : formatCountdown(remainingSec)],
            ["Pens down at", hasError ? "—" : plan.finishClock],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && plan.tightSections.length > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            Too little time lands on: {plan.tightSections.join(", ")}. Reduce reading or review time.
          </p>
        ) : null}
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Block plan</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Block</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Marks</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Minutes</th>
                  <th scope="col" className="py-2 text-right font-semibold">Clock</th>
                </tr>
              </thead>
              <tbody>
                {plan.blocks.map((block) => (
                  <tr
                    key={block.id}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      currentBlock && currentBlock.id === block.id ? "text-[var(--primary)]" : ""
                    }`}
                  >
                    <td className="py-2 pr-3 font-semibold">
                      {block.name}
                      <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                        {SOUND_BEDS[block.bed].label}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">{block.marks || "—"}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{block.minutes}</td>
                    <td className="py-2 text-right tabular-nums">
                      {block.startClock}–{block.endClock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
            A cue tone marks the start of every block and sounds again with {plan.warningLeadMin} minutes
            left, so you can keep your eyes on the paper. The paper is scheduled to finish at{" "}
            {formatClock(plan.endMin)}.
          </p>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        For practice at home. Most exam halls do not allow headphones or any device that makes sound
        — use this to rehearse the pace, then rely on the invigilator&rsquo;s clock on the day.
      </p>
    </main>
  );
}
