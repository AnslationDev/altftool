const COMPLIMENTS = [
  "Your smile radiates warmth and kindness!",
  "You have a natural elegance that shines through!",
  "Your confidence is truly inspiring!",
  "The world is brighter because you're in it!",
  "You have a heart of gold and it shows!",
  "Your energy is absolutely contagious!",
  "You carry yourself with such grace and poise!",
  "Your creativity knows no bounds!",
  "You have the most genuine and caring soul!",
  "Your laughter is pure magic!",
  "You light up every room you walk into!",
  "Your inner beauty is even more stunning than your outer!",
  "You have a remarkable way of making others feel special!",
  "Your kindness is a superpower!",
  "You are a masterpiece of uniqueness!",
  "Your presence is a gift to everyone around you!",
  "You have an incredible strength that inspires others!",
  "Your positive attitude is absolutely radiant!",
  "You possess a rare combination of beauty and brains!",
  "Your spirit is as beautiful as a summer sunset!",
  "You make the ordinary feel extraordinary!",
  "Your authenticity is your most beautiful feature!",
  "You have a beautiful way of seeing the good in everything!",
  "Your compassion makes the world a better place!",
  "You are a beautiful soul inside and out!",
];

const STYLE_TAGS = [
  "Radiant 🌟",
  "Elegant 🦋",
  "Vibrant ✨",
  "Graceful 🌸",
  "Stunning 💫",
  "Unique 🌈",
  "Confident 💪",
  "Peaceful ☮️",
  "Joyful 😊",
  "Magical 🪄",
  "Brilliant 💎",
  "Charming 🌺",
  "Creative 🎨",
  "Glowing 🔥",
  "Timeless ⌛",
  "Dreamy ☁️",
  "Radiant ✨",
  "Serene 🧘",
  "Bold ⚡",
  "Luminous 💡",
];

const MOODS = [
  "Joyful",
  "Peaceful",
  "Confident",
  "Loving",
  "Creative",
  "Radiant",
  "Serene",
  "Vibrant",
];

const FAQS = [
  {
    q: "How is my beauty score calculated?",
    a: "Your beauty score is generated using a fictional, algorithmic process based on your uploaded image data. It is completely random and designed purely for entertainment — there is no real science behind it!",
  },
  {
    q: "Is my photo stored or shared?",
    a: "Absolutely not! All processing happens entirely in your browser. Your photo never leaves your device and is never uploaded to any server. You can clear your results at any time.",
  },
  {
    q: "Why do I always get a high score?",
    a: "Because you ARE beautiful! Our algorithm is designed to always produce positive, uplifting scores in the 70-100 range. This tool is all about celebrating your unique beauty, not judging it.",
  },
  {
    q: "Can I save or share my results?",
    a: "Yes! You can save results to your history, download your result card as an image, copy the text report, or share it with friends using your device's share menu.",
  },
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seededRandom(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export function generateBeautyScore(imageData) {
  const hash = hashString(imageData || String(Date.now()));
  const random = seededRandom(hash);
  const score = Math.round(70 + (random * 30));
  return Math.min(100, Math.max(70, score));
}

export function pickCompliments(count = 3) {
  const shuffled = [...COMPLIMENTS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function pickStyleTags(count = 3) {
  const shuffled = [...STYLE_TAGS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function pickMood() {
  return MOODS[Math.floor(Math.random() * MOODS.length)];
}

export function generateResult(imageData) {
  const score = generateBeautyScore(imageData);
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    score,
    compliments: pickCompliments(4),
    styleTags: pickStyleTags(4),
    moodBadge: pickMood(),
    timestamp: new Date().toISOString(),
    imageData: imageData || null,
  };
}

export function formatTimestamp(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export { COMPLIMENTS, STYLE_TAGS, MOODS, FAQS };

export const STORAGE_KEYS = {
  HISTORY: "beauty-score-history",
  FAVORITES: "beauty-score-favorites",
  SETTINGS: "beauty-score-settings",
};
