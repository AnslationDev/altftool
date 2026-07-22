"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  BookOpen, Brain, Eye,
  RefreshCw, CheckCircle2, XCircle,
  Trophy, Zap, BarChart3,
  Table2, Sun, Moon, Type
} from "lucide-react";

const BRAILLE_DATA = [
  { char: "A", dots: [1,0,0,0,0,0], desc: "Single dot top-left" },
  { char: "B", dots: [1,1,0,0,0,0], desc: "Top two dots left" },
  { char: "C", dots: [1,0,0,1,0,0], desc: "Top-left and top-right" },
  { char: "D", dots: [1,0,0,1,1,0], desc: "Left top, both right" },
  { char: "E", dots: [1,0,0,0,1,0], desc: "Top-left, middle-right" },
  { char: "F", dots: [1,1,0,1,0,0], desc: "Left column, top-right" },
  { char: "G", dots: [1,1,0,1,1,0], desc: "Left column, both right" },
  { char: "H", dots: [0,1,0,0,1,0], desc: "Middle-left, middle-right" },
  { char: "I", dots: [0,1,0,1,0,0], desc: "Middle-left, top-right" },
  { char: "J", dots: [0,1,0,1,1,0], desc: "Middle-left, both right" },
  { char: "K", dots: [1,0,1,0,0,0], desc: "Top-left, bottom-left" },
  { char: "L", dots: [1,1,1,0,0,0], desc: "Full left column" },
  { char: "M", dots: [1,0,1,1,0,0], desc: "Top-left, bottom-left, top-right" },
  { char: "N", dots: [1,0,1,1,1,0], desc: "Top-left, bottom-left, both right" },
  { char: "O", dots: [1,0,1,0,1,0], desc: "Top-left, bottom-left, middle-right" },
  { char: "P", dots: [1,1,1,1,0,0], desc: "Full left, top-right" },
  { char: "Q", dots: [1,1,1,1,1,0], desc: "All except bottom-right" },
  { char: "R", dots: [0,1,1,0,1,0], desc: "Bottom-left + left middle, middle-right" },
  { char: "S", dots: [0,1,1,1,0,0], desc: "Left middle+bottom, top-right" },
  { char: "T", dots: [0,1,1,1,1,0], desc: "Left middle+bottom, both right" },
  { char: "U", dots: [1,0,1,0,0,1], desc: "Top-left, bottom-left, bottom-right" },
  { char: "V", dots: [1,1,1,0,0,1], desc: "Full left, bottom-right" },
  { char: "W", dots: [0,1,0,1,1,1], desc: "Left middle, both right, bottom-right" },
  { char: "X", dots: [1,0,1,1,0,1], desc: "Top-left, bottom-left, top-right, bottom-right" },
  { char: "Y", dots: [1,0,1,1,1,1], desc: "All except middle-left" },
  { char: "Z", dots: [1,0,1,0,1,1], desc: "Top-left, bottom-left, both right" },
];

const NUMERIC_PREFIX = [0,0,1,1,1,1];

const NUMBER_DATA = [
  { digit: "1", char: "A", dots: [1,0,0,0,0,0] },
  { digit: "2", char: "B", dots: [1,1,0,0,0,0] },
  { digit: "3", char: "C", dots: [1,0,0,1,0,0] },
  { digit: "4", char: "D", dots: [1,0,0,1,1,0] },
  { digit: "5", char: "E", dots: [1,0,0,0,1,0] },
  { digit: "6", char: "F", dots: [1,1,0,1,0,0] },
  { digit: "7", char: "G", dots: [1,1,0,1,1,0] },
  { digit: "8", char: "H", dots: [0,1,0,0,1,0] },
  { digit: "9", char: "I", dots: [0,1,0,1,0,0] },
  { digit: "0", char: "J", dots: [0,1,0,1,1,0] },
];

