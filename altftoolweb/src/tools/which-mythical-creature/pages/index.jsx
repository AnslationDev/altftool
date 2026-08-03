"use client"

import { useState, useEffect } from "react"
import { RotateCcw, Sparkles } from "lucide-react"

const QUESTIONS = [
  {
    question: "What draws you most in a story?",
    options: [
      { text: "An ancient library of lost knowledge", scores: { dragon: 3, phoenix: 0, unicorn: 0, griffin: 0, mermaid: 0, centaur: 2 } },
      { text: "A hero rising from defeat against all odds", scores: { dragon: 0, phoenix: 3, unicorn: 0, griffin: 0, mermaid: 0, centaur: 0 } },
      { text: "A hidden magical forest full of wonder", scores: { dragon: 0, phoenix: 0, unicorn: 2, griffin: 0, mermaid: 1, centaur: 1 } },
      { text: "A grand quest for a sacred relic", scores: { dragon: 1, phoenix: 0, unicorn: 0, griffin: 2, mermaid: 0, centaur: 0 } }
    ]
  },
  {
    question: "How do you face difficult challenges?",
    options: [
      { text: "With careful strategy and patience", scores: { dragon: 2, phoenix: 0, unicorn: 0, griffin: 0, mermaid: 0, centaur: 2 } },
      { text: "I adapt and reinvent my approach", scores: { dragon: 0, phoenix: 3, unicorn: 0, griffin: 0, mermaid: 0, centaur: 0 } },
      { text: "I stay true to my principles", scores: { dragon: 0, phoenix: 0, unicorn: 2, griffin: 1, mermaid: 0, centaur: 0 } },
      { text: "I go with the flow and trust the process", scores: { dragon: 0, phoenix: 0, unicorn: 0, griffin: 0, mermaid: 2, centaur: 1 } }
    ]
  },
  {
    question: "What is your ideal environment?",
    options: [
      { text: "A mountain peak library overlooking the world", scores: { dragon: 3, phoenix: 0, unicorn: 0, griffin: 1, mermaid: 0, centaur: 0 } },
      { text: "A vibrant sunrise field after a storm", scores: { dragon: 0, phoenix: 2, unicorn: 1, griffin: 0, mermaid: 0, centaur: 0 } },
      { text: "A deep serene ocean at twilight", scores: { dragon: 0, phoenix: 0, unicorn: 0, griffin: 0, mermaid: 3, centaur: 0 } },
      { text: "Open skies and ancient forest ruins", scores: { dragon: 0, phoenix: 0, unicorn: 0, griffin: 2, centaur: 1 } }
    ]
  },
  {
    question: "Which quality do you admire most in others?",
    options: [
      { text: "Wisdom and foresight", scores: { dragon: 2, phoenix: 0, unicorn: 0, griffin: 0, mermaid: 0, centaur: 2 } },
      { text: "Resilience and the power to transform", scores: { dragon: 0, phoenix: 3, unicorn: 0, griffin: 0, mermaid: 0, centaur: 0 } },
      { text: "Grace and purity of heart", scores: { dragon: 0, phoenix: 0, unicorn: 2, griffin: 0, mermaid: 1, centaur: 0 } },
      { text: "Courage and unwavering loyalty", scores: { dragon: 1, phoenix: 0, unicorn: 0, griffin: 2, mermaid: 0, centaur: 0 } }
    ]
  },
  {
    question: "What would you dedicate your life to protecting?",
    options: [
      { text: "Ancient knowledge and sacred artifacts", scores: { dragon: 2, phoenix: 0, unicorn: 0, griffin: 2, mermaid: 0, centaur: 0 } },
      { text: "Hope and the promise of renewal", scores: { dragon: 0, phoenix: 2, unicorn: 1, griffin: 0, mermaid: 0, centaur: 0 } },
      { text: "The balance of nature and all living things", scores: { dragon: 0, phoenix: 0, unicorn: 0, griffin: 0, mermaid: 1, centaur: 2 } },
      { text: "Innocence and the magic of wonder", scores: { dragon: 0, phoenix: 0, unicorn: 3, griffin: 0, mermaid: 0, centaur: 0 } }
    ]
  },
  {
    question: "If you could wield one magical power, what would it be?",
    options: [
      { text: "Flight and command over fire", scores: { dragon: 2, phoenix: 1, unicorn: 0, griffin: 2, mermaid: 0, centaur: 0 } },
      { text: "Rebirth and the ability to heal", scores: { dragon: 0, phoenix: 3, unicorn: 1, griffin: 0, mermaid: 0, centaur: 0 } },
      { text: "Water breathing and the power of song", scores: { dragon: 0, phoenix: 0, unicorn: 0, griffin: 0, mermaid: 3, centaur: 0 } },
      { text: "Mastery of archery and nature magic", scores: { dragon: 0, phoenix: 0, unicorn: 0, griffin: 0, mermaid: 0, centaur: 3 } }
    ]
  },
  {
    question: "What do others say is your greatest strength?",
    options: [
      { text: "Deep insight and a thirst for knowledge", scores: { dragon: 2, phoenix: 0, unicorn: 0, griffin: 0, mermaid: 0, centaur: 2 } },
      { text: "An ability to rise from any setback", scores: { dragon: 0, phoenix: 3, unicorn: 0, griffin: 0, mermaid: 0, centaur: 0 } },
      { text: "Kindness and a calming presence", scores: { dragon: 0, phoenix: 0, unicorn: 2, mermaid: 2, griffin: 0, centaur: 0 } },
      { text: "Loyalty and an unwavering sense of duty", scores: { dragon: 0, phoenix: 0, unicorn: 0, griffin: 3, mermaid: 0, centaur: 0 } }
    ]
  },
  {
    question: "How would you prefer to spend a free afternoon?",
    options: [
      { text: "Reading ancient scrolls and studying the stars", scores: { dragon: 2, phoenix: 0, unicorn: 0, griffin: 0, mermaid: 0, centaur: 1 } },
      { text: "Exploring uncharted lands from the sky", scores: { dragon: 0, phoenix: 1, unicorn: 0, griffin: 2, mermaid: 0, centaur: 0 } },
      { text: "Gliding through warm ocean currents", scores: { dragon: 0, phoenix: 0, unicorn: 0, griffin: 0, mermaid: 3, centaur: 0 } },
      { text: "Wandering through an enchanted forest", scores: { dragon: 0, phoenix: 0, unicorn: 2, griffin: 0, mermaid: 0, centaur: 1 } }
    ]
  },
  {
    question: "What is your approach to leadership?",
    options: [
      { text: "Lead with wisdom, strategy, and vision", scores: { dragon: 2, phoenix: 0, unicorn: 0, griffin: 0, mermaid: 0, centaur: 1 } },
      { text: "Lead by example and inspire transformation", scores: { dragon: 0, phoenix: 2, unicorn: 0, griffin: 1, mermaid: 0, centaur: 0 } },
      { text: "Lead with compassion and understanding", scores: { dragon: 0, phoenix: 0, unicorn: 2, griffin: 0, mermaid: 1, centaur: 0 } },
      { text: "Lead with strength and protect those who follow", scores: { dragon: 1, phoenix: 0, unicorn: 0, griffin: 2, mermaid: 0, centaur: 0 } }
    ]
  },
  {
    question: "What kind of legacy do you hope to leave behind?",
    options: [
      { text: "Timeless knowledge that guides future generations", scores: { dragon: 2, phoenix: 0, unicorn: 0, griffin: 0, mermaid: 0, centaur: 2 } },
      { text: "A story of rebirth and endless renewal", scores: { dragon: 0, phoenix: 3, unicorn: 0, griffin: 0, mermaid: 0, centaur: 0 } },
      { text: "A more harmonious and beautiful world", scores: { dragon: 0, phoenix: 0, unicorn: 1, griffin: 0, mermaid: 2, centaur: 1 } },
      { text: "A legend of bravery that inspires others", scores: { dragon: 1, phoenix: 0, unicorn: 0, griffin: 2, mermaid: 0, centaur: 0 } }
    ]
  }
]

