"use client";

export const AURA_COLORS = {
  blue: { hex: "#3B82F6", name: "Blue", meaning: "Calm & Peaceful", traits: ["Compassionate", "Intuitive", "Honest"] },
  green: { hex: "#10B981", name: "Green", meaning: "Growth & Balance", traits: ["Healing", "Nurturing", "Grounded"] },
  purple: { hex: "#8B5CF6", name: "Purple", meaning: "Mystery & Magic", traits: ["Creative", "Visionary", "Spiritual"] },
  pink: { hex: "#EC4899", name: "Pink", meaning: "Love & Compassion", traits: ["Caring", "Gentle", "Romantic"] },
  gold: { hex: "#F59E0B", name: "Gold", meaning: "Success & Wisdom", traits: ["Confident", "Ambitious", "Enlightened"] },
  orange: { hex: "#F97316", name: "Orange", meaning: "Energy & Joy", traits: ["Energetic", "Social", "Enthusiastic"] },
  red: { hex: "#EF4444", name: "Red", meaning: "Passion & Power", traits: ["Bold", "Determined", "Dynamic"] },
  white: { hex: "#F8FAFC", name: "White", meaning: "Purity & Light", traits: ["Peaceful", "Clear", "Truthful"] },
  silver: { hex: "#94A3B8", name: "Silver", meaning: "Intuition & Grace", traits: ["Wise", "Elegant", "Perceptive"] },
  rainbow: { hex: "linear-gradient(90deg, #EF4444, #F97316, #F59E0B, #10B981, #3B82F6, #8B5CF6)", name: "Rainbow", meaning: "Creativity & Joy", traits: ["Artistic", "Free-spirited", "Unique"] },
};

export const LUCKY_QUOTES = [
  "Your aura shines brightest when you embrace who you truly are.",
  "The energy you put out is the energy you attract.",
  "Trust the light within you — it knows the way.",
  "Your vibe attracts your tribe.",
  "Radiate positivity and the universe will respond.",
  "Every soul has a color that tells its story.",
  "Let your inner light guide you through the darkness.",
  "You are a universe of infinite possibilities.",
  "The glow you see is the reflection of your inner beauty.",
  "Embrace your unique energy — it's your superpower.",
  "Like attracts like. Shine on.",
  "Your spirit color reveals the magic within.",
  "Be the light that others can find their way by.",
  "Aura is the fingerprint of the soul.",
  "What you radiate, you attract.",
  "Your energy is your greatest gift to the world.",
  "The brightest auras come from the kindest hearts.",
  "Let your inner light illuminate the path for others.",
  "You don't have an aura — you are an aura.",
  "Colors are the smiles of the universe.",
];

export const FUN_DESCRIPTIONS = {
  blue: "Your calm blue aura suggests you're the eye of every storm — a peaceful presence that brings clarity to chaos. Like the deep ocean, you hold hidden depths and quiet wisdom.",
  green: "Your green aura radiates growth and harmony. You have a natural ability to nurture those around you, helping them flourish like a garden in spring.",
  purple: "A mystical purple aura surrounds you! You possess an otherworldly creativity and a deep connection to the unseen realms of imagination.",
  pink: "Your pink aura glows with unconditional love and tenderness. You see the beauty in everyone and everything around you.",
  gold: "A golden aura of success and enlightenment radiates from you! You carry the wisdom of ages and the confidence of a true leader.",
  orange: "Your vibrant orange aura crackles with creative energy and social warmth. You're the life of every gathering!",
  red: "A powerful red aura blazes around you! Your passionate nature and fierce determination move mountains.",
  white: "Your pure white aura reflects clarity and truth. You see the world with fresh eyes and an open heart.",
  silver: "Your silver aura shimmers with intuition and grace. You possess a quiet wisdom that others instinctively trust.",
  rainbow: "A magnificent rainbow aura surrounds you! Your creative spirit knows no bounds and you see the world in brilliant color.",
};

