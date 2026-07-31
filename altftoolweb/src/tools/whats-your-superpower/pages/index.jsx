"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Sparkles } from "lucide-react";

const QUESTIONS = [
  { q: "A close friend is facing a tough decision and asks for your time. What do you do?", options: [
    { text: "Listen quietly and offer a safe space to talk it through", scores: { superStrength: 0, telepathy: 1, invisibility: 0, flight: 0, timeControl: 0, superSpeed: 0, healing: 2, shapeShift: 0 } },
    { text: "Help them break down the pros and cons logically", scores: { superStrength: 2, telepathy: 0, invisibility: 0, flight: 0, timeControl: 1, superSpeed: 0, healing: 0, shapeShift: 0 } },
    { text: "Take them somewhere new to clear their head", scores: { superStrength: 0, telepathy: 0, invisibility: 0, flight: 2, timeControl: 0, superSpeed: 1, healing: 0, shapeShift: 0 } },
    { text: "Give them space but let them know you are nearby", scores: { superStrength: 0, telepathy: 0, invisibility: 2, flight: 0, timeControl: 0, superSpeed: 0, healing: 0, shapeShift: 1 } },
  ]},
  { q: "When you encounter a difficult problem, what is your typical approach?", options: [
    { text: "Confront it directly with full determination", scores: { superStrength: 2, telepathy: 0, invisibility: 0, flight: 0, timeControl: 0, superSpeed: 1, healing: 0, shapeShift: 0 } },
    { text: "Analyze every angle carefully before taking a step", scores: { superStrength: 0, telepathy: 1, invisibility: 0, flight: 0, timeControl: 2, superSpeed: 0, healing: 0, shapeShift: 0 } },
    { text: "Look for an unconventional creative way through", scores: { superStrength: 0, telepathy: 0, invisibility: 1, flight: 0, timeControl: 0, superSpeed: 0, healing: 0, shapeShift: 2 } },
    { text: "Ask people you trust for their perspectives first", scores: { superStrength: 0, telepathy: 1, invisibility: 0, flight: 0, timeControl: 0, superSpeed: 0, healing: 2, shapeShift: 0 } },
  ]},
  { q: "What kind of setting makes you feel most like yourself?", options: [
    { text: "A vibrant, fast-paced city full of energy and change", scores: { superStrength: 0, telepathy: 0, invisibility: 0, flight: 2, superSpeed: 1, timeControl: 0, healing: 0, shapeShift: 0 } },
    { text: "A peaceful natural spot away from noise and crowds", scores: { superStrength: 0, telepathy: 0, invisibility: 1, flight: 0, timeControl: 0, superSpeed: 0, healing: 2, shapeShift: 0 } },
    { text: "A warm gathering of people you care about", scores: { superStrength: 0, telepathy: 2, invisibility: 0, flight: 0, timeControl: 0, superSpeed: 0, healing: 1, shapeShift: 0 } },
    { text: "A space where you can build, fix, or create something", scores: { superStrength: 1, telepathy: 0, invisibility: 0, flight: 0, timeControl: 2, superSpeed: 0, healing: 0, shapeShift: 0 } },
  ]},
  { q: "When you find yourself in a disagreement, how do you handle it?", options: [
    { text: "Stand your ground firmly and state your case clearly", scores: { superStrength: 2, telepathy: 0, invisibility: 0, flight: 1, timeControl: 0, superSpeed: 0, healing: 0, shapeShift: 0 } },
    { text: "Try to understand where the other person is coming from", scores: { superStrength: 0, telepathy: 2, invisibility: 0, flight: 0, timeControl: 0, superSpeed: 0, healing: 1, shapeShift: 0 } },
    { text: "Step back and reflect before saying anything", scores: { superStrength: 0, telepathy: 0, invisibility: 2, flight: 0, timeControl: 1, superSpeed: 0, healing: 0, shapeShift: 0 } },
    { text: "Adjust your approach to find a middle ground", scores: { superStrength: 0, telepathy: 0, invisibility: 0, flight: 0, timeControl: 0, superSpeed: 1, healing: 0, shapeShift: 2 } },
  ]},
  { q: "Which of these personal qualities do you value most in others?", options: [
    { text: "Inner strength and the courage to keep going", scores: { superStrength: 2, telepathy: 0, invisibility: 0, flight: 0, timeControl: 0, superSpeed: 0, healing: 1, shapeShift: 0 } },
    { text: "The ability to adapt and reinvent themselves", scores: { superStrength: 0, telepathy: 0, invisibility: 0, flight: 1, timeControl: 0, superSpeed: 0, healing: 0, shapeShift: 2 } },
    { text: "Deep empathy and understanding of people", scores: { superStrength: 0, telepathy: 2, invisibility: 0, flight: 0, timeControl: 0, superSpeed: 0, healing: 1, shapeShift: 0 } },
    { text: "Efficiency and the drive to get things done", scores: { superStrength: 0, telepathy: 0, invisibility: 0, flight: 0, timeControl: 1, superSpeed: 2, healing: 0, shapeShift: 0 } },
  ]},
  { q: "Your well-laid plans suddenly fall through. How do you react?", options: [
    { text: "Pivot quickly and find a new direction to explore", scores: { superStrength: 0, telepathy: 0, invisibility: 0, flight: 0, timeControl: 0, superSpeed: 1, healing: 0, shapeShift: 2 } },
    { text: "Pause to assess the new situation before deciding", scores: { superStrength: 0, telepathy: 1, invisibility: 0, flight: 0, timeControl: 2, superSpeed: 0, healing: 0, shapeShift: 0 } },
    { text: "Hold onto what matters most and adjust the rest", scores: { superStrength: 2, telepathy: 0, invisibility: 0, flight: 0, timeControl: 0, superSpeed: 0, healing: 1, shapeShift: 0 } },
    { text: "Step back and watch how things unfold naturally", scores: { superStrength: 0, telepathy: 0, invisibility: 2, flight: 1, timeControl: 0, superSpeed: 0, healing: 0, shapeShift: 0 } },
  ]},
  { q: "Imagine you are choosing a book or a film. Which premise draws you in most?", options: [
    { text: "A daring journey into the unknown", scores: { superStrength: 1, telepathy: 0, invisibility: 0, flight: 2, timeControl: 0, superSpeed: 0, healing: 0, shapeShift: 0 } },
    { text: "A deep story about human connections", scores: { superStrength: 0, telepathy: 2, invisibility: 0, flight: 0, timeControl: 0, superSpeed: 0, healing: 1, shapeShift: 0 } },
    { text: "A clever puzzle that keeps you guessing", scores: { superStrength: 0, telepathy: 0, invisibility: 1, flight: 0, timeControl: 2, superSpeed: 0, healing: 0, shapeShift: 0 } },
    { text: "A fast-paced adventure with quick twists", scores: { superStrength: 0, telepathy: 0, invisibility: 0, flight: 0, timeControl: 0, superSpeed: 2, healing: 0, shapeShift: 1 } },
  ]},
  { q: "What activity leaves you feeling most fulfilled at the end of the day?", options: [
    { text: "Helping someone through a difficult moment", scores: { superStrength: 1, telepathy: 0, invisibility: 0, flight: 0, timeControl: 0, superSpeed: 0, healing: 2, shapeShift: 0 } },
    { text: "Learning something that changed how you see things", scores: { superStrength: 0, telepathy: 0, invisibility: 0, flight: 0, timeControl: 1, superSpeed: 0, healing: 0, shapeShift: 2 } },
    { text: "Having a deep, honest conversation with a friend", scores: { superStrength: 0, telepathy: 2, invisibility: 0, flight: 1, timeControl: 0, superSpeed: 0, healing: 0, shapeShift: 0 } },
    { text: "Enjoying quiet time alone to recharge", scores: { superStrength: 0, telepathy: 0, invisibility: 2, flight: 0, timeControl: 0, superSpeed: 1, healing: 0, shapeShift: 0 } },
  ]},
  { q: "If you could improve one thing about society, what would it be?", options: [
    { text: "More genuine understanding between different people", scores: { superStrength: 0, telepathy: 2, invisibility: 0, flight: 0, timeControl: 0, superSpeed: 0, healing: 1, shapeShift: 0 } },
    { text: "Greater opportunity for everyone to reach their potential", scores: { superStrength: 2, telepathy: 0, invisibility: 0, flight: 1, timeControl: 0, superSpeed: 0, healing: 0, shapeShift: 0 } },
    { text: "A slower pace of life with more room for reflection", scores: { superStrength: 0, telepathy: 0, invisibility: 1, flight: 0, timeControl: 2, superSpeed: 0, healing: 0, shapeShift: 0 } },
    { text: "Faster help reaching people who are in urgent need", scores: { superStrength: 0, telepathy: 0, invisibility: 0, flight: 0, timeControl: 0, superSpeed: 2, healing: 0, shapeShift: 1 } },
  ]},
  { q: "At your core, what motivates your biggest decisions in life?", options: [
    { text: "The desire to protect and care for the people you love", scores: { superStrength: 1, telepathy: 0, invisibility: 0, flight: 0, timeControl: 0, superSpeed: 0, healing: 2, shapeShift: 0 } },
    { text: "The thrill of exploring new frontiers and possibilities", scores: { superStrength: 0, telepathy: 0, invisibility: 0, flight: 2, timeControl: 0, superSpeed: 0, healing: 0, shapeShift: 1 } },
    { text: "The need to understand how people and systems truly work", scores: { superStrength: 0, telepathy: 1, invisibility: 0, flight: 0, timeControl: 2, superSpeed: 0, healing: 0, shapeShift: 0 } },
    { text: "The urge to make an immediate difference right now", scores: { superStrength: 0, telepathy: 0, invisibility: 1, flight: 0, timeControl: 0, superSpeed: 2, healing: 0, shapeShift: 0 } },
  ]},
];

