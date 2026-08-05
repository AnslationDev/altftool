// Topic categories shown in the Top5 "Every field. One standard." grid and
// the standalone /top5/categories directory. Self-contained to this section.

const categories = [
  { slug: "technology", name: "Technology", icon: "Cpu", count: "24.6K" },
  { slug: "artificial-intelligence", name: "Artificial Intelligence", icon: "Bot", count: "19.4K" },
  { slug: "business", name: "Business", icon: "Building2", count: "16.8K" },
  { slug: "finance", name: "Finance", icon: "CircleDollarSign", count: "12.1K" },
  { slug: "education", name: "Education", icon: "GraduationCap", count: "8.9K" },
  { slug: "movies", name: "Movies", icon: "Clapperboard", count: "21.2K" },
  { slug: "music", name: "Music", icon: "Music", count: "17.9K" },
  { slug: "books", name: "Books", icon: "BookOpen", count: "14.1K" },
  { slug: "history", name: "History", icon: "Landmark", count: "4.8K" },
  { slug: "food", name: "Food", icon: "UtensilsCrossed", count: "11.7K" },
  { slug: "lifestyle", name: "Lifestyle", icon: "Sparkles", count: "13.5K" },
  { slug: "automotive", name: "Automotive", icon: "Car", count: "7.8K" },
  { slug: "startups", name: "Startups", icon: "TrendingUp", count: "6.2K" },
  { slug: "space", name: "Space", icon: "Rocket", count: "2.9K" },
  { slug: "fashion", name: "Fashion", icon: "Shirt", count: "9.3K" },
];

export function getAllCategories() {
  return categories;
}

export function getCategory(slug) {
  return categories.find((category) => category.slug === slug) || null;
}

export default categories;
