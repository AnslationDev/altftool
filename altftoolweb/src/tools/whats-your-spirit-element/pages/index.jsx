"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Sparkles } from "lucide-react";

const QUESTIONS = [
  {
    id: 1,
    question: "When a thunderstorm rolls in, how do you react?",
    options: [
      { text: "I feel energized and alive, like the sky is putting on a show", scores: { fire: 2, water: 0, earth: 0, air: 0, aether: 1, lightning: 0 } },
      { text: "I curl up somewhere cozy and let the rain soothe me", scores: { fire: 0, water: 2, earth: 1, air: 0, aether: 0, lightning: 0 } },
      { text: "I watch in awe, feeling a deep connection to nature's power", scores: { fire: 0, water: 0, earth: 1, air: 0, aether: 0, lightning: 2 } },
      { text: "I sense the shift in the air and feel a strange calm", scores: { fire: 0, water: 0, earth: 0, air: 2, aether: 1, lightning: 0 } }
    ]
  },
  {
    id: 2,
    question: "What kind of weather makes you feel most alive?",
    options: [
      { text: "Hot, blazing sun that pushes me into action", scores: { fire: 3, water: 0, earth: 0, air: 0, aether: 0, lightning: 0 } },
      { text: "A gentle rain that makes everything feel fresh and new", scores: { fire: 0, water: 2, earth: 1, air: 0, aether: 0, lightning: 0 } },
      { text: "A crisp, clear day where the air feels electric", scores: { fire: 0, water: 0, earth: 0, air: 1, aether: 1, lightning: 1 } },
      { text: "Misty, foggy mornings that feel mysterious and still", scores: { fire: 0, water: 0, earth: 1, air: 0, aether: 2, lightning: 0 } }
    ]
  },
  {
    id: 3,
    question: "When you are emotionally overwhelmed, what helps the most?",
    options: [
      { text: "Pushing through with action and burning off the energy", scores: { fire: 2, water: 0, earth: 0, air: 0, aether: 0, lightning: 1 } },
      { text: "Letting it flow out through tears or conversation", scores: { fire: 0, water: 3, earth: 0, air: 0, aether: 0, lightning: 0 } },
      { text: "Grounding myself with routine or being in nature", scores: { fire: 0, water: 0, earth: 2, air: 0, aether: 1, lightning: 0 } },
      { text: "Stepping back to think things through logically", scores: { fire: 0, water: 0, earth: 0, air: 2, aether: 0, lightning: 1 } }
    ]
  },
  {
    id: 4,
    question: "How would your closest friends describe your natural energy?",
    options: [
      { text: "Intense and passionate -- I light up a room", scores: { fire: 3, water: 0, earth: 0, air: 0, aether: 0, lightning: 0 } },
      { text: "Calm and nurturing -- I make people feel safe", scores: { fire: 0, water: 1, earth: 2, air: 0, aether: 0, lightning: 0 } },
      { text: "Quick and witty -- I keep conversations exciting", scores: { fire: 0, water: 0, earth: 0, air: 2, aether: 0, lightning: 1 } },
      { text: "Deep and reflective -- I notice what others miss", scores: { fire: 0, water: 0, earth: 0, air: 0, aether: 3, lightning: 0 } }
    ]
  },
  {
    id: 5,
    question: "What draws you to a person most strongly?",
    options: [
      { text: "Their passion and drive to chase big dreams", scores: { fire: 2, water: 0, earth: 0, air: 0, aether: 0, lightning: 1 } },
      { text: "Their emotional depth and ability to be vulnerable", scores: { fire: 0, water: 2, earth: 0, air: 0, aether: 1, lightning: 0 } },
      { text: "Their groundedness and how present they feel", scores: { fire: 0, water: 0, earth: 2, air: 0, aether: 0, lightning: 1 } },
      { text: "Their curiosity and the ideas they share", scores: { fire: 0, water: 0, earth: 0, air: 2, aether: 1, lightning: 0 } }
    ]
  },
  {
    id: 6,
    question: "In a conflict, what is your natural response?",
    options: [
      { text: "I confront it head on with fierce honesty", scores: { fire: 2, water: 0, earth: 0, air: 0, aether: 0, lightning: 1 } },
      { text: "I seek harmony and try to understand everyone's feelings", scores: { fire: 0, water: 2, earth: 0, air: 0, aether: 1, lightning: 0 } },
      { text: "I stay steady and work toward a practical solution", scores: { fire: 0, water: 0, earth: 2, air: 1, aether: 0, lightning: 0 } },
      { text: "I analyze the situation and find the logical middle ground", scores: { fire: 0, water: 0, earth: 0, air: 2, aether: 0, lightning: 1 } }
    ]
  },
  {
    id: 7,
    question: "What is your ideal way to spend a free afternoon?",
    options: [
      { text: "Tackling an ambitious project or trying something bold", scores: { fire: 2, water: 0, earth: 0, air: 0, aether: 0, lightning: 1 } },
      { text: "Sinking into a good book or a long, deep conversation", scores: { fire: 0, water: 1, earth: 0, air: 1, aether: 1, lightning: 0 } },
      { text: "Gardening, hiking, or doing something hands-on outdoors", scores: { fire: 0, water: 0, earth: 2, air: 0, aether: 1, lightning: 0 } },
      { text: "Exploring a new idea, writing, or learning something new", scores: { fire: 0, water: 0, earth: 0, air: 2, aether: 0, lightning: 1 } }
    ]
  },
  {
    id: 8,
    question: "When facing a big change in life, you tend to...",
    options: [
      { text: "Charge forward with determination and courage", scores: { fire: 2, water: 0, earth: 0, air: 0, aether: 0, lightning: 1 } },
      { text: "Let yourself feel everything and adapt as you go", scores: { fire: 0, water: 2, earth: 0, air: 0, aether: 1, lightning: 0 } },
      { text: "Take it slow, staying rooted in what you can control", scores: { fire: 0, water: 0, earth: 2, air: 0, aether: 0, lightning: 1 } },
      { text: "Analyze all possibilities and make a plan", scores: { fire: 0, water: 0, earth: 0, air: 2, aether: 0, lightning: 1 } }
    ]
  },
  {
    id: 9,
    question: "Which of these best describes your inner world?",
    options: [
      { text: "A blazing fire that fuels everything I do", scores: { fire: 3, water: 0, earth: 0, air: 0, aether: 0, lightning: 0 } },
      { text: "A deep ocean of emotion and intuition", scores: { fire: 0, water: 2, earth: 0, air: 0, aether: 1, lightning: 0 } },
      { text: "A steady mountain that stands through any storm", scores: { fire: 0, water: 0, earth: 3, air: 0, aether: 0, lightning: 0 } },
      { text: "An open sky full of thoughts and possibilities", scores: { fire: 0, water: 0, earth: 0, air: 2, aether: 1, lightning: 0 } }
    ]
  },
  {
    id: 10,
    question: "What role do you naturally play in a group?",
    options: [
      { text: "The spark that gets everyone excited and moving", scores: { fire: 2, water: 0, earth: 0, air: 0, aether: 0, lightning: 1 } },
      { text: "The glue that keeps everyone connected and heard", scores: { fire: 0, water: 2, earth: 1, air: 0, aether: 0, lightning: 0 } },
      { text: "The anchor that keeps the group grounded and focused", scores: { fire: 0, water: 0, earth: 2, air: 0, aether: 1, lightning: 0 } },
      { text: "The visionary who brings fresh ideas and perspective", scores: { fire: 0, water: 0, earth: 0, air: 1, aether: 0, lightning: 2 } }
    ]
  }
];

