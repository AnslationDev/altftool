"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Sparkles } from "lucide-react";

const QUESTIONS = [
  {
    q: "When faced with a complex problem, what is your first instinct?",
    options: [
      { text: "Break it down into logical steps and analyze each part", scores: { logical: 3, creative: 0, social: 0, physical: 0, natural: 0, introspective: 0 } },
      { text: "Brainstorm creative possibilities and think outside the box", scores: { logical: 0, creative: 3, social: 0, physical: 0, natural: 0, introspective: 1 } },
      { text: "Discuss it with others and gather different perspectives", scores: { logical: 0, creative: 0, social: 3, physical: 0, natural: 1, introspective: 0 } },
      { text: "Take time to reflect and consider it from multiple angles", scores: { logical: 1, creative: 0, social: 0, physical: 0, natural: 1, introspective: 3 } },
    ],
  },
  {
    q: "How do you prefer to learn something new?",
    options: [
      { text: "Through structured courses, data, and logical frameworks", scores: { logical: 3, creative: 0, social: 0, physical: 0, natural: 0, introspective: 1 } },
      { text: "By experimenting, creating, and hands-on exploration", scores: { logical: 0, creative: 3, social: 0, physical: 2, natural: 0, introspective: 0 } },
      { text: "In group discussions or by teaching others", scores: { logical: 0, creative: 0, social: 3, physical: 0, natural: 0, introspective: 0 } },
      { text: "Through self-study, observation, and quiet reflection", scores: { logical: 0, creative: 1, social: 0, physical: 0, natural: 2, introspective: 3 } },
    ],
  },
  {
    q: "What kind of environment helps you feel most energized?",
    options: [
      { text: "A quiet, organized workspace with clear systems", scores: { logical: 3, creative: 0, social: 0, physical: 0, natural: 0, introspective: 1 } },
      { text: "A dynamic, inspiring space filled with art and ideas", scores: { logical: 0, creative: 3, social: 0, physical: 0, natural: 0, introspective: 1 } },
      { text: "A lively social setting with people and conversation", scores: { logical: 0, creative: 0, social: 3, physical: 1, natural: 0, introspective: 0 } },
      { text: "Outdoors in nature, surrounded by living things", scores: { logical: 0, creative: 0, social: 0, physical: 1, natural: 3, introspective: 1 } },
    ],
  },
  {
    q: "In your free time, you are most likely to:",
    options: [
      { text: "Solve puzzles, play strategy games, or read about science", scores: { logical: 3, creative: 0, social: 0, physical: 0, natural: 0, introspective: 1 } },
      { text: "Paint, write, play music, or work on a creative project", scores: { logical: 0, creative: 3, social: 0, physical: 1, natural: 0, introspective: 1 } },
      { text: "Hang out with friends, attend events, or mentor someone", scores: { logical: 0, creative: 0, social: 3, physical: 1, natural: 0, introspective: 0 } },
      { text: "Go for a hike, garden, or spend time observing the world", scores: { logical: 0, creative: 0, social: 0, physical: 2, natural: 3, introspective: 1 } },
    ],
  },
  {
    q: "What is your strongest way of communicating?",
    options: [
      { text: "Clear, precise, evidence-based arguments", scores: { logical: 3, creative: 0, social: 0, physical: 0, natural: 0, introspective: 0 } },
      { text: "Expressive storytelling with vivid imagery", scores: { logical: 0, creative: 3, social: 1, physical: 0, natural: 0, introspective: 1 } },
      { text: "Warm, empathetic engagement that connects with people", scores: { logical: 0, creative: 0, social: 3, physical: 0, natural: 1, introspective: 0 } },
      { text: "Thoughtful, reflective, and deeply considered words", scores: { logical: 1, creative: 0, social: 0, physical: 0, natural: 0, introspective: 3 } },
    ],
  },
  {
    q: "How do you handle disagreements with others?",
    options: [
      { text: "Present facts, data, and logical reasoning", scores: { logical: 3, creative: 0, social: 0, physical: 0, natural: 0, introspective: 0 } },
      { text: "Look for a creative compromise or new approach", scores: { logical: 0, creative: 2, social: 1, physical: 0, natural: 0, introspective: 1 } },
      { text: "Focus on understanding the other person's feelings", scores: { logical: 0, creative: 0, social: 3, physical: 0, natural: 1, introspective: 1 } },
      { text: "Step back to reflect before responding thoughtfully", scores: { logical: 1, creative: 0, social: 0, physical: 0, natural: 0, introspective: 3 } },
    ],
  },
  {
    q: "Which quality do you most admire in others?",
    options: [
      { text: "Sharp intellect and the ability to reason clearly", scores: { logical: 3, creative: 0, social: 0, physical: 0, natural: 0, introspective: 1 } },
      { text: "Originality and the courage to express unique ideas", scores: { logical: 0, creative: 3, social: 0, physical: 0, natural: 0, introspective: 0 } },
      { text: "Charisma and the gift of bringing people together", scores: { logical: 0, creative: 0, social: 3, physical: 1, natural: 0, introspective: 0 } },
      { text: "Inner peace and a deep understanding of life", scores: { logical: 0, creative: 0, social: 0, physical: 0, natural: 2, introspective: 3 } },
    ],
  },
  {
    q: "Which activity makes you lose track of time?",
    options: [
      { text: "Working on a complex analysis or coding project", scores: { logical: 3, creative: 0, social: 0, physical: 0, natural: 0, introspective: 1 } },
      { text: "Creating art, writing, or designing something new", scores: { logical: 0, creative: 3, social: 0, physical: 1, natural: 0, introspective: 0 } },
      { text: "Playing sports, dancing, or physical training", scores: { logical: 0, creative: 0, social: 0, physical: 3, natural: 0, introspective: 0 } },
      { text: "Meditating, journaling, or walking in solitude", scores: { logical: 0, creative: 0, social: 0, physical: 1, natural: 2, introspective: 3 } },
    ],
  },
  {
    q: "Your friends would most likely describe you as:",
    options: [
      { text: "The analytical one who always has a well-thought-out plan", scores: { logical: 3, creative: 0, social: 0, physical: 0, natural: 0, introspective: 1 } },
      { text: "The creative one with wild ideas and endless imagination", scores: { logical: 0, creative: 3, social: 1, physical: 0, natural: 0, introspective: 0 } },
      { text: "The social one who connects everyone and lights up the room", scores: { logical: 0, creative: 0, social: 3, physical: 0, natural: 0, introspective: 0 } },
      { text: "The wise one who gives thoughtful advice and listens deeply", scores: { logical: 0, creative: 0, social: 1, physical: 0, natural: 1, introspective: 3 } },
    ],
  },
  {
    q: "What drives you most when setting goals?",
    options: [
      { text: "Setting measurable milestones and tracking progress precisely", scores: { logical: 3, creative: 0, social: 0, physical: 1, natural: 0, introspective: 0 } },
      { text: "Dreaming big and adapting creatively along the journey", scores: { logical: 0, creative: 3, social: 0, physical: 0, natural: 0, introspective: 1 } },
      { text: "Involving others and building a shared vision together", scores: { logical: 0, creative: 0, social: 3, physical: 0, natural: 1, introspective: 0 } },
      { text: "Setting intentions that align with my deeper values", scores: { logical: 0, creative: 0, social: 0, physical: 0, natural: 1, introspective: 3 } },
    ],
  },
];

