"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Sparkles, PawPrint } from "lucide-react";

const QUESTIONS = [
  { q: "How do you spend your weekend?", options: [
    { text: "Outdoors in nature", scores: { wolf: 2, fox: 0, owl: 0, cat: 0, dolphin: 2, tiger: 0, elephant: 2, octopus: 0, raven: 0, panda: 1 } },
    { text: "Cozy at home", scores: { wolf: 0, fox: 0, owl: 1, cat: 3, dolphin: 0, tiger: 0, elephant: 0, octopus: 1, raven: 1, panda: 2 } },
    { text: "Socializing with friends", scores: { wolf: 1, fox: 2, owl: 0, cat: 0, dolphin: 3, tiger: 0, elephant: 2, octopus: 0, raven: 0, panda: 0 } },
    { text: "Learning something new", scores: { wolf: 0, fox: 1, owl: 3, cat: 0, dolphin: 0, tiger: 0, elephant: 0, octopus: 2, raven: 2, panda: 0 } },
  ]},
  { q: "What's your ideal social setting?", options: [
    { text: "Small close-knit group", scores: { wolf: 3, fox: 1, owl: 1, cat: 1, dolphin: 2, tiger: 1, elephant: 2, octopus: 0, raven: 1, panda: 1 } },
    { text: "Large party", scores: { wolf: 1, fox: 2, owl: 0, cat: 0, dolphin: 3, tiger: 0, elephant: 2, octopus: 0, raven: 0, panda: 0 } },
    { text: "Alone time", scores: { wolf: 0, fox: 1, owl: 3, cat: 3, dolphin: 0, tiger: 1, elephant: 0, octopus: 2, raven: 2, panda: 2 } },
    { text: "One-on-one deep talk", scores: { wolf: 1, fox: 2, owl: 2, cat: 1, dolphin: 1, tiger: 0, elephant: 1, octopus: 1, raven: 0, panda: 0 } },
  ]},
  { q: "How do you solve problems?", options: [
    { text: "Head-on aggressively", scores: { wolf: 2, fox: 0, owl: 0, cat: 0, dolphin: 0, tiger: 3, elephant: 0, octopus: 0, raven: 0, panda: 0 } },
    { text: "Strategically and cleverly", scores: { wolf: 1, fox: 3, owl: 2, cat: 1, dolphin: 0, tiger: 1, elephant: 0, octopus: 2, raven: 2, panda: 0 } },
    { text: "Patiently and calmly", scores: { wolf: 0, fox: 0, owl: 1, cat: 2, dolphin: 1, tiger: 0, elephant: 3, octopus: 0, raven: 0, panda: 3 } },
    { text: "Creatively and adaptively", scores: { wolf: 0, fox: 1, owl: 1, cat: 0, dolphin: 1, tiger: 0, elephant: 0, octopus: 3, raven: 1, panda: 0 } },
  ]},
  { q: "Pick a superpower:", options: [
    { text: "Super strength", scores: { wolf: 2, fox: 0, owl: 0, cat: 0, dolphin: 0, tiger: 3, elephant: 3, octopus: 0, raven: 0, panda: 0 } },
    { text: "Invisibility", scores: { wolf: 1, fox: 2, owl: 1, cat: 3, dolphin: 0, tiger: 0, elephant: 0, octopus: 1, raven: 1, panda: 0 } },
    { text: "Flight", scores: { wolf: 0, fox: 0, owl: 3, cat: 0, dolphin: 0, tiger: 0, elephant: 0, octopus: 0, raven: 3, panda: 0 } },
    { text: "Telepathy", scores: { wolf: 1, fox: 1, owl: 2, cat: 1, dolphin: 3, tiger: 0, elephant: 1, octopus: 2, raven: 0, panda: 0 } },
  ]},
  { q: "Your ideal environment:", options: [
    { text: "Forest or mountains", scores: { wolf: 3, fox: 2, owl: 2, cat: 0, dolphin: 0, tiger: 1, elephant: 1, octopus: 0, raven: 1, panda: 2 } },
    { text: "Ocean or beach", scores: { wolf: 0, fox: 0, owl: 0, cat: 0, dolphin: 3, tiger: 0, elephant: 0, octopus: 1, raven: 0, panda: 0 } },
    { text: "City or town", scores: { wolf: 0, fox: 2, owl: 0, cat: 1, dolphin: 0, tiger: 0, elephant: 0, octopus: 0, raven: 2, panda: 0 } },
    { text: "Jungle or exotic", scores: { wolf: 0, fox: 0, owl: 0, cat: 0, dolphin: 0, tiger: 3, elephant: 2, octopus: 3, raven: 0, panda: 1 } },
  ]},
  { q: "What do friends value in you?", options: [
    { text: "Loyalty and protection", scores: { wolf: 3, fox: 0, owl: 0, cat: 0, dolphin: 1, tiger: 1, elephant: 2, octopus: 0, raven: 0, panda: 0 } },
    { text: "Wit and charm", scores: { wolf: 0, fox: 3, owl: 1, cat: 1, dolphin: 2, tiger: 0, elephant: 0, octopus: 1, raven: 1, panda: 0 } },
    { text: "Wisdom and advice", scores: { wolf: 0, fox: 0, owl: 3, cat: 0, dolphin: 0, tiger: 0, elephant: 1, octopus: 1, raven: 1, panda: 0 } },
    { text: "Calm and comfort", scores: { wolf: 0, fox: 0, owl: 0, cat: 2, dolphin: 0, tiger: 0, elephant: 2, octopus: 0, raven: 0, panda: 3 } },
  ]},
  { q: "Your communication style:", options: [
    { text: "Direct and honest", scores: { wolf: 3, fox: 1, owl: 1, cat: 0, dolphin: 1, tiger: 2, elephant: 1, octopus: 0, raven: 1, panda: 0 } },
    { text: "Playful and teasing", scores: { wolf: 0, fox: 3, owl: 0, cat: 2, dolphin: 2, tiger: 0, elephant: 0, octopus: 1, raven: 1, panda: 0 } },
    { text: "Quiet and observant", scores: { wolf: 0, fox: 0, owl: 3, cat: 2, dolphin: 0, tiger: 0, elephant: 0, octopus: 2, raven: 2, panda: 1 } },
    { text: "Encouraging and warm", scores: { wolf: 0, fox: 0, owl: 0, cat: 0, dolphin: 1, tiger: 0, elephant: 3, octopus: 0, raven: 0, panda: 2 } },
  ]},
  { q: "How do you handle stress?", options: [
    { text: "Face it head-on", scores: { wolf: 2, fox: 0, owl: 0, cat: 0, dolphin: 0, tiger: 3, elephant: 1, octopus: 0, raven: 0, panda: 0 } },
    { text: "Adapt and find a way out", scores: { wolf: 1, fox: 3, owl: 1, cat: 1, dolphin: 1, tiger: 0, elephant: 0, octopus: 2, raven: 1, panda: 0 } },
    { text: "Meditate and stay calm", scores: { wolf: 0, fox: 0, owl: 2, cat: 2, dolphin: 1, tiger: 0, elephant: 3, octopus: 0, raven: 0, panda: 2 } },
    { text: "Sleep it off", scores: { wolf: 0, fox: 0, owl: 0, cat: 1, dolphin: 0, tiger: 0, elephant: 0, octopus: 0, raven: 0, panda: 3 } },
  ]},
  { q: "Your hidden talent:", options: [
    { text: "Tracking and hunting", scores: { wolf: 3, fox: 1, owl: 0, cat: 1, dolphin: 0, tiger: 2, elephant: 0, octopus: 0, raven: 0, panda: 0 } },
    { text: "Memory and recall", scores: { wolf: 0, fox: 1, owl: 3, cat: 1, dolphin: 0, tiger: 0, elephant: 2, octopus: 1, raven: 2, panda: 0 } },
    { text: "Creative problem-solving", scores: { wolf: 0, fox: 2, owl: 1, cat: 0, dolphin: 1, tiger: 0, elephant: 0, octopus: 3, raven: 1, panda: 0 } },
    { text: "Making people laugh", scores: { wolf: 0, fox: 1, owl: 0, cat: 0, dolphin: 2, tiger: 0, elephant: 1, octopus: 0, raven: 0, panda: 1 } },
  ]},
  { q: "What do you value most?", options: [
    { text: "Freedom and independence", scores: { wolf: 3, fox: 2, owl: 1, cat: 2, dolphin: 2, tiger: 2, elephant: 0, octopus: 1, raven: 2, panda: 0 } },
    { text: "Knowledge and wisdom", scores: { wolf: 0, fox: 1, owl: 3, cat: 0, dolphin: 0, tiger: 0, elephant: 0, octopus: 1, raven: 1, panda: 0 } },
    { text: "Family and community", scores: { wolf: 1, fox: 0, owl: 0, cat: 0, dolphin: 1, tiger: 0, elephant: 3, octopus: 0, raven: 0, panda: 1 } },
    { text: "Comfort and peace", scores: { wolf: 0, fox: 0, owl: 0, cat: 2, dolphin: 0, tiger: 0, elephant: 1, octopus: 0, raven: 0, panda: 3 } },
  ]},
];

