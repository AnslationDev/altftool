const LUCKY_COLORS = [
  { name: "Crimson", hex: "#DC2626" },
  { name: "Tangerine", hex: "#EA580C" },
  { name: "Amber", hex: "#F59E0B" },
  { name: "Gold", hex: "#EAB308" },
  { name: "Spring Green", hex: "#22C55E" },
  { name: "Emerald", hex: "#10B981" },
  { name: "Teal", hex: "#14B8A6" },
  { name: "Sky Blue", hex: "#0EA5E9" },
  { name: "Royal Blue", hex: "#3B82F6" },
  { name: "Violet", hex: "#8B5CF6" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Rose", hex: "#F43F5E" },
];

const LUCKY_EMOJIS = [
  "🍀", "✨", "⭐", "💫", "🌟", "🎯", "🎲", "💎",
  "🔮", "🌈", "🦄", "🐞", "👑", "🌺", "🎆", "🏆",
  "💰", "🪙", "💖", "🎉"
];

const BADGES = [
  { min: 0, max: 20, label: "Needs a Four-Leaf Clover", emoji: "🍀", icon: "clover" },
  { min: 21, max: 40, label: "Beginner's Luck", emoji: "✨", icon: "sparkles" },
  { min: 41, max: 60, label: "Lucky Star", emoji: "⭐", icon: "star" },
  { min: 61, max: 80, label: "Fortune's Favorite", emoji: "💫", icon: "sparkle" },
  { min: 81, max: 100, label: "Grand Luck Master", emoji: "👑", icon: "crown" },
];

const FORTUNES = [
  "A thrilling time is in your immediate future...",
  "Your luck is about to change for the better...",
  "Fortune favors the bold — and you've been brave!",
  "The stars align to bring you unexpected joy...",
  "A pleasant surprise is heading your way soon!",
  "Your positive energy attracts abundance like a magnet.",
  "Opportunity will knock twice — answer the second time.",
  "The universe is conspiring to make you smile today.",
  "Luck is the residue of design — and you've designed well.",
  "A windfall of good fortune is approaching rapidly.",
  "Your guardian angel just punched in for overtime.",
  "Serendipity has your name on it — stay open!",
  "Today the odds will bend in your favor.",
  "Something wonderful is about to find you.",
  "Lady Luck is smiling — and she's looking at you!",
  "A lucky break will present itself when you least expect it.",
  "The cosmic dice are rolling your way.",
  "Your aura is glowing with prosperity and joy.",
  "An unexpected gift from fate is en route.",
  "The pendulum of luck swings your direction now!",
];

const HOROSCOPES = [
  "Today's cosmic energy suggests you embrace spontaneity. Unexpected encounters could lead to fortunate outcomes. Trust your instincts — they're sharper than usual.",
  "The planetary alignment favors risk-taking today. Whether it's a new venture or a bold decision, the universe supports your leap of faith.",
  "Your patience is about to pay off in a delightful way. Keep your eyes open for signs and synchronicities that guide your path.",
  "A moment of serendipity awaits you around midday. Stay present and you'll notice an opportunity others might miss.",
  "The moon's position enhances your natural charisma. Use this magnetic energy to attract what you've been wishing for.",
  "Stars indicate a wave of prosperity approaching. Be generous with your good fortune — it will multiply when shared.",
];

export function generateSeedFromImageData(imageData) {
  if (!imageData || !imageData.length) return Date.now();
  const sample = [];
  for (let i = 0; i < imageData.length && sample.length < 1000; i += 4) {
    sample.push(imageData[i], imageData[i + 1], imageData[i + 2]);
  }
  const avg = sample.reduce((a, b) => a + b, 0) / sample.length;
  return Math.floor(avg * 1000) + sample.length;
}

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function computeLuckyScore(seed) {
  const rng = seededRandom(seed);
  const score = Math.floor(rng() * 101);
  const luckyNumber = Math.floor(rng() * 100) + 1;
  const luckyColorIndex = Math.floor(rng() * LUCKY_COLORS.length);
  const luckyEmojiIndex = Math.floor(rng() * LUCKY_EMOJIS.length);
  const badge = BADGES.find((b) => score >= b.min && score <= b.max);
  const fortuneIndex = Math.floor(rng() * FORTUNES.length);
  const horoscopeIndex = Math.floor(rng() * HOROSCOPES.length);

  const luckyNumbers = [];
  for (let i = 0; i < 3; i++) {
    luckyNumbers.push(Math.floor(rng() * 99) + 1);
  }

  return {
    score,
    luckyNumber,
    luckyColor: LUCKY_COLORS[luckyColorIndex],
    luckyEmoji: LUCKY_EMOJIS[luckyEmojiIndex],
    badge,
    fortune: FORTUNES[fortuneIndex],
    horoscope: HOROSCOPES[horoscopeIndex],
    luckyNumbers,
    timestamp: Date.now(),
    date: new Date().toLocaleDateString(),
    id: `lfs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
}

export function getScoreColor(score) {
  if (score >= 80) return "text-amber-500";
  if (score >= 60) return "text-green-500";
  if (score >= 40) return "text-yellow-500";
  if (score >= 20) return "text-orange-500";
  return "text-red-500";
}

export function getScoreBg(score) {
  if (score >= 80) return "bg-amber-500/10";
  if (score >= 60) return "bg-green-500/10";
  if (score >= 40) return "bg-yellow-500/10";
  if (score >= 20) return "bg-orange-500/10";
  return "bg-red-500/10";
}

export function getScoreBarColor(score) {
  if (score >= 80) return "bg-amber-500";
  if (score >= 60) return "bg-green-500";
  if (score >= 40) return "bg-yellow-500";
  if (score >= 20) return "bg-orange-500";
  return "bg-red-500";
}

export function getScoreGradient(score) {
  if (score >= 80) return "from-amber-400 via-yellow-400 to-amber-600";
  if (score >= 60) return "from-green-400 via-emerald-400 to-teal-500";
  if (score >= 40) return "from-yellow-300 via-yellow-400 to-orange-400";
  if (score >= 20) return "from-orange-400 via-orange-500 to-red-400";
  return "from-red-400 via-red-500 to-rose-600";
}
