"use client";

import { useState, useMemo, useEffect } from "react";
import { RotateCcw, Skull, Heart, Zap, Brain, Sword, Shield, Eye } from "lucide-react";

const QUESTIONS = [
  { q: "You see a horde approaching. What's your first move?", options: [
    { text: "Find a weapon and fight", scores: { strength: 3, courage: 3, combat: 3 } },
    { text: "Run and hide", scores: { stealth: 3, agility: 3, survival: 2 } },
    { text: "Climb to high ground", scores: { agility: 3, intelligence: 1, survival: 1 } },
    { text: "Try to communicate", scores: { intelligence: 3, charisma: 3, stealth: -1 } },
  ]},
  { q: "What's your preferred weapon?", options: [
    { text: "Baseball bat", scores: { strength: 2, combat: 2, courage: 1 } },
    { text: "Crossbow (quiet)", scores: { stealth: 3, intelligence: 2, agility: 1 } },
    { text: "Chainsaw (loud)", scores: { strength: 3, courage: 2, combat: 2 } },
    { text: "Crowbar (multi-use)", scores: { intelligence: 2, survival: 3, strength: 1 } },
  ]},
  { q: "How do you travel?", options: [
    { text: "Sturdy truck", scores: { strength: 1, survival: 3, intelligence: 1 } },
    { text: "Quiet bicycle", scores: { stealth: 3, agility: 2, survival: 1 } },
    { text: "On foot (stealthy)", scores: { stealth: 3, agility: 2, survival: 2 } },
    { text: "Sports car (fast)", scores: { agility: 2, courage: 2, stealth: -2 } },
  ]},
  { q: "Your food strategy?", options: [
    { text: "Ration carefully", scores: { intelligence: 3, survival: 3, stealth: 1 } },
    { text: "Forage and hunt", scores: { survival: 3, agility: 2, strength: 1 } },
    { text: "Loot stores", scores: { courage: 2, combat: 1, survival: 1 } },
    { text: "Grow your own", scores: { intelligence: 3, survival: 3, stealth: 1 } },
  ]},
  { q: "How do you handle leadership?", options: [
    { text: "Lead the group", scores: { charisma: 3, courage: 3, intelligence: 1 } },
    { text: "Follow orders", scores: { survival: 2, stealth: 1, agility: 1 } },
    { text: "Go solo", scores: { stealth: 3, survival: 2, combat: 1 } },
    { text: "Co-lead with partner", scores: { charisma: 2, intelligence: 2, survival: 2 } },
  ]},
  { q: "Your fitness level?", options: [
    { text: "Peak athlete", scores: { strength: 3, agility: 3, combat: 2 } },
    { text: "Regular gym-goer", scores: { strength: 2, agility: 2, survival: 1 } },
    { text: "Average (survivable)", scores: { survival: 2, intelligence: 2, stealth: 2 } },
    { text: "Not very fit", scores: { intelligence: 3, charisma: 2, survival: -1 } },
  ]},
  { q: "Medical knowledge?", options: [
    { text: "Trained medic", scores: { intelligence: 3, survival: 3, charisma: 2 } },
    { text: "Basic first aid", scores: { survival: 2, intelligence: 2, stealth: 1 } },
    { text: "Self-taught", scores: { survival: 2, intelligence: 1, courage: 1 } },
    { text: "Will figure it out", scores: { courage: 2, agility: 1, stealth: 1 } },
  ]},
  { q: "Risk-taking attitude?", options: [
    { text: "Calculated risks", scores: { intelligence: 3, courage: 2, survival: 2 } },
    { text: "Full send always", scores: { courage: 3, strength: 2, stealth: -2 } },
    { text: "Extremely cautious", scores: { stealth: 3, survival: 3, agility: -1 } },
    { text: "Depends on situation", scores: { intelligence: 3, charisma: 1, survival: 1 } },
  ]},
  { q: "Camping/survival skills?", options: [
    { text: "Expert outdoorsman", scores: { survival: 3, strength: 2, intelligence: 2 } },
    { text: "Some camping experience", scores: { survival: 2, agility: 1, stealth: 1 } },
    { text: "Glamping only", scores: { intelligence: 1, charisma: 1, survival: -1 } },
    { text: "City survivor", scores: { intelligence: 2, stealth: 2, combat: 1 } },
  ]},
  { q: "If bit by a zombie?", options: [
    { text: "Keep fighting (heroic)", scores: { courage: 3, combat: 2, strength: 1 } },
    { text: "Say goodbye and isolate", scores: { charisma: 3, intelligence: 2, survival: 1 } },
    { text: "Find a cure", scores: { intelligence: 3, survival: 2, stealth: 1 } },
    { text: "Deny it (bad idea)", scores: { courage: 1, stealth: -1, survival: -2 } },
  ]},
];

