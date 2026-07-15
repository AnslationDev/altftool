"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Shuffle,
  Sparkles,
  Hash,
  Star,
  Palette,
  Copy,
  Heart,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateRandom(min, max, count, unique = true) {
  if (unique && max - min + 1 < count) return null;
  if (!unique) {
    return Array.from({ length: count }, () => randInt(min, max));
  }
  const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  return shuffle(pool).slice(0, count);
}

function generateLottery(sets, mainRange, extraRange) {
  const results = [];
  for (let s = 0; s < sets; s++) {
    const main = generateRandom(mainRange.min, mainRange.max, mainRange.count, true);
    const extra = generateRandom(extraRange.min, extraRange.max, extraRange.count, true);
    results.push({ main: main.sort((a, b) => a - b), extra: extra.sort((a, b) => a - b) });
  }
  return results;
}

const ZODIAC = [
  { sign: "Aries", dates: "Mar 21 – Apr 19", element: "Fire", colors: ["#FF6B6B", "#FF4500"] },
  { sign: "Taurus", dates: "Apr 20 – May 20", element: "Earth", colors: ["#98D8C8", "#8FBC8F"] },
  { sign: "Gemini", dates: "May 21 – Jun 20", element: "Air", colors: ["#FFD93D", "#FFE66D"] },
  { sign: "Cancer", dates: "Jun 21 – Jul 22", element: "Water", colors: ["#6BCB77", "#98D8C8"] },
  { sign: "Leo", dates: "Jul 23 – Aug 22", element: "Fire", colors: ["#FF8C00", "#FFA500"] },
  { sign: "Virgo", dates: "Aug 23 – Sep 22", element: "Earth", colors: ["#98FB98", "#7CCD7C"] },
  { sign: "Libra", dates: "Sep 23 – Oct 22", element: "Air", colors: ["#FFB6C1", "#DDA0DD"] },
  { sign: "Scorpio", dates: "Oct 23 – Nov 21", element: "Water", colors: ["#8B0000", "#DC143C"] },
  { sign: "Sagittarius", dates: "Nov 22 – Dec 21", element: "Fire", colors: ["#4169E1", "#6495ED"] },
  { sign: "Capricorn", dates: "Dec 22 – Jan 19", element: "Earth", colors: ["#2F4F4F", "#696969"] },
  { sign: "Aquarius", dates: "Jan 20 – Feb 18", element: "Air", colors: ["#00CED1", "#20B2AA"] },
  { sign: "Pisces", dates: "Feb 19 – Mar 20", element: "Water", colors: ["#9370DB", "#BA55D3"] },
];

function getZodiacNumbers(signIndex) {
  const day = signIndex + 1;
  const month = signIndex + 1 > 12 ? (signIndex + 1) % 12 || 12 : signIndex + 1;
  const seed = day * month;
  const nums = [];
  const rng = (i) => ((seed * 17 + i * 31 + signIndex * 7) % 100) + 1;
  for (let i = 0; i < 6; i++) {
    nums.push(rng(i));
  }
  return nums;
}

function getNumerologyNumbers(birthDate) {
  const d = new Date(birthDate);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  const sumDigits = (n) => String(n).split("").reduce((s, c) => s + parseInt(c), 0);
  const reduceToSingle = (n) => { while (n > 9) n = sumDigits(n); return n; };

  const lifePath = reduceToSingle(sumDigits(day) + sumDigits(month) + sumDigits(year));
  const destiny = reduceToSingle(sumDigits(day) + sumDigits(month) + sumDigits(year));
  const soulUrge = reduceToSingle(sumDigits(day) + sumDigits(month));
  const personality = reduceToSingle(sumDigits(year));

  const dateInt = parseInt(`${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`);
  const extras = [];
  for (let i = 0; i < 3; i++) {
    extras.push(((dateInt * 13 + i * 7) % 99) + 1);
  }

  const base = [lifePath, destiny, soulUrge, personality, ...extras];
  const unique = [...new Set(base)];
  while (unique.length < 6) {
    unique.push(randInt(1, 99));
  }
  return unique.slice(0, 6).sort((a, b) => a - b);
}

function getHoroscopeNumbers(signIndex) {
  const d = new Date();
  const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
  const seed = dayOfYear * (signIndex + 1) * 7;
  const nums = [];
  for (let i = 0; i < 5; i++) {
    nums.push(((seed + i * 13) % 49) + 1);
  }
  const power = ((seed * 17 + signIndex * 11) % 26) + 1;
  return { main: nums.sort((a, b) => a - b), power };
}

