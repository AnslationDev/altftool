"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Sparkles } from "lucide-react";

const QUESTIONS = [
  {
    question: "What quality do you value most in a friend?",
    options: [
      { text: "Their bravery and willingness to stand up for others", scores: { gryffindor: 3, slytherin: 0, ravenclaw: 0, hufflepuff: 1, valoria: 0, umbra: 0 } },
      { text: "Their wit and clever solutions to problems", scores: { gryffindor: 0, slytherin: 0, ravenclaw: 3, hufflepuff: 0, valoria: 1, umbra: 0 } },
      { text: "Their unwavering loyalty through hard times", scores: { gryffindor: 1, slytherin: 0, ravenclaw: 0, hufflepuff: 3, valoria: 0, umbra: 0 } },
      { text: "Their ability to keep a secret and read situations", scores: { gryffindor: 0, slytherin: 1, ravenclaw: 0, hufflepuff: 0, valoria: 0, umbra: 3 } },
    ],
  },
  {
    question: "How do you react when faced with a difficult challenge?",
    options: [
      { text: "Charge forward without hesitation", scores: { gryffindor: 3, slytherin: 0, ravenclaw: 0, hufflepuff: 0, valoria: 1, umbra: 0 } },
      { text: "Analyze every angle before making a move", scores: { gryffindor: 0, slytherin: 0, ravenclaw: 3, hufflepuff: 0, valoria: 0, umbra: 1 } },
      { text: "Find creative ways to turn the situation around", scores: { gryffindor: 0, slytherin: 1, ravenclaw: 1, hufflepuff: 0, valoria: 2, umbra: 0 } },
      { text: "Persist steadily until you overcome it", scores: { gryffindor: 0, slytherin: 0, ravenclaw: 0, hufflepuff: 3, valoria: 0, umbra: 1 } },
    ],
  },
  {
    question: "Which environment helps you thrive most?",
    options: [
      { text: "A bustling hall full of energy and action", scores: { gryffindor: 2, slytherin: 1, ravenclaw: 0, hufflepuff: 0, valoria: 1, umbra: 0 } },
      { text: "A quiet library filled with ancient knowledge", scores: { gryffindor: 0, slytherin: 0, ravenclaw: 3, hufflepuff: 0, valoria: 0, umbra: 1 } },
      { text: "A cozy common room with close companions", scores: { gryffindor: 0, slytherin: 0, ravenclaw: 0, hufflepuff: 3, valoria: 1, umbra: 0 } },
      { text: "A shadowy corner where you can observe unseen", scores: { gryffindor: 0, slytherin: 1, ravenclaw: 1, hufflepuff: 0, valoria: 0, umbra: 2 } },
    ],
  },
  {
    question: "What drives you to pursue your goals?",
    options: [
      { text: "The desire to protect those who cannot protect themselves", scores: { gryffindor: 3, slytherin: 0, ravenclaw: 0, hufflepuff: 1, valoria: 0, umbra: 0 } },
      { text: "The ambition to rise to the top and be recognised", scores: { gryffindor: 0, slytherin: 3, ravenclaw: 0, hufflepuff: 0, valoria: 1, umbra: 0 } },
      { text: "The hunger for knowledge and understanding", scores: { gryffindor: 0, slytherin: 0, ravenclaw: 3, hufflepuff: 0, valoria: 0, umbra: 1 } },
      { text: "The need to rebuild and transform what is broken", scores: { gryffindor: 0, slytherin: 0, ravenclaw: 0, hufflepuff: 0, valoria: 3, umbra: 1 } },
    ],
  },
  {
    question: "A stranger is being treated unfairly. What do you do?",
    options: [
      { text: "Step in immediately and confront the aggressor", scores: { gryffindor: 3, slytherin: 0, ravenclaw: 0, hufflepuff: 1, valoria: 0, umbra: 0 } },
      { text: "Observe first, then use strategy to resolve it", scores: { gryffindor: 0, slytherin: 2, ravenclaw: 1, hufflepuff: 0, valoria: 0, umbra: 1 } },
      { text: "Offer quiet support and comfort afterward", scores: { gryffindor: 0, slytherin: 0, ravenclaw: 0, hufflepuff: 3, valoria: 1, umbra: 0 } },
      { text: "Speak out publicly to inspire others to act", scores: { gryffindor: 1, slytherin: 0, ravenclaw: 0, hufflepuff: 0, valoria: 3, umbra: 0 } },
    ],
  },
  {
    question: "Which subject fascinates you the most?",
    options: [
      { text: "Ancient battles and legendary heroes", scores: { gryffindor: 2, slytherin: 1, ravenclaw: 0, hufflepuff: 0, valoria: 1, umbra: 0 } },
      { text: "Riddles, puzzles, and the mysteries of the mind", scores: { gryffindor: 0, slytherin: 0, ravenclaw: 3, hufflepuff: 0, valoria: 0, umbra: 1 } },
      { text: "Potions, herbs, and the natural world", scores: { gryffindor: 0, slytherin: 0, ravenclaw: 0, hufflepuff: 2, valoria: 1, umbra: 1 } },
      { text: "Transfiguration and the power of change", scores: { gryffindor: 0, slytherin: 1, ravenclaw: 0, hufflepuff: 0, valoria: 2, umbra: 1 } },
    ],
  },
  {
    question: "How would your closest friends describe you?",
    options: [
      { text: "Bold and always ready for action", scores: { gryffindor: 3, slytherin: 0, ravenclaw: 0, hufflepuff: 0, valoria: 1, umbra: 0 } },
      { text: "Quick-witted and resourceful in any situation", scores: { gryffindor: 0, slytherin: 2, ravenclaw: 1, hufflepuff: 0, valoria: 0, umbra: 1 } },
      { text: "Kind, patient, and always there to listen", scores: { gryffindor: 0, slytherin: 0, ravenclaw: 0, hufflepuff: 3, valoria: 1, umbra: 0 } },
      { text: "Mysterious but deeply perceptive", scores: { gryffindor: 0, slytherin: 1, ravenclaw: 1, hufflepuff: 0, valoria: 0, umbra: 2 } },
    ],
  },
  {
    question: "What is your approach to learning something new?",
    options: [
      { text: "Dive in headfirst and learn by doing", scores: { gryffindor: 2, slytherin: 0, ravenclaw: 0, hufflepuff: 1, valoria: 1, umbra: 0 } },
      { text: "Study the theory until you master every detail", scores: { gryffindor: 0, slytherin: 0, ravenclaw: 3, hufflepuff: 0, valoria: 0, umbra: 1 } },
      { text: "Find a mentor and learn through guidance", scores: { gryffindor: 0, slytherin: 1, ravenclaw: 0, hufflepuff: 2, valoria: 1, umbra: 0 } },
      { text: "Experiment in private until you perfect it", scores: { gryffindor: 0, slytherin: 1, ravenclaw: 1, hufflepuff: 0, valoria: 0, umbra: 2 } },
    ],
  },
  {
    question: "Which magical ability appeals to you most?",
    options: [
      { text: "The power to summon a legendary sword", scores: { gryffindor: 3, slytherin: 0, ravenclaw: 0, hufflepuff: 0, valoria: 1, umbra: 0 } },
      { text: "The gift of persuasion and influence", scores: { gryffindor: 0, slytherin: 3, ravenclaw: 1, hufflepuff: 0, valoria: 0, umbra: 0 } },
      { text: "The ability to glimpse past and future events", scores: { gryffindor: 0, slytherin: 0, ravenclaw: 2, hufflepuff: 0, valoria: 1, umbra: 1 } },
      { text: "The skill to become invisible and move in shadow", scores: { gryffindor: 0, slytherin: 1, ravenclaw: 0, hufflepuff: 0, valoria: 0, umbra: 3 } },
    ],
  },
  {
    question: "If you found a lost artifact, what would you do with it?",
    options: [
      { text: "Return it to its rightful owner no matter the cost", scores: { gryffindor: 1, slytherin: 0, ravenclaw: 0, hufflepuff: 2, valoria: 1, umbra: 0 } },
      { text: "Study it to uncover its secrets and history", scores: { gryffindor: 0, slytherin: 0, ravenclaw: 3, hufflepuff: 0, valoria: 0, umbra: 1 } },
      { text: "Keep it hidden as a valuable secret asset", scores: { gryffindor: 0, slytherin: 2, ravenclaw: 0, hufflepuff: 0, valoria: 0, umbra: 2 } },
      { text: "Use its power to bring about positive change", scores: { gryffindor: 1, slytherin: 0, ravenclaw: 0, hufflepuff: 0, valoria: 3, umbra: 0 } },
    ],
  },
];

