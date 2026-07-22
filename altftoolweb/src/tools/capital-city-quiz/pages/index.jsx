"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Landmark, RotateCcw, Info, Copy, Download, CheckCircle2, Trophy, Timer, Zap, Target } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const COUNTRIES = [
  { country: "Afghanistan", capital: "Kabul", continent: "Asia" },
  { country: "Albania", capital: "Tirana", continent: "Europe" },
  { country: "Algeria", capital: "Algiers", continent: "Africa" },
  { country: "Andorra", capital: "Andorra la Vella", continent: "Europe" },
  { country: "Angola", capital: "Luanda", continent: "Africa" },
  { country: "Antigua and Barbuda", capital: "St. John's", continent: "N. America" },
  { country: "Argentina", capital: "Buenos Aires", continent: "S. America" },
  { country: "Armenia", capital: "Yerevan", continent: "Asia" },
  { country: "Australia", capital: "Canberra", continent: "Oceania" },
  { country: "Austria", capital: "Vienna", continent: "Europe" },
  { country: "Azerbaijan", capital: "Baku", continent: "Asia" },
  { country: "Bahamas", capital: "Nassau", continent: "N. America" },
  { country: "Bahrain", capital: "Manama", continent: "Asia" },
  { country: "Bangladesh", capital: "Dhaka", continent: "Asia" },
  { country: "Barbados", capital: "Bridgetown", continent: "N. America" },
  { country: "Belarus", capital: "Minsk", continent: "Europe" },
  { country: "Belgium", capital: "Brussels", continent: "Europe" },
  { country: "Belize", capital: "Belmopan", continent: "N. America" },
  { country: "Benin", capital: "Porto-Novo", continent: "Africa" },
  { country: "Bhutan", capital: "Thimphu", continent: "Asia" },
  { country: "Bolivia", capital: "Sucre", continent: "S. America" },
  { country: "Bosnia and Herzegovina", capital: "Sarajevo", continent: "Europe" },
  { country: "Botswana", capital: "Gaborone", continent: "Africa" },
  { country: "Brazil", capital: "Brasilia", continent: "S. America" },
  { country: "Brunei", capital: "Bandar Seri Begawan", continent: "Asia" },
  { country: "Bulgaria", capital: "Sofia", continent: "Europe" },
  { country: "Burkina Faso", capital: "Ouagadougou", continent: "Africa" },
  { country: "Burundi", capital: "Gitega", continent: "Africa" },
  { country: "Cambodia", capital: "Phnom Penh", continent: "Asia" },
  { country: "Cameroon", capital: "Yaounde", continent: "Africa" },
  { country: "Canada", capital: "Ottawa", continent: "N. America" },
  { country: "Cape Verde", capital: "Praia", continent: "Africa" },
  { country: "Central African Republic", capital: "Bangui", continent: "Africa" },
  { country: "Chad", capital: "N'Djamena", continent: "Africa" },
  { country: "Chile", capital: "Santiago", continent: "S. America" },
  { country: "China", capital: "Beijing", continent: "Asia" },
  { country: "Colombia", capital: "Bogota", continent: "S. America" },
  { country: "Comoros", capital: "Moroni", continent: "Africa" },
  { country: "Congo (DRC)", capital: "Kinshasa", continent: "Africa" },
  { country: "Congo (Republic)", capital: "Brazzaville", continent: "Africa" },
  { country: "Costa Rica", capital: "San Jose", continent: "N. America" },
  { country: "Croatia", capital: "Zagreb", continent: "Europe" },
  { country: "Cuba", capital: "Havana", continent: "N. America" },
  { country: "Cyprus", capital: "Nicosia", continent: "Europe" },
  { country: "Czech Republic", capital: "Prague", continent: "Europe" },
  { country: "Denmark", capital: "Copenhagen", continent: "Europe" },
  { country: "Djibouti", capital: "Djibouti", continent: "Africa" },
  { country: "Dominica", capital: "Roseau", continent: "N. America" },
  { country: "Dominican Republic", capital: "Santo Domingo", continent: "N. America" },
  { country: "East Timor", capital: "Dili", continent: "Asia" },
  { country: "Ecuador", capital: "Quito", continent: "S. America" },
  { country: "Egypt", capital: "Cairo", continent: "Africa" },
  { country: "El Salvador", capital: "San Salvador", continent: "N. America" },
  { country: "Equatorial Guinea", capital: "Malabo", continent: "Africa" },
  { country: "Eritrea", capital: "Asmara", continent: "Africa" },
  { country: "Estonia", capital: "Tallinn", continent: "Europe" },
  { country: "Eswatini", capital: "Mbabane", continent: "Africa" },
  { country: "Ethiopia", capital: "Addis Ababa", continent: "Africa" },
  { country: "Fiji", capital: "Suva", continent: "Oceania" },
  { country: "Finland", capital: "Helsinki", continent: "Europe" },
  { country: "France", capital: "Paris", continent: "Europe" },
  { country: "Gabon", capital: "Libreville", continent: "Africa" },
  { country: "Gambia", capital: "Banjul", continent: "Africa" },
  { country: "Georgia", capital: "Tbilisi", continent: "Asia" },
  { country: "Germany", capital: "Berlin", continent: "Europe" },
  { country: "Ghana", capital: "Accra", continent: "Africa" },
  { country: "Greece", capital: "Athens", continent: "Europe" },
  { country: "Grenada", capital: "St. George's", continent: "N. America" },
  { country: "Guatemala", capital: "Guatemala City", continent: "N. America" },
  { country: "Guinea", capital: "Conakry", continent: "Africa" },
  { country: "Guinea-Bissau", capital: "Bissau", continent: "Africa" },
  { country: "Guyana", capital: "Georgetown", continent: "S. America" },
  { country: "Haiti", capital: "Port-au-Prince", continent: "N. America" },
  { country: "Honduras", capital: "Tegucigalpa", continent: "N. America" },
  { country: "Hungary", capital: "Budapest", continent: "Europe" },
  { country: "Iceland", capital: "Reykjavik", continent: "Europe" },
  { country: "India", capital: "New Delhi", continent: "Asia" },
  { country: "Indonesia", capital: "Jakarta", continent: "Asia" },
  { country: "Iran", capital: "Tehran", continent: "Asia" },
  { country: "Iraq", capital: "Baghdad", continent: "Asia" },
  { country: "Ireland", capital: "Dublin", continent: "Europe" },
  { country: "Israel", capital: "Jerusalem", continent: "Asia" },
  { country: "Italy", capital: "Rome", continent: "Europe" },
  { country: "Ivory Coast", capital: "Yamoussoukro", continent: "Africa" },
  { country: "Jamaica", capital: "Kingston", continent: "N. America" },
  { country: "Japan", capital: "Tokyo", continent: "Asia" },
  { country: "Jordan", capital: "Amman", continent: "Asia" },
  { country: "Kazakhstan", capital: "Astana", continent: "Asia" },
  { country: "Kenya", capital: "Nairobi", continent: "Africa" },
  { country: "Kiribati", capital: "Tarawa", continent: "Oceania" },
  { country: "Kosovo", capital: "Pristina", continent: "Europe" },
  { country: "Kuwait", capital: "Kuwait City", continent: "Asia" },
  { country: "Kyrgyzstan", capital: "Bishkek", continent: "Asia" },
  { country: "Laos", capital: "Vientiane", continent: "Asia" },
  { country: "Latvia", capital: "Riga", continent: "Europe" },
  { country: "Lebanon", capital: "Beirut", continent: "Asia" },
  { country: "Lesotho", capital: "Maseru", continent: "Africa" },
  { country: "Liberia", capital: "Monrovia", continent: "Africa" },
  { country: "Libya", capital: "Tripoli", continent: "Africa" },
  { country: "Liechtenstein", capital: "Vaduz", continent: "Europe" },
  { country: "Lithuania", capital: "Vilnius", continent: "Europe" },
  { country: "Luxembourg", capital: "Luxembourg", continent: "Europe" },
  { country: "Madagascar", capital: "Antananarivo", continent: "Africa" },
  { country: "Malawi", capital: "Lilongwe", continent: "Africa" },
  { country: "Malaysia", capital: "Kuala Lumpur", continent: "Asia" },
  { country: "Maldives", capital: "Male", continent: "Asia" },
  { country: "Mali", capital: "Bamako", continent: "Africa" },
  { country: "Malta", capital: "Valletta", continent: "Europe" },
  { country: "Marshall Islands", capital: "Majuro", continent: "Oceania" },
  { country: "Mauritania", capital: "Nouakchott", continent: "Africa" },
  { country: "Mauritius", capital: "Port Louis", continent: "Africa" },
  { country: "Mexico", capital: "Mexico City", continent: "N. America" },
  { country: "Micronesia", capital: "Palikir", continent: "Oceania" },
  { country: "Moldova", capital: "Chisinau", continent: "Europe" },
  { country: "Monaco", capital: "Monaco", continent: "Europe" },
  { country: "Mongolia", capital: "Ulaanbaatar", continent: "Asia" },
  { country: "Montenegro", capital: "Podgorica", continent: "Europe" },
  { country: "Morocco", capital: "Rabat", continent: "Africa" },
  { country: "Mozambique", capital: "Maputo", continent: "Africa" },
  { country: "Myanmar", capital: "Naypyidaw", continent: "Asia" },
  { country: "Namibia", capital: "Windhoek", continent: "Africa" },
  { country: "Nauru", capital: "Yaren", continent: "Oceania" },
  { country: "Nepal", capital: "Kathmandu", continent: "Asia" },
  { country: "Netherlands", capital: "Amsterdam", continent: "Europe" },
  { country: "New Zealand", capital: "Wellington", continent: "Oceania" },
  { country: "Nicaragua", capital: "Managua", continent: "N. America" },
  { country: "Niger", capital: "Niamey", continent: "Africa" },
  { country: "Nigeria", capital: "Abuja", continent: "Africa" },
  { country: "North Korea", capital: "Pyongyang", continent: "Asia" },
  { country: "North Macedonia", capital: "Skopje", continent: "Europe" },
  { country: "Norway", capital: "Oslo", continent: "Europe" },
  { country: "Oman", capital: "Muscat", continent: "Asia" },
  { country: "Pakistan", capital: "Islamabad", continent: "Asia" },
  { country: "Palau", capital: "Ngerulmud", continent: "Oceania" },
  { country: "Palestine", capital: "Ramallah", continent: "Asia" },
  { country: "Panama", capital: "Panama City", continent: "N. America" },
  { country: "Papua New Guinea", capital: "Port Moresby", continent: "Oceania" },
  { country: "Paraguay", capital: "Asuncion", continent: "S. America" },
  { country: "Peru", capital: "Lima", continent: "S. America" },
  { country: "Philippines", capital: "Manila", continent: "Asia" },
  { country: "Poland", capital: "Warsaw", continent: "Europe" },
  { country: "Portugal", capital: "Lisbon", continent: "Europe" },
  { country: "Qatar", capital: "Doha", continent: "Asia" },
  { country: "Romania", capital: "Bucharest", continent: "Europe" },
  { country: "Russia", capital: "Moscow", continent: "Europe" },
  { country: "Rwanda", capital: "Kigali", continent: "Africa" },
  { country: "Saint Kitts and Nevis", capital: "Basseterre", continent: "N. America" },
  { country: "Saint Lucia", capital: "Castries", continent: "N. America" },
  { country: "Saint Vincent and the Grenadines", capital: "Kingstown", continent: "N. America" },
  { country: "Samoa", capital: "Apia", continent: "Oceania" },
  { country: "San Marino", capital: "San Marino", continent: "Europe" },
  { country: "Sao Tome and Principe", capital: "Sao Tome", continent: "Africa" },
  { country: "Saudi Arabia", capital: "Riyadh", continent: "Asia" },
  { country: "Senegal", capital: "Dakar", continent: "Africa" },
  { country: "Serbia", capital: "Belgrade", continent: "Europe" },
  { country: "Seychelles", capital: "Victoria", continent: "Africa" },
  { country: "Sierra Leone", capital: "Freetown", continent: "Africa" },
  { country: "Singapore", capital: "Singapore", continent: "Asia" },
  { country: "Slovakia", capital: "Bratislava", continent: "Europe" },
  { country: "Slovenia", capital: "Ljubljana", continent: "Europe" },
  { country: "Solomon Islands", capital: "Honiara", continent: "Oceania" },
  { country: "Somalia", capital: "Mogadishu", continent: "Africa" },
  { country: "South Africa", capital: "Pretoria", continent: "Africa" },
  { country: "South Korea", capital: "Seoul", continent: "Asia" },
  { country: "South Sudan", capital: "Juba", continent: "Africa" },
  { country: "Spain", capital: "Madrid", continent: "Europe" },
  { country: "Sri Lanka", capital: "Sri Jayawardenepura Kotte", continent: "Asia" },
  { country: "Sudan", capital: "Khartoum", continent: "Africa" },
  { country: "Suriname", capital: "Paramaribo", continent: "S. America" },
  { country: "Sweden", capital: "Stockholm", continent: "Europe" },
  { country: "Switzerland", capital: "Bern", continent: "Europe" },
  { country: "Syria", capital: "Damascus", continent: "Asia" },
  { country: "Taiwan", capital: "Taipei", continent: "Asia" },
  { country: "Tajikistan", capital: "Dushanbe", continent: "Asia" },
  { country: "Tanzania", capital: "Dodoma", continent: "Africa" },
  { country: "Thailand", capital: "Bangkok", continent: "Asia" },
  { country: "Togo", capital: "Lome", continent: "Africa" },
  { country: "Tonga", capital: "Nuku'alofa", continent: "Oceania" },
  { country: "Trinidad and Tobago", capital: "Port of Spain", continent: "N. America" },
  { country: "Tunisia", capital: "Tunis", continent: "Africa" },
  { country: "Turkey", capital: "Ankara", continent: "Asia" },
  { country: "Turkmenistan", capital: "Ashgabat", continent: "Asia" },
  { country: "Tuvalu", capital: "Funafuti", continent: "Oceania" },
  { country: "Uganda", capital: "Kampala", continent: "Africa" },
  { country: "Ukraine", capital: "Kyiv", continent: "Europe" },
  { country: "United Arab Emirates", capital: "Abu Dhabi", continent: "Asia" },
  { country: "United Kingdom", capital: "London", continent: "Europe" },
  { country: "United States", capital: "Washington, D.C.", continent: "N. America" },
  { country: "Uruguay", capital: "Montevideo", continent: "S. America" },
  { country: "Uzbekistan", capital: "Tashkent", continent: "Asia" },
  { country: "Vanuatu", capital: "Port Vila", continent: "Oceania" },
  { country: "Vatican City", capital: "Vatican City", continent: "Europe" },
  { country: "Venezuela", capital: "Caracas", continent: "S. America" },
  { country: "Vietnam", capital: "Hanoi", continent: "Asia" },
  { country: "Yemen", capital: "Sana'a", continent: "Asia" },
  { country: "Zambia", capital: "Lusaka", continent: "Africa" },
  { country: "Zimbabwe", capital: "Harare", continent: "Africa" },
];

