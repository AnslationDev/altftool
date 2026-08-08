"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import {
  Atom,
  Trophy,
  Zap,
  HelpCircle,
  RotateCcw,
  RefreshCw,
  Target,
  Hash,
  Type,
  Check,
  X,
  Clock,
  BarChart3,
  Layers,
  Volume2,
  VolumeX,
  Star,
  Medal,
} from "lucide-react";
import {
  ELEMENTS,
  ELEMENT_MAP,
  CATEGORIES,
  DIFFICULTY_CATEGORIES,
  COMMON_ELEMENTS,
} from "../data/elements";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let sharedAudioCtx = null;
function getAudioContext() {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new Ctor();
  }
  return sharedAudioCtx;
}

function playTone(freq, duration, type) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

function playCorrect() {
  playTone(523.25, 0.1);
  setTimeout(() => playTone(659.25, 0.1), 100);
  setTimeout(() => playTone(783.99, 0.15), 200);
}

function playWrong() {
  playTone(200, 0.3, "sawtooth");
}

function playTick() {
  playTone(1000, 0.05);
}

function useSound(enabled) {
  return useCallback(
    (type) => {
      if (!enabled) return;
      if (type === "correct") playCorrect();
      else if (type === "wrong") playWrong();
      else if (type === "tick") playTick();
    },
    [enabled],
  );
}

const QUIZ_MODES = [
  { id: "find", label: "Find Element", icon: Target, desc: "Click the correct cell for the given element name" },
  { id: "symbol", label: "Symbol Challenge", icon: Type, desc: "Identify the element from its symbol" },
  { id: "atomic", label: "Atomic Number", icon: Hash, desc: "Identify the element from its atomic number" },
];

const TIMER_OPTIONS = [
  { value: 0, label: "No timer" },
  { value: 30, label: "30s" },
  { value: 60, label: "60s" },
  { value: 120, label: "120s" },
];

const DIFFICULTIES = [
  { id: "easy", label: "Easy", desc: "Common elements" },
  { id: "medium", label: "Medium", desc: "Main group + transition metals" },
  { id: "hard", label: "Hard", desc: "All 118 elements" },
];

const QUESTIONS_PER_GAME = 10;

function getElementPool(difficulty) {
  if (difficulty === "easy") {
    return COMMON_ELEMENTS.map((z) => ELEMENT_MAP[z]).filter(Boolean);
  }
  const cats = DIFFICULTY_CATEGORIES[difficulty] || DIFFICULTY_CATEGORIES.medium;
  return ELEMENTS.filter((e) => cats.includes(e.cat));
}

const LANTHANIDE_CELLS = [];
for (let grp = 4; grp <= 17; grp++) {
  LANTHANIDE_CELLS.push({ grp, per: 9 });
}

const ACTINIDE_CELLS = [];
for (let grp = 4; grp <= 17; grp++) {
  ACTINIDE_CELLS.push({ grp, per: 10 });
}

const CELL_EL = React.memo(function CELL_EL({
  element,
  isTarget,
  isSelected,
  isHinted,
  onClick,
  disabled,
}) {
  const cat = element ? CATEGORIES[element.cat] : null;
  const bgColor = cat ? cat.color : "transparent";

  let borderClass = "border-[var(--border)]";
  if (isTarget && isSelected) borderClass = "border-green-500 border-2";
  else if (isSelected && !isTarget) borderClass = "border-red-500 border-2";
  else if (isTarget) borderClass = "border-green-400 border-2";
  else if (isHinted) borderClass = "border-yellow-400 border-2 animate-pulse";

  return (
    <button
      onClick={() => onClick(element)}
      disabled={disabled || !element}
      aria-label={element ? `${element.name} (${element.sym}), atomic number ${element.z}` : "Empty cell"}
      className={`relative flex flex-col items-center justify-center rounded-[4px] border text-[10px] font-semibold leading-tight transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1
        ${element ? "cursor-pointer hover:scale-110 hover:shadow-md hover:z-10 active:scale-105" : "cursor-default"}
        ${disabled && element ? "opacity-60" : ""}
        ${borderClass}
        max-sm:text-[7px] max-sm:px-[1px] max-sm:py-[1px] sm:text-[9px] md:text-[11px]
        bg-[var(--surface)]`}
      style={element ? { borderLeft: `3px solid ${bgColor}` } : {}}
    >
      {element && (
        <>
          <span className="absolute top-[1px] left-[2px] text-[8px] opacity-50 max-sm:text-[5px] md:text-[9px]">
            {element.z}
          </span>
          <span className="text-xs font-bold leading-none max-sm:text-[8px] md:text-sm">
            {element.sym}
          </span>
          <span className="hidden leading-none max-sm:text-[5px] sm:block md:text-[9px] opacity-70">
            {element.name}
          </span>
        </>
      )}
    </button>
  );
});

