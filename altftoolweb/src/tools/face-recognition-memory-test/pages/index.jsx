"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ScanFace,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Timer,
  Brain,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

const PHASES = {
  SETUP: "setup",
  LEARNING: "learning",
  DISTRACTION: "distraction",
  TESTING: "testing",
  FEEDBACK: "feedback",
};

const STUDY_SECONDS = 12;
const DISTRACTION_SECONDS = 5;
const LEARNING_COUNT = 10;
const TEST_COUNT = 20; // 10 old + 10 new

// Generate large pool of distinct avatar seeds
function generateSeeds(count, prefix = "face") {
  return Array.from({ length: count }, (_, i) => `${prefix}-${i}-${Math.random().toString(36).slice(2, 7)}`);
}

// Stable list of unique seeds generated at module level for diversity
const ALL_SEEDS = [
  "alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel",
  "india", "juliet", "kilo", "lima", "mike", "november", "oscar", "papa",
  "quebec", "romeo", "sierra", "tango", "uniform", "victor", "whiskey", "xray",
  "yankee", "zulu", "aqua", "blaze", "coral", "dawn", "ember", "frost",
  "grove", "haven", "iris", "jade", "keen", "lunar", "mist", "nova",
];

const AVATAR_STYLES = ["personas", "avataaars", "micah", "lorelei", "bottts-neutral"];