const SUPERPOWERS = {
  superStrength: {
    name: "Super Strength",
    summary: "You have the power of incredible physical might. You face obstacles head-on and never back down from a challenge. Your presence inspires confidence, and people look to you when things get tough.",
    strengths: ["Unwavering determination", "Natural protector instinct", "Inspires confidence in others", "Exceptional resilience"],
    weaknesses: ["Can be overly forceful", "Struggles with subtlety", "Relies on brute force"],
    quote: "True strength is not about never falling, but about rising every time you fall."
  },
  telepathy: {
    name: "Telepathy",
    summary: "You can read minds and communicate with thoughts alone. You have a deep understanding of the people around you and can sense what others are feeling before they say a word.",
    strengths: ["Deep intuitive understanding", "Exceptional empathy", "Natural mediator", "Quick to build trust"],
    weaknesses: ["Overwhelmed by others' emotions", "Struggles with boundaries", "Reads too much into situations"],
    quote: "The deepest truths are not spoken, but felt between two hearts."
  },
  invisibility: {
    name: "Invisibility",
    summary: "You can become unseen at will. You are a keen observer of the world, comfortable working behind the scenes. Your quiet presence lets you notice things others miss entirely.",
    strengths: ["Exceptional observation", "Comfortable working independently", "Strategic patience", "Avoids unnecessary conflict"],
    weaknesses: ["Tendency to isolate", "Can feel overlooked", "Hesitates to step into spotlight"],
    quote: "Not all who wander are lost, and not all who watch are idle."
  },
  flight: {
    name: "Flight",
    summary: "You can soar through the sky with freedom and grace. You have a broad perspective on life and a spirit that refuses to be grounded. You inspire others to dream bigger.",
    strengths: ["Broad perspective", "Free-spirited", "Inspires others", "Courageous explorer"],
    weaknesses: ["Restless with routine", "Avoids commitment", "Overlooks small details"],
    quote: "The sky is not the limit. It is only the beginning."
  },
  timeControl: {
    name: "Time Control",
    summary: "You can manipulate the flow of time. You are a deliberate thinker who values patience and perspective. You learn from the past, act wisely in the present, and plan for the future.",
    strengths: ["Strategic thinking", "Exceptional patience", "Learns from experience", "Natural visionary"],
    weaknesses: ["Prone to overanalysis", "May procrastinate", "Struggles with spontaneity"],
    quote: "Time is the wisest counselor of all."
  },
  superSpeed: {
    name: "Super Speed",
    summary: "You can move faster than the eye can follow. You thrive on momentum and efficiency, turning ideas into action in an instant. Your energy and productivity are contagious.",
    strengths: ["Exceptional productivity", "Quick problem-solving", "Thrives under pressure", "Gets things done fast"],
    weaknesses: ["Risk of burnout", "Misses small details", "Impatient with slower processes"],
    quote: "Speed is nothing without direction, but direction without speed is just a dream."
  },
  healing: {
    name: "Healing Touch",
    summary: "You have the power to heal and restore. You are a natural caregiver who creates safety and warmth wherever you go. Your presence makes the world a little less broken.",
    strengths: ["Natural nurturer", "Creates safe spaces", "Calming presence", "Dedicated to helping others"],
    weaknesses: ["Neglects own needs", "Can be taken advantage of", "Avoids necessary conflict"],
    quote: "The wound is the place where the light enters you."
  },
  shapeShift: {
    name: "Shapeshifting",
    summary: "You can change your form at will. You are endlessly adaptable and creative, comfortable in any role and any situation. Your versatility allows you to connect with anyone.",
    strengths: ["Remarkable adaptability", "Creative problem-solving", "Comfortable in any role", "Thrives on change"],
    weaknesses: ["Struggles with identity", "Seems unpredictable", "Finds routine challenging"],
    quote: "Be water, my friend. Empty your mind. Be formless, shapeless."
  }
};

