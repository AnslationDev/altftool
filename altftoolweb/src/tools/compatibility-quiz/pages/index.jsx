"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, RotateCcw, Heart, Star, Trophy,
  Smile, Brain, Coffee, Globe, Briefcase,
} from "lucide-react";

const CATEGORIES = [
  { id: "romance", label: "Romance", icon: Heart, color: "text-rose-500", desc: "Love and relationship compatibility" },
  { id: "friendship", label: "Friendship", icon: Smile, color: "text-blue-500", desc: "Best friend compatibility" },
  { id: "lifestyle", label: "Lifestyle", icon: Coffee, color: "text-emerald-500", desc: "Daily habits and routines" },
  { id: "intellectual", label: "Intellectual", icon: Brain, color: "text-purple-500", desc: "Ideas and conversations" },
  { id: "travel", label: "Travel", icon: Globe, color: "text-cyan-500", desc: "Travel and adventure styles" },
  { id: "career", label: "Career", icon: Briefcase, color: "text-amber-500", desc: "Work and ambition alignment" },
];

const QUIZ_DATA = {
  romance: {
    questions: [
      { q: "How important is physical affection in a relationship?", options: ["Essential", "Very Important", "Somewhat", "Not Important"] },
      { q: "How do you handle disagreements in a relationship?", options: ["Talk it out calmly", "Need space first", "Compromise quickly", "Avoid conflict"] },
      { q: "What's your ideal date night?", options: ["Fancy dinner", "Movie at home", "Outdoor adventure", "Try something new"] },
      { q: "How often do you like to go out together?", options: ["Every day", "Few times a week", "Weekends", "Occasionally"] },
      { q: "What's your love language?", options: ["Words of affirmation", "Quality time", "Physical touch", "Acts of service"] },
      { q: "How important is independence in a relationship?", options: ["Very important", "Moderately", "Less important", "Not important"] },
      { q: "How do you show you care?", options: ["Surprises and gifts", "Being present", "Helping out", "Words of encouragement"] },
      { q: "What's your ideal relationship pace?", options: ["Slow and steady", "Fast and intense", "Natural flow", "Take it day by day"] },
      { q: "How important is sharing hobbies?", options: ["Essential", "Nice to have", "Not important", "Prefer separate hobbies"] },
      { q: "What's your conflict resolution style?", options: ["Direct communication", "Reflect then talk", "Seek compromise", "Let things cool down"] },
    ],
    scoring: [
      { answer: 0, weight: [10, 8, 5, 3] },
      { answer: 1, weight: [8, 10, 7, 4] },
      { answer: 2, weight: [5, 7, 10, 6] },
      { answer: 3, weight: [3, 5, 6, 10] },
      { answer: 0, weight: [10, 8, 7, 5] },
      { answer: 1, weight: [8, 10, 6, 4] },
      { answer: 2, weight: [7, 9, 8, 6] },
      { answer: 3, weight: [6, 7, 9, 10] },
      { answer: 0, weight: [9, 7, 5, 4] },
      { answer: 1, weight: [8, 10, 7, 5] },
    ],
  },
  friendship: {
    questions: [
      { q: "How often do you like to hang out with friends?", options: ["Daily", "Weekly", "Monthly", "Occasionally"] },
      { q: "What's your ideal friend group size?", options: ["2-3 close friends", "Small group of 5", "Large group", "One best friend"] },
      { q: "How do you prefer to communicate?", options: ["Text/Chat", "Phone calls", "In person", "Social media"] },
      { q: "What do you value most in a friend?", options: ["Loyalty", "Honesty", "Sense of humor", "Reliability"] },
      { q: "How do you handle conflict with a friend?", options: ["Address it directly", "Give it time", "Talk it out", "Let it go"] },
      { q: "What's your ideal hangout?", options: ["Coffee/Cafe", "Outdoor activity", "Netflix/Chill", "Night out"] },
      { q: "How important is sharing interests?", options: ["Very important", "Somewhat", "Not important", "Prefer different interests"] },
      { q: "How do you support a friend in need?", options: ["Listen actively", "Give advice", "Be present", "Help practically"] },
      { q: "What's your friendship pet peeve?", options: ["Being late", "Canceling plans", "One-sided effort", "Gossip"] },
      { q: "How do you celebrate friends' achievements?", options: ["Throw a party", "Personal message", "Small gift", "Social media shoutout"] },
    ],
    scoring: [
      { answer: 0, weight: [10, 8, 5, 3] },
      { answer: 1, weight: [7, 10, 6, 5] },
      { answer: 2, weight: [8, 7, 10, 4] },
      { answer: 3, weight: [9, 8, 6, 10] },
      { answer: 0, weight: [10, 7, 8, 5] },
      { answer: 1, weight: [8, 10, 6, 7] },
      { answer: 2, weight: [5, 8, 10, 6] },
      { answer: 3, weight: [7, 9, 8, 10] },
      { answer: 0, weight: [6, 8, 10, 5] },
      { answer: 1, weight: [9, 7, 6, 10] },
    ],
  },
  lifestyle: {
    questions: [
      { q: "What's your ideal morning routine?", options: ["Early riser, productive", "Sleep in, relax", "Moderate start", "No routine"] },
      { q: "How do you prefer to spend weekends?", options: ["Going out", "Staying home", "Traveling", "Mixed plans"] },
      { q: "What's your fitness level?", options: ["Very active", "Moderately active", "Light activity", "Not active"] },
      { q: "How important is healthy eating?", options: ["Very important", "Important", "Somewhat", "Not important"] },
      { q: "What's your ideal living environment?", options: ["City center", "Suburbs", "Countryside", "Beach/Mountains"] },
      { q: "How do you manage your finances?", options: ["Strict budget", "General saving", "Spend freely", "Invest focus"] },
      { q: "What's your social battery like?", options: ["Always social", "Needs recharging", "Mostly introverted", "Varies greatly"] },
      { q: "How important is alone time?", options: ["Essential daily", "Few times a week", "Occasionally", "Rarely needed"] },
      { q: "What's your cleanliness style?", options: ["Minimalist", "Organized but lived-in", "Comfortable mess", "Creative chaos"] },
      { q: "How do you handle stress?", options: ["Exercise/Meditation", "Talk to someone", "Distract myself", "Power through"] },
    ],
    scoring: [
      { answer: 0, weight: [10, 5, 8, 3] },
      { answer: 1, weight: [5, 10, 7, 8] },
      { answer: 2, weight: [8, 6, 10, 4] },
      { answer: 3, weight: [7, 8, 5, 10] },
      { answer: 0, weight: [9, 7, 8, 6] },
      { answer: 1, weight: [6, 9, 5, 10] },
      { answer: 2, weight: [10, 7, 6, 8] },
      { answer: 3, weight: [8, 10, 7, 5] },
      { answer: 0, weight: [7, 9, 6, 8] },
      { answer: 1, weight: [9, 8, 7, 10] },
    ],
  },
  intellectual: {
    questions: [
      { q: "What type of conversations do you enjoy most?", options: ["Deep philosophical", "Ideas and innovation", "Daily life", "Humor and fun"] },
      { q: "How often do you read?", options: ["Daily", "Weekly", "Monthly", "Rarely"] },
      { q: "What's your favorite way to learn?", options: ["Books", "Podcasts/Videos", "Discussion", "Hands-on"] },
      { q: "How important is intellectual stimulation?", options: ["Essential", "Very important", "Somewhat", "Not important"] },
      { q: "What type of humor do you prefer?", options: ["Witty/Smart", "Silly/Goofy", "Dark/Sarcastic", "Puns/Wordplay"] },
      { q: "How do you feel about debates?", options: ["Love them", "Enjoy occasionally", "Avoid them", "Only on certain topics"] },
      { q: "What's your curiosity level?", options: ["Extremely curious", "Quite curious", "Somewhat curious", "Content with what I know"] },
      { q: "How important are shared intellectual interests?", options: ["Very important", "Nice to have", "Not important", "Don't care"] },
      { q: "What type of media do you consume most?", options: ["Books/Literature", "Documentaries", "News/Current events", "Entertainment"] },
      { q: "How do you like to spend a quiet evening?", options: ["Reading/Studying", "Watching a movie", "Playing games", "Talking/Discussing"] },
    ],
    scoring: [
      { answer: 0, weight: [10, 8, 5, 7] },
      { answer: 1, weight: [8, 10, 6, 5] },
      { answer: 2, weight: [7, 9, 10, 6] },
      { answer: 3, weight: [9, 7, 6, 10] },
      { answer: 0, weight: [10, 8, 7, 5] },
      { answer: 1, weight: [6, 9, 5, 10] },
      { answer: 2, weight: [8, 10, 7, 6] },
      { answer: 3, weight: [7, 6, 9, 10] },
      { answer: 0, weight: [10, 8, 6, 5] },
      { answer: 1, weight: [7, 9, 8, 10] },
    ],
  },
  travel: {
    questions: [
      { q: "What's your travel style?", options: ["Luxury resort", "Backpacking", "Cultural immersion", "Adventure sports"] },
      { q: "How do you plan trips?", options: ["Detailed itinerary", "General ideas", "Fully spontaneous", "Let someone else plan"] },
      { q: "What's your ideal trip duration?", options: ["Weekend getaway", "1 week", "2-3 weeks", "Month+"] },
      { q: "What's your budget travel style?", options: ["Save up for luxury", "Mid-range comfort", "Budget-friendly", "Splurge when needed"] },
      { q: "How important is travel companionship?", options: ["Must travel with others", "Enjoy both", "Prefer solo", "Depends on destination"] },
      { q: "What's your packing style?", options: ["Over-packer", "Minimalist", "Just essentials", "It varies"] },
      { q: "What type of destinations attract you?", options: ["Beaches", "Mountains", "Cities", "Countryside"] },
      { q: "How do you handle travel mishaps?", options: ["Stay calm, adapt", "Get stressed", "Laugh it off", "Plan for everything"] },
      { q: "What's your food travel style?", options: ["Fine dining", "Street food", "Local cuisine", "Familiar foods"] },
      { q: "How important is it to visit landmarks?", options: ["Must-see everything", "Select few", "Skip the crowds", "Go with the flow"] },
    ],
    scoring: [
      { answer: 0, weight: [8, 5, 10, 7] },
      { answer: 1, weight: [6, 8, 7, 10] },
      { answer: 2, weight: [9, 7, 10, 5] },
      { answer: 3, weight: [7, 9, 6, 8] },
      { answer: 0, weight: [7, 10, 5, 8] },
      { answer: 1, weight: [5, 8, 10, 6] },
      { answer: 2, weight: [10, 7, 8, 6] },
      { answer: 3, weight: [8, 6, 9, 10] },
      { answer: 0, weight: [9, 8, 10, 5] },
      { answer: 1, weight: [6, 7, 8, 10] },
    ],
  },
  career: {
    questions: [
      { q: "What's your career ambition level?", options: ["Highly ambitious", "Moderately ambitious", "Seek balance", "Content where I am"] },
      { q: "How important is work-life balance?", options: ["Most important", "Very important", "Important", "Less important"] },
      { q: "What's your ideal work environment?", options: ["Office/Team", "Remote", "Hybrid", "Flexible"] },
      { q: "How do you approach career growth?", options: ["Always learning", "Take opportunities", "Go with the flow", "Prefer stability"] },
      { q: "What motivates you at work?", options: ["Money/Status", "Impact/Purpose", "Creativity", "Security"] },
      { q: "How do you handle work stress?", options: ["Head-on", "Need support", "Take breaks", "Push through"] },
      { q: "What's your preferred leadership style?", options: ["Lead from front", "Collaborative", "Hands-off", "Follow instructions"] },
      { q: "How important is passion for work?", options: ["Must be passionate", "Prefer it", "Nice to have", "Work is work"] },
      { q: "What's your ideal work schedule?", options: ["9-5 traditional", "Flexible hours", "Four-day week", "Freelance/Project"] },
      { q: "How do you feel about taking risks in career?", options: ["Embrace risks", "Calculated risks", "Minimal risks", "Avoid risks"] },
    ],
    scoring: [
      { answer: 0, weight: [10, 7, 5, 3] },
      { answer: 1, weight: [5, 8, 10, 7] },
      { answer: 2, weight: [8, 10, 7, 6] },
      { answer: 3, weight: [7, 9, 6, 10] },
      { answer: 0, weight: [9, 7, 8, 5] },
      { answer: 1, weight: [6, 9, 7, 10] },
      { answer: 2, weight: [8, 10, 5, 7] },
      { answer: 3, weight: [7, 6, 9, 10] },
      { answer: 0, weight: [10, 8, 7, 5] },
      { answer: 1, weight: [5, 7, 8, 10] },
    ],
  },
};