export const DAILY_MOODS = {
  blue: "Serene",
  green: "Refreshed",
  purple: "Mystical",
  pink: "Loving",
  gold: "Triumphant",
  orange: "Energized",
  red: "Fired Up",
  white: "Peaceful",
  silver: "Intuitive",
  rainbow: "Inspired",
};

export const CREATIVE_MESSAGES = {
  blue: "Like the ocean's depths, your soul holds ancient wisdom and quiet strength.",
  green: "You are a garden of endless possibilities — keep growing, keep blooming.",
  purple: "Magic flows through your veins. The universe whispers secrets only you can hear.",
  pink: "Love is your language and compassion is your gift to the world.",
  gold: "You are a beacon of light, illuminating the path for others to follow.",
  orange: "Your enthusiasm is contagious — you spark joy wherever you go.",
  red: "The fire within you cannot be contained. You are unstoppable.",
  white: "In a world of noise, you are the quiet clarity that brings peace.",
  silver: "Your intuition is a superpower. Trust the whispers of your soul.",
  rainbow: "You contain multitudes — every color of the rainbow lives within you.",
};

export function generateSeedFromImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 32, 32);
        const data = ctx.getImageData(0, 0, 32, 32).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        const avgR = Math.round(r / count);
        const avgG = Math.round(g / count);
        const avgB = Math.round(b / count);
        const seed = ((avgR * 256 + avgG) * 256 + avgB) % 1000;
        resolve({ seed, avgColor: `rgb(${avgR}, ${avgG}, ${avgB})` });
      };
      img.src = URL.createObjectURL(file);
    };
    reader.readAsDataURL(file);
  });
}

export function pickAuraFromSeed(seed) {
  const keys = Object.keys(AURA_COLORS);
  const index = seed % keys.length;
  return { key: keys[index], ...AURA_COLORS[keys[index]] };
}

export function getRandomAura() {
  const keys = Object.keys(AURA_COLORS);
  const key = keys[Math.floor(Math.random() * keys.length)];
  return { key, ...AURA_COLORS[key] };
}

export function getRandomQuote() {
  return LUCKY_QUOTES[Math.floor(Math.random() * LUCKY_QUOTES.length)];
}

export function generatePaletteShades(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const shades = [];
  for (let i = 0; i < 5; i++) {
    const factor = 0.3 + i * 0.15;
    const nr = Math.min(255, Math.round(r * factor + 255 * (1 - factor) * 0.5));
    const ng = Math.min(255, Math.round(g * factor + 255 * (1 - factor) * 0.5));
    const nb = Math.min(255, Math.round(b * factor + 255 * (1 - factor) * 0.5));
    shades.push(`#${[nr, ng, nb].map(v => v.toString(16).padStart(2, "0")).join("")}`);
  }
  return shades;
}

export function downloadAuraCard(aura, imageSrc) {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, 600, 800);
  ctx.fillStyle = aura.hex;
  ctx.beginPath();
  ctx.arc(300, 180, 100, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = aura.hex;
  ctx.shadowBlur = 60;
  ctx.beginPath();
  ctx.arc(300, 180, 100, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(aura.name, 300, 340);
  ctx.font = "16px sans-serif";
  ctx.fillStyle = "#94A3B8";
  ctx.fillText(aura.meaning, 300, 370);
  ctx.font = "14px sans-serif";
  ctx.fillStyle = "#CBD5E1";
  const words = (FUN_DESCRIPTIONS[aura.key] || "").split(" ");
  let line = "";
  let y = 420;
  for (const word of words) {
    const test = line + word + " ";
    if (test.length * 8 > 500) {
      ctx.fillText(line, 300, y);
      line = word + " ";
      y += 24;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, 300, y);
  const link = document.createElement("a");
  link.download = `aura-${aura.key}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export function getAuraStats(history) {
  const total = history.length;
  const colorCounts = {};
  history.forEach((h) => {
    colorCounts[h.key] = (colorCounts[h.key] || 0) + 1;
  });
  const favoriteColor = Object.entries(colorCounts).sort((a, b) => b[1] - a[1])[0];
  return { total, colorCounts, favoriteColor: favoriteColor ? favoriteColor[0] : null };
}
