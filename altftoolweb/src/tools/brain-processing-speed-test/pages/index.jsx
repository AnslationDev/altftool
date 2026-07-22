"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  Brain,
  BarChart2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SafeResponsiveContainer from "@/components/charts/SafeResponsiveContainer";

const PHASES = { SETUP: "setup", RUNNING: "running", FEEDBACK: "feedback" };
const TOTAL_SECONDS = 60;

// 9 Unicode symbols mapped to digits 1-9
const SYMBOL_MAP = [
  { digit: 1, symbol: "▲" },
  { digit: 2, symbol: "●" },
  { digit: 3, symbol: "★" },
  { digit: 4, symbol: "◆" },
  { digit: 5, symbol: "✦" },
  { digit: 6, symbol: "♠" },
  { digit: 7, symbol: "✿" },
  { digit: 8, symbol: "⬟" },
  { digit: 9, symbol: "✖" },
];

function getRandomSymbolEntry() {
  return SYMBOL_MAP[Math.floor(Math.random() * SYMBOL_MAP.length)];
}

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-600"
      : tone === "warn"
        ? "bg-rose-500/10 text-rose-600"
        : "bg-[var(--section-highlight)] text-[var(--primary)]";

  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
      <div className="flex min-w-0 items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="break-words text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
          <p className="mt-1 text-xl font-extrabold text-[var(--foreground)]">{value}</p>
          {detail && <p className="mt-1 break-words text-sm leading-5 text-[var(--muted-foreground)]">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

export default function BrainProcessingSpeedTest() {
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [currentSymbol, setCurrentSymbol] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [results, setResults] = useState(null);

  const timerRef = useRef(null);
  const feedbackTimer = useRef(null);
  const correctRef = useRef(0);
  const incorrectRef = useRef(0);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const endTest = useCallback(() => {
    cleanup();
    const totalAttempts = correctRef.current + incorrectRef.current;
    const accuracy = totalAttempts > 0
      ? Math.round((correctRef.current / totalAttempts) * 100)
      : 0;

    let grade, tone;
    if (correctRef.current >= 60) { grade = "Elite"; tone = "good"; }
    else if (correctRef.current >= 45) { grade = "Above Average"; tone = "good"; }
    else if (correctRef.current >= 30) { grade = "Average"; tone = "default"; }
    else { grade = "Below Average"; tone = "warn"; }

    setResults({ correct: correctRef.current, incorrect: incorrectRef.current, accuracy, grade, tone });
    setPhase(PHASES.FEEDBACK);
  }, [cleanup]);

  const startTest = useCallback(() => {
    cleanup();
    correctRef.current = 0;
    incorrectRef.current = 0;
    setCorrect(0);
    setIncorrect(0);
    setFeedback(null);
    setTimeLeft(TOTAL_SECONDS);
    setCurrentSymbol(getRandomSymbolEntry());
    setPhase(PHASES.RUNNING);

    let remaining = TOTAL_SECONDS;
    timerRef.current = setInterval(() => {
      remaining--;
      setTimeLeft(remaining);
      if (remaining <= 0) {
        endTest();
      }
    }, 1000);
  }, [cleanup, endTest]);

  const handleKeyPress = useCallback((digit) => {
    if (phase !== PHASES.RUNNING || !currentSymbol) return;
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);

    const isCorrect = digit === currentSymbol.digit;
    if (isCorrect) {
      correctRef.current++;
      setCorrect((p) => p + 1);
      setFeedback("correct");
    } else {
      incorrectRef.current++;
      setIncorrect((p) => p + 1);
      setFeedback("wrong");
    }

    setCurrentSymbol(getRandomSymbolEntry());
    feedbackTimer.current = setTimeout(() => setFeedback(null), 300);
  }, [phase, currentSymbol]);

  useEffect(() => {
    if (phase !== PHASES.RUNNING) return;

    const handleKeyDown = (e) => {
      const digit = parseInt(e.key, 10);
      if (digit >= 1 && digit <= 9) {
        e.preventDefault();
        handleKeyPress(digit);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, handleKeyPress]);

  const timerPercent = (timeLeft / TOTAL_SECONDS) * 100;

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] transition-colors py-6 px-4">
      <header className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/10">
          <Zap className="h-8 w-8 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Brain Processing Speed Test
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
          Measure your visual processing speed and cognitive efficiency with a clinical symbol-to-digit substitution task.
        </p>
      </header>

      {phase === PHASES.SETUP && (
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-[var(--foreground)]">Instructions</h2>
            <ul className="mb-8 space-y-3 text-left text-sm text-[var(--muted-foreground)]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                <span>A legend will show you which number (1-9) corresponds to each symbol.</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="h-5 w-5 shrink-0 text-yellow-500" />
                <span>A symbol will flash on screen. Press the <strong>number key</strong> that matches it.</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-5 w-5 shrink-0 text-blue-500" />
                <span>You have <strong>60 seconds</strong>. Answer as many as you can correctly!</span>
              </li>
            </ul>

            {/* Symbol key reference */}
            <div className="mb-8 w-full rounded-xl border border-[var(--border)] bg-[var(--section-highlight)] p-4">
              <p className="mb-3 text-center text-xs font-bold uppercase text-[var(--muted-foreground)]">Symbol-to-Number Key</p>
              <div className="grid grid-cols-9 gap-2">
                {SYMBOL_MAP.map((entry) => (
                  <div key={entry.digit} className="flex flex-col items-center gap-1">
                    <span className="text-xl font-bold text-[var(--foreground)]">{entry.symbol}</span>
                    <span className="text-xs font-extrabold text-[var(--primary)]">{entry.digit}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={startTest} className="btn-primary w-full max-w-sm rounded-xl py-4 text-lg">
              Start Test (60 seconds)
            </button>
          </div>
        </div>
      )}

      {phase === PHASES.RUNNING && currentSymbol && (
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8">
          {/* Timer bar */}
          <div className="w-full max-w-lg">
            <div className="mb-2 flex justify-between text-sm font-bold">
              <span className={timeLeft <= 10 ? "text-rose-500 animate-pulse" : "text-[var(--muted-foreground)]"}>
                {timeLeft}s remaining
              </span>
              <span className="text-[var(--foreground)]">{correct} correct</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className={`h-full transition-all duration-1000 ${timeLeft <= 10 ? "bg-rose-500" : "bg-yellow-500"}`}
                style={{ width: `${timerPercent}%` }}
              />
            </div>
          </div>

          {/* Symbol legend strip */}
          <div className="w-full rounded-xl border border-[var(--border)] bg-[var(--section-highlight)] p-3">
            <div className="grid grid-cols-9 gap-2">
              {SYMBOL_MAP.map((entry) => (
                <div key={entry.digit} className={`flex flex-col items-center gap-1 rounded-lg p-1 transition-all ${currentSymbol.digit === entry.digit ? "bg-yellow-500/20 ring-2 ring-yellow-500" : ""}`}>
                  <span className="text-lg font-bold text-[var(--foreground)]">{entry.symbol}</span>
                  <span className="text-xs font-extrabold text-[var(--primary)]">{entry.digit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Current symbol display */}
          <div className={`flex h-48 w-48 items-center justify-center rounded-3xl border-4 transition-all duration-150 ${
            feedback === "correct" ? "border-emerald-500 bg-emerald-500/10" :
            feedback === "wrong" ? "border-rose-500 bg-rose-500/10" :
            "border-[var(--border-strong)] bg-[var(--card)]"
          }`}>
            <span className="text-8xl font-bold text-[var(--foreground)]" style={{ lineHeight: 1 }}>
              {currentSymbol.symbol}
            </span>
          </div>

          {/* Number buttons (for mobile) */}
          <div className="grid w-full max-w-sm grid-cols-9 gap-2">
            {SYMBOL_MAP.map((entry) => (
              <button
                key={entry.digit}
                onClick={() => handleKeyPress(entry.digit)}
                className="flex h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-lg font-extrabold text-[var(--foreground)] hover:bg-[var(--section-highlight)] active:scale-95 transition-all"
              >
                {entry.digit}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">Use number keys 1-9 on your keyboard for faster responses</p>
        </div>
      )}

      {phase === PHASES.FEEDBACK && results && (
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex flex-col items-center rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-md">
            <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
              results.tone === "good" ? "bg-emerald-500/10 text-emerald-500" : results.tone === "warn" ? "bg-rose-500/10 text-rose-500" : "bg-blue-500/10 text-blue-500"
            }`}>
              <Brain className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-extrabold text-[var(--foreground)]">Processing Speed: {results.grade}</h2>
            <p className="mt-2 text-lg text-[var(--muted-foreground)]">
              {results.correct} Correct | {results.accuracy}% Accuracy
            </p>
            <button onClick={() => setPhase(PHASES.SETUP)} className="btn-primary mt-8 w-full max-w-xs rounded-xl py-3 text-base">
              Retake Test
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              icon={Zap}
              label="Items Processed"
              value={results.correct}
              detail="Correct answers in 60 seconds"
              tone={results.correct >= 45 ? "good" : results.correct < 30 ? "warn" : "default"}
            />
            <MetricCard
              icon={XCircle}
              label="Errors"
              value={results.incorrect}
              detail="Incorrect key presses"
              tone={results.incorrect === 0 ? "good" : results.incorrect > 10 ? "warn" : "default"}
            />
            <MetricCard
              icon={Activity}
              label="Accuracy"
              value={`${results.accuracy}%`}
              detail="Correct / total presses"
              tone={results.accuracy >= 90 ? "good" : results.accuracy < 70 ? "warn" : "default"}
            />
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
              <BarChart2 className="h-5 w-5 text-[var(--primary)]" />
              Score Benchmark
            </h3>
            <div className="h-52">
              <SafeResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "Below Avg", value: 25, fill: "#f43f5e" },
                  { name: "Average", value: 38, fill: "#f59e0b" },
                  { name: "Above Avg", value: 52, fill: "#3b82f6" },
                  { name: "Elite", value: 65, fill: "#10b981" },
                  { name: "Your Score", value: results.correct, fill: "#a855f7" },
                ]} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {[
                      { fill: "#f43f5e" },
                      { fill: "#f59e0b" },
                      { fill: "#3b82f6" },
                      { fill: "#10b981" },
                      { fill: "#a855f7" },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </SafeResponsiveContainer>
            </div>
            <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
              Average adults process ~30-45 symbols per minute. Elite performers score 60+.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
