"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, History, Play, RotateCcw, Settings2, Volume2, X } from "lucide-react";

const NOTE_FREQS = {
  C4: 261.63,
  "C#4": 277.18,
  D4: 293.66,
  "D#4": 311.13,
  E4: 329.63,
  F4: 349.23,
  "F#4": 369.99,
  G4: 392,
  "G#4": 415.3,
  A4: 440,
  "A#4": 466.16,
  B4: 493.88,
  C5: 523.25,
  "C#5": 554.37,
  D5: 587.33,
  "D#5": 622.25,
  E5: 659.25,
  F5: 698.46,
  "F#5": 739.99,
  G5: 783.99,
  "G#5": 830.61,
  A5: 880,
};

const NOTE_KEYS = Object.keys(NOTE_FREQS);

const INTERVALS = [
  { semitones: 1, name: "Minor 2nd", abbr: "m2" },
  { semitones: 2, name: "Major 2nd", abbr: "M2" },
  { semitones: 3, name: "Minor 3rd", abbr: "m3" },
  { semitones: 4, name: "Major 3rd", abbr: "M3" },
  { semitones: 5, name: "Perfect 4th", abbr: "P4" },
  { semitones: 6, name: "Tritone", abbr: "TT" },
  { semitones: 7, name: "Perfect 5th", abbr: "P5" },
  { semitones: 8, name: "Minor 6th", abbr: "m6" },
  { semitones: 9, name: "Major 6th", abbr: "M6" },
  { semitones: 10, name: "Minor 7th", abbr: "m7" },
  { semitones: 11, name: "Major 7th", abbr: "M7" },
  { semitones: 12, name: "Octave", abbr: "P8" },
];

function playNote(ctx, freq, startTime, duration = 0.8, gain = 0.32) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, startTime);
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.02);
  gainNode.gain.setValueAtTime(gain, startTime + duration - 0.1);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

function playInterval(ctx, rootIdx, semitones, mode = "melodic") {
  const rootFreq = NOTE_FREQS[NOTE_KEYS[rootIdx]];
  const topFreq = NOTE_FREQS[NOTE_KEYS[rootIdx + semitones]];
  const now = ctx.currentTime;

  if (mode === "harmonic") {
    playNote(ctx, rootFreq, now);
    playNote(ctx, topFreq, now);
    return;
  }

  playNote(ctx, rootFreq, now);
  playNote(ctx, topFreq, now + 0.9);
}

function getRandomQuestion(activeIntervals) {
  const interval = activeIntervals[Math.floor(Math.random() * activeIntervals.length)];
  const maxRoot = NOTE_KEYS.length - 1 - interval.semitones;
  const rootIdx = Math.floor(Math.random() * (maxRoot + 1));
  return { interval, rootIdx };
}

