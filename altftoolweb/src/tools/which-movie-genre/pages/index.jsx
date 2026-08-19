"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Sparkles } from "lucide-react";

const QUESTIONS = [
  {
    question: "Your ideal weekend looks like:",
    options: [
      { text: "Skydiving or mountain hiking", scores: { action: 3, comedy: 0, drama: 0, scifi: 0, romance: 0, thriller: 1 } },
      { text: "A cozy night laughing with close friends", scores: { action: 0, comedy: 3, drama: 1, scifi: 0, romance: 1, thriller: 0 } },
      { text: "Deep conversations over a long dinner", scores: { action: 0, comedy: 0, drama: 3, scifi: 0, romance: 2, thriller: 0 } },
      { text: "Exploring a futuristic city or tech exhibit", scores: { action: 1, comedy: 0, drama: 0, scifi: 3, romance: 0, thriller: 1 } }
    ]
  },
  {
    question: "When you face a problem, you:",
    options: [
      { text: "Charge straight at it with full force", scores: { action: 3, comedy: 0, drama: 1, scifi: 0, romance: 0, thriller: 1 } },
      { text: "Make a joke and find a lighter path", scores: { action: 0, comedy: 3, drama: 0, scifi: 0, romance: 1, thriller: 0 } },
      { text: "Sit with it and reflect deeply", scores: { action: 0, comedy: 0, drama: 3, scifi: 0, romance: 1, thriller: 1 } },
      { text: "Analyze it from every possible angle", scores: { action: 0, comedy: 0, drama: 1, scifi: 2, romance: 0, thriller: 2 } }
    ]
  },
  {
    question: "Your friends would describe you as:",
    options: [
      { text: "Bold and always up for a challenge", scores: { action: 3, comedy: 0, drama: 0, scifi: 1, romance: 0, thriller: 1 } },
      { text: "The one who makes everyone laugh", scores: { action: 0, comedy: 3, drama: 0, scifi: 0, romance: 1, thriller: 0 } },
      { text: "Deep, thoughtful, and a great listener", scores: { action: 0, comedy: 0, drama: 3, scifi: 1, romance: 1, thriller: 0 } },
      { text: "Mysterious and intensely focused", scores: { action: 1, comedy: 0, drama: 0, scifi: 1, romance: 0, thriller: 3 } }
    ]
  },
  {
    question: "Your favorite movie moment is:",
    options: [
      { text: "An epic chase or fight sequence", scores: { action: 3, comedy: 0, drama: 0, scifi: 1, romance: 0, thriller: 1 } },
      { text: "A hilarious misunderstanding gone wrong", scores: { action: 0, comedy: 3, drama: 0, scifi: 0, romance: 1, thriller: 0 } },
      { text: "A powerful emotional confession", scores: { action: 0, comedy: 0, drama: 2, scifi: 0, romance: 2, thriller: 0 } },
      { text: "A shocking plot twist you never saw coming", scores: { action: 1, comedy: 0, drama: 0, scifi: 1, romance: 0, thriller: 3 } }
    ]
  },
  {
    question: "At a social gathering, you are usually:",
    options: [
      { text: "Starting a game or dance-off", scores: { action: 2, comedy: 1, drama: 0, scifi: 0, romance: 1, thriller: 0 } },
      { text: "Telling stories and cracking jokes", scores: { action: 0, comedy: 3, drama: 1, scifi: 0, romance: 0, thriller: 0 } },
      { text: "Having one-on-one deep conversations", scores: { action: 0, comedy: 0, drama: 3, scifi: 0, romance: 1, thriller: 0 } },
      { text: "Observing everyone from a quiet corner", scores: { action: 0, comedy: 0, drama: 1, scifi: 1, romance: 0, thriller: 2 } }
    ]
  },
  {
    question: "Your biggest fear is:",
    options: [
      { text: "A boring, predictable life", scores: { action: 3, comedy: 0, drama: 0, scifi: 1, romance: 0, thriller: 1 } },
      { text: "Losing your sense of humor", scores: { action: 0, comedy: 3, drama: 0, scifi: 0, romance: 1, thriller: 0 } },
      { text: "Never being truly understood", scores: { action: 0, comedy: 0, drama: 3, scifi: 0, romance: 1, thriller: 1 } },
      { text: "Not knowing what is real anymore", scores: { action: 0, comedy: 0, drama: 1, scifi: 2, romance: 0, thriller: 2 } }
    ]
  },
  {
    question: "You are planning a dream vacation. You choose:",
    options: [
      { text: "Skydiving in New Zealand", scores: { action: 3, comedy: 0, drama: 0, scifi: 1, romance: 0, thriller: 0 } },
      { text: "A comedy festival in Montreal", scores: { action: 0, comedy: 3, drama: 0, scifi: 0, romance: 1, thriller: 0 } },
      { text: "A quiet countryside retreat", scores: { action: 0, comedy: 0, drama: 2, scifi: 0, romance: 2, thriller: 0 } },
      { text: "A futuristic city like Tokyo", scores: { action: 0, comedy: 0, drama: 0, scifi: 3, romance: 0, thriller: 1 } }
    ]
  },
  {
    question: "Your ideal date involves:",
    options: [
      { text: "Something adrenaline-pumping like rock climbing", scores: { action: 3, comedy: 0, drama: 0, scifi: 0, romance: 1, thriller: 0 } },
      { text: "A comedy show or improv night", scores: { action: 0, comedy: 3, drama: 0, scifi: 0, romance: 1, thriller: 0 } },
      { text: "A long walk with deep conversation", scores: { action: 0, comedy: 0, drama: 2, scifi: 0, romance: 2, thriller: 0 } },
      { text: "A suspenseful movie that keeps you on edge", scores: { action: 0, comedy: 0, drama: 0, scifi: 0, romance: 1, thriller: 3 } }
    ]
  },
  {
    question: "When you hear about a new trend, you:",
    options: [
      { text: "Jump in headfirst without hesitation", scores: { action: 3, comedy: 0, drama: 0, scifi: 1, romance: 0, thriller: 1 } },
      { text: "Turn it into a funny joke immediately", scores: { action: 0, comedy: 3, drama: 0, scifi: 0, romance: 1, thriller: 0 } },
      { text: "Reflect on whether it holds real meaning", scores: { action: 0, comedy: 0, drama: 3, scifi: 0, romance: 1, thriller: 0 } },
      { text: "Analyze how it will change the world", scores: { action: 0, comedy: 0, drama: 0, scifi: 3, romance: 0, thriller: 2 } }
    ]
  },
  {
    question: "The superpower you would choose is:",
    options: [
      { text: "Super strength or incredible speed", scores: { action: 3, comedy: 0, drama: 0, scifi: 1, romance: 0, thriller: 0 } },
      { text: "The ability to make anyone laugh", scores: { action: 0, comedy: 3, drama: 0, scifi: 0, romance: 1, thriller: 0 } },
      { text: "Empathy to feel what others feel", scores: { action: 0, comedy: 0, drama: 2, scifi: 0, romance: 2, thriller: 0 } },
      { text: "Telepathy or the power to bend time", scores: { action: 0, comedy: 0, drama: 0, scifi: 2, romance: 0, thriller: 2 } }
    ]
  }
];

