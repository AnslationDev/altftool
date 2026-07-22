"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Sparkles } from "lucide-react";

const QUESTIONS = [
  {
    id: 1,
    question: "As a child, what captured your imagination the most?",
    options: [
      { text: "Drawing, painting, or building with my hands", scores: { art: 2, music: 0, writing: 0, leadership: 0, empathy: 0, invention: 1 } },
      { text: "Singing, dancing, or playing an instrument", scores: { art: 0, music: 3, writing: 0, leadership: 0, empathy: 0, invention: 0 } },
      { text: "Reading books or making up stories", scores: { art: 0, music: 0, writing: 3, leadership: 0, empathy: 0, invention: 0 } },
      { text: "Organizing games and leading my friends", scores: { art: 0, music: 0, writing: 0, leadership: 2, empathy: 1, invention: 0 } }
    ]
  },
  {
    id: 2,
    question: "How do you typically recharge after a long day?",
    options: [
      { text: "Creating something beautiful or rearranging my space", scores: { art: 3, music: 0, writing: 0, leadership: 0, empathy: 0, invention: 1 } },
      { text: "Listening to music or playing an instrument", scores: { art: 0, music: 3, writing: 0, leadership: 0, empathy: 0, invention: 0 } },
      { text: "Writing in a journal or getting lost in a book", scores: { art: 0, music: 0, writing: 3, leadership: 0, empathy: 1, invention: 0 } },
      { text: "Spending quality time with someone I care about", scores: { art: 0, music: 0, writing: 0, leadership: 0, empathy: 3, invention: 0 } }
    ]
  },
  {
    id: 3,
    question: "What do people most often come to you for?",
    options: [
      { text: "Aesthetic advice or creative feedback", scores: { art: 3, music: 0, writing: 0, leadership: 0, empathy: 0, invention: 1 } },
      { text: "A great song recommendation or playlist", scores: { art: 0, music: 3, writing: 0, leadership: 0, empathy: 1, invention: 0 } },
      { text: "Help crafting the perfect message or story", scores: { art: 0, music: 0, writing: 3, leadership: 0, empathy: 1, invention: 0 } },
      { text: "Guidance, motivation, or a fresh perspective", scores: { art: 0, music: 0, writing: 0, leadership: 2, empathy: 1, invention: 1 } }
    ]
  },
  {
    id: 4,
    question: "In a group project, which role do you naturally take?",
    options: [
      { text: "The one who visualizes the final outcome", scores: { art: 2, music: 0, writing: 0, leadership: 1, empathy: 0, invention: 1 } },
      { text: "The one who keeps the group motivated", scores: { art: 0, music: 1, writing: 0, leadership: 1, empathy: 2, invention: 0 } },
      { text: "The one who documents and communicates ideas", scores: { art: 0, music: 0, writing: 2, leadership: 1, empathy: 0, invention: 1 } },
      { text: "The one who sets direction and delegates", scores: { art: 0, music: 0, writing: 0, leadership: 3, empathy: 0, invention: 1 } }
    ]
  },
  {
    id: 5,
    question: "Which of these comes most naturally to you?",
    options: [
      { text: "Noticing beauty and detail in everyday things", scores: { art: 3, music: 0, writing: 0, leadership: 0, empathy: 0, invention: 1 } },
      { text: "Picking up rhythms, melodies, or languages by ear", scores: { art: 0, music: 2, writing: 1, leadership: 0, empathy: 0, invention: 1 } },
      { text: "Understanding how someone else is feeling", scores: { art: 0, music: 0, writing: 0, leadership: 0, empathy: 3, invention: 0 } },
      { text: "Finding clever solutions to tricky problems", scores: { art: 0, music: 0, writing: 0, leadership: 1, empathy: 0, invention: 3 } }
    ]
  },
  {
    id: 6,
    question: "How do you prefer to express yourself?",
    options: [
      { text: "Through images, colors, or design", scores: { art: 3, music: 0, writing: 0, leadership: 0, empathy: 0, invention: 1 } },
      { text: "Through sound, song, or movement", scores: { art: 0, music: 3, writing: 0, leadership: 0, empathy: 0, invention: 0 } },
      { text: "Through written or spoken words", scores: { art: 0, music: 0, writing: 3, leadership: 0, empathy: 1, invention: 0 } },
      { text: "Through action and leading by example", scores: { art: 0, music: 0, writing: 0, leadership: 3, empathy: 1, invention: 0 } }
    ]
  },
  {
    id: 7,
    question: "What kind of movies or shows are you most drawn to?",
    options: [
      { text: "Visually stunning films with unique artistry", scores: { art: 3, music: 0, writing: 0, leadership: 0, empathy: 0, invention: 1 } },
      { text: "Musicals or films with incredible soundtracks", scores: { art: 0, music: 3, writing: 0, leadership: 0, empathy: 1, invention: 0 } },
      { text: "Deep character-driven stories with rich dialogue", scores: { art: 0, music: 0, writing: 2, leadership: 0, empathy: 2, invention: 0 } },
      { text: "Inspiring stories of innovation and leadership", scores: { art: 0, music: 0, writing: 1, leadership: 2, empathy: 0, invention: 1 } }
    ]
  },
  {
    id: 8,
    question: "When faced with a difficult problem, you tend to:",
    options: [
      { text: "Sketch, map, or visualize possible solutions", scores: { art: 2, music: 0, writing: 0, leadership: 0, empathy: 0, invention: 2 } },
      { text: "Talk it out with someone you trust", scores: { art: 0, music: 0, writing: 1, leadership: 0, empathy: 3, invention: 0 } },
      { text: "Research and analyze all angles thoroughly", scores: { art: 0, music: 0, writing: 2, leadership: 0, empathy: 0, invention: 2 } },
      { text: "Gather a team and tackle it head-on", scores: { art: 0, music: 0, writing: 0, leadership: 3, empathy: 1, invention: 0 } }
    ]
  },
  {
    id: 9,
    question: "What does your ideal weekend look like?",
    options: [
      { text: "Visiting a gallery, making art, or photographing nature", scores: { art: 3, music: 0, writing: 0, leadership: 0, empathy: 0, invention: 1 } },
      { text: "Going to a concert, jamming, or discovering new music", scores: { art: 0, music: 3, writing: 0, leadership: 0, empathy: 1, invention: 0 } },
      { text: "Reading a great book or writing something personal", scores: { art: 0, music: 0, writing: 3, leadership: 0, empathy: 1, invention: 0 } },
      { text: "Working on a passion project or inventing something", scores: { art: 0, music: 0, writing: 0, leadership: 1, empathy: 0, invention: 3 } }
    ]
  },
  {
    id: 10,
    question: "What would you most like to be remembered for?",
    options: [
      { text: "The beauty and art I brought into the world", scores: { art: 3, music: 0, writing: 0, leadership: 0, empathy: 0, invention: 1 } },
      { text: "The music and joy I shared with others", scores: { art: 0, music: 3, writing: 0, leadership: 0, empathy: 1, invention: 0 } },
      { text: "The stories I told and the hearts I touched", scores: { art: 0, music: 0, writing: 2, leadership: 0, empathy: 2, invention: 0 } },
      { text: "The positive change I led and inspired in others", scores: { art: 0, music: 0, writing: 0, leadership: 2, empathy: 1, invention: 1 } }
    ]
  }
];

