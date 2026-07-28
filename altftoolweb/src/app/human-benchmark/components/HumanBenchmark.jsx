"use client";
import { useState } from "react";
import {
  BarChart3, Brain, CheckCircle2, MousePointer2, Play, RotateCcw, ShieldCheck,
  Trophy, Volume2, VolumeX, Zap, Eye, Hash, MessageSquare, Keyboard, Crosshair,
  Grid2x2, LayoutGrid
} from "lucide-react";
import { useScores, useBeep } from "../hooks/hooks";
import { BENCHMARK_TESTS } from "../data/tests";
import ReactionTime from "./tests/ReactionTime";
import VisualMemory from "./tests/VisualMemory";
import NumberMemory from "./tests/NumberMemory";
import VerbalMemory from "./tests/VerbalMemory";
import TypingTest from "./tests/TypingTest";
import AimTrainer from "./tests/AimTrainer";
import ChimpTest from "./tests/ChimpTest";
import SequenceMemory from "./tests/SequenceMemory";

// Icons cannot live in data/tests.js: that module is imported by the server
// guide and by layout.jsx's JSON-LD, which must stay free of React components.
// The data carries the lucide export name and this map resolves it here.
const ICONS = { Zap, Eye, Hash, MessageSquare, Keyboard, Crosshair, Grid2x2, LayoutGrid };

// Single source of truth for the eight tests — see ../data/tests.js. The
// server-rendered guide under the dashboard reads the same list, so the cards,
// the score table and the structured data can never disagree.
const TESTS = BENCHMARK_TESTS.map((test) => ({ ...test, Icon: ICONS[test.icon] }));

const FEATURE_STEPS = [
  { Icon: MousePointer2, title: "Choose a test", desc: "Start with reflexes, memory, typing, aim, or pattern recall." },
  { Icon: Zap, title: "Play instantly", desc: "Each test starts fast and focuses on one measurable ability." },
  { Icon: BarChart3, title: "Track best scores", desc: "Attempts are saved locally so progress stays private." },
];

const COMPONENTS = {
  reaction_time: ReactionTime, visual_memory: VisualMemory,
  number_memory: NumberMemory, verbal_memory: VerbalMemory,
  typing_test: TypingTest,    aim_trainer: AimTrainer,
  chimp_test: ChimpTest,      sequence_memory: SequenceMemory,
};

function formatScore(score, unit, lowerBetter) {
  if (score === null || score === undefined) return "—";
  if (unit === "ms") return `${score} ms`;
  if (unit === "WPM") return `${score} WPM`;
  if (unit === "lvl") return `Level ${score}`;
  if (unit === "seq") return `${score} seq`;
  return `${score}`;
}

function scoreValue(scores, id) {
  return scores[id]?.best ?? null;
}

