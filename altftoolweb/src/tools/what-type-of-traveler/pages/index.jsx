"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Sparkles } from "lucide-react";

const QUESTIONS = [
  { q: "What excites you most about visiting a new place?", options: [
    { text: "Thrilling activities like bungee jumping or whitewater rafting", scores: { adventurer: 3, relaxer: 0, explorer: 1, social: 0, cultural: 0, planner: 0 } },
    { text: "Unwinding at a peaceful beach or spa", scores: { adventurer: 0, relaxer: 3, explorer: 0, social: 0, cultural: 0, planner: 1 } },
    { text: "Wandering through local neighborhoods and finding hidden gems", scores: { adventurer: 1, relaxer: 0, explorer: 3, social: 0, cultural: 1, planner: 0 } },
    { text: "Visiting famous museums and historical landmarks", scores: { adventurer: 0, relaxer: 0, explorer: 1, social: 0, cultural: 3, planner: 1 } },
  ]},
  { q: "How do you usually plan your trips?", options: [
    { text: "I book a flight and figure it out when I arrive", scores: { adventurer: 3, relaxer: 0, explorer: 1, social: 1, cultural: 0, planner: 0 } },
    { text: "I research a few nice hotels and restaurants, keep it loose", scores: { adventurer: 0, relaxer: 2, explorer: 1, social: 1, cultural: 0, planner: 1 } },
    { text: "I ask locals for recommendations once I am there", scores: { adventurer: 1, relaxer: 0, explorer: 3, social: 1, cultural: 1, planner: 0 } },
    { text: "I create a detailed spreadsheet with hourly itineraries", scores: { adventurer: 0, relaxer: 0, explorer: 1, social: 0, cultural: 1, planner: 3 } },
  ]},
  { q: "What type of accommodation do you prefer?", options: [
    { text: "A rustic cabin in the mountains or a camping tent", scores: { adventurer: 3, relaxer: 0, explorer: 2, social: 0, cultural: 0, planner: 0 } },
    { text: "A luxury resort with a pool and full-service spa", scores: { adventurer: 0, relaxer: 3, explorer: 0, social: 1, cultural: 0, planner: 1 } },
    { text: "A boutique hostel or guesthouse full of other travelers", scores: { adventurer: 1, relaxer: 0, explorer: 2, social: 3, cultural: 0, planner: 0 } },
    { text: "A centrally located hotel within walking distance of top sights", scores: { adventurer: 0, relaxer: 1, explorer: 1, social: 0, cultural: 2, planner: 2 } },
  ]},
  { q: "What does your ideal travel day look like?", options: [
    { text: "Hiking a volcano at dawn, then cliff jumping into a crater lake", scores: { adventurer: 3, relaxer: 0, explorer: 2, social: 0, cultural: 0, planner: 0 } },
    { text: "Sleeping in, a slow brunch, then lounging by the pool", scores: { adventurer: 0, relaxer: 3, explorer: 0, social: 0, cultural: 0, planner: 1 } },
    { text: "Exploring a local market, taking a cooking class, then meeting fellow travelers for dinner", scores: { adventurer: 0, relaxer: 0, explorer: 2, social: 2, cultural: 1, planner: 0 } },
    { text: "Following a guided tour of historic sites, then a scheduled dinner at a famous restaurant", scores: { adventurer: 0, relaxer: 1, explorer: 0, social: 1, cultural: 2, planner: 2 } },
  ]},
  { q: "What is usually in your suitcase?", options: [
    { text: "Hiking boots, a wetsuit, and the bare essentials", scores: { adventurer: 3, relaxer: 0, explorer: 1, social: 0, cultural: 0, planner: 0 } },
    { text: "Swimsuits, flip-flops, and a good book", scores: { adventurer: 0, relaxer: 3, explorer: 0, social: 0, cultural: 0, planner: 0 } },
    { text: "Comfortable walking shoes, a camera, and a journal", scores: { adventurer: 0, relaxer: 0, explorer: 3, social: 0, cultural: 1, planner: 0 } },
    { text: "A capsule wardrobe with everything pre-planned and color-coordinated", scores: { adventurer: 0, relaxer: 0, explorer: 0, social: 1, cultural: 0, planner: 3 } },
  ]},
  { q: "How do you research a destination before going?", options: [
    { text: "I look up extreme sports and off-the-beaten-path adventures", scores: { adventurer: 3, relaxer: 0, explorer: 1, social: 0, cultural: 0, planner: 1 } },
    { text: "I search for the best spas, beaches, and relaxation spots", scores: { adventurer: 0, relaxer: 3, explorer: 0, social: 0, cultural: 0, planner: 1 } },
    { text: "I read blogs from locals and look for hidden gems", scores: { adventurer: 1, relaxer: 0, explorer: 3, social: 0, cultural: 1, planner: 0 } },
    { text: "I check museum schedules, book tours, and map out every day", scores: { adventurer: 0, relaxer: 0, explorer: 0, social: 0, cultural: 2, planner: 3 } },
  ]},
  { q: "Who is your ideal travel companion?", options: [
    { text: "Someone adventurous who will try anything once", scores: { adventurer: 3, relaxer: 0, explorer: 1, social: 1, cultural: 0, planner: 0 } },
    { text: "Someone who enjoys quiet evenings and relaxing activities", scores: { adventurer: 0, relaxer: 3, explorer: 0, social: 0, cultural: 0, planner: 0 } },
    { text: "An open-minded friend who loves spontaneous exploration", scores: { adventurer: 1, relaxer: 0, explorer: 3, social: 1, cultural: 1, planner: 0 } },
    { text: "A well-organized partner who has everything planned out", scores: { adventurer: 0, relaxer: 1, explorer: 0, social: 0, cultural: 0, planner: 3 } },
  ]},
  { q: "How do you handle unexpected changes during a trip?", options: [
    { text: "I embrace the chaos and see where it leads", scores: { adventurer: 3, relaxer: 0, explorer: 2, social: 1, cultural: 0, planner: 0 } },
    { text: "I find the nearest comfortable spot and wait it out", scores: { adventurer: 0, relaxer: 3, explorer: 0, social: 0, cultural: 0, planner: 1 } },
    { text: "I chat with locals to find an alternative plan", scores: { adventurer: 0, relaxer: 0, explorer: 3, social: 1, cultural: 1, planner: 0 } },
    { text: "I consult my backup itineraries and rearrange the schedule", scores: { adventurer: 0, relaxer: 0, explorer: 0, social: 0, cultural: 0, planner: 3 } },
  ]},
  { q: "What kind of souvenir do you usually bring home?", options: [
    { text: "A scar from an adventure or a photo of an epic view", scores: { adventurer: 3, relaxer: 0, explorer: 1, social: 0, cultural: 0, planner: 0 } },
    { text: "A scented candle or a jar of local honey", scores: { adventurer: 0, relaxer: 2, explorer: 1, social: 0, cultural: 1, planner: 0 } },
    { text: "Handmade crafts or art from a local artisan", scores: { adventurer: 0, relaxer: 0, explorer: 2, social: 0, cultural: 3, planner: 0 } },
    { text: "A guidebook or museum catalogue", scores: { adventurer: 0, relaxer: 0, explorer: 0, social: 0, cultural: 2, planner: 2 } },
  ]},
  { q: "If you could only do one thing in a new city, what would it be?", options: [
    { text: "Find the most extreme adventure experience available", scores: { adventurer: 3, relaxer: 0, explorer: 1, social: 0, cultural: 0, planner: 0 } },
    { text: "Sit at a cafe and watch the world go by", scores: { adventurer: 0, relaxer: 3, explorer: 1, social: 0, cultural: 0, planner: 0 } },
    { text: "Walk every street in the old town without a map", scores: { adventurer: 1, relaxer: 0, explorer: 3, social: 0, cultural: 1, planner: 0 } },
    { text: "Visit the most important museum or historical monument", scores: { adventurer: 0, relaxer: 0, explorer: 0, social: 0, cultural: 3, planner: 1 } },
  ]},
];