export default function ToolHome() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const calculatingTimeoutRef = useRef(null);

  const progress = Object.keys(answers).length;
  const total = QUESTIONS.length;

  useEffect(() => {
    return () => {
      if (calculatingTimeoutRef.current) {
        clearTimeout(calculatingTimeoutRef.current);
      }
    };
  }, []);

  const handleAnswer = (qIndex, optIndex) => {
    const updated = { ...answers, [qIndex]: optIndex };
    setAnswers(updated);
    if (qIndex < total - 1) {
      setStep(qIndex + 1);
    } else {
      setCalculating(true);
      calculatingTimeoutRef.current = setTimeout(() => {
        const scores = { superStrength: 0, telepathy: 0, invisibility: 0, flight: 0, timeControl: 0, superSpeed: 0, healing: 0, shapeShift: 0 };
        Object.entries(updated).forEach(([qIdx, optIdx]) => {
          const q = QUESTIONS[parseInt(qIdx)];
          if (q && q.options[optIdx]) {
            Object.entries(q.options[optIdx].scores).forEach(([key, val]) => { scores[key] += val; });
          }
        });
        const topPower = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
        setResult(SUPERPOWERS[topPower]);
        setCalculating(false);
        calculatingTimeoutRef.current = null;
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
        <div className="text-center max-w-md">
          <Sparkles size={64} className="mx-auto mb-6 animate-bounce" style={{ color: "var(--primary)" }} />
          <h2 className="text-2xl font-extrabold mb-3" style={{ color: "var(--foreground)" }}>Discovering Your Superpower...</h2>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <div className="h-full rounded-full animate-pulse" style={{ background: "var(--primary)", width: "100%" }} />
          </div>
          <p className="text-sm mt-3" style={{ color: "var(--muted-foreground)" }}>Analyzing your personality traits...</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>Your Superpower</h1>
          </div>
          <div className="rounded-2xl p-6 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="text-center mb-4">
              <h2 className="text-2xl font-extrabold" style={{ color: "var(--foreground)" }}>{result.name}</h2>
            </div>
            <p className="text-sm text-center mb-5 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{result.summary}</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "var(--success-text)" }}>Strengths</p>
                <div className="flex flex-wrap gap-1">
                  {result.strengths.map((s, i) => (
                    <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--success-soft)", color: "var(--success-text)" }}>{s}</span>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "var(--danger-text)" }}>Weaknesses</p>
                <div className="flex flex-wrap gap-1">
                  {result.weaknesses.map((w, i) => (
                    <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--danger-soft)", color: "var(--danger-text)" }}>{w}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-3 rounded-xl text-center italic mb-4 border" style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
              &ldquo;{result.quote}&rdquo;
            </div>
            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all"
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
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>
              What's Your Superpower?
          </h1>
          <p className="text-lg opacity-80" style={{ color: "var(--muted-foreground)" }}>
            Discover the extraordinary ability within your personality
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold mb-2" style={{ color: "var(--muted-foreground)" }}>
            <span>Question {progress + 1}/{total}</span>
            <span>{Math.round(((progress) / total) * 100)}%</span>
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