const GENIUS_TYPES = {
  logical: {
    name: "Logical Genius",
    summary:
      "You possess sharp analytical abilities and systematic thinking. You excel at breaking down complex problems, finding patterns, and building structured solutions. Your mind thrives on order, evidence, and precision.",
    strengths: [
      "Analytical Thinking",
      "Problem Solving",
      "Mathematical Ability",
      "Systematic Approach",
    ],
    weaknesses: [
      "Can Overthink",
      "Struggles with Ambiguity",
      "May Appear Cold",
    ],
    famousExample: "Sherlock Holmes",
    quote:
      "Once you eliminate the impossible, whatever remains, no matter how improbable, must be the truth.",
  },
  creative: {
    name: "Creative Genius",
    summary:
      "Your mind thrives on imagination, innovation, and artistic expression. You see possibilities where others see limitations and you bring original ideas to life with passion and vision.",
    strengths: [
      "Imagination",
      "Innovation",
      "Artistic Vision",
      "Divergent Thinking",
    ],
    weaknesses: [
      "Can Be Disorganized",
      "Struggles with Routine",
      "Overly Idealistic",
    ],
    famousExample: "Leonardo da Vinci",
    quote: "Simplicity is the ultimate sophistication.",
  },
  social: {
    name: "Social Genius",
    summary:
      "You have a remarkable ability to connect with people, understand emotions, and inspire those around you. Your charisma, empathy, and persuasion make you a natural leader and collaborator.",
    strengths: [
      "Charisma",
      "Empathy",
      "Persuasion",
      "Team Building",
    ],
    weaknesses: [
      "Can Overextend",
      "Takes Things Personally",
      "Conflict Avoidant",
    ],
    famousExample: "Oprah Winfrey",
    quote:
      "The greatest discovery of all time is that a person can change their future by merely changing their attitude.",
  },
  physical: {
    name: "Physical Genius",
    summary:
      "Your intelligence flows through movement, coordination, and embodied awareness. You master physical skills with precision, discipline, and grace, excelling through practice and perseverance.",
    strengths: [
      "Kinesthetic Awareness",
      "Discipline",
      "Coordination",
      "Endurance",
    ],
    weaknesses: [
      "Impatient with Theory",
      "Risk-Prone",
      "Struggles with Stillness",
    ],
    famousExample: "Serena Williams",
    quote:
      "I really think a champion is defined not by their wins but by how they can recover when they fall.",
  },
  natural: {
    name: "Natural Genius",
    summary:
      "You possess an intuitive, holistic understanding of the natural world and living systems. Your wisdom comes from patient observation, deep connection, and a profound respect for all forms of life.",
    strengths: [
      "Intuition",
      "Holistic Thinking",
      "Ecological Awareness",
      "Patience",
    ],
    weaknesses: [
      "Can Be Too Idealistic",
      "Struggles with Modern Systems",
      "Overly Trusting",
    ],
    famousExample: "Jane Goodall",
    quote:
      "What you do makes a difference, and you have to decide what kind of difference you want to make.",
  },
  introspective: {
    name: "Introspective Genius",
    summary:
      "Your genius lies in deep self-reflection, philosophical inquiry, and profound self-awareness. You understand the inner workings of the mind and the human condition with rare clarity.",
    strengths: [
      "Self-Awareness",
      "Philosophical Depth",
      "Emotional Intelligence",
      "Contemplation",
    ],
    weaknesses: [
      "Can Be Overly Introspective",
      "Social Withdrawal",
      "Analysis Paralysis",
    ],
    famousExample: "Marcus Aurelius",
    quote:
      "You have power over your mind - not outside events. Realize this, and you will find strength.",
  },
};

