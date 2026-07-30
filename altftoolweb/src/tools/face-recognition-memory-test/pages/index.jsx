"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import faceHeroMain from "../assets/face-hero-main.webp";
import faceReconBg from "../assets/face-recon-bg.webp";
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
  Sprout,
  Star,
  Crown,
  Check,
  Gamepad2,
  HelpCircle,
  Clock,
  BarChart2,
  X,
} from "lucide-react";

const PHASES = {
  SETUP: "setup",
  PREPARING: "preparing",
  OVERVIEW: "overview",
  LEARNING: "learning",
  DISTRACTION: "distraction",
  TESTING: "testing",
  FEEDBACK: "feedback",
};

const DISTRACTION_SECONDS = 15;

const DIFFICULTY_SETTINGS = {
  Beginner: {
    learningCount: 10,
    studySeconds: 20,
    durationStr: "2 Min"
  },
  Intermediate: {
    learningCount: 20,
    studySeconds: 20,
    durationStr: "3 Min"
  },
  Expert: {
    learningCount: 40,
    studySeconds: 40,
    durationStr: "5 Min"
  }
};

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
  // Let's generate a stable hash value from the seed string to map it to a stable portrait index
  let hash = 0;
  const str = String(seed);
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 100;
  const isEven = index % 2 === 0;
  const gender = isEven ? "men" : "women";
  return `https://randomuser.me/api/portraits/med/${gender}/${index}.jpg`;
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
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [studyFaces, setStudyFaces] = useState([]); // { seed, styleIdx }
  const [testFaces, setTestFaces] = useState([]); // { seed, styleIdx, isOld }
  const [testIndex, setTestIndex] = useState(0);
  const [responses, setResponses] = useState([]); // { isSeen: bool, isOld: bool }
  const [countdown, setCountdown] = useState(0);
  const [results, setResults] = useState(null);
  const [currentFeedback, setCurrentFeedback] = useState(null);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [distractionTargetColor, setDistractionTargetColor] = useState("GREEN");
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [responseTimes, setResponseTimes] = useState([]);
  const [reviewFilter, setReviewFilter] = useState("All");
  const [isReviewExpanded, setIsReviewExpanded] = useState(false);

  const timerRef = useRef(null);
  const feedbackTimer = useRef(null);
  const isTransitioning = useRef(false);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const generateTest = useCallback(() => {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    const shuffledAll = shuffle(ALL_SEEDS);
    const learnSeeds = shuffledAll.slice(0, settings.learningCount);
    const newSeeds = shuffledAll.slice(settings.learningCount, settings.learningCount + settings.learningCount);

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
  }, [difficulty]);

  const startTest = useCallback(() => {
    generateTest();
    setResponses([]);
    setTestIndex(0);
    setLoadingProgress(0);
    setPhase(PHASES.PREPARING);

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 1;
      setLoadingProgress(progress);
      if (progress >= 100) {
        clearInterval(progressInterval);
        setPhase(PHASES.OVERVIEW);
      }
    }, 30);
  }, [generateTest]);

  const beginChallenge = useCallback(() => {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    setCountdown(settings.studySeconds);
    setPhase(PHASES.LEARNING);

    let remaining = settings.studySeconds;
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
            setQuestionStartTime(Date.now());
            setResponseTimes([]);
            setPhase(PHASES.TESTING);
          }
        }, 1000);
      }
    }, 1000);
  }, [difficulty]);

  const handleResponse = useCallback((userSaidSeen) => {
    if (phase !== PHASES.TESTING || isTransitioning.current) return;
    isTransitioning.current = true;

    // Calculate response time in seconds
    const elapsed = Math.min(10.0, Math.round(((Date.now() - questionStartTime) / 1000) * 10) / 10);
    setResponseTimes(prev => [...prev, elapsed]);

    const currentFace = testFaces[testIndex];
    const isCorrect = userSaidSeen === currentFace.isOld;
    setCurrentFeedback(isCorrect ? "correct" : "wrong");

    const newResponse = { isSeen: userSaidSeen, isOld: currentFace.isOld };

    if (testIndex + 1 >= testFaces.length) {
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

      const accuracy = Math.round(((hits + correctRejections) / testFaces.length) * 100);
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
        setQuestionStartTime(Date.now()); // Reset start time for next question
        isTransitioning.current = false;
      }, 500);
    }
  }, [phase, testFaces, testIndex, responses, questionStartTime, cleanup]);

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

      {/* SETUP — Premium Hero Section */}
      {phase === PHASES.SETUP && (
        <div className="mx-auto max-w-5xl">
          {/* Hero Card */}
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#023315] via-[#05441d] to-[#01220d] p-8 md:p-10 shadow-2xl border border-green-950">
            {/* Soft background light */}
            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px]" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-green-500/10 blur-[120px]" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-5 text-left">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm">
                  <span className="text-yellow-400 text-sm">⭐</span>
                  <span className="text-[11px] font-bold text-white/95 uppercase tracking-wider">Today's Challenge</span>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-white leading-tight tracking-tight">
                  Face Recognition<br />Memory Test
                </h1>

                {/* Subtitle */}
                <p className="text-white/60 text-sm sm:text-base max-w-md leading-relaxed">
                  Test your facial memory and improve your recognition skills.
                </p>

                {/* Stats Badges */}
                <div className="flex flex-wrap gap-6 pt-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <Timer className="w-5 h-5 text-white/90" />
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 font-bold uppercase block tracking-wider">Duration</span>
                      <span className="text-sm font-extrabold text-white">{DIFFICULTY_SETTINGS[difficulty].durationStr}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10M18 20V4M6 20v-6"/></svg>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 font-bold uppercase block tracking-wider">Difficulty</span>
                      <span className="text-sm font-extrabold text-white">{difficulty}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white/90" />
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 font-bold uppercase block tracking-wider">Benefit</span>
                      <span className="text-sm font-extrabold text-white">Improve Memory</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={startTest}
                  className="mt-3 inline-flex items-center gap-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-extrabold text-base px-8 py-3.5 rounded-full shadow-lg shadow-green-900/40 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
                >
                  Start Memory Test
                  <div className="w-8 h-8 rounded-full bg-white text-green-700 flex items-center justify-center group-hover:translate-x-0.5 transition-transform shadow-inner">
                    <svg className="w-4 h-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </button>
              </div>

              {/* Right Column — Face Cards overlayed on Glowing Head */}
              <div className="lg:col-span-5 flex items-center justify-center relative min-h-[300px] sm:min-h-[320px] w-full">
                {/* Glowing Profile Head Background */}
                <div className="absolute inset-0 w-full h-full opacity-90 rounded-2xl overflow-hidden">
                  <img
                    src={faceReconBg.src}
                    alt="Digital Head Silhouette"
                    className="w-full h-full object-cover mix-blend-lighten scale-[1.05]"
                  />
                </div>

                {/* Center Large Card with Target Face */}
                <div className="absolute top-[52%] left-[52%] -translate-x-[50%] -translate-y-[50%] z-20">
                  <div className="relative">
                    <div className="w-[124px] h-[124px] sm:w-[136px] sm:h-[136px] border-2 border-green-400/80 rounded-[28px] bg-black/45 backdrop-blur-md overflow-hidden flex items-center justify-center p-1 shadow-2xl">
                      <img
                        src={faceHeroMain.src}
                        alt="Target face challenge"
                        className="w-full h-full object-cover rounded-[22px]"
                      />
                    </div>
                    {/* Green checkmark badge */}
                    <div className="absolute -top-1.5 -right-1.5 w-7.5 h-7.5 rounded-full bg-green-500 border-2 border-[#12582d] flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Left Card */}
                <div className="absolute top-[22%] left-[4%] w-[68px] h-[68px] sm:w-[74px] sm:h-[74px] border-2 border-green-500/20 rounded-[20px] bg-black/55 backdrop-blur-sm overflow-hidden flex items-center justify-center p-0.5 shadow-lg">
                  <img
                    src={faceHeroMain.src}
                    alt="Sample face 1"
                    className="w-full h-full object-cover rounded-[16px]"
                  />
                </div>

                {/* Top Right Card */}
                <div className="absolute top-[18%] right-[4%] w-[68px] h-[68px] sm:w-[74px] sm:h-[74px] border-2 border-green-500/20 rounded-[20px] bg-black/55 backdrop-blur-sm overflow-hidden flex items-center justify-center p-0.5 shadow-lg">
                  <img
                    src={faceHeroMain.src}
                    alt="Sample face 2"
                    className="w-full h-full object-cover rounded-[16px]"
                  />
                </div>

                {/* Bottom Right Card */}
                <div className="absolute bottom-[10%] right-[8%] w-[68px] h-[68px] sm:w-[74px] sm:h-[74px] border-2 border-green-500/20 rounded-[20px] bg-black/55 backdrop-blur-sm overflow-hidden flex items-center justify-center p-0.5 shadow-lg">
                  <img
                    src={faceHeroMain.src}
                    alt="Sample face 3"
                    className="w-full h-full object-cover rounded-[16px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Choose Difficulty Section — below the hero */}
          <div className="mt-8 rounded-3xl border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0c1220] p-6 sm:p-8 shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div className="text-left">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Choose Difficulty</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">Select the level that matches your skills</p>
              </div>
              <div className="self-start sm:self-auto inline-flex items-center gap-2 border border-green-500/20 bg-green-500/5 rounded-full px-4 py-1.5 text-xs font-bold text-green-600 dark:text-green-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Recommended: Intermediate</span>
              </div>
            </div>

            {/* Difficulty Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Beginner Card */}
              <div
                onClick={() => setDifficulty("Beginner")}
                className={`relative p-6 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${
                  difficulty === "Beginner"
                    ? "border-green-500 bg-green-500/5 ring-2 ring-green-500/10 scale-[1.02]"
                    : "border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:scale-[1.01]"
                }`}
              >
                {difficulty === "Beginner" && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                )}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Beginner</h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold space-y-1 pt-1.5">
                      <p>• 10 Faces</p>
                      <p>• 15 sec per face</p>
                    </div>
                    <div className="pt-4">
                      <span className="inline-block text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-500/10 rounded-full px-3 py-1">
                        Best for starters
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Intermediate Card */}
              <div
                onClick={() => setDifficulty("Intermediate")}
                className={`relative p-6 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${
                  difficulty === "Intermediate"
                    ? "border-green-500 bg-green-500/5 ring-2 ring-green-500/10 scale-[1.02]"
                    : "border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:scale-[1.01]"
                }`}
              >
                {difficulty === "Intermediate" && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                )}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
                    <Star className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Intermediate</h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold space-y-1 pt-1.5">
                      <p>• 20 Faces</p>
                      <p>• 10 sec per face</p>
                    </div>
                    <div className="pt-4">
                      <span className="inline-block text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-500/10 rounded-full px-3 py-1">
                        Recommended
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expert Card */}
              <div
                onClick={() => setDifficulty("Expert")}
                className={`relative p-6 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${
                  difficulty === "Expert"
                    ? "border-green-500 bg-green-500/5 ring-2 ring-green-500/10 scale-[1.02]"
                    : "border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:scale-[1.01]"
                }`}
              >
                {difficulty === "Expert" && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                )}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Expert</h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold space-y-1 pt-1.5">
                      <p>• 40 Faces</p>
                      <p>• 6 sec per face</p>
                    </div>
                    <div className="pt-4">
                      <span className="inline-block text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-500/10 rounded-full px-3 py-1">
                        For experts only
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Overlay for Active Stages */}
      {phase !== PHASES.SETUP && (
        <div className="fixed inset-0 z-50 bg-slate-50/96 dark:bg-[#070b14]/96 backdrop-blur-md flex flex-col items-center justify-center p-6 overflow-y-auto">
          {/* Close Button in Top Right */}
          <button
            onClick={() => {
              cleanup();
              setPhase(PHASES.SETUP);
              setResults(null);
            }}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-200/60 hover:bg-slate-200/90 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md z-[60]"
            title="Exit Challenge"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="w-full py-8">
            {/* PREPARING — Loading Screen */}
            {phase === PHASES.PREPARING && (
              <div className="mx-auto max-w-[460px]">
                <div className="relative overflow-hidden rounded-[24px] bg-white dark:bg-[#02210d] border border-slate-100 dark:border-green-950 p-6 shadow-xl flex flex-col items-center text-center">

                  {/* Brain Silhouette Hologram */}
                  <div className="w-32 h-32 mb-4 relative flex items-center justify-center">
                    <img
                      src="/images/face-recon-brain.png"
                      alt="Glowing brain hologram"
                      className="w-full h-full object-contain dark:mix-blend-lighten mix-blend-multiply opacity-80 dark:opacity-100"
                    />
                  </div>

                  {/* Titles */}
                  <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-wide">Preparing Your Challenge</h2>
                  <p className="text-[11px] text-slate-500 dark:text-white/60 font-semibold mt-1 max-w-[200px] leading-relaxed">
                    AI is selecting the best faces for your test...
                  </p>

                  {/* Progress Bar & Percentage */}
                  <div className="w-full mt-6 flex items-center gap-3">
                    <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-75"
                        style={{ width: `${loadingProgress}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white/95 w-8 text-right">
                      {loadingProgress}%
                    </span>
                  </div>

                  {/* Checklist */}
                  <div className="flex justify-between items-center w-full mt-6 pt-4 border-t border-slate-100 dark:border-white/5 text-[10px] font-bold text-slate-500 dark:text-white/80">
                    <div className="flex items-center gap-1">
                      <span className={loadingProgress >= 25 ? "text-green-600 dark:text-green-400" : "text-slate-350 dark:text-white/20"}>✓</span>
                      <span className={loadingProgress >= 25 ? "opacity-100" : "opacity-40"}>Analyzing</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={loadingProgress >= 60 ? "text-green-600 dark:text-green-400" : "text-slate-350 dark:text-white/20"}>✓</span>
                      <span className={loadingProgress >= 60 ? "opacity-100" : "opacity-40"}>Selecting</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={loadingProgress >= 90 ? "text-green-600 dark:text-green-400" : "text-slate-350 dark:text-white/20"}>✓</span>
                      <span className={loadingProgress >= 90 ? "opacity-100" : "opacity-40"}>Preparing</span>
                    </div>
                  </div>

                </div>
              </div>
            )}
      {/* OVERVIEW — Challenge Overview Screen */}
      {phase === PHASES.OVERVIEW && (
        <div className="mx-auto max-w-[460px]">
          <div className="rounded-[28px] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0c1220] p-6 shadow-xl flex flex-col text-left">
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-white text-center mb-6">Challenge Overview</h2>

            {/* List */}
            <div className="space-y-4 mb-8">
              {/* Difficulty */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Difficulty</span>
                </div>
                <span className="text-xs font-extrabold text-green-600 dark:text-green-400">{difficulty}</span>
              </div>

              {/* Faces to Memorize */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center">
                    <ScanFace className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Faces to Memorize</span>
                </div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-white">{DIFFICULTY_SETTINGS[difficulty].learningCount} Faces</span>
              </div>

              {/* Study Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center">
                    <Timer className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Study Time</span>
                </div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-white">{DIFFICULTY_SETTINGS[difficulty].studySeconds} Seconds</span>
              </div>

              {/* Distraction Game */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Distraction Game</span>
                </div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-white">{DISTRACTION_SECONDS} Seconds</span>
              </div>

              {/* Questions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Questions</span>
                </div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-white">{testFaces.length} Questions</span>
              </div>

              {/* Estimated Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Estimated Time</span>
                </div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-white">{DIFFICULTY_SETTINGS[difficulty].durationStr}</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={beginChallenge}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-extrabold text-sm py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-center"
            >
              Begin Challenge
            </button>
          </div>
        </div>
      )}



      {/* LEARNING — Study Phase */}
      {phase === PHASES.LEARNING && (
        <div className="mx-auto max-w-[620px] w-full">
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#022a12] via-[#043d1a] to-[#011c0b] p-6 sm:p-8 shadow-2xl border border-green-950 flex flex-col">

            {/* Header with Circular Countdown */}
            <div className="flex justify-between items-center mb-6 relative">
              <div className="flex-1" />
              <h2 className="text-lg font-black text-white text-center flex-1 whitespace-nowrap">Study These Faces</h2>

              {/* Circular Countdown Progress Ring */}
              <div className="flex-1 flex justify-end">
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      className="stroke-white/10 fill-none"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      className="stroke-green-400 fill-none transition-all duration-1000 ease-linear"
                      strokeWidth="2.5"
                      strokeDasharray="125.66"
                      strokeDashoffset={125.66 - (125.66 * countdown) / DIFFICULTY_SETTINGS[difficulty].studySeconds}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white leading-none">
                    <span className="text-xs font-black">{countdown}</span>
                    <span className="text-[6px] font-bold text-white/50 uppercase tracking-widest mt-0.5">Sec</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid of Faces */}
            <div className="grid grid-cols-5 gap-3 mb-6 justify-center">
              {studyFaces.map((face, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-[18px] bg-white border border-white/20 shadow-md p-1 overflow-hidden hover:scale-105 transition-transform duration-300"
                >
                  <img
                    src={getFaceUrl(face.seed, face.styleIdx)}
                    alt={`Face ${i + 1}`}
                    className="w-full h-full object-cover rounded-[14px]"
                    loading="eager"
                  />
                </div>
              ))}
            </div>

            {/* Bottom Progress Bar */}
            {(() => {
              const totalSec = DIFFICULTY_SETTINGS[difficulty].studySeconds;
              const elapsed = totalSec - countdown;
              const percent = (elapsed / totalSec) * 100;
              return (
                <div className="space-y-3 pt-3 border-t border-white/5">
                  <div className="flex justify-between items-center text-xs font-bold text-white/90">
                    <span>{elapsed} / {totalSec}</span>
                    <button
                      onClick={() => {
                        // Skip timer and go to distraction
                        if (timerRef.current) clearInterval(timerRef.current);
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
                      }}
                      className="text-[10px] font-extrabold text-green-400 hover:text-green-300 transition-colors uppercase tracking-wider hover:underline"
                    >
                      Start Test Now
                    </button>
                  </div>
                  <div className="h-2 w-full rounded-full bg-black/40 border border-white/5 overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      )}

      {/* DISTRACTION — Two-Stage Phase (Get Ready + Distraction Game) */}
      {phase === PHASES.DISTRACTION && (
        <div className="mx-auto max-w-[460px]">
          {countdown > 12 ? (
            /* Stage 1: Get Ready */
            <div className="relative overflow-hidden rounded-[24px] bg-white dark:bg-[#02210d] border border-slate-100 dark:border-green-950 p-8 shadow-xl flex flex-col items-center justify-between text-center min-h-[340px]">
              {/* Background lighting */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(22,163,74,0.05)_0%,transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] pointer-events-none" />

              <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-wide z-10">Get Ready</h2>

              {/* Glowing radar style countdown */}
              <div className="relative w-36 h-36 flex items-center justify-center my-6 z-10">
                {/* Outer dotted orbit */}
                <div className="absolute inset-0 border border-dashed border-slate-200 dark:border-green-500/20 rounded-full animate-[spin_40s_linear_infinite]" />
                {/* Middle line orbit with tiny node dots */}
                <div className="absolute inset-3 border border-slate-100 dark:border-green-500/30 rounded-full">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)] dark:shadow-[0_0_8px_#4ade80]" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)] dark:shadow-[0_0_8px_#4ade80]" />
                </div>
                {/* Inner glowing radial border */}
                <div className="absolute inset-6 border-[3px] border-slate-50 dark:border-green-500/10 rounded-full flex items-center justify-center">
                  <div className="absolute inset-0 border-[3px] border-t-green-600 dark:border-t-green-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                </div>

                {/* Countdown Number */}
                <span className="text-5xl font-black text-green-600 dark:text-white drop-shadow-[0_0_12px_rgba(0,0,0,0.05)] dark:drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
                  {countdown - 12}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-white/60 font-semibold tracking-wide z-10">
                The test is about to begin
              </p>
            </div>
          ) : (
            /* Stage 2: Distraction Game */
            <div className="rounded-[28px] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0c1220] p-6 shadow-xl flex flex-col text-left min-h-[340px]">

              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-extrabold text-green-700 dark:text-green-400">Distraction Game</h2>

                {/* Circular Countdown Progress Ring */}
                <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="20"
                      cy="20"
                      r="17"
                      className="stroke-slate-100 dark:stroke-white/10 fill-none"
                      strokeWidth="2"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="17"
                      className="stroke-green-600 dark:stroke-green-400 fill-none transition-all duration-1000 ease-linear"
                      strokeWidth="2"
                      strokeDasharray="106.81"
                      strokeDashoffset={106.81 - (106.81 * countdown) / 12}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800 dark:text-white leading-none">
                    <span className="text-[10px] font-black">{countdown}</span>
                    <span className="text-[5px] font-bold opacity-50 uppercase tracking-widest">Sec</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6 space-y-1">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500">Tap the button with</p>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                  the color:
                  <span className={`font-extrabold text-sm ml-1 ${
                    distractionTargetColor === "GREEN" ? "text-green-600 dark:text-green-400" :
                    distractionTargetColor === "RED" ? "text-rose-500 dark:text-rose-400" :
                    distractionTargetColor === "BLUE" ? "text-blue-500 dark:text-blue-400" :
                    "text-amber-500 dark:text-amber-400"
                  }`}>
                    {distractionTargetColor}
                  </span>
                </p>
              </div>

              {/* Grid of Colors */}
              <div className="grid grid-cols-2 gap-4 flex-1 items-center justify-center">
                {/* Green Button */}
                <button
                  onClick={() => {
                    const colors = ["GREEN", "RED", "BLUE", "YELLOW"];
                    const nextIndex = Math.floor(Math.random() * colors.length);
                    setDistractionTargetColor(colors[nextIndex]);
                  }}
                  className="aspect-[1.5/1] rounded-[20px] bg-green-500 hover:bg-green-600 active:scale-95 transition-all shadow-md cursor-pointer"
                />
                {/* Red Button */}
                <button
                  onClick={() => {
                    const colors = ["GREEN", "RED", "BLUE", "YELLOW"];
                    const nextIndex = Math.floor(Math.random() * colors.length);
                    setDistractionTargetColor(colors[nextIndex]);
                  }}
                  className="aspect-[1.5/1] rounded-[20px] bg-rose-500 hover:bg-rose-600 active:scale-95 transition-all shadow-md cursor-pointer"
                />
                {/* Blue Button */}
                <button
                  onClick={() => {
                    const colors = ["GREEN", "RED", "BLUE", "YELLOW"];
                    const nextIndex = Math.floor(Math.random() * colors.length);
                    setDistractionTargetColor(colors[nextIndex]);
                  }}
                  className="aspect-[1.5/1] rounded-[20px] bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all shadow-md cursor-pointer"
                />
                {/* Yellow Button */}
                <button
                  onClick={() => {
                    const colors = ["GREEN", "RED", "BLUE", "YELLOW"];
                    const nextIndex = Math.floor(Math.random() * colors.length);
                    setDistractionTargetColor(colors[nextIndex]);
                  }}
                  className="aspect-[1.5/1] rounded-[20px] bg-amber-400 hover:bg-amber-500 active:scale-95 transition-all shadow-md cursor-pointer"
                />
              </div>

            </div>
          )}
        </div>
      )}

      {/* TESTING — Test Phase */}
      {phase === PHASES.TESTING && currentTestFace && (
        <div className="mx-auto max-w-[500px] text-left space-y-4">

          {/* Header */}
          <div className="flex items-center gap-3 mb-2 px-1">
            <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight">Face Recognition Test</h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Identify the faces you saw before</p>
            </div>
          </div>

          {/* Main Question Card */}
          <div className="rounded-[28px] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0c1220] p-6 shadow-xl space-y-6">

            {/* Card Header (Question & Progress Bar) */}
            <div className="flex justify-between items-center gap-4">
              <span className="text-xs font-black text-slate-800 dark:text-white whitespace-nowrap">
                Question {testIndex + 1} / {testFaces.length}
              </span>
              <div className="flex-1 h-2 rounded-full bg-slate-50 dark:bg-black/35 border border-slate-100 dark:border-white/5 overflow-hidden">
                <div
                  className="h-full bg-green-600 dark:bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${((testIndex + 1) / testFaces.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Card Body (Two Columns: Portrait and Prompt) */}
            <div className="flex flex-row items-center gap-6 py-2">
              {/* Portrait */}
              <div className="shrink-0 relative">
                <div className={`w-[160px] h-[160px] rounded-[24px] border-2 bg-slate-50 dark:bg-black/35 overflow-hidden flex items-center justify-center p-1 shadow-md transition-all duration-200 ${
                  currentFeedback === "correct" ? "border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.15)]" :
                  currentFeedback === "wrong" ? "border-rose-500 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.15)]" :
                  "border-slate-100 dark:border-white/5"
                }`}>
                  <img
                    src={getFaceUrl(currentTestFace.seed, currentTestFace.styleIdx)}
                    alt="Test face"
                    className="w-full h-full object-cover rounded-[22px]"
                    loading="eager"
                  />
                </div>
              </div>

              {/* Prompt Text */}
              <div className="text-left">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                  Did you see this face before?
                </p>
              </div>
            </div>

            {/* Buttons Footer */}
            <div className="flex gap-4">
              <button
                onClick={() => handleResponse(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Yes, I saw</span>
                <div className="w-5 h-5 rounded-full bg-white text-green-700 flex items-center justify-center shadow-inner shrink-0">
                  <Check className="w-3 h-3 stroke-[3.5]" />
                </div>
              </button>

              <button
                onClick={() => handleResponse(false)}
                className="flex-1 inline-flex items-center justify-center bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-white/5 font-extrabold text-xs py-3.5 px-4 rounded-2xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                No, I didn't
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FEEDBACK — Results Dashboard */}
      {phase === PHASES.FEEDBACK && results && (() => {
        const correctCount = results.hits + results.correctRejections;
        const wrongCount = results.misses + results.falseAlarms;
        const avgTime = responseTimes.length > 0
          ? (responseTimes.reduce((acc, t) => acc + t, 0) / responseTimes.length).toFixed(1)
          : "1.5";

        let rank = "B";
        if (results.accuracy >= 90) rank = "A+";
        else if (results.accuracy >= 80) rank = "A";
        else if (results.accuracy >= 70) rank = "B";
        else if (results.accuracy >= 60) rank = "C";
        else rank = "D";

        // Filter responses list for the review
        const reviewItems = testFaces.map((face, index) => {
          const resp = responses[index] || { isSeen: false, isOld: false };
          const isCorrect = resp.isSeen === face.isOld;
          return {
            index: index + 1,
            face,
            isCorrect,
            time: responseTimes[index] || 1.8
          };
        });

        const filteredItems = reviewItems.filter(item => {
          if (reviewFilter === "Correct") return item.isCorrect;
          if (reviewFilter === "Wrong") return !item.isCorrect;
          return true; // "All"
        });

        const visibleItems = isReviewExpanded ? filteredItems : filteredItems.slice(0, 5);

        return (
          <div className="mx-auto max-w-5xl space-y-8">

            {/* Horizontal Grid for Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

              {/* Card 1: Results Summary */}
              <div className="rounded-[28px] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0c1220] p-6 shadow-xl h-[540px] flex flex-col justify-between">
                {/* Header inside Card */}
                <div className="flex items-center gap-3 border-b border-slate-50 dark:border-white/5 pb-4 text-left">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">Results Summary</h2>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Your overall performance</p>
                  </div>
                </div>

                {/* Score Heading */}
                <div className="space-y-1 text-center">
                  <h3 className="text-xl font-black text-green-600 dark:text-green-400">
                    {results.accuracy >= 85 ? "Excellent! 🎉" : results.accuracy >= 70 ? "Good Job! 👍" : "Well Tried! 💪"}
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">
                    {results.accuracy >= 85 ? "You did an amazing job!" : "Keep practicing to improve further!"}
                  </p>
                </div>

                {/* Circular Accuracy Ring */}
                <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="54"
                      className="stroke-slate-100 dark:stroke-white/5 fill-none"
                      strokeWidth="6"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="54"
                      className="stroke-green-600 dark:stroke-green-400 fill-none transition-all duration-1000 ease-out"
                      strokeWidth="6"
                      strokeDasharray="339.29"
                      strokeDashoffset={339.29 - (339.29 * results.accuracy) / 100}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800 dark:text-white leading-none">
                    <span className="text-3xl font-black">{results.accuracy}%</span>
                    <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Accuracy</span>
                  </div>
                </div>

                {/* Score stats columns */}
                <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-50 dark:border-white/5 text-center">
                  <div>
                    <span className="text-[10px] text-green-600 font-bold block mb-1">Correct</span>
                    <span className="text-lg font-black text-green-600">{correctCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mb-1">Wrong</span>
                    <span className="text-lg font-black text-rose-500">{wrongCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mb-1">Skipped</span>
                    <span className="text-lg font-black text-slate-800 dark:text-white">0</span>
                  </div>
                </div>

                {/* Time and Rank */}
                <div className="grid grid-cols-2 gap-2 text-center pt-2">
                  <div className="border-r border-slate-50 dark:border-white/5">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mb-1">Avg. Time / Question</span>
                    <span className="text-lg font-black text-slate-800 dark:text-white">{avgTime} <span className="text-xs font-semibold text-slate-400">sec</span></span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mb-1">Rank</span>
                    <span className="text-lg font-black text-green-600 dark:text-green-400">{rank}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Session Review */}
              <div className="rounded-[28px] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0c1220] p-6 shadow-xl h-[540px] flex flex-col justify-between">
                {/* Header inside Card */}
                <div className="flex items-center gap-3 border-b border-slate-50 dark:border-white/5 pb-4 text-left shrink-0">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">Session Review</h2>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Review your answers</p>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 shrink-0 my-3">
                  <button
                    onClick={() => setReviewFilter("All")}
                    className={`flex-1 py-2 text-xs font-extrabold rounded-full transition-all cursor-pointer border ${
                      reviewFilter === "All"
                        ? "bg-green-600 dark:bg-green-500 text-white border-green-600"
                        : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/5"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setReviewFilter("Correct")}
                    className={`flex-1 py-2 text-xs font-extrabold rounded-full transition-all cursor-pointer border ${
                      reviewFilter === "Correct"
                        ? "bg-green-600 dark:bg-green-500 text-white border-green-600"
                        : "bg-white dark:bg-white/5 text-green-600 dark:text-green-400 border-slate-200 dark:border-white/5"
                    }`}
                  >
                    Correct
                  </button>
                  <button
                    onClick={() => setReviewFilter("Wrong")}
                    className={`flex-1 py-2 text-xs font-extrabold rounded-full transition-all cursor-pointer border ${
                      reviewFilter === "Wrong"
                        ? "bg-green-600 dark:bg-green-500 text-white border-green-600"
                        : "bg-white dark:bg-white/5 text-rose-500 border-slate-200 dark:border-white/5"
                    }`}
                  >
                    Wrong
                  </button>
                </div>

                {/* Scrollable Review Items List */}
                <div className="flex-1 overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-white/5 max-h-[300px] mb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
                  {filteredItems.map((item) => (
                    <div
                      key={item.index}
                      className={`flex items-center justify-between py-2.5 px-3 transition-colors duration-200 ${
                        !item.isCorrect
                          ? "bg-rose-500/5 dark:bg-rose-500/10 rounded-xl"
                          : ""
                      }`}
                    >
                      {/* Q Number */}
                      <span className={`text-xs font-black w-8 shrink-0 ${!item.isCorrect ? "text-rose-500" : "text-slate-800 dark:text-white"}`}>
                        Q{item.index}
                      </span>

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full border border-slate-100 dark:border-white/5 overflow-hidden shrink-0 shadow-inner">
                        <img
                          src={getFaceUrl(item.face.seed, item.face.styleIdx)}
                          className="w-full h-full object-cover"
                          alt={`Review face ${item.index}`}
                        />
                      </div>

                      {/* Result Check/Cross */}
                      <div className="flex-1 flex justify-center">
                        {item.isCorrect ? (
                          <Check className="w-4 h-4 text-green-600 dark:text-green-400 stroke-[3]" />
                        ) : (
                          <span className="text-rose-500 font-extrabold text-base leading-none">×</span>
                        )}
                      </div>

                      {/* Time */}
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        {item.time}s
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="text-center pt-4 max-w-xs mx-auto">
              <button
                onClick={() => { setPhase(PHASES.SETUP); setResults(null); }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-extrabold text-sm py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <RotateCcw className="mr-2 inline h-4 w-4 stroke-[3]" />
                Take Again
              </button>
            </div>

          </div>
        );
      })()}
          </div>
        </div>
      )}
    </div>
  );
}