const PUNCTUATION_DATA = [
  { char: ".", name: "Period", dots: [0,1,0,0,1,1] },
  { char: ",", name: "Comma", dots: [0,1,0,0,0,0] },
  { char: "?", name: "Question Mark", dots: [0,1,0,0,0,1] },
  { char: "!", name: "Exclamation", dots: [0,1,1,0,1,0] },
  { char: ";", name: "Semicolon", dots: [0,1,1,0,0,0] },
  { char: ":", name: "Colon", dots: [0,1,0,0,1,0] },
  { char: "-", name: "Hyphen", dots: [0,0,1,0,0,1] },
  { char: "'", name: "Apostrophe", dots: [0,0,1,0,0,0] },
  { char: '"', name: "Quotation", dots: [0,1,1,0,0,1] },
  { char: "/", name: "Slash", dots: [0,0,1,1,0,0] },
  { char: "@", name: "At Sign", dots: [0,0,0,1,1,1] },
  { char: "(", name: "Parenthesis Open", dots: [0,1,1,1,0,1] },
  { char: ")", name: "Parenthesis Close", dots: [0,1,1,1,1,0] },
];

const ALL_CHARS = [
  ...BRAILLE_DATA.map(d => ({ ...d, category: "letter" })),
  ...NUMBER_DATA.map(d => ({ char: d.digit, dots: d.dots, desc: `Number ${d.digit} (letter ${d.char})`, category: "number" })),
  ...PUNCTUATION_DATA.map(d => ({ ...d, category: "punctuation" })),
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadProgress() {
  if (typeof window === "undefined") return { scores: {}, stats: null };
  try {
    const scores = JSON.parse(localStorage.getItem("braille_scores") || "{}");
    const stats = JSON.parse(localStorage.getItem("braille_stats") || "null");
    const prefs = JSON.parse(localStorage.getItem("braille_prefs") || "{}");
    return { scores, stats, prefs };
  } catch {
    return { scores: {}, stats: null, prefs: {} };
  }
}

function saveScores(scores) {
  if (typeof window === "undefined") return;
  localStorage.setItem("braille_scores", JSON.stringify(scores));
}

function saveStats(stats) {
  if (typeof window === "undefined") return;
  localStorage.setItem("braille_stats", JSON.stringify(stats));
}

function savePrefs(prefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem("braille_prefs", JSON.stringify(prefs));
}

function getCharStatus(char, scores) {
  const s = scores[char];
  if (!s || s.total < 3) return "new";
  if (s.correct / s.total >= 0.8 && s.total >= 5) return "mastered";
  return "learning";
}

function BrailleDots({ dots, size = 80, label, className = "" }) {
  const dotR = size * 0.07;
  const gap = size * 0.2;
  const offX = size * 0.22;
  const offY = size * 0.22;
  const positions = [
    { cx: offX, cy: offY },
    { cx: offX, cy: offY + gap },
    { cx: offX, cy: offY + gap * 2 },
    { cx: offX + gap, cy: offY },
    { cx: offX + gap, cy: offY + gap },
    { cx: offX + gap, cy: offY + gap * 2 },
  ];

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={label || "Braille pattern"}
    >
      <rect width={size} height={size} fill="transparent" />
      {positions.map((p, i) => (
        <circle
          key={i}
          cx={p.cx}
          cy={p.cy}
          r={dotR}
          fill={dots[i] ? "var(--primary, #0D9488)" : "var(--muted, #94A3B8)"}
          stroke={dots[i] ? "var(--primary, #0D9488)" : "var(--border, #E2E8F0)"}
          strokeWidth={1.5}
          className={dots[i] ? "fill-current text-[var(--primary)]" : "fill-transparent"}
          style={{
            transition: "fill 0.15s ease, stroke 0.15s ease",
          }}
        />
      ))}
    </svg>
  );
}