const RANKS = [
  { min: 80, label: "Zombie Slayer Legend", type: "Apocalypse King/Queen", desc: "You were born for this. Zombies fear you." },
  { min: 65, label: "Survival Expert", type: "The Tactician", desc: "Smart, prepared, and deadly. You'll thrive." },
  { min: 50, label: "Slightly Prepared", type: "The Scavenger", desc: "You'll survive a while but watch your back." },
  { min: 35, label: "Below Average", type: "Early Meal", desc: "Start running. Maybe hide in a basement." },
  { min: 0, label: "Zombie Bait", type: "First to Fall", desc: "You're the reason zombie movies have a body count." },
];

export default function ToolHome() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);

  const progress = Object.keys(answers).length;
  const total = QUESTIONS.length;

  const handleAnswer = (qIndex, optIndex) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
    if (qIndex < total - 1) {
      setStep(qIndex + 1);
    } else {
      setCalculating(true);
      setTimeout(() => {
        const totals = { strength: 0, agility: 0, intelligence: 0, stealth: 0, courage: 0, charisma: 0, combat: 0, survival: 0 };
        Object.entries(answers).forEach(([qIdx, optIdx]) => {
          const q = QUESTIONS[parseInt(qIdx)];
          if (q && q.options[optIdx]) {
            Object.entries(q.options[optIdx].scores).forEach(([key, val]) => {
              totals[key] = (totals[key] || 0) + val;
            });
          }
        });
        Object.entries(answers).forEach(([qIdx, optIdx]) => {
          const qi = parseInt(qIdx);
          const q = QUESTIONS[qi];
          if (q && qi === QUESTIONS.length - 1 && answers[qi] !== undefined) {
            const idx = answers[qi];
            if (q.options[idx]) {
              Object.entries(q.options[idx].scores).forEach(([key, val]) => {
                totals[key] = (totals[key] || 0) + val;
              });
            }
          }
        });
        const score = Math.min(100, Math.max(0,
          (totals.strength * 3 + totals.agility * 2 + totals.intelligence * 3 +
           totals.stealth * 2 + totals.courage * 3 + totals.charisma * 1 +
           totals.combat * 3 + totals.survival * 3) / 1.5
        ));
        const rank = RANKS.find((r) => score >= r.min) || RANKS[RANKS.length - 1];

        const strengths = [];
        if (totals.strength > 5) strengths.push("Raw Power");
        if (totals.agility > 5) strengths.push("Speed & Agility");
        if (totals.intelligence > 5) strengths.push("Smart Thinking");
        if (totals.stealth > 5) strengths.push("Stealth Master");
        if (totals.courage > 5) strengths.push("Brave Heart");
        if (totals.combat > 5) strengths.push("Combat Ready");
        if (totals.survival > 5) strengths.push("Survival Instinct");

        const weaknesses = [];
        if (totals.strength < 3) weaknesses.push("Weak Physique");
        if (totals.intelligence < 3) weaknesses.push("Slow Thinker");
        if (totals.stealth < 3) weaknesses.push("Too Loud");
        if (totals.courage < 3) weaknesses.push("Cowardice");
        if (totals.combat < 3) weaknesses.push("Poor Fighter");
        if (totals.survival < 3) weaknesses.push("Unprepared");

        setResult({
          score: Math.round(score),
          rank,
          strengths: strengths.length > 0 ? strengths : ["Determined"],
          weaknesses: weaknesses.length > 0 ? weaknesses : ["Overconfident"],
          advice: score >= 65
            ? "Keep doing what you're doing. The apocalypse is yours to command."
            : score >= 45
            ? "Hit the gym, learn first aid, and stock up on supplies. You have potential."
            : "Start panicking. No, seriously. Join a group and pray.",
        });
        setCalculating(false);
      }, 2000);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setCalculating(false);
    setResult(null);
  };

  if (calculating) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Zombie Survival Chance Calculator",
              "description": "Calculate your zombie survival chances with this fun personality quiz. Find your survival rank, skills, and apocalypse role in seconds.",
              "applicationCategory": "EntertainmentApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        <div className="text-center max-w-md">
          <Skull size={64} className="mx-auto mb-6 animate-bounce" style={{ color: "var(--primary)" }} />
          <h2 className="text-2xl font-extrabold mb-3" style={{ color: "var(--foreground)" }}>Calculating Survival...</h2>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <div className="h-full rounded-full animate-pulse" style={{ background: "var(--primary)", width: "100%" }} />
          </div>
          <p className="text-sm mt-3" style={{ color: "var(--muted-foreground)" }}>Analyzing your responses...</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Zombie Survival Chance Calculator",
              "description": "Calculate your zombie survival chances with this fun personality quiz. Find your survival rank, skills, and apocalypse role in seconds.",
              "applicationCategory": "EntertainmentApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>Your Results</h1>
          </div>
          <div className="rounded-2xl p-6 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-center mb-4">
              <div className="text-6xl font-extrabold" style={{ color: result.score >= 65 ? "#10B981" : result.score >= 45 ? "#F59E0B" : "#EF4444" }}>
                {result.score}%
              </div>
            </div>
            <h2 className="text-xl font-extrabold text-center mb-1" style={{ color: "var(--foreground)" }}>{result.rank.label}</h2>
            <p className="text-sm text-center mb-4" style={{ color: "var(--primary)" }}>{result.rank.type}</p>
            <p className="text-sm text-center mb-6" style={{ color: "var(--muted-foreground)" }}>{result.rank.desc}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "#10B981" }}>Strengths</p>
                <div className="flex flex-wrap gap-1">
                  {result.strengths.map((s, i) => (
                    <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}>{s}</span>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "#EF4444" }}>Weaknesses</p>
                <div className="flex flex-wrap gap-1">
                  {result.weaknesses.map((w, i) => (
                    <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>{w}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl text-center italic mb-4 border" style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
              {result.advice}
            </div>

            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-primary-foreground transition-all"
              style={{ background: "var(--primary)" }}
            >
              <RotateCcw size={18} /> Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Zombie Survival Chance Calculator",
            "description": "Calculate your zombie survival chances with this fun personality quiz. Find your survival rank, skills, and apocalypse role in seconds.",
            "applicationCategory": "EntertainmentApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
          })
        }}
      />
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>
            Zombie Survival Chance
          </h1>
          <p className="text-lg opacity-80" style={{ color: "var(--muted-foreground)" }}>
            How long would you survive the apocalypse?
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold mb-2" style={{ color: "var(--muted-foreground)" }}>
            <span>Question {progress}/{total}</span>
            <span>{Math.round((progress / total) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(progress / total) * 100}%`, background: "var(--primary)" }} />
          </div>
        </div>

        <div className="rounded-2xl p-6 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <h2 className="text-lg font-bold mb-5" style={{ color: "var(--foreground)" }}>{QUESTIONS[step].q}</h2>
          <div className="space-y-3">
            {QUESTIONS[step].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(step, i)}
                className="w-full text-left p-3.5 rounded-xl border text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: answers[step] === i ? "var(--primary)" : "var(--background)",
                  borderColor: answers[step] === i ? "var(--primary)" : "var(--border)",
                  color: answers[step] === i ? "var(--primary-foreground)" : "var(--foreground)",
                }}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