const HOUSES = {
  gryffindor: {
    name: "Gryffindor",
    motto: "Courage Over Caution",
    summary: "Those who belong to the House of the Lion are defined by their courage, daring, and chivalrous nature. They rush toward danger when others flee, driven by a deep sense of justice and a desire to protect the vulnerable.",
    traits: ["Brave", "Daring", "Chivalrous", "Bold", "Courageous"],
    colors: ["#DC2626", "#F59E0B"],
    quote: "It takes courage to stand up to your enemies, but even more to stand up to your friends.",
  },
  slytherin: {
    name: "Slytherin",
    motto: "Ambition Knows No Bounds",
    summary: "The House of the Serpent breeds the cunning, ambitious, and resourceful. You possess a sharp mind and an unwavering determination to achieve your goals, using every tool at your disposal to climb higher.",
    traits: ["Cunning", "Ambitious", "Resourceful", "Determined", "Subtle"],
    colors: ["#059669", "#94A3B8"],
    quote: "The world belongs to those who are clever enough to take it.",
  },
  ravenclaw: {
    name: "Ravenclaw",
    motto: "Wisdom Beyond Measure",
    summary: "The House of the Raven cherishes intelligence, creativity, and an insatiable curiosity above all else. You seek knowledge for its own sake, finding joy in discovery and solving the puzzles others cannot.",
    traits: ["Intelligent", "Creative", "Curious", "Wise", "Innovative"],
    colors: ["#2563EB", "#B45309"],
    quote: "The mind is not a vessel to be filled but a fire to be kindled.",
  },
  hufflepuff: {
    name: "Hufflepuff",
    motto: "Loyalty Above All",
    summary: "The House of the Badger values loyalty, patience, and hard work above everything. You are the steady foundation others lean on, fair and just, believing that everyone deserves a chance to belong.",
    traits: ["Loyal", "Patient", "Hardworking", "Fair", "Dedicated"],
    colors: ["#EAB308", "#1F2937"],
    quote: "In the end, it is not the talent but the dedication that moves the world.",
  },
  valoria: {
    name: "Valoria",
    motto: "Reborn Through Flame",
    summary: "The House of the Phoenix embodies passion, resilience, and transformation. You rise from every setback stronger than before, fueled by an inner fire that refuses to be extinguished.",
    traits: ["Passionate", "Resilient", "Transformative", "Fiery", "Inspirational"],
    colors: ["#EA580C", "#7C3AED"],
    quote: "From the ashes of defeat rises a fire that cannot be contained.",
  },
  umbra: {
    name: "Umbra",
    motto: "Secrets Hold Power",
    summary: "The House of the Shadow thrives on mystery, strategy, and perception. You see what others miss, moving through the world with quiet confidence, always several steps ahead.",
    traits: ["Mysterious", "Strategic", "Perceptive", "Patient", "Observant"],
    colors: ["#4F46E5", "#111827"],
    quote: "The shadows hold truths that the light will never reveal.",
  },
};

