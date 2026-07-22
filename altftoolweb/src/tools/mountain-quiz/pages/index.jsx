"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Mountain, RotateCcw, Info, Copy, Download, CheckCircle2, Trophy, Timer, Zap, Target } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const MOUNTAINS = [
  { name: "Mount Everest", height: 8849, range: "Himalayas", continent: "Asia", country: "Nepal/China", fact: "Highest point on Earth above sea level, known as Sagarmatha in Nepal and Chomolungma in Tibet", emoji: "🏔️" },
  { name: "K2", height: 8611, range: "Karakoram", continent: "Asia", country: "Pakistan/China", fact: "Second highest and considered the most dangerous 8000er — only ~600 successful summits", emoji: "🏔️" },
  { name: "Kangchenjunga", height: 8586, range: "Himalayas", continent: "Asia", country: "Nepal/India", fact: "Third highest, sacred mountain — climbers stop short of the summit out of respect", emoji: "🏔️" },
  { name: "Lhotse", height: 8516, range: "Himalayas", continent: "Asia", country: "Nepal/China", fact: "Connected to Everest via the South Col, has the steepest face of any 8000er peak", emoji: "🏔️" },
  { name: "Makalu", height: 8485, range: "Himalayas", continent: "Asia", country: "Nepal/China", fact: "Isolated peak known for its perfect four-sided pyramid shape", emoji: "🏔️" },
  { name: "Cho Oyu", height: 8188, range: "Himalayas", continent: "Asia", country: "Nepal/China", fact: "Easiest 8000er to climb — popular training peak for Everest", emoji: "🏔️" },
  { name: "Dhaulagiri I", height: 8167, range: "Himalayas", continent: "Asia", country: "Nepal", fact: "Rises 7,000m from the Kali Gandaki river valley in just 50km", emoji: "🏔️" },
  { name: "Manaslu", height: 8163, range: "Himalayas", continent: "Asia", country: "Nepal", fact: "Known as the 'Mountain of the Spirit', relatively less crowded 8000er", emoji: "🏔️" },
  { name: "Nanga Parbat", height: 8126, range: "Himalayas", continent: "Asia", country: "Pakistan", fact: "Called the 'Killer Mountain' — has the highest rock wall on Earth (4,600m)", emoji: "🏔️" },
  { name: "Annapurna I", height: 8091, range: "Himalayas", continent: "Asia", country: "Nepal", fact: "First 8000er ever climbed (1950), highest fatality rate of all 8000ers", emoji: "🏔️" },
  { name: "Gasherbrum I", height: 8080, range: "Karakoram", continent: "Asia", country: "Pakistan/China", fact: "Also called Hidden Peak — remote and rarely climbed before 1957", emoji: "🏔️" },
  { name: "Broad Peak", height: 8051, range: "Karakoram", continent: "Asia", country: "Pakistan/China", fact: "Named for its 1.5km broad summit ridge, relatively easy 8000er", emoji: "🏔️" },
  { name: "Gasherbrum II", height: 8035, range: "Karakoram", continent: "Asia", country: "Pakistan/China", fact: "Third highest of the Gasherbrum massif, first climbed in 1956", emoji: "🏔️" },
  { name: "Shishapangma", height: 8027, range: "Himalayas", continent: "Asia", country: "China", fact: "Lowest 8000er, entirely within Tibetan territory", emoji: "🏔️" },
  { name: "Aconcagua", height: 6961, range: "Andes", continent: "South America", country: "Argentina", fact: "Highest peak outside Asia, highest in Western and Southern Hemispheres", emoji: "🏔️" },
  { name: "Denali", height: 6190, range: "Alaska Range", continent: "North America", country: "USA", fact: "Highest peak in North America, greatest base-to-summit rise of any mountain on Earth", emoji: "🏔️" },
  { name: "Kilimanjaro", height: 5895, range: "Kilimanjaro", continent: "Africa", country: "Tanzania", fact: "Tallest freestanding mountain in the world, its glaciers are rapidly melting", emoji: "🏔️" },
  { name: "Mount Elbrus", height: 5642, range: "Caucasus", continent: "Europe", country: "Russia", fact: "Highest peak in Europe (Caucasus definition), a dormant volcano with two summits", emoji: "🏔️" },
  { name: "Mount Vinson", height: 4892, range: "Ellsworth", continent: "Antarctica", country: "Antarctica", fact: "Highest peak in Antarctica, remote and rarely climbed", emoji: "🏔️" },
  { name: "Puncak Jaya", height: 4884, range: "Maoke", continent: "Oceania", country: "Indonesia", fact: "Highest in Oceania, has equatorial glaciers that are disappearing", emoji: "🏔️" },
  { name: "Mont Blanc", height: 4809, range: "Alps", continent: "Europe", country: "France/Italy", fact: "Highest in the Alps, first major mountain climbed (1786)", emoji: "🏔️" },
  { name: "Matterhorn", height: 4478, range: "Alps", continent: "Europe", country: "Switzerland/Italy", fact: "Iconic pyramid shape, inspired the Toblerone logo", emoji: "🏔️" },
  { name: "Mount Fuji", height: 3776, range: "Japanese Alps", continent: "Asia", country: "Japan", fact: "Most climbed mountain in the world, UNESCO World Heritage Site", emoji: "🏔️" },
  { name: "Mount Olympus", height: 2918, range: "Olympus", continent: "Europe", country: "Greece", fact: "Mythical home of the Greek gods, highest peak in Greece", emoji: "🏔️" },
  { name: "Ben Nevis", height: 1345, range: "Grampian", continent: "Europe", country: "United Kingdom", fact: "Highest peak in the British Isles, site of the UK's oldest weather station", emoji: "🏔️" },
  { name: "Table Mountain", height: 1085, range: "Cape Fold Belt", continent: "Africa", country: "South Africa", fact: "Flat-topped mountain overlooking Cape Town, over 600 million years old", emoji: "🏔️" },
  { name: "Sugarloaf Mountain", height: 396, range: "Carioca Range", continent: "South America", country: "Brazil", fact: "Iconic granite peak at the mouth of Guanabara Bay in Rio de Janeiro", emoji: "🏔️" },
  { name: "Mauna Kea", height: 4207, range: "Hawaiian Islands", continent: "North America", country: "USA", fact: "Tallest mountain from base to summit (10,211m from ocean floor), world's best astronomy site", emoji: "🏔️" },
  { name: "Mount Kosciuszko", height: 2228, range: "Great Dividing Range", continent: "Oceania", country: "Australia", fact: "Highest peak in mainland Australia, one of the Seven Summits", emoji: "🏔️" },
  { name: "Mount Cook", height: 3724, range: "Southern Alps", continent: "Oceania", country: "New Zealand", fact: "Highest peak in New Zealand, named after Captain James Cook", emoji: "🏔️" },
  { name: "Toubkal", height: 4167, range: "Atlas Mountains", continent: "Africa", country: "Morocco", fact: "Highest peak in North Africa, popular trekking destination", emoji: "🏔️" },
];

