"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Sparkles } from "lucide-react";

const QUESTIONS = [
  {
    q: "How would you prefer to spend a typical weekend?",
    options: [
      { text: "Attending a grand feast with the community", scores: { medieval: 3, renaissance: 0, victorian: 1, roaring20s: 0, future: 0, ancient: 0 } },
      { text: "Sketching nature and studying the world around you", scores: { medieval: 0, renaissance: 3, victorian: 0, roaring20s: 0, future: 0, ancient: 1 } },
      { text: "Reading classic literature by a warm fire", scores: { medieval: 1, renaissance: 0, victorian: 3, roaring20s: 0, future: 0, ancient: 0 } },
      { text: "Exploring the latest digital frontiers", scores: { medieval: 0, renaissance: 0, victorian: 0, roaring20s: 1, future: 3, ancient: 0 } },
    ],
  },
  {
    q: "What quality do you most admire in yourself?",
    options: [
      { text: "Loyalty and a strong moral code", scores: { medieval: 3, renaissance: 0, victorian: 1, roaring20s: 0, future: 0, ancient: 1 } },
      { text: "Creativity and endless curiosity", scores: { medieval: 0, renaissance: 3, victorian: 0, roaring20s: 0, future: 1, ancient: 0 } },
      { text: "Elegance and refined discipline", scores: { medieval: 1, renaissance: 0, victorian: 3, roaring20s: 0, future: 0, ancient: 0 } },
      { text: "Boldness and a progressive spirit", scores: { medieval: 0, renaissance: 0, victorian: 0, roaring20s: 3, future: 1, ancient: 0 } },
    ],
  },
  {
    q: "How would you spend a free afternoon?",
    options: [
      { text: "Training in swordsmanship or archery", scores: { medieval: 3, renaissance: 0, victorian: 0, roaring20s: 0, future: 0, ancient: 1 } },
      { text: "Visiting an art gallery or museum", scores: { medieval: 0, renaissance: 2, victorian: 2, roaring20s: 0, future: 0, ancient: 0 } },
      { text: "Attending a formal tea or social club", scores: { medieval: 0, renaissance: 0, victorian: 3, roaring20s: 1, future: 0, ancient: 0 } },
      { text: "Tinkering with the latest gadgets and prototypes", scores: { medieval: 0, renaissance: 0, victorian: 0, roaring20s: 0, future: 3, ancient: 0 } },
    ],
  },
  {
    q: "What kind of invention excites you most?",
    options: [
      { text: "Grand architecture and fortified structures", scores: { medieval: 3, renaissance: 0, victorian: 1, roaring20s: 0, future: 0, ancient: 1 } },
      { text: "Tools for exploration and discovery", scores: { medieval: 0, renaissance: 2, victorian: 0, roaring20s: 0, future: 1, ancient: 1 } },
      { text: "Machines that improve everyday life", scores: { medieval: 0, renaissance: 0, victorian: 3, roaring20s: 1, future: 0, ancient: 0 } },
      { text: "Breakthroughs that connect and transcend", scores: { medieval: 0, renaissance: 0, victorian: 0, roaring20s: 1, future: 3, ancient: 0 } },
    ],
  },
  {
    q: "What type of social setting suits you best?",
    options: [
      { text: "A close-knit community gathering", scores: { medieval: 3, renaissance: 0, victorian: 1, roaring20s: 0, future: 0, ancient: 0 } },
      { text: "A salon of artists and intellectuals", scores: { medieval: 0, renaissance: 3, victorian: 1, roaring20s: 0, future: 0, ancient: 0 } },
      { text: "A formal dinner with refined company", scores: { medieval: 0, renaissance: 0, victorian: 3, roaring20s: 0, future: 0, ancient: 1 } },
      { text: "A vibrant party with music and dancing", scores: { medieval: 0, renaissance: 0, victorian: 0, roaring20s: 3, future: 1, ancient: 0 } },
    ],
  },
  {
    q: "What is your approach to learning?",
    options: [
      { text: "Apprenticeship through hands-on practice", scores: { medieval: 2, renaissance: 0, victorian: 1, roaring20s: 0, future: 0, ancient: 1 } },
      { text: "Observation and direct experimentation", scores: { medieval: 0, renaissance: 3, victorian: 0, roaring20s: 0, future: 0, ancient: 1 } },
      { text: "Structured study and formal education", scores: { medieval: 0, renaissance: 0, victorian: 3, roaring20s: 0, future: 0, ancient: 0 } },
      { text: "Immersive experiences and bold exploration", scores: { medieval: 0, renaissance: 0, victorian: 0, roaring20s: 2, future: 2, ancient: 0 } },
    ],
  },
  {
    q: "How do you prefer to communicate?",
    options: [
      { text: "Through grand stories and epic tales", scores: { medieval: 2, renaissance: 0, victorian: 0, roaring20s: 0, future: 0, ancient: 2 } },
      { text: "Through art, poetry, and metaphor", scores: { medieval: 0, renaissance: 3, victorian: 1, roaring20s: 0, future: 0, ancient: 0 } },
      { text: "Through proper letters and formal speech", scores: { medieval: 1, renaissance: 0, victorian: 3, roaring20s: 0, future: 0, ancient: 0 } },
      { text: "Through quick wit and lively banter", scores: { medieval: 0, renaissance: 0, victorian: 0, roaring20s: 3, future: 0, ancient: 1 } },
    ],
  },
  {
    q: "What role do you take in a group?",
    options: [
      { text: "The protector who upholds tradition", scores: { medieval: 3, renaissance: 0, victorian: 1, roaring20s: 0, future: 0, ancient: 0 } },
      { text: "The innovator who proposes fresh ideas", scores: { medieval: 0, renaissance: 2, victorian: 0, roaring20s: 0, future: 2, ancient: 0 } },
      { text: "The organizer who keeps things running smoothly", scores: { medieval: 0, renaissance: 0, victorian: 3, roaring20s: 1, future: 0, ancient: 0 } },
      { text: "The entertainer who lifts everyones spirits", scores: { medieval: 0, renaissance: 0, victorian: 0, roaring20s: 3, future: 0, ancient: 1 } },
    ],
  },
  {
    q: "What is your ideal form of entertainment?",
    options: [
      { text: "Epic poetry and live tournaments", scores: { medieval: 3, renaissance: 0, victorian: 0, roaring20s: 0, future: 0, ancient: 1 } },
      { text: "Opera and gallery openings", scores: { medieval: 0, renaissance: 2, victorian: 2, roaring20s: 0, future: 0, ancient: 0 } },
      { text: "Theater performances and literary readings", scores: { medieval: 0, renaissance: 1, victorian: 2, roaring20s: 0, future: 0, ancient: 1 } },
      { text: "Virtual reality and interactive simulations", scores: { medieval: 0, renaissance: 0, victorian: 0, roaring20s: 1, future: 3, ancient: 0 } },
    ],
  },
  {
    q: "What matters most to you in life?",
    options: [
      { text: "Honor, duty, and community", scores: { medieval: 3, renaissance: 0, victorian: 1, roaring20s: 0, future: 0, ancient: 1 } },
      { text: "Knowledge, beauty, and self-expression", scores: { medieval: 0, renaissance: 3, victorian: 1, roaring20s: 0, future: 0, ancient: 0 } },
      { text: "Progress, order, and moral refinement", scores: { medieval: 1, renaissance: 0, victorian: 3, roaring20s: 0, future: 0, ancient: 0 } },
      { text: "Freedom, joy, and living in the moment", scores: { medieval: 0, renaissance: 0, victorian: 0, roaring20s: 3, future: 1, ancient: 0 } },
    ],
  },
];

