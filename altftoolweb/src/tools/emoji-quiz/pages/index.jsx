"use client";

import React, { useState, useCallback } from "react";
import { Puzzle, RefreshCw, Trophy, Check, X, Lightbulb } from "lucide-react";

const QUESTIONS = [
  { emoji: "🎬🍿", answer: "movie night", category: "Activity", hint: "Watch a film with snacks" },
  { emoji: "🌞🏖️🌊", answer: "beach day", category: "Activity", hint: "Sun, sand, and waves" },
  { emoji: "🎂🎉🎈", answer: "birthday party", category: "Event", hint: "Celebration with cake" },
  { emoji: "💻☕🌙", answer: "late night coding", category: "Activity", hint: "Programming after dark" },
  { emoji: "🏀🔥🏆", answer: "basketball game", category: "Sport", hint: "Ball sport with hoops" },
  { emoji: "❤️💔😢", answer: "broken heart", category: "Emotion", hint: "Sad after a breakup" },
  { emoji: "🌧️☔😞", answer: "rainy day", category: "Weather", hint: "Wet and gloomy" },
  { emoji: "🚀🌌✨", answer: "space travel", category: "Concept", hint: "Journey beyond Earth" },
  { emoji: "📚🎓📝", answer: "exam time", category: "Event", hint: "Studying and tests" },
  { emoji: "🍕🎮👾", answer: "gaming night", category: "Activity", hint: "Video games and food" },
  { emoji: "🌈🦄✨", answer: "magical world", category: "Concept", hint: "Fantasy and wonder" },
  { emoji: "⚽😴💤", answer: "boring match", category: "Sport", hint: "A dull game" },
  { emoji: "💍💑💕", answer: "wedding day", category: "Event", hint: "Two people unite" },
  { emoji: "🐱📦📦", answer: "cat in box", category: "Animal", hint: "Feline loves containers" },
  { emoji: "🌮🌮🌮", answer: "taco tuesday", category: "Food", hint: "Mexican food day" },
  { emoji: "🎵🎤🎸", answer: "karaoke night", category: "Activity", hint: "Sing along with friends" },
  { emoji: "🏔️🥾🌲", answer: "mountain hike", category: "Activity", hint: "Climb a peak" },
  { emoji: "🍔🍟🥤", answer: "fast food", category: "Food", hint: "Quick meal combo" },
  { emoji: "🌟⭐🌟", answer: "star rating", category: "Concept", hint: "Review score" },
  { emoji: "🐶🦴😋", answer: "dog treat", category: "Animal", hint: "Puppy snack" },
];

export default function ToolHome() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [answered, setAnswered] = useState(false);
  // Mirrors usedIndices.current.size so render never reads the ref.
  const [questionCount, setQuestionCount] = useState(0);
  const usedIndices = React.useRef(new Set());

  const nextQuestion = useCallback(() => {
    if (usedIndices.current.size >= QUESTIONS.length) {
      setGameOver(true);
      return;
    }
    let idx;
    do {
      idx = Math.floor(Math.random() * QUESTIONS.length);
    } while (usedIndices.current.has(idx));
    usedIndices.current.add(idx);
    setQuestionCount(usedIndices.current.size);
    setCurrentIndex(idx);
    setUserAnswer("");
    setFeedback(null);
    setShowHint(false);
    setAnswered(false);
  }, []);

  React.useEffect(() => {
    nextQuestion();
  }, []);

  const normalize = (str) => str.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "");

  const submitAnswer = useCallback(() => {
    if (answered) return;
    const current = QUESTIONS[currentIndex];
    const isCorrect = normalize(userAnswer) === normalize(current.answer) ||
      normalize(userAnswer).includes(normalize(current.answer)) ||
      normalize(current.answer).includes(normalize(userAnswer));

    setAnswered(true);
    if (isCorrect) {
      setScore((s) => s + 10 + streak * 2);
      setStreak((st) => st + 1);
      setFeedback({ correct: true, message: "Correct! 🎉" });
    } else {
      setStreak(0);
      setFeedback({ correct: false, message: `Wrong! The answer was "${current.answer}"` });
    }
  }, [userAnswer, currentIndex, streak, answered]);

  const restart = () => {
    usedIndices.current = new Set();
    setQuestionCount(0);
    setScore(0);
    setStreak(0);
    setGameOver(false);
    nextQuestion();
  };

  if (gameOver) {
    return (
      <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-2xl">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl border-2 border-(--border) bg-(--card) p-8 text-center shadow-lg">
            <Trophy className="mx-auto mb-3 h-12 w-12 text-(--primary)" />
            <p className="text-3xl font-black text-(--foreground)">Quiz Complete!</p>
            <p className="mt-2 text-lg font-semibold text-(--primary)">Final Score: {score}</p>
            <p className="text-sm text-(--muted-foreground)">You answered {Math.min(questionCount, QUESTIONS.length)} questions</p>
            <button onClick={restart} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-(--primary) px-6 py-3 text-base font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]">
              <RefreshCw className="h-5 w-5" /> Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const current = QUESTIONS[currentIndex];

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--primary)">
            <Puzzle className="h-4 w-4" /> Emoji Puzzle
          </div>
          <h1 className="text-4xl font-bold text-(--foreground)">Emoji Quiz</h1>
          <p className="mt-2 text-(--muted-foreground)">Guess the word or phrase from the emoji clues!</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-(--primary)">{score}</p>
            <p className="text-xs uppercase text-(--muted-foreground)">Score</p>
          </div>
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-(--primary)">{streak}</p>
            <p className="text-xs uppercase text-(--muted-foreground)">Streak</p>
          </div>
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-(--primary)">#{questionCount + 1}</p>
            <p className="text-xs uppercase text-(--muted-foreground)">Question</p>
          </div>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
          <p className="mb-4 text-center text-sm font-semibold text-(--muted-foreground)">What does this mean?</p>
          <div className="mb-6 flex justify-center gap-2 text-5xl">
            {current.emoji.split("").map((e, i) => (
              <span key={i} className="animate-in zoom-in-50">{e}</span>
            ))}
          </div>

          <input type="text" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !answered && submitAnswer()} placeholder="Type your answer..." disabled={answered} className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-center text-lg font-semibold text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30 disabled:opacity-50" />

          <div className="mt-4 flex gap-3">
            {!answered ? (
              <>
                <button onClick={submitAnswer} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-(--primary) px-4 py-3 text-base font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]">
                  <Check className="h-5 w-5" /> Submit
                </button>
                <button onClick={() => setShowHint(!showHint)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-base font-semibold text-(--muted-foreground) transition-all hover:border-(--primary)">
                  <Lightbulb className="h-5 w-5" />
                </button>
              </>
            ) : (
              <button onClick={nextQuestion} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-(--primary) px-4 py-3 text-base font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]">
                Next →
              </button>
            )}
          </div>

          {showHint && !answered && (
            <div className="mt-3 rounded-xl bg-(--muted) p-3 text-center text-sm font-semibold text-(--primary)">
              💡 Hint: {current.hint}
            </div>
          )}

          {feedback && (
            <div className={`mt-4 animate-in fade-in rounded-xl p-3 text-center text-sm font-bold ${feedback.correct ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
              {feedback.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