const CREATURES = {
  dragon: {
    name: "Dragon",
    summary: "You are a being of immense power and ancient wisdom. Like the great dragons of old, you command respect through your knowledge and strength. You see the world from a higher perspective and guard the secrets that others can only dream of uncovering.",
    traits: ["Wise", "Powerful", "Ancient", "Strategic", "Commanding"],
    powers: ["Flight", "Fire Breath", "Immense Strength"],
    lore: "Guardians of ancient wisdom, dragons have existed since the dawn of time. They are the keepers of secrets lost to the ages, their scales impervious and their minds sharp as obsidian.",
    quote: "A dragon does not seek battle, but it never flees from one. Wisdom is the fire that burns brightest."
  },
  phoenix: {
    name: "Phoenix",
    summary: "You are a spirit of resilience and radiant transformation. Like the phoenix, you have the extraordinary ability to rise from the ashes of adversity, emerging brighter and stronger than before. Your presence brings hope and renewal to those around you.",
    traits: ["Resilient", "Transformative", "Radiant", "Hopeful", "Eternal"],
    powers: ["Rebirth", "Healing Flame", "Immortality"],
    lore: "Rises from its own ashes, the phoenix is the eternal symbol of hope and renewal. Every ending is merely the beginning of a more brilliant chapter.",
    quote: "From the ashes of what was, I rise as what shall be. Destruction is merely the first breath of creation."
  },
  unicorn: {
    name: "Unicorn",
    summary: "You are a being of pure grace and gentle magic. Like the unicorn, you walk through the world with an unshakable sense of purpose and kindness. Your very presence purifies the space around you, and only those with a pure heart can truly see the wonder you embody.",
    traits: ["Pure", "Graceful", "Magical", "Gentle", "Enchanting"],
    powers: ["Healing Horn", "Purification", "Invisibility"],
    lore: "Only the pure of heart can see them. Unicorns are the embodiment of grace and magic, appearing at times of great need to restore balance and hope.",
    quote: "Purity is not naivety, it is the clearest lens through which to see the truth of the world."
  },
  griffin: {
    name: "Griffin",
    summary: "You are the noble guardian, vigilant and majestic. With the body of a lion and the wings of an eagle, you combine strength with vision. You stand watch over what matters most and strike with precision when the time is right.",
    traits: ["Noble", "Vigilant", "Majestic", "Courageous", "Protective"],
    powers: ["Flight", "Keen Sight", "Guardian Strength"],
    lore: "Protectors of sacred treasures, griffins are the eternal sentinels. Their keen eyes miss nothing and their strength is unmatched in the defense of what they hold dear.",
    quote: "To guard is not to imprison, but to ensure that what is sacred remains safe from those who would defile it."
  },
  mermaid: {
    name: "Mermaid",
    summary: "You are a soul of mystery and fluid grace, moving through life with an enchanting rhythm. Like the mermaid, you navigate the depths of emotion and intuition. Your voice carries a power that can soothe storms or stir the heart.",
    traits: ["Mysterious", "Enchanting", "Fluid", "Intuitive", "Alluring"],
    powers: ["Water Breathing", "Siren Song", "Tide Control"],
    lore: "Dwellers of the deep ocean, mermaids are the guardians of the sea's secrets. Their songs echo through the depths, carrying ancient knowledge and untold power.",
    quote: "The deepest waters hold the greatest mysteries. To know them is to understand the rhythm of the world itself."
  },
  centaur: {
    name: "Centaur",
    summary: "You are a harmonious blend of wisdom and raw nature, equally at home in thought and in the wild. Like the centaur, you see the connections between all living things and teach the ancient knowledge that binds the world together.",
    traits: ["Wise", "Skilled", "Harmonious", "Patient", "Grounded"],
    powers: ["Master Archer", "Nature Connection", "Prophecy"],
    lore: "Teachers of ancient knowledge, centaurs are the bridge between civilization and the wild. They read the stars and the earth with equal clarity.",
    quote: "The bow does not force the arrow; it guides it. True wisdom is knowing when to draw and when to release."
  }
}

