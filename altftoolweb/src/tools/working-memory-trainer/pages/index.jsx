"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  BrainCircuit,
  Settings,
  Target,
  Trophy,
  History,
  Activity,
  CheckCircle2,
  XCircle,
  Play,
  Volume2,
  Square,
  Repeat
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SafeResponsiveContainer from "@/components/charts/SafeResponsiveContainer";

const PHASES = { SETUP: "setup", RUNNING: "running", FEEDBACK: "feedback" };
const MODES = { SINGLE: "single", DUAL: "dual" };

const LETTERS = ["C", "H", "K", "L", "Q", "R", "S", "T", "V"];
const POSITIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // 3x3 grid
const DISPLAY_TIME_MS = 500;
const INTERVAL_TIME_MS = 2500;
const DEFAULT_TRIALS = 20;

function generateNBackSequence(n, length, targetMatchRate = 0.3) {
  const seq = [];
  for (let i = 0; i < length + n; i++) {
    const isMatch = i >= n && Math.random() < targetMatchRate;
    if (isMatch) {
      seq.push(seq[i - n]);
    } else {
      let val;
      do {
        val = Math.floor(Math.random() * 9);
      } while (i >= n && val === seq[i - n]);
      seq.push(val);
    }
  }
  return seq;
}

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-600"
      : tone === "warn"
        ? "bg-rose-500/10 text-rose-600"
        : tone === "watch"
          ? "bg-amber-500/10 text-amber-600"
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