export default function ToolHome() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);

  const answeredCount = Object.keys(answers).length;
  const total = QUESTIONS.length;

  const handleAnswer = (qIndex, optIndex) => {
    const updated = { ...answers, [qIndex]: optIndex };
    setAnswers(updated);

    if (qIndex < total - 1) {
      setStep(qIndex + 1);
    } else {
      setCalculating(true);
      setTimeout(() => {
        const scores = { logical: 0, creative: 0, social: 0, physical: 0, natural: 0, introspective: 0 };
        Object.entries(updated).forEach(([qIdx, optIdx]) => {
          const q = QUESTIONS[parseInt(qIdx)];
          const opt = q && q.options[optIdx];
          if (opt) {
            Object.entries(opt.scores).forEach(([key, val]) => {
              scores[key] += val;
            });
          }
        });
        const topType = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
        setResult(GENIUS_TYPES[topType]);
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
      <div
        className="min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "What Kind of Genius Are You?",
              "description": "Discover your genius type based on your thinking style and strengths. Take our quiz to find out what kind of genius you really are.",
              "applicationCategory": "QuizApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        <div className="text-center max-w-md">
          <div
            className="mx-auto mb-6 rounded-full p-4 inline-flex items-center justify-center"
            style={{ background: "var(--card)" }}
          >
            <Sparkles
              size={48}
              className="animate-bounce"
              style={{ color: "var(--primary)" }}
            />
          </div>
          <h2
            className="text-2xl font-extrabold mb-3"
            style={{ color: "var(--foreground)" }}
          >
            Discovering Your Genius Type...
          </h2>
          <div
            className="h-3 rounded-full overflow-hidden"
            style={{ background: "var(--border)" }}
          >
            <div
              className="h-full rounded-full animate-pulse"
              style={{ background: "var(--primary)", width: "100%" }}
            />
          </div>
          <p
            className="text-sm mt-3"
            style={{ color: "var(--muted-foreground)" }}
          >
            Analyzing your responses...
          </p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div
        className="min-h-screen p-4 sm:p-6 lg:p-8"
        style={{ background: "var(--background)" }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "What Kind of Genius Are You?",
              "description": "Discover your genius type based on your thinking style and strengths. Take our quiz to find out what kind of genius you really are.",
              "applicationCategory": "QuizApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1
              className="text-3xl sm:text-4xl font-extrabold mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Your Genius Type
            </h1>
          </div>

          <div
            className="rounded-2xl p-6 border"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="text-center mb-5">
              <h2
                className="text-2xl font-extrabold"
                style={{ color: "var(--foreground)" }}
              >
                {result.name}
              </h2>
              <div
                className="w-16 h-1 mx-auto mt-3 rounded-full"
                style={{ background: "var(--primary)" }}
              />
            </div>

            <p
              className="text-sm text-center mb-6 leading-relaxed"
              style={{ color: "var(--muted-foreground)" }}
            >
              {result.summary}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div
                className="p-4 rounded-xl"
                style={{ background: "var(var(--background))" }}
              >
                <p
                  className="text-[10px] font-black uppercase tracking-wider mb-2"
                  style={{ color: "var(--primary)" }}
                >
                  Strengths
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.strengths.map((s, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                        color: "var(--primary)",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{ background: "var(var(--background))" }}
              >
                <p
                  className="text-[10px] font-black uppercase tracking-wider mb-2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Weaknesses
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.weaknesses.map((w, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: "color-mix(in srgb, var(--muted-foreground) 12%, transparent)",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="p-4 rounded-xl mb-5 border"
              style={{
                background: "var(var(--background))",
                borderColor: "var(--border)",
              }}
            >
              <p
                className="text-[10px] font-black uppercase tracking-wider mb-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                Famous Example
              </p>
              <p
                className="text-sm font-bold"
                style={{ color: "var(--foreground)" }}
              >
                {result.famousExample}
              </p>
            </div>

            <div
              className="p-4 rounded-xl text-center italic mb-5 border"
              style={{
                background: "var(var(--background))",
                borderColor: "var(--border)",
                color: "var(--muted-foreground)",
              }}
            >
              &ldquo;{result.quote}&rdquo;
            </div>

            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-primary-foreground transition-all hover:opacity-90 active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                background: "var(--primary)",
                "--tw-ring-color": "var(--primary)",
              }}
            >
              <RotateCcw size={18} />
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 sm:p-6 lg:p-8"
      style={{ background: "var(--background)" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "What Kind of Genius Are You?",
            "description": "Discover your genius type based on your thinking style and strengths. Take our quiz to find out what kind of genius you really are.",
            "applicationCategory": "QuizApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
          })
        }}
      />
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1
            className="text-3xl sm:text-4xl font-extrabold mb-2"
            style={{ color: "var(--foreground)" }}
          >
            What Kind of Genius Are You?
          </h1>
          <p
            className="text-base opacity-80"
            style={{ color: "var(--muted-foreground)" }}
          >
            Discover your unique genius type based on your strengths and thinking
            style
          </p>
        </div>

        <div className="mb-6">
          <div
            className="flex items-center justify-between text-xs font-bold mb-2"
            style={{ color: "var(--muted-foreground)" }}
          >
            <span>
              Question {answeredCount + 1} of {total}
            </span>
            <span>{Math.round((answeredCount / total) * 100)}%</span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "var(--border)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${(answeredCount / total) * 100}%`,
                background: "var(--primary)",
              }}
            />
          </div>
        </div>

        <div
          className="rounded-2xl p-6 border"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <h2
            className="text-lg font-bold mb-5 leading-relaxed"
            style={{ color: "var(--foreground)" }}
          >
            {QUESTIONS[step].q}
          </h2>
          <div className="space-y-3">
            {QUESTIONS[step].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(step, i)}
                className="w-full text-left p-3.5 rounded-xl border text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  background:
                    answers[step] === i
                      ? "var(--primary)"
                      : "var(var(--background))",
                  borderColor:
                    answers[step] === i
                      ? "var(--primary)"
                      : "var(--border)",
                  color:
                    answers[step] === i ? "var(--primary-foreground)" : "var(--foreground)",
                  "--tw-ring-color": "var(--primary)",
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