export default function IntervalEarTrainer() {
  const audioCtxRef = useRef(null);
  const playTimerRef = useRef(null);

  const [activeIntervals, setActiveIntervals] = useState(INTERVALS);
  const [playMode, setPlayMode] = useState("melodic");
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [gameState, setGameState] = useState("idle");
  const [history, setHistory] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const getCtx = useCallback(async () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }

    return audioCtxRef.current;
  }, []);

  const markPlayback = useCallback((duration = 2000) => {
    setIsPlaying(true);
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
    playTimerRef.current = setTimeout(() => setIsPlaying(false), duration);
  }, []);

  const playQuestion = useCallback(async (targetQuestion, mode) => {
    const ctx = await getCtx();
    playInterval(ctx, targetQuestion.rootIdx, targetQuestion.interval.semitones, mode);
    markPlayback(mode === "harmonic" ? 1000 : 1900);
  }, [getCtx, markPlayback]);

  const newQuestion = useCallback(() => {
    const nextQuestion = getRandomQuestion(activeIntervals);

    setQuestion(nextQuestion);
    setSelected(null);
    setFeedback(null);
    setGameState("playing");

    setTimeout(() => {
      playQuestion(nextQuestion, playMode);
    }, 120);
  }, [activeIntervals, playMode, playQuestion]);

  const handlePlay = () => {
    if (!question || isPlaying) return;
    playQuestion(question, playMode);
  };

  const handleAnswer = (interval) => {
    if (gameState !== "playing" || !question) return;

    const correct = interval.semitones === question.interval.semitones;
    const newTotal = score.total + 1;
    const newCorrect = score.correct + (correct ? 1 : 0);
    const newStreak = correct ? streak + 1 : 0;

    setSelected(interval);
    setFeedback(correct ? "correct" : "wrong");
    setGameState("answered");
    setScore({ correct: newCorrect, total: newTotal });
    setStreak(newStreak);
    setBestStreak((current) => Math.max(current, newStreak));
    setHistory((current) => [
      {
        questionInterval: question.interval,
        guessed: interval,
        correct,
        ts: Date.now(),
      },
      ...current.slice(0, 9),
    ]);
  };

  const toggleInterval = (semitones) => {
    setActiveIntervals((current) => {
      if (current.length === 1 && current[0].semitones === semitones) return current;

      const exists = current.some((interval) => interval.semitones === semitones);
      if (exists) return current.filter((interval) => interval.semitones !== semitones);

      return [...current, INTERVALS.find((interval) => interval.semitones === semitones)].sort(
        (a, b) => a.semitones - b.semitones,
      );
    });
  };

  const resetSession = () => {
    setQuestion(null);
    setSelected(null);
    setFeedback(null);
    setScore({ correct: 0, total: 0 });
    setStreak(0);
    setBestStreak(0);
    setHistory([]);
    setGameState("idle");
  };

  useEffect(() => () => {
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
    audioCtxRef.current?.close();
  }, []);

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 md:py-14 lg:px-8">
      <section className="mx-auto w-full max-w-6xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xl shadow-black/5 sm:p-6 lg:p-8">
        <header className="mb-6 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)] p-5 text-center shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--secondary)]">
            Sonic Training System
          </p>
          <h1 className="mb-3 text-2xl font-black tracking-tight text-[var(--primary)] sm:text-4xl">
            Interval Ear Trainer
          </h1>
          <p className="description mx-auto max-w-3xl text-center text-[var(--secondary)]">
            Train your ear by identifying melodic and harmonic intervals with instant feedback and session history.
          </p>
        </header>

        <section className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Accuracy" value={`${accuracy}%`} />
          <StatCard label="Correct" value={score.correct} />
          <StatCard label="Total" value={score.total} />
          <StatCard label="Streak" value={streak} />
          <StatCard label="Best" value={bestStreak} />
        </section>

        <section className="mb-5 flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 shadow-sm lg:flex-row lg:items-center">
          <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-[var(--border)] lg:w-auto">
            {["melodic", "harmonic"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPlayMode(mode)}
                className={`min-h-10 px-4 text-xs font-bold uppercase tracking-wide transition ${
                  playMode === mode
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowSettings((value) => !value)}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 text-xs font-bold uppercase tracking-wide transition ${
              showSettings
                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
            }`}
          >
            <Settings2 className="h-4 w-4" />
            Intervals
          </button>

          <button
            type="button"
            onClick={resetSession}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>

          <div className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] lg:ml-auto">
            {activeIntervals.length}/{INTERVALS.length} active
          </div>
        </section>

        {showSettings ? (
          <section className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--secondary)]">
              Select intervals to practice
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {INTERVALS.map((interval) => {
                const enabled = activeIntervals.some((item) => item.semitones === interval.semitones);
                return (
                  <button
                    key={interval.semitones}
                    type="button"
                    onClick={() => toggleInterval(interval.semitones)}
                    className={`rounded-lg border px-3 py-2 text-left transition ${
                      enabled
                        ? "border-[var(--primary)] bg-[var(--section-highlight)] text-[var(--foreground)]"
                        : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="block text-sm font-black text-[var(--primary)]">{interval.abbr}</span>
                    <span className="block text-xs font-semibold">{interval.name}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="relative mb-5 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm sm:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full border border-[var(--border)] bg-[var(--section-highlight)] opacity-60" />

          {gameState === "idle" ? (
            <div className="relative py-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--section-highlight)] text-[var(--primary)]">
                <Volume2 className="h-8 w-8" />
              </div>
              <p className="mb-5 text-sm font-bold uppercase tracking-widest text-[var(--secondary)]">
                Press start to begin training
              </p>
              <PrimaryButton onClick={newQuestion}>
                <Play className="h-4 w-4" />
                Start Session
              </PrimaryButton>
            </div>
          ) : null}

          {(gameState === "playing" || gameState === "answered") && question ? (
            <div className="relative">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--secondary)]">
                  Identify the interval
                </p>
                <button
                  type="button"
                  onClick={handlePlay}
                  disabled={isPlaying}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 text-xs font-bold uppercase tracking-wide text-[var(--foreground)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Play className="h-4 w-4" />
                  {isPlaying ? "Playing" : "Replay"}
                </button>
              </div>

              {feedback ? (
                <FeedbackBanner
                  feedback={feedback}
                  answer={question.interval}
                  streak={streak}
                />
              ) : null}

              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {activeIntervals.map((interval) => {
                  const isCorrect = interval.semitones === question.interval.semitones;
                  const isSelected = selected && interval.semitones === selected.semitones;
                  const answered = gameState === "answered";

                  return (
                    <button
                      key={interval.semitones}
                      type="button"
                      onClick={() => handleAnswer(interval)}
                      disabled={gameState !== "playing"}
                      className={`rounded-xl border p-3 text-center transition ${
                        answered && isCorrect
                          ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300"
                          : answered && isSelected
                            ? "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300"
                            : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--primary)] hover:shadow-md"
                      } ${gameState === "playing" ? "cursor-pointer" : "cursor-default"}`}
                    >
                      <span className="block text-xl font-black">{interval.abbr}</span>
                      <span className="mt-1 block text-xs font-semibold text-[var(--muted-foreground)]">
                        {interval.name}
                      </span>
                      <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-[var(--secondary)]">
                        +{interval.semitones} st
                      </span>
                    </button>
                  );
                })}
              </div>

              {gameState === "answered" ? (
                <div className="flex justify-center">
                  <PrimaryButton onClick={newQuestion}>Next Interval</PrimaryButton>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        {history.length > 0 ? (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--secondary)]">
              <History className="h-4 w-4" />
              Recent History
            </h2>
            <div className="grid gap-2">
              {history.map((item) => (
                <div
                  key={item.ts}
                  className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
                >
                  <span className={item.correct ? "text-green-600" : "text-red-600"}>
                    {item.correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </span>
                  <span className="w-9 font-black text-[var(--primary)]">{item.questionInterval.abbr}</span>
                  <span className="flex-1 text-[var(--muted-foreground)]">{item.questionInterval.name}</span>
                  {!item.correct ? (
                    <span className="text-xs font-semibold text-[var(--secondary)]">
                      guessed {item.guessed.abbr}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <p className="mt-6 text-center text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
          Web Audio API - {activeIntervals.length} intervals - {playMode} mode
        </p>
      </section>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-md">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 text-2xl font-black text-[var(--primary)]">{value}</p>
    </article>
  );
}

function PrimaryButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-6 py-3 text-sm font-bold uppercase tracking-widest text-[var(--primary-foreground)] shadow-[0_12px_30px_rgba(37,99,235,0.24)] transition hover:bg-[var(--primary-hover)]"
    >
      {children}
    </button>
  );
}

function FeedbackBanner({ feedback, answer, streak }) {
  const correct = feedback === "correct";

  return (
    <div
      className={`mb-5 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center ${
        correct
          ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300"
          : "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300"
      }`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/70 dark:bg-black/20">
        {correct ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </span>
      <div className="flex-1">
        <p className="text-sm font-black uppercase tracking-widest">
          {correct ? "Correct" : "Incorrect"}
        </p>
        {!correct ? (
          <p className="mt-1 text-sm">
            The interval was <strong>{answer.name}</strong>.
          </p>
        ) : null}
      </div>
      {correct && streak >= 3 ? (
        <p className="text-xs font-black uppercase tracking-widest text-yellow-600">
          {streak} streak
        </p>
      ) : null}
    </div>
  );
}
