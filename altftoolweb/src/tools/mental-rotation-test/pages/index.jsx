"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  Box,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Activity,
  Brain,
  Timer
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
const TOTAL_TRIALS = 15;

// A set of 5 asymmetric 4x4 polyominoes for mental rotation
const BASE_SHAPES = [
  [
    [0, 1, 0, 0],
    [0, 1, 1, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 0]
  ],
  [
    [0, 0, 1, 0],
    [0, 1, 1, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0]
  ],
  [
    [0, 1, 1, 0],
    [1, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 0]
  ],
  [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [1, 1, 0, 0],
    [1, 0, 0, 0]
  ],
  [
    [0, 0, 1, 1],
    [0, 1, 1, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 0]
  ]
];

// Matrix manipulations
function rotate90(matrix) {
  const n = matrix.length;
  let res = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      res[j][n - 1 - i] = matrix[i][j];
    }
  }
  return res;
}

function flipHorizontal(matrix) {
  return matrix.map(row => [...row].reverse());
}

function getRandomRotation(matrix) {
  const rots = Math.floor(Math.random() * 4);
  let res = matrix;
  for (let i = 0; i < rots; i++) res = rotate90(res);
  return res;
}

function getDistinctRotation(matrix) {
  // Rotate 90, 180, or 270 (not 0)
  const rots = Math.floor(Math.random() * 3) + 1;
  let res = matrix;
  for (let i = 0; i < rots; i++) res = rotate90(res);
  return res;
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

function ShapeGrid({ matrix }) {
  return (
    <div className="grid h-32 w-32 grid-cols-4 grid-rows-4 gap-1 p-1 sm:h-48 sm:w-48">
      {matrix.map((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            className={`rounded-sm sm:rounded-md ${
              cell ? "bg-blue-500 shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]" : "bg-transparent"
            }`}
          />
        ))
      )}
    </div>
  );
}

