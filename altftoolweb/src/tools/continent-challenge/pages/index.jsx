"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Globe, RotateCcw, Info, Copy, Download, CheckCircle2, Trophy, Timer, Zap, Target, Map } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const CONTINENTS = {
  "Africa": {
    color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: "🌍",
    countries: [
      { country: "Algeria", capital: "Algiers", flag: "🇩🇿" },
      { country: "Angola", capital: "Luanda", flag: "🇦🇴" },
      { country: "Benin", capital: "Porto-Novo", flag: "🇧🇯" },
      { country: "Botswana", capital: "Gaborone", flag: "🇧🇼" },
      { country: "Burkina Faso", capital: "Ouagadougou", flag: "🇧🇫" },
      { country: "Burundi", capital: "Gitega", flag: "🇧🇮" },
      { country: "Cameroon", capital: "Yaounde", flag: "🇨🇲" },
      { country: "Cape Verde", capital: "Praia", flag: "🇨🇻" },
      { country: "Central African Republic", capital: "Bangui", flag: "🇨🇫" },
      { country: "Chad", capital: "N'Djamena", flag: "🇹🇩" },
      { country: "Comoros", capital: "Moroni", flag: "🇰🇲" },
      { country: "Congo (DRC)", capital: "Kinshasa", flag: "🇨🇩" },
      { country: "Congo (Republic)", capital: "Brazzaville", flag: "🇨🇬" },
      { country: "Djibouti", capital: "Djibouti", flag: "🇩🇯" },
      { country: "Egypt", capital: "Cairo", flag: "🇪🇬" },
      { country: "Equatorial Guinea", capital: "Malabo", flag: "🇬🇶" },
      { country: "Eritrea", capital: "Asmara", flag: "🇪🇷" },
      { country: "Eswatini", capital: "Mbabane", flag: "🇸🇿" },
      { country: "Ethiopia", capital: "Addis Ababa", flag: "🇪🇹" },
      { country: "Gabon", capital: "Libreville", flag: "🇬🇦" },
      { country: "Gambia", capital: "Banjul", flag: "🇬🇲" },
      { country: "Ghana", capital: "Accra", flag: "🇬🇭" },
      { country: "Guinea", capital: "Conakry", flag: "🇬🇳" },
      { country: "Guinea-Bissau", capital: "Bissau", flag: "🇬🇼" },
      { country: "Ivory Coast", capital: "Yamoussoukro", flag: "🇨🇮" },
      { country: "Kenya", capital: "Nairobi", flag: "🇰🇪" },
      { country: "Lesotho", capital: "Maseru", flag: "🇱🇸" },
      { country: "Liberia", capital: "Monrovia", flag: "🇱🇷" },
      { country: "Libya", capital: "Tripoli", flag: "🇱🇾" },
      { country: "Madagascar", capital: "Antananarivo", flag: "🇲🇬" },
      { country: "Malawi", capital: "Lilongwe", flag: "🇲🇼" },
      { country: "Mali", capital: "Bamako", flag: "🇲🇱" },
      { country: "Mauritania", capital: "Nouakchott", flag: "🇲🇷" },
      { country: "Mauritius", capital: "Port Louis", flag: "🇲🇺" },
      { country: "Morocco", capital: "Rabat", flag: "🇲🇦" },
      { country: "Mozambique", capital: "Maputo", flag: "🇲🇿" },
      { country: "Namibia", capital: "Windhoek", flag: "🇳🇦" },
      { country: "Niger", capital: "Niamey", flag: "🇳🇪" },
      { country: "Nigeria", capital: "Abuja", flag: "🇳🇬" },
      { country: "Rwanda", capital: "Kigali", flag: "🇷🇼" },
      { country: "Sao Tome and Principe", capital: "Sao Tome", flag: "🇸🇹" },
      { country: "Senegal", capital: "Dakar", flag: "🇸🇳" },
      { country: "Seychelles", capital: "Victoria", flag: "🇸🇨" },
      { country: "Sierra Leone", capital: "Freetown", flag: "🇸🇱" },
      { country: "Somalia", capital: "Mogadishu", flag: "🇸🇴" },
      { country: "South Africa", capital: "Pretoria", flag: "🇿🇦" },
      { country: "South Sudan", capital: "Juba", flag: "🇸🇸" },
      { country: "Sudan", capital: "Khartoum", flag: "🇸🇩" },
      { country: "Tanzania", capital: "Dodoma", flag: "🇹🇿" },
      { country: "Togo", capital: "Lome", flag: "🇹🇬" },
      { country: "Tunisia", capital: "Tunis", flag: "🇹🇳" },
      { country: "Uganda", capital: "Kampala", flag: "🇺🇬" },
      { country: "Zambia", capital: "Lusaka", flag: "🇿🇲" },
      { country: "Zimbabwe", capital: "Harare", flag: "🇿🇼" },
    ],
  },
  "Asia": {
    color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: "🌏",
    countries: [
      { country: "Afghanistan", capital: "Kabul", flag: "🇦🇫" },
      { country: "Armenia", capital: "Yerevan", flag: "🇦🇲" },
      { country: "Azerbaijan", capital: "Baku", flag: "🇦🇿" },
      { country: "Bahrain", capital: "Manama", flag: "🇧🇭" },
      { country: "Bangladesh", capital: "Dhaka", flag: "🇧🇩" },
      { country: "Bhutan", capital: "Thimphu", flag: "🇧🇹" },
      { country: "Brunei", capital: "Bandar Seri Begawan", flag: "🇧🇳" },
      { country: "Cambodia", capital: "Phnom Penh", flag: "🇰🇭" },
      { country: "China", capital: "Beijing", flag: "🇨🇳" },
      { country: "Cyprus", capital: "Nicosia", flag: "🇨🇾" },
      { country: "Georgia", capital: "Tbilisi", flag: "🇬🇪" },
      { country: "India", capital: "New Delhi", flag: "🇮🇳" },
      { country: "Indonesia", capital: "Jakarta", flag: "🇮🇩" },
      { country: "Iran", capital: "Tehran", flag: "🇮🇷" },
      { country: "Iraq", capital: "Baghdad", flag: "🇮🇶" },
      { country: "Israel", capital: "Jerusalem", flag: "🇮🇱" },
      { country: "Japan", capital: "Tokyo", flag: "🇯🇵" },
      { country: "Jordan", capital: "Amman", flag: "🇯🇴" },
      { country: "Kazakhstan", capital: "Astana", flag: "🇰🇿" },
      { country: "Kuwait", capital: "Kuwait City", flag: "🇰🇼" },
      { country: "Kyrgyzstan", capital: "Bishkek", flag: "🇰🇬" },
      { country: "Laos", capital: "Vientiane", flag: "🇱🇦" },
      { country: "Lebanon", capital: "Beirut", flag: "🇱🇧" },
      { country: "Malaysia", capital: "Kuala Lumpur", flag: "🇲🇾" },
      { country: "Maldives", capital: "Male", flag: "🇲🇻" },
      { country: "Mongolia", capital: "Ulaanbaatar", flag: "🇲🇳" },
      { country: "Myanmar", capital: "Naypyidaw", flag: "🇲🇲" },
      { country: "Nepal", capital: "Kathmandu", flag: "🇳🇵" },
      { country: "North Korea", capital: "Pyongyang", flag: "🇰🇵" },
      { country: "Oman", capital: "Muscat", flag: "🇴🇲" },
      { country: "Pakistan", capital: "Islamabad", flag: "🇵🇰" },
      { country: "Palestine", capital: "Ramallah", flag: "🇵🇸" },
      { country: "Philippines", capital: "Manila", flag: "🇵🇭" },
      { country: "Qatar", capital: "Doha", flag: "🇶🇦" },
      { country: "Saudi Arabia", capital: "Riyadh", flag: "🇸🇦" },
      { country: "Singapore", capital: "Singapore", flag: "🇸🇬" },
      { country: "South Korea", capital: "Seoul", flag: "🇰🇷" },
      { country: "Sri Lanka", capital: "Sri Jayawardenepura Kotte", flag: "🇱🇰" },
      { country: "Syria", capital: "Damascus", flag: "🇸🇾" },
      { country: "Taiwan", capital: "Taipei", flag: "🇹🇼" },
      { country: "Tajikistan", capital: "Dushanbe", flag: "🇹🇯" },
      { country: "Thailand", capital: "Bangkok", flag: "🇹🇭" },
      { country: "Timor-Leste", capital: "Dili", flag: "🇹🇱" },
      { country: "Turkey", capital: "Ankara", flag: "🇹🇷" },
      { country: "Turkmenistan", capital: "Ashgabat", flag: "🇹🇲" },
      { country: "UAE", capital: "Abu Dhabi", flag: "🇦🇪" },
      { country: "Uzbekistan", capital: "Tashkent", flag: "🇺🇿" },
      { country: "Vietnam", capital: "Hanoi", flag: "🇻🇳" },
      { country: "Yemen", capital: "Sana'a", flag: "🇾🇪" },
    ],
  },
  "Europe": {
    color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: "🌍",
    countries: [
      { country: "Albania", capital: "Tirana", flag: "🇦🇱" },
      { country: "Andorra", capital: "Andorra la Vella", flag: "🇦🇩" },
      { country: "Austria", capital: "Vienna", flag: "🇦🇹" },
      { country: "Belarus", capital: "Minsk", flag: "🇧🇾" },
      { country: "Belgium", capital: "Brussels", flag: "🇧🇪" },
      { country: "Bosnia and Herzegovina", capital: "Sarajevo", flag: "🇧🇦" },
      { country: "Bulgaria", capital: "Sofia", flag: "🇧🇬" },
      { country: "Croatia", capital: "Zagreb", flag: "🇭🇷" },
      { country: "Czech Republic", capital: "Prague", flag: "🇨🇿" },
      { country: "Denmark", capital: "Copenhagen", flag: "🇩🇰" },
      { country: "Estonia", capital: "Tallinn", flag: "🇪🇪" },
      { country: "Finland", capital: "Helsinki", flag: "🇫🇮" },
      { country: "France", capital: "Paris", flag: "🇫🇷" },
      { country: "Germany", capital: "Berlin", flag: "🇩🇪" },
      { country: "Greece", capital: "Athens", flag: "🇬🇷" },
      { country: "Hungary", capital: "Budapest", flag: "🇭🇺" },
      { country: "Iceland", capital: "Reykjavik", flag: "🇮🇸" },
      { country: "Ireland", capital: "Dublin", flag: "🇮🇪" },
      { country: "Italy", capital: "Rome", flag: "🇮🇹" },
      { country: "Kosovo", capital: "Pristina", flag: "🇽🇰" },
      { country: "Latvia", capital: "Riga", flag: "🇱🇻" },
      { country: "Liechtenstein", capital: "Vaduz", flag: "🇱🇮" },
      { country: "Lithuania", capital: "Vilnius", flag: "🇱🇹" },
      { country: "Luxembourg", capital: "Luxembourg", flag: "🇱🇺" },
      { country: "Malta", capital: "Valletta", flag: "🇲🇹" },
      { country: "Moldova", capital: "Chisinau", flag: "🇲🇩" },
      { country: "Monaco", capital: "Monaco", flag: "🇲🇨" },
      { country: "Montenegro", capital: "Podgorica", flag: "🇲🇪" },
      { country: "Netherlands", capital: "Amsterdam", flag: "🇳🇱" },
      { country: "North Macedonia", capital: "Skopje", flag: "🇲🇰" },
      { country: "Norway", capital: "Oslo", flag: "🇳🇴" },
      { country: "Poland", capital: "Warsaw", flag: "🇵🇱" },
      { country: "Portugal", capital: "Lisbon", flag: "🇵🇹" },
      { country: "Romania", capital: "Bucharest", flag: "🇷🇴" },
      { country: "Russia", capital: "Moscow", flag: "🇷🇺" },
      { country: "San Marino", capital: "San Marino", flag: "🇸🇲" },
      { country: "Serbia", capital: "Belgrade", flag: "🇷🇸" },
      { country: "Slovakia", capital: "Bratislava", flag: "🇸🇰" },
      { country: "Slovenia", capital: "Ljubljana", flag: "🇸🇮" },
      { country: "Spain", capital: "Madrid", flag: "🇪🇸" },
      { country: "Sweden", capital: "Stockholm", flag: "🇸🇪" },
      { country: "Switzerland", capital: "Bern", flag: "🇨🇭" },
      { country: "Ukraine", capital: "Kyiv", flag: "🇺🇦" },
      { country: "United Kingdom", capital: "London", flag: "🇬🇧" },
      { country: "Vatican City", capital: "Vatican City", flag: "🇻🇦" },
    ],
  },
  "North America": {
    color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: "🌎",
    countries: [
      { country: "Antigua and Barbuda", capital: "St. John's", flag: "🇦🇬" },
      { country: "Bahamas", capital: "Nassau", flag: "🇧🇸" },
      { country: "Barbados", capital: "Bridgetown", flag: "🇧🇧" },
      { country: "Belize", capital: "Belmopan", flag: "🇧🇿" },
      { country: "Canada", capital: "Ottawa", flag: "🇨🇦" },
      { country: "Costa Rica", capital: "San Jose", flag: "🇨🇷" },
      { country: "Cuba", capital: "Havana", flag: "🇨🇺" },
      { country: "Dominica", capital: "Roseau", flag: "🇩🇲" },
      { country: "Dominican Republic", capital: "Santo Domingo", flag: "🇩🇴" },
      { country: "El Salvador", capital: "San Salvador", flag: "🇸🇻" },
      { country: "Grenada", capital: "St. George's", flag: "🇬🇩" },
      { country: "Guatemala", capital: "Guatemala City", flag: "🇬🇹" },
      { country: "Haiti", capital: "Port-au-Prince", flag: "🇭🇹" },
      { country: "Honduras", capital: "Tegucigalpa", flag: "🇭🇳" },
      { country: "Jamaica", capital: "Kingston", flag: "🇯🇲" },
      { country: "Mexico", capital: "Mexico City", flag: "🇲🇽" },
      { country: "Nicaragua", capital: "Managua", flag: "🇳🇮" },
      { country: "Panama", capital: "Panama City", flag: "🇵🇦" },
      { country: "Saint Kitts and Nevis", capital: "Basseterre", flag: "🇰🇳" },
      { country: "Saint Lucia", capital: "Castries", flag: "🇱🇨" },
      { country: "Saint Vincent and the Grenadines", capital: "Kingstown", flag: "🇻🇨" },
      { country: "Trinidad and Tobago", capital: "Port of Spain", flag: "🇹🇹" },
      { country: "United States", capital: "Washington, D.C.", flag: "🇺🇸" },
    ],
  },
  "South America": {
    color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", icon: "🌎",
    countries: [
      { country: "Argentina", capital: "Buenos Aires", flag: "🇦🇷" },
      { country: "Bolivia", capital: "Sucre", flag: "🇧🇴" },
      { country: "Brazil", capital: "Brasilia", flag: "🇧🇷" },
      { country: "Chile", capital: "Santiago", flag: "🇨🇱" },
      { country: "Colombia", capital: "Bogota", flag: "🇨🇴" },
      { country: "Ecuador", capital: "Quito", flag: "🇪🇨" },
      { country: "Guyana", capital: "Georgetown", flag: "🇬🇾" },
      { country: "Paraguay", capital: "Asuncion", flag: "🇵🇾" },
      { country: "Peru", capital: "Lima", flag: "🇵🇪" },
      { country: "Suriname", capital: "Paramaribo", flag: "🇸🇷" },
      { country: "Uruguay", capital: "Montevideo", flag: "🇺🇾" },
      { country: "Venezuela", capital: "Caracas", flag: "🇻🇪" },
    ],
  },
  "Oceania": {
    color: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-200", icon: "🌏",
    countries: [
      { country: "Australia", capital: "Canberra", flag: "🇦🇺" },
      { country: "Fiji", capital: "Suva", flag: "🇫🇯" },
      { country: "Kiribati", capital: "Tarawa", flag: "🇰🇮" },
      { country: "Marshall Islands", capital: "Majuro", flag: "🇲🇭" },
      { country: "Micronesia", capital: "Palikir", flag: "🇫🇲" },
      { country: "Nauru", capital: "Yaren", flag: "🇳🇷" },
      { country: "New Zealand", capital: "Wellington", flag: "🇳🇿" },
      { country: "Palau", capital: "Ngerulmud", flag: "🇵🇼" },
      { country: "Papua New Guinea", capital: "Port Moresby", flag: "🇵🇬" },
      { country: "Samoa", capital: "Apia", flag: "🇼🇸" },
      { country: "Solomon Islands", capital: "Honiara", flag: "🇸🇧" },
      { country: "Tonga", capital: "Nuku'alofa", flag: "🇹🇴" },
      { country: "Tuvalu", capital: "Funafuti", flag: "🇹🇻" },
      { country: "Vanuatu", capital: "Port Vila", flag: "🇻🇺" },
    ],
  },
};

