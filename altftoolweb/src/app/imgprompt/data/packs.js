import { CREATORS } from "./creators";
import { seededRandom } from "../lib/utils";

const PACK_SEEDS = [
  { title: "Cinematic Film Director Pack", description: "120 cinematic prompts with camera moves, lighting recipes and color grades for Runway, Luma & Kling.", category: "cinematic", count: 120, price: 24, original: 39, tags: ["Cinematic", "Video", "Film"] },
  { title: "Luxury Product Photography Vault", description: "Studio-grade product hero prompts for perfume, watches, cosmetics & tech.", category: "product-photography", count: 90, price: 19, original: 29, tags: ["Product", "Commercial", "Luxury"] },
  { title: "Anime Character Universe", description: "Build consistent anime characters, expressions and key visuals in any style.", category: "anime", count: 150, price: 22, tags: ["Anime", "Character", "Illustration"] },
  { title: "Architecture & Interior Master", description: "Exterior, interior and blue-hour viz prompts that look like a render farm made them.", category: "architecture", count: 80, price: 26, original: 34, tags: ["Architecture", "Interior", "Real Estate"] },
  { title: "Viral Thumbnail Machine", description: "High-CTR YouTube thumbnail prompts engineered with the trend + viral engine.", category: "youtube-thumbnail", count: 60, price: 15, tags: ["YouTube", "Marketing", "Social"] },
  { title: "Healthcare Illustration Suite", description: "Accurate, trustworthy medical & anatomical illustration prompts for clinics and pharma.", category: "medical-illustration", count: 70, price: 29, tags: ["Healthcare", "Medical", "Illustration"] },
  { title: "Fantasy Worldbuilder", description: "Epic environments, creatures and heroes for games and books.", category: "fantasy", count: 140, price: 21, original: 32, tags: ["Fantasy", "Concept Art", "Gaming"] },
  { title: "Festival & Culture Collection", description: "Diwali, Christmas, Eid, Holi & more — celebratory prompts bursting with color.", category: "festival", count: 100, price: 17, tags: ["Festival", "Culture", "Marketing"] },
];

export const PACKS = PACK_SEEDS.map((p, i) => {
  const r = (k) => seededRandom(p.title + k);
  return {
    id: `pack-${i}`,
    title: p.title,
    slug: p.title.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, ""),
    description: p.description,
    promptCount: p.count,
    price: p.price,
    originalPrice: p.original,
    categorySlug: p.category,
    seed: `pack${i}`,
    tags: p.tags,
    rating: 4.6 + r("rt") * 0.4,
    sales: 200 + Math.floor(r("s") * 8000),
    author: CREATORS[Math.floor(r("a") * CREATORS.length)],
    featured: i < 4,
  };
});

const COLLECTION_SEEDS = [
  { title: "Editor's Picks: July", description: "The 40 highest-scoring prompts our editors couldn't stop rendering.", count: 40, curator: "Imaginnex Editors", gradient: ["#8b5cf6", "#3b82f6"] },
  { title: "Hyperreal Portraits", description: "Skin, eyes and light so real it's uncanny.", count: 32, curator: "Aria Snow", gradient: ["#ec4899", "#8b5cf6"] },
  { title: "Neon & Nightlife", description: "Cyberpunk streets, neon signs and rain-soaked reflections.", count: 28, curator: "Theo Laurent", gradient: ["#22d3ee", "#6366f1"] },
  { title: "Clean Product Studio", description: "Minimal, bright, license-ready product shots.", count: 36, curator: "Marcus Cole", gradient: ["#f59e0b", "#ef4444"] },
  { title: "Dreamlike Landscapes", description: "Otherworldly vistas and impossible skies.", count: 30, curator: "Yuki Tanaka", gradient: ["#10b981", "#14b8a6"] },
  { title: "Motion & Cinematics", description: "The best text-to-video prompts for Runway, Luma & Kling.", count: 24, curator: "Lucia Ferreira", gradient: ["#f43f5e", "#f59e0b"] },
];

export const COLLECTIONS = COLLECTION_SEEDS.map((c, i) => ({
  id: `col-${i}`,
  title: c.title,
  slug: c.title.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, ""),
  description: c.description,
  promptCount: c.count,
  curator: c.curator,
  seed: `col${i}`,
  gradient: c.gradient,
}));