const TALENTS = {
  art: {
    name: "Artistic Vision",
    summary: "You see beauty where others see nothing. Your eye for color, form, and composition is extraordinary, and you have a natural ability to create visual experiences that move people. Whether through painting, photography, design, or any visual medium, you bring a unique aesthetic perspective to everything you do.",
    strengths: ["Visual creativity", "Color and composition sense", "Spatial awareness", "Attention to aesthetic detail", "Original creative thinking"],
    famousExamples: ["Leonardo da Vinci", "Frida Kahlo", "Hayao Miyazaki", "Georgia O'Keeffe"],
    quote: "Every artist was first an amateur."
  },
  music: {
    name: "Musical Genius",
    summary: "Rhythm and melody flow through you like a second language. You have an intuitive grasp of musical patterns, tones, and harmonies that allows you to connect with others on a deep emotional level through sound. Your gift for music makes the world a richer, more vibrant place.",
    strengths: ["Rhythmic intuition", "Melodic memory", "Emotional expression through sound", "Pattern recognition in audio", "Performance presence"],
    famousExamples: ["Mozart", "Beyonce", "Yo-Yo Ma", "Bob Marley"],
    quote: "Music is the universal language of mankind."
  },
  writing: {
    name: "Wordsmith",
    summary: "You have a way with words that captivates and inspires. Language flows through you effortlessly, allowing you to articulate complex ideas, paint vivid pictures with prose, and connect with readers on a profound level. Your words have the power to inform, persuade, and heal.",
    strengths: ["Rich vocabulary", "Storytelling ability", "Persuasive communication", "Emotional resonance", "Critical thinking"],
    famousExamples: ["Harper Lee", "Gabriel Garcia Marquez", "J.K. Rowling", "Maya Angelou"],
    quote: "The pen is mightier than the sword."
  },
  leadership: {
    name: "Natural Leader",
    summary: "People naturally look to you for direction and inspiration. You have a rare ability to see the big picture, rally others around a shared vision, and make decisive choices that move everyone forward. Your presence elevates teams and turns ideas into reality.",
    strengths: ["Decisiveness", "Charisma and influence", "Strategic thinking", "Clear communication", "Resilience under pressure"],
    famousExamples: ["Nelson Mandela", "Jacinda Ardern", "Steve Jobs", "Winston Churchill"],
    quote: "The greatest leader is not necessarily the one who does the greatest things. He is the one that gets the people to do the greatest things."
  },
  empathy: {
    name: "Empathic Healer",
    summary: "You have a remarkable ability to understand and connect with what others are feeling. Your compassion and emotional intelligence make you a natural confidant and healer. You create safe spaces where people feel truly seen, heard, and valued.",
    strengths: ["Active listening", "Deep compassion", "Emotional intelligence", "Patience and presence", "Non-judgmental support"],
    famousExamples: ["Dalai Lama", "Mr. Rogers", "Brene Brown", "Mother Teresa"],
    quote: "The great gift of human beings is that we have the power of empathy."
  },
  invention: {
    name: "Creative Inventor",
    summary: "You see solutions where others see only problems. Your mind naturally connects disparate ideas to create something entirely new. You are driven by curiosity and the thrill of discovery, constantly tinkering, experimenting, and pushing the boundaries of what is possible.",
    strengths: ["Creative problem-solving", "Relentless curiosity", "Resourcefulness", "Systems thinking", "Experimental mindset"],
    famousExamples: ["Nikola Tesla", "Marie Curie", "Elon Musk", "Thomas Edison"],
    quote: "Innovation distinguishes between a leader and a follower."
  }
};