const PERIODS = {
  medieval: {
    name: "Medieval Age",
    era: "500-1500 AD",
    summary: "You are chivalrous, traditional, and deeply rooted in community. Honor and loyalty guide every decision you make, and you believe in standing for what is right, no matter the cost.",
    traits: ["Chivalrous", "Traditional", "Community-focused", "Honorable"],
    inventions: ["Castle", "Printing Press", "Mechanical Clock"],
    quote: "Courage is not the absence of fear, but the triumph over it.",
  },
  renaissance: {
    name: "Renaissance",
    era: "1300-1700",
    summary: "You are creative, endlessly curious, and a true humanist at heart. Art and science are two sides of the same coin in your world, and you believe in the boundless potential of the human mind.",
    traits: ["Creative", "Curious", "Humanist", "Innovative"],
    inventions: ["Telescope", "Microscope", "Flushing Toilet"],
    quote: "The noblest pleasure is the joy of understanding.",
  },
  victorian: {
    name: "Victorian Era",
    era: "1837-1901",
    summary: "You are refined, industrious, and have a strong sense of propriety. Elegance and progress walk hand in hand with you, and you believe that discipline is the cornerstone of achievement.",
    traits: ["Refined", "Industrious", "Proper", "Determined"],
    inventions: ["Telephone", "Light Bulb", "Automobile"],
    quote: "Invention is the mother of necessity.",
  },
  roaring20s: {
    name: "Roaring Twenties",
    era: "1920-1929",
    summary: "You are bold, full of rhythm, and unapologetically progressive. Life is a celebration and you are at its center, dancing to the beat of your own drum and breaking every rule with style.",
    traits: ["Bold", "Jazz-loving", "Progressive", "Adventurous"],
    inventions: ["Television", "Penicillin", "Radio Broadcasting"],
    quote: "The future is a dance, and I intend to lead.",
  },
  future: {
    name: "Future Age",
    era: "2100+",
    summary: "You are a visionary, a tech-savvy explorer of tomorrow. Boundaries are merely challenges waiting to be solved, and you dream of a world where imagination becomes reality.",
    traits: ["Visionary", "Tech-savvy", "Exploratory", "Forward-thinking"],
    inventions: ["Warp Drive", "AI", "Teleportation"],
    quote: "The best way to predict the future is to invent it.",
  },
  ancient: {
    name: "Ancient World",
    era: "before 500 AD",
    summary: "You are philosophical, foundational, and deeply mystical. Wisdom is your compass and curiosity your map, guiding you to uncover the timeless truths that shape human existence.",
    traits: ["Philosophical", "Foundational", "Mystical", "Wise"],
    inventions: ["Writing", "Wheel", "Aqueduct"],
    quote: "Know thyself, and you shall know the universe.",
  },
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
        const scores = { medieval: 0, renaissance: 0, victorian: 0, roaring20s: 0, future: 0, ancient: 0 };
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
        const topPeriod = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
        setResult(PERIODS[topPeriod]);
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
              "name": "Which Time Period Do You Belong In?",
              "description": "Take our historical personality quiz to discover which time period matches your values and lifestyle. Find your era from medieval to future.",
              "applicationCategory": "QuizApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        <div className="text-center max-w-md">
          <Sparkles size={64} className="mx-auto mb-6 animate-bounce" style={{ color: "var(--primary)" }} />
          <h2 className="text-2xl font-extrabold mb-3" style={{ color: "var(--foreground)" }}>Discovering Your Era...</h2>
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
              "name": "Which Time Period Do You Belong In?",
              "description": "Take our historical personality quiz to discover which time period matches your values and lifestyle. Find your era from medieval to future.",
              "applicationCategory": "QuizApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>Your Time Period</h1>
          </div>
          <div className="rounded-2xl p-6 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="text-center mb-4">
              <h2 className="text-2xl font-extrabold" style={{ color: "var(--foreground)" }}>{result.name}</h2>
              <p className="text-sm font-bold mt-1" style={{ color: "var(--primary)" }}>{result.era}</p>
            </div>

            <p className="text-sm text-center mb-5 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{result.summary}</p>

            <div className="p-3 rounded-xl mb-4" style={{ background: "var(--background)" }}>
              <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Traits</p>
              <div className="flex flex-wrap gap-1">
                {result.traits.map((t, i) => (
                  <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>{t}</span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl mb-4" style={{ background: "var(--background)" }}>
              <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Key Inventions</p>
              <ul className="space-y-1">
                {result.inventions.map((inv, i) => (
                  <li key={i} className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{inv}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl text-center italic mb-4 border" style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
              &ldquo;{result.quote}&rdquo;
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
            "name": "Which Time Period Do You Belong In?",
            "description": "Take our historical personality quiz to discover which time period matches your values and lifestyle. Find your era from medieval to future.",
            "applicationCategory": "QuizApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
          })
        }}
      />
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>
            Which Time Period Do You Belong In?
          </h1>
          <p className="text-lg opacity-80" style={{ color: "var(--muted-foreground)" }}>
            Discover the era that matches your personality
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