export default function MentalRotationTest() {
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [trials, setTrials] = useState([]);
  const [currentTrialIdx, setCurrentTrialIdx] = useState(0);
  const [responses, setResponses] = useState([]);
  const [results, setResults] = useState(null);
  
  const trialStartTime = useRef(0);
  const isTransitioning = useRef(false);
  const nextTrialTimeoutRef = useRef(null);

  const startTest = useCallback(() => {
    // Generate trials
    const generated = [];
    for (let i = 0; i < TOTAL_TRIALS; i++) {
      const baseShape = BASE_SHAPES[Math.floor(Math.random() * BASE_SHAPES.length)];
      const target = getRandomRotation(baseShape);
      
      const isSame = Math.random() > 0.5;
      let comparison;
      
      if (isSame) {
        comparison = getDistinctRotation(target);
      } else {
        const flipped = flipHorizontal(target);
        comparison = getRandomRotation(flipped);
      }
      
      generated.push({ target, comparison, isSame });
    }
    
    setTrials(generated);
    setResponses([]);
    setCurrentTrialIdx(0);
    setPhase(PHASES.RUNNING);
    trialStartTime.current = performance.now();
    isTransitioning.current = false;
  }, []);

  const handleResponse = useCallback((userSaidSame) => {
    if (phase !== PHASES.RUNNING || isTransitioning.current) return;
    isTransitioning.current = true;
    
    const currentTrial = trials[currentTrialIdx];
    const rt = Math.round(performance.now() - trialStartTime.current);
    const isCorrect = userSaidSame === currentTrial.isSame;
    
    setResponses((prev) => [...prev, { rt, isCorrect }]);
    
    if (currentTrialIdx + 1 < TOTAL_TRIALS) {
      nextTrialTimeoutRef.current = setTimeout(() => {
        nextTrialTimeoutRef.current = null;
        setCurrentTrialIdx((prev) => prev + 1);
        trialStartTime.current = performance.now();
        isTransitioning.current = false;
      }, 400); // Small delay before next trial for smooth transition
    } else {
      endTest([...responses, { rt, isCorrect }]);
    }
  }, [phase, trials, currentTrialIdx, responses]);

  const endTest = (finalResponses) => {
    const hits = finalResponses.filter((r) => r.isCorrect).length;
    const accuracy = Math.round((hits / TOTAL_TRIALS) * 100);
    const avgRt = Math.round(finalResponses.reduce((acc, r) => acc + r.rt, 0) / TOTAL_TRIALS);
    
    let grade = "Excellent";
    let tone = "good";
    
    if (accuracy < 60) {
      grade = "Below Average";
      tone = "warn";
    } else if (accuracy < 80) {
      grade = "Average";
      tone = "default";
    }
    
    setResults({
      hits,
      accuracy,
      avgRt,
      grade,
      tone,
      history: finalResponses
    });
    setPhase(PHASES.FEEDBACK);
  };

  useEffect(() => {
    if (phase !== PHASES.RUNNING) return;
    
    const handleKeyDown = (e) => {
      if (e.code === "ArrowRight") {
        e.preventDefault();
        handleResponse(true); // Same
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handleResponse(false); // Different
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, handleResponse]);

  useEffect(() => {
    return () => {
      if (nextTrialTimeoutRef.current) {
        clearTimeout(nextTrialTimeoutRef.current);
        nextTrialTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] transition-colors py-6 px-4">
      <header className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
          <Box className="h-8 w-8 text-blue-500" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Mental Rotation Test
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
          Measure your spatial intelligence and ability to mentally manipulate shapes.
        </p>
      </header>

      {phase === PHASES.SETUP && (
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-[var(--foreground)]">Instructions</h2>
            <ul className="mb-8 space-y-3 text-left text-sm text-[var(--muted-foreground)]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                <span>You will see two block shapes on the screen.</span>
              </li>
              <li className="flex items-start gap-2">
                <RefreshCcw className="h-5 w-5 shrink-0 text-blue-500" />
                <span>Mentally rotate the left shape to see if it matches the right shape.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                <span>Press <strong>RIGHT ARROW</strong> if they are the SAME shape (just rotated).</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-5 w-5 shrink-0 text-rose-500" />
                <span>Press <strong>LEFT ARROW</strong> if they are DIFFERENT (mirrored/flipped).</span>
              </li>
            </ul>

            <button onClick={startTest} className="btn-primary w-full max-w-sm rounded-xl py-4 text-lg">
              Start Test (15 Trials)
            </button>
          </div>
        </div>
      )}

      {phase === PHASES.RUNNING && (
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center">
          <div className="mb-8 w-full max-w-md px-4">
            <div className="mb-2 flex justify-between text-xs font-bold uppercase text-[var(--muted-foreground)]">
              <span>Trial {currentTrialIdx + 1} of {TOTAL_TRIALS}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
              <div 
                className="h-full bg-[var(--primary)] transition-all duration-300"
                style={{ width: `${((currentTrialIdx) / TOTAL_TRIALS) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-12 sm:flex-row sm:gap-24 items-center">
            <div className="flex flex-col items-center rounded-2xl bg-[var(--section-highlight)] p-4 sm:p-8">
              <span className="mb-4 text-sm font-bold uppercase text-[var(--muted-foreground)]">Target Shape</span>
              <ShapeGrid matrix={trials[currentTrialIdx].target} />
            </div>
            <div className="flex flex-col items-center rounded-2xl bg-[var(--section-highlight)] p-4 sm:p-8">
              <span className="mb-4 text-sm font-bold uppercase text-[var(--muted-foreground)]">Comparison</span>
              <ShapeGrid matrix={trials[currentTrialIdx].comparison} />
            </div>
          </div>
          
          <div className="mt-12 flex w-full max-w-lg justify-between px-8">
            <button 
              onClick={() => handleResponse(false)}
              className="flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:border-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <kbd className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-[var(--border-strong)] font-bold shadow-sm">←</kbd>
              <span className="font-bold text-rose-500">Different (Mirrored)</span>
            </button>
            <button 
              onClick={() => handleResponse(true)}
              className="flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:border-emerald-500 hover:bg-emerald-500/10 transition-colors"
            >
              <kbd className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-[var(--border-strong)] font-bold shadow-sm">→</kbd>
              <span className="font-bold text-emerald-500">Same (Rotated)</span>
            </button>
          </div>
        </div>
      )}

      {phase === PHASES.FEEDBACK && results && (
        <div className="mx-auto max-w-4xl space-y-6" aria-live="polite" role="status">
          <div className="flex flex-col items-center rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-md">
            <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
              results.tone === "good" ? "bg-emerald-500/10 text-emerald-500" : results.tone === "warn" ? "bg-rose-500/10 text-rose-500" : "bg-blue-500/10 text-blue-500"
            }`}>
              <Brain className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-extrabold text-[var(--foreground)]">Spatial Grade: {results.grade}</h2>
            <p className="mt-2 text-lg text-[var(--muted-foreground)]">
              Accuracy: {results.accuracy}% | Avg Reaction: {results.avgRt}ms
            </p>
            <button onClick={() => setPhase(PHASES.SETUP)} className="btn-primary mt-8 w-full max-w-xs rounded-xl py-3 text-base">
              Retake Test
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <MetricCard
              icon={CheckCircle2}
              label="Accuracy"
              value={`${results.hits} / ${TOTAL_TRIALS}`}
              detail={`Correctly identified ${results.accuracy}% of shapes`}
              tone={results.accuracy < 60 ? "warn" : results.accuracy >= 80 ? "good" : "default"}
            />
            <MetricCard
              icon={Timer}
              label="Reaction Time"
              value={`${results.avgRt}ms`}
              detail="Average time to make a decision"
              tone={results.avgRt < 1500 ? "good" : results.avgRt > 3500 ? "warn" : "default"}
            />
          </div>
        </div>
      )}
    </div>
  );
}