const DIFFICULTY = {
  easy: { label: "Easy", questions: 10, timePerQ: 25 },
  medium: { label: "Medium", questions: 20, timePerQ: 18 },
  hard: { label: "Hard", questions: 30, timePerQ: 12 },
  expert: { label: "Expert", questions: 40, timePerQ: 8 },
};

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

function generateQuestion(type, pool) {
  const target = pool[Math.floor(Math.random() * pool.length)];

  if (type === "height") {
    const ranges = [
      { label: `< ${(Math.round(target.height / 1000) - 1) * 1000}m`, max: (Math.round(target.height / 1000) - 1) * 1000 },
      { label: `${(Math.round(target.height / 1000) - 1) * 1000}–${Math.round(target.height / 1000) * 1000}m`, min: (Math.round(target.height / 1000) - 1) * 1000, max: Math.round(target.height / 1000) * 1000 },
      { label: `${Math.round(target.height / 1000) * 1000}–${(Math.round(target.height / 1000) + 1) * 1000}m`, min: Math.round(target.height / 1000) * 1000, max: (Math.round(target.height / 1000) + 1) * 1000 },
      { label: `> ${(Math.round(target.height / 1000) + 1) * 1000}m`, min: (Math.round(target.height / 1000) + 1) * 1000 },
    ];
    const correctIdx = ranges.findIndex((r) => {
      if (r.max && r.min) return target.height >= r.min && target.height < r.max;
      if (r.max) return target.height < r.max;
      if (r.min) return target.height >= r.min;
      return false;
    });
    return { question: `${target.emoji} How tall is ${target.name}?`, answer: ranges[correctIdx].label, options: ranges.map((r) => ({ label: r.label, value: r.label })), hint: `Range: ${target.range}` };
  }

  if (type === "range") {
    const allRanges = [...new Set(pool.map((m) => m.range))];
    const wrong = shuffle(allRanges.filter((r) => r !== target.range)).slice(0, 3);
    const opts = shuffle([...wrong, target.range]);
    return { question: `${target.emoji} ${target.name} (${target.height}m)`, answer: target.range, options: opts.map((r) => ({ label: r, value: r })), hint: `Country: ${target.country}` };
  }

  if (type === "continent") {
    const allConts = [...new Set(pool.map((m) => m.continent))];
    const wrong = shuffle(allConts.filter((c) => c !== target.continent)).slice(0, 3);
    const opts = shuffle([...wrong, target.continent]);
    return { question: `${target.emoji} ${target.name} — which continent?`, answer: target.continent, options: opts.map((c) => ({ label: c, value: c })), hint: `Height: ${target.height}m` };
  }

  if (type === "country") {
    const wrongPool = pool.filter((m) => m.country !== target.country);
    const wrongOpts = shuffle(wrongPool).slice(0, 3).map((m) => m.country);
    const opts = shuffle([...new Set([...wrongOpts, target.country])]).slice(0, 4);
    return { question: `${target.emoji} ${target.name} — which country?`, answer: target.country, options: opts.map((c) => ({ label: c, value: c })), hint: `Range: ${target.range}` };
  }

  const wrongMountains = shuffle(pool.filter((m) => m.name !== target.name)).slice(0, 3);
  const opts = shuffle([target, ...wrongMountains]);
  return { question: `${target.emoji} ${target.fact}`, answer: target.name, options: opts.map((m) => ({ label: m.name, value: m.name })), hint: `Height: ${target.height}m` };
}

