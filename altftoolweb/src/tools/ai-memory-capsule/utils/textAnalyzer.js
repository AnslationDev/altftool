import { SENTIMENT_WORDS } from "../constants/index";

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

const STOP_WORDS = new Set([
  "the","and","for","are","but","not","you","all","can","had","her","was",
  "one","our","out","has","his","how","its","may","new","now","old","see",
  "way","who","did","get","let","say","she","too","use","with","that",
  "this","will","each","make","like","just","over","such","take","than",
  "them","then","these","from","have","been","said","more","when","what",
  "your","were","there","their","would","could","about","which","after",
  "other","some","into","also","being","only","very","well","back","much",
  "going","where","still","should","those","think","here","every","come",
  "made","many","most","find","long","down","same","tell","does","look",
  "help","show","first","goes","keep","left","life","real","last","might",
  "really","thing","things","today","because","through","want","something",
]);

export function analyzeSentiment(text) {
  if (!text) return { score: 0, label: "Neutral", positive: 0, negative: 0 };
  const words = tokenize(text);
  const meaningful = words.filter((w) => !STOP_WORDS.has(w));
  let positiveCount = 0;
  let negativeCount = 0;
  let hasIntensifier = false;
  let hasDiminisher = false;

  for (const word of meaningful) {
    if (SENTIMENT_WORDS.positive.includes(word)) positiveCount++;
    if (SENTIMENT_WORDS.negative.includes(word)) negativeCount++;
    if (SENTIMENT_WORDS.intensifiers.includes(word)) hasIntensifier = true;
    if (SENTIMENT_WORDS.diminishers.includes(word)) hasDiminisher = true;
  }

  const total = positiveCount + negativeCount;
  let score = 0;
  if (total > 0) {
    score = ((positiveCount - negativeCount) / total) * 100;
    if (hasIntensifier) score = Math.min(100, score * 1.3);
    if (hasDiminisher) score = score * 0.7;
  }
  score = Math.round(Math.max(-100, Math.min(100, score)));

  let label = "Neutral";
  if (score > 30) label = "Positive";
  if (score > 60) label = "Very Positive";
  if (score < -30) label = "Negative";
  if (score < -60) label = "Very Negative";

  return { score, label, positive: positiveCount, negative: negativeCount };
}

export function getWordFrequencies(text, topN = 20) {
  if (!text) return [];
  const words = tokenize(text);
  const freq = new Map();
  for (const word of words) {
    if (STOP_WORDS.has(word)) continue;
    freq.set(word, (freq.get(word) || 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));
}

const TOPICS = [
  { name: "Travel", keywords: ["travel","trip","visit","vacation","flight","hotel","beach","mountain","explore","adventure","journey"] },
  { name: "Work", keywords: ["work","office","meeting","project","deadline","client","team","manager","report","interview","career"] },
  { name: "Family", keywords: ["family","mom","dad","mother","father","brother","sister","son","daughter","parents","kids","children"] },
  { name: "Friends", keywords: ["friend","friends","party","dinner","hangout","together","buddy","group","celebrate"] },
  { name: "Health", keywords: ["health","exercise","gym","running","doctor","hospital","meditation","yoga","sleep","fitness"] },
  { name: "Learning", keywords: ["learn","study","read","book","course","class","school","university","education","skill"] },
  { name: "Love", keywords: ["love","relationship","partner","boyfriend","girlfriend","husband","wife","romantic","kiss","hug"] },
  { name: "Food", keywords: ["food","eat","restaurant","cook","meal","breakfast","lunch","dinner","recipe","delicious"] },
  { name: "Nature", keywords: ["nature","sun","rain","sky","tree","flower","ocean","river","garden","park","sunset"] },
  { name: "Creative", keywords: ["create","draw","paint","music","sing","write","design","art","photo","film","craft"] },
];

export function detectTopics(text) {
  if (!text) return [];
  const words = new Set(tokenize(text));
  const detected = [];
  for (const topic of TOPICS) {
    const matches = topic.keywords.filter((kw) => words.has(kw));
    if (matches.length > 0) {
      detected.push({ name: topic.name, score: matches.length, keywords: matches });
    }
  }
  return detected.sort((a, b) => b.score - a.score);
}

export function generateInsights(capsules) {
  if (!capsules || capsules.length === 0) {
    return {
      totalWords: 0, avgWordsPerCapsule: 0, topMood: null,
      moodDistribution: {}, topCategories: [], streak: 0,
      longestCapsule: null, shortestCapsule: null,
      totalCapsules: 0, favoriteCount: 0, sealedCount: 0,
    };
  }

  const totalWords = capsules.reduce((sum, c) => sum + (c.wordCount || 0), 0);
  const avgWords = Math.round(totalWords / capsules.length);

  const moodCount = {};
  const catCount = {};
  let longest = capsules[0];
  let shortest = capsules[0];

  for (const c of capsules) {
    moodCount[c.mood] = (moodCount[c.mood] || 0) + 1;
    catCount[c.category] = (catCount[c.category] || 0) + 1;
    if ((c.wordCount || 0) > (longest.wordCount || 0)) longest = c;
    if ((c.wordCount || 0) < (shortest.wordCount || 0)) shortest = c;
  }

  const topMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const topCategories = Object.entries(catCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const dates = capsules.map((c) => new Date(c.dateCreated).toDateString());
  const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < uniqueDates.length; i++) {
    const d = new Date(uniqueDates[i]);
    const diff = Math.floor((today - d) / (1000 * 60 * 60 * 24));
    if (diff <= i + 1) streak++;
    else break;
  }

  return {
    totalWords,
    avgWordsPerCapsule: avgWords,
    topMood,
    moodDistribution: moodCount,
    topCategories,
    streak,
    longestCapsule: longest,
    shortestCapsule: shortest,
    totalCapsules: capsules.length,
    favoriteCount: capsules.filter((c) => c.isFavorite).length,
    sealedCount: capsules.filter((c) => c.isSealed).length,
  };
}
