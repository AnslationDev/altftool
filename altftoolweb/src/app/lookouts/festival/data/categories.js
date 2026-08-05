// Festival category taxonomy for the Festival Explorer.
// `icon` is a lucide-react icon key resolved by components/iconMap.js.

export const CATEGORIES = [
  { slug: "religious", name: "Religious", icon: "sparkle", tint: "gray" },
  { slug: "national", name: "National", icon: "flag", tint: "gray" },
  { slug: "cultural", name: "Cultural", icon: "music-4", tint: "peach" },
  { slug: "seasonal", name: "Seasonal", icon: "sun", tint: "gray" },
  { slug: "harvest", name: "Harvest", icon: "wheat", tint: "peach" },
  { slug: "music", name: "Music", icon: "headphones", tint: "gray" },
  { slug: "food", name: "Food", icon: "utensils", tint: "peach" },
  { slug: "international-days", name: "International Days", icon: "globe-2", tint: "gray" },
  { slug: "traditional", name: "Traditional", icon: "heart", tint: "peach" },
  { slug: "new-year", name: "New Year", icon: "sparkles", tint: "gray" },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

export function getCategory(slug) {
  return CATEGORY_MAP[slug] || null;
}