function getFaceUrl(seed, styleIdx = 0) {
  const style = AVATAR_STYLES[styleIdx % AVATAR_STYLES.length];
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&size=100`;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-600"
      : tone === "warn"
        ? "bg-rose-500/10 text-rose-600"
        : "bg-[var(--section-highlight)] text-[var(--primary)]";

  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
      <div className="flex min-w-0 items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="break-words text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
          <p className="mt-1 text-xl font-extrabold text-[var(--foreground)]">{value}</p>
          {detail && <p className="mt-1 break-words text-sm leading-5 text-[var(--muted-foreground)]">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

export default function FaceRecognitionMemoryTest() {
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [studyFaces, setStudyFaces] = useState([]); // { seed, styleIdx }
  const [testFaces, setTestFaces] = useState([]); // { seed, styleIdx, isOld }
  const [testIndex, setTestIndex] = useState(0);
  const [responses, setResponses] = useState([]); // { isSeen: bool, isOld: bool }
  const [countdown, setCountdown] = useState(0);
  const [results, setResults] = useState(null);
  const [currentFeedback, setCurrentFeedback] = useState(null);

  const timerRef = useRef(null);
  const feedbackTimer = useRef(null);
  const isTransitioning = useRef(false);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const generateTest = useCallback(() => {
    const shuffledAll = shuffle(ALL_SEEDS);
    const learnSeeds = shuffledAll.slice(0, LEARNING_COUNT);
    const newSeeds = shuffledAll.slice(LEARNING_COUNT, LEARNING_COUNT + LEARNING_COUNT);

    const oldFaceObjects = learnSeeds.map((seed, i) => ({
      seed,
      styleIdx: i % AVATAR_STYLES.length,
      isOld: true,
    }));

    const newFaceObjects = newSeeds.map((seed, i) => ({
      seed,
      styleIdx: (i + 2) % AVATAR_STYLES.length,
      isOld: false,
    }));

    setStudyFaces(oldFaceObjects);
    setTestFaces(shuffle([...oldFaceObjects, ...newFaceObjects]));
  }, []);

  const startTest = useCallback(() => {
    generateTest();
    setResponses([]);
    setTestIndex(0);
    setCountdown(STUDY_SECONDS);
    setPhase(PHASES.LEARNING);

    let remaining = STUDY_SECONDS;
    timerRef.current = setInterval(() => {
      remaining--;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setPhase(PHASES.DISTRACTION);
        let distRem = DISTRACTION_SECONDS;
        setCountdown(distRem);
        timerRef.current = setInterval(() => {
          distRem--;
          setCountdown(distRem);
          if (distRem <= 0) {
            clearInterval(timerRef.current);
            isTransitioning.current = false;
            setPhase(PHASES.TESTING);
          }
        }, 1000);
      }
    }, 1000);
  }, [generateTest]);

  const handleResponse = useCallback((userSaidSeen) => {
    if (phase !== PHASES.TESTING || isTransitioning.current) return;
    isTransitioning.current = true;

    const currentFace = testFaces[testIndex];
    const isCorrect = userSaidSeen === currentFace.isOld;
    setCurrentFeedback(isCorrect ? "correct" : "wrong");

    const newResponse = { isSeen: userSaidSeen, isOld: currentFace.isOld };

    if (testIndex + 1 >= TEST_COUNT) {
      // End test
      const finalResponses = [...responses, newResponse];
      cleanup();

      let hits = 0, misses = 0, falseAlarms = 0, correctRejections = 0;
      finalResponses.forEach((r) => {
        if (r.isOld && r.isSeen) hits++;
        else if (r.isOld && !r.isSeen) misses++;
        else if (!r.isOld && r.isSeen) falseAlarms++;
        else correctRejections++;
      });

      const accuracy = Math.round(((hits + correctRejections) / TEST_COUNT) * 100);
      let grade, tone;
      if (accuracy >= 85) { grade = "Excellent"; tone = "good"; }
      else if (accuracy >= 70) { grade = "Good"; tone = "good"; }
      else if (accuracy >= 55) { grade = "Average"; tone = "default"; }
      else { grade = "Below Average"; tone = "warn"; }

      setResults({ hits, misses, falseAlarms, correctRejections, accuracy, grade, tone });
      setTimeout(() => setPhase(PHASES.FEEDBACK), 500);
    } else {
      setResponses((prev) => [...prev, newResponse]);
      feedbackTimer.current = setTimeout(() => {
        setCurrentFeedback(null);
        setTestIndex((prev) => prev + 1);
        isTransitioning.current = false;
      }, 500);
    }
  }, [phase, testFaces, testIndex, responses, cleanup]);

  useEffect(() => {
    if (phase !== PHASES.TESTING) return;

    const handleKey = (e) => {
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "y") handleResponse(true);
      else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "n") handleResponse(false);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, handleResponse]);

  const currentTestFace = phase === PHASES.TESTING ? testFaces[testIndex] : null;

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] transition-colors py-6 px-4">
      <header className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10">
          <ScanFace className="h-8 w-8 text-purple-500" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Face Recognition Memory Test
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
          Test your facial memory and recognition ability by studying and identifying faces.
        </p>
      </header>

      {/* SETUP */}
      {phase === PHASES.SETUP && (
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-[var(--foreground)]">How It Works</h2>
            <div className="mb-8 grid w-full gap-4 md:grid-cols-3">
              <div className="flex flex-col items-center rounded-xl bg-purple-500/10 p-4 text-center">
                <Eye className="mb-2 h-8 w-8 text-purple-500" />
                <h3 className="font-bold text-[var(--foreground)]">Phase 1: Study</h3>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">Memorize {LEARNING_COUNT} faces in {STUDY_SECONDS} seconds</p>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-amber-500/10 p-4 text-center">
                <EyeOff className="mb-2 h-8 w-8 text-amber-500" />
                <h3 className="font-bold text-[var(--foreground)]">Phase 2: Distraction</h3>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{DISTRACTION_SECONDS}-second break (no cheating!)</p>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-emerald-500/10 p-4 text-center">
                <ScanFace className="mb-2 h-8 w-8 text-emerald-500" />
                <h3 className="font-bold text-[var(--foreground)]">Phase 3: Test</h3>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">Identify which faces you saw before</p>
              </div>
            </div>
            <button onClick={startTest} className="btn-primary w-full max-w-sm rounded-xl py-4 text-lg">
              Begin Memory Test
            </button>
          </div>
        </div>
      )}

      {/* LEARNING */}
      {phase === PHASES.LEARNING && (
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex items-center justify-center gap-3">
              <Eye className="h-6 w-6 text-purple-500" />
              <h2 className="text-xl font-bold text-[var(--foreground)]">Memorize These Faces</h2>
            </div>
            <div className="mb-4 flex items-center justify-center gap-2">
              <Timer className="h-5 w-5 text-rose-500" />
              <span className={`text-2xl font-extrabold ${countdown <= 5 ? "text-rose-500 animate-pulse" : "text-[var(--foreground)]"}`}>
                {countdown}s
              </span>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {studyFaces.map((face, i) => (
              <div key={i} className="flex flex-col items-center rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
                <img
                  src={getFaceUrl(face.seed, face.styleIdx)}
                  alt={`Face ${i + 1}`}
                  className="h-16 w-16 rounded-full bg-[var(--section-highlight)]"
                  loading="eager"
                />
                <span className="mt-2 text-xs font-bold text-[var(--muted-foreground)]">#{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DISTRACTION */}
      {phase === PHASES.DISTRACTION && (
        <div className="mx-auto flex max-w-md flex-col items-center justify-center py-16 text-center">
          <EyeOff className="mb-4 h-16 w-16 text-amber-500" />
          <h2 className="text-2xl font-extrabold text-[var(--foreground)]">Look Away!</h2>
          <p className="mt-2 text-[var(--muted-foreground)]">The test begins in...</p>
          <span className="mt-6 text-8xl font-black text-amber-500">{countdown}</span>
        </div>
      )}

      {/* TESTING */}
      {phase === PHASES.TESTING && currentTestFace && (
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8">
          <div className="w-full max-w-md">
            <div className="mb-2 flex justify-between text-sm font-bold text-[var(--muted-foreground)]">
              <span>Face {testIndex + 1} of {TEST_COUNT}</span>
              <span>{Math.round(((testIndex) / TEST_COUNT) * 100)}% done</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${(testIndex / TEST_COUNT) * 100}%` }}
              />
            </div>
          </div>

          <div className={`flex h-52 w-52 items-center justify-center rounded-3xl border-4 transition-all duration-200 ${
            currentFeedback === "correct" ? "border-emerald-500 bg-emerald-500/10" :
            currentFeedback === "wrong" ? "border-rose-500 bg-rose-500/10" :
            "border-[var(--border-strong)] bg-[var(--card)]"
          }`}>
            <img
              src={getFaceUrl(currentTestFace.seed, currentTestFace.styleIdx)}
              alt="Test face"
              className="h-40 w-40 rounded-full"
              loading="eager"
            />
          </div>

          <p className="text-lg font-bold text-[var(--muted-foreground)]">Have you seen this face?</p>

          <div className="flex w-full max-w-sm justify-between gap-4">
            <button
              onClick={() => handleResponse(false)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 py-4 text-base font-bold text-rose-500 hover:bg-rose-500/20 transition-colors"
            >
              <XCircle className="h-5 w-5" />
              New Face <kbd className="ml-1 rounded border border-rose-500/30 px-1 text-xs">← N</kbd>
            </button>
            <button
              onClick={() => handleResponse(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-4 text-base font-bold text-emerald-500 hover:bg-emerald-500/20 transition-colors"
            >
              <CheckCircle2 className="h-5 w-5" />
              Seen It! <kbd className="ml-1 rounded border border-emerald-500/30 px-1 text-xs">Y →</kbd>
            </button>
          </div>
        </div>
      )}

      {/* FEEDBACK */}
      {phase === PHASES.FEEDBACK && results && (
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex flex-col items-center rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-md">
            <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
              results.tone === "good" ? "bg-emerald-500/10 text-emerald-500" : results.tone === "warn" ? "bg-rose-500/10 text-rose-500" : "bg-blue-500/10 text-blue-500"
            }`}>
              <Brain className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-extrabold text-[var(--foreground)]">
              Facial Memory: {results.grade}
            </h2>
            <p className="mt-2 text-lg text-[var(--muted-foreground)]">
              Accuracy: {results.accuracy}%
            </p>
            <button onClick={() => { setPhase(PHASES.SETUP); setResults(null); }} className="btn-primary mt-8 w-full max-w-xs rounded-xl py-3 text-base">
              <RotateCcw className="mr-2 inline h-4 w-4" />
              Take Again
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <MetricCard
              icon={CheckCircle2}
              label="Hits (Correct Recalls)"
              value={results.hits}
              detail={`Out of ${LEARNING_COUNT} old faces`}
              tone={results.hits >= 8 ? "good" : results.hits < 5 ? "warn" : "default"}
            />
            <MetricCard
              icon={AlertCircle}
              label="Misses"
              value={results.misses}
              detail="Old faces you said were new"
              tone={results.misses === 0 ? "good" : results.misses > 4 ? "warn" : "default"}
            />
            <MetricCard
              icon={XCircle}
              label="False Alarms"
              value={results.falseAlarms}
              detail="New faces you said were old"
              tone={results.falseAlarms === 0 ? "good" : results.falseAlarms > 3 ? "warn" : "default"}
            />
            <MetricCard
              icon={ScanFace}
              label="Correct Rejections"
              value={results.correctRejections}
              detail={`Out of ${LEARNING_COUNT} new faces`}
              tone={results.correctRejections >= 8 ? "good" : "default"}
            />
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <h3 className="mb-3 font-bold text-[var(--foreground)]">What do these results mean?</h3>
            <div className="grid gap-4 md:grid-cols-2 text-sm text-[var(--muted-foreground)]">
              <p><strong className="text-[var(--foreground)]">Hits</strong>: Correctly remembering a face you studied indicates strong encoding and retrieval from long-term memory.</p>
              <p><strong className="text-[var(--foreground)]">False Alarms</strong>: Claiming to have seen a new face reflects a liberal recognition bias or memory confabulation.</p>
              <p><strong className="text-[var(--foreground)]">Misses</strong>: Failing to recognize a face you studied suggests weak encoding during the learning phase.</p>
              <p><strong className="text-[var(--foreground)]">Correct Rejections</strong>: Successfully identifying a new face as novel demonstrates accurate discrimination and low gullibility.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
