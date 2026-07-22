"use client";

import { useState, useEffect } from "react";
import { BrainCircuit, Dumbbell, BookOpen, Moon, Heart, Users, CheckCircle2, Circle, Activity } from "lucide-react";

const HABITS = [
  {
    id: "exercise",
    title: "Aerobic Exercise (30+ mins)",
    desc: "Releases BDNF (Brain-Derived Neurotrophic Factor), a key protein for growing new neurons.",
    icon: Dumbbell,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500"
  },
  {
    id: "learning",
    title: "Learned Something New",
    desc: "Active learning (language, instrument, difficult reading) creates new synaptic connections.",
    icon: BookOpen,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500"
  },
  {
    id: "sleep",
    title: "Deep Quality Sleep (7-9 hrs)",
    desc: "Crucial for memory consolidation and flushing out neurotoxins via the glymphatic system.",
    icon: Moon,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500"
  },
  {
    id: "mindfulness",
    title: "Meditation / Deep Focus",
    desc: "Increases cortical thickness and strengthens neural networks related to attention and emotional regulation.",
    icon: BrainCircuit,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500"
  },
  {
    id: "social",
    title: "Meaningful Social Connection",
    desc: "Complex social interactions build cognitive reserve and protect against neurodegeneration.",
    icon: Users,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500"
  }
];

export default function NeuroplasticityHabitTracker() {
  const [completed, setCompleted] = useState({});
  const [mounted, setMounted] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("neuroplasticity-habits-today");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only load if it's the same day
        if (parsed.date === new Date().toDateString()) {
          setCompleted(parsed.completed);
        }
      } catch (e) {
        console.error("Failed to load habits", e);
      }
    }
    setMounted(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("neuroplasticity-habits-today", JSON.stringify({
        date: new Date().toDateString(),
        completed
      }));
    }
  }, [completed, mounted]);

  const toggleHabit = (id) => {
    setCompleted(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const score = Math.round((Object.values(completed).filter(Boolean).length / HABITS.length) * 100);

  if (!mounted) return null;

  return (
    <div className="bg-[var(--background)] min-h-screen text-[var(--foreground)] py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        <header className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
            <BrainCircuit className="h-8 w-8 text-violet-500" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[var(--foreground)]">
            Neuroplasticity Habit Tracker
          </h1>
          <p className="mt-4 text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Your brain changes every day based on what you do. Track the core habits proven by neuroscience to promote synaptogenesis and cognitive health.
          </p>
        </header>

        {/* Score Dashboard */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Today's Brain Growth</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Completing these habits signals your brain to release BDNF and physically wire new neural pathways.
              Aim for at least 60% daily for optimal neuro-longevity.
            </p>
          </div>

          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" className="stroke-[var(--section-highlight)]" strokeWidth="12" fill="none" />
              <circle
                cx="64" cy="64" r="56"
                className="stroke-violet-500 transition-all duration-1000 ease-out"
                strokeWidth="12"
                fill="none"
                strokeDasharray={351.8}
                strokeDashoffset={351.8 - (351.8 * score) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-[var(--foreground)]">{score}%</span>
            </div>
          </div>
        </div>

        {/* Habit List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <Activity className="w-5 h-5 text-violet-500" /> Daily Neuro-Habits
          </h3>

          <div className="grid gap-4">
            {HABITS.map(habit => {
              const isDone = completed[habit.id];
              return (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`flex items-start text-left gap-4 p-5 rounded-2xl border transition-all active:scale-[0.98] ${
                    isDone
                      ? `${habit.bg} ${habit.border}`
                      : "bg-[var(--card)] border-[var(--border)] hover:bg-[var(--section-highlight)]"
                  }`}
                >
                  <div className={`shrink-0 mt-0.5 ${isDone ? habit.color : "text-[var(--muted-foreground)]"}`}>
                    {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <habit.icon className={`w-4 h-4 ${isDone ? habit.color : "text-[var(--muted-foreground)]"}`} />
                      <span className={`font-bold ${isDone ? "text-[var(--foreground)]" : "text-[var(--foreground)]"}`}>
                        {habit.title}
                      </span>
                    </div>
                    <p className={`text-sm ${isDone ? "text-[var(--foreground)] opacity-80" : "text-[var(--muted-foreground)]"}`}>
                      {habit.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