export default function ToolHome() {
  const [category, setCategory] = useState("romance");
  const [phase, setPhase] = useState("category");
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(null);
  const [animating, setAnimating] = useState(false);
  const resultTimeoutRef = useRef(null);

  const currentQuiz = QUIZ_DATA[category] || QUIZ_DATA.romance;
  const questions = currentQuiz.questions;

  useEffect(() => {
    return () => {
      if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
    };
  }, []);

  // Takes the answers map explicitly rather than reading it from state, so a
  // score computed for the just-submitted final answer can't be based on a
  // stale closure that predates that answer being recorded.
  const calculateScore = useCallback((answersMap) => {
    const selectedKeys = Object.keys(answersMap);
    if (selectedKeys.length < questions.length) return 0;
    const total = selectedKeys.reduce((sum, key) => {
      const qIdx = questions.findIndex((q) => q.q === key);
      if (qIdx === -1) return sum;
      const scoring = currentQuiz.scoring;
      const optIdx = answersMap[key];
      if (scoring[qIdx] && scoring[qIdx].weight[optIdx] !== undefined) {
        return sum + scoring[qIdx].weight[optIdx];
      }
      return sum + 5;
    }, 0);
    return Math.round((total / (questions.length * 10)) * 100);
  }, [questions, currentQuiz]);

  const startQuiz = useCallback(() => {
    setAnswers({});
    setCurrentQ(0);
    setScore(null);
    setPhase("quiz");
  }, []);

  const selectAnswer = useCallback((optionIdx) => {
    if (animating) return;
    const nextAnswers = { ...answers, [questions[currentQ].q]: optionIdx };
    setAnswers(nextAnswers);
    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
    } else {
      setAnimating(true);
      resultTimeoutRef.current = setTimeout(() => {
        setScore(calculateScore(nextAnswers));
        setPhase("result");
        setAnimating(false);
        resultTimeoutRef.current = null;
      }, 1500);
    }
  }, [animating, currentQ, questions, answers, calculateScore]);

  const goBack = useCallback(() => {
    if (currentQ > 0) setCurrentQ((prev) => prev - 1);
  }, [currentQ]);

  const reviewAnswers = useCallback(() => {
    setPhase("review");
  }, []);

  const restart = useCallback(() => {
    setPhase("category");
    setAnswers({});
    setCurrentQ(0);
    setScore(null);
  }, []);

  // Driven by currentQ (position in the quiz), not by how many answers have ever
  // been recorded — using answers.length here disagreed with the "Question X of Y"
  // caption after the user hit Back, since Back doesn't erase prior answers.
  const progress = questions.length > 0 ? (currentQ / questions.length) * 100 : 0;
  const currentQuestion = questions[currentQ];
  const currentCat = CATEGORIES.find((c) => c.id === category);

  const getResultData = (s) => {
    if (s >= 90) return { label: "Perfect Match!", desc: "You are incredibly compatible! This is a match made in heaven.", color: "text-(--warning-text)", bg: "bg-amber-50 dark:bg-amber-900/20", icon: Trophy };
    if (s >= 75) return { label: "Strong Connection", desc: "You have a strong natural connection with great potential.", color: "text-(--success-text)", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: Star };
    if (s >= 60) return { label: "Good Potential", desc: "You have a solid foundation to build something great.", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", icon: Heart };
    if (s >= 40) return { label: "Room to Grow", desc: "There's some alignment but also areas to explore together.", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20", icon: Smile };
    return { label: "Different Paths", desc: "You have different approaches — but opposites can attract!", color: "text-(--muted-foreground)", bg: "bg-(--muted)", icon: Sparkles };
  };

  if (phase === "result" && score !== null) {
    const result = getResultData(score);
    const ResultIcon = result.icon;
    return (
      <div className="min-h-screen bg-(--background)">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl bg-(--card) border-2 border-(--primary) p-8 text-center space-y-6`}
          >
            <div className={`inline-flex items-center justify-center w-24 h-24 mx-auto rounded-full ${result.bg}`}>
              <ResultIcon size="48" className={result.color} />
            </div>

            <div>
              <p className="text-5xl font-bold text-(--primary)">{score}%</p>
              <p className={`text-2xl font-bold mt-2 ${result.color}`}>{result.label}</p>
            </div>

            <p className="text-(--muted-foreground) max-w-md mx-auto">{result.desc}</p>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-(--muted)">
                <p className="text-xs text-(--muted-foreground)">Category</p>
                <p className="text-sm font-semibold text-(--foreground) mt-1">{currentCat?.label}</p>
              </div>
              <div className="p-3 rounded-xl bg-(--muted)">
                <p className="text-xs text-(--muted-foreground)">Questions</p>
                <p className="text-sm font-semibold text-(--foreground) mt-1">{questions.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-(--muted)">
                <p className="text-xs text-(--muted-foreground)">Answered</p>
                <p className="text-sm font-semibold text-(--foreground) mt-1">{Object.keys(answers).length}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={reviewAnswers} className="flex-1 py-3 rounded-xl bg-(--muted) text-(--foreground) font-bold hover:bg-(--border) transition">
                Review Answers
              </button>
              <button onClick={restart} className="flex-1 py-3 rounded-xl bg-(--primary) text-(--primary-foreground) font-bold hover:opacity-90 transition flex items-center justify-center gap-2">
                <RotateCcw size="18" /> New Quiz
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (phase === "review") {
    return (
      <div className="min-h-screen bg-(--background)">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <h1 className="text-2xl font-bold text-(--foreground) text-center">Answer Review</h1>
          <div className="space-y-3">
            {questions.map((q, i) => {
              const answerIdx = answers[q.q];
              return (
                <div key={i} className="rounded-xl bg-(--card) border border-(--border) p-4">
                  <p className="text-sm font-medium text-(--foreground) mb-1">{q.q}</p>
                  <p className="text-sm text-(--primary) font-semibold">
                    {answerIdx !== undefined ? q.options[answerIdx] : "Not answered"}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setPhase("result")} className="flex-1 py-3 rounded-xl bg-(--primary) text-(--primary-foreground) font-bold hover:opacity-90 transition">
              Back to Results
            </button>
            <button onClick={restart} className="flex-1 py-3 rounded-xl bg-(--muted) text-(--foreground) font-bold hover:bg-(--border) transition">
              New Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "quiz") {
    return (
      <div className="min-h-screen bg-(--background)">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-(--foreground)">Compatibility Quiz</h1>
              <p className="text-sm text-(--muted-foreground) flex items-center gap-1">
                {currentCat && <currentCat.icon size="14" className={currentCat?.color} />}
                {currentCat?.label}
              </p>
            </div>
            <span className="text-sm text-(--muted-foreground) bg-(--muted) px-3 py-1 rounded-full">
              {currentQ + 1}/{questions.length}
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

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="rounded-2xl bg-(--card) border border-(--border) p-8 space-y-6"
            >
              <p className="text-xl font-semibold text-(--foreground) leading-relaxed">
                {currentQuestion?.q}
              </p>

              <div className="space-y-2" role="radiogroup" aria-label={currentQuestion?.q}>
                {currentQuestion?.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    role="radio"
                    aria-checked={answers[currentQuestion?.q] === idx}
                    onClick={() => selectAnswer(idx)}
                    disabled={animating}
                    className={`w-full py-3.5 px-4 rounded-xl text-left text-sm font-medium border transition-all hover:border-(--primary) hover:bg-(--primary)/5 disabled:cursor-not-allowed disabled:opacity-60 ${
                      answers[currentQuestion?.q] === idx
                        ? "bg-(--primary)/10 border-(--primary) text-(--primary)"
                        : "bg-(--card) text-(--foreground) border-(--border)"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={goBack}
                  disabled={currentQ === 0}
                  className="px-4 py-2 rounded-lg bg-(--muted) text-(--muted-foreground) disabled:opacity-30 text-sm font-medium hover:text-(--foreground) transition"
                >
                  Back
                </button>
                <span className="text-xs text-(--muted-foreground) self-center">
                  Question {currentQ + 1} of {questions.length}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="rounded-2xl bg-(--card) border border-(--border) p-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-(--primary)/10 text-(--primary)">
            <Sparkles size="40" />
          </div>
          <h1 className="text-3xl font-bold text-(--foreground)">Compatibility Quiz</h1>
          <p className="text-(--muted-foreground) max-w-md mx-auto">
            Take interactive quizzes to measure compatibility across multiple categories
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => { setCategory(c.id); }}
                className={`p-4 rounded-xl border text-left transition ${
                  category === c.id
                    ? "bg-(--primary)/5 border-(--primary)"
                    : "bg-(--card) border-(--border) hover:border-(--primary)"
                }`}
              >
                <c.icon size="24" className={`mb-2 ${c.color}`} />
                <p className="text-sm font-semibold text-(--foreground)">{c.label}</p>
                <p className="text-[10px] text-(--muted-foreground) mt-0.5">{c.desc}</p>
              </button>
            ))}
          </div>

          <button
            onClick={startQuiz}
            className="w-full py-4 rounded-2xl bg-(--primary) text-(--primary-foreground) font-bold text-lg hover:opacity-90 transition shadow-lg shadow-(--primary)/20 flex items-center justify-center gap-2"
          >
            <Sparkles size="20" /> Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