const TYPES = {
  adventurer: {
    name: "The Adventurer",
    summary: "You live for adrenaline and the thrill of the unknown. Rules are meant to be bent, paths are meant to be lost, and every destination is a playground for something wild. You do not just visit a place — you conquer it.",
    traits: ["Fearless", "Spontaneous", "Resilient", "Thrill-seeking"],
    destinations: ["Queenstown, New Zealand", "Costa Rica", "Patagonia, Chile", "Moab, Utah"],
    quote: "The mountains are calling and I must go."
  },
  relaxer: {
    name: "The Relaxer",
    summary: "You travel to recharge, not to check boxes. For you, the perfect vacation involves soft sand, slow sunsets, and absolutely nothing on the schedule. You understand that true luxury is doing nothing at all.",
    traits: ["Calm", "Mindful", "Luxury-loving", "Peaceful"],
    destinations: ["Maldives", "Bali, Indonesia", "Santorini, Greece", "Tulum, Mexico"],
    quote: "Take only memories, leave only footprints."
  },
  explorer: {
    name: "The Explorer",
    summary: "You are driven by curiosity and a love for authentic experiences. You wander off the tourist trail, eat where the locals eat, and collect stories instead of souvenirs. The world is a classroom, and you are a lifelong student.",
    traits: ["Curious", "Open-minded", "Adaptable", "Observant"],
    destinations: ["Kyoto, Japan", "Morocco", "Oaxaca, Mexico", "Reykjavik, Iceland"],
    quote: "Not all those who wander are lost."
  },
  social: {
    name: "The Socialite",
    summary: "You travel for the people, the parties, and the pulse of the night. Whether it is a rooftop bar in Bangkok or a beach party in Rio, you thrive on connection, music, and shared experiences. The world is your social circle.",
    traits: ["Charismatic", "Energetic", "Outgoing", "Fun-loving"],
    destinations: ["Ibiza, Spain", "Rio de Janeiro, Brazil", "Bangkok, Thailand", "Las Vegas, Nevada"],
    quote: "Life is a party, dress like it."
  },
  cultural: {
    name: "The Culturalist",
    summary: "You travel to understand the past and appreciate the present. Museums, cathedrals, ruins, and galleries are your temples. Every artifact tells a story, and you are here to listen. You respect tradition and seek wisdom through travel.",
    traits: ["Thoughtful", "Knowledgeable", "Appreciative", "Respectful"],
    destinations: ["Rome, Italy", "Cairo, Egypt", "Paris, France", "Beijing, China"],
    quote: "Travel is the only thing you buy that makes you richer."
  },
  planner: {
    name: "The Planner",
    summary: "You believe that a well-organized trip is a successful trip. Your itineraries are works of art, your bookings are confirmed months in advance, and your spreadsheets are color-coded. You leave nothing to chance, and that is exactly how you like it.",
    traits: ["Organized", "Thorough", "Reliable", "Efficient"],
    destinations: ["Tokyo, Japan", "Switzerland", "London, UK", "Singapore"],
    quote: "Fail to plan, plan to fail."
  },
};