const KEYS = Object.keys(CREATURES)

export default function WhichMythicalCreatureAreYou() {
  const [step, setStep] = useState("quiz")
  const [answers, setAnswers] = useState([])
  const [calculating, setCalculating] = useState(false)
  const [result, setResult] = useState(null)

  function handleSelect(optionIndex) {
    const updated = [...answers, optionIndex]
    setAnswers(updated)

    if (updated.length === QUESTIONS.length) {
      setCalculating(true)
      setStep("calculating")
      setTimeout(() => {
        const scores = {}
        for (const k of KEYS) scores[k] = 0

        for (let i = 0; i < QUESTIONS.length; i++) {
          const optIndex = updated[i]
          const optScores = QUESTIONS[i].options[optIndex].scores
          for (const k of KEYS) scores[k] += optScores[k]
        }

        let maxKey = KEYS[0]
        for (const k of KEYS) {
          if (scores[k] > scores[maxKey]) maxKey = k
        }

        setResult(maxKey)
        setCalculating(false)
        setStep("result")
      }, 2000)
    } else {
      setStep("quiz")
    }
  }

  function handleRetake() {
    setStep("quiz")
    setAnswers([])
    setCalculating(false)
    setResult(null)
  }

  const currentIndex = answers.length
  const question = QUESTIONS[currentIndex]
  const progress = (currentIndex / QUESTIONS.length) * 100

  return (
    <div
      style={{
        maxWidth: "640px",
        margin: "0 auto",
        padding: "2rem 1rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "var(--foreground)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Which Mythical Creature Are You?",
            "description": "Discover which mythical creature matches your personality with our fantasy quiz. Find your mythical identity from dragons to phoenixes.",
            "applicationCategory": "QuizApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
          })
        }}
      />

      {step === "calculating" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
            textAlign: "center"
          }}
          role="status"
          aria-live="polite"
        >
          <Sparkles
            size={48}
            style={{
              color: "var(--primary)",
              animation: "altft-spin 1.2s ease-in-out infinite"
            }}
          />
          <p style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>
            Discovering your mythical creature...
          </p>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--muted-foreground)",
              margin: 0
            }}
          >
            Consulting ancient scrolls and reading the stars
          </p>
        </div>
      )}

      {step === "result" && result && (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem"
          }}
        >
          <div
            style={{
              textAlign: "center",
              padding: "2rem 1.5rem",
              borderRadius: "12px",
              background: "var(--card)",
              border: "1px solid var(--border)"
            }}
          >
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                margin: "0 0 0.5rem",
                color: "var(--primary)"
              }}
            >
              {CREATURES[result].name}
            </h2>
            <p
              style={{
                fontSize: "1rem",
                lineHeight: 1.6,
                color: "var(--foreground)",
                margin: 0
              }}
            >
              {CREATURES[result].summary}
            </p>
          </div>

          <div
            style={{
              padding: "1.5rem",
              borderRadius: "12px",
              background: "var(--card)",
              border: "1px solid var(--border)"
            }}
          >
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 0.75rem" }}>
              Traits
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {CREATURES[result].traits.map((t) => (
                <span
                  key={t}
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "9999px",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    background: "var(--primary)",
                    color: "var(--primary-foreground)"
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: "1.5rem",
              borderRadius: "12px",
              background: "var(--card)",
              border: "1px solid var(--border)"
            }}
          >
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 0.75rem" }}>
              Powers
            </h3>
            <ul style={{ margin: 0, paddingLeft: "1.25rem", lineHeight: 1.8 }}>
              {CREATURES[result].powers.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>

          <div
            style={{
              padding: "1.5rem",
              borderRadius: "12px",
              background: "var(--card)",
              border: "1px solid var(--border)",
              fontStyle: "italic"
            }}
          >
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 0.75rem", fontStyle: "normal" }}>
              Lore
            </h3>
            <p style={{ margin: 0, lineHeight: 1.6, color: "var(--muted-foreground)" }}>
              {CREATURES[result].lore}
            </p>
          </div>

          <div
            style={{
              padding: "1.5rem",
              borderRadius: "12px",
              background: "var(--card)",
              border: "1px solid var(--border)",
              textAlign: "center"
            }}
          >
            <p
              style={{
                fontSize: "1rem",
                lineHeight: 1.6,
                fontStyle: "italic",
                margin: 0,
                color: "var(--muted-foreground)"
              }}
            >
              "{CREATURES[result].quote}"
            </p>
          </div>

          <button
            onClick={handleRetake}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "none",
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              alignSelf: "center"
            }}
            onMouseOver={(e) => { e.currentTarget.style.opacity = "0.9" }}
            onMouseOut={(e) => { e.currentTarget.style.opacity = "1" }}
            aria-label="Retake the quiz"
          >
            <RotateCcw size={18} />
            Take the Quiz Again
          </button>
        </div>
      )}

      {step === "quiz" && question && (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div
            style={{
              width: "100%",
              height: "8px",
              borderRadius: "4px",
              background: "var(--border)",
              overflow: "hidden"
            }}
            role="progressbar"
            aria-valuenow={currentIndex}
            aria-valuemin={0}
            aria-valuemax={QUESTIONS.length}
            aria-label={`Question ${currentIndex + 1} of ${QUESTIONS.length}`}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                borderRadius: "4px",
                background: "var(--primary)",
                transition: "width 0.4s ease"
              }}
            />
          </div>

          <p
            style={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--muted-foreground)",
              margin: 0,
              textAlign: "center"
            }}
          >
            Question {currentIndex + 1} of {QUESTIONS.length}
          </p>

          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              margin: 0,
              textAlign: "center",
              lineHeight: 1.4
            }}
          >
            {question.question}
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem"
            }}
          >
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                style={{
                  padding: "1rem 1.25rem",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--foreground)",
                  fontSize: "0.9375rem",
                  lineHeight: 1.4,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "border-color 0.2s, background 0.2s"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "var(--primary)"
                  e.currentTarget.style.background = "color-mix(in srgb, var(--primary) 8%, var(--card))"
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)"
                  e.currentTarget.style.background = "var(--card)"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--primary)"
                  e.currentTarget.style.outline = "2px solid var(--primary)"
                  e.currentTarget.style.outlineOffset = "2px"
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)"
                  e.currentTarget.style.outline = "none"
                }}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes altft-spin {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.15); }
        }
        * { box-sizing: border-box; }
        button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
      `}</style>
    </div>
  )
}
