"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Coins, RotateCcw, Info, Copy, Download, CheckCircle2, Trophy, Timer, Zap, Target, Banknote } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const CURRENCIES = [
  { country: "United States", currency: "US Dollar", code: "USD", symbol: "$", flag: "🇺🇸", rate: 1.0 },
  { country: "Eurozone (EU)", currency: "Euro", code: "EUR", symbol: "€", flag: "🇪🇺", rate: 0.92 },
  { country: "United Kingdom", currency: "Pound Sterling", code: "GBP", symbol: "£", flag: "🇬🇧", rate: 0.79 },
  { country: "Japan", currency: "Japanese Yen", code: "JPY", symbol: "¥", flag: "🇯🇵", rate: 149.5 },
  { country: "India", currency: "Indian Rupee", code: "INR", symbol: "₹", flag: "🇮🇳", rate: 83.2 },
  { country: "Canada", currency: "Canadian Dollar", code: "CAD", symbol: "C$", flag: "🇨🇦", rate: 1.36 },
  { country: "Australia", currency: "Australian Dollar", code: "AUD", symbol: "A$", flag: "🇦🇺", rate: 1.53 },
  { country: "Switzerland", currency: "Swiss Franc", code: "CHF", symbol: "Fr", flag: "🇨🇭", rate: 0.88 },
  { country: "China", currency: "Chinese Yuan", code: "CNY", symbol: "¥", flag: "🇨🇳", rate: 7.24 },
  { country: "Mexico", currency: "Mexican Peso", code: "MXN", symbol: "$", flag: "🇲🇽", rate: 17.15 },
  { country: "Brazil", currency: "Brazilian Real", code: "BRL", symbol: "R$", flag: "🇧🇷", rate: 4.97 },
  { country: "South Korea", currency: "South Korean Won", code: "KRW", symbol: "₩", flag: "🇰🇷", rate: 1328.5 },
  { country: "Singapore", currency: "Singapore Dollar", code: "SGD", symbol: "S$", flag: "🇸🇬", rate: 1.34 },
  { country: "Hong Kong", currency: "Hong Kong Dollar", code: "HKD", symbol: "HK$", flag: "🇭🇰", rate: 7.82 },
  { country: "Norway", currency: "Norwegian Krone", code: "NOK", symbol: "kr", flag: "🇳🇴", rate: 10.52 },
  { country: "Sweden", currency: "Swedish Krona", code: "SEK", symbol: "kr", flag: "🇸🇪", rate: 10.43 },
  { country: "Denmark", currency: "Danish Krone", code: "DKK", symbol: "kr", flag: "🇩🇰", rate: 6.87 },
  { country: "New Zealand", currency: "New Zealand Dollar", code: "NZD", symbol: "NZ$", flag: "🇳🇿", rate: 1.64 },
  { country: "South Africa", currency: "South African Rand", code: "ZAR", symbol: "R", flag: "🇿🇦", rate: 18.65 },
  { country: "Russia", currency: "Russian Ruble", code: "RUB", symbol: "₽", flag: "🇷🇺", rate: 91.5 },
  { country: "Turkey", currency: "Turkish Lira", code: "TRY", symbol: "₺", flag: "🇹🇷", rate: 28.9 },
  { country: "Saudi Arabia", currency: "Saudi Riyal", code: "SAR", symbol: "﷼", flag: "🇸🇦", rate: 3.75 },
  { country: "UAE", currency: "UAE Dirham", code: "AED", symbol: "د.إ", flag: "🇦🇪", rate: 3.67 },
  { country: "Thailand", currency: "Thai Baht", code: "THB", symbol: "฿", flag: "🇹🇭", rate: 35.2 },
  { country: "Indonesia", currency: "Indonesian Rupiah", code: "IDR", symbol: "Rp", flag: "🇮🇩", rate: 15650 },
  { country: "Malaysia", currency: "Malaysian Ringgit", code: "MYR", symbol: "RM", flag: "🇲🇾", rate: 4.72 },
  { country: "Philippines", currency: "Philippine Peso", code: "PHP", symbol: "₱", flag: "🇵🇭", rate: 56.2 },
  { country: "Israel", currency: "Israeli Shekel", code: "ILS", symbol: "₪", flag: "🇮🇱", rate: 3.72 },
  { country: "Egypt", currency: "Egyptian Pound", code: "EGP", symbol: "E£", flag: "🇪🇬", rate: 30.9 },
  { country: "Nigeria", currency: "Nigerian Naira", code: "NGN", symbol: "₦", flag: "🇳🇬", rate: 1550 },
  { country: "Kenya", currency: "Kenyan Shilling", code: "KES", symbol: "KSh", flag: "🇰🇪", rate: 153.5 },
  { country: "Pakistan", currency: "Pakistani Rupee", code: "PKR", symbol: "Rs", flag: "🇵🇰", rate: 285.5 },
  { country: "Bangladesh", currency: "Bangladeshi Taka", code: "BDT", symbol: "৳", flag: "🇧🇩", rate: 110.5 },
  { country: "Vietnam", currency: "Vietnamese Dong", code: "VND", symbol: "₫", flag: "🇻🇳", rate: 24450 },
  { country: "Colombia", currency: "Colombian Peso", code: "COP", symbol: "$", flag: "🇨🇴", rate: 3965 },
  { country: "Argentina", currency: "Argentine Peso", code: "ARS", symbol: "$", flag: "🇦🇷", rate: 350 },
  { country: "Chile", currency: "Chilean Peso", code: "CLP", symbol: "$", flag: "🇨🇱", rate: 880 },
  { country: "Peru", currency: "Peruvian Sol", code: "PEN", symbol: "S/", flag: "🇵🇪", rate: 3.72 },
  { country: "Poland", currency: "Polish Zloty", code: "PLN", symbol: "zł", flag: "🇵🇱", rate: 4.05 },
  { country: "Czech Republic", currency: "Czech Koruna", code: "CZK", symbol: "Kč", flag: "🇨🇿", rate: 22.5 },
  { country: "Hungary", currency: "Hungarian Forint", code: "HUF", symbol: "Ft", flag: "🇭🇺", rate: 355 },
  { country: "Romania", currency: "Romanian Leu", code: "RON", symbol: "lei", flag: "🇷🇴", rate: 4.57 },
  { country: "Iceland", currency: "Icelandic Krona", code: "ISK", symbol: "kr", flag: "🇮🇸", rate: 137.5 },
  { country: "Croatia", currency: "Euro", code: "EUR", symbol: "€", flag: "🇭🇷", rate: 0.92 },
  { country: "Greece", currency: "Euro", code: "EUR", symbol: "€", flag: "🇬🇷", rate: 0.92 },
  { country: "Italy", currency: "Euro", code: "EUR", symbol: "€", flag: "🇮🇹", rate: 0.92 },
  { country: "Spain", currency: "Euro", code: "EUR", symbol: "€", flag: "🇪🇸", rate: 0.92 },
  { country: "Germany", currency: "Euro", code: "EUR", symbol: "€", flag: "🇩🇪", rate: 0.92 },
  { country: "France", currency: "Euro", code: "EUR", symbol: "€", flag: "🇫🇷", rate: 0.92 },
  { country: "Netherlands", currency: "Euro", code: "EUR", symbol: "€", flag: "🇳🇱", rate: 0.92 },
  { country: "Portugal", currency: "Euro", code: "EUR", symbol: "€", flag: "🇵🇹", rate: 0.92 },
  { country: "Ireland", currency: "Euro", code: "EUR", symbol: "€", flag: "🇮🇪", rate: 0.92 },
  { country: "Austria", currency: "Euro", code: "EUR", symbol: "€", flag: "🇦🇹", rate: 0.92 },
  { country: "Belgium", currency: "Euro", code: "EUR", symbol: "€", flag: "🇧🇪", rate: 0.92 },
  { country: "Finland", currency: "Euro", code: "EUR", symbol: "€", flag: "🇫🇮", rate: 0.92 },
  { country: "Luxembourg", currency: "Euro", code: "EUR", symbol: "€", flag: "🇱🇺", rate: 0.92 },
  { country: "Slovenia", currency: "Euro", code: "EUR", symbol: "€", flag: "🇸🇮", rate: 0.92 },
  { country: "Slovakia", currency: "Euro", code: "EUR", symbol: "€", flag: "🇸🇰", rate: 0.92 },
  { country: "Estonia", currency: "Euro", code: "EUR", symbol: "€", flag: "🇪🇪", rate: 0.92 },
  { country: "Latvia", currency: "Euro", code: "EUR", symbol: "€", flag: "🇱🇻", rate: 0.92 },
  { country: "Lithuania", currency: "Euro", code: "EUR", symbol: "€", flag: "🇱🇹", rate: 0.92 },
  { country: "Malta", currency: "Euro", code: "EUR", symbol: "€", flag: "🇲🇹", rate: 0.92 },
  { country: "Cyprus", currency: "Euro", code: "EUR", symbol: "€", flag: "🇨🇾", rate: 0.92 },
  { country: "Ireland", currency: "Euro", code: "EUR", symbol: "€", flag: "🇮🇪", rate: 0.92 },
  { country: "Cuba", currency: "Cuban Peso", code: "CUP", symbol: "₱", flag: "🇨🇺", rate: 24 },
  { country: "Jamaica", currency: "Jamaican Dollar", code: "JMD", symbol: "J$", flag: "🇯🇲", rate: 156 },
  { country: "Costa Rica", currency: "Costa Rican Colon", code: "CRC", symbol: "₡", flag: "🇨🇷", rate: 510 },
  { country: "Morocco", currency: "Moroccan Dirham", code: "MAD", symbol: "MAD", flag: "🇲🇦", rate: 9.9 },
  { country: "Tunisia", currency: "Tunisian Dinar", code: "TND", symbol: "د.ت", flag: "🇹🇳", rate: 3.1 },
  { country: "Algeria", currency: "Algerian Dinar", code: "DZD", symbol: "د.ج", flag: "🇩🇿", rate: 135.5 },
  { country: "Ghana", currency: "Ghanaian Cedi", code: "GHS", symbol: "GH₵", flag: "🇬🇭", rate: 12.1 },
  { country: "Ethiopia", currency: "Ethiopian Birr", code: "ETB", symbol: "Br", flag: "🇪🇹", rate: 55.5 },
  { country: "Tanzania", currency: "Tanzanian Shilling", code: "TZS", symbol: "TSh", flag: "🇹🇿", rate: 2510 },
  { country: "Uganda", currency: "Ugandan Shilling", code: "UGX", symbol: "USh", flag: "🇺🇬", rate: 3780 },
  { country: "Cambodia", currency: "Cambodian Riel", code: "KHR", symbol: "៛", flag: "🇰🇭", rate: 4100 },
  { country: "Myanmar", currency: "Myanmar Kyat", code: "MMK", symbol: "K", flag: "🇲🇲", rate: 2100 },
  { country: "Nepal", currency: "Nepalese Rupee", code: "NPR", symbol: "Rs", flag: "🇳🇵", rate: 133.5 },
  { country: "Sri Lanka", currency: "Sri Lankan Rupee", code: "LKR", symbol: "Rs", flag: "🇱🇰", rate: 312 },
  { country: "Ukraine", currency: "Ukrainian Hryvnia", code: "UAH", symbol: "₴", flag: "🇺🇦", rate: 37.5 },
  { country: "Georgia", currency: "Georgian Lari", code: "GEL", symbol: "₾", flag: "🇬🇪", rate: 2.65 },
  { country: "Azerbaijan", currency: "Azerbaijani Manat", code: "AZN", symbol: "₼", flag: "🇦🇿", rate: 1.7 },
  { country: "Kazakhstan", currency: "Kazakhstani Tenge", code: "KZT", symbol: "₸", flag: "🇰🇿", rate: 460 },
  { country: "Uzbekistan", currency: "Uzbekistani Som", code: "UZS", symbol: "so'm", flag: "🇺🇿", rate: 12250 },
  { country: "Mongolia", currency: "Mongolian Tugrik", code: "MNT", symbol: "₮", flag: "🇲🇳", rate: 3430 },
  { country: "Laos", currency: "Lao Kip", code: "LAK", symbol: "₭", flag: "🇱🇦", rate: 20500 },
  { country: "Trinidad and Tobago", currency: "Trinidad Dollar", code: "TTD", symbol: "TT$", flag: "🇹🇹", rate: 6.78 },
  { country: "Dominican Republic", currency: "Dominican Peso", code: "DOP", symbol: "RD$", flag: "🇩🇴", rate: 56.2 },
  { country: "Guatemala", currency: "Guatemalan Quetzal", code: "GTQ", symbol: "Q", flag: "🇬🇹", rate: 7.8 },
  { country: "Honduras", currency: "Honduran Lempira", code: "HNL", symbol: "L", flag: "🇭🇳", rate: 24.7 },
  { country: "Nicaragua", currency: "Nicaraguan Cordoba", code: "NIO", symbol: "C$", flag: "🇳🇮", rate: 36.6 },
  { country: "Paraguay", currency: "Paraguayan Guarani", code: "PYG", symbol: "₲", flag: "🇵🇾", rate: 7250 },
  { country: "Uruguay", currency: "Uruguayan Peso", code: "UYU", symbol: "$U", flag: "🇺🇾", rate: 38.5 },
  { country: "Bolivia", currency: "Bolivian Boliviano", code: "BOB", symbol: "Bs", flag: "🇧🇴", rate: 6.9 },
  { country: "Qatar", currency: "Qatari Riyal", code: "QAR", symbol: "﷼", flag: "🇶🇦", rate: 3.64 },
  { country: "Kuwait", currency: "Kuwaiti Dinar", code: "KWD", symbol: "د.ك", flag: "🇰🇼", rate: 0.31 },
  { country: "Bahrain", currency: "Bahraini Dinar", code: "BHD", symbol: ".د.ب", flag: "🇧🇭", rate: 0.38 },
  { country: "Oman", currency: "Omani Rial", code: "OMR", symbol: "﷼", flag: "🇴🇲", rate: 0.39 },
  { country: "Jordan", currency: "Jordanian Dinar", code: "JOD", symbol: "JD", flag: "🇯🇴", rate: 0.71 },
  { country: "Lebanon", currency: "Lebanese Pound", code: "LBP", symbol: "L£", flag: "🇱🇧", rate: 89500 },
  { country: "Iran", currency: "Iranian Rial", code: "IRR", symbol: "﷼", flag: "🇮🇷", rate: 42000 },
  { country: "Iraq", currency: "Iraqi Dinar", code: "IQD", symbol: "ع.د", flag: "🇮🇶", rate: 1310 },
  { country: "Syria", currency: "Syrian Pound", code: "SYP", symbol: "£S", flag: "🇸🇾", rate: 12500 },
  { country: "Yemen", currency: "Yemeni Rial", code: "YER", symbol: "﷼", flag: "🇾🇪", rate: 250 },
];