export default function HumanBenchmark() {
  const [view, setView] = useState("dashboard");
  const [activeTestId, setActiveTestId] = useState(null);
  const { scores, saveScore, resetAll } = useScores();
  const beep = useBeep();

  const openTest = (id) => { setActiveTestId(id); setView("test"); };
  const closeTest = () => { setActiveTestId(null); setView("dashboard"); };

  const handleComplete = (score) => {
    if (activeTestId) saveScore(activeTestId, score);
    closeTest();
  };

  if (view === "test" && activeTestId) {
    const TestComp = COMPONENTS[activeTestId];
    const testCfg = TESTS.find(t => t.id === activeTestId);
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={closeTest} className="flex items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-bold text-[var(--secondary-foreground)]">
            ← Back
          </button>
          <h2 className="text-lg font-black text-[var(--foreground)] flex items-center gap-2">
            <span className={`${testCfg.color}`}><testCfg.Icon className="h-5 w-5" /></span>
            {testCfg.name}
          </h2>
          <button onClick={beep.toggleMute} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-2">
            {beep.muted ? <VolumeX className="h-4 w-4 text-[var(--muted-foreground)]" /> : <Volume2 className="h-4 w-4 text-[var(--primary)]" />}
          </button>
        </div>
        <TestComp onComplete={handleComplete} onBack={closeTest} beep={beep} bestScore={scores[activeTestId]?.best ?? null} />
      </div>
    );
  }

  const totalAttempts = TESTS.reduce((sum, t) => sum + (scores[t.id]?.attempts?.length ?? 0), 0);
  const completedTests = TESTS.filter(t => scoreValue(scores, t.id) !== null).length;
  const featuredTest = TESTS[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <section id="overview" className="relative overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card)]/80 shadow-2xl">
        <div className="absolute inset-0 opacity-50">
          <div className="grid h-full grid-cols-8 grid-rows-6">
            {Array.from({ length: 48 }).map((_, index) => (
              <div key={index} className="border border-[var(--card-border)]/50" />
            ))}
          </div>
        </div>
        <div className="relative grid min-h-[520px] gap-8 p-6 md:p-10 lg:grid-cols-[1fr_460px] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-4 py-1.5 text-xs font-semibold text-[var(--primary)]">
              <Brain className="h-3.5 w-3.5" /> Cognitive Performance Lab
            </div>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-[var(--primary)] sm:text-6xl">
              Measure reflexes, memory, focus, and typing speed.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--secondary-foreground)]">
              Take eight fast cognitive tests, compare your best scores, and build a private local history of your reaction time, memory span, visual recall, aim, and keyboard speed.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => openTest(featuredTest.id)} className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-black text-[var(--primary-foreground)] shadow-lg">
                <Play className="h-4 w-4" fill="currentColor" /> Start Reaction Test
              </button>
              <a href="#tests" className="inline-flex items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-5 py-3 text-sm font-bold text-[var(--foreground)]">
                Explore Tests
              </a>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
              <HeroMetric label="Tests" value={TESTS.length} />
              <HeroMetric label="Completed" value={`${completedTests}/${TESTS.length}`} />
              <HeroMetric label="Attempts" value={totalAttempts} />
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--background)]/90 p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-[var(--card-border)] pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--secondary-foreground)]">Live Scoreboard</p>
                <h2 className="mt-1 text-lg font-black text-[var(--foreground)]">Your benchmark snapshot</h2>
              </div>
              <Trophy className="h-6 w-6 text-[var(--primary)]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {TESTS.slice(0, 6).map(t => (
                <button key={t.id} onClick={() => openTest(t.id)} className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/80 p-4 text-left">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${t.bg}`}>
                      <t.Icon className={`h-5 w-5 ${t.color}`} />
                    </span>
                    <span className="font-mono text-xs font-black text-[var(--primary)]">{formatScore(scoreValue(scores, t.id), t.unit, t.lowerBetter)}</span>
                  </div>
                  <p className="text-sm font-black text-[var(--foreground)]">{t.name}</p>
                  <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">{scores[t.id]?.attempts?.length ?? 0} attempts</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {FEATURE_STEPS.map(({ Icon, title, desc }) => (
          <article key={title} className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/80 p-5 shadow-lg">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-base font-black text-[var(--foreground)]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--secondary-foreground)]">{desc}</p>
          </article>
        ))}
      </section>

      <section id="tests" className="mt-10">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
              <CheckCircle2 className="h-3.5 w-3.5" /> Test Suite
            </div>
            <h2 className="mt-3 text-2xl font-black text-[var(--foreground)]">Choose a benchmark</h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-[var(--secondary-foreground)]">
            Each test isolates one skill so your score is easy to understand and compare across attempts.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TESTS.map(t => {
            const best = scores[t.id]?.best ?? null;
            const attempts = scores[t.id]?.attempts?.length ?? 0;
            return (
              <button key={t.id} onClick={() => openTest(t.id)}
                className="group rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/80 p-5 text-left shadow-lg hover:border-[var(--primary)]/50">
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${t.bg}`}>
                    <t.Icon className={`h-6 w-6 ${t.color}`} />
                  </div>
                  <span className="rounded-full border border-[var(--card-border)] px-2 py-1 text-[10px] font-bold text-[var(--muted-foreground)]">
                    {t.lowerBetter ? "lower wins" : "higher wins"}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-black text-[var(--foreground)]">{t.name}</h3>
                <p className="mt-2 min-h-[42px] text-xs leading-5 text-[var(--muted-foreground)]">{t.desc}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[var(--card-border)] pt-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Best</p>
                    <p className="mt-1 font-mono text-xs font-black text-[var(--primary)]">{formatScore(best, t.unit, t.lowerBetter)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Attempts</p>
                    <p className="mt-1 font-mono text-xs font-black text-[var(--foreground)]">{attempts}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section id="scores" className="mt-10 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/80 p-6 shadow-lg">
          <ShieldCheck className="mb-4 h-8 w-8 text-[var(--primary)]" />
          <h2 className="text-xl font-black text-[var(--foreground)]">Private by default</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--secondary-foreground)]">
            Scores are stored locally in this browser. Use the table to track your personal bests and reset when you want a fresh run.
          </p>
        </div>
        <ScoresTable scores={scores} resetAll={resetAll} />
      </section>
    </div>
  );
}

function HeroMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--background)]/80 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 font-mono text-2xl font-black text-[var(--primary)]">{value}</p>
    </div>
  );
}

function ScoresTable({ scores, resetAll }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/80 shadow-lg">
      <div className="flex items-center justify-between border-b border-[var(--card-border)] px-5 py-4">
        <h3 className="text-sm font-black text-[var(--foreground)]">Best Scores</h3>
        <button onClick={resetAll} className="flex items-center gap-1.5 rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-[10px] font-bold text-[var(--muted-foreground)]">
          <RotateCcw className="h-3 w-3" /> Reset All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-xs">
          <thead><tr className="border-b border-[var(--card-border)]">
            {["Test","Best Score","Attempts","Last Played"].map(h => (
              <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-[var(--card-border)]">
            {TESTS.map(t => {
              const data = scores[t.id];
              const last = data?.attempts?.[0]?.date ? new Date(data.attempts[0].date).toLocaleDateString() : "—";
              return (
                <tr key={t.id} className="hover:bg-[var(--muted)]/20">
                  <td className="px-4 py-3 font-bold text-[var(--foreground)]">
                    <span className="inline-flex items-center gap-2">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${t.bg}`}>
                        <t.Icon className={`h-3.5 w-3.5 ${t.color}`} />
                      </span>
                      {t.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-black text-[var(--primary)]">{formatScore(data?.best ?? null, t.unit, t.lowerBetter)}</td>
                  <td className="px-4 py-3 text-[var(--secondary-foreground)]">{data?.attempts?.length ?? 0}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{last}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
