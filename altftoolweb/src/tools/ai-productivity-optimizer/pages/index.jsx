"use client";

import { useState } from "react";
import { Zap, Brain, Clock, ShieldAlert, Cpu, CheckCircle2, Loader2, ArrowRight, RotateCcw } from "lucide-react";

export default function AIProductivityOptimizer() {
  const [step, setStep] = useState("form"); // "form", "analyzing", "result"
  const [formData, setFormData] = useState({
    role: "Developer",
    distractor: "Multitasking / Context Switching",
    energy: "Morning (Early Bird)",
    goal: "Focus longer on deep work"
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generatePlan = () => {
    setStep("analyzing");

    // Simulate AI Processing
    setTimeout(() => {
      let technique = "Pomodoro Technique (25m/5m)";
      let tools = ["ChatGPT for ideation", "Notion AI for organization"];
      let schedule = "Standard 9-5 Block";

      if (formData.energy.startsWith("Morning")) {
        schedule = "Eat the Frog: Tackle the hardest task at 8 AM. Deep work until 11 AM.";
        technique = "90-Minute Focus Blocks (Ultradian Rhythms)";
      } else if (formData.energy.startsWith("Night")) {
        schedule = "Admin work in the morning. Deep creative work post 8 PM.";
        technique = "Time Blocking + Flow State";
      }

      if (formData.distractor.startsWith("Social Media")) {
        tools.push("Freedom / Cold Turkey blocker");
        technique = "Identity-based Habit Framing (I am not a scroller)";
      } else if (formData.distractor.startsWith("Emails")) {
        tools.push("Superhuman / AI Email Triage");
        technique = "Batch Processing (Check inboxes only at 12 PM and 4 PM)";
      }

      if (formData.role === "Developer") tools.push("GitHub Copilot / Cursor IDE");
      if (formData.role === "Designer") tools.push("Midjourney / Figma AI");
      if (formData.role.startsWith("Writer")) tools.push("Claude / Grammarly");

      setResult({ technique, tools, schedule, profile: `The ${formData.energy} ${formData.role} Optimizer` });
      setStep("result");
    }, 2000);
  };

  return (
    <div className="bg-[var(--background)] min-h-screen text-[var(--foreground)] py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        <header className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/10">
            <Zap className="h-8 w-8 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[var(--foreground)]">
            AI Productivity Optimizer
          </h1>
          <p className="mt-4 text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Analyze your workflow, energy levels, and distractors to get a personalized, AI-driven productivity stack.
          </p>
        </header>

        {step === "form" && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="space-y-6">

              <div className="space-y-2">
                <label className="flex items-center gap-2 font-bold text-[var(--foreground)] mb-1">
                  <Brain className="w-5 h-5 text-purple-500" /> Primary Role
                </label>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-[var(--section-highlight)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--primary)] transition-colors">
                  <option>Developer</option>
                  <option>Designer</option>
                  <option>Writer / Creator</option>
                  <option>Manager / Executive</option>
                  <option>Student</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 font-bold text-[var(--foreground)] mb-1">
                  <ShieldAlert className="w-5 h-5 text-rose-500" /> Biggest Distractor
                </label>
                <select name="distractor" value={formData.distractor} onChange={handleChange} className="w-full bg-[var(--section-highlight)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--primary)] transition-colors">
                  <option>Multitasking / Context Switching</option>
                  <option>Social Media / Phones</option>
                  <option>Emails / Slack Messages</option>
                  <option>Perfectionism / Overthinking</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 font-bold text-[var(--foreground)] mb-1">
                  <Clock className="w-5 h-5 text-blue-500" /> Peak Energy Time
                </label>
                <select name="energy" value={formData.energy} onChange={handleChange} className="w-full bg-[var(--section-highlight)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--primary)] transition-colors">
                  <option>Morning (Early Bird)</option>
                  <option>Afternoon (Mid-day Sprinter)</option>
                  <option>Night (Night Owl)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 font-bold text-[var(--foreground)] mb-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Primary Goal
                </label>
                <select name="goal" value={formData.goal} onChange={handleChange} className="w-full bg-[var(--section-highlight)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--primary)] transition-colors">
                  <option>Focus longer on deep work</option>
                  <option>Organize tasks and reduce chaos</option>
                  <option>Automate busywork and save time</option>
                  <option>Stop procrastinating</option>
                </select>
              </div>

            </div>

            <button onClick={generatePlan} className="btn-primary w-full mt-8 py-4 rounded-xl text-lg font-bold flex justify-center items-center gap-2">
              Generate AI Stack <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === "analyzing" && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-16 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-[var(--foreground)]">Synthesizing Workflow...</h2>
            <p className="mt-2 text-[var(--muted-foreground)]">Analyzing your chronotype and identifying optimal AI tools.</p>
          </div>
        )}

        {step === "result" && result && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">

            <div className="bg-gradient-to-br from-[var(--primary)] to-purple-600 rounded-3xl p-8 text-white shadow-lg text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-10">
                <Cpu className="w-64 h-64" />
              </div>
              <h2 className="text-3xl font-black mb-2 relative z-10">{result.profile}</h2>
              <p className="text-white/80 relative z-10">Your bespoke productivity architecture has been generated.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-[var(--foreground)]">
                  <Brain className="w-5 h-5 text-purple-500" /> Core Methodology
                </h3>
                <p className="text-[var(--primary)] font-extrabold text-xl mb-2">{result.technique}</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Based on your distraction profile ({formData.distractor.toLowerCase()}), this framework forces constraints that will naturally align with your brain's reward system.
                </p>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-[var(--foreground)]">
                  <Clock className="w-5 h-5 text-blue-500" /> Optimal Schedule
                </h3>
                <p className="text-blue-500 font-extrabold text-xl mb-2">{result.schedule}</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Leveraging your {formData.energy.toLowerCase()} peak energy state to map high-cognitive load tasks to your biological prime time.
                </p>
              </div>
            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-[var(--foreground)]">
                <Zap className="w-5 h-5 text-yellow-500" /> AI Tool Stack
              </h3>
              <ul className="space-y-3">
                {result.tools.map((tool, idx) => (
                  <li key={idx} className="flex items-center gap-3 p-3 bg-[var(--section-highlight)] rounded-xl font-semibold text-[var(--foreground)]">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    {tool}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center mt-8">
              <button onClick={() => setStep("form")} className="btn-secondary px-8 py-3 rounded-xl inline-flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Start Over
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