function SectionCard({ title, icon: Icon, children, action }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-[var(--foreground)]">
          {Icon && <Icon className="h-5 w-5 shrink-0 text-[var(--primary)]" />}
          {title}
        </h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function WorkingMemoryTrainer() {
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [mode, setMode] = useState(MODES.DUAL);
  const [nLevel, setNLevel] = useState(2);
  const [history, setHistory] = useState([]);
  
  // Game state
  const [sequence, setSequence] = useState({ pos: [], letter: [] });
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isStimulusVisible, setIsStimulusVisible] = useState(false);
  const [userResponses, setUserResponses] = useState([]); // { pos: bool, letter: bool }
  const [results, setResults] = useState(null);

  const timerRef = useRef(null);
  const hideTimerRef = useRef(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  // Handle keyboard inputs during game
  useEffect(() => {
    if (phase !== PHASES.RUNNING || currentIndex < 0) return;

    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      if (key === "A") {
        setUserResponses((prev) => {
          const updated = [...prev];
          if (!updated[currentIndex]) updated[currentIndex] = { pos: false, letter: false };
          updated[currentIndex].pos = true;
          return updated;
        });
      } else if (key === "L" && mode === MODES.DUAL) {
        setUserResponses((prev) => {
          const updated = [...prev];
          if (!updated[currentIndex]) updated[currentIndex] = { pos: false, letter: false };
          updated[currentIndex].letter = true;
          return updated;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, currentIndex, mode]);

  const startSession = () => {
    cleanup();
    const totalTrials = DEFAULT_TRIALS + nLevel;
    const posSeq = generateNBackSequence(nLevel, DEFAULT_TRIALS, 0.3);
    const letterSeq = generateNBackSequence(nLevel, DEFAULT_TRIALS, 0.3).map((i) => LETTERS[i]);
    
    setSequence({ pos: posSeq, letter: letterSeq });
    setUserResponses(new Array(totalTrials).fill({ pos: false, letter: false }));
    setCurrentIndex(-1);
    setPhase(PHASES.RUNNING);
    
    let idx = 0;
    
    const showNext = () => {
      if (idx >= totalTrials) {
        endSession(posSeq, letterSeq, totalTrials);
        return;
      }
      
      setCurrentIndex(idx);
      setIsStimulusVisible(true);
      
      // Speak letter if dual mode
      if (mode === MODES.DUAL && window.speechSynthesis) {
         const msg = new SpeechSynthesisUtterance(letterSeq[idx]);
         msg.rate = 1.2;
         msg.volume = 0.8;
         window.speechSynthesis.cancel();
         window.speechSynthesis.speak(msg);
      }

      hideTimerRef.current = setTimeout(() => {
        setIsStimulusVisible(false);
      }, DISPLAY_TIME_MS);

      idx++;
    };

    // First stimulus after a short delay
    setTimeout(() => {
      showNext();
      timerRef.current = setInterval(showNext, INTERVAL_TIME_MS);
    }, 1000);
  };

  const endSession = (posSeq, letterSeq, totalTrials) => {
    cleanup();
    
    let posHits = 0, posMisses = 0, posFalseAlarms = 0;
    let letHits = 0, letMisses = 0, letFalseAlarms = 0;

    for (let i = nLevel; i < totalTrials; i++) {
      const isPosMatch = posSeq[i] === posSeq[i - nLevel];
      const isLetMatch = letterSeq[i] === letterSeq[i - nLevel];
      
      const userPos = userResponses[i]?.pos || false;
      const userLet = userResponses[i]?.letter || false;

      if (isPosMatch && userPos) posHits++;
      else if (isPosMatch && !userPos) posMisses++;
      else if (!isPosMatch && userPos) posFalseAlarms++;

      if (mode === MODES.DUAL) {
        if (isLetMatch && userLet) letHits++;
        else if (isLetMatch && !userLet) letMisses++;
        else if (!isLetMatch && userLet) letFalseAlarms++;
      }
    }

    const posTargets = posHits + posMisses;
    const letTargets = letHits + letMisses;
    
    const posScore = posTargets > 0 ? Math.max(0, posHits - posFalseAlarms) / posTargets : 1;
    const letScore = mode === MODES.DUAL && letTargets > 0 ? Math.max(0, letHits - letFalseAlarms) / letTargets : 1;
    
    const totalScore = mode === MODES.DUAL ? (posScore + letScore) / 2 : posScore;
    const scorePercent = Math.round(totalScore * 100);

    let nextN = nLevel;
    let message = "Maintained level";
    if (scorePercent >= 80) {
      nextN++;
      message = "Level Up! Excellent performance.";
    } else if (scorePercent < 50 && nLevel > 1) {
      nextN--;
      message = "Level Down. Keep practicing!";
    }

    const resultObj = {
      nLevel,
      mode,
      score: scorePercent,
      posStats: { hits: posHits, misses: posMisses, falseAlarms: posFalseAlarms },
      letStats: mode === MODES.DUAL ? { hits: letHits, misses: letMisses, falseAlarms: letFalseAlarms } : null,
      nextN,
      message,
      timestamp: new Date().toISOString()
    };

    setResults(resultObj);
    setHistory(prev => [...prev, resultObj]);
    setNLevel(nextN);
    setPhase(PHASES.FEEDBACK);
  };

  const chartData = useMemo(() => {
    return history.map((h, i) => ({
      session: i + 1,
      score: h.score,
      nLevel: h.nLevel
    }));
  }, [history]);

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] transition-colors py-6 px-4">
      <header className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-fuchsia-500/10">
          <BrainCircuit className="h-8 w-8 text-fuchsia-600" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Working Memory Trainer
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
          The Dual N-Back task is the scientific standard for expanding working memory capacity and fluid intelligence.
        </p>
      </header>

      {phase === PHASES.SETUP && (
        <div className="mx-auto max-w-4xl space-y-6">
          <SectionCard title="Session Setup" icon={Settings}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">Game Mode</label>
                <div className="flex rounded-lg bg-[var(--section-highlight)] p-1">
                  <button
                    onClick={() => setMode(MODES.SINGLE)}
                    className={`flex-1 rounded-md py-2 text-sm font-bold transition-all ${
                      mode === MODES.SINGLE ? "bg-[var(--card)] text-[var(--primary)] shadow" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    Single N-Back (Visual)
                  </button>
                  <button
                    onClick={() => setMode(MODES.DUAL)}
                    className={`flex-1 rounded-md py-2 text-sm font-bold transition-all ${
                      mode === MODES.DUAL ? "bg-[var(--card)] text-[var(--primary)] shadow" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    Dual N-Back (Visual + Audio)
                  </button>
                </div>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  {mode === MODES.SINGLE 
                    ? "Track only the position of the square on the grid." 
                    : "Track BOTH the position of the square and the spoken letter simultaneously."}
                </p>
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">N-Level (Difficulty)</label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setNLevel(Math.max(1, nLevel - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] hover:bg-[var(--section-highlight)]"
                  >
                    -
                  </button>
                  <span className="text-2xl font-extrabold text-[var(--primary)]">{nLevel}-Back</span>
                  <button 
                    onClick={() => setNLevel(nLevel + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] hover:bg-[var(--section-highlight)]"
                  >
                    +
                  </button>
                </div>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Match stimuli that appeared exactly {nLevel} step{nLevel > 1 ? "s" : ""} ago.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--section-highlight)] p-6">
              <h4 className="mb-4 text-sm font-bold uppercase text-[var(--muted-foreground)]">How to play</h4>
              <div className="flex w-full max-w-lg justify-between text-center">
                <div className="flex flex-col items-center">
                  <kbd className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg border-2 border-[var(--border-strong)] bg-[var(--card)] text-xl font-bold text-[var(--foreground)] shadow-sm">
                    A
                  </kbd>
                  <span className="text-sm font-semibold text-[var(--foreground)]">Position Match</span>
                </div>
                <div className="flex flex-col items-center">
                  <kbd className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg border-2 border-[var(--border-strong)] bg-[var(--card)] text-xl font-bold text-[var(--foreground)] shadow-sm opacity-50">
                    S
                  </kbd>
                  <span className="text-sm font-semibold text-[var(--muted-foreground)]">(Ignore)</span>
                </div>
                <div className={`flex flex-col items-center ${mode === MODES.SINGLE ? "opacity-30" : ""}`}>
                  <kbd className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg border-2 border-[var(--border-strong)] bg-[var(--card)] text-xl font-bold text-[var(--foreground)] shadow-sm">
                    L
                  </kbd>
                  <span className="text-sm font-semibold text-[var(--foreground)]">Audio Match</span>
                </div>
              </div>
              <button onClick={startSession} className="btn-primary mt-8 w-full max-w-sm rounded-xl py-4 text-lg">
                Start Session
              </button>
            </div>
          </SectionCard>
        </div>
      )}

      {phase === PHASES.RUNNING && (
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          <div className="mb-6 flex w-full justify-between px-4">
            <span className="rounded-full bg-[var(--section-highlight)] px-4 py-1 text-sm font-bold text-[var(--muted-foreground)]">
              {nLevel}-Back {mode === MODES.DUAL ? "Dual" : "Single"}
            </span>
            <span className="rounded-full bg-[var(--section-highlight)] px-4 py-1 text-sm font-bold text-[var(--muted-foreground)]">
              Trial {Math.max(1, currentIndex + 1)} / {sequence.pos.length}
            </span>
          </div>

          {/* Grid */}
          <div className="grid h-80 w-80 grid-cols-3 grid-rows-3 gap-2 bg-[var(--border)] p-2 rounded-xl sm:h-96 sm:w-96">
            {POSITIONS.map((pos) => {
              const isActive = isStimulusVisible && sequence.pos[currentIndex] === pos;
              return (
                <div
                  key={pos}
                  className={`flex items-center justify-center rounded-lg transition-all duration-100 ${
                    isActive ? "bg-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.5)] scale-[0.98]" : "bg-[var(--card)]"
                  }`}
                >
                  {/* Optional: Show letter visually instead of audio if preferred, but we use TTS audio */}
                  {mode === MODES.DUAL && isActive && (
                     <Volume2 className="h-8 w-8 text-white opacity-50" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Active input feedback (glows when user presses key) */}
          <div className="mt-12 flex w-full max-w-sm justify-between">
            <div className={`flex flex-col items-center transition-all ${userResponses[currentIndex]?.pos ? "scale-110 opacity-100" : "opacity-50"}`}>
              <kbd className={`mb-2 flex h-12 w-12 items-center justify-center rounded-lg border-2 text-xl font-bold ${
                userResponses[currentIndex]?.pos ? "border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-500" : "border-[var(--border-strong)] bg-[var(--card)] text-[var(--foreground)]"
              }`}>A</kbd>
              <span className="text-sm font-bold text-[var(--muted-foreground)]">Position</span>
            </div>
            {mode === MODES.DUAL && (
              <div className={`flex flex-col items-center transition-all ${userResponses[currentIndex]?.letter ? "scale-110 opacity-100" : "opacity-50"}`}>
                <kbd className={`mb-2 flex h-12 w-12 items-center justify-center rounded-lg border-2 text-xl font-bold ${
                  userResponses[currentIndex]?.letter ? "border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-500" : "border-[var(--border-strong)] bg-[var(--card)] text-[var(--foreground)]"
                }`}>L</kbd>
                <span className="text-sm font-bold text-[var(--muted-foreground)]">Audio</span>
              </div>
            )}
          </div>
        </div>
      )}

      {phase === PHASES.FEEDBACK && results && (
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex flex-col items-center rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-md">
            <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
              results.score >= 80 ? "bg-emerald-500/10 text-emerald-500" : results.score < 50 ? "bg-rose-500/10 text-rose-500" : "bg-blue-500/10 text-blue-500"
            }`}>
              {results.score >= 80 ? <Trophy className="h-10 w-10" /> : results.score < 50 ? <XCircle className="h-10 w-10" /> : <Target className="h-10 w-10" />}
            </div>
            <h2 className="text-4xl font-extrabold text-[var(--foreground)]">{results.score}% Score</h2>
            <p className="mt-2 text-lg font-semibold text-[var(--muted-foreground)]">{results.message}</p>
            <button onClick={() => setPhase(PHASES.SETUP)} className="btn-primary mt-8 w-full max-w-xs rounded-xl py-3 text-base">
              Continue to {results.nextN}-Back
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              icon={Square}
              label="Position Accuracy"
              value={`${results.posStats.hits} Hits`}
              detail={`${results.posStats.misses} Misses, ${results.posStats.falseAlarms} False Alarms`}
              tone={results.posStats.falseAlarms > 2 ? "warn" : "default"}
            />
            {mode === MODES.DUAL && (
              <MetricCard
                icon={Volume2}
                label="Audio Accuracy"
                value={`${results.letStats.hits} Hits`}
                detail={`${results.letStats.misses} Misses, ${results.letStats.falseAlarms} False Alarms`}
                tone={results.letStats.falseAlarms > 2 ? "warn" : "default"}
              />
            )}
          </div>

          {history.length > 1 && (
            <SectionCard title="Performance Over Time" icon={Activity}>
              <div className="h-64">
                <SafeResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <XAxis dataKey="session" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} domain={[0, 100]} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "var(--primary)" }} domain={[1, 6]} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }} />
                    <Line yAxisId="left" type="monotone" dataKey="score" stroke="#d946ef" strokeWidth={3} dot={{ r: 4 }} name="Score (%)" />
                    <Line yAxisId="right" type="stepAfter" dataKey="nLevel" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="5 5" dot={false} name="N-Level" />
                  </LineChart>
                </SafeResponsiveContainer>
              </div>
            </SectionCard>
          )}
        </div>
      )}
    </div>
  );
}