const ALL_CONTINENTS = Object.keys(CONTINENTS);

const DIFFICULTY = {
  easy: { label: "Easy", questions: 10, timePerQ: 25 },
  medium: { label: "Medium", questions: 20, timePerQ: 18 },
  hard: { label: "Hard", questions: 30, timePerQ: 12 },
  expert: { label: "Expert", questions: 50, timePerQ: 8 },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getAllCountries() {
  return ALL_CONTINENTS.flatMap((cont) =>
    CONTINENTS[cont].countries.map((c) => ({ ...c, continent: cont, ...CONTINENTS[cont] }))
  );
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
  const wrongPool = pool.filter((c) => c.country !== target.country);
  const wrong = shuffle(wrongPool).slice(0, 3);
  const allOpts = shuffle([target, ...wrong]);

  if (type === "continent-to-country") {
    return { question: `${target.flag} ${target.country}`, answer: target.continent, options: shuffle(ALL_CONTINENTS).slice(0, 4).includes(target.continent) ? shuffle(ALL_CONTINENTS).slice(0, 4).map((c) => ({ label: `${CONTINENTS[c].icon} ${c}`, value: c })) : [...shuffle(ALL_CONTINENTS).filter((c) => c !== target.continent).slice(0, 3), target.continent].map((c) => ({ label: `${CONTINENTS[c].icon} ${c}`, value: c })) };
  }
  if (type === "country-to-capital") {
    return { question: `${target.flag} ${target.country}`, answer: target.capital, options: allOpts.map((o) => ({ label: o.capital, value: o.capital })) };
  }
  if (type === "capital-to-country") {
    const wrongCaps = shuffle(wrongPool).slice(0, 3);
    return { question: `Capital: ${target.capital}`, answer: target.country, options: shuffle([target, ...wrongCaps]).map((o) => ({ label: `${o.flag} ${o.country}`, value: o.country })) };
  }
  const wrongConts = shuffle(ALL_CONTINENTS.filter((c) => c !== target.continent)).slice(0, 3);
  return { question: `${target.flag} Which continent?`, answer: target.continent, options: shuffle([...wrongConts, target.continent]).map((c) => ({ label: `${CONTINENTS[c].icon} ${c}`, value: c })) };
}

export default function ToolHome() {
  const [difficulty, setDifficulty] = useState(null);
  const [selectedContinent, setSelectedContinent] = useState("all");
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
  const timerRef = useRef(null);

  const startQuiz = (diff, cont) => {
    setDifficulty(diff);
    setSelectedContinent(cont);
    const cfg = DIFFICULTY[diff];
    let pool = getAllCountries();
    if (cont !== "all") pool = pool.filter((c) => c.continent === cont);
    pool = shuffle(pool).slice(0, Math.max(cfg.questions, 20));
    const types = ["continent-to-country", "country-to-capital", "capital-to-country"];
    const questions = [];
    for (let i = 0; i < cfg.questions; i++) {
      questions.push(generateQuestion(types[i % types.length], pool));
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

  const reset = () => { setQuiz(null); setDifficulty(null); setGameOver(false); setAnswers([]); setSelectedContinent("all"); };

  const buildReportText = () => {
    if (!gameOver) return "";
    const pct = quiz.length > 0 ? ((score / quiz.length) * 100).toFixed(1) : 0;
    return `
CONTINENT CHALLENGE REPORT
Difficulty: ${DIFFICULTY[difficulty].label}
Continent Filter: ${selectedContinent === "all" ? "All Continents" : selectedContinent}
Generated: ${new Date().toLocaleString()}
---------------------------------
RESULTS:
- Score: ${score}/${quiz.length} (${pct}%)
- Best Streak: ${bestStreak}
- Time per Question: ${DIFFICULTY[difficulty].timePerQ}s

BREAKDOWN:
${answers.map((a, i) => `${i + 1}. ${a.question} — ${a.isCorrect ? "CORRECT" : `WRONG (Answer: ${a.correctAnswer})`}`).join("\n")}

---------------------------------
Continent Challenge — Educational tool
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
    link.download = `Continent_Challenge_${DIFFICULTY[difficulty].label}.txt`;
    link.click();
  };

  const continentStats = ALL_CONTINENTS.map((c) => ({
    name: c,
    count: CONTINENTS[c].countries.length,
    ...CONTINENTS[c],
  }));

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>This quiz covers 195+ countries across all 6 inhabited continents with capitals, flags, and multiple question types.</p>
          </div>
        </div>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase text-violet-700">
            <Globe className="h-4 w-4" />
            Geography continent quiz
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Continent Challenge</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Identify countries, capitals, and continents with mixed question types — flag-to-country, capital-to-country, and continent-to-country.
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {continentStats.map((c) => (
            <div key={c.name} className={`rounded-lg border p-3 text-center ${c.border} ${c.bg}`}>
              <span className="text-2xl">{c.icon}</span>
              <p className={`text-xs font-bold uppercase mt-1 ${c.color}`}>{c.name}</p>
              <p className="text-lg font-black text-[var(--foreground)]">{c.count}</p>
              <p className="text-[10px] text-[var(--muted)]">countries</p>
            </div>
          ))}
        </section>

        {!quiz ? (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">Select Difficulty & Continent</h2>
            <div className="mb-4 flex flex-wrap gap-2">
              <button onClick={() => setSelectedContinent("all")} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${selectedContinent === "all" ? "bg-violet-600 text-white" : "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)]"}`}>All Continents</button>
              {ALL_CONTINENTS.map((c) => (
                <button key={c} onClick={() => setSelectedContinent(c)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${selectedContinent === c ? "bg-violet-600 text-white" : "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted])"}`}>
                  {CONTINENTS[c].icon} {c}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Object.entries(DIFFICULTY).map(([key, cfg]) => (
                <button key={key} onClick={() => startQuiz(key, selectedContinent)} className="group rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 text-center transition-all hover:border-violet-500 hover:shadow-[var(--anslation-ds-shadow-md)] active:scale-[0.97]">
                  <p className="text-2xl font-bold text-[var(--foreground)] group-hover:text-violet-600">{cfg.questions}</p>
                  <p className="text-sm font-semibold text-[var(--muted)] mt-1">{cfg.label}</p>
                  <p className="text-xs text-[var(--muted)] mt-2">{cfg.timePerQ}s / question</p>
                </button>
              ))}
            </div>
          </section>
        ) : gameOver ? (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] space-y-6 animate-in fade-in duration-500">
            <div className="text-center">
              <Trophy className="h-16 w-16 text-violet-500 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Challenge Complete!</h2>
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
                <p className="text-3xl font-black text-violet-500 mt-1">{bestStreak}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Answer Review</h3>
              <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
                {answers.map((a, i) => (
                  <div key={i} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${a.isCorrect ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                    <span className="font-semibold text-[var(--foreground)]">{a.question}</span>
                    <span className={a.isCorrect ? "text-emerald-700 font-bold" : "text-red-700"}>
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
                <div className="h-full rounded-full bg-violet-500 transition-all duration-300" style={{ width: `${((currentIdx + 1) / quiz.length) * 100}%` }} />
              </div>
              <div className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-bold ${timeColor}`}>
                <Timer className="h-4 w-4" /> {timer}s
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--foreground)]">
                <Target className="h-4 w-4 text-violet-600" /> Score: {score}
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-200 px-3 py-1 text-sm font-bold text-violet-700">
                  <Zap className="h-4 w-4" /> {streak} streak {getStreakMsg(streak)}
                </div>
              )}
            </div>

            <div className="rounded-lg bg-[var(--background)] p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">Identify the answer</p>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">{current.question}</h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {current.options.map((opt) => {
                const isCorrect = opt.value === current.answer;
                const isSelected = selected === opt.value;
                let optStyle = "border-[var(--border)] bg-[var(--background)] hover:border-violet-500 hover:shadow-[var(--anslation-ds-shadow-sm)]";
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

            <button onClick={reset} className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition-all hover:bg-[var(--muted)]">Quit Challenge</button>
          </section>
        )}

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">About the Continents</h3>
          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">The Seven Continents</p>
              <p>Asia is the largest continent (44.58M km²) and most populous (4.7B people). Africa is the second largest and second most populous. Antarctica is the coldest and least populated. Europe is the second smallest by area but has 50+ countries. Oceania includes Australia and thousands of Pacific islands.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Geographic Superlatives</p>
              <p>Mount Everest (Asia) is the highest point at 8,849m. The Mariana Trench (Pacific) is the deepest at 10,935m. The Nile (Africa) is the longest river at 6,650km. Russia spans 11 time zones across Europe and Asia — more than any other country.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
