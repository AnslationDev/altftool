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
  { title: "Portrait Studies", description: "Sample portrait patterns for experimenting with skin, eyes, framing and light." },
  { title: "Neon & Nightlife", description: "Sample cyberpunk street, neon-sign and rain-reflection prompt patterns." },
  { title: "Clean Product Studio", description: "Sample minimal product-shot structures with editable lighting and surfaces." },
  { title: "Dreamlike Landscapes", description: "Sample structures for otherworldly vistas and imaginative skies." },
  { title: "Motion & Cinematics", description: "Sample text-to-video structures to adapt for Runway, Luma or Kling." },
  { title: "Festival Concepts", description: "Sample celebratory scene structures with editable subjects, palettes and settings." },
];

export const COLLECTIONS = COLLECTION_SEEDS.map((c, i) => ({
  id: `col-${i}`,
  title: c.title,
  slug: c.title.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, ""),
  description: c.description,
  seed: `col${i}`,
}));
