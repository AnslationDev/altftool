"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Layers, Zap, Brain, Target, AlertCircle, RotateCcw, CheckCircle2 } from "lucide-react";

const PHASES = { SETUP: "setup", RUNNING: "running", FEEDBACK: "feedback" };
const TEST_DURATION = 60; // 60 seconds

function generateMathProblem() {
  const ops = ['+', '-'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer;
  if (op === '+') {
    a = Math.floor(Math.random() * 20) + 1;
    b = Math.floor(Math.random() * 20) + 1;
    answer = a + b;
  } else {
    a = Math.floor(Math.random() * 20) + 10;
    b = Math.floor(Math.random() * 10) + 1;
    answer = a - b;
  }

  // Generate 4 options
  let options = new Set([answer]);
  while(options.size < 4) {
    let wrong = answer + Math.floor(Math.random() * 10) - 5;
    if (wrong !== answer && wrong > 0) options.add(wrong);
  }

  return {
    q: `${a} ${op} ${b}`,
    answer,
    options: Array.from(options).sort(() => Math.random() - 0.5)
  };
}

export default function MultitaskingAbilityTest() {
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);

  // Math Task State
  const [mathProblem, setMathProblem] = useState(null);
  const [mathCorrect, setMathCorrect] = useState(0);
  const [mathIncorrect, setMathIncorrect] = useState(0);
  const [mathFeedback, setMathFeedback] = useState(null);

  // Color Task State
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [alertCorrect, setAlertCorrect] = useState(0);
  const [alertMissed, setAlertMissed] = useState(0);
  const [alertFalse, setAlertFalse] = useState(0);

  const timerRef = useRef(null);
  const alertTimeoutRef = useRef(null);
  const alertDurationRef = useRef(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    if (alertDurationRef.current) clearTimeout(alertDurationRef.current);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const scheduleNextAlert = useCallback(() => {
    if (phase !== PHASES.RUNNING) return;

    // Schedule a red alert between 3s and 8s from now
    const delay = Math.random() * 5000 + 3000;
    alertTimeoutRef.current = setTimeout(() => {
      setIsAlertActive(true);
      // Alert stays active for 1.5 seconds
      alertDurationRef.current = setTimeout(() => {
        setIsAlertActive(false);
        setAlertMissed(prev => prev + 1);
        scheduleNextAlert();
      }, 1500);
    }, delay);
  }, [phase]);

  const startTest = useCallback(() => {
    cleanup();
    setPhase(PHASES.RUNNING);
    setTimeLeft(TEST_DURATION);
    setMathCorrect(0);
    setMathIncorrect(0);
    setAlertCorrect(0);
    setAlertMissed(0);
    setAlertFalse(0);
    setIsAlertActive(false);
    setMathProblem(generateMathProblem());

    let remaining = TEST_DURATION;
    timerRef.current = setInterval(() => {
      remaining--;
      setTimeLeft(remaining);
      if (remaining <= 0) {
        cleanup();
        setPhase(PHASES.FEEDBACK);
      }
    }, 1000);

    scheduleNextAlert();
  }, [cleanup, scheduleNextAlert]);

  const handleMathAnswer = useCallback((opt) => {
    if (phase !== PHASES.RUNNING) return;

    if (opt === mathProblem.answer) {
      setMathCorrect(p => p + 1);
      setMathFeedback("correct");
    } else {
      setMathIncorrect(p => p + 1);
      setMathFeedback("wrong");
    }

    setTimeout(() => setMathFeedback(null), 300);
    setMathProblem(generateMathProblem());
  }, [phase, mathProblem]);

  const handleAlertResponse = useCallback(() => {
    if (phase !== PHASES.RUNNING) return;

    if (isAlertActive) {
      setAlertCorrect(p => p + 1);
      setIsAlertActive(false);
      clearTimeout(alertDurationRef.current);
      scheduleNextAlert();
    } else {
      setAlertFalse(p => p + 1);
    }
  }, [phase, isAlertActive, scheduleNextAlert]);

  useEffect(() => {
    if (phase !== PHASES.RUNNING) return;
    const handleKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleAlertResponse();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, handleAlertResponse]);

  // Calculate results
  const totalMathScore = Math.max(0, mathCorrect - (mathIncorrect * 0.5));
  const totalAlertScore = Math.max(0, alertCorrect - (alertMissed * 0.5) - (alertFalse * 0.5));
  const finalScore = Math.round(totalMathScore + totalAlertScore);

  let grade = "Needs Practice";
  if (finalScore > 35) grade = "Elite Multitasker";
  else if (finalScore > 25) grade = "Excellent";
  else if (finalScore > 15) grade = "Good";

  return (
    <div className={`transition-colors py-10 px-4 min-h-screen ${
      isAlertActive && phase === PHASES.RUNNING ? "bg-rose-500/20" : "bg-[var(--background)]"
    }`}>
      <header className="mb-8 text-center max-w-2xl mx-auto">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10">
          <Layers className="h-8 w-8 text-orange-500" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Multitasking Ability Test
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Solve math problems while reacting to alert signals. Test your split-attention capacity!
        </p>
      </header>

      {phase === PHASES.SETUP && (
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-[var(--foreground)]">How to Play</h2>
            <div className="mb-8 space-y-4 text-left w-full max-w-md">
              <div className="flex items-start gap-3 bg-[var(--section-highlight)] p-4 rounded-xl">
                <Brain className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-[var(--foreground)]">Task 1: Math Engine</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">Solve the equations shown in the center as fast as possible.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-rose-500/10 p-4 rounded-xl">
                <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-rose-600">Task 2: Danger Alert</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">When the screen flashes RED, quickly press the <strong>SPACEBAR</strong> or the Alert button.</p>
                </div>
              </div>
            </div>
            <button onClick={startTest} className="btn-primary w-full max-w-sm rounded-xl py-4 text-lg">
              Start Test (60s)
            </button>
          </div>
        </div>
      )}

      {phase === PHASES.RUNNING && (
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-8 relative">

          <div className="flex w-full justify-between items-center text-xl font-bold px-4">
            <div className={`transition-colors ${timeLeft <= 10 ? "text-rose-500 animate-pulse" : "text-[var(--foreground)]"}`}>
              Time: {timeLeft}s
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-blue-500">Math: {mathCorrect}</span>
              <span className="text-rose-500">Alerts: {alertCorrect}</span>
            </div>
          </div>

          <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden mb-4">
            <div
              className={`h-full transition-all duration-1000 ${timeLeft <= 10 ? 'bg-rose-500' : 'bg-orange-500'}`}
              style={{ width: `${(timeLeft / TEST_DURATION) * 100}%` }}
            />
          </div>

          {/* Math Problem Area */}
          <div className={`w-full max-w-md rounded-3xl border-4 bg-[var(--card)] flex flex-col items-center p-8 transition-colors duration-150 ${
            mathFeedback === "correct" ? "border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]" :
            mathFeedback === "wrong" ? "border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)]" :
            "border-[var(--border)]"
          }`}>
            <span className="text-xs font-extrabold uppercase text-[var(--muted-foreground)] mb-6 tracking-widest">
              Primary Task
            </span>
            <div className="text-6xl font-black text-[var(--foreground)] mb-8">
              {mathProblem?.q}
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              {mathProblem?.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleMathAnswer(opt)}
                  className="py-4 rounded-xl border border-[var(--border)] bg-[var(--section-highlight)] text-2xl font-bold hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-all active:scale-95"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Alert Button Area */}
          <button
            onClick={handleAlertResponse}
            className={`w-full max-w-md mt-4 py-6 rounded-2xl border-4 font-black text-2xl tracking-wider transition-all uppercase active:scale-95 ${
              isAlertActive
                ? "bg-rose-500 border-rose-600 text-white shadow-[0_0_50px_rgba(244,63,94,0.6)] animate-pulse"
                : "bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--section-highlight)]"
            }`}
          >
            {isAlertActive ? "⚠ RESPOND NOW! ⚠" : "Press Space when RED"}
          </button>
        </div>
      )}

      {phase === PHASES.FEEDBACK && (
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex flex-col items-center rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-md">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
              <Layers className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-extrabold text-[var(--foreground)]">Result: {grade}</h2>
            <p className="mt-2 text-xl font-bold text-[var(--primary)]">Total Score: {finalScore}</p>
            <button onClick={startTest} className="btn-primary mt-8 w-full max-w-xs rounded-xl py-3 text-base">
              <RotateCcw className="mr-2 inline h-4 w-4" /> Try Again
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Math Stats */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-blue-500" />
                <h3 className="font-bold text-lg">Math Performance</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex justify-between border-b border-[var(--border)] pb-2 text-sm">
                  <span className="text-[var(--muted-foreground)]">Correct Answers:</span>
                  <span className="font-bold text-emerald-500">{mathCorrect}</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Errors:</span>
                  <span className="font-bold text-rose-500">{mathIncorrect}</span>
                </li>
              </ul>
            </div>

            {/* Alert Stats */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-rose-500" />
                <h3 className="font-bold text-lg">Alert Reactivity</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex justify-between border-b border-[var(--border)] pb-2 text-sm">
                  <span className="text-[var(--muted-foreground)]">Hits:</span>
                  <span className="font-bold text-emerald-500">{alertCorrect}</span>
                </li>
                <li className="flex justify-between border-b border-[var(--border)] pb-2 text-sm">
                  <span className="text-[var(--muted-foreground)]">Misses (Too slow):</span>
                  <span className="font-bold text-orange-500">{alertMissed}</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">False Alarms:</span>
                  <span className="font-bold text-rose-500">{alertFalse}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