const ELEMENTS = {
  fire: {
    name: "Fire",
    summary: "You are a force of passion and transformation. Your inner fire drives you to pursue your goals with relentless energy and courage. You inspire others with your boldness and remind everyone that change begins with a single, courageous spark. Like fire itself, you are a catalyst — burning away the old to make room for the new.",
    traits: ["Passionate", "Courageous", "Energetic", "Transformative", "Inspiring"],
    season: "Summer",
    color: "#F97316",
    quote: "The same fire that melts butter hardens steel."
  },
  water: {
    name: "Water",
    summary: "You are a deep well of emotion and intuition. Your strength lies in your adaptability — you can flow around any obstacle and find your way home. You feel deeply and connect with others on a soulful level, creating bonds that are as powerful as the tide. Like water, you are patient, persistent, and quietly unstoppable.",
    traits: ["Intuitive", "Emotional", "Adaptable", "Compassionate", "Deep"],
    season: "Winter",
    color: "#0EA5E9",
    quote: "Be water, my friend."
  },
  earth: {
    name: "Earth",
    summary: "You are the steady foundation that others rely on. Grounded and nurturing, you bring stability to every situation and help those around you feel safe and supported. Your patience and resilience are unmatched — like the earth itself, you endure through every season and continue to give life to everything around you.",
    traits: ["Grounded", "Nurturing", "Stable", "Patient", "Resilient"],
    season: "Autumn",
    color: "#65A30D",
    quote: "The earth laughs in flowers."
  },
  air: {
    name: "Air",
    summary: "You are a free spirit driven by curiosity and intellect. Your mind is always exploring new ideas, connecting dots that others miss, and finding creative solutions to complex problems. You bring clarity and perspective to every conversation, lifting others up with your fresh insights and boundless optimism.",
    traits: ["Intellectual", "Communicative", "Free", "Curious", "Clear"],
    season: "Spring",
    color: "#D4D4D8",
    quote: "The air up there in the clouds is very pure and fine."
  },
  aether: {
    name: "Aether",
    summary: "You exist between worlds — deeply spiritual and profoundly wise. You sense the unseen threads that connect all things and have a natural ability to see the bigger picture. Your presence brings a sense of peace and transcendence to those around you. You are the space where the ordinary meets the extraordinary.",
    traits: ["Spiritual", "Transcendent", "Wise", "Mystical", "Peaceful"],
    season: "Between Seasons",
    color: "#A855F7",
    quote: "The soul is the aether that connects all life."
  },
  lightning: {
    name: "Lightning",
    summary: "You are a bolt of pure inspiration — sudden, brilliant, and unforgettable. Your mind moves at the speed of light, generating ideas and insights that strike like thunder. You thrive in moments of chaos and change, bringing electric energy and bold vision to everything you touch. The world may not always see you coming, but they always feel your impact.",
    traits: ["Dynamic", "Inspired", "Abrupt", "Electric", "Visionary"],
    season: "Storm Season",
    color: "#EAB308",
    quote: "Lightning often strikes the tallest object."
  }
};

