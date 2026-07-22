"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Map, RotateCcw, Info, Copy, Download, CheckCircle2, Trophy, Timer, Target, Globe, MapPin } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const PUZZLE_COUNTRIES = [
  { country: "United States", capital: "Washington D.C.", continent: "North America", fact: "Third largest country by area (9.8M km²)" },
  { country: "Brazil", capital: "Brasilia", continent: "South America", fact: "Largest country in South America and 5th largest in the world" },
  { country: "China", capital: "Beijing", continent: "Asia", fact: "Most populous country with 1.4 billion people" },
  { country: "India", capital: "New Delhi", continent: "Asia", fact: "Second most populous country, birthplace of zero and chess" },
  { country: "Australia", capital: "Canberra", continent: "Oceania", fact: "Both a country and a continent, home to unique wildlife" },
  { country: "Russia", capital: "Moscow", continent: "Europe/Asia", fact: "Largest country by area spanning 11 time zones" },
  { country: "Canada", capital: "Ottawa", continent: "North America", fact: "Second largest country with the longest coastline in the world" },
  { country: "Japan", capital: "Tokyo", continent: "Asia", fact: "Island nation with over 6,800 islands" },
  { country: "Germany", capital: "Berlin", continent: "Europe", fact: "Europe's largest economy, famous for engineering" },
  { country: "France", capital: "Paris", continent: "Europe", fact: "Most visited country in the world by tourists" },
  { country: "United Kingdom", capital: "London", continent: "Europe", fact: "Historic maritime empire, birthplace of the Industrial Revolution" },
  { country: "Italy", capital: "Rome", continent: "Europe", fact: "Home to the Roman Empire and the most UNESCO World Heritage Sites" },
  { country: "Mexico", capital: "Mexico City", continent: "North America", fact: "Built on the ruins of the Aztec capital Tenochtitlan" },
  { country: "South Korea", capital: "Seoul", continent: "Asia", fact: "Fastest internet speeds in the world, birthplace of K-pop" },
  { country: "Turkey", capital: "Ankara", continent: "Asia/Europe", fact: "Spans two continents, crossroads of civilizations" },
  { country: "Saudi Arabia", capital: "Riyadh", continent: "Asia", fact: "Largest economy in the Middle East, home to Islam's holiest sites" },
  { country: "Argentina", capital: "Buenos Aires", continent: "South America", fact: "Birthplace of tango and the world's widest avenue" },
  { country: "South Africa", capital: "Pretoria", continent: "Africa", fact: "Three capital cities, most diverse country in Africa" },
  { country: "Egypt", capital: "Cairo", continent: "Africa", fact: "Home to the last remaining Ancient Wonder — the Great Pyramids" },
  { country: "Nigeria", capital: "Abuja", continent: "Africa", fact: "Most populous country in Africa, largest economy in Africa" },
  { country: "Thailand", capital: "Bangkok", continent: "Asia", fact: "Only Southeast Asian country never colonized by a European power" },
  { country: "Indonesia", capital: "Jakarta", continent: "Asia", fact: "World's largest archipelago with 17,000+ islands" },
  { country: "Vietnam", capital: "Hanoi", continent: "Asia", fact: "World's second largest coffee producer" },
  { country: "Colombia", capital: "Bogota", continent: "South America", fact: "Named after Christopher Columbus, world's leading emerald producer" },
  { country: "Kenya", capital: "Nairobi", continent: "Africa", fact: "Famous for safari tourism and long-distance runners" },
  { country: "Peru", capital: "Lima", continent: "South America", fact: "Home to Machu Picchu and the ancient Inca Empire" },
  { country: "Poland", capital: "Warsaw", continent: "Europe", fact: "Rebuilt from rubble after WWII, home to Copernicus" },
  { country: "Morocco", capital: "Rabat", continent: "Africa", fact: "Gateway to Africa, home to the ancient city of Fez" },
  { country: "Norway", capital: "Oslo", continent: "Europe", fact: "Land of the fjords, world leader in electric vehicle adoption" },
  { country: "Chile", capital: "Santiago", continent: "South America", fact: "Longest and narrowest country in the world" },
  { country: "Cuba", capital: "Havana", continent: "North America", fact: "Largest island in the Caribbean, famous for vintage cars" },
  { country: "Iceland", capital: "Reykjavik", continent: "Europe", fact: "Land of fire and ice, 100% renewable energy" },
  { country: "Greece", capital: "Athens", continent: "Europe", fact: "Birthplace of democracy, philosophy, and the Olympic Games" },
  { country: "New Zealand", capital: "Wellington", continent: "Oceania", fact: "First country to grant women the right to vote" },
  { country: "Switzerland", capital: "Bern", continent: "Europe", fact: "Home to the Alps, banking secrecy, and neutrality" },
  { country: "Sweden", capital: "Stockholm", continent: "Europe", fact: "Birthplace of IKEA, ABBA, and the Nobel Prize" },
  { country: "Austria", capital: "Vienna", continent: "Europe", fact: "The world's most liveable city, birthplace of Mozart" },
  { country: "Pakistan", capital: "Islamabad", continent: "Asia", fact: "Home to K2, the world's second highest mountain" },
  { country: "Philippines", capital: "Manila", continent: "Asia", fact: "Over 7,600 islands, one of the world's most biodiverse countries" },
  { country: "Malaysia", capital: "Kuala Lumpur", continent: "Asia", fact: "Home to the Petronas Towers, once world's tallest building" },
  { country: "Singapore", capital: "Singapore", continent: "Asia", fact: "One of the world's smallest and wealthiest nations" },
  { country: "Portugal", capital: "Lisbon", continent: "Europe", fact: "Oldest nation-state in Europe, Age of Discovery pioneer" },
  { country: "Czech Republic", capital: "Prague", continent: "Europe", fact: "City of a Hundred Spires, famous for beer culture" },
  { country: "Romania", capital: "Bucharest", continent: "Europe", fact: "Home of Transylvania and the legend of Dracula" },
  { country: "Hungary", capital: "Budapest", continent: "Europe", fact: "City of Spas, birthplace of the Rubik's Cube" },
  { country: "Finland", capital: "Helsinki", continent: "Europe", fact: "Happiest country in the world for 6 years running" },
  { country: "Denmark", capital: "Copenhagen", continent: "Europe", fact: "Birthplace of LEGO and Hans Christian Andersen fairy tales" },
  { country: "Ireland", capital: "Dublin", continent: "Europe", fact: "Land of a Hundred Thousand Welcomes, home of Guinness" },
  { country: "Jamaica", capital: "Kingston", continent: "North America", fact: "Birthplace of reggae music and Bob Marley" },
  { country: "Costa Rica", capital: "San Jose", continent: "North America", fact: "No army since 1948, home to 5% of world's biodiversity" },
  { country: "Ukraine", capital: "Kyiv", continent: "Europe", fact: "Largest country entirely within Europe, breadbasket of Europe" },
  { country: "Ecuador", capital: "Quito", continent: "South America", fact: "Named after the equator, straddles the equatorial line" },
  { country: "Jordan", capital: "Amman", continent: "Asia", fact: "Home to Petra, one of the New Seven Wonders of the World" },
  { country: "Oman", capital: "Muscat", continent: "Asia", fact: "Ancient maritime trading hub on the Arabian Peninsula" },
  { country: "Nepal", capital: "Kathmandu", continent: "Asia", fact: "Home to Mount Everest, the highest point on Earth" },
  { country: "Sri Lanka", capital: "Sri Jayawardenepura Kotte", continent: "Asia", fact: "Pearl of the Indian Ocean, ancient Buddhist civilization" },
  { country: "Tanzania", capital: "Dodoma", continent: "Africa", fact: "Home to Mount Kilimanjaro and the Serengeti migration" },
  { country: "Ethiopia", capital: "Addis Ababa", continent: "Africa", fact: "Birthplace of coffee, only African country never colonized" },
  { country: "Senegal", capital: "Dakar", continent: "Africa", fact: "Westernmost point of Africa, gateway to the continent" },
  { country: "Ghana", capital: "Accra", continent: "Africa", fact: "First sub-Saharan African country to gain independence" },
  { country: "Tunisia", capital: "Tunis", continent: "Africa", fact: "Home to ancient Carthage and the starting point of the Arab Spring" },
  { country: "Bolivia", capital: "Sucre", continent: "South America", fact: "Landlocked, home to the world's largest salt flat" },
  { country: "Paraguay", capital: "Asuncion", continent: "South America", fact: "Heart of South America, land of the Guarani people" },
  { country: "Uruguay", capital: "Montevideo", continent: "South America", fact: "Smallest Spanish-speaking country, progressive social policies" },
  { country: "Panama", capital: "Panama City", continent: "North America", fact: "Home to the Panama Canal connecting Atlantic and Pacific" },
  { country: "Honduras", capital: "Tegucigalpa", continent: "North America", fact: "Home to Copán, one of the most important Maya cities" },
  { country: "Guatemala", capital: "Guatemala City", continent: "North America", fact: "Heart of the Maya civilization, home to Tikal" },
  { country: "Cambodia", capital: "Phnom Penh", continent: "Asia", fact: "Home to Angkor Wat, the world's largest religious monument" },
  { country: "Myanmar", capital: "Naypyidaw", continent: "Asia", fact: "Home to thousands of Buddhist temples in Bagan" },
  { country: "Laos", capital: "Vientiane", continent: "Asia", fact: "Landlocked, known for Buddhist temples and waterfalls" },
  { country: "Mongolia", capital: "Ulaanbaatar", continent: "Asia", fact: "Birthplace of Genghis Khan, most sparsely populated country" },
  { country: "Niger", capital: "Niamey", continent: "Africa", fact: "Named after the Niger River, home to the Sahara Desert" },
  { country: "Mali", capital: "Bamako", continent: "Africa", fact: "Home to Timbuktu, ancient center of learning and trade" },
  { country: "Uzbekistan", capital: "Tashkent", continent: "Asia", fact: "Heart of the Silk Road, home to Samarkand" },
  { country: "Georgia", capital: "Tbilisi", continent: "Asia/Europe", fact: "One of the oldest wine-making countries (8,000 years)" },
  { country: "Armenia", capital: "Yerevan", continent: "Asia", fact: "One of the oldest civilizations, first Christian nation" },
  { country: "Azerbaijan", capital: "Baku", continent: "Asia", fact: "Land of Fire, home to the Flame Towers" },
];

