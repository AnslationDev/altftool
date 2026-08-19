"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Sparkles, RotateCcw, Trophy,
  MessageCircle, Camera, MapPinned, Gamepad2, Smile,
} from "lucide-react";

// Fisher-Yates shuffle so every question in a category's 15-question pool is
// reachable across replays, instead of a fixed hash order always producing
// the same top 10 (see wave-53 audit finding: 30 of 90 questions were
// permanently unreachable).
function shuffleQuestions(pool) {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const CATEGORIES = [
  { id: "memories", label: "Memories", icon: Camera, color: "text-(--info)" },
  { id: "personality", label: "Personality", icon: Smile, color: "text-(--accent)" },
  { id: "experiences", label: "Experiences", icon: MapPinned, color: "text-(--success)" },
  { id: "preferences", label: "Preferences", icon: Heart, color: "text-(--danger)" },
  { id: "fun", label: "Fun", icon: Gamepad2, color: "text-(--warning)" },
  { id: "deep", label: "Deep Talks", icon: MessageCircle, color: "text-(--secondary)" },
];

const QUESTIONS = {
  memories: [
    { q: "What's your first memory of me?", a: null },
    { q: "What's the funniest thing we've done together?", a: null },
    { q: "Where did we first meet?", a: null },
    { q: "What's our inside joke?", a: null },
    { q: "What's the best trip we've taken together?", a: null },
    { q: "What's a moment we shared that you'll never forget?", a: null },
    { q: "What song reminds you of us?", a: null },
    { q: "What's the craziest thing we've done together?", a: null },
    { q: "What's our favorite shared memory?", a: null },
    { q: "What's the most we've ever laughed together?", a: null },
    { q: "What's a memory of us that always makes you smile?", a: null },
    { q: "What was the best party we attended together?", a: null },
    { q: "What's the most thoughtful thing I've done for you?", a: null },
    { q: "What's our tradition that you love?", a: null },
    { q: "What's a small moment between us that meant a lot?", a: null },
  ],
  personality: [
    { q: "What's my best quality?", a: null },
    { q: "What's something about me that annoys you?", a: null },
    { q: "What's my biggest strength?", a: null },
    { q: "What's something most people don't know about me?", a: null },
    { q: "What's my toxic trait?", a: null },
    { q: "What am I most passionate about?", a: null },
    { q: "What's my signature style?", a: null },
    { q: "What's my love language?", a: null },
    { q: "What's something you admire about me?", a: null },
    { q: "What's my hidden talent?", a: null },
    { q: "How would you describe my personality in 3 words?", a: null },
    { q: "What's my biggest insecurity?", a: null },
    { q: "What makes me unique?", a: null },
    { q: "What's something I need to work on?", a: null },
    { q: "What's my most recognizable habit?", a: null },
  ],
  experiences: [
    { q: "What's the biggest challenge we've overcome together?", a: null },
    { q: "What's the best advice I've given you?", a: null },
    { q: "What's a difficult time when I was there for you?", a: null },
    { q: "What's the most fun we've had in a single day?", a: null },
    { q: "What's a time we stayed up all night talking?", a: null },
    { q: "What's our best adventure together?", a: null },
    { q: "What's a time we got into trouble together?", a: null },
    { q: "What's the most spontaneous thing we've done?", a: null },
    { q: "What's a time we made a bad decision together?", a: null },
    { q: "What's the longest we've gone without talking?", a: null },
    { q: "What's a moment when you really needed me and I was there?", a: null },
    { q: "What's the best celebration we've had together?", a: null },
    { q: "What's a time we laughed so hard we cried?", a: null },
    { q: "What's something we've been through that made us closer?", a: null },
    { q: "What's our greatest accomplishment as friends?", a: null },
  ],
  preferences: [
    { q: "What's my favorite food?", a: null },
    { q: "What's my favorite movie?", a: null },
    { q: "What's my favorite music genre?", a: null },
    { q: "What's my ideal weekend?", a: null },
    { q: "What's my favorite drink?", a: null },
    { q: "What's my go-to comfort food?", a: null },
    { q: "What's my favorite book or author?", a: null },
    { q: "What's my dream destination?", a: null },
    { q: "What's my favorite season?", a: null },
    { q: "What's my coffee order?", a: null },
    { q: "What's my favorite holiday?", a: null },
    { q: "What's my favorite way to relax?", a: null },
    { q: "What's my preferred social activity?", a: null },
    { q: "What's my favorite type of cuisine?", a: null },
    { q: "What's my guilty pleasure?", a: null },
  ],
  fun: [
    { q: "If our friendship was a movie, what would the title be?", a: null },
    { q: "What celebrity do I look like?", a: null },
    { q: "If I was an animal, what would I be?", a: null },
    { q: "What would my superpower be?", a: null },
    { q: "What's our friendship theme song?", a: null },
    { q: "If we started a band, what would we be called?", a: null },
    { q: "What's the weirdest thing I'm obsessed with?", a: null },
    { q: "What internet rabbit hole would I fall into?", a: null },
    { q: "If I was a meme, which one would I be?", a: null },
    { q: "What fictional character am I most like?", a: null },
    { q: "What would my catchphrase be?", a: null },
    { q: "If we were a reality show, what would it be about?", a: null },
    { q: "What's the most 'me' thing I could say right now?", a: null },
    { q: "What's my spirit animal?", a: null },
    { q: "What's my hidden superpower?", a: null },
  ],
  deep: [
    { q: "How has our friendship changed you?", a: null },
    { q: "What's something you've always wanted to tell me?", a: null },
    { q: "What's the most important thing I've taught you?", a: null },
    { q: "How do I make you feel?", a: null },
    { q: "What's something you wish we talked about more?", a: null },
    { q: "What's the hardest conversation we've had?", a: null },
    { q: "What does our friendship mean to you?", a: null },
    { q: "What's a boundary you've appreciated in our friendship?", a: null },
    { q: "What's something you forgive me for?", a: null },
    { q: "What's something you hope never changes about us?", a: null },
    { q: "What's a fear you have about our friendship?", a: null },
    { q: "What's the deepest conversation we've ever had?", a: null },
    { q: "What's something you think I don't understand about you?", a: null },
    { q: "How do I show up for you in ways you value?", a: null },
    { q: "What's something you want for my future?", a: null },
  ],
};

export default function ToolHome() {
  const [category, setCategory] = useState("memories");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [score, setScore] = useState(0);

  const startGame = useCallback(() => {
    const pool = QUESTIONS[category] || QUESTIONS.memories;
    setQuestions(shuffleQuestions(pool).slice(0, 10));
    setCurrentIndex(0);
    setAnswers({});
    setInputValue("");
    setGameStarted(true);
    setGameFinished(false);
    setScore(0);
  }, [category]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;

  const finishGame = useCallback((finalAnswers) => {
    setGameFinished(true);
    const answeredCount = Object.keys(finalAnswers).length;
    setScore(questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0);
  }, [questions.length]);

  const submitAnswer = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const nextAnswers = { ...answers, [currentQuestion.q]: trimmed };
    setAnswers(nextAnswers);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setInputValue("");
    } else {
      finishGame(nextAnswers);
    }
  }, [inputValue, currentIndex, currentQuestion, questions.length, answers, finishGame]);

  const skipQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setInputValue("");
    } else {
      finishGame(answers);
    }
  }, [currentIndex, questions.length, answers, finishGame]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submitAnswer();
      }
    },
    [submitAnswer]
  );

  const playAgain = useCallback(() => {
    setGameStarted(false);
    setGameFinished(false);
    setCurrentIndex(0);
    setAnswers({});
    setInputValue("");
  }, []);

  const getScoreLevel = (s) => {
    if (s >= 90) return { label: "Best Friends Forever!", color: "text-(--warning)", emoji: "🏆" };
    if (s >= 70) return { label: "Great Friends!", color: "text-(--success)", emoji: "🌟" };
    if (s >= 50) return { label: "Good Friends", color: "text-(--info)", emoji: "👍" };
    return { label: "Getting to Know", color: "text-(--muted-foreground)", emoji: "🤝" };
  };

  if (gameFinished) {
    const level = getScoreLevel(score);
    return (
      <div className="min-h-screen bg-(--background)">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-(--card) border-2 border-(--primary) p-8 text-center space-y-6"
            aria-live="polite"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-(--primary)/10 text-(--primary)">
              <Trophy size="40" />
            </div>
            <h2 className="text-3xl font-bold text-(--foreground)">Challenge Complete!</h2>
            <div>
              <p className="text-5xl font-bold text-(--primary)">{score}%</p>
              <p className={`text-lg font-semibold mt-1 ${level.color}`}>{level.emoji} {level.label}</p>
            </div>

            <div className="rounded-xl bg-(--muted) p-4 text-left space-y-2">
              <h3 className="text-sm font-semibold text-(--foreground) mb-2">Your Answers</h3>
              {questions.map((q, i) => (
                <div key={i} className="border-b border-(--border) last:border-0 pb-2 last:pb-0 mb-2 last:mb-0">
                  <p className="text-xs text-(--muted-foreground)">{q.q}</p>
                  <p className="text-sm font-medium text-(--foreground)">{answers[q.q] || "—"}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={playAgain} className="flex-1 py-3 rounded-xl bg-(--primary) text-(--primary-foreground) font-bold hover:opacity-90 transition flex items-center justify-center gap-2">
                <RotateCcw size="18" /> Play Again
              </button>
              <button onClick={() => { setGameStarted(false); setGameFinished(false); }} className="flex-1 py-3 rounded-xl bg-(--muted) text-(--foreground) font-bold hover:bg-(--border) transition">
                New Challenge
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (gameStarted && currentQuestion) {
    return (
      <div className="min-h-screen bg-(--background)">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-(--foreground)">Friendship Challenge</h1>
            <span
              className="text-sm text-(--muted-foreground) bg-(--muted) px-3 py-1 rounded-full"
              aria-live="polite"
            >
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-(--muted) overflow-hidden">
            <motion.div
              className="h-full bg-(--primary) rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="rounded-2xl bg-(--card) border border-(--border) p-8 text-center space-y-6"
            aria-live="polite"
          >
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase mb-2 bg-(--primary)/10 text-(--primary)">
              {CATEGORIES.find((c) => c.id === category)?.label || category}
            </div>
            <p className="text-2xl font-semibold text-(--foreground) leading-relaxed">{currentQuestion.q}</p>

            <div className="space-y-3">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer..."
                aria-label={`Your answer to: ${currentQuestion.q}`}
                className="w-full px-4 py-3 rounded-xl bg-(--muted) border border-(--border) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary) text-sm resize-none"
                rows="3"
              />
              <div className="flex gap-2">
                <button
                  onClick={submitAnswer}
                  disabled={!inputValue.trim()}
                  className="flex-1 py-3.5 rounded-xl bg-(--primary) text-(--primary-foreground) font-bold hover:opacity-90 disabled:opacity-40 transition shadow-lg shadow-(--primary)/20 text-lg"
                >
                  {currentIndex < questions.length - 1 ? "Next Question" : "Finish Challenge"}
                </button>
                <button
                  onClick={skipQuestion}
                  className="px-5 py-3.5 rounded-xl bg-(--muted) text-(--foreground) font-semibold hover:bg-(--border) transition text-sm"
                >
                  Skip
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="rounded-2xl bg-(--card) border border-(--border) p-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-(--primary)/10 text-(--primary)">
            <Heart size="40" />
          </div>
          <h1 className="text-3xl font-bold text-(--foreground)">Friendship Challenge</h1>
          <p className="text-(--muted-foreground)">Answer questions about your friendship and see how well you know each other</p>

          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition flex items-center gap-1 ${
                  category === c.id
                    ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                    : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--primary)"
                }`}
              >
                <c.icon size="12" className={c.color} />
                {c.label}
              </button>
            ))}
          </div>

          <button
            onClick={startGame}
            className="w-full py-4 rounded-2xl bg-(--primary) text-(--primary-foreground) font-bold text-lg hover:opacity-90 transition shadow-lg shadow-(--primary)/20 flex items-center justify-center gap-2"
          >
            <Sparkles size="20" /> Start Challenge
          </button>
        </div>
      </div>
    </div>
  );
}