const DIFFICULTY = {
  easy: { label: "Easy", questions: 10, timePerQ: 30, hintAllowed: true },
  medium: { label: "Medium", questions: 20, timePerQ: 20, hintAllowed: false },
  hard: { label: "Hard", questions: 30, timePerQ: 12, hintAllowed: false },
  expert: { label: "Expert", questions: 50, timePerQ: 8, hintAllowed: false },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getWrongOptions(correct, pool, count = 3) {
  const others = pool.filter((c) => c.capital !== correct.capital);
  return shuffle(others).slice(0, count);
}

function getStreakMessage(streak) {
  if (streak >= 10) return "Legendary Streak!";
  if (streak >= 7) return "On Fire!";
  if (streak >= 5) return "Great Run!";
  if (streak >= 3) return "Nice Streak!";
  return "";
}

export default function ToolHome() {
  const [difficulty, setDifficulty] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const startQuiz = (diff) => {
    setDifficulty(diff);
    const cfg = DIFFICULTY[diff];
    const selectedQs = shuffle(COUNTRIES).slice(0, cfg.questions);
    setQuiz(selectedQs);
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSelected(null);
    setAnswers([]);
    setHintUsed(false);
    setShowHint(false);
    setGameOver(false);
    setTimer(cfg.timePerQ);
  };

  const handleAnswer = useCallback((answer) => {
    clearInterval(timerRef.current);
    setSelected(answer);
    const current = quiz[currentIdx];
    const correct = answer !== null && answer === current.capital;
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

    setAnswers((a) => [...a, { country: current.country, correctAnswer: current.capital, userAnswer: answer, isCorrect: correct, continent: current.continent }]);

    setTimeout(() => {
      if (currentIdx + 1 >= quiz.length) {
        setGameOver(true);
      } else {
        setCurrentIdx((i) => i + 1);
        setSelected(null);
        setHintUsed(false);
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
  const options = current ? shuffle([current, ...getWrongOptions(current, COUNTRIES, 3)]) : [];
  const timePct = quiz ? (timer / DIFFICULTY[difficulty].timePerQ) * 100 : 100;
  const timeColor = timer <= 5 ? "text-red-600 bg-red-50" : timer <= 10 ? "text-amber-600 bg-amber-50" : "text-[var(--foreground)] bg-[var(--background)]";

  const reset = () => { setQuiz(null); setDifficulty(null); setGameOver(false); setAnswers([]); };

  const buildReportText = () => {
    if (!gameOver) return "";
    const pct = quiz.length > 0 ? ((score / quiz.length) * 100).toFixed(1) : 0;
    let grade = "F";
    if (pct >= 95) grade = "A+"; else if (pct >= 90) grade = "A"; else if (pct >= 80) grade = "B";
    else if (pct >= 70) grade = "C"; else if (pct >= 60) grade = "D";

    return `
CAPITAL CITY QUIZ REPORT
Difficulty: ${DIFFICULTY[difficulty].label}
Generated: ${new Date().toLocaleString()}
---------------------------------
RESULTS:
- Score: ${score}/${quiz.length} (${pct}%)
- Grade: ${grade}
- Best Streak: ${bestStreak}
- Time per Question: ${DIFFICULTY[difficulty].timePerQ}s

BREAKDOWN:
${answers.map((a, i) => `${i + 1}. ${a.country} — ${a.isCorrect ? "CORRECT" : `WRONG (Answer: ${a.correctAnswer})`}`).join("\n")}

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
    link.download = `Capital_Quiz_${DIFFICULTY[difficulty].label}.txt`;
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
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase text-sky-700">
            <Landmark className="h-4 w-4" />
            Geography knowledge quiz
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Capital City Quiz</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Test your knowledge of world capital cities with timed questions, streak bonuses, and difficulty levels from 195+ countries.
          </p>
        </section>

        {!quiz ? (
          /* Difficulty Selection */
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">Select Difficulty</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Object.entries(DIFFICULTY).map(([key, cfg]) => (
                <button key={key} onClick={() => startQuiz(key)} className="group rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 text-center transition-all hover:border-sky-500 hover:shadow-[var(--anslation-ds-shadow-md)] active:scale-[0.97]">
                  <p className="text-2xl font-bold text-[var(--foreground)] group-hover:text-sky-600">{cfg.questions}</p>
                  <p className="text-sm font-semibold text-[var(--muted)] mt-1">{cfg.label}</p>
                  <p className="text-xs text-[var(--muted)] mt-2">{cfg.timePerQ}s / question</p>
                  {cfg.hintAllowed && <p className="text-xs text-sky-600 mt-1 font-semibold">Hints enabled</p>}
                </button>
              ))}
            </div>
          </section>
        ) : gameOver ? (
          /* Results */
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] space-y-6 animate-in fade-in duration-500">
            <div className="text-center">
              <Trophy className="h-16 w-16 text-amber-500 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Quiz Complete!</h2>
              <p className="text-lg text-[var(--muted)] mt-2">
                {score}/{quiz.length} correct — {((score / quiz.length) * 100).toFixed(0)}%
              </p>
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
                <p className="text-3xl font-black text-amber-500 mt-1">{bestStreak}</p>
              </div>
            </div>

            {/* Answer Review */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Answer Review</h3>
              <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
                {answers.map((a, i) => (
                  <div key={i} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${a.isCorrect ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                    <span className="font-semibold text-[var(--foreground)]">{a.country}</span>
                    <span className={a.isCorrect ? "text-emerald-700 font-bold" : "text-red-700"}>
                      {a.isCorrect ? "Correct" : `Answer: ${a.correctAnswer}`}
                    </span>
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
          /* Quiz Game */
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6 space-y-6">
            {/* Progress bar */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-[var(--foreground)]">{currentIdx + 1}/{quiz.length}</span>
              <div className="flex-1 h-3 overflow-hidden rounded-full bg-[var(--muted)]/40">
                <div className="h-full rounded-full bg-[var(--primary)] transition-all duration-300" style={{ width: `${((currentIdx + 1) / quiz.length) * 100}%` }} />
              </div>
              <div className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-bold ${timeColor}`}>
                <Timer className="h-4 w-4" /> {timer}s
              </div>
            </div>

            {/* Score + Streak */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--foreground)]">
                <Target className="h-4 w-4 text-[var(--primary)]" /> Score: {score}
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-sm font-bold text-amber-700">
                  <Zap className="h-4 w-4" /> {streak} streak {getStreakMessage(streak)}
                </div>
              )}
            </div>

            {/* Question */}
            <div className="rounded-lg bg-[var(--background)] p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">What is the capital of?</p>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">{current.country}</h2>
              {showHint && (
                <p className="mt-3 text-sm text-sky-700 font-semibold">Hint: Starts with &ldquo;{current.capital[0]}&rdquo; — {current.capital.length} letters</p>
              )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {options.map((opt) => {
                const isCorrect = opt.capital === current.capital;
                const isSelected = selected === opt.capital;
                let optStyle = "border-[var(--border)] bg-[var(--background)] hover:border-sky-500 hover:shadow-[var(--anslation-ds-shadow-sm)]";
                if (selected !== null) {
                  if (isCorrect) optStyle = "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/30";
                  else if (isSelected && !isCorrect) optStyle = "border-red-500 bg-red-50 ring-2 ring-red-500/30";
                  else optStyle = "border-[var(--border)] bg-[var(--background)] opacity-50";
                }
                return (
                  <button key={opt.capital} disabled={selected !== null} onClick={() => handleAnswer(opt.capital)} className={`rounded-lg border px-4 py-4 text-left text-base font-semibold transition-all active:scale-[0.98] ${optStyle}`}>
                    <span className="text-[var(--foreground)]">{opt.capital}</span>
                  </button>
                );
              })}
            </div>

            {/* Hint */}
            {DIFFICULTY[difficulty].hintAllowed && !showHint && selected === null && (
              <button onClick={() => { setShowHint(true); setHintUsed(true); }} className="w-full rounded-lg border border-dashed border-sky-300 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 transition-all hover:bg-sky-100">
                Use Hint (starts with first letter)
              </button>
            )}

            <button onClick={reset} className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold transition-all hover:bg-[var(--muted)]">Quit Quiz</button>
          </section>
        )}

        {/* Educational */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">About Capital Cities</h3>
          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Why Capitals Matter</p>
              <p>Capital cities are political, economic, and cultural centers. They house government institutions, embassies, and often serve as a country&apos;s largest economic hub. Some capitals like Canberra and Naypyidaw were purpose-built to serve as administrative centers.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Interesting Facts</p>
              <p>Some countries have multiple capitals (e.g., South Africa has 3). Vatican City is the smallest capital at 0.44 km². Ngerulmud (Palau) is the least populated capital with ~400 residents. Santiago, Chile is the highest capital above sea level at 520m.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