const ANIMALS = {
  wolf: { name: "Wolf", icon: "🐺", summary: "Loyal, brave, and fiercely independent. You lead with strength and protect your pack.", strengths: ["Loyalty", "Bravery", "Leadership", "Instinct"], weaknesses: ["Can be too serious", "Stubborn", "Loner tendencies"], facts: ["Wolves mate for life", "A wolf can run 50km in a night", "Wolf howls can be heard 10km away"], compatibility: ["Dolphin", "Elephant", "Fox"], quote: "The wolf that leads is not always the strongest, but the most determined." },
  fox: { name: "Fox", icon: "🦊", summary: "Clever, adaptable, and quick-witted. You navigate life with charm and intelligence.", strengths: ["Intelligence", "Adaptability", "Charm", "Cunning"], weaknesses: ["Can be manipulative", "Trust issues", "Too playful"], facts: ["Foxes can hear a watch ticking 40m away", "A group of foxes is called a skulk", "Foxes use the Earth's magnetic field to hunt"], compatibility: ["Raven", "Octopus", "Cat"], quote: "The clever fox never enters a trap. Unless there's cheese." },
  owl: { name: "Owl", icon: "🦉", summary: "Wise, observant, and deeply thoughtful. You see what others miss.", strengths: ["Wisdom", "Observation", "Patience", "Knowledge"], weaknesses: ["Overthinking", "Socially distant", "Hard to read"], facts: ["Owls can rotate their heads 270°", "Some owls have fake eyes on the back of their head", "Owls are silent in flight"], compatibility: ["Raven", "Elephant", "Octopus"], quote: "The owl of wisdom flies only in the darkness of solitude." },
  cat: { name: "Cat", icon: "🐱", summary: "Independent, graceful, and mysterious. You value your space and your peace.", strengths: ["Independence", "Grace", "Intuition", "Resilience"], weaknesses: ["Aloof", "Stubborn", "Moody"], facts: ["Cats sleep 70% of their lives", "A cat can jump 6x its body length", "Cats have 32 muscles in each ear"], compatibility: ["Fox", "Owl", "Panda"], quote: "A cat walks alone, but leaves paw prints on every heart." },
  dolphin: { name: "Dolphin", icon: "🐬", summary: "Playful, social, and deeply empathetic. You bring joy and connection wherever you go.", strengths: ["Social", "Empathy", "Playfulness", "Teamwork"], weaknesses: ["Overly trusting", "Restless", "Easily bored"], facts: ["Dolphins sleep with one eye open", "Each dolphin has a unique signature whistle", "Dolphins can recognize themselves in mirrors"], compatibility: ["Wolf", "Elephant", "Fox"], quote: "The ocean is wide, but a dolphin's heart is wider." },
  tiger: { name: "Tiger", icon: "🐯", summary: "Bold, powerful, and unstoppable when focused. You command respect.", strengths: ["Courage", "Strength", "Determination", "Confidence"], weaknesses: ["Impulsive", "Impatient", "Can be intimidating"], facts: ["Tiger stripes are unique like fingerprints", "Tigers can swim 6km", "A tiger's roar can be heard 3km away"], compatibility: ["Wolf", "Elephant", "Raven"], quote: "The tiger does not announce its arrival. It simply arrives." },
  elephant: { name: "Elephant", icon: "🐘", summary: "Gentle, wise, and deeply caring. You are the heart of every community.", strengths: ["Wisdom", "Compassion", "Patience", "Strength"], weaknesses: ["Too forgiving", "Slow to change", "Carries burdens"], facts: ["Elephants are the only mammals that can't jump", "They have the longest pregnancy of any animal (22 months)", "Elephants can 'hear' with their feet"], compatibility: ["Dolphin", "Wolf", "Owl"], quote: "An elephant never forgets — especially those it loves." },
  octopus: { name: "Octopus", icon: "🐙", summary: "Creative, mysterious, and incredibly adaptable. You thrive in complexity.", strengths: ["Intelligence", "Adaptability", "Creativity", "Problem-solving"], weaknesses: ["Secretive", "Overly complex", "Easily stressed"], facts: ["Octopuses have three hearts", "Their blood is blue", "They can change color and texture in milliseconds"], compatibility: ["Fox", "Owl", "Raven"], quote: "In the deep, the octopus dreams of stars." },
  raven: { name: "Raven", icon: "🐦‍⬛", summary: "Intelligent, enigmatic, and visionary. You see the bigger picture.", strengths: ["Intelligence", "Vision", "Communication", "Innovation"], weaknesses: ["Mysterious", "Can be mischievous", "Restless"], facts: ["Ravens can mimic human speech", "They solve complex puzzles", "Ravens remember faces for years"], compatibility: ["Fox", "Owl", "Octopus"], quote: "The raven does not fear the dark — it carries it." },
  panda: { name: "Panda", icon: "🐼", summary: "Gentle, easygoing, and secretly strong. You find joy in simple pleasures.", strengths: ["Patience", "Gentleness", "Resilience", "Joyfulness"], weaknesses: ["Too laid-back", "Avoids conflict", "Lazy streaks"], facts: ["Pandas spend 12 hours a day eating", "Baby pandas are born pink and blind", "Pandas can climb trees at 6 months old"], compatibility: ["Cat", "Elephant", "Dolphin"], quote: "Slow down. Eat bamboo. Be happy." },
};

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
        const scores = { wolf: 0, fox: 0, owl: 0, cat: 0, dolphin: 0, tiger: 0, elephant: 0, octopus: 0, raven: 0, panda: 0 };
        Object.entries(answers).forEach(([qIdx, optIdx]) => {
          const q = QUESTIONS[parseInt(qIdx)];
          if (q && q.options[optIdx]) {
            Object.entries(q.options[optIdx].scores).forEach(([key, val]) => { scores[key] += val; });
          }
        });
        const lastQ = QUESTIONS[total - 1];
        const lastOpt = answers[total - 1];
        if (lastQ && lastQ.options[lastOpt]) {
          Object.entries(lastQ.options[lastOpt].scores).forEach(([key, val]) => { scores[key] += val; });
        }
        const topAnimal = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
        setResult(ANIMALS[topAnimal]);
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
              "name": "Which Animal Are You? - Spirit Animal Quiz",
              "description": "Discover which animal matches your personality with this fun quiz. Find your spirit animal based on your traits and instincts instantly.",
              "applicationCategory": "QuizApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        <div className="text-center max-w-md">
          <Sparkles size={64} className="mx-auto mb-6 animate-bounce" style={{ color: "var(--primary)" }} />
          <h2 className="text-2xl font-extrabold mb-3" style={{ color: "var(--foreground)" }}>Finding Your Animal...</h2>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <div className="h-full rounded-full animate-pulse" style={{ background: "var(--primary)", width: "100%" }} />
          </div>
          <p className="text-sm mt-3" style={{ color: "var(--muted-foreground)" }}>Analyzing your personality...</p>
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
              "name": "Which Animal Are You? - Spirit Animal Quiz",
              "description": "Discover which animal matches your personality with this fun quiz. Find your spirit animal based on your traits and instincts instantly.",
              "applicationCategory": "QuizApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>Your Spirit Animal</h1>
          </div>
          <div className="rounded-2xl p-6 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="text-center mb-4">
              <span className="text-7xl block mb-2">{result.icon}</span>
              <h2 className="text-2xl font-extrabold" style={{ color: "var(--foreground)" }}>{result.name}</h2>
            </div>

            <p className="text-sm text-center mb-5 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{result.summary}</p>

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

            <div className="p-3 rounded-xl mb-4" style={{ background: "var(--background)" }}>
              <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Fun Facts</p>
              <ul className="space-y-1">
                {result.facts.map((f, i) => (
                  <li key={i} className="text-xs font-medium" style={{ color: "var(--foreground)" }}>• {f}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-1 mb-4 justify-center">
              {result.compatibility.map((c, i) => (
                <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "var(--primary)", color: "#fff" }}>
                  Compatible: {c}
                </span>
              ))}
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Which Animal Are You? - Spirit Animal Quiz",
            "description": "Discover which animal matches your personality with this fun quiz. Find your spirit animal based on your traits and instincts instantly.",
            "applicationCategory": "QuizApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
          })
        }}
      />
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>
            Which Animal Are You?
          </h1>
          <p className="text-lg opacity-80" style={{ color: "var(--muted-foreground)" }}>
            Discover your spirit animal
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
                  color: answers[step] === i ? "#fff" : "var(--foreground)",
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