function generateCustomNumbers(min, max, count, allowRepeats, includeZero) {
  const effectiveMin = includeZero ? Math.min(0, min) : Math.max(1, min);
  if (allowRepeats) {
    return Array.from({ length: count }, () => randInt(effectiveMin, max));
  }
  return generateRandom(effectiveMin, max, count, true);
}

export default function NumberGenerator({ onGenerate, generatedNumbers, onSave }) {
  const [mode, setMode] = useState("random");
  const [copied, setCopied] = useState(false);

  const [randomMin, setRandomMin] = useState(1);
  const [randomMax, setRandomMax] = useState(100);
  const [randomCount, setRandomCount] = useState(6);
  const [randomUnique, setRandomUnique] = useState(true);

  const [lotterySets, setLotterySets] = useState(1);
  const [lotteryMainCount, setLotteryMainCount] = useState(5);
  const [lotteryMainMax, setLotteryMainMax] = useState(50);
  const [lotteryExtraCount, setLotteryExtraCount] = useState(2);
  const [lotteryExtraMax, setLotteryExtraMax] = useState(12);
  const [lotteryMainMin, setLotteryMainMin] = useState(1);
  const [lotteryExtraMin, setLotteryExtraMin] = useState(1);

  const [selectedZodiac, setSelectedZodiac] = useState(0);

  const [birthDate, setBirthDate] = useState("1990-01-01");

  const [customMin, setCustomMin] = useState(1);
  const [customMax, setCustomMax] = useState(99);
  const [customCount, setCustomCount] = useState(6);
  const [customAllowRepeats, setCustomAllowRepeats] = useState(false);
  const [customIncludeZero, setCustomIncludeZero] = useState(false);

  const [selectedSign, setSelectedSign] = useState(0);

  const modeOptions = [
    {
      key: "random",
      label: "Random",
      icon: <Shuffle className="w-4 h-4" />,
      desc: "Simple random numbers",
    },
    {
      key: "lottery",
      label: "Lottery",
      icon: <Star className="w-4 h-4" />,
      desc: "Lottery-style number sets",
    },
    {
      key: "horoscope",
      label: "Horoscope",
      icon: <Sparkles className="w-4 h-4" />,
      desc: "Daily horoscope numbers",
    },
    {
      key: "numerology",
      label: "Numerology",
      icon: <Hash className="w-4 h-4" />,
      desc: "Based on your birth date",
    },
    {
      key: "custom",
      label: "Custom",
      icon: <Palette className="w-4 h-4" />,
      desc: "Set your own rules",
    },
  ];

  const handleGenerate = useCallback(() => {
    let numbers, label;

    switch (mode) {
      case "random": {
        const result = generateRandom(randomMin, randomMax, randomCount, randomUnique);
        if (!result) return;
        numbers = result;
        label = `Random (${randomMin}–${randomMax}, ${randomCount} numbers)`;
        break;
      }
      case "lottery": {
        const result = generateLottery(
          lotterySets,
          { min: lotteryMainMin, max: lotteryMainMax, count: lotteryMainCount },
          { min: lotteryExtraMin, max: lotteryExtraMax, count: lotteryExtraCount }
        );
        numbers = result;
        label = `Lottery (${lotteryMainCount}/${lotteryMainMax} + ${lotteryExtraCount}/${lotteryExtraMax}) × ${lotterySets}`;
        break;
      }
      case "horoscope": {
        const { main, power } = getHoroscopeNumbers(selectedSign);
        numbers = { main, power, sign: ZODIAC[selectedSign].sign };
        label = `Horoscope — ${ZODIAC[selectedSign].sign}`;
        break;
      }
      case "numerology": {
        if (!birthDate) return;
        numbers = getNumerologyNumbers(birthDate);
        label = `Numerology — ${birthDate}`;
        break;
      }
      case "custom": {
        const result = generateCustomNumbers(customMin, customMax, customCount, customAllowRepeats, customIncludeZero);
        if (!result) return;
        numbers = result;
        label = `Custom (${customMin}–${customMax}, ${customCount} numbers)`;
        break;
      }
      default:
        return;
    }

    onGenerate(numbers, mode, label);
  }, [mode, randomMin, randomMax, randomCount, randomUnique, lotterySets, lotteryMainCount, lotteryMainMax, lotteryExtraCount, lotteryExtraMax, lotteryMainMin, lotteryExtraMin, selectedSign, birthDate, customMin, customMax, customCount, customAllowRepeats, customIncludeZero, selectedZodiac, onGenerate]);

  const formatNumbers = (nums) => {
    if (!nums) return "";
    if (Array.isArray(nums)) {
      if (nums.length > 0 && nums[0]?.main) {
        return nums.map((set, i) => `#${i + 1}: ${set.main.join(", ")} + ${set.extra.join(", ")}`).join(" | ");
      }
      return nums.join(", ");
    }
    if (nums.main) {
      return `${nums.main.join(", ")}  |  Power: ${nums.power}`;
    }
    if (typeof nums === "object") {
      return JSON.stringify(nums);
    }
    return String(nums);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-(--border) bg-(--surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--primary)/30 focus:border-(--primary) transition";
  const labelClass = "text-xs font-medium text-(--muted-foreground) mb-1";

  const renderRandom = () => (
    <div className="grid grid-cols-3 gap-3">
      <div>
        <label className={labelClass}>Min</label>
        <input type="number" value={randomMin} onChange={(e) => setRandomMin(parseInt(e.target.value) || 1)} className={inputClass} min={0} />
      </div>
      <div>
        <label className={labelClass}>Max</label>
        <input type="number" value={randomMax} onChange={(e) => setRandomMax(parseInt(e.target.value) || 100)} className={inputClass} min={1} />
      </div>
      <div>
        <label className={labelClass}>Count</label>
        <input type="number" value={randomCount} onChange={(e) => setRandomCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))} className={inputClass} min={1} max={50} />
      </div>
      <div className="col-span-3 flex items-center gap-2 pt-1">
        <input type="checkbox" id="unique" checked={randomUnique} onChange={(e) => setRandomUnique(e.target.checked)} className="rounded" />
        <label htmlFor="unique" className="text-sm text-(--muted-foreground)">Unique numbers (no duplicates)</label>
      </div>
    </div>
  );

  const renderLottery = () => (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-(--page) border border-(--border)">
        <p className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide mb-2">Main Numbers</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>From</label>
            <input type="number" value={lotteryMainMin} onChange={(e) => setLotteryMainMin(parseInt(e.target.value) || 1)} className={inputClass} min={1} />
          </div>
          <div>
            <label className={labelClass}>To</label>
            <input type="number" value={lotteryMainMax} onChange={(e) => setLotteryMainMax(parseInt(e.target.value) || 50)} className={inputClass} min={2} />
          </div>
          <div>
            <label className={labelClass}>Pick</label>
            <input type="number" value={lotteryMainCount} onChange={(e) => setLotteryMainCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))} className={inputClass} min={1} max={20} />
          </div>
        </div>
      </div>
      <div className="p-3 rounded-lg bg-(--page) border border-(--border)">
        <p className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide mb-2">Extra Numbers (Power/Star)</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>From</label>
            <input type="number" value={lotteryExtraMin} onChange={(e) => setLotteryExtraMin(parseInt(e.target.value) || 1)} className={inputClass} min={1} />
          </div>
          <div>
            <label className={labelClass}>To</label>
            <input type="number" value={lotteryExtraMax} onChange={(e) => setLotteryExtraMax(parseInt(e.target.value) || 12)} className={inputClass} min={2} />
          </div>
          <div>
            <label className={labelClass}>Pick</label>
            <input type="number" value={lotteryExtraCount} onChange={(e) => setLotteryExtraCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))} className={inputClass} min={1} max={10} />
          </div>
        </div>
      </div>
      <div>
        <label className={labelClass}>Number of Sets</label>
        <input type="number" value={lotterySets} onChange={(e) => setLotterySets(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))} className={inputClass} min={1} max={10} />
      </div>
    </div>
  );

  const renderHoroscope = () => (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Your Zodiac Sign</label>
        <select value={selectedSign} onChange={(e) => { setSelectedSign(parseInt(e.target.value)); setSelectedZodiac(parseInt(e.target.value)); }} className={inputClass}>
          {ZODIAC.map((z, i) => (
            <option key={i} value={i}>{z.sign} ({z.dates}) — {z.element}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 p-3 rounded-lg bg-(--page) border border-(--border)">
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ZODIAC[selectedSign].colors[0] }} />
        <span className="text-sm text-(--muted-foreground)">{ZODIAC[selectedSign].sign} — Element: {ZODIAC[selectedSign].element}</span>
      </div>
    </div>
  );

  const renderNumerology = () => (
    <div>
      <label className={labelClass}>Your Birth Date</label>
      <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} max={new Date().toISOString().split("T")[0]} />
    </div>
  );

  const renderCustom = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Min</label>
          <input type="number" value={customMin} onChange={(e) => setCustomMin(parseInt(e.target.value) || 0)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Max</label>
          <input type="number" value={customMax} onChange={(e) => setCustomMax(parseInt(e.target.value) || 99)} className={inputClass} min={1} />
        </div>
        <div>
          <label className={labelClass}>Count</label>
          <input type="number" value={customCount} onChange={(e) => setCustomCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))} className={inputClass} min={1} max={50} />
        </div>
      </div>
      <div className="flex flex-wrap gap-4 pt-1">
        <label className="flex items-center gap-2 text-sm text-(--muted-foreground)">
          <input type="checkbox" checked={customAllowRepeats} onChange={(e) => setCustomAllowRepeats(e.target.checked)} className="rounded" />
          Allow repeats
        </label>
        <label className="flex items-center gap-2 text-sm text-(--muted-foreground)">
          <input type="checkbox" checked={customIncludeZero} onChange={(e) => setCustomIncludeZero(e.target.checked)} className="rounded" />
          Include zero
        </label>
      </div>
    </div>
  );

  const renderSettings = () => {
    switch (mode) {
      case "random": return renderRandom();
      case "lottery": return renderLottery();
      case "horoscope": return renderHoroscope();
      case "numerology": return renderNumerology();
      case "custom": return renderCustom();
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-md">
        <div className="flex flex-wrap gap-2 mb-6">
          {modeOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setMode(opt.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition border ${
                mode === opt.key
                  ? "bg-(--primary) text-white border-(--primary)"
                  : "bg-(--page) text-(--muted-foreground) border-(--border) hover:border-(--primary)/50 hover:text-(--foreground)"
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>

        <div className="mb-6">{renderSettings()}</div>

        <button
          onClick={handleGenerate}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-(--primary) text-white font-semibold text-sm hover:opacity-90 transition shadow-md"
        >
          <RefreshCw className="w-4 h-4" />
          Generate Lucky Numbers
        </button>
      </div>

      {generatedNumbers && (
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-md animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-(--muted-foreground) uppercase tracking-wide">
              Your Lucky Numbers
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(formatNumbers(generatedNumbers))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-(--border) hover:bg-(--page) transition"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() => onSave(generatedNumbers, mode)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-(--border) hover:text-red-500 hover:border-red-300 transition"
              >
                <Heart className="w-3.5 h-3.5" />
                Save
              </button>
            </div>
          </div>

          {mode === "lottery" && Array.isArray(generatedNumbers) && generatedNumbers.length > 0 && generatedNumbers[0]?.main ? (
            <div className="space-y-3">
              {generatedNumbers.map((set, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-(--page) border border-(--border)">
                  <span className="text-xs font-medium text-(--muted-foreground) w-6">#{i + 1}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {set.main.map((n, j) => (
                      <span key={j} className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-(--primary)/10 text-(--primary) text-sm font-bold">
                        {n}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-(--muted-foreground) mx-1">+</span>
                  <div className="flex flex-wrap gap-1.5">
                    {set.extra.map((n, j) => (
                      <span key={j} className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-(--secondary)/10 dark:bg-(--secondary)/30 text-(--secondary) dark:text-(--secondary) text-sm font-bold">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : mode === "horoscope" && generatedNumbers && !Array.isArray(generatedNumbers) && generatedNumbers.sign ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium">{generatedNumbers.sign}</span>
                <span className="text-xs text-(--muted-foreground)">— Daily Lucky Numbers</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {generatedNumbers.main.map((n, i) => (
                  <span key={i} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-(--primary)/10 text-(--primary) text-base font-bold">
                    {n}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-(--muted-foreground)">Power Number:</span>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-(--secondary)/10 dark:bg-(--secondary)/30 text-(--secondary) dark:text-(--secondary) text-sm font-bold">
                  {generatedNumbers.power}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(generatedNumbers) ? generatedNumbers : []).map((n, i) => (
                <span key={i} className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-(--primary)/10 text-(--primary) text-lg font-bold">
                  {n}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
