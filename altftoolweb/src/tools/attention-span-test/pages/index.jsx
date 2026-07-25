"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock,
  RefreshCcw,
  Settings,
  Target,
  XCircle,
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
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWYZ".split(""); // Without X

const DISPLAY_TIME_MS = 250;
const TOTAL_INTERVAL_MS = 1250;
const DURATION_SECONDS = 120; // 2 minutes default

function generateTrials(durationMs, intervalMs, xProbability = 0.15) {
  const numTrials = Math.floor(durationMs / intervalMs);
  const trials = [];
  for (let i = 0; i < numTrials; i++) {
    const isX = Math.random() < xProbability;
    const letter = isX ? "X" : LETTERS[Math.floor(Math.random() * LETTERS.length)];
    trials.push({ letter, isX });
  }
  return trials;
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

export default function AttentionSpanTest() {
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [duration, setDuration] = useState(DURATION_SECONDS);
  const [trials, setTrials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isStimulusVisible, setIsStimulusVisible] = useState(false);
  const [responses, setResponses] = useState([]);
  const [results, setResults] = useState(null);

  const timerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const stimulusAppearTime = useRef(0);
  const hasRespondedThisTrial = useRef(false);

  const activeStimulus = currentIndex >= 0 && currentIndex < trials.length ? trials[currentIndex] : null;

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const startTest = useCallback(() => {
    cleanup();
    const generated = generateTrials(duration * 1000, TOTAL_INTERVAL_MS, 0.15);
    setTrials(generated);
    setResponses([]);
    setCurrentIndex(-1);
    setPhase(PHASES.RUNNING);

    let idx = 0;
    const runNext = () => {
      if (idx >= generated.length) {
        endTest(generated);
        return;
      }

      setCurrentIndex(idx);
      setIsStimulusVisible(true);
      stimulusAppearTime.current = performance.now();
      hasRespondedThisTrial.current = false;

      hideTimerRef.current = setTimeout(() => {
        setIsStimulusVisible(false);
      }, DISPLAY_TIME_MS);

      idx++;
    };

    // First delay
    setTimeout(() => {
      runNext();
      timerRef.current = setInterval(runNext, TOTAL_INTERVAL_MS);
    }, 1000);
  }, [duration, cleanup]);

  const endTest = useCallback((finalTrials = trials) => {
    cleanup();
    setPhase(PHASES.FEEDBACK);

    let hits = 0, omissions = 0, commissions = 0, falseAlarms = 0; // false alarms are pressing when no stimulus? CPT terms: commission = pressing on X
    let reactionTimes = [];

    // Evaluate based on final array of responses.
    // Responses might be less than trials if user didn't finish.

    // Let's rely on the responses array state... wait, state might not be fresh in setInterval.
    // Instead, we update responses dynamically.
    // We can calculate at the end.
    setResponses((currentResponses) => {
      let finalResps = [...currentResponses];
      // Pad missing responses with null
      while (finalResps.length < finalTrials.length) {
        finalResps.push(null);
      }

      for (let i = 0; i < finalTrials.length; i++) {
        const trial = finalTrials[i];
        const res = finalResps[i];

        if (!trial.isX) {
          // Target trial
          if (res && res.pressed) {
            hits++;
            reactionTimes.push(res.rt);
          } else {
            omissions++;
          }
        } else {
          // Non-target trial (X)
          if (res && res.pressed) {
            commissions++;
          }
        }
      }

      const avgRt = reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a,b)=>a+b,0) / reactionTimes.length) : 0;
      const totalTargets = finalTrials.filter(t => !t.isX).length;
      const accuracy = totalTargets > 0 ? Math.round((hits / totalTargets) * 100) : 0;

      let attentionGrade = "Excellent";
      let attentionTone = "good";
      if (accuracy < 80 || commissions > 5) {
        attentionGrade = "Below Average";
        attentionTone = "warn";
      } else if (accuracy < 90 || commissions > 2) {
        attentionGrade = "Average";
        attentionTone = "default";
      }

      setResults({
        hits,
        omissions,
        commissions,
        avgRt,
        accuracy,
        totalTargets,
        totalX: finalTrials.filter(t => t.isX).length,
        attentionGrade,
        attentionTone
      });

      return finalResps;
    });
  }, [trials, cleanup]);

  useEffect(() => {
    if (phase !== PHASES.RUNNING) return;

    const handleKeyDown = (e) => {
      if (e.code === "Space" && currentIndex >= 0 && !hasRespondedThisTrial.current) {
        e.preventDefault();
        const rt = Math.round(performance.now() - stimulusAppearTime.current);
        hasRespondedThisTrial.current = true;

        setResponses((prev) => {
          const arr = [...prev];
          arr[currentIndex] = { pressed: true, rt };
          return arr;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, currentIndex]);

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] transition-colors py-6 px-4">
      <header className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
          <Target className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Attention Span Test
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
          Measure sustained attention, focus, and impulsivity using a scientific Continuous Performance Task (CPT).
        </p>
      </header>

      {phase === PHASES.SETUP && (
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-[var(--foreground)]">Instructions</h2>
            <ul className="mb-8 space-y-3 text-left text-sm text-[var(--muted-foreground)]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                <span>Letters will flash rapidly on the screen.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                <span>Press the <strong>Spacebar</strong> as quickly as possible for EVERY letter...</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-5 w-5 shrink-0 text-rose-500" />
                <span><strong>EXCEPT the letter X.</strong> Do NOT press anything when you see X.</span>
              </li>
            </ul>

            <div className="mb-8 w-full max-w-sm">
              <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">Test Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
              >
                <option value={60}>1 Minute (Quick check)</option>
                <option value={120}>2 Minutes (Standard)</option>
                <option value={300}>5 Minutes (Deep evaluation)</option>
              </select>
            </div>

            <button onClick={startTest} className="btn-primary w-full max-w-sm rounded-xl py-4 text-lg">
              Start Test
            </button>
          </div>
        </div>
      )}

      {phase === PHASES.RUNNING && (
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center">
          <div className="mb-8 text-center text-sm font-bold text-[var(--muted-foreground)]">
            <span className="animate-pulse">Test in progress... Stay focused.</span>
          </div>

          <div className="flex h-80 w-full max-w-lg items-center justify-center rounded-3xl border-4 border-[var(--border-strong)] bg-[var(--card)] shadow-inner">
            {isStimulusVisible && activeStimulus ? (
              <span className="text-9xl font-extrabold text-[var(--foreground)]">{activeStimulus.letter}</span>
            ) : (
              <span className="text-9xl opacity-0">A</span>
            )}
          </div>

          <div className="mt-8 text-center">
            <kbd className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-[var(--border-strong)] bg-[var(--card)] px-12 text-xl font-bold text-[var(--foreground)] shadow-sm">
              SPACE
            </kbd>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">Press for all except X</p>
          </div>
        </div>
      )}

      {phase === PHASES.FEEDBACK && results && (
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex flex-col items-center rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-md">
            <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
              results.attentionTone === "good" ? "bg-emerald-500/10 text-emerald-500" : results.attentionTone === "warn" ? "bg-rose-500/10 text-rose-500" : "bg-blue-500/10 text-blue-500"
            }`}>
              <Brain className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-extrabold text-[var(--foreground)]">Attention Grade: {results.attentionGrade}</h2>
            <p className="mt-2 text-lg text-[var(--muted-foreground)]">
              Accuracy: {results.accuracy}% | Avg Reaction: {results.avgRt}ms
            </p>
            <button onClick={() => setPhase(PHASES.SETUP)} className="btn-primary mt-8 w-full max-w-xs rounded-xl py-3 text-base">
              Retake Test
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              icon={Target}
              label="Omission Errors (Inattention)"
              value={results.omissions}
              detail={`Missed targets out of ${results.totalTargets}`}
              tone={results.omissions > 5 ? "warn" : results.omissions === 0 ? "good" : "default"}
            />
            <MetricCard
              icon={AlertTriangle}
              label="Commission Errors (Impulsivity)"
              value={results.commissions}
              detail={`Pressed on 'X' (Total Xs: ${results.totalX})`}
              tone={results.commissions > 2 ? "warn" : results.commissions === 0 ? "good" : "default"}
            />
            <MetricCard
              icon={Clock}
              label="Reaction Time"
              value={`${results.avgRt}ms`}
              detail="Average time to hit spacebar"
              tone={results.avgRt < 400 ? "good" : results.avgRt > 600 ? "warn" : "default"}
            />
          </div>

          <SectionCard title="What do these results mean?" icon={Activity}>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
                <h4 className="font-bold text-[var(--foreground)]">Omission Errors (Inattention)</h4>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Failing to press the spacebar when a valid letter appears indicates a lapse in sustained attention or zoning out. A high number suggests poor vigilance.
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
                <h4 className="font-bold text-[var(--foreground)]">Commission Errors (Impulsivity)</h4>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Pressing the spacebar when the letter 'X' appears indicates poor inhibitory control or impulsivity. You reacted automatically before evaluating the stimulus.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