const GENRES = {
  action: {
    name: "Action",
    summary: "You are a thrill-seeker who charges through life with unstoppable energy. You take risks that leave others breathless and turn every challenge into an adventure.",
    vibe: "High-octane energy",
    traits: ["Bold", "Energetic", "Adventurous", "Fearless"],
    famousMovies: ["Die Hard", "Mad Max: Fury Road", "The Dark Knight"],
    quote: "Yippee-ki-yay, every day is a mission."
  },
  comedy: {
    name: "Comedy",
    summary: "You are the light in every room, turning mundane moments into unforgettable memories with your wit. Life is too short to take seriously, and you know it.",
    vibe: "Laughter is the best medicine",
    traits: ["Witty", "Light-hearted", "Joyful", "Charming"],
    famousMovies: ["Superbad", "The Grand Budapest Hotel", "Bridesmaids"],
    quote: "I am not crazy; my reality is just different from yours."
  },
  drama: {
    name: "Drama",
    summary: "You feel everything deeply and see the beauty in life's most complex moments. Your empathy and introspection make you a natural storyteller and a trusted confidant.",
    vibe: "Life's beautiful complexity",
    traits: ["Emotional", "Thoughtful", "Introspective", "Empathetic"],
    famousMovies: ["The Shawshank Redemption", "Forrest Gump", "Moonlight"],
    quote: "Life is like a box of chocolates; you never know what you are gonna get."
  },
  scifi: {
    name: "Sci-Fi",
    summary: "Your mind is always reaching beyond the stars, questioning reality and imagining what could be. You are driven by curiosity and a vision of the future.",
    vibe: "What if...?",
    traits: ["Imaginative", "Curious", "Analytical", "Futuristic"],
    famousMovies: ["Blade Runner 2049", "Interstellar", "The Matrix"],
    quote: "Unfortunately, no one can be told what the Matrix is. You have to see it for yourself."
  },
  romance: {
    name: "Romance",
    summary: "You believe in grand gestures, soul connections, and the power of love to change everything. Your heart leads the way, and you are never afraid to show it.",
    vibe: "Love conquers all",
    traits: ["Passionate", "Idealistic", "Heartfelt", "Devoted"],
    famousMovies: ["Pride and Prejudice", "Before Sunrise", "La La Land"],
    quote: "I wish I knew how to quit you."
  },
  thriller: {
    name: "Thriller",
    summary: "You live in the shadows of suspense, always three steps ahead and never taking anything at face value. Your sharp instincts and intense focus keep everyone guessing.",
    vibe: "Keep guessing",
    traits: ["Suspenseful", "Intense", "Sharp", "Calculating"],
    famousMovies: ["Se7en", "Gone Girl", "Parasite"],
    quote: "What is in the box? The truth is always more twisted than you imagine."
  }
};