export default function WhichFantasyHouse() {
  const [step, setStep] = useState("start");
  const [answers, setAnswers] = useState([]);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);

  function handleAnswer(optionScores) {
    const updated = [...answers, optionScores];
    setAnswers(updated);

    if (updated.length === QUESTIONS.length) {
      setCalculating(true);
      setTimeout(() => {
        const scores = computeScores(updated);
        const winner = determineHouse(scores);
        setResult({ scores, winner, details: HOUSES[winner] });
        setCalculating(false);
        setStep("result");
      }, 2000);
    } else {
      setStep("question");
    }
  }

  function computeScores(answerScores) {
    const totals = {
      gryffindor: 0,
      slytherin: 0,
      ravenclaw: 0,
      hufflepuff: 0,
      valoria: 0,
      umbra: 0,
    };
    for (const s of answerScores) {
      for (const key of Object.keys(totals)) {
        totals[key] += s[key] || 0;
      }
    }
    return totals;
  }

  function determineHouse(scores) {
    let maxScore = -1;
    let winner = "gryffindor";
    for (const key of Object.keys(scores)) {
      if (scores[key] > maxScore) {
        maxScore = scores[key];
        winner = key;
      }
    }
    return winner;
  }

  function handleRetake() {
    setStep("start");
    setAnswers([]);
    setCalculating(false);
    setResult(null);
  }

  const currentIndex = answers.length;
  const progress = QUESTIONS.length > 0 ? (currentIndex / QUESTIONS.length) * 100 : 0;

  if (step === "result" && result) {
    const h = result.details;
    return (
      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          padding: "2rem 1rem",
          fontFamily: "system-ui, sans-serif",
          color: "var(--foreground)",
          backgroundColor: "var(--background)",
          minHeight: "100vh",
        }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Which Fantasy House Do You Belong In?",
              "description": "Take our magical personality quiz to discover which fantasy house matches your values and traits. Find your fantasy house allegiance today.",
              "applicationCategory": "QuizApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            padding: "2rem",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.25rem",
            }}
          >
            <Sparkles size={20} style={{ color: "var(--primary)" }} />
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--muted-foreground)",
              }}
            >
              Your House
            </span>
          </div>

          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              margin: "0.5rem 0 0.25rem",
              lineHeight: 1.2,
            }}
          >
            {h.name}
          </h2>

          <p
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "var(--primary)",
              margin: "0 0 1rem",
            }}
          >
            {h.motto}
          </p>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
            {h.colors.map((c, i) => (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "9999px",
                  backgroundColor: c,
                  border: "2px solid var(--border)",
                }}
                aria-hidden="true"
              />
            ))}
          </div>

          <p
            style={{
              fontSize: "0.95rem",
              lineHeight: 1.7,
              color: "var(--foreground)",
              marginBottom: "1.25rem",
            }}
          >
            {h.summary}
          </p>

          <div style={{ marginBottom: "1.25rem" }}>
            <p
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--muted-foreground)",
                marginBottom: "0.5rem",
              }}
            >
              Key Traits
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {h.traits.map((t, i) => (
                <span
                  key={i}
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "9999px",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    backgroundColor: "var(--primary)",
                    color: "#fff",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div
            style={{
              borderLeft: "3px solid var(--primary)",
              paddingLeft: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <p
              style={{
                fontStyle: "italic",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                color: "var(--foreground)",
                margin: 0,
              }}
            >
              &ldquo;{h.quote}&rdquo;
            </p>
          </div>

          <button
            onClick={handleRetake}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#fff",
              backgroundColor: "var(--primary)",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            onFocus={(e) => {
              e.currentTarget.style.outline = "2px solid var(--primary)";
              e.currentTarget.style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
          >
            <RotateCcw size={16} />
            Take the Quiz Again
          </button>
        </div>

        {result.scores && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1.25rem",
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
            }}
          >
            <p
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--muted-foreground)",
                marginBottom: "0.75rem",
              }}
            >
              Your Scores
            </p>
            {Object.keys(result.scores).map((key) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.35rem 0",
                  fontSize: "0.85rem",
                }}
              >
                <span style={{ fontWeight: 500 }}>{HOUSES[key].name}</span>
                <span style={{ fontWeight: 700, color: "var(--primary)" }}>
                  {result.scores[key]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (calculating) {
    return (
      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          padding: "2rem 1rem",
          fontFamily: "system-ui, sans-serif",
          color: "var(--foreground)",
          backgroundColor: "var(--background)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Which Fantasy House Do You Belong In?",
              "description": "Take our magical personality quiz to discover which fantasy house matches your values and traits. Find your fantasy house allegiance today.",
              "applicationCategory": "QuizApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        <div
          style={{
            width: "3rem",
            height: "3rem",
            borderRadius: "9999px",
            border: "3px solid var(--border)",
            borderTopColor: "var(--primary)",
            animation: "altft-spin 0.8s linear infinite",
            marginBottom: "1.5rem",
          }}
        />
        <p
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "var(--foreground)",
          }}
        >
          Consulting the ancient scrolls...
        </p>
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--muted-foreground)",
            marginTop: "0.25rem",
          }}
        >
          The Sorting Hat is deliberating.
        </p>
        <style>{`
          @keyframes altft-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (step === "question" || currentIndex < QUESTIONS.length) {
    const q = QUESTIONS[currentIndex];
    return (
      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          padding: "2rem 1rem",
          fontFamily: "system-ui, sans-serif",
          color: "var(--foreground)",
          backgroundColor: "var(--background)",
          minHeight: "100vh",
        }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Which Fantasy House Do You Belong In?",
              "description": "Take our magical personality quiz to discover which fantasy house matches your values and traits. Find your fantasy house allegiance today.",
              "applicationCategory": "QuizApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        <div
          style={{
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--muted-foreground)",
              }}
            >
              Question {currentIndex + 1} of {QUESTIONS.length}
            </span>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--primary)",
              }}
            >
              {Math.round(progress)}%
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "0.5rem",
              backgroundColor: "var(--border)",
              borderRadius: "9999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: "var(--primary)",
                borderRadius: "9999px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            lineHeight: 1.4,
            marginBottom: "1.5rem",
          }}
        >
          {q.question}
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt.scores)}
              style={{
                width: "100%",
                padding: "0.9rem 1.25rem",
                fontSize: "0.9rem",
                fontWeight: 500,
                textAlign: "left",
                color: "var(--foreground)",
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                cursor: "pointer",
                transition: "border-color 0.15s, box-shadow 0.15s",
                lineHeight: 1.4,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.boxShadow = "0 0 0 2px var(--primary)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.boxShadow = "0 0 0 2px var(--primary)";
                e.currentTarget.style.outline = "none";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "640px",
        margin: "0 auto",
        padding: "2rem 1rem",
        fontFamily: "system-ui, sans-serif",
        color: "var(--foreground)",
        backgroundColor: "var(--background)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
          textAlign: "center",
        }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Which Fantasy House Do You Belong In?",
              "description": "Take our magical personality quiz to discover which fantasy house matches your values and traits. Find your fantasy house allegiance today.",
              "applicationCategory": "QuizApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            padding: "3rem 2rem",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        <Sparkles
          size={36}
          style={{
            color: "var(--primary)",
            marginBottom: "1rem",
          }}
        />
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            margin: "0 0 0.75rem",
            lineHeight: 1.2,
          }}
        >
          Which Fantasy House Do You Belong In?
        </h1>
        <p
          style={{
            fontSize: "0.95rem",
            lineHeight: 1.6,
            color: "var(--muted-foreground)",
            marginBottom: "1.75rem",
          }}
        >
          Answer ten questions to discover the magical house that matches your
          spirit. The Sorting Hat awaits your choice.
        </p>
        <button
          onClick={() => setStep("question")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.85rem 2rem",
            fontSize: "1rem",
            fontWeight: 600,
            color: "#fff",
            backgroundColor: "var(--primary)",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            transition: "opacity 0.15s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          onFocus={(e) => {
            e.currentTarget.style.outline = "2px solid var(--primary)";
            e.currentTarget.style.outlineOffset = "2px";
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = "none";
          }}
        >
          Begin the Sorting
        </button>
      </div>
    </div>
  );
}