const DIFFICULTY = {
  easy: { label: "Easy", questions: 10, timePerQ: 45 },
  medium: { label: "Medium", questions: 20, timePerQ: 30 },
  hard: { label: "Hard", questions: 30, timePerQ: 20 },
  expert: { label: "Expert", questions: 50, timePerQ: 12 },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getWrongAnswers(correct, pool, count = 3) {
  return shuffle(pool.filter((c) => c.country !== correct.country)).slice(0, count);
}

function getStreakMsg(streak) {
  if (streak >= 10) return "Legendary!";
  if (streak >= 7) return "Unstoppable!";
  if (streak >= 5) return "On Fire!";
  if (streak >= 3) return "Nice!";
  return "";
}

const CONTINENT_ICONS = {
  "North America": "🌎",
  "South America": "🌎",
  "Europe": "🌍",
  "Africa": "🌍",
  "Asia": "🌏",
  "Oceania": "🌏",
  "Europe/Asia": "🌍",
  "Asia/Europe": "🌏",
};

export default function ToolHome() {
  const [difficulty, setDifficulty] = useState(null);
  const [puzzle, setPuzzle] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const startPuzzle = (diff) => {
    setDifficulty(diff);
    const cfg = DIFFICULTY[diff];
    setPuzzle(shuffle(PUZZLE_COUNTRIES).slice(0, cfg.questions));
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSelected(null);
    setAnswers([]);
    setGameOver(false);
    setTimer(cfg.timePerQ);
  };

  const handleAnswer = useCallback((answer) => {
    clearInterval(timerRef.current);
    setSelected(answer);
    const current = puzzle[currentIdx];
    const correct = answer !== null && answer === current.country;
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

    setAnswers((a) => [...a, {
      country: current.country, continent: current.continent,
      correctAnswer: current.country, userAnswer: answer,
      isCorrect: correct, fact: current.fact,
    }]);

    setTimeout(() => {
      if (currentIdx + 1 >= puzzle.length) {
        setGameOver(true);
      } else {
        setCurrentIdx((i) => i + 1);
        setSelected(null);
        setTimer(DIFFICULTY[difficulty].timePerQ);
      }
    }, 1500);
  }, [puzzle, currentIdx, streak, difficulty]);

  useEffect(() => {
    if (gameOver || !puzzle || selected !== null) return;
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
  }, [currentIdx, selected, gameOver, puzzle, handleAnswer]);

  const current = puzzle?.[currentIdx];
  const options = current ? shuffle([current, ...getWrongAnswers(current, PUZZLE_COUNTRIES, 3)]) : [];
  const timePct = puzzle ? (timer / DIFFICULTY[difficulty].timePerQ) * 100 : 100;
  const timeColor = timer <= 5 ? "text-red-600 bg-red-50" : timer <= 10 ? "text-amber-600 bg-amber-50" : "text-[var(--foreground)] bg-[var(--background)]";

  const reset = () => { setPuzzle(null); setDifficulty(null); setGameOver(false); setAnswers([]); };

  const buildReportText = () => {
    if (!gameOver) return "";
    const pct = puzzle.length > 0 ? ((score / puzzle.length) * 100).toFixed(1) : 0;
    return `
MAP PUZZLE REPORT
Difficulty: ${DIFFICULTY[difficulty].label}
Generated: ${new Date().toLocaleString()}
---------------------------------
RESULTS:
- Score: ${score}/${puzzle.length} (${pct}%)
- Best Streak: ${bestStreak}
- Time per Question: ${DIFFICULTY[difficulty].timePerQ}s

BREAKDOWN:
${answers.map((a, i) => `${i + 1}. [${a.continent}] ${a.isCorrect ? "CORRECT" : `WRONG — Answer: ${a.correctAnswer}`} | Fun Fact: ${a.fact}`).join("\n")}

---------------------------------
This calculator is for educational and informational purposes only.
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
    link.download = `Map_Puzzle_${DIFFICULTY[difficulty].label}.txt`;
    link.click();
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Disclaimer */}
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>This calculator is for educational and informational purposes only. Clinical decisions should always be made by qualified healthcare professionals.</p>
          </div>
        </div>

        {/* Header */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase text-emerald-700">
            <Map className="h-4 w-4" />
            Geography knowledge puzzle
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Map Puzzle</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Identify countries from clues about their capital, continent, and unique facts. Test your geography knowledge with timed puzzles and streak scoring.
          </p>
        </section>

        {!puzzle ? (
          /* Difficulty Selection */
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">Select Difficulty</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Object.entries(DIFFICULTY).map(([key, cfg]) => (
                <button key={key} onClick={() => startPuzzle(key)} className="group rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 text-center transition-all hover:border-emerald-500 hover:shadow-[var(--anslation-ds-shadow-md)] active:scale-[0.97]">
                  <p className="text-2xl font-bold text-[var(--foreground)] group-hover:text-emerald-600">{cfg.questions}</p>
                  <p className="text-sm font-semibold text-[var(--muted)] mt-1">{cfg.label}</p>
                  <p className="text-xs text-[var(--muted)] mt-2">{cfg.timePerQ}s / question</p>
                </button>
              ))}
            </div>
          </section>
        ) : gameOver ? (
          /* Results */
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] space-y-6 animate-in fade-in duration-500">
            <div className="text-center">
              <Trophy className="h-16 w-16 text-emerald-500 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Puzzle Complete!</h2>
              <p className="text-lg text-[var(--muted)] mt-2">
                {score}/{puzzle.length} correct — {((score / puzzle.length) * 100).toFixed(0)}%
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs text-[var(--muted)] uppercase tracking-widest font-bold">Score</p>
                <p className="text-3xl font-black text-[var(--foreground)] mt-1">{score}</p>
                <p className="text-xs text-[var(--muted)]">of {puzzle.length}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs text-[var(--muted)] uppercase tracking-widest font-bold">Accuracy</p>
                <p className="text-3xl font-black text-[var(--foreground)] mt-1">{((score / puzzle.length) * 100).toFixed(0)}%</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs text-[var(--muted)] uppercase tracking-widest font-bold">Best Streak</p>
                <p className="text-3xl font-black text-emerald-500 mt-1">{bestStreak}</p>
              </div>
            </div>

            {/* Answer Review */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Answer Review</h3>
              <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
                {answers.map((a, i) => (
                  <div key={i} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${a.isCorrect ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-[var(--foreground)]">
                        {CONTINENT_ICONS[a.continent] || "🌍"} {a.country}
                      </span>
                      {!a.isCorrect && <span className="ml-2 text-red-600">→ {a.correctAnswer}</span>}
                    </div>
                    <span className="text-xs text-[var(--muted)] ml-2 shrink-0">{a.fact}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={reset} className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--anslation-ds-shadow-sm)] transition-all hover:shadow-[var(--anslation-ds-shadow-md)] active:scale-[0.98]">Play Again</button>
              <button onClick={copyReport} className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold transition-all hover:bg-[var(--muted)]">
                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button onClick={downloadReport} className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold transition-all hover:bg-[var(--muted)]">
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          </section>
        ) : (
          /* Puzzle Game */
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6 space-y-6">
            {/* Progress */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-[var(--foreground)]">{currentIdx + 1}/{puzzle.length}</span>
              <div className="flex-1 h-3 overflow-hidden rounded-full bg-[var(--muted)]/40">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${((currentIdx + 1) / puzzle.length) * 100}%` }} />
              </div>
              <div className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-bold ${timeColor}`}>
                <Timer className="h-4 w-4" /> {timer}s
              </div>
            </div>

            {/* Score + Streak */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--foreground)]">
                <Target className="h-4 w-4 text-emerald-600" /> Score: {score}
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-sm font-bold text-emerald-700">
                  <Globe className="h-4 w-4" /> {streak} streak {getStreakMsg(streak)}
                </div>
              )}
            </div>

            {/* Clue Card */}
            <div className="rounded-lg bg-[var(--background)] p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Which country is this?</p>
              <div className="flex items-center justify-center gap-3 mb-3">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <span className="text-lg font-bold text-[var(--foreground)]">Capital: {current.capital}</span>
              </div>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-2xl">{CONTINENT_ICONS[current.continent] || "🌍"}</span>
                <span className="text-sm font-semibold text-[var(--muted)]">{current.continent}</span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] italic max-w-md mx-auto">{current.fact}</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {options.map((opt) => {
                const isCorrect = opt.country === current.country;
                const isSelected = selected === opt.country;
                let optStyle = "border-[var(--border)] bg-[var(--background)] hover:border-emerald-500 hover:shadow-[var(--anslation-ds-shadow-sm)]";
                if (selected !== null) {
                  if (isCorrect) optStyle = "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/30";
                  else if (isSelected && !isCorrect) optStyle = "border-red-500 bg-red-50 ring-2 ring-red-500/30";
                  else optStyle = "border-[var(--border)] bg-[var(--background)] opacity-50";
                }
                return (
                  <button key={opt.country} disabled={selected !== null} onClick={() => handleAnswer(opt.country)} className={`rounded-lg border px-4 py-4 text-left text-base font-semibold transition-all active:scale-[0.98] ${optStyle}`}>
                    <span className="text-[var(--foreground)]">{CONTINENT_ICONS[opt.continent] || "🌍"} {opt.country}</span>
                  </button>
                );
              })}
            </div>

            <button onClick={reset} className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold transition-all hover:bg-[var(--muted)]">Quit Puzzle</button>
          </section>
        )}

        {/* Educational */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">Geography Fun Facts</h3>
          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">World by Numbers</p>
              <p>There are 195 countries in the world — 193 UN member states plus 2 observers (Vatican City and Palestine). The world has 7 continents, 24 time zones, and over 7,000 languages spoken. Russia alone spans 11 time zones across Europe and Asia.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Geographic Extremes</p>
              <p>The tallest mountain is Mount Everest at 8,849m. The deepest ocean point is the Mariana Trench at 10,935m. The longest river is the Nile at 6,650km. The largest country is Russia at 17.1M km² — nearly twice the size of Canada.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