export default function WhichMovieGenrePage() {
  const [step, setStep] = useState("quiz");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const resultTimeoutRef = useRef(null);

  const totalQuestions = QUESTIONS.length;
  const progress = ((currentQuestion) / totalQuestions) * 100;

  useEffect(() => {
    return () => {
      if (resultTimeoutRef.current) {
        clearTimeout(resultTimeoutRef.current);
      }
    };
  }, []);

  function handleSelect(optionIndex) {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion + 1 < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCalculating(true);
      resultTimeoutRef.current = setTimeout(() => {
        const finalResult = computeResult(newAnswers);
        setResult(finalResult);
        setCalculating(false);
        setStep("result");
        resultTimeoutRef.current = null;
      }, 2000);
    }
  }

  function computeResult(answerIndices) {
    const scores = { action: 0, comedy: 0, drama: 0, scifi: 0, romance: 0, thriller: 0 };
    for (let i = 0; i < answerIndices.length; i++) {
      const option = QUESTIONS[i].options[answerIndices[i]];
      for (const key of Object.keys(scores)) {
        scores[key] += option.scores[key];
      }
    }

    let maxGenre = "action";
    let maxScore = 0;
    for (const key of Object.keys(scores)) {
      if (scores[key] > maxScore) {
        maxScore = scores[key];
        maxGenre = key;
      }
    }

    return { genre: maxGenre, ...GENRES[maxGenre], scores };
  }

  function handleRetake() {
    setStep("quiz");
    setCurrentQuestion(0);
    setAnswers([]);
    setCalculating(false);
    setResult(null);
  }

  if (step === "result" && result) {
    return (
      <div style={styles.wrapper}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Which Movie Genre Matches Your Life?",
              "description": "Discover which movie genre represents your life story with our fun personality quiz. Find your cinematic match from action to romance.",
              "applicationCategory": "QuizApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        <div style={styles.container}>
          <div style={styles.resultCard} role="status" aria-live="polite">
            <div style={styles.resultHeader}>
              <Sparkles style={styles.resultIcon} />
              <h2 style={styles.resultTitle}>Your Genre Is {result.name}</h2>
            </div>

            <div style={styles.vibeBadge}>
              {result.vibe}
            </div>

            <p style={styles.summary}>{result.summary}</p>

            <div style={styles.traitsContainer}>
              <h3 style={styles.sectionTitle}>Traits</h3>
              <div style={styles.traitsList}>
                {result.traits.map((trait, i) => (
                  <span key={i} style={styles.trait}>{trait}</span>
                ))}
              </div>
            </div>

            <div style={styles.moviesContainer}>
              <h3 style={styles.sectionTitle}>Famous Movies</h3>
              <ul style={styles.moviesList}>
                {result.famousMovies.map((movie, i) => (
                  <li key={i} style={styles.movieItem}>{movie}</li>
                ))}
              </ul>
            </div>

            <div style={styles.quoteContainer}>
              <p style={styles.quoteText}>"{result.quote}"</p>
            </div>

            <button
              onClick={handleRetake}
              style={styles.retakeButton}
              onFocus={(e) => {
                e.currentTarget.style.outline = "2px solid var(--primary)";
                e.currentTarget.style.outlineOffset = "2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
              }}
            >
              <RotateCcw size={18} />
              <span>Take the Quiz Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (calculating) {
    return (
      <div style={styles.wrapper}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Which Movie Genre Matches Your Life?",
              "description": "Discover which movie genre represents your life story with our fun personality quiz. Find your cinematic match from action to romance.",
              "applicationCategory": "QuizApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        <div style={styles.container}>
          <div style={styles.calculatingCard} role="status" aria-live="polite">
            <div style={styles.calculatingAnimation}>
              <Sparkles style={styles.calculatingIcon} />
            </div>
            <h2 style={styles.calculatingTitle}>Analyzing your answers...</h2>
            <p style={styles.calculatingSub}>Finding the perfect genre match for your life</p>
          </div>
        </div>
      </div>
    );
  }

  const question = QUESTIONS[currentQuestion];

  return (
    <div style={styles.wrapper}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Which Movie Genre Matches Your Life?",
            "description": "Discover which movie genre represents your life story with our fun personality quiz. Find your cinematic match from action to romance.",
            "applicationCategory": "QuizApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
          })
        }}
      />
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>Which Movie Genre Matches Your Life?</h1>
            <p style={styles.subtitle}>Answer 10 questions to discover your movie genre alter ego</p>
          </div>

          <div style={styles.progressContainer}>
            <div
              style={styles.progressBar}
              role="progressbar"
              aria-valuenow={currentQuestion}
              aria-valuemin={0}
              aria-valuemax={totalQuestions}
              aria-label="Quiz progress"
            >
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
            <span style={styles.progressText}>{currentQuestion + 1} of {totalQuestions}</span>
          </div>

          <div style={styles.questionArea}>
            <h2 style={styles.questionText}>{question.question}</h2>

            <div style={styles.optionsGrid}>
              {question.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  style={styles.optionButton}
                  aria-label={option.text}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = "2px solid var(--primary)";
                    e.currentTarget.style.outlineOffset = "2px";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = "none";
                  }}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    backgroundColor: "var(--background)"
  },
  container: {
    width: "100%",
    maxWidth: "640px",
    margin: "0 auto"
  },
  card: {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
  },
  header: {
    textAlign: "center",
    marginBottom: "1.5rem"
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "var(--foreground)",
    margin: "0 0 0.5rem 0",
    lineHeight: "1.3"
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "var(--muted-foreground)",
    margin: "0"
  },
  progressContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1.5rem"
  },
  progressBar: {
    flex: "1",
    height: "8px",
    backgroundColor: "var(--border)",
    borderRadius: "4px",
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    backgroundColor: "var(--primary)",
    borderRadius: "4px",
    transition: "width 0.3s ease"
  },
  progressText: {
    fontSize: "0.8rem",
    color: "var(--muted-foreground)",
    whiteSpace: "nowrap"
  },
  questionArea: {
    marginTop: "0.5rem"
  },
  questionText: {
    fontSize: "1.15rem",
    fontWeight: "600",
    color: "var(--foreground)",
    margin: "0 0 1.25rem 0",
    lineHeight: "1.4"
  },
  optionsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem"
  },
  optionButton: {
    width: "100%",
    padding: "0.875rem 1.25rem",
    fontSize: "0.95rem",
    fontWeight: "500",
    textAlign: "left",
    color: "var(--foreground)",
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
    lineHeight: "1.4"
  },
  calculatingCard: {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "3rem 2rem",
    textAlign: "center",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
  },
  calculatingAnimation: {
    marginBottom: "1rem"
  },
  calculatingIcon: {
    width: "40px",
    height: "40px",
    color: "var(--primary)",
    animation: "spin 1s linear infinite"
  },
  calculatingTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "var(--foreground)",
    margin: "0 0 0.5rem 0"
  },
  calculatingSub: {
    fontSize: "0.9rem",
    color: "var(--muted-foreground)",
    margin: "0"
  },
  resultCard: {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    textAlign: "center"
  },
  resultHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    marginBottom: "1rem"
  },
  resultIcon: {
    width: "28px",
    height: "28px",
    color: "var(--primary)"
  },
  resultTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "var(--foreground)",
    margin: "0"
  },
  vibeBadge: {
    display: "inline-block",
    padding: "0.35rem 1rem",
    backgroundColor: "var(--primary)",
    color: "#fff",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
    marginBottom: "1.25rem"
  },
  summary: {
    fontSize: "1rem",
    color: "var(--muted-foreground)",
    lineHeight: "1.6",
    margin: "0 0 1.5rem 0",
    textAlign: "left"
  },
  sectionTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "var(--foreground)",
    margin: "0 0 0.5rem 0"
  },
  traitsContainer: {
    marginBottom: "1.5rem",
    textAlign: "left"
  },
  traitsList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem"
  },
  trait: {
    padding: "0.3rem 0.75rem",
    backgroundColor: "var(--background)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: "500",
    color: "var(--foreground)"
  },
  moviesContainer: {
    marginBottom: "1.5rem",
    textAlign: "left"
  },
  moviesList: {
    listStyle: "none",
    padding: "0",
    margin: "0"
  },
  movieItem: {
    padding: "0.4rem 0",
    fontSize: "0.95rem",
    color: "var(--foreground)",
    borderBottom: "1px solid var(--border)"
  },
  quoteContainer: {
    backgroundColor: "var(--background)",
    borderLeft: "3px solid var(--primary)",
    borderRadius: "6px",
    padding: "1rem 1.25rem",
    marginBottom: "1.5rem",
    textAlign: "left"
  },
  quoteText: {
    fontSize: "0.95rem",
    fontStyle: "italic",
    color: "var(--muted-foreground)",
    margin: "0",
    lineHeight: "1.5"
  },
  retakeButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "var(--primary)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "opacity 0.2s ease",
    outline: "none"
  }
};
