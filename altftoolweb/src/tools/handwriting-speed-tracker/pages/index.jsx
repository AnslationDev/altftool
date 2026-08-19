"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Pause, Play, Plus, RotateCcw, Timer, Trash2 } from "lucide-react";

import {
  ADULT_SUSTAINED_WPM_MAX,
  ADULT_SUSTAINED_WPM_MIN,
  COPY_PASSAGES,
  MIN_RELIABLE_SECONDS,
  computeSpeed,
  countLetters,
  countWords,
  formatDuration,
  projectExam,
  summariseSessions,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const WHOLE = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = {
  words: "120",
  letters: "600",
  minutes: "5",
  seconds: "0",
  targetWords: "800",
  availableMinutes: "40",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STORAGE_KEY = "altft-handwriting-speed-sessions";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [words, setWords] = useState(DEFAULTS.words);
  const [letters, setLetters] = useState(DEFAULTS.letters);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [seconds, setSeconds] = useState(DEFAULTS.seconds);
  const [targetWords, setTargetWords] = useState(DEFAULTS.targetWords);
  const [availableMinutes, setAvailableMinutes] = useState(DEFAULTS.availableMinutes);
  const [passageId, setPassageId] = useState(COPY_PASSAGES[0].id);
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [tick, setTick] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSessions(parsed);
      }
    } catch {
      setSessions([]);
    }
  }, []);

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => setTick(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [running]);

  const liveSeconds = useMemo(() => {
    if (!running || startedAt === null) return 0;
    const now = tick > startedAt ? tick : Date.now();
    return Math.max(0, Math.round((now - startedAt) / 1000));
  }, [running, startedAt, tick]);

  const totalSeconds = useMemo(() => {
    const m = toNumber(minutes);
    const s = toNumber(seconds);
    if (!Number.isFinite(m) || !Number.isFinite(s)) return NaN;
    return m * 60 + s;
  }, [minutes, seconds]);

  const speed = useMemo(
    () =>
      computeSpeed({
        words: toNumber(words),
        letters: Number.isFinite(toNumber(letters)) ? toNumber(letters) : 0,
        seconds: totalSeconds,
      }),
    [words, letters, totalSeconds],
  );

  const hasError = Boolean(speed.error);
  const dash = "—";

  const exam = useMemo(() => {
    if (hasError) return { error: "Measure a writing speed first." };
    return projectExam({
      wpm: speed.wpm,
      targetWords: toNumber(targetWords),
      availableMinutes: toNumber(availableMinutes),
    });
  }, [hasError, speed, targetWords, availableMinutes]);

  const stats = useMemo(() => summariseSessions(sessions), [sessions]);

  const passage = useMemo(
    () => COPY_PASSAGES.find((item) => item.id === passageId) || COPY_PASSAGES[0],
    [passageId],
  );

  const persist = (next) => {
    setSessions(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private browsing or a full quota — the on-screen list still works.
    }
  };

  const startTimer = () => {
    setStartedAt(Date.now());
    setTick(Date.now());
    setRunning(true);
  };

  const stopTimer = () => {
    setRunning(false);
    if (startedAt === null) return;
    const elapsed = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    setMinutes(String(Math.floor(elapsed / 60)));
    setSeconds(String(elapsed % 60));
    setStartedAt(null);
  };

  const usePassageCounts = () => {
    setWords(String(countWords(passage.text)));
    setLetters(String(countLetters(passage.text)));
  };

  const saveSession = () => {
    if (hasError) return;
    const next = [
      ...sessions,
      {
        id: crypto.randomUUID(),
        wpm: speed.wpm,
        lpm: speed.lpm,
        words: speed.words,
        seconds: speed.seconds,
      },
    ];
    persist(next);
  };

  const removeSession = (id) => {
    persist(sessions.filter((session) => session.id !== id));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Handwriting Speed",
      `Words written: ${speed.words} in ${formatDuration(speed.seconds)}`,
      `Speed: ${NUM.format(speed.wpm)} words per minute`,
      speed.lpm ? `Letters per minute: ${NUM.format(speed.lpm)}` : "",
      `Seconds per word: ${NUM.format(speed.secondsPerWord)}`,
      exam.error ? "" : `A ${exam.targetWords}-word answer needs ${NUM.format(exam.minutesNeeded)} min`,
      exam.error ? "" : `Time available: ${exam.availableMinutes} min (${exam.canFinish ? "enough" : "short"})`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [speed, exam, hasError]);

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
    setWords(DEFAULTS.words);
    setLetters(DEFAULTS.letters);
    setMinutes(DEFAULTS.minutes);
    setSeconds(DEFAULTS.seconds);
    setTargetWords(DEFAULTS.targetWords);
    setAvailableMinutes(DEFAULTS.availableMinutes);
    setRunning(false);
    setStartedAt(null);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Handwriting worksheets
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Handwriting Speed Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Time a copy task, convert it to words and letters per minute, and see whether that speed
          finishes an exam answer in the minutes available. Sessions are saved in this browser so
          you can watch the trend.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">1. Time the copy task</h2>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="hst-passage">
            Passage to copy
          </label>
          <select
            id="hst-passage"
            className={`mt-2 ${INPUT_CLASS}`}
            value={passageId}
            onChange={(event) => setPassageId(event.target.value)}
          >
            {COPY_PASSAGES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
            {passage.text}
          </p>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {countWords(passage.text)} words · {countLetters(passage.text)} letters
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-3xl font-semibold tabular-nums" aria-live="polite">
            {running ? formatDuration(liveSeconds) : formatDuration(totalSeconds)}
          </p>
          {running ? (
            <button type="button" onClick={stopTimer} aria-label="Stop the timer" className={PRIMARY_BTN}>
              <Pause className="h-4 w-4" aria-hidden="true" />
              Stop
            </button>
          ) : (
            <button type="button" onClick={startTimer} aria-label="Start the timer" className={PRIMARY_BTN}>
              <Play className="h-4 w-4" aria-hidden="true" />
              Start
            </button>
          )}
          <button type="button" onClick={usePassageCounts} className={GHOST_BTN}>
            Fill counts from this passage
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">2. Enter what was written</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hst-words">
              Words written
            </label>
            <input
              id="hst-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={words}
              onChange={(event) => setWords(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hst-letters">
              Letters written (optional)
            </label>
            <input
              id="hst-letters"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={letters}
              onChange={(event) => setLetters(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hst-minutes">
              Time taken — minutes
            </label>
            <input
              id="hst-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hst-seconds">
              Time taken — seconds
            </label>
            <input
              id="hst-seconds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="59"
              step="1"
              value={seconds}
              onChange={(event) => setSeconds(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {speed.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Handwriting speed
            </p>
            <p
              className="mt-1 text-4xl font-semibold text-[var(--primary)]"
              aria-live="polite"
              aria-atomic="true"
            >
              {hasError ? dash : `${NUM.format(speed.wpm)} wpm`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Enter words written and a time above"
                : `${speed.words} words in ${formatDuration(speed.seconds)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy handwriting speed result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={saveSession}
              disabled={hasError}
              aria-label="Save this session to the log"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Save session
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Letters per minute", hasError || speed.lpm === null ? dash : NUM.format(speed.lpm)],
            ["Seconds per word", hasError ? dash : NUM.format(speed.secondsPerWord)],
            ["Letters per word", hasError || speed.lettersPerWord === null ? dash : NUM.format(speed.lettersPerWord)],
            [
              "Speed in 5-character standard words",
              hasError || speed.standardWpm === null ? dash : `${NUM.format(speed.standardWpm)} wpm`,
            ],
            ["Words in the exam time", exam.error ? dash : WHOLE.format(exam.wordsInTime)],
            ["Minutes for the word target", exam.error ? dash : `${NUM.format(exam.minutesNeeded)} min`],
            ["Speed the target demands", exam.error ? dash : `${NUM.format(exam.requiredWpm)} wpm`],
            [
              "Spare time",
              exam.error
                ? dash
                : `${NUM.format(exam.spareMinutes)} min ${exam.canFinish ? "in hand" : "short"}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !speed.reliable ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Under {MIN_RELIABLE_SECONDS} seconds a sample is dominated by starting and settling.
            Time at least a minute of continuous writing for a figure you can compare.
          </p>
        ) : null}
        {!hasError && speed.inAdultSustainedBand ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            That sits inside the {ADULT_SUSTAINED_WPM_MIN}-{ADULT_SUSTAINED_WPM_MAX} wpm band usually
            quoted for comfortable sustained adult longhand.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Exam word target</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hst-target">
              Words the answer needs
            </label>
            <input
              id="hst-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10"
              value={targetWords}
              onChange={(event) => setTargetWords(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hst-avail">
              Writing time available (minutes)
            </label>
            <input
              id="hst-avail"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={availableMinutes}
              onChange={(event) => setAvailableMinutes(event.target.value)}
            />
          </div>
        </div>
        {exam.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {exam.error}
          </p>
        ) : (
          <p
            aria-live="polite"
            aria-atomic="true"
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              exam.canFinish
                ? "bg-[var(--muted)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {exam.canFinish
              ? `At ${NUM.format(speed.wpm)} wpm you finish ${NUM.format(exam.targetWords)} words with ${NUM.format(exam.spareMinutes)} minutes spare.`
              : `At ${NUM.format(speed.wpm)} wpm you are ${NUM.format(exam.shortfallMinutes)} minutes short — plan a shorter answer or raise the speed to ${NUM.format(exam.requiredWpm)} wpm.`}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Session log</h2>
        {stats.count === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            No sessions saved yet. Press &ldquo;Save session&rdquo; after a timed task to start the
            trend.
          </p>
        ) : (
          <>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                ["Sessions logged", WHOLE.format(stats.count)],
                ["Best speed", `${NUM.format(stats.bestWpm)} wpm`],
                ["Average speed", `${NUM.format(stats.averageWpm)} wpm`],
                [
                  "Change since the first session",
                  stats.changePct === null ? dash : `${NUM.format(stats.changePct)}%`,
                ],
                ["Trend per session", `${NUM.format(stats.trend)} wpm`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
                >
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="mt-0.5 font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">#</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Words</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Time</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">wpm</th>
                    <th scope="col" className="py-2 font-semibold"><span className="sr-only">Remove</span></th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session, index) => (
                    <tr key={session.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{index + 1}</td>
                      <td className="py-2 pr-3 text-right">{WHOLE.format(session.words)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {formatDuration(session.seconds)}
                      </td>
                      <td className="py-2 pr-3 text-right font-semibold">{NUM.format(session.wpm)}</td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeSession(session.id)}
                          aria-label={`Remove session ${index + 1}`}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Speed means nothing without legibility — always check the sample can still be read. If slow
        or painful handwriting is affecting schoolwork, a school-based assessment is the right route
        to any formal exam arrangement, not a self-timed figure.
      </p>
    </main>
  );
}
