import { seededRandom, slugify } from "../lib/utils";

/** Curated, grouped category seeds — expanded into full Category objects below. */
const GROUPS = [
  {
    group: "Core Formats",
    gradient: ["#8b5cf6", "#6366f1"],
    items: [
      ["Image", "🖼️"], ["Video", "🎬"], ["Short Film", "🎞️"], ["Cinematic", "🎥"],
      ["3D Render", "🧊"], ["3D", "📦"], ["Animation", "✨"], ["Infographics", "📊"], ["Storytelling", "📖"],
    ],
  },
  {
    group: "Photography",
    gradient: ["#3b82f6", "#22d3ee"],
    items: [
      ["Photography", "📷"], ["Ultra Realistic", "🔬"], ["Hyper Realistic", "💎"], ["Macro Photography", "🐝"],
      ["Drone", "🚁"], ["Portrait", "🧑"], ["Landscape", "🏞️"], ["Food Photography", "🍽️"],
      ["Product Photography", "📸"], ["Real Estate", "🏠"], ["Travel", "🧳"], ["Street", "🚦"],
    ],
  },
  {
    group: "Marketing & Social",
    gradient: ["#d946ef", "#8b5cf6"],
    items: [
      ["Commercial Ads", "📣"], ["Marketing", "📈"], ["Branding", "🏷️"], ["Business", "💼"],
      ["YouTube Thumbnail", "▶️"], ["Instagram Post", "📱"], ["TikTok Video", "🎵"], ["LinkedIn Creative", "🔗"],
      ["Facebook Ads", "👍"], ["Google Ads", "🔍"], ["Banner Ads", "🖥️"], ["Poster", "📰"],
    ],
  },
  {
    group: "Commerce & Product",
    gradient: ["#f59e0b", "#ef4444"],
    items: [
      ["Logo", "✳️"], ["Packaging", "📦"], ["Luxury Product", "👑"], ["Perfume", "🧴"], ["Shoes", "👟"],
      ["Jewelry", "💍"], ["Cars", "🚗"], ["Vehicles", "🏎️"], ["Furniture", "🛋️"], ["Fashion", "👗"],
      ["Fashion Editorial", "🕶️"], ["Magazine Cover", "📔"], ["Beauty", "💄"], ["Luxury", "🥂"],
    ],
  },
  {
    group: "Architecture & Interior",
    gradient: ["#10b981", "#14b8a6"],
    items: [
      ["Architecture", "🏛️"], ["Interior Design", "🪑"], ["Interior", "🛏️"], ["Kitchen", "🍳"],
      ["Bedroom", "🛌"], ["Office", "🏢"], ["Exterior", "🏗️"], ["Wedding", "💒"],
    ],
  },
  {
    group: "Healthcare & Medical",
    gradient: ["#06b6d4", "#3b82f6"],
    items: [
      ["Healthcare", "🩺"], ["Medical Illustration", "🧬"], ["Dental", "🦷"], ["Hospital", "🏥"],
      ["Clinic", "➕"], ["Medical Device", "🩻"], ["X-Ray", "☢️"], ["MRI", "🧠"], ["Ultrasound", "👶"],
      ["Surgery", "🔪"], ["Healthcare Illustration", "💉"], ["Medicine Packaging", "💊"], ["Anatomy", "🫀"],
    ],
  },
  {
    group: "Characters & Story",
    gradient: ["#ec4899", "#8b5cf6"],
    items: [
      ["Character Builder", "🦸"], ["Anime", "🌸"], ["Comic", "💥"], ["Children Book", "🧸"],
      ["Kids", "🎈"], ["Cartoon", "😄"], ["Disney Style", "🏰"], ["Pixar Style", "💡"], ["Mascot", "🐻"], ["Script", "🎭"],
    ],
  },
  {
    group: "Art Styles",
    gradient: ["#a855f7", "#6366f1"],
    items: [
      ["Painting", "🎨"], ["Oil Painting", "🖌️"], ["Watercolor", "💧"], ["Pencil", "✏️"], ["Sketch", "📝"],
      ["Line Art", "〰️"], ["Pop Art", "🟡"], ["Minimalist", "◻️"], ["Surreal", "🌀"], ["Concept Art", "🗺️"],
    ],
  },
  {
    group: "Worlds & Genres",
    gradient: ["#6366f1", "#0ea5e9"],
    items: [
      ["Cyberpunk", "🌃"], ["Sci-Fi", "🛸"], ["Fantasy", "🐉"], ["Fantasy World", "🏔️"], ["Steampunk", "⚙️"],
      ["Ancient", "🏺"], ["Historical", "📜"], ["Gaming", "🎮"], ["Pixel Art", "👾"], ["NFT", "🪙"],
      ["Vaporwave", "🌴"], ["Post-Apocalyptic", "☣️"],
    ],
  },
  {
    group: "Festivals & Culture",
    gradient: ["#f43f5e", "#f59e0b"],
    items: [
      ["Festival", "🎉"], ["Diwali", "🪔"], ["Christmas", "🎄"], ["Eid", "🌙"], ["Holi", "🌈"],
      ["Ramadan", "🕌"], ["Ganesh", "🐘"], ["Durga Puja", "🛕"], ["New Year", "🎆"], ["Halloween", "🎃"],
    ],
  },
  {
    group: "Lifestyle & Nature",
    gradient: ["#22c55e", "#84cc16"],
    items: [
      ["Nature", "🌿"], ["Animals", "🦁"], ["Sports", "⚽"], ["Food", "🍔"], ["Education", "🎓"],
      ["Finance", "💰"], ["Cryptocurrency", "₿"], ["Music", "🎧"], ["Fitness", "🏋️"], ["Space", "🌌"],
    ],
  },
];

function buildCategories() {
  const out = [];
  const seen = new Set();
  let idx = 0;
  for (const g of GROUPS) {
    for (const [name, emoji] of g.items) {
      const slug = slugify(name);
      if (seen.has(slug)) continue;
      seen.add(slug);
      const r = seededRandom(slug + "count");
      out.push({
        id: `cat-${idx++}`,
        name,
        slug,
        group: g.group,
        emoji,
        gradient: g.gradient,
        description: `${name} prompts engineered for stunning, consistent AI results.`,
        count: 120 + Math.floor(r * 4800),
        trending: seededRandom(slug + "trend") > 0.78,
      });
    }
  }
  return out;
}

export const CATEGORIES = buildCategories();

export const CATEGORY_GROUPS = GROUPS.map((g) => g.group);

export const CATEGORIES_BY_SLUG = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

export function getCategory(slug) {
  return slug ? CATEGORIES_BY_SLUG[slug] : undefined;
}

export const TRENDING_CATEGORIES = CATEGORIES.filter((c) => c.trending).slice(0, 12);

/** Total prompt count across the platform (for hero stats). */
export const TOTAL_PROMPTS = CATEGORIES.reduce((a, c) => a + c.count, 0);