function computeScores(answers) {
  const scores = { art: 0, music: 0, writing: 0, leadership: 0, empathy: 0, invention: 0 };
  answers.forEach((answerIndex, questionIndex) => {
    if (answerIndex === undefined || answerIndex === null) return;
    const optionScores = QUESTIONS[questionIndex].options[answerIndex].scores;
    for (const key of Object.keys(scores)) {
      scores[key] += optionScores[key] || 0;
    }
  });
  return scores;
}

function findTopTalent(scores) {
  let maxTalent = null;
  let maxScore = -1;
  for (const [key, value] of Object.entries(scores)) {
    if (value > maxScore) {
      maxScore = value;
      maxTalent = key;
    }
  }
  return maxTalent;
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
        const topTalent = findTopTalent(scores);
        setResult({ scores, topTalent });
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
            "name": "What's Your Hidden Talent?",
            "description": "Discover your hidden talents and natural strengths with our free personality quiz. Find out what unique abilities make you special.",
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
            What&apos;s Your Hidden Talent?
          </h1>
          <p className="description text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Discover the extraordinary talent you never knew you had by reflecting on what comes naturally to you.
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
                  Ready to uncover your hidden talent?
                </h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  Answer 10 quick questions about your natural tendencies and
                  discover the talent that has been within you all along.
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
                  Analyzing your responses...
                </h4>
                <p className="text-sm text-muted-foreground">
                  Mapping your natural tendencies to your hidden talent profile.
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
                    Your hidden talent is
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                    {TALENTS[result.topTalent].name}
                  </h2>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-surface-soft rounded-2xl p-5 border border-border">
                <p className="text-sm text-foreground leading-relaxed">
                  {TALENTS[result.topTalent].summary}
                </p>
              </div>

              {/* Strengths */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Your key strengths
                </h3>
                <div className="flex flex-wrap gap-2">
                  {TALENTS[result.topTalent].strengths.map(function (strength, idx) {
                    return (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
                      >
                        {strength}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Famous Examples */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Famous examples
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TALENTS[result.topTalent].famousExamples.map(function (person, idx) {
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-border bg-card p-3 text-center"
                      >
                        <span className="text-sm font-semibold text-foreground">
                          {person}
                        </span>
                      </div>
                    );
                  })}
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
                  &ldquo;{TALENTS[result.topTalent].quote}&rdquo;
                </p>
              </div>

              {/* Score breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Your talent breakdown
                </h3>
                <div className="space-y-2">
                  {Object.entries(TALENTS).map(function ([key, talent]) {
                    const score = result.scores[key];
                    const maxScore = 30;
                    const pct = Math.min(100, Math.round((score / maxScore) * 100));
                    const isTop = key === result.topTalent;
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className={`font-semibold ${isTop ? "text-primary" : "text-foreground"}`}>
                            {talent.name}
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
              Your answers are scored across six talent dimensions. The talent with the
              highest total is revealed as your hidden talent. No data is stored or sent
              anywhere -- everything stays on your device. For entertainment purposes only.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