function StatusDot({ status }) {
  const colors = {
    new: "bg-gray-400 dark:bg-gray-600",
    learning: "bg-amber-400 dark:bg-amber-500",
    mastered: "bg-emerald-400 dark:bg-emerald-500",
  };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status]}`} />;
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="p-4 rounded-xl border bg-(--card) border-(--border) flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-(--muted-foreground)">{label}</p>
        <p className="text-xl font-black text-(--foreground)">{value}</p>
      </div>
    </div>
  );
}

function QuizOption({ label, selected, correct, disabled, onClick }) {
  const borderColor = correct === null
    ? "border-(--border)"
    : correct
      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
      : selected
        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
        : "border-(--border)";
  return (
    <button
      onClick={() => !disabled && onClick(label)}
      disabled={disabled}
      className={`px-5 py-3 rounded-xl border-2 font-bold text-lg transition-all active:scale-95
        ${borderColor}
        ${disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-(--muted) cursor-pointer"}
        bg-(--card) text-(--foreground)`}
      aria-label={`Select ${label}`}
    >
      {label}
    </button>
  );
}

export default function ToolHome() {
  const [mode, setMode] = useState("learn");
  const [initialData] = useState(loadProgress);
  const [scores, setScores] = useState(initialData.scores);
  const [stats, setStats] = useState(initialData.stats);
  const [prefs, setPrefs] = useState(initialData.prefs || {});
  const [highContrast, setHighContrast] = useState(!!initialData.prefs?.highContrast);
  const [largeText, setLargeText] = useState(!!initialData.prefs?.largeText);

  const [quizChar, setQuizChar] = useState(null);
  const [quizOptions, setQuizOptions] = useState([]);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizCorrect, setQuizCorrect] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCategory, setQuizCategory] = useState("all");

  const [practiceChar, setPracticeChar] = useState(null);
  const [practiceOptions, setPracticeOptions] = useState([]);
  const [practiceSelected, setPracticeSelected] = useState(null);
  const [practiceCorrect, setPracticeCorrect] = useState(null);
  const [practiceResult, setPracticeResult] = useState(null);
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [practiceCategory, setPracticeCategory] = useState("all");

  const [streakCount, setStreakCount] = useState(stats?.streak || 0);
  const [totalCorrect, setTotalCorrect] = useState(stats?.correct || 0);
  const [totalIncorrect, setTotalIncorrect] = useState(stats?.incorrect || 0);
  const [bestStreak, setBestStreak] = useState(stats?.bestStreak || 0);
  const streakRef = React.useRef(streakCount);
  const largeTextRef = React.useRef(largeText);

  const getPool = useCallback((category) => {
    if (category === "letters") return BRAILLE_DATA.map(d => ({ ...d, category: "letter" }));
    if (category === "numbers") return NUMBER_DATA.map(d => ({ char: d.digit, dots: d.dots, desc: `Number ${d.digit}`, category: "number" }));
    if (category === "punctuation") return PUNCTUATION_DATA.map(d => ({ ...d, category: "punctuation" }));
    return ALL_CHARS;
  }, []);

  const letterStatuses = useMemo(() => {
    const map = {};
    for (const item of ALL_CHARS) {
      map[item.char] = getCharStatus(item.char, scores);
    }
    return map;
  }, [scores]);

  const masteredCount = Object.values(letterStatuses).filter(s => s === "mastered").length;

  useEffect(() => {
    savePrefs({ highContrast, largeText });
  }, [highContrast, largeText]);

  useEffect(() => {
    largeTextRef.current = largeText;
  }, [largeText]);

  const persistScores = useCallback((newScores) => {
    setScores(newScores);
    saveScores(newScores);
  }, []);

  const persistStats = useCallback((newStats) => {
    setStats(newStats);
    saveStats(newStats);
  }, []);

  const recordAnswer = useCallback((char, isCorrect) => {
    const newScores = { ...scores };
    if (!newScores[char]) newScores[char] = { correct: 0, total: 0 };
    newScores[char] = {
      correct: newScores[char].correct + (isCorrect ? 1 : 0),
      total: newScores[char].total + 1,
    };
    persistScores(newScores);

    const newTotalCorrect = totalCorrect + (isCorrect ? 1 : 0);
    const newTotalIncorrect = totalIncorrect + (isCorrect ? 0 : 1);
    setTotalCorrect(newTotalCorrect);
    setTotalIncorrect(newTotalIncorrect);

    if (isCorrect) {
      const newStreak = streakRef.current + 1;
      streakRef.current = newStreak;
      setStreakCount(newStreak);
      const newBest = Math.max(bestStreak, newStreak);
      setBestStreak(newBest);
      persistStats({ streak: newStreak, correct: newTotalCorrect, incorrect: newTotalIncorrect, bestStreak: newBest });
    } else {
      streakRef.current = 0;
      setStreakCount(0);
      persistStats({ streak: 0, correct: newTotalCorrect, incorrect: newTotalIncorrect, bestStreak: bestStreak });
    }
  }, [scores, totalCorrect, totalIncorrect, bestStreak, persistScores, persistStats]);

  const getNextQuizChar = useCallback(() => {
    const pool = getPool(quizCategory);
    return pool[Math.floor(Math.random() * pool.length)];
  }, [quizCategory, getPool]);

  const startQuiz = useCallback(() => {
    const pool = getPool(quizCategory);
    if (pool.length < 4) return;
    const shuffled = shuffleArray(pool);
    const correct = shuffled[0];
    const wrong = shuffled.slice(1, 5);
    const options = shuffleArray([correct.char, ...wrong.map(w => w.char)]);
    setQuizChar(correct);
    setQuizOptions(options);
    setQuizSelected(null);
    setQuizCorrect(null);
    setQuizResult(null);
    setQuizStarted(true);
  }, [quizCategory, getPool]);

  const startPractice = useCallback(() => {
    const pool = getPool(practiceCategory);
    if (pool.length < 4) return;
    const shuffled = shuffleArray(pool);
    const correct = shuffled[0];
    const wrong = shuffled.slice(1, 5);
    const options = shuffleArray([...wrong.map(w => ({ char: w.char, dots: w.dots })), { char: correct.char, dots: correct.dots }]);
    setPracticeChar(correct);
    setPracticeOptions(options);
    setPracticeSelected(null);
    setPracticeCorrect(null);
    setPracticeResult(null);
    setPracticeStarted(true);
  }, [practiceCategory, getPool]);

  const handleQuizAnswer = useCallback((char) => {
    if (quizCorrect !== null) return;
    const isCorrect = char === quizChar.char;
    setQuizSelected(char);
    setQuizCorrect(isCorrect);
    setQuizResult(isCorrect ? "correct" : "incorrect");
    recordAnswer(quizChar.char, isCorrect);
  }, [quizChar, quizCorrect, recordAnswer]);

  const handlePracticeAnswer = useCallback((char) => {
    if (practiceCorrect !== null) return;
    const isCorrect = char === practiceChar.char;
    setPracticeSelected(char);
    setPracticeCorrect(isCorrect);
    setPracticeResult(isCorrect ? "correct" : "incorrect");
    recordAnswer(practiceChar.char, isCorrect);
  }, [practiceChar, practiceCorrect, recordAnswer]);

  const textSizeClass = largeText ? "text-lg" : "text-sm";
  const headingSize = largeText ? "text-2xl" : "text-xl";
  const cardPadding = largeText ? "p-6" : "p-4";
  const dotSize = largeText ? 100 : 80;

  const toggleHighContrast = () => setHighContrast(hc => !hc);
  const toggleLargeText = () => setLargeText(lt => !lt);

  return (
    <div
      className={`min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8 transition-all ${highContrast ? "braille-high-contrast" : ""}`}
      style={highContrast ? {
        "--primary": "#00695C",
        "--foreground": "#000000",
        "--background": "#FFFFFF",
        "--muted": "#E0E0E0",
        "--card": "#FFFFFF",
        "--border": "#000000",
        "--muted-foreground": "#444444",
      } : {}}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className={`heading flex justify-center gap-2 animate-fade-up mb-2 ${headingSize}`}>
            Braille Learning Tool
          </h1>
          <p className={`description opacity-90 mt-1 text-(--secondary) ${largeText ? "text-2xl" : "text-xl"} animate-fade-up mb-4`}>
            Learn the Braille tactile writing system
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border uppercase"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--primary)" }}>
              <Trophy className="w-3.5 h-3.5" /> {masteredCount}/{ALL_CHARS.length} Mastered
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border uppercase"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--primary)" }}>
              <Zap className="w-3.5 h-3.5" /> {streakCount} Streak
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border uppercase"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--primary)" }}>
              <BarChart3 className="w-3.5 h-3.5" /> {totalCorrect}/{totalCorrect + totalIncorrect || 0}
            </span>
          </div>
          {bestStreak > 0 && (
            <span className="text-xs font-bold text-(--muted-foreground)">Best Streak: {bestStreak}</span>
          )}
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            <button
              onClick={toggleHighContrast}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${highContrast ? "bg-(--primary) text-white border-(--primary)" : "bg-(--card) border-(--border) text-(--muted-foreground)"}`}
              aria-label={highContrast ? "Disable high contrast" : "Enable high contrast"}
              aria-pressed={highContrast}
            >
              {highContrast ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              High Contrast
            </button>
            <button
              onClick={toggleLargeText}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${largeText ? "bg-(--primary) text-white border-(--primary)" : "bg-(--card) border-(--border) text-(--muted-foreground)"}`}
              aria-label={largeText ? "Disable large text" : "Enable large text"}
              aria-pressed={largeText}
            >
              <Type className="w-3.5 h-3.5" />
              {largeText ? "Large Text On" : "Large Text"}
            </button>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-2xl bg-(--muted) gap-1 flex-wrap justify-center">
            {[
              { key: "learn", label: "Learn", icon: BookOpen },
              { key: "quiz", label: "Quiz", icon: Brain },
              { key: "practice", label: "Practice", icon: Eye },
              { key: "reference", label: "Reference", icon: Table2 },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`px-4 py-2.5 rounded-xl ${textSizeClass} font-bold transition-all flex items-center gap-2
                  ${mode === key
                    ? "bg-(--card) text-(--primary) shadow-sm border border-(--border)"
                    : "text-(--muted-foreground) hover:text-(--foreground)"}`}
                aria-current={mode === key ? "page" : undefined}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* LEARN MODE */}
        {mode === "learn" && (
          <div>
            <div className="mb-8">
              <h2 className={`font-bold text-(--foreground) mb-4 ${headingSize}`}>Alphabet (A–Z)</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {BRAILLE_DATA.map(item => {
                  const st = letterStatuses[item.char];
                  return (
                    <div
                      key={item.char}
                      className={`rounded-2xl border flex flex-col items-center gap-1.5 transition-all hover:shadow-md ${cardPadding}`}
                      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                    >
                      <BrailleDots dots={item.dots} size={dotSize} label={`Braille letter ${item.char}`} />
                      <span className={`font-black text-(--foreground) ${largeText ? "text-2xl" : "text-lg"}`}>{item.char}</span>
                      <StatusDot status={st} />
                      <p className="text-[10px] text-center leading-tight text-(--muted-foreground)">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mb-8">
              <h2 className={`font-bold text-(--foreground) mb-4 ${headingSize}`}>Numbers (0–9)</h2>
              <p className={`text-(--muted-foreground) mb-3 ${textSizeClass}`}>
                Numbers are prefixed with the numeric indicator (<span className="font-mono">dots 3-4-5-6</span>)
              </p>
              <div className="flex items-center gap-2 mb-4 p-3 rounded-xl border bg-(--card) border-(--border) inline-flex">
                <span className="text-xs font-bold text-(--muted-foreground) uppercase">Numeric Prefix:</span>
                <BrailleDots dots={NUMERIC_PREFIX} size={40} label="Numeric indicator" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {NUMBER_DATA.map(item => {
                  const st = letterStatuses[item.digit];
                  return (
                    <div
                      key={item.digit}
                      className={`rounded-2xl border flex flex-col items-center gap-1.5 transition-all hover:shadow-md ${cardPadding}`}
                      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                    >
                      <BrailleDots dots={item.dots} size={dotSize} label={`Braille number ${item.digit}`} />
                      <span className={`font-black text-(--foreground) ${largeText ? "text-2xl" : "text-lg"}`}>{item.digit}</span>
                      <StatusDot status={st} />
                      <p className="text-[10px] text-center leading-tight text-(--muted-foreground)">Letter {item.char}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mb-8">
              <h2 className={`font-bold text-(--foreground) mb-4 ${headingSize}`}>Punctuation & Symbols</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {PUNCTUATION_DATA.map(item => {
                  const st = letterStatuses[item.char];
                  return (
                    <div
                      key={item.char}
                      className={`rounded-2xl border flex flex-col items-center gap-1.5 transition-all hover:shadow-md ${cardPadding}`}
                      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                    >
                      <BrailleDots dots={item.dots} size={dotSize} label={`Braille ${item.name}`} />
                      <span className={`font-black text-(--foreground) ${largeText ? "text-2xl" : "text-lg"}`}>{item.char}</span>
                      <StatusDot status={st} />
                      <p className="text-[10px] text-center leading-tight text-(--muted-foreground)">{item.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* QUIZ MODE */}
        {mode === "quiz" && (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-6">
              <p className={`font-bold text-(--muted-foreground) mb-1 ${textSizeClass}`}>Identify the Braille Pattern</p>
              <p className="text-xs text-(--muted-foreground)">Which character matches this Braille pattern?</p>
            </div>

            {!quizStarted ? (
              <div className="text-center p-12 rounded-3xl border bg-(--card) border-(--border)">
                <Brain className="w-16 h-16 mx-auto mb-4 text-(--primary) opacity-40" />
                <p className={`font-bold mb-2 text-(--foreground) ${headingSize}`}>Ready for a Quiz?</p>
                <p className={`text-(--muted-foreground) mb-4 ${textSizeClass}`}>You will see a Braille pattern and must pick the correct character.</p>

                <div className="flex justify-center gap-2 mb-6">
                  {["all", "letters", "numbers", "punctuation"].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setQuizCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        quizCategory === cat
                          ? "bg-(--primary) text-white border-(--primary)"
                          : "bg-(--card) border-(--border) text-(--muted-foreground)"
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>

                <button
                  onClick={startQuiz}
                  className="px-8 py-3 rounded-xl font-bold bg-(--primary) text-white shadow-lg active:scale-95 transition-all"
                  disabled={getPool(quizCategory).length < 4}
                >
                  Start Quiz
                </button>
                {getPool(quizCategory).length < 4 && (
                  <p className="text-xs text-red-500 mt-2">Need at least 4 characters in this category.</p>
                )}
              </div>
            ) : quizChar ? (
              <div>
                <div className="flex justify-center mb-6">
                  <div className={`rounded-2xl border bg-(--card) border-(--border) ${cardPadding}`}>
                    <BrailleDots dots={quizChar.dots} size={dotSize * 1.5} label={`What character is this Braille pattern?`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {quizOptions.map(ch => (
                    <QuizOption
                      key={ch}
                      label={ch}
                      selected={quizSelected === ch}
                      correct={quizSelected === null ? null : ch === quizChar.char}
                      disabled={quizSelected !== null}
                      onClick={handleQuizAnswer}
                    />
                  ))}
                </div>
                {quizResult && (
                  <div className={`mt-4 p-4 rounded-xl text-center font-bold text-sm ${
                    quizResult === "correct"
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                      : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                  }`}>
                    {quizResult === "correct" ? (
                      <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5" /> Correct!</span>
                    ) : (
                      <span className="flex items-center justify-center gap-2"><XCircle className="w-5 h-5" /> Incorrect — it was "{quizChar.char}"</span>
                    )}
                    <p className="text-xs font-normal mt-1 opacity-80">{quizChar.desc}</p>
                  </div>
                )}
                {quizCorrect !== null && (
                  <button
                    onClick={startQuiz}
                    className="w-full mt-4 py-3 rounded-xl font-bold bg-(--primary) text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Next Question
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center p-12 rounded-3xl border bg-(--card) border-(--border)">
                <p className="text-sm text-(--muted-foreground)">Loading question...</p>
              </div>
            )}
          </div>
        )}

        {/* PRACTICE MODE */}
        {mode === "practice" && (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-6">
              <p className={`font-bold text-(--muted-foreground) mb-1 ${textSizeClass}`}>Identify the Correct Braille Pattern</p>
              <p className="text-xs text-(--muted-foreground)">Which Braille pattern represents this character?</p>
            </div>

            {!practiceStarted ? (
              <div className="text-center p-12 rounded-3xl border bg-(--card) border-(--border)">
                <Eye className="w-16 h-16 mx-auto mb-4 text-(--primary) opacity-40" />
                <p className={`font-bold mb-2 text-(--foreground) ${headingSize}`}>Ready to Practice?</p>
                <p className={`text-(--muted-foreground) mb-4 ${textSizeClass}`}>You will see a character and must pick the correct Braille pattern.</p>

                <div className="flex justify-center gap-2 mb-6">
                  {["all", "letters", "numbers", "punctuation"].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setPracticeCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        practiceCategory === cat
                          ? "bg-(--primary) text-white border-(--primary)"
                          : "bg-(--card) border-(--border) text-(--muted-foreground)"
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>

                <button
                  onClick={startPractice}
                  className="px-8 py-3 rounded-xl font-bold bg-(--primary) text-white shadow-lg active:scale-95 transition-all"
                  disabled={getPool(practiceCategory).length < 4}
                >
                  Start Practice
                </button>
                {getPool(practiceCategory).length < 4 && (
                  <p className="text-xs text-red-500 mt-2">Need at least 4 characters in this category.</p>
                )}
              </div>
            ) : practiceChar ? (
              <div>
                <div className="flex justify-center mb-6">
                  <div className={`rounded-2xl border bg-(--card) border-(--border) text-center ${cardPadding}`}>
                    <p className="text-xs font-bold uppercase tracking-widest text-(--muted-foreground) mb-3">Find the Braille for</p>
                    <span className={`font-black text-(--foreground) ${largeText ? "text-8xl" : "text-7xl"}`}>{practiceChar.char}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {practiceOptions.map((opt, idx) => {
                    const isSelected = practiceSelected === opt.char;
                    const isCorrectAnswer = opt.char === practiceChar.char;
                    const borderColor = practiceSelected === null
                      ? "border-(--border)"
                      : isCorrectAnswer
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                        : isSelected
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                          : "border-(--border)";
                    return (
                      <button
                        key={idx}
                        onClick={() => !practiceSelected && handlePracticeAnswer(opt.char)}
                        disabled={practiceSelected !== null}
                        className={`p-3 rounded-xl border-2 transition-all active:scale-95 flex flex-col items-center
                          ${borderColor}
                          ${practiceSelected ? "opacity-70 cursor-not-allowed" : "hover:bg-(--muted) cursor-pointer"}
                          bg-(--card)`}
                        aria-label={`Braille pattern ${idx + 1}`}
                      >
                        <BrailleDots dots={opt.dots} size={dotSize} label={`Braille option ${idx + 1}`} />
                      </button>
                    );
                  })}
                </div>
                {practiceResult && (
                  <div className={`mt-4 p-4 rounded-xl text-center font-bold text-sm ${
                    practiceResult === "correct"
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                      : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                  }`}>
                    {practiceResult === "correct" ? (
                      <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5" /> Correct!</span>
                    ) : (
                      <span className="flex items-center justify-center gap-2"><XCircle className="w-5 h-5" /> Incorrect</span>
                    )}
                    <p className="text-xs font-normal mt-1 opacity-80">{practiceChar.desc}</p>
                  </div>
                )}
                {practiceCorrect !== null && (
                  <button
                    onClick={startPractice}
                    className="w-full mt-4 py-3 rounded-xl font-bold bg-(--primary) text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Next Question
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center p-12 rounded-3xl border bg-(--card) border-(--border)">
                <p className="text-sm text-(--muted-foreground)">Loading question...</p>
              </div>
            )}
          </div>
        )}

        {/* REFERENCE MODE */}
        {mode === "reference" && (
          <div>
            <div className="mb-8">
              <h2 className={`font-bold text-(--foreground) mb-4 ${headingSize}`}>Complete Braille Reference Chart</h2>
              <p className={`text-(--muted-foreground) mb-4 ${textSizeClass}`}>
                Braille uses a 3 × 2 grid of dots. Raised dots are shown in teal; flat dots in gray.
                Numbers use a numeric prefix (dots 3-4-5-6) followed by the corresponding letter (A–J).
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-bold text-(--foreground) mb-3 uppercase tracking-wider">Letters A–Z</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" role="table" aria-label="Braille alphabet reference">
                  <thead>
                    <tr className="text-xs font-bold uppercase tracking-wider text-(--muted-foreground)">
                      <th className="p-3 border-b border-(--border)">Character</th>
                      <th className="p-3 border-b border-(--border)">Braille Pattern</th>
                      <th className="p-3 border-b border-(--border) hidden sm:table-cell">Dot Positions</th>
                      <th className="p-3 border-b border-(--border) hidden md:table-cell">Description</th>
                      <th className="p-3 border-b border-(--border)">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BRAILLE_DATA.map(item => {
                      const st = letterStatuses[item.char];
                      return (
                        <tr key={item.char} className="border-b border-(--border) hover:bg-(--muted) transition-colors">
                          <td className={`p-3 font-black text-(--foreground) ${largeText ? "text-2xl" : "text-xl"}`}>{item.char}</td>
                          <td className="p-3">
                            <BrailleDots dots={item.dots} size={40} label={`${item.char} braille`} />
                          </td>
                          <td className="p-3 text-xs font-mono text-(--muted-foreground) hidden sm:table-cell">
                            {item.dots.map((d, i) => d ? `●` : `○`).join(" ")}
                          </td>
                          <td className="p-3 text-xs text-(--muted-foreground) hidden md:table-cell">{item.desc}</td>
                          <td className="p-3"><StatusDot status={st} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-bold text-(--foreground) mb-3 uppercase tracking-wider">Numbers 0–9</h3>
              <p className="text-xs text-(--muted-foreground) mb-3">
                All numbers are preceded by the numeric indicator: <span className="font-mono font-bold">dots 3-4-5-6</span>
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" role="table" aria-label="Braille numbers reference">
                  <thead>
                    <tr className="text-xs font-bold uppercase tracking-wider text-(--muted-foreground)">
                      <th className="p-3 border-b border-(--border)">Digit</th>
                      <th className="p-3 border-b border-(--border)">Equivalent Letter</th>
                      <th className="p-3 border-b border-(--border)">Braille Pattern</th>
                      <th className="p-3 border-b border-(--border) hidden sm:table-cell">Dot Positions</th>
                      <th className="p-3 border-b border-(--border)">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {NUMBER_DATA.map(item => {
                      const st = letterStatuses[item.digit];
                      return (
                        <tr key={item.digit} className="border-b border-(--border) hover:bg-(--muted) transition-colors">
                          <td className={`p-3 font-black text-(--foreground) ${largeText ? "text-2xl" : "text-xl"}`}>{item.digit}</td>
                          <td className="p-3 font-bold text-(--muted-foreground)">{item.char}</td>
                          <td className="p-3">
                            <BrailleDots dots={item.dots} size={40} label={`${item.digit} braille`} />
                          </td>
                          <td className="p-3 text-xs font-mono text-(--muted-foreground) hidden sm:table-cell">
                            {item.dots.map(d => d ? `●` : `○`).join(" ")}
                          </td>
                          <td className="p-3"><StatusDot status={st} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-bold text-(--foreground) mb-3 uppercase tracking-wider">Punctuation & Symbols</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" role="table" aria-label="Braille punctuation reference">
                  <thead>
                    <tr className="text-xs font-bold uppercase tracking-wider text-(--muted-foreground)">
                      <th className="p-3 border-b border-(--border)">Symbol</th>
                      <th className="p-3 border-b border-(--border)">Name</th>
                      <th className="p-3 border-b border-(--border)">Braille Pattern</th>
                      <th className="p-3 border-b border-(--border) hidden sm:table-cell">Dot Positions</th>
                      <th className="p-3 border-b border-(--border)">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PUNCTUATION_DATA.map(item => {
                      const st = letterStatuses[item.char];
                      return (
                        <tr key={item.char} className="border-b border-(--border) hover:bg-(--muted) transition-colors">
                          <td className={`p-3 font-black text-(--foreground) ${largeText ? "text-2xl" : "text-xl"}`}>{item.char}</td>
                          <td className="p-3 text-xs font-bold text-(--muted-foreground)">{item.name}</td>
                          <td className="p-3">
                            <BrailleDots dots={item.dots} size={40} label={`${item.name} braille`} />
                          </td>
                          <td className="p-3 text-xs font-mono text-(--muted-foreground) hidden sm:table-cell">
                            {item.dots.map(d => d ? `●` : `○`).join(" ")}
                          </td>
                          <td className="p-3"><StatusDot status={st} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PROGRESS SECTION */}
        {(mode === "learn" || mode === "reference" || totalCorrect + totalIncorrect > 0) && (
          <div className="mt-10">
            <div className="rounded-3xl p-6 border bg-(--card) border-(--border)">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-(--foreground) uppercase tracking-widest">
                <BarChart3 className="w-4 h-4" /> Progress Overview
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <StatCard label="Correct" value={totalCorrect} icon={CheckCircle2} color="bg-emerald-500" />
                <StatCard label="Incorrect" value={totalIncorrect} icon={XCircle} color="bg-red-500" />
                <StatCard label="Streak" value={streakCount} icon={Zap} color="bg-amber-500" />
                <StatCard label="Mastered" value={`${masteredCount}/${ALL_CHARS.length}`} icon={Trophy} color="bg-purple-500" />
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {ALL_CHARS.map(item => {
                  const st = letterStatuses[item.char];
                  return (
                    <div
                      key={item.char}
                      className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg border min-w-[32px]"
                      style={{ borderColor: "var(--border)" }}
                      title={item.desc}
                    >
                      <span className="text-xs font-bold text-(--foreground)">{item.char}</span>
                      <StatusDot status={st} />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-[10px] font-bold text-(--muted-foreground)">
                <span className="flex items-center gap-1"><StatusDot status="new" /> New</span>
                <span className="flex items-center gap-1"><StatusDot status="learning" /> Learning</span>
                <span className="flex items-center gap-1"><StatusDot status="mastered" /> Mastered</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