export default function ToolHome() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);

  const progress = Object.keys(answers).length;
  const total = QUESTIONS.length;

  const selectAnswer = (qIndex, optIndex) => {
    const updated = { ...answers, [qIndex]: optIndex };
    setAnswers(updated);
    if (qIndex < total - 1) {
      setStep(qIndex + 1);
    } else {
      setCalculating(true);
      setTimeout(() => {
        const scores = { adventurer: 0, relaxer: 0, explorer: 0, social: 0, cultural: 0, planner: 0 };
        Object.entries(updated).forEach(([qIdx, optIdx]) => {
          const q = QUESTIONS[parseInt(qIdx)];
          if (q && q.options[optIdx]) {
            Object.entries(q.options[optIdx].scores).forEach(([key, val]) => {
              scores[key] += val;
            });
          }
        });
        const topType = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
        setResult(TYPES[topType]);
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
              "name": "What Type of Traveler Are You?",
              "description": "Answer 10 questions to discover your travel personality type. Find out if you are an adventurer, relaxer, explorer, or social traveler.",
              "applicationCategory": "QuizApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        <div className="text-center max-w-md">
          <Sparkles size={56} className="mx-auto mb-6 animate-bounce" style={{ color: "var(--primary)" }} />
          <h2 className="text-2xl font-extrabold mb-3" style={{ color: "var(--foreground)" }}>Discovering Your Travel Style...</h2>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <div className="h-full rounded-full animate-pulse" style={{ background: "var(--primary)", width: "100%" }} />
          </div>
          <p className="text-sm mt-3" style={{ color: "var(--muted-foreground)" }}>Analyzing your preferences and habits...</p>
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
              "name": "What Type of Traveler Are You?",
              "description": "Answer 10 questions to discover your travel personality type. Find out if you are an adventurer, relaxer, explorer, or social traveler.",
              "applicationCategory": "QuizApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>Your Travel Persona</h1>
          </div>
          <div className="rounded-2xl p-6 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="text-center mb-4">
              <h2 className="text-2xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>{result.name}</h2>
            </div>
            <p className="text-sm text-center mb-6 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{result.summary}</p>
            <div className="p-4 rounded-xl mb-4" style={{ background: "var(--background)" }}>
              <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Traits</p>
              <div className="flex flex-wrap gap-1.5">
                {result.traits.map((trait, i) => (
                  <span key={i} className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: "var(--primary)", color: "#fff" }}>{trait}</span>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-xl mb-4" style={{ background: "var(--background)" }}>
              <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Top Destinations</p>
              <ul className="space-y-1">
                {result.destinations.map((d, i) => (
                  <li key={i} className="text-sm font-medium" style={{ color: "var(--foreground)" }}>&bull; {d}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-xl text-center italic mb-6 border" style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
              &ldquo;{result.quote}&rdquo;
            </div>
            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
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
              "name": "What Type of Traveler Are You?",
              "description": "Answer 10 questions to discover your travel personality type. Find out if you are an adventurer, relaxer, explorer, or social traveler.",
              "applicationCategory": "QuizApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>
              What Type of Traveler Are You?
          </h1>
          <p className="text-lg opacity-80" style={{ color: "var(--muted-foreground)" }}>
            Discover your travel personality
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
                onClick={() => selectAnswer(step, i)}
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