export default function ToolHome() {
  const [difficulty, setDifficulty] = useState(null);
  const [quizType, setQuizType] = useState("height");
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
    const pool = shuffle(MOUNTAINS).slice(0, Math.max(cfg.questions, 15));
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
MOUNTAIN QUIZ REPORT
Difficulty: ${DIFFICULTY[difficulty].label}
Question Type: ${quizType}
Generated: ${new Date().toLocaleString()}
---------------------------------
RESULTS:
- Score: ${score}/${quiz.length} (${pct}%)
- Best Streak: ${bestStreak}
- Time per Question: ${DIFFICULTY[difficulty].timePerQ}s

BREAKDOWN:
${answers.map((a, i) => `${i + 1}. ${a.question} — ${a.isCorrect ? "CORRECT" : `WRONG (Answer: ${a.correctAnswer})`}`).join("\n")}

---------------------------------
Mountain Quiz — Educational tool
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
    link.download = `Mountain_Quiz_${DIFFICULTY[difficulty].label}.txt`;
    link.click();
  };

  const topMountains = [...MOUNTAINS].sort((a, b) => b.height - a.height).slice(0, 10);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>This quiz covers 30 of the world&apos;s most famous mountains across all 7 continents with heights, ranges, and facts.</p>
          </div>
        </div>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-stone-50 px-3 py-1 text-xs font-semibold uppercase text-stone-700">
            <Mountain className="h-4 w-4" />
            Mountain knowledge quiz
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Mountain Quiz</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Test your knowledge of world mountains — identify by height, range, continent, country, or name with timed questions and streak scoring.
          </p>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Top 10 Highest Peaks</h2>
          <div className="space-y-2">
            {topMountains.map((m, i) => (
              <div key={m.name} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm">
                <span className="w-6 text-center font-black text-[var(--primary)]">#{i + 1}</span>
                <span className="flex-1 font-semibold text-[var(--foreground)]">{m.name}</span>
                <span className="text-xs text-[var(--foreground)]">{m.range}</span>
                <span className="font-bold text-[var(--foreground)] tabular-nums">{m.height.toLocaleString()}m</span>
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
                {[{ id: "height", label: "How Tall?" }, { id: "range", label: "Which Range?" }, { id: "continent", label: "Which Continent?" }, { id: "country", label: "Which Country?" }, { id: "name", label: "Name the Peak" }].map((qt) => (
                  <button key={qt.id} onClick={() => setQuizType(qt.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${quizType === qt.id ? "bg-stone-700 text-white" : "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)]"}`}>
                    {qt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Object.entries(DIFFICULTY).map(([key, cfg]) => (
                <button key={key} onClick={() => startQuiz(key, quizType)} className="group rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 text-center transition-all hover:border-stone-500 hover:shadow-[var(--anslation-ds-shadow-md)] active:scale-[0.97]">
                  <p className="text-2xl font-bold text-[var(--foreground)] group-hover:text-[var(--primary)]">{cfg.questions}</p>
                  <p className="text-sm font-semibold text-[var(--foreground)] mt-1">{cfg.label}</p>
                  <p className="text-xs text-[var(--foreground)] mt-2">{cfg.timePerQ}s / question</p>
                </button>
              ))}
            </div>
          </section>
        ) : gameOver ? (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] space-y-6 animate-in fade-in duration-500">
            <div className="text-center">
              <Trophy className="h-16 w-16 text-amber-500 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Quiz Complete!</h2>
              <p className="text-lg text-[var(--foreground)] mt-2">{score}/{quiz.length} correct — {((score / quiz.length) * 100).toFixed(0)}%</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs text-[var(--foreground)] uppercase tracking-widest font-bold">Score</p>
                <p className="text-3xl font-black text-[var(--foreground)] mt-1">{score}</p>
                <p className="text-xs text-[var(--foreground)]">of {quiz.length}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs text-[var(--foreground)] uppercase tracking-widest font-bold">Accuracy</p>
                <p className="text-3xl font-black text-[var(--foreground)] mt-1">{((score / quiz.length) * 100).toFixed(0)}%</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs text-[var(--foreground)] uppercase tracking-widest font-bold">Best Streak</p>
                <p className="text-3xl font-black text-amber-500 mt-1">{bestStreak}</p>
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
                <div className="h-full rounded-full bg-stone-600 transition-all duration-300" style={{ width: `${((currentIdx + 1) / quiz.length) * 100}%` }} />
              </div>
              <div className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-bold ${timeColor}`}>
                <Timer className="h-4 w-4" /> {timer}s
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--foreground)]">
                <Target className="h-4 w-4 text-[var(--primary)]" /> Score: {score}
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-sm font-bold text-amber-700 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-300">
                  <Zap className="h-4 w-4" /> {streak} streak {getStreakMsg(streak)}
                </div>
              )}
            </div>

            <div className="rounded-lg bg-[var(--background)] p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">{quizType === "height" ? "How Tall?" : quizType === "range" ? "Which Range?" : quizType === "continent" ? "Which Continent?" : quizType === "country" ? "Which Country?" : "Name the Peak"}</p>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">{current.question}</h2>
              {showHint && (
                <p className="mt-3 text-sm font-semibold text-[var(--muted-foreground)]">Hint: {current.hint}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {current.options.map((opt) => {
                const isCorrect = opt.value === current.answer;
                const isSelected = selected === opt.value;
                let optStyle = "border-[var(--border)] bg-[var(--background)] hover:border-stone-500 hover:shadow-[var(--anslation-ds-shadow-sm)]";
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
              <button onClick={() => setShowHint(true)} className="w-full rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 py-2.5 text-sm font-semibold text-stone-700 transition-all hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800">
                Show Hint
              </button>
            )}

            <button onClick={reset} className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition-all hover:bg-[var(--muted)]">Quit Quiz</button>
          </section>
        )}

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">About World Mountains</h3>
          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">The Seven Summits</p>
              <p>The Seven Summits are the highest peaks on each continent: Everest (Asia), Aconcagua (S. America), Denali (N. America), Kilimanjaro (Africa), Elbrus (Europe), Vinson (Antarctica), and Puncak Jaya (Oceania). Completing all seven is a major mountaineering achievement.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Mountain Formation</p>
              <p>Mountains form through tectonic plate collisions (Himalayas), volcanic activity (Mount Fuji), or erosion (Table Mountain). The Himalayas are still rising ~5mm per year as the Indian plate pushes into Eurasia. Mountains influence weather, culture, and biodiversity.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