function PeriodicGrid({
  question,
  selectedElement,
  answered,
  onCellClick,
  hintRow,
  onBrowseClick,
}) {
  const handleClick = onBrowseClick || ((el) => { if (onCellClick) onCellClick(el); });
  const rows = [];
  for (let per = 1; per <= 7; per++) {
    const cellsInRow = [];
    for (let grp = 1; grp <= 18; grp++) {
      const isEmpty =
        (per === 1 && grp > 1 && grp < 18) ||
        ((per === 2 || per === 3) && grp > 2 && grp < 13);
      if (isEmpty) {
        cellsInRow.push(<div key={`${grp}-${per}`} className="aspect-square" />);
      } else {
        const el = ELEMENTS.find((e) => e.grp === grp && e.per === per) || null;
        const isTarget = answered && el && question && el.z === question.z;
        const isSel = el && selectedElement && el.z === (selectedElement?.z || selectedElement);
        const isHighlighted = hintRow !== null && per === hintRow && !isTarget;
        cellsInRow.push(
          <CELL_EL
            key={`${grp}-${per}`}
            element={el}
            isTarget={isTarget}
            isSelected={isSel}
            isHinted={isHighlighted}
            onClick={handleClick}
            disabled={answered}
          />,
        );
      }
    }
    rows.push(
      <div key={per} className="contents">
        {cellsInRow}
      </div>,
    );
  }

  return (
    <div className="grid gap-[2px] sm:gap-[3px]" style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))" }}>
      {rows}
      <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[var(--muted)] sm:text-xs" style={{ gridColumn: "1 / -1" }}>
        <span className="w-12 text-right">Lanthanides</span>
        <div className="flex-1 grid gap-[2px] sm:gap-[3px]" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
          {LANTHANIDE_CELLS.map(({ grp, per }) => {
            const el = ELEMENTS.find((e) => e.grp === grp && e.per === per) || null;
            const isTarget = answered && el && question && el.z === question.z;
            const isSel = el && selectedElement && el.z === (selectedElement?.z || selectedElement);
            const isHighlighted = hintRow !== null && per === hintRow && !isTarget;
            return (
              <CELL_EL
                key={`lan-${grp}-${per}`}
                element={el}
                isTarget={isTarget}
                isSelected={isSel}
                isHinted={isHighlighted}
                onClick={handleClick}
                disabled={answered}
              />
            );
          })}
        </div>
      </div>
      <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[var(--muted)] sm:text-xs" style={{ gridColumn: "1 / -1" }}>
        <span className="w-12 text-right">Actinides</span>
        <div className="flex-1 grid gap-[2px] sm:gap-[3px]" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
          {ACTINIDE_CELLS.map(({ grp, per }) => {
            const el = ELEMENTS.find((e) => e.grp === grp && e.per === per) || null;
            const isTarget = answered && el && question && el.z === question.z;
            const isSel = el && selectedElement && el.z === (selectedElement?.z || selectedElement);
            const isHighlighted = hintRow !== null && per === hintRow && !isTarget;
            return (
              <CELL_EL
                key={`act-${grp}-${per}`}
                element={el}
                isTarget={isTarget}
                isSelected={isSel}
                isHinted={isHighlighted}
                onClick={handleClick}
                disabled={answered}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ElementDetails({ element, onClose }) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!element) return;
    previousFocusRef.current = document.activeElement;
    dialogRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
        previousFocusRef.current.focus();
      }
    };
  }, [element, onClose]);

  if (!element) return null;
  const cat = CATEGORIES[element.cat];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg focus:outline-none"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Element details for ${element.name}`}
      >
        <div className="mb-4 flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold text-white shadow-md"
            style={{ backgroundColor: cat?.color || "#888" }}
          >
            {element.sym}
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--foreground)]">{element.name}</h3>
            <p className="text-sm text-[var(--muted)]">{element.sym} &middot; Z = {element.z}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-[var(--surface)] p-3">
            <span className="text-[10px] font-semibold uppercase text-[var(--muted)]">Group</span>
            <p className="mt-1 font-semibold text-[var(--foreground)]">{element.grp}</p>
          </div>
          <div className="rounded-lg bg-[var(--surface)] p-3">
            <span className="text-[10px] font-semibold uppercase text-[var(--muted)]">Period</span>
            <p className="mt-1 font-semibold text-[var(--foreground)]">{element.per <= 7 ? element.per : element.per === 9 ? "6 (Lanthanide)" : "7 (Actinide)"}</p>
          </div>
          <div className="col-span-2 rounded-lg bg-[var(--surface)] p-3">
            <span className="text-[10px] font-semibold uppercase text-[var(--muted)]">Category</span>
            <p className="mt-1 font-semibold text-[var(--foreground)]">{cat?.label || element.cat}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-[var(--primary)] py-2.5 text-sm font-bold text-white transition hover:opacity-90"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-[var(--surface-soft)]" />
      <div className="h-4 w-96 rounded-lg bg-[var(--surface-soft)]" />
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-[var(--surface-soft)]" />
        ))}
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))" }}>
        {Array.from({ length: 126 }).map((_, i) => (
          <div key={i} className="aspect-square rounded bg-[var(--surface-soft)]" />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--surface-soft)]">
        <Atom className="h-10 w-10 text-[var(--muted)]" />
      </div>
      <h3 className="text-xl font-bold text-[var(--foreground)]">No quizzes played yet</h3>
      <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
        Choose a quiz mode, set your difficulty, and start testing your chemistry knowledge!
      </p>
      <button
        onClick={onStart}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
      >
        <Zap className="h-4 w-4" />
        Start a Quiz
      </button>
    </div>
  );
}

class GameErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <X className="mb-4 h-12 w-12 text-red-500" />
          <h3 className="text-xl font-bold text-[var(--foreground)]">Something went wrong</h3>
          <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
            {this.state.error?.message || "An unexpected error occurred. Please refresh and try again."}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" />
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });
  const setStored = useCallback(
    (v) => {
      setValue((prev) => {
        const next = typeof v === "function" ? v(prev) : v;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    },
    [key],
  );
  return [value, setStored];
}

export default function ToolHome() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [quizMode, setQuizMode] = useState("find");
  const [difficulty, setDifficulty] = useState("medium");
  const [timerDuration, setTimerDuration] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameState, setGameState] = useState("idle");
  const [question, setQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [activeHint, setActiveHint] = useState(null);
  const [usedHints, setUsedHints] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [gamesPlayed, setGamesPlayed] = useLocalStorage("ptg-games-played", 0);
  const [allTimeCorrect, setAllTimeCorrect] = useLocalStorage("ptg-correct", 0);
  const [allTimeIncorrect, setAllTimeIncorrect] = useLocalStorage("ptg-incorrect", 0);
  const [allTimeBestStreak, setAllTimeBestStreak] = useLocalStorage("ptg-best-streak", 0);

  const timerRef = useRef(null);
  const finishGameRef = useRef(null);
  const sound = useSound(soundEnabled);

  const pool = useMemo(() => getElementPool(difficulty), [difficulty]);

  const generateQuestions = useCallback(() => {
    const p = pool;
    if (!p.length) return [];
    const qs = [];
    const copy = shuffle([...p]);
    const count = Math.min(QUESTIONS_PER_GAME, p.length);
    const selected = copy.slice(0, count);
    for (let i = 0; i < selected.length; i++) {
      qs.push(selected[i]);
    }
    return qs;
  }, [pool]);

  const generateOptions = useCallback(
    (correctEl, count = 4) => {
      const others = pool.filter((e) => e.z !== correctEl.z);
      const shuffled = shuffle(others).slice(0, count - 1);
      return shuffle([correctEl, ...shuffled]);
    },
    [pool],
  );

  const startTimer = useCallback(() => {
    if (timerDuration <= 0) return;
    setTimeLeft(timerDuration);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          finishGameRef.current?.();
          return 0;
        }
        if (t <= 6) playTick();
        return t - 1;
      });
    }, 1000);
  }, [timerDuration]);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const startGame = useCallback(() => {
    const qs = generateQuestions();
    if (!qs.length) return;
    setQuestions(qs);
    setQuestionIndex(0);
    setScore(0);
    setCorrect(0);
    setIncorrect(0);
    setStreak(0);
    setBestStreak(0);
    setHintsLeft(3);
    setGameState("playing");
    setAnswered(false);
    setFeedback(null);
    setActiveHint(null);
    setUsedHints([]);
    setSelectedElement(null);
    setSelectedOption(null);
    clearInterval(timerRef.current);
    startTimer();
  }, [generateQuestions, startTimer]);

  useEffect(() => {
    if (gameState === "playing" && questions.length > 0) {
      const el = questions[0];
      setQuestion(el);
      if (quizMode !== "find") {
        setOptions(generateOptions(el));
      }
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "playing" || !questions.length) return;
    if (questionIndex >= questions.length) {
      finishGameRef.current?.();
      return;
    }
    const el = questions[questionIndex];
    setQuestion(el);
    setSelectedElement(null);
    setAnswered(false);
    setFeedback(null);
    setActiveHint(null);
    setUsedHints([]);
    setSelectedOption(null);
    if (quizMode !== "find") {
      setOptions(generateOptions(el));
    }
  }, [questionIndex, gameState, questions, quizMode, generateOptions]);

  useEffect(() => {
    if (gameState !== "playing" || !question) return;
    let timeout = null;
    if (answered) {
      timeout = setTimeout(() => {
        const nextIdx = questionIndex + 1;
        if (nextIdx >= questions.length) {
          clearInterval(timerRef.current);
          finishGameRef.current?.();
        } else {
          setQuestionIndex(nextIdx);
        }
      }, 1200);
    }
    return () => clearTimeout(timeout);
  }, [answered, questionIndex, questions.length, gameState, question]);

  const handleCellClick = useCallback(
    (el) => {
      if (answered || !question || gameState !== "playing") return;
      if (quizMode !== "find") return;
      const isCorrect = el && el.z === question.z;
      setSelectedElement(el);
      setAnswered(true);
      setFeedback(isCorrect);
      if (isCorrect) {
        setScore((s) => s + 10 + streak * 2);
        setCorrect((c) => c + 1);
        setStreak((st) => {
          const ns = st + 1;
          if (ns > bestStreak) setBestStreak(ns);
          return ns;
        });
        sound("correct");
      } else {
        setStreak(0);
        setIncorrect((i) => i + 1);
        sound("wrong");
      }
    },
    [answered, question, gameState, quizMode, streak, bestStreak, sound],
  );

  const handleOptionSelect = useCallback(
    (el) => {
      if (answered || !question || gameState !== "playing") return;
      const isCorrect = el.z === question.z;
      setSelectedOption(el.z);
      setAnswered(true);
      setFeedback(isCorrect);
      if (isCorrect) {
        setScore((s) => s + 10 + streak * 2);
        setCorrect((c) => c + 1);
        setStreak((st) => {
          const ns = st + 1;
          if (ns > bestStreak) setBestStreak(ns);
          return ns;
        });
        sound("correct");
      } else {
        setStreak(0);
        setIncorrect((i) => i + 1);
        sound("wrong");
      }
    },
    [answered, question, gameState, quizMode, streak, bestStreak, sound],
  );

  const useHint = useCallback(() => {
    if (hintsLeft <= 0 || answered || !question) return;
    setHintsLeft((h) => h - 1);
    const hints = ["group", "period", "category"];
    const available = hints.filter((h) => !usedHints.includes(h));
    if (available.length === 0) return;
    const hint = available[Math.floor(Math.random() * available.length)];
    setActiveHint(hint);
    setUsedHints((u) => [...u, hint]);
  }, [hintsLeft, answered, question, usedHints]);

  const finishGame = useCallback(() => {
    clearInterval(timerRef.current);
    setGameState("finished");
    setGamesPlayed((g) => g + 1);
    setAllTimeCorrect((c) => c + correct);
    setAllTimeIncorrect((c) => c + incorrect);
    if (bestStreak > allTimeBestStreak) {
      setAllTimeBestStreak(bestStreak);
    }
  }, [correct, incorrect, bestStreak, setGamesPlayed, setAllTimeCorrect, setAllTimeIncorrect, setAllTimeBestStreak]);

  useEffect(() => {
    finishGameRef.current = finishGame;
  });

  const handleBrowseClick = useCallback((el) => {
    if (el) setShowDetails(el);
  }, []);

  const accuracy = useMemo(() => {
    const total = correct + incorrect;
    return total === 0 ? 0 : Math.round((correct / total) * 100);
  }, [correct, incorrect]);

  const allTimeAccuracy = useMemo(() => {
    const total = allTimeCorrect + allTimeIncorrect;
    return total === 0 ? 0 : Math.round((allTimeCorrect / total) * 100);
  }, [allTimeCorrect, allTimeIncorrect]);

  const hintMsg = useMemo(() => {
    if (!activeHint || !question) return null;
    if (activeHint === "group") return `Group: ${question.grp}`;
    if (activeHint === "period") return `Period: ${question.per <= 7 ? question.per : question.per === 9 ? "6 (Lanthanide)" : "7 (Actinide)"}`;
    if (activeHint === "category") return `Category: ${CATEGORIES[question.cat]?.label || question.cat}`;
    return null;
  }, [activeHint, question]);

  const hintRow = useMemo(() => {
    if (!activeHint || !question) return null;
    if (activeHint === "period") return question.per;
    return null;
  }, [activeHint, question]);

  const statCards = useMemo(
    () => [
      { label: "Score", value: score, icon: Trophy },
      { label: "Correct", value: correct, icon: Check, color: "text-green-500" },
      { label: "Incorrect", value: incorrect, icon: X, color: "text-red-500" },
      { label: "Streak", value: streak, icon: Zap },
      { label: "Accuracy", value: `${accuracy}%`, icon: BarChart3 },
      { label: "Q.", value: `${questionIndex + 1}/${questions.length || QUESTIONS_PER_GAME}`, icon: Layers },
    ],
    [score, correct, incorrect, streak, accuracy, questionIndex, questions.length],
  );

  if (!mounted) return <LoadingSkeleton />;

  return (
    <GameErrorBoundary>
      <main className="min-h-screen bg-[var(--background)] px-2 py-4 text-[var(--foreground)] sm:px-4 sm:py-6 lg:px-6 lg:py-8">
        <div className="mx-auto max-w-7xl">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
              <Atom className="h-4 w-4" />
              Chemistry Game
            </div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
                  Periodic Table Game
                </h1>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                  Test your chemistry knowledge with interactive quizzes.
                </p>
              </div>
              <button
                onClick={() => setSoundEnabled((s) => !s)}
                aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                  soundEnabled
                    ? "border-[var(--border)] text-[var(--foreground)]"
                    : "border-red-200 bg-red-50 text-red-500 dark:border-red-800 dark:bg-red-900/20"
                }`}
              >
                {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>
            </div>
          </section>

          {gameState === "idle" && (
            <div className="mt-6 space-y-6">
              <EmptyState onStart={() => setShowSettings(true)} />
              {showSettings && (
                <section className="mx-auto max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-bold">Quiz Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[var(--muted)]">Quiz Mode</label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {QUIZ_MODES.map((m) => {
                          const Icon = m.icon;
                          const active = quizMode === m.id;
                          return (
                            <button
                              key={m.id}
                              onClick={() => setQuizMode(m.id)}
                              className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-sm transition ${
                                active
                                  ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]"
                                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                              }`}
                            >
                              <Icon className="h-6 w-6" />
                              <span className="font-semibold">{m.label}</span>
                              <span className="text-[10px] opacity-70">{m.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[var(--muted)]">Difficulty</label>
                      <div className="grid grid-cols-3 gap-2">
                        {DIFFICULTIES.map((d) => {
                          const active = difficulty === d.id;
                          return (
                            <button
                              key={d.id}
                              onClick={() => setDifficulty(d.id)}
                              className={`rounded-xl border-2 p-3 text-center text-sm transition ${
                                active
                                  ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]"
                                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--primary)]"
                              }`}
                            >
                              <span className="block font-semibold">{d.label}</span>
                              <span className="text-[10px] opacity-70">{d.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[var(--muted)]">Timer</label>
                      <div className="flex flex-wrap gap-2">
                        {TIMER_OPTIONS.map((t) => (
                          <button
                            key={t.value}
                            onClick={() => setTimerDuration(t.value)}
                            className={`rounded-lg border-2 px-4 py-2 text-sm font-semibold transition ${
                              timerDuration === t.value
                                ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]"
                                : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--primary)]"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={startGame}
                      className="mt-4 w-full rounded-xl bg-[var(--primary)] py-3 text-base font-bold text-white transition hover:opacity-90"
                    >
                      <Zap className="mr-2 inline-block h-5 w-5" />
                      Start Quiz
                    </button>
                  </div>
                </section>
              )}
              {!showSettings && (
                <section className="mx-auto max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-bold">Your Statistics</h2>
                  {gamesPlayed > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-xl bg-[var(--surface)] p-3 text-center">
                        <p className="text-2xl font-bold text-[var(--primary)]">{gamesPlayed}</p>
                        <p className="text-[10px] font-semibold uppercase text-[var(--muted)]">Games</p>
                      </div>
                      <div className="rounded-xl bg-[var(--surface)] p-3 text-center">
                        <p className="text-2xl font-bold text-green-500">{allTimeAccuracy}%</p>
                        <p className="text-[10px] font-semibold uppercase text-[var(--muted)]">Accuracy</p>
                      </div>
                      <div className="rounded-xl bg-[var(--surface)] p-3 text-center">
                        <p className="text-2xl font-bold text-[var(--foreground)]">{allTimeBestStreak}</p>
                        <p className="text-[10px] font-semibold uppercase text-[var(--muted)]">Best Streak</p>
                      </div>
                      <div className="rounded-xl bg-[var(--surface)] p-3 text-center">
                        <p className="text-2xl font-bold text-[var(--foreground)]">{allTimeCorrect + allTimeIncorrect}</p>
                        <p className="text-[10px] font-semibold uppercase text-[var(--muted)]">Total Qs</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--muted)]">Play your first game to see statistics!</p>
                  )}
                </section>
              )}
            </div>
          )}

          {gameState === "idle" && (
            <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--foreground)]">Interactive Periodic Table</h2>
                <p className="text-[10px] text-[var(--muted)] sm:text-xs">Click any element for details</p>
              </div>
              <div className="overflow-x-auto pb-2">
                <div className="min-w-[700px]">
                  <PeriodicGrid onBrowseClick={handleBrowseClick} />
                </div>
              </div>
            </section>
          )}

          {gameState === "playing" && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
                {statCards.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 text-center shadow-sm sm:p-3"
                  >
                    <s.icon className={`mx-auto mb-1 h-4 w-4 ${s.color || "text-[var(--primary)]"}`} />
                    <p className="text-lg font-bold leading-tight sm:text-xl">{s.value}</p>
                    <p className="text-[9px] font-semibold uppercase text-[var(--muted)] sm:text-[10px]">{s.label}</p>
                  </div>
                ))}
              </div>

              {timerDuration > 0 && (
                <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
                  <Clock className={`h-5 w-5 ${timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-[var(--primary)]"}`} />
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-soft)]">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          timeLeft <= 10
                            ? "bg-red-500"
                            : timeLeft <= 30
                              ? "bg-yellow-500"
                              : "bg-[var(--primary)]"
                        }`}
                        style={{ width: `${(timeLeft / timerDuration) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span
                    className={`min-w-[3rem] text-right text-lg font-bold tabular-nums ${
                      timeLeft <= 10 ? "text-red-500" : "text-[var(--foreground)]"
                    }`}
                  >
                    {timeLeft}s
                  </span>
                </div>
              )}

              <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-6">
                {question && (
                  <div className="mb-4 text-center">
                    {quizMode === "find" && (
                      <div>
                        <p className="text-sm font-semibold text-[var(--muted)]">Click the correct cell for:</p>
                        <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{question.name}</p>
                        <p className="text-sm text-[var(--muted)]">Z = {question.z} &middot; {question.sym}</p>
                      </div>
                    )}
                    {quizMode === "symbol" && (
                      <div>
                        <p className="text-sm font-semibold text-[var(--muted)]">Which element has the symbol:</p>
                        <p className="mt-1 text-3xl font-bold text-[var(--primary)]">{question.sym}</p>
                      </div>
                    )}
                    {quizMode === "atomic" && (
                      <div>
                        <p className="text-sm font-semibold text-[var(--muted)]">Which element has atomic number:</p>
                        <p className="mt-1 text-3xl font-bold text-[var(--primary)]">{question.z}</p>
                      </div>
                    )}
                  </div>
                )}

                {hintMsg && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="mx-auto mb-3 max-w-md rounded-lg bg-yellow-500/10 p-2 text-center text-sm font-semibold text-yellow-600 dark:text-yellow-400"
                  >
                    💡 {hintMsg}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                  <button
                    onClick={useHint}
                    disabled={hintsLeft <= 0 || answered}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] transition hover:border-yellow-400 hover:text-yellow-600 disabled:opacity-40"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    Hint ({hintsLeft})
                  </button>
                  <button
                    onClick={finishGame}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                  >
                    <X className="h-3.5 w-3.5" />
                    End Quiz
                  </button>
                </div>

                {feedback !== null && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`mx-auto mb-3 max-w-md animate-in fade-in slide-in-from-top-2 rounded-xl p-3 text-center text-sm font-bold ${
                      feedback
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {feedback ? (
                      <span className="inline-flex items-center gap-2">
                        <Check className="h-5 w-5" /> Correct! +{10 + streak * 2} pts
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <X className="h-5 w-5" /> Incorrect! It was {question?.name} ({question?.sym})
                      </span>
                    )}
                  </div>
                )}

                {quizMode === "find" ? (
                  <div className="overflow-x-auto pb-2">
                    <div className="min-w-[700px]">
                      <PeriodicGrid
                        question={question}
                        selectedElement={selectedElement}
                        answered={answered}
                        onCellClick={handleCellClick}
                        hintRow={hintRow}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {options.map((el) => {
                      const isSelected = selectedOption === el.z;
                      const isCorrect = question && el.z === question.z;
                      let borderCls = "border-[var(--border)]";
                      if (answered && isCorrect) borderCls = "border-green-500 border-2 bg-green-50 dark:bg-green-900/10";
                      else if (answered && isSelected && !isCorrect) borderCls = "border-red-500 border-2 bg-red-50 dark:bg-red-900/10";
                      else if (isSelected) borderCls = "border-[var(--primary)] border-2";
                      return (
                        <button
                          key={el.z}
                          onClick={() => handleOptionSelect(el)}
                          disabled={answered}
                          className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 transition ${
                            answered
                              ? "cursor-default"
                              : "cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--surface)]"
                          } ${borderCls} bg-[var(--surface)]`}
                          aria-label={el.name}
                        >
                          <span className="text-xs text-[var(--muted)]">#{el.z}</span>
                          <span className="text-xl font-bold">{el.sym}</span>
                          <span className="text-sm">{el.name}</span>
                          {answered && isCorrect && <Check className="mt-1 h-5 w-5 text-green-500" />}
                          {answered && isSelected && !isCorrect && <X className="mt-1 h-5 w-5 text-red-500" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}

          {gameState === "finished" && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="mx-auto max-w-2xl rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-lg sm:p-8">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary)]/10">
                    {accuracy >= 80 ? (
                      <Trophy className="h-10 w-10 text-yellow-500" />
                    ) : accuracy >= 50 ? (
                      <Medal className="h-10 w-10 text-[var(--primary)]" />
                    ) : (
                      <Star className="h-10 w-10 text-[var(--muted)]" />
                    )}
                  </div>
                </div>
                <h2 className="text-2xl font-black text-[var(--foreground)] sm:text-3xl">
                  {accuracy >= 80
                    ? "Excellent!"
                    : accuracy >= 50
                      ? "Good Effort!"
                      : "Keep Practicing!"}
                </h2>
                <p className="mt-2 text-[var(--muted)]">
                  {quizMode === "find"
                    ? "Find Element"
                    : quizMode === "symbol"
                      ? "Symbol Challenge"
                      : "Atomic Number Challenge"}{" "}
                  &middot;{" "}
                  {DIFFICULTIES.find((d) => d.id === difficulty)?.label || difficulty}
                  {timerDuration > 0 && ` \u00b7 ${timerDuration}s timer`}
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl bg-[var(--surface)] p-3">
                    <p className="text-2xl font-bold text-[var(--foreground)]">{score}</p>
                    <p className="text-[10px] font-semibold uppercase text-[var(--muted)]">Score</p>
                  </div>
                  <div className="rounded-xl bg-[var(--surface)] p-3">
                    <p className="text-2xl font-bold text-green-500">{correct}/{correct + incorrect}</p>
                    <p className="text-[10px] font-semibold uppercase text-[var(--muted)]">Correct</p>
                  </div>
                  <div className="rounded-xl bg-[var(--surface)] p-3">
                    <p className="text-2xl font-bold text-[var(--primary)]">{accuracy}%</p>
                    <p className="text-[10px] font-semibold uppercase text-[var(--muted)]">Accuracy</p>
                  </div>
                  <div className="rounded-xl bg-[var(--surface)] p-3">
                    <p className="text-2xl font-bold text-[var(--foreground)]">{bestStreak}</p>
                    <p className="text-[10px] font-semibold uppercase text-[var(--muted)]">Best Streak</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    onClick={startGame}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Play Again
                  </button>
                  <button
                    onClick={() => {
                      setGameState("idle");
                      setShowSettings(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--primary)]"
                  >
                    <RotateCcw className="h-4 w-4" />
                    New Settings
                  </button>
                </div>
              </section>
            </div>
          )}

          <section className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-6">
            <h2 className="mb-2 text-sm font-bold">Legend</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <span key={key} className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-3 w-3 rounded"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.label}
                </span>
              ))}
            </div>
          </section>
        </div>
        {showDetails && <ElementDetails element={showDetails} onClose={() => setShowDetails(null)} />}
      </main>
    </GameErrorBoundary>
  );
}
