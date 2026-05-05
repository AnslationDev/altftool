"use client";

import { useState, useRef, useEffect } from "react";
import Header from "./Header";

/* ================= TEXT DATA ================= */
const TEXTS = {
  15: [
    "Typing daily improves speed accuracy and focus with regular practice.",
    "Fast typing comes from patience rhythm and consistent finger movement.",
    "Short typing sessions help build confidence and reduce mistakes."
  ],
  30: [
    "Typing master helps you improve speed and accuracy by testing your wpm, accuracy, and errors in a simple and engaging way. It allows users to practice regularly while tracking progress over time.",
    "Consistent typing practice improves coordination speed and confidence while helping you understand common mistakes clearly.",
    "Practice typing daily to improve speed accuracy and rhythm while reducing errors and building muscle memory."
  ],
  60: [
    "Typing master helps you improve speed and accuracy by testing your wpm, accuracy, and errors in a simple engaging way. It allows users to practice regularly while tracking progress over time.",
    "Consistent typing practice improves speed accuracy and confidence. This typing master tracks wpm highlights mistakes and helps users understand weak areas for long term improvement.",
    "By practicing typing daily users can improve finger placement rhythm and accuracy. Real time feedback helps build confidence consistency and efficiency."
  ]
};

/* ================= CONFETTI ================= */
function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      {[...Array(50)].map((_, i) => (
        <span
          key={i}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-fall"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * -20}vh`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes fall {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .animate-fall { animation-name: fall; animation-timing-function: linear; }
      `}</style>
    </div>
  );
}

/* ================= MAIN APP ================= */
export default function MainComponent() {
  const [typed, setTyped] = useState("");
  const [errors, setErrors] = useState(0);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLimit, setTimeLimit] = useState(60);
  const [textIndex, setTextIndex] = useState(0);

  const TEXT = TEXTS[timeLimit][textIndex];

  const boxRef = useRef(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => { boxRef.current?.focus(); }, []);

  /* Timer */
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev + 1 >= timeLimit) {
            clearInterval(intervalRef.current);
            calculateResult();
            return timeLimit;
          }
          return prev + 1;
        });
      }, 1000);
    } else clearInterval(intervalRef.current);

    return () => clearInterval(intervalRef.current);
  }, [running, timeLimit]);

  /* Handle Typing */
 const handleKeyDown = (e) => {
  if (timer >= timeLimit || result) return;

  // Prevent default scrolling for Space and Backspace
  if (e.key === " " || e.key === "Backspace") e.preventDefault();

  if (e.key === "Backspace") {
    setTyped(p => p.slice(0, -1));
    setErrors(prev => Math.max(prev - 1, 0));
    return;
  }

  if (e.key.length === 1) {
    if (!startTimeRef.current) startTimeRef.current = Date.now();
    const index = typed.length;
    if (index < TEXT.length) {
      if (e.key !== TEXT[index]) setErrors(p => p + 1);
      setTyped(p => p + e.key);
    }
    setRunning(true);
  }
};


  /* ================= CALCULATE WPM & ACCURACY ================= */
  const calculateStats = () => {
    const minutes = timer / 60 || 1 / 60;
    const correctChars = typed.split("").filter((c, i) => c === TEXT[i]).length;
    const accuracy = typed.length ? Math.round((correctChars / typed.length) * 100) : 0;
    const wpm = Math.round((correctChars / 5) / minutes);
    return { wpm, accuracy };
  };

  const calculateResult = () => {
    const { wpm, accuracy } = calculateStats();
    let level = "NORMAL";
    if (timeLimit === 60) {
      if (wpm >= 50 && accuracy >= 90) level = "WINNER";
      else if (wpm < 20) level = "LOOSE";
    } else if (timeLimit === 30) {
      if (wpm >= 50 && accuracy >= 90) level = "WINNER";
      else if (wpm < 20) level = "LOOSE";
    } else if (timeLimit === 15) {
      if (wpm >= 30 && accuracy >= 85) level = "WINNER";
      else if (wpm < 10) level = "LOOSE";
    }
    setResult({ level, wpm, accuracy, errors, typed: typed.length });
    setRunning(false);
  };

  const resetTest = () => {
    setTyped("");
    setErrors(0);
    setTimer(0);
    setResult(null);
    startTimeRef.current = null;
    setRunning(false);
    boxRef.current?.focus({ preventScroll: true });
  };

  const toggleParagraph = () => {
    resetTest();
    setTextIndex(prev => (prev + 1) % TEXTS[timeLimit].length);
  };

  /* ================= CARDS ================= */
  const { wpm, accuracy } = calculateStats();
  const cardsData = [
    { label: "WPM", value: wpm },
    { label: "Accuracy", value: `${accuracy}%` },
    { label: "Errors", value: errors },
    { label: "Typed", value: typed.length },
  ];

  /* ================= FEATURES ================= */
  const features = [
    { title: "Real-time Stats", description: "Track your speed, accuracy, and errors live as you type." },
    { title: "Error Highlighting", description: "Wrong characters are highlighted instantly for better focus." },
    { title: "Typing Challenges", description: "Practice with random texts to improve speed and consistency." },
    { title: "Responsive & Clean UI", description: "Enjoy a minimal, modern layout that looks great on all devices." },
  ];

return (
  <>
    <div className="py-8">
      <Header />

      <div
        ref={boxRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="min-h-screen bg-(--background) text-(--foreground) outline-none px-4 pt-10 relative"
      >
        <div className="mx-auto w-full max-w-5xl bg-(--card) border border-(--border) rounded-2xl p-8 space-y-8 shadow-xl relative">

          {/* TIME SELECTION */}
          <div className="flex gap-3 justify-center">
            {[15, 30, 60].map(t => (
              <button
                key={t}
                onClick={() => { resetTest(); setTimeLimit(t); setTextIndex(0); }}
                className={`px-5 py-2 rounded-xl border transition-all duration-200 cursor-pointer
                  ${timeLimit === t
                    ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                    : "border-(--border) hover:bg-(--muted)"}`}
              >
                {t}s
              </button>
            ))}
          </div>

          {/* TYPING TEXT */}
          <div className="bg-(--background) border border-(--border) rounded-xl p-6 text-lg md:text-xl leading-relaxed font-mono select-none min-h-35">
            {TEXT.split("").map((char, i) => {
              let cls = "text-(--muted-foreground)";
              if (i < typed.length)
                cls = typed[i] === char
                  ? "text-(--primary)"
                  : "text-red-500 font-semibold";
              if (i === typed.length && !result) cls += " underline";

              return <span key={i} className={cls}>{char}</span>;
            })}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={resetTest}
              className="px-8 py-3 rounded-xl bg-(--primary) text-(--primary-foreground) hover:opacity-90 transition cursor-pointer"
            >
              Reset
            </button>

            <button
              onClick={toggleParagraph}
              className="px-8 py-3 rounded-xl bg-(--muted) text-(--foreground) hover:bg-(--border) transition cursor-pointer"
            >
              Change Paragraph
            </button>
          </div>

          {/* PROGRESS BAR */}
          <div className="w-full h-3 bg-(--border) rounded-full overflow-hidden">
            <div
              className="h-full bg-(--primary) transition-all duration-300"
              style={{ width: `${(typed.length / TEXT.length) * 100}%` }}
            />
          </div>

          {/* TIMER */}
          <p className="text-right text-sm text-(--muted-foreground)">
            Timer: <span className="font-semibold">{timer}s</span> / {timeLimit}s
          </p>

          {/* OVERLAY RESULT */}
          {result && (
            <>
              {result.level === "WINNER" && <Confetti />}
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20 rounded-2xl">
                <div className="bg-(--card) border border-(--border) p-12 rounded-2xl text-center shadow-2xl">
                  <h1
                    className={`text-6xl md:text-7xl font-extrabold mb-6 ${
                      result.level === "WINNER"
                        ? "text-green-500"
                        : result.level === "NORMAL"
                        ? "text-yellow-400"
                        : "text-red-600"
                    }`}
                  >
                    {result.level}{" "}
                    {result.level === "WINNER"
                      ? "🎉"
                      : result.level === "NORMAL"
                      ? "🙂"
                      : "😞"}
                  </h1>

                  <button
                    onClick={resetTest}
                    className="px-10 py-3 rounded-xl bg-(--primary) text-(--primary-foreground) hover:opacity-90 transition"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* RESULT CARDS */}
        {result && (
          <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
            {cardsData.map((item, i) => (
              <div
                key={i}
                className="bg-(--card) border border-(--border) rounded-xl p-6 text-center shadow-md"
              >
                <p className="text-sm text-(--muted-foreground)">
                  {item.label}
                </p>
                <p className="text-3xl font-bold mt-2">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* FEATURES */}
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 mt-14">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-(--card) border border-(--border) rounded-2xl p-8 shadow-md hover:shadow-lg transition"
            >
              <p className="text-xl font-semibold text-(--primary)">
                {feature.title}
              </p>
              <p className="text-sm text-(--muted-foreground) mt-3 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  </>
);

}
