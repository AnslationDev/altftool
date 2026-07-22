"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Droplets, RotateCcw, Info, Copy, Download, CheckCircle2, Trophy, Timer, Zap, Target, Ruler } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const RIVERS = [
  { river: "Nile", length: 6650, continent: "Africa", countries: "Uganda, Sudan, Egypt", fact: "Longest river in the world, flows north through 11 countries", emoji: "🌊" },
  { river: "Amazon", length: 6400, continent: "South America", countries: "Brazil, Peru, Colombia", fact: "Largest river by discharge volume — 20% of world's river water", emoji: "🌊" },
  { river: "Yangtze", length: 6300, continent: "Asia", countries: "China", fact: "Longest river in Asia, home to the Three Gorges Dam", emoji: "🌊" },
  { river: "Mississippi", length: 6275, continent: "North America", countries: "USA, Canada", fact: "Drains 31 US states, largest river system in North America", emoji: "🌊" },
  { river: "Yenisei", length: 5539, continent: "Asia", countries: "Russia, Mongolia", fact: "Flows into the Arctic Ocean, one of the deepest rivers", emoji: "🌊" },
  { river: "Yellow River", length: 5464, continent: "Asia", countries: "China", fact: "Cradle of Chinese civilization, carries massive sediment load", emoji: "🌊" },
  { river: "Ob-Irtysh", length: 5410, continent: "Asia", countries: "Russia, Kazakhstan, China", fact: "Flows into the Gulf of Ob, one of the longest rivers in Siberia", emoji: "🌊" },
  { river: "Río de la Plata", length: 4880, continent: "South America", countries: "Argentina, Uruguay", fact: "Technically an estuary, widest river mouth in the world", emoji: "🌊" },
  { river: "Congo", length: 4700, continent: "Africa", countries: "DRC, Republic of Congo", fact: "Deepest river in the world at 220m, second largest by discharge", emoji: "🌊" },
  { river: "Amur", length: 4444, continent: "Asia", countries: "Russia, China", fact: "Forms border between Russia and China, major salmon habitat", emoji: "🌊" },
  { river: "Lena", length: 4400, continent: "Asia", countries: "Russia", fact: "Flows entirely through Siberia into the Laptev Sea", emoji: "🌊" },
  { river: "Mekong", length: 4350, continent: "Asia", countries: "China, Myanmar, Laos, Thailand, Cambodia, Vietnam", fact: "Supports 60 million people, vital for rice farming", emoji: "🌊" },
  { river: "Mackenzie", length: 4241, continent: "North America", countries: "Canada", fact: "Longest river system in Canada, flows into Arctic Ocean", emoji: "🌊" },
  { river: "Niger", length: 4180, continent: "Africa", countries: "Guinea, Mali, Niger, Nigeria", fact: "Third longest river in Africa, vital inland delta in Mali", emoji: "🌊" },
  { river: "Paraná", length: 4880, continent: "South America", countries: "Brazil, Argentina, Paraguay", fact: "Itaipu Dam on Paraná is one of the world's largest hydroelectric plants", emoji: "🌊" },
  { river: "Volga", length: 3531, continent: "Europe", countries: "Russia", fact: "Longest river in Europe, sacred to Russian people", emoji: "🌊" },
  { river: "Danube", length: 2860, continent: "Europe", countries: "Germany, Austria, Hungary, Romania, etc.", fact: "Flows through 10 countries, second longest in Europe", emoji: "🌊" },
  { river: "Ganges", length: 2525, continent: "Asia", countries: "India, Bangladesh", fact: "Sacred to Hindus, supports 400 million people in its basin", emoji: "🌊" },
  { river: "Zambezi", length: 2574, continent: "Africa", countries: "Zambia, Zimbabwe, Mozambique", fact: "Home to Victoria Falls, one of the Seven Natural Wonders", emoji: "🌊" },
  { river: "Indus", length: 3180, continent: "Asia", countries: "China, India, Pakistan", fact: "Gave name to India, cradle of Indus Valley Civilization", emoji: "🌊" },
  { river: "Euphrates", length: 2800, continent: "Asia", countries: "Turkey, Syria, Iraq", fact: "One of two rivers of the Garden of Eden, birthplace of agriculture", emoji: "🌊" },
  { river: "Tigris", length: 1900, continent: "Asia", countries: "Turkey, Syria, Iraq", fact: "Flows through Baghdad, ancient Mesopotamia's lifeline", emoji: "🌊" },
  { river: "Brahmaputra", length: 2900, continent: "Asia", countries: "China, India, Bangladesh", fact: "One of the few rivers that flows north to south then east", emoji: "🌊" },
  { river: "Rhine", length: 1230, continent: "Europe", countries: "Switzerland, Germany, Netherlands", fact: "Major shipping route, lined with castles and vineyards", emoji: "🌊" },
  { river: "Elbe", length: 1094, continent: "Europe", countries: "Czech Republic, Germany", fact: "Flows through Hamburg, one of Europe's cleanest major rivers", emoji: "🌊" },
  { river: "Loire", length: 1012, continent: "Europe", countries: "France", fact: "Longest river in France, famous for châteaux along its banks", emoji: "🌊" },
  { river: "Seine", length: 777, continent: "Europe", countries: "France", fact: "Flows through Paris, iconic for its bridges and river cruises", emoji: "🌊" },
  { river: "Thames", length: 346, continent: "Europe", countries: "United Kingdom", fact: "Flows through London, one of the most historically important rivers", emoji: "🌊" },
  { river: "Colorado", length: 2330, continent: "North America", countries: "USA, Mexico", fact: "Carved the Grand Canyon over millions of years", emoji: "🌊" },
  { river: "Columbia", length: 2000, continent: "North America", countries: "USA, Canada", fact: "Largest river in the Pacific Northwest, major salmon spawning ground", emoji: "🌊" },
  { river: "Rio Grande", length: 3051, continent: "North America", countries: "USA, Mexico", fact: "Forms the US-Mexico border for over 1,900 km", emoji: "🌊" },
  { river: "Orinoco", length: 2140, continent: "South America", countries: "Venezuela, Colombia", fact: "One of the longest rivers in South America, unique casiquiare canal", emoji: "🌊" },
  { river: "Gambia", length: 1130, continent: "Africa", countries: "Guinea, Senegal, Gambia", fact: "The Gambia country is named after this river", emoji: "🌊" },
  { river: "Orange", length: 2160, continent: "Africa", countries: "South Africa, Lesotho, Namibia", fact: "Longest river in South Africa, vital for irrigation in arid regions", emoji: "🌊" },
  { river: "Murray", length: 2508, continent: "Oceania", countries: "Australia", fact: "Longest river in Australia, lifeline of the Murray-Darling basin", emoji: "🌊" },
  { river: "Darling", length: 1472, continent: "Oceania", countries: "Australia", fact: "Part of Australia's largest river system with the Murray", emoji: "🌊" },
  { river: "Fly", length: 1060, continent: "Oceania", countries: "Papua New Guinea", fact: "Largest river in Oceania by discharge, flows through remote jungle", emoji: "🌊" },
  { river: "Volga", length: 3531, continent: "Europe", countries: "Russia", fact: "Longest river in Europe, sacred to Russian people", emoji: "🌊" },
  { river: "Don", length: 1870, continent: "Europe", countries: "Russia", fact: "Flows into the Sea of Azov, important historical trade route", emoji: "🌊" },
  { river: "Dnieper", length: 2200, continent: "Europe", countries: "Russia, Belarus, Ukraine", fact: "One of the major rivers of Europe, vital to Ukrainian agriculture", emoji: "🌊" },
  { river: "Sava", length: 945, continent: "Europe", countries: "Slovenia, Croatia, Bosnia, Serbia", fact: "Major tributary of the Danube, connects 4 Balkan countries", emoji: "🌊" },
  { river: "Po", length: 652, continent: "Europe", countries: "Italy", fact: "Longest river in Italy, flows through the fertile Po Valley", emoji: "🌊" },
  { river: "Tennessee", length: 1049, continent: "North America", countries: "USA", fact: "Formed by confluence of French Broad and Holston rivers", emoji: "🌊" },
  { river: "Arkansas", length: 2322, continent: "North America", countries: "USA", fact: "Flows from Colorado to Mississippi, major US waterway", emoji: "🌊" },
  { river: "Salween", length: 2800, continent: "Asia", countries: "China, Myanmar, Thailand", fact: "One of the last free-flowing rivers in Southeast Asia", emoji: "🌊" },
  { river: "Irrawaddy", length: 2170, continent: "Asia", countries: "Myanmar", fact: "Myanmar's most important commercial waterway, navigable for most of its length", emoji: "🌊" },
  { river: "Syr Darya", length: 2212, continent: "Asia", countries: "Kyrgyzstan, Uzbekistan, Kazakhstan", fact: "One of the two rivers that fed the Aral Sea, now much reduced", emoji: "🌊" },
  { river: "Amu Darya", length: 2540, continent: "Asia", countries: "Tajikistan, Afghanistan, Uzbekistan, Turkmenistan", fact: "Historically known as the Oxus, forms the border of Afghanistan", emoji: "🌊" },
  { river: "Shatt al-Arab", length: 1900, continent: "Asia", countries: "Iraq, Iran", fact: "Formed by confluence of Tigris and Euphrates, empties into Persian Gulf", emoji: "🌊" },
  { river: "Okavango", length: 1600, continent: "Africa", countries: "Angola, Botswana, Namibia", fact: "Ends in an inland delta in Botswana, creating a unique oasis ecosystem", emoji: "🌊" },
  { river: "Lake Chad Basin rivers", length: 1400, continent: "Africa", countries: "Chad, Niger, Nigeria, Cameroon", fact: "Lake Chad has shrunk 90% since 1960 due to climate change", emoji: "🌊" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getStreakMsg(streak) {
  if (streak >= 10) return "Legendary!";
  if (streak >= 7) return "Unstoppable!";
  if (streak >= 5) return "On Fire!";
  if (streak >= 3) return "Nice!";
  return "";
}

const QUIZ_TYPES = [
  { id: "continent", label: "Which continent?" },
  { id: "country", label: "Which country?" },
  { id: "name", label: "Name the river" },
  { id: "length", label: "How long?" },
];

const DIFFICULTY = {
  easy: { label: "Easy", questions: 10, timePerQ: 25 },
  medium: { label: "Medium", questions: 20, timePerQ: 18 },
  hard: { label: "Hard", questions: 30, timePerQ: 12 },
  expert: { label: "Expert", questions: 40, timePerQ: 8 },
};

function generateQuestion(type, pool) {
  const target = pool[Math.floor(Math.random() * pool.length)];

  if (type === "continent") {
    const allConts = [...new Set(pool.map((r) => r.continent))];
    const wrong = shuffle(allConts.filter((c) => c !== target.continent)).slice(0, 3);
    const opts = shuffle([...wrong, target.continent]);
    return { question: `${target.emoji} ${target.river}`, answer: target.continent, options: opts.map((c) => ({ label: c, value: c })), hint: `Length: ${target.length} km` };
  }
  if (type === "country") {
    const mainCountry = target.countries.split(",")[0].trim();
    const wrongPool = pool.filter((r) => r.countries.split(",")[0].trim() !== mainCountry);
    const wrongOpts = shuffle(wrongPool).slice(0, 3).map((r) => r.countries.split(",")[0].trim());
    const opts = shuffle([...new Set([...wrongOpts, mainCountry])]).slice(0, 4);
    return { question: `${target.emoji} ${target.river} — Which country?`, answer: mainCountry, options: opts.map((c) => ({ label: c, value: c })), hint: `Continent: ${target.continent}` };
  }
  if (type === "length") {
    const ranges = [
      { label: `< ${Math.round(target.length * 0.7)} km`, max: Math.round(target.length * 0.7) },
      { label: `${Math.round(target.length * 0.7)}–${Math.round(target.length * 0.9)} km`, min: Math.round(target.length * 0.7), max: Math.round(target.length * 0.9) },
      { label: `${Math.round(target.length * 0.9)}–${Math.round(target.length * 1.1)} km`, min: Math.round(target.length * 0.9), max: Math.round(target.length * 1.1) },
      { label: `> ${Math.round(target.length * 1.1)} km`, min: Math.round(target.length * 1.1) },
    ];
    const correctIdx = ranges.findIndex((r) => !r.max || (r.min && r.min <= target.length && r.max >= target.length) || (!r.min && target.length <= r.max));
    return { question: `${target.emoji} How long is the ${target.river}?`, answer: ranges[correctIdx].label, options: ranges.map((r) => ({ label: r.label, value: r.label })), hint: `Continent: ${target.continent}` };
  }
  const wrongRivers = shuffle(pool.filter((r) => r.river !== target.river)).slice(0, 3);
  const opts = shuffle([target, ...wrongRivers]);
  return { question: `${target.emoji} ${target.fact}`, answer: target.river, options: opts.map((r) => ({ label: r.river, value: r.river })), hint: `Length: ${target.length} km` };
}

export default function ToolHome() {
  const [difficulty, setDifficulty] = useState(null);
  const [quizType, setQuizType] = useState("continent");
  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef(null);

  const startQuiz = (diff, type) => {
    setDifficulty(diff);
    setQuizType(type);
    const cfg = DIFFICULTY[diff];
    const pool = shuffle(RIVERS).slice(0, Math.max(cfg.questions, 20));
    const questions = [];
    for (let i = 0; i < cfg.questions; i++) {
      questions.push(generateQuestion(type, pool));
    }
    setQuiz(shuffle(questions));
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSelected(null);
    setAnswers([]);
    setGameOver(false);
    setTimer(cfg.timePerQ);
    setShowHint(false);
  };

  const handleAnswer = useCallback((answer) => {
    clearInterval(timerRef.current);
    setSelected(answer);
    const current = quiz[currentIdx];
    const correct = answer !== null && answer === current.answer;
    const isStreakBonus = correct && streak >= 2;

    if (correct) {
      setScore((s) => s + (isStreakBonus ? 2 : 1));
      setStreak((s) => {
        const newS = s + 1;
        setBestStreak((b) => Math.max(b, newS));
        return newS;
      });
    } else {
      setStreak(0);
    }

    setAnswers((a) => [...a, { question: current.question, correctAnswer: current.answer, userAnswer: answer, isCorrect: correct }]);

    setTimeout(() => {
      if (currentIdx + 1 >= quiz.length) {
        setGameOver(true);
      } else {
        setCurrentIdx((i) => i + 1);
        setSelected(null);
        setShowHint(false);
        setTimer(DIFFICULTY[difficulty].timePerQ);
      }
    }, 1200);
  }, [quiz, currentIdx, streak, difficulty]);

  useEffect(() => {
    if (gameOver || !quiz || selected !== null) return;
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentIdx, selected, gameOver, quiz, handleAnswer]);

  const current = quiz?.[currentIdx];
  const timeColor = timer <= 5 ? "text-red-600 bg-red-50" : timer <= 10 ? "text-amber-600 bg-amber-50" : "text-[var(--foreground)] bg-[var(--background)]";

  const reset = () => { setQuiz(null); setDifficulty(null); setGameOver(false); setAnswers([]); };

  const buildReportText = () => {
    if (!gameOver) return "";
    const pct = quiz.length > 0 ? ((score / quiz.length) * 100).toFixed(1) : 0;
    return `
RIVER QUIZ REPORT
Difficulty: ${DIFFICULTY[difficulty].label}
Question Type: ${QUIZ_TYPES.find((t) => t.id === quizType)?.label}
Generated: ${new Date().toLocaleString()}
---------------------------------
RESULTS:
- Score: ${score}/${quiz.length} (${pct}%)
- Best Streak: ${bestStreak}
- Time per Question: ${DIFFICULTY[difficulty].timePerQ}s

BREAKDOWN:
${answers.map((a, i) => `${i + 1}. ${a.question} — ${a.isCorrect ? "CORRECT" : `WRONG (Answer: ${a.correctAnswer})`}`).join("\n")}

---------------------------------
River Quiz — Educational tool
    `.trim();
  };

  const copyReport = async () => {
    const success = await safeCopyText(buildReportText());
    if (success) { setCopied(true); setTimeout(() => setCopied(false), 1200); }
  };

  const downloadReport = () => {
    if (!gameOver) return;
    const blob = new Blob([buildReportText()], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `River_Quiz_${DIFFICULTY[difficulty].label}.txt`;
    link.click();
  };

  const topRivers = [...RIVERS].sort((a, b) => b.length - a.length).slice(0, 10);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>This quiz covers 50 major world rivers with lengths, countries, and fascinating geographic facts.</p>
          </div>
        </div>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase text-blue-700">
            <Droplets className="h-4 w-4" />
            World rivers knowledge quiz
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">River Quiz</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Test your knowledge of world rivers — identify by continent, country, length, or name with timed questions and streak scoring.
          </p>
        </section>

        {/* Top Rivers */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Top 10 Longest Rivers</h2>
          <div className="space-y-2">
            {topRivers.map((r, i) => (
              <div key={r.river} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm">
                <span className="w-6 text-center font-black text-[var(--primary)]">#{i + 1}</span>
                <span className="flex-1 font-semibold text-[var(--foreground)]">{r.river}</span>
                <span className="text-xs text-[var(--muted)]">{r.continent}</span>
                <span className="font-bold text-[var(--foreground)] tabular-nums">{r.length.toLocaleString()} km</span>
              </div>
            ))}
          </div>
        </section>

        {!quiz ? (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">Select Difficulty & Question Type</h2>

            <div className="mb-4">
              <p className="text-xs font-bold uppercase text-[var(--muted)] mb-2">Question Type</p>
              <div className="flex flex-wrap gap-2">
                {QUIZ_TYPES.map((qt) => (
                  <button key={qt.id} onClick={() => setQuizType(qt.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${quizType === qt.id ? "bg-blue-600 text-white" : "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)]"}`}>
                    {qt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Object.entries(DIFFICULTY).map(([key, cfg]) => (
                <button key={key} onClick={() => startQuiz(key, quizType)} className="group rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 text-center transition-all hover:border-blue-500 hover:shadow-[var(--anslation-ds-shadow-md)] active:scale-[0.97]">
                  <p className="text-2xl font-bold text-[var(--foreground)] group-hover:text-blue-600">{cfg.questions}</p>
                  <p className="text-sm font-semibold text-[var(--foreground)] mt-1">{cfg.label}</p>
                  <p className="text-xs text-[var(--foreground)] mt-2">{cfg.timePerQ}s / question</p>
                </button>
              ))}
            </div>
          </section>
        ) : gameOver ? (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] space-y-6 animate-in fade-in duration-500">
            <div className="text-center">
              <Trophy className="h-16 w-16 text-blue-500 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Quiz Complete!</h2>
              <p className="text-lg text-[var(--muted)] mt-2">{score}/{quiz.length} correct — {((score / quiz.length) * 100).toFixed(0)}%</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs text-[var(--muted)] uppercase tracking-widest font-bold">Score</p>
                <p className="text-3xl font-black text-[var(--foreground)] mt-1">{score}</p>
                <p className="text-xs text-[var(--muted)]">of {quiz.length}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs text-[var(--muted)] uppercase tracking-widest font-bold">Accuracy</p>
                <p className="text-3xl font-black text-[var(--foreground)] mt-1">{((score / quiz.length) * 100).toFixed(0)}%</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs text-[var(--muted)] uppercase tracking-widest font-bold">Best Streak</p>
                <p className="text-3xl font-black text-blue-500 mt-1">{bestStreak}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Answer Review</h3>
              <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
                {answers.map((a, i) => (
                  <div key={i} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${a.isCorrect ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                    <span className="font-semibold text-[var(--foreground)] truncate pr-2">{a.question}</span>
                    <span className={`shrink-0 ${a.isCorrect ? "text-emerald-700 font-bold" : "text-red-700"}`}>
                      {a.isCorrect ? "Correct" : `Answer: ${a.correctAnswer}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={reset} className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--anslation-ds-shadow-sm)] transition-all hover:shadow-[var(--anslation-ds-shadow-md)] active:scale-[0.98]">Play Again</button>
              <button onClick={copyReport} className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition-all hover:bg-[var(--muted)]">
                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button onClick={downloadReport} className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition-all hover:bg-[var(--muted)]">
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          </section>
        ) : (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6 space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-[var(--foreground)]">{currentIdx + 1}/{quiz.length}</span>
              <div className="flex-1 h-3 overflow-hidden rounded-full bg-[var(--muted)]/40">
                <div className="h-full rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${((currentIdx + 1) / quiz.length) * 100}%` }} />
              </div>
              <div className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-bold ${timeColor}`}>
                <Timer className="h-4 w-4" /> {timer}s
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--foreground)]">
                <Target className="h-4 w-4 text-blue-600" /> Score: {score}
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-sm font-bold text-blue-700">
                  <Zap className="h-4 w-4" /> {streak} streak {getStreakMsg(streak)}
                </div>
              )}
            </div>

            <div className="rounded-lg bg-[var(--background)] p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">{QUIZ_TYPES.find((t) => t.id === quizType)?.label}</p>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">{current.question}</h2>
              {showHint && (
                <p className="mt-3 text-sm text-blue-600 font-semibold">Hint: {current.hint}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {current.options.map((opt) => {
                const isCorrect = opt.value === current.answer;
                const isSelected = selected === opt.value;
                let optStyle = "border-[var(--border)] bg-[var(--background)] hover:border-blue-500 hover:shadow-[var(--anslation-ds-shadow-sm)]";
                if (selected !== null) {
                  if (isCorrect) optStyle = "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/30";
                  else if (isSelected && !isCorrect) optStyle = "border-red-500 bg-red-50 ring-2 ring-red-500/30";
                  else optStyle = "border-[var(--border)] bg-[var(--background)] opacity-50";
                }
                return (
                  <button key={opt.value} disabled={selected !== null} onClick={() => handleAnswer(opt.value)} className={`rounded-lg border px-4 py-4 text-left text-base font-semibold text-[var(--foreground)] transition-all active:scale-[0.98] ${optStyle}`}>
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {selected === null && (
              <button onClick={() => setShowHint(true)} className="w-full rounded-lg border border-dashed border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition-all hover:bg-blue-100">
                Show Hint
              </button>
            )}

            <button onClick={reset} className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition-all hover:bg-[var(--muted)]">Quit Quiz</button>
          </section>
        )}

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">About World Rivers</h3>
          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">River Classification</p>
              <p>Rivers are classified by length (longest = Nile at 6,650 km), discharge volume (largest = Amazon at 209,000 m³/s), and drainage basin area (largest = Amazon at 7M km²). The Amazon carries more water than the next 7 largest rivers combined.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Rivers and Civilization</p>
              <p>Rivers have been the cradle of civilizations — the Nile (Egypt), Tigris-Euphrates (Mesopotamia), Indus (India), and Yellow River (China). Today, rivers provide drinking water for 4 billion people and irrigate 40% of the world&apos;s food supply.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
