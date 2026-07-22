"use client";

import React, { useState } from "react";
import { Monitor, CheckCircle, XCircle, RefreshCw, Award } from "lucide-react";

const QUESTIONS = [
  { q: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Process Unit", "Core Processing Unit"], answer: 0 },
  { q: "What is the primary function of a GPU?", options: ["Manage memory", "Render graphics", "Store data", "Connect to the internet"], answer: 1 },
  { q: "What type of memory is volatile and loses data when power is off?", options: ["ROM", "SSD", "RAM", "HDD"], answer: 2 },
  { q: "Which component is considered the 'brain' of the computer?", options: ["GPU", "RAM", "CPU", "Motherboard"], answer: 2 },
  { q: "What does SSD stand for?", options: ["Super Speed Drive", "Solid State Drive", "System Storage Device", "Secure Data Drive"], answer: 1 },
  { q: "Which port is commonly used to connect a keyboard and mouse?", options: ["HDMI", "USB", "Ethernet", "VGA"], answer: 1 },
  { q: "What does PSU stand for?", options: ["Power Supply Unit", "Primary System Unit", "Processor Support Unit", "Power System Utility"], answer: 0 },
  { q: "What is the main circuit board of a computer called?", options: ["Processor Board", "Motherboard", "Mainframe", "System Board"], answer: 1 },
  { q: "Which component stores data permanently even when the computer is off?", options: ["RAM", "CPU", "Hard Drive", "Power Supply"], answer: 2 },
  { q: "What is the function of thermal paste on a CPU?", options: ["Clean the CPU", "Improve heat transfer", "Connect pins", "Prevent dust"], answer: 1 },
  { q: "What does HDMI stand for?", options: ["High-Definition Multimedia Interface", "High-Density Memory Interface", "High-Digital Media Input", "High-Definition Memory Input"], answer: 0 },
  { q: "Which type of cooling uses a fan and heatsink?", options: ["Liquid cooling", "Passive cooling", "Air cooling", "Thermal cooling"], answer: 2 },
  { q: "What does BIOS stand for?", options: ["Basic Integrated Operating System", "Basic Input/Output System", "Binary Input Operating System", "Boot Initialization Operating System"], answer: 1 },
  { q: "Which form factor is most common for desktop motherboards?", options: ["Mini-ITX", "ATX", "Micro-ATX", "E-ATX"], answer: 1 },
  { q: "What is the purpose of the chipset on a motherboard?", options: ["Manage data flow between components", "Store passwords", "Control the fan speed", "Provide internet connectivity"], answer: 0 },
];

export default function ToolHome() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [finished, setFinished] = useState(false);

  const answer = (idx) => {
    if (answered !== null) return;
    setAnswered(idx);
    if (idx === QUESTIONS[current].answer) setScore(score + 1);
  };

  const next = () => {
    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1);
      setAnswered(null);
    } else {
      setFinished(true);
    }
  };

  const reset = () => {
    setCurrent(0);
    setScore(0);
    setAnswered(null);
    setFinished(false);
  };

  const q = QUESTIONS[current];

  if (finished) {
    const pct = Math.round((score / QUESTIONS.length) * 100);
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-center space-y-6">
            <Award size={64} className="mx-auto text-primary" />
            <h2 className="text-2xl font-black text-foreground">Quiz Complete!</h2>
            <div className="text-5xl font-black text-primary">{score}/{QUESTIONS.length}</div>
            <div className="text-lg text-muted-foreground">{pct}% Correct</div>
            <div className="w-full bg-surface-soft rounded-full h-4 border border-border overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
            <button onClick={reset} className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 flex items-center gap-2 mx-auto">
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors">
              <Monitor className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-none">Computer Parts Quiz</h1>
              <p className="text-xs text-muted-foreground mt-1">Test your hardware knowledge.</p>
            </div>
          </div>
        </section>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Question {current + 1} of {QUESTIONS.length}</span>
            <span className="text-xs font-bold text-primary">Score: {score}</span>
          </div>
          <div className="w-full bg-surface-soft rounded-full h-1.5">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }} />
          </div>

          <h2 className="text-lg font-bold text-foreground">{q.q}</h2>

          <div className="space-y-2">
            {q.options.map((opt, idx) => {
              let cls = "bg-surface-soft border-border text-foreground hover:border-primary";
              if (answered !== null) {
                if (idx === q.answer) cls = "bg-green-500/10 border-green-500 text-green-500";
                else if (idx === answered && idx !== q.answer) cls = "bg-red-500/10 border-red-500 text-red-500";
                else cls = "bg-surface-soft border-border text-muted-foreground opacity-60";
              }
              return (
                <button
                  key={idx}
                  onClick={() => answer(idx)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 text-sm font-medium transition flex items-center gap-3 ${cls}`}
                  disabled={answered !== null}
                >
                  {answered !== null && idx === q.answer && <CheckCircle size={18} className="text-green-500 shrink-0" />}
                  {answered !== null && idx === answered && idx !== q.answer && <XCircle size={18} className="text-red-500 shrink-0" />}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {answered !== null && (
            <button
              onClick={next}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90"
            >
              {current < QUESTIONS.length - 1 ? "Next Question →" : "See Results"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