const UNIQUE_CURRENCIES = CURRENCIES.filter((c, i, arr) => arr.findIndex((x) => x.code === c.code) === i);

const QUIZ_QUESTIONS = [
  { type: "flag-to-currency", label: "Which currency does this country use?" },
  { type: "currency-to-country", label: "Which country uses this currency?" },
  { type: "symbol-to-currency", label: "Which currency uses this symbol?" },
];

const DIFFICULTY = {
  easy: { label: "Easy", questions: 10, timePerQ: 25, type: "flag-to-currency" },
  medium: { label: "Medium", questions: 15, timePerQ: 18, type: "flag-to-currency" },
  hard: { label: "Hard", questions: 20, timePerQ: 12, type: "symbol-to-currency" },
  expert: { label: "Expert", questions: 30, timePerQ: 8, type: "currency-to-country" },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getOptions(correct, pool, count = 3) {
  return shuffle(pool.filter((c) => c.code !== correct.code)).slice(0, count);
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
  const wrong = getOptions(target, pool, 3);
  const allOpts = shuffle([target, ...wrong]);

  if (type === "flag-to-currency") {
    return { question: `${target.flag} ${target.country}`, answer: target.code, options: allOpts.map((o) => ({ label: `${o.code} — ${o.currency}`, value: o.code })), hint: `Symbol: ${target.symbol}` };
  }
  if (type === "currency-to-country") {
    return { question: `${target.currency} (${target.code})`, answer: target.country, options: allOpts.map((o) => ({ label: `${o.flag} ${o.country}`, value: o.country })), hint: `Currency code: ${target.code}` };
  }
  return { question: `${target.symbol} — Which currency?`, answer: target.code, options: allOpts.map((o) => ({ label: `${o.code} — ${o.currency}`, value: o.code })), hint: `Country: ${target.country}` };
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
  const [gameOver, setGameOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const startQuiz = (diff) => {
    setDifficulty(diff);
    const cfg = DIFFICULTY[diff];
    const pool = shuffle(UNIQUE_CURRENCIES.filter((c) => c.rate > 0)).slice(0, Math.max(cfg.questions, 30));
    const questions = [];
    for (let i = 0; i < cfg.questions; i++) {
      questions.push(generateQuestion(cfg.type, pool));
    }
    setQuiz(questions);
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

  const reset = () => { setQuiz(null); setDifficulty(null); setGameOver(false); setAnswers([]); };

  const buildReportText = () => {
    if (!gameOver) return "";
    const pct = quiz.length > 0 ? ((score / quiz.length) * 100).toFixed(1) : 0;
    return `
CURRENCY QUIZ REPORT
Difficulty: ${DIFFICULTY[difficulty].label}
Generated: ${new Date().toLocaleString()}
---------------------------------
RESULTS:
- Score: ${score}/${quiz.length} (${pct}%)
- Best Streak: ${bestStreak}
- Time per Question: ${DIFFICULTY[difficulty].timePerQ}s
- Question Type: ${DIFFICULTY[difficulty].type}

BREAKDOWN:
${answers.map((a, i) => `${i + 1}. ${a.question} — ${a.isCorrect ? "CORRECT" : `WRONG (Answer: ${a.correctAnswer})`}`).join("\n")}

---------------------------------
Currency Quiz — Educational tool
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
    link.download = `Currency_Quiz_${DIFFICULTY[difficulty].label}.txt`;
    link.click();
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>This quiz covers 80+ world currencies with approximate USD exchange rates for reference. Rates are indicative and update periodically.</p>
          </div>
        </div>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold uppercase text-yellow-700">
            <Coins className="h-4 w-4" />
            World currency knowledge
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Currency Quiz</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Test your knowledge of world currencies — identify currencies from flags, symbols, and names with timed questions and streak scoring.
          </p>
        </section>

        {!quiz ? (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">Select Difficulty</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Object.entries(DIFFICULTY).map(([key, cfg]) => (
                <button key={key} onClick={() => startQuiz(key)} className="group rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 text-center transition-all hover:border-yellow-500 hover:shadow-[var(--anslation-ds-shadow-md)] active:scale-[0.97]">
                  <p className="text-2xl font-bold text-[var(--foreground)] group-hover:text-yellow-600">{cfg.questions}</p>
                  <p className="text-sm font-semibold text-[var(--muted)] mt-1">{cfg.label}</p>
                  <p className="text-xs text-[var(--muted)] mt-2">{cfg.timePerQ}s / question</p>
                  <p className="text-[10px] text-yellow-600 mt-1 font-bold uppercase">{cfg.type.replace(/-/g, " ")}</p>
                </button>
              ))}
            </div>
          </section>
        ) : gameOver ? (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] space-y-6 animate-in fade-in duration-500">
            <div className="text-center">
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-3" />
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
                <p className="text-3xl font-black text-yellow-500 mt-1">{bestStreak}</p>
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
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6 space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-[var(--foreground)]">{currentIdx + 1}/{quiz.length}</span>
              <div className="flex-1 h-3 overflow-hidden rounded-full bg-[var(--muted)]/40">
                <div className="h-full rounded-full bg-yellow-500 transition-all duration-300" style={{ width: `${((currentIdx + 1) / quiz.length) * 100}%` }} />
              </div>
              <div className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-bold ${timeColor}`}>
                <Timer className="h-4 w-4" /> {timer}s
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--foreground)]">
                <Target className="h-4 w-4 text-yellow-600" /> Score: {score}
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-yellow-50 border border-yellow-200 px-3 py-1 text-sm font-bold text-yellow-700">
                  <Zap className="h-4 w-4" /> {streak} streak {getStreakMsg(streak)}
                </div>
              )}
            </div>

            <div className="rounded-lg bg-[var(--background)] p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">{DIFFICULTY[difficulty].type.replace(/-/g, " ")}</p>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">{current.question}</h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {current.options.map((opt) => {
                const isCorrect = opt.value === current.answer;
                const isSelected = selected === opt.value;
                let optStyle = "border-[var(--border)] bg-[var(--background)] hover:border-yellow-500 hover:shadow-[var(--anslation-ds-shadow-sm)]";
                if (selected !== null) {
                  if (isCorrect) optStyle = "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/30";
                  else if (isSelected && !isCorrect) optStyle = "border-red-500 bg-red-50 ring-2 ring-red-500/30";
                  else optStyle = "border-[var(--border)] bg-[var(--background)] opacity-50";
                }
                return (
                  <button key={opt.value} disabled={selected !== null} onClick={() => handleAnswer(opt.value)} className={`rounded-lg border px-4 py-4 text-left text-base font-semibold transition-all active:scale-[0.98] ${optStyle}`}>
                    <span className="text-[var(--foreground)]">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <button onClick={reset} className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold transition-all hover:bg-[var(--muted)]">Quit Quiz</button>
          </section>
        )}

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">Currency Reference</h3>
          <div className="max-h-64 overflow-y-auto">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {UNIQUE_CURRENCIES.slice(0, 30).map((c) => (
                <div key={c.code} className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm">
                  <span className="text-lg">{c.flag}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[var(--foreground)] truncate">{c.code} <span className="text-[var(--muted)] font-normal">{c.symbol}</span></p>
                    <p className="text-xs text-[var(--muted)] truncate">{c.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">About World Currencies</h3>
          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Currency Codes (ISO 4217)</p>
              <p>Every currency has a 3-letter code standardized by ISO 4217. The first two letters usually represent the country, and the third is the currency name (e.g., USD = US Dollar, GBP = Great Britain Pound). The Euro (EUR) is unique as it is used by 20 EU member states.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Most Traded Currencies</p>
              <p>The US Dollar (USD) is involved in ~88% of all forex transactions. The Euro (EUR) is second at ~31%, followed by the Japanese Yen (JPY) at ~17%. The Kuwaiti Dinar (KWD) is the world&apos;s strongest currency by exchange rate, while the Iranian Rial (IRR) is among the weakest.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
