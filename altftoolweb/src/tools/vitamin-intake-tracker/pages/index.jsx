"use client";

import { useState, useEffect } from "react";
import { Pill, Sun, Droplets, Zap, Activity, ShieldCheck, CheckCircle2, Circle } from "lucide-react";

const VITAMINS = [
  {
    id: "vitD",
    title: "Vitamin D3",
    dosage: "1000 - 4000 IU",
    desc: "Essential for mood regulation, cognitive function, and immune health. Best absorbed with fat.",
    icon: Sun,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500"
  },
  {
    id: "b12",
    title: "B-Complex (B6, B9, B12)",
    dosage: "Varies (Look for Methylated)",
    desc: "Crucial for neurotransmitter synthesis and energy production in the brain.",
    icon: Zap,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500"
  },
  {
    id: "magnesium",
    title: "Magnesium (Glycinate / L-Threonate)",
    dosage: "200 - 400 mg",
    desc: "Promotes deep sleep, neuroplasticity, and regulates the nervous system.",
    icon: Activity,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500"
  },
  {
    id: "omega3",
    title: "Omega-3 (EPA & DHA)",
    dosage: "1000 - 2000 mg",
    desc: "Reduces brain inflammation and supports cell membrane structural integrity.",
    icon: Droplets,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500"
  },
  {
    id: "vitC",
    title: "Vitamin C",
    dosage: "500 - 1000 mg",
    desc: "A powerful antioxidant that protects the brain from oxidative stress.",
    icon: ShieldCheck,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500"
  }
];

export default function VitaminIntakeTracker() {
  const [completed, setCompleted] = useState({});
  const [mounted, setMounted] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("vitamin-intake-today");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === new Date().toDateString()) {
          setCompleted(parsed.completed);
        }
      } catch (e) {
        console.error("Failed to load vitamins", e);
      }
    }
    setMounted(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("vitamin-intake-today", JSON.stringify({
        date: new Date().toDateString(),
        completed
      }));
    }
  }, [completed, mounted]);

  const toggleVitamin = (id) => {
    setCompleted(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const progress = Math.round((Object.values(completed).filter(Boolean).length / VITAMINS.length) * 100);

  if (!mounted) return null;

  return (
    <div className="bg-[var(--background)] min-h-screen text-[var(--foreground)] py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        <header className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10">
            <Pill className="h-8 w-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[var(--foreground)]">
            Vitamin Intake Tracker
          </h1>
          <p className="mt-4 text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Log your daily supplements to ensure your brain gets the essential micronutrients it needs for peak cognitive performance.
          </p>
        </header>

        {/* Progress Bar */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h2 className="font-bold text-[var(--foreground)]">Daily Stack Progress</h2>
              <p className="text-sm text-[var(--muted-foreground)]">Track your core brain vitamins</p>
            </div>
            <span className="text-2xl font-black text-orange-500">{progress}%</span>
          </div>
          <div className="w-full h-4 bg-[var(--section-highlight)] rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-orange-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Vitamin List */}
        <div className="grid gap-4 sm:grid-cols-2">
          {VITAMINS.map(vit => {
            const isDone = completed[vit.id];
            return (
              <button
                key={vit.id}
                onClick={() => toggleVitamin(vit.id)}
                className={`flex flex-col text-left p-5 rounded-2xl border transition-all active:scale-[0.98] ${
                  isDone
                    ? `${vit.bg} ${vit.border}`
                    : "bg-[var(--card)] border-[var(--border)] hover:bg-[var(--section-highlight)]"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className={`flex items-center gap-2 ${isDone ? vit.color : "text-[var(--muted-foreground)]"}`}>
                    <vit.icon className="w-6 h-6" />
                    <span className="font-bold text-lg text-[var(--foreground)]">{vit.title}</span>
                  </div>
                  <div className={isDone ? vit.color : "text-[var(--border)]"}>
                    {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </div>
                </div>

                <div className="mb-2">
                  <span className="inline-block px-2 py-1 rounded bg-[var(--section-highlight)] text-xs font-bold text-[var(--muted-foreground)]">
                    Target: {vit.dosage}
                  </span>
                </div>

                <p className={`text-sm ${isDone ? "text-[var(--foreground)] opacity-80" : "text-[var(--muted-foreground)]"}`}>
                  {vit.desc}
                </p>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