function computeScores(answers) {
  const scores = { fire: 0, water: 0, earth: 0, air: 0, aether: 0, lightning: 0 };
  answers.forEach((answerIndex, questionIndex) => {
    if (answerIndex === undefined || answerIndex === null) return;
    const optionScores = QUESTIONS[questionIndex].options[answerIndex].scores;
    for (const key of Object.keys(scores)) {
      scores[key] += optionScores[key] || 0;
    }
  });
  return scores;
}

function findTopElement(scores) {
  let maxElement = null;
  let maxScore = -1;
  for (const [key, value] of Object.entries(scores)) {
    if (value > maxScore) {
      maxScore = value;
      maxElement = key;
    }
  }
  return maxElement;
}

export default function ToolHome() {
  const [step, setStep] = useState("start");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);

  const totalQuestions = QUESTIONS.length;

  const handleStart = () => {
    setStep("quiz");
    setCurrentQ(0);
    setAnswers(new Array(totalQuestions).fill(null));
    setCalculating(false);
    setResult(null);
  };

  const handleSelectOption = (optionIndex) => {
    const nextAnswers = [...answers];
    nextAnswers[currentQ] = optionIndex;
    setAnswers(nextAnswers);

    if (currentQ < totalQuestions - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setStep("calculating");
      setCalculating(true);
      setTimeout(() => {
        const scores = computeScores(nextAnswers);
        const topElement = findTopElement(scores);
        setResult({ scores, topElement });
        setCalculating(false);
        setStep("result");
      }, 2000);
    }
  };

  const handleRetake = () => {
    setStep("start");
    setCurrentQ(0);
    setAnswers([]);
    setCalculating(false);
    setResult(null);
  };

  const progressPercent = step === "quiz"
    ? ((currentQ + 1) / totalQuestions) * 100
    : 0;

  const answeredCount = answers.filter(function (a) { return a !== null && a !== undefined; }).length;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "What's Your Spirit Element?",
            "description": "Take our elemental personality quiz to discover which classical element matches your spirit. Find your element and its meaning.",
            "applicationCategory": "QuizApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
          })
        }}
      />
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-primary/10 rounded-2xl border border-primary/20 mb-1">
            <Sparkles className="text-primary" size={32} />
          </div>
          <h1 className="heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            What&apos;s Your Spirit Element?
          </h1>
          <p className="description text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Discover which classical element resonates with your soul by exploring how you connect with the world around you.
          </p>
        </div>

        {/* Core Card */}
        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8">

          {/* Start Screen */}
          {step === "start" && (
            <div className="flex flex-col items-center text-center space-y-6 py-8">
              <div className="inline-flex p-4 bg-primary/10 rounded-full">
                <Sparkles className="text-primary" size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">
                  Find your spirit element
                </h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  Answer 10 questions about your emotions, energy, and instincts to
                  discover the element that lives within you.
                </p>
              </div>
              <button
                onClick={handleStart}
                className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100 shadow flex items-center gap-2"
                type="button"
              >
                <Sparkles size={16} />
                Start the Quiz
              </button>
            </div>
          )}

          {/* Quiz Screen */}
          {step === "quiz" && (
            <div className="space-y-6">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-muted-foreground">
                  <span>YOUR PROGRESS</span>
                  <span>{answeredCount} of {totalQuestions} answered</span>
                </div>
                <div className="w-full h-2 bg-surface-soft rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: progressPercent + "%" }}
                    role="progressbar"
                    aria-valuenow={answeredCount}
                    aria-valuemin={0}
                    aria-valuemax={totalQuestions}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    Question {currentQ + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground leading-snug">
                  {QUESTIONS[currentQ].question}
                </h3>
                <div className="grid gap-3" role="radiogroup" aria-label={QUESTIONS[currentQ].question}>
                  {QUESTIONS[currentQ].options.map(function (opt, idx) {
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full text-left p-4 rounded-xl border text-sm font-medium cursor-pointer transition active:scale-[0.99] duration-100 ${
                          answers[currentQ] === idx
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border bg-background text-foreground hover:border-primary hover:bg-primary/5"
                        }`}
                        type="button"
                        role="radio"
                        aria-checked={answers[currentQ] === idx}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nav buttons */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                  disabled={currentQ === 0}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold hover:text-foreground cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed"
                  type="button"
                  aria-label="Previous question"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                  Previous
                </button>
                <span className="text-xs text-muted-foreground">
                  {currentQ + 1} / {totalQuestions}
                </span>
                <div />
              </div>
            </div>
          )}

          {/* Calculating Screen */}
          {step === "calculating" && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-surface-soft border-t-primary rounded-full animate-spin" role="status" aria-label="Calculating your result" />
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg text-foreground animate-pulse">
                  Reading your elemental energy...
                </h4>
                <p className="text-sm text-muted-foreground">
                  Mapping your responses to the six classical elements.
                </p>
              </div>
            </div>
          )}

          {/* Result Screen */}
          {step === "result" && result && (
            <div className="space-y-8">
              {/* Result Header */}
              <div className="text-center space-y-4">
                <div className="inline-flex p-3 bg-primary/10 rounded-full">
                  <Sparkles className="text-primary" size={28} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">
                    Your spirit element is
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                    {ELEMENTS[result.topElement].name}
                  </h2>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-surface-soft rounded-2xl p-5 border border-border">
                <p className="text-sm text-foreground leading-relaxed">
                  {ELEMENTS[result.topElement].summary}
                </p>
              </div>

              {/* Traits */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Your elemental traits
                </h3>
                <div className="flex flex-wrap gap-2">
                  {ELEMENTS[result.topElement].traits.map(function (trait, idx) {
                    return (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
                      >
                        {trait}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Season & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-background p-4 space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Season
                  </span>
                  <p className="text-base font-bold text-foreground">
                    {ELEMENTS[result.topElement].season}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4 space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Element Color
                  </span>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full border border-border"
                      style={{ backgroundColor: ELEMENTS[result.topElement].color }}
                      aria-hidden="true"
                    />
                    <p className="text-base font-bold text-foreground">
                      {ELEMENTS[result.topElement].color}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div className="relative rounded-2xl border border-border bg-surface-soft p-5 text-center">
                <svg
                  className="absolute top-3 left-3 text-primary/20"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                </svg>
                <p className="text-sm italic text-foreground leading-relaxed px-4">
                  &ldquo;{ELEMENTS[result.topElement].quote}&rdquo;
                </p>
              </div>

              {/* Score breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Element score breakdown
                </h3>
                <div className="space-y-2">
                  {Object.entries(ELEMENTS).map(function ([key, element]) {
                    const score = result.scores[key];
                    const maxScore = 30;
                    const pct = Math.min(100, Math.round((score / maxScore) * 100));
                    const isTop = key === result.topElement;
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className={`font-semibold ${isTop ? "text-primary" : "text-foreground"}`}>
                            {element.name}
                          </span>
                          <span className="text-muted-foreground">{score} pts</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-soft rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${
                              isTop ? "bg-primary" : "bg-border"
                            }`}
                            style={{ width: pct + "%" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Retake */}
              <button
                onClick={handleRetake}
                className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100 shadow flex items-center justify-center gap-2"
                type="button"
              >
                <RotateCcw size={16} />
                Retake the Quiz
              </button>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="bg-card border border-border rounded-2xl p-5 flex gap-4 items-start shadow-sm">
          <Sparkles className="text-primary flex-shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              How it works
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your answers are scored across six elemental dimensions. The element with the
              highest total is revealed as your spirit element. No data is stored or sent
              anywhere -- everything stays on your device. For entertainment purposes only.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
