import {
  BookOpen,
  Bot,
  Building2,
  Car,
  CircleDollarSign,
  Cpu,
  FlaskConical,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  History,
  Music2,
  Plane,
  Play,
  Shirt,
  Sparkles,
  Telescope,
  TrendingUp,
  Trophy,
  Utensils,
} from "lucide-react";

export const images = {
  world:
    "https://images.pexels.com/photos/35642575/pexels-photo-35642575.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2400",
  moon: "https://images.pexels.com/photos/37779047/pexels-photo-37779047.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1000&w=1800",
  robot:
    "https://images.pexels.com/photos/16544936/pexels-photo-16544936.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1000&w=1800",
  robotHand:
    "https://images.pexels.com/photos/8386369/pexels-photo-8386369.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1000&w=1800",
  library:
    "https://images.pexels.com/photos/28436228/pexels-photo-28436228.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1000&w=1800",
  grandLibrary:
    "https://images.pexels.com/photos/207730/pexels-photo-207730.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1000&w=1800",
  football:
    "https://images.pexels.com/photos/36862523/pexels-photo-36862523.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1000&w=1800",
  stadium:
    "https://images.pexels.com/photos/9935434/pexels-photo-9935434.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1000&w=1800",
  car: "https://images.pexels.com/photos/14901884/pexels-photo-14901884.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1000&w=1800",
  tokyo:
    "https://images.pexels.com/photos/31048512/pexels-photo-31048512.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1000&w=1800",
};

export const rankings = [
  {
    slug: "ai-tools-2026",
    title: "The 11 Best AI Tools Shaping Work in 2026",
    category: "Artificial Intelligence",
    image: images.robot,
    views: "2.8M",
    updated: "2 hours ago",
    accent: "#D9E7FF",
    description:
      "A clear-eyed ranking of the AI products that are changing how the world creates, builds, and decides.",
  },
  {
    slug: "global-universities",
    title: "The World's 11 Most Influential Universities",
    category: "Education",
    image: images.library,
    views: "1.9M",
    updated: "Yesterday",
    accent: "#E9DFD1",
    description:
      "Institutions with exceptional research, teaching, global impact, and enduring intellectual influence.",
  },
  {
    slug: "football-players",
    title: "The 11 Greatest Football Players Right Now",
    category: "Sport",
    image: images.football,
    views: "4.6M",
    updated: "Today",
    accent: "#DDE6D6",
    description:
      "Form, influence, consistency, and the numbers behind the players defining the modern game.",
  },
  {
    slug: "electric-cars",
    title: "11 Electric Cars That Move the Industry Forward",
    category: "Automotive",
    image: images.car,
    views: "948K",
    updated: "3 days ago",
    accent: "#DDE2E7",
    description:
      "The strongest all-around electric vehicles, judged on design, range, technology, and daily usability.",
  },
  {
    slug: "cities-after-dark",
    title: "The 11 Most Magnetic Cities After Dark",
    category: "Travel",
    image: images.tokyo,
    views: "1.4M",
    updated: "4 days ago",
    accent: "#D8D5E9",
    description:
      "Cities where food, culture, architecture, and energy create unforgettable nights.",
  },
  {
    slug: "space-agencies",
    title: "The 11 Space Agencies Expanding Our Horizon",
    category: "Science",
    image: images.moon,
    views: "875K",
    updated: "1 week ago",
    accent: "#DBE3EE",
    description:
      "The organizations advancing exploration, observation, and our understanding of the universe.",
  },
];

export const categoryItems = [
  { name: "Technology", icon: Cpu, count: "12.4K" },
  { name: "Artificial Intelligence", icon: Bot, count: "8.1K" },
  { name: "Business", icon: Building2, count: "10.8K" },
  { name: "Finance", icon: CircleDollarSign, count: "7.2K" },
  { name: "Education", icon: GraduationCap, count: "6.5K" },
  { name: "Sports", icon: Trophy, count: "18.3K" },
  { name: "Gaming", icon: Gamepad2, count: "9.7K" },
  { name: "Travel", icon: Plane, count: "15.6K" },
  { name: "Health", icon: HeartPulse, count: "8.8K" },
  { name: "Science", icon: FlaskConical, count: "5.4K" },
  { name: "Movies", icon: Play, count: "21.2K" },
  { name: "Music", icon: Music2, count: "17.9K" },
  { name: "Books", icon: BookOpen, count: "14.1K" },
  { name: "History", icon: History, count: "4.8K" },
  { name: "Food", icon: Utensils, count: "11.7K" },
  { name: "Lifestyle", icon: Sparkles, count: "13.5K" },
  { name: "Automotive", icon: Car, count: "7.8K" },
  { name: "Startups", icon: TrendingUp, count: "6.2K" },
  { name: "Space", icon: Telescope, count: "2.9K" },
  { name: "Fashion", icon: Shirt, count: "9.3K" },
];

export const countries = [
  ["IN", "India", "6,430"],
  ["US", "United States", "18,240"],
  ["JP", "Japan", "5,680"],
  ["DE", "Germany", "4,920"],
  ["CA", "Canada", "3,740"],
  ["AU", "Australia", "3,210"],
  ["FR", "France", "4,380"],
  ["IT", "Italy", "3,850"],
  ["BR", "Brazil", "3,090"],
  ["KR", "South Korea", "3,560"],
  ["GB", "United Kingdom", "5,710"],
];

export const aiEntries = [
  {
    name: "ChatGPT",
    company: "OpenAI",
    score: "9.7",
    best: "Best overall",
    fact: "The strongest all-purpose AI workspace for writing, analysis, coding, and multimodal tasks.",
  },
  {
    name: "Claude",
    company: "Anthropic",
    score: "9.5",
    best: "Best for deep work",
    fact: "A thoughtful assistant with outstanding long-context reasoning and a calm, focused interface.",
  },
  {
    name: "Gemini",
    company: "Google",
    score: "9.3",
    best: "Best ecosystem",
    fact: "Deeply connected to Google's productivity suite, search intelligence, and multimodal models.",
  },
  {
    name: "Perplexity",
    company: "Perplexity AI",
    score: "9.1",
    best: "Best for research",
    fact: "Fast, source-aware discovery that turns complex web research into an intelligible starting point.",
  },
  {
    name: "Midjourney",
    company: "Midjourney",
    score: "9.0",
    best: "Best for imagery",
    fact: "Exceptional visual taste and expressive control for concepting, art direction, and image generation.",
  },
  {
    name: "Cursor",
    company: "Anysphere",
    score: "8.9",
    best: "Best for coding",
    fact: "An AI-native code editor that makes large codebases easier to understand, change, and navigate.",
  },
  {
    name: "Notion AI",
    company: "Notion",
    score: "8.7",
    best: "Best for knowledge",
    fact: "Brings answers, drafting, and automation directly into a connected workspace.",
  },
  {
    name: "Runway",
    company: "Runway AI",
    score: "8.6",
    best: "Best for video",
    fact: "A refined creative suite for generating, transforming, and finishing short-form video.",
  },
  {
    name: "ElevenLabs",
    company: "ElevenLabs",
    score: "8.5",
    best: "Best for voice",
    fact: "Natural speech generation with an unusually broad range of voices, languages, and controls.",
  },
  {
    name: "Granola",
    company: "Granola",
    score: "8.3",
    best: "Best for meetings",
    fact: "A beautifully simple notepad that turns rough meeting notes into useful, structured records.",
  },
  {
    name: "Canva Magic Studio",
    company: "Canva",
    score: "8.2",
    best: "Best for teams",
    fact: "Approachable AI design tools that help non-specialists move from idea to polished asset quickly.",
  },
];

export const entryNamesByCategory = {
  Education: [
    "MIT",
    "Stanford University",
    "University of Oxford",
    "Harvard University",
    "University of Cambridge",
    "ETH Zurich",
    "Caltech",
    "Imperial College London",
    "UCL",
    "National University of Singapore",
    "Tsinghua University",
  ],
  Sport: [
    "Kylian Mbappe",
    "Erling Haaland",
    "Vinicius Junior",
    "Jude Bellingham",
    "Mohamed Salah",
    "Harry Kane",
    "Rodri",
    "Lamine Yamal",
    "Bukayo Saka",
    "Lautaro Martinez",
    "Jamal Musiala",
  ],
  Automotive: [
    "Tesla Model 3",
    "Hyundai Ioniq 5",
    "Porsche Taycan",
    "Kia EV9",
    "Lucid Air",
    "BMW i4",
    "Rivian R1S",
    "Polestar 3",
    "Volvo EX30",
    "Mercedes EQS",
    "Ford Mustang Mach-E",
  ],
  Travel: [
    "Tokyo",
    "Seoul",
    "Paris",
    "Mexico City",
    "New York",
    "Barcelona",
    "Bangkok",
    "London",
    "Berlin",
    "Buenos Aires",
    "Singapore",
  ],
  Science: [
    "NASA",
    "European Space Agency",
    "JAXA",
    "ISRO",
    "CNSA",
    "Canadian Space Agency",
    "CNES",
    "DLR",
    "Italian Space Agency",
    "Korea AeroSpace Administration",
    "UK Space Agency",
  ],
};

export const searchItems = [
  ...rankings.map((item) => ({
    label: item.title,
    meta: item.category,
    type: "ranking",
    slug: item.slug,
  })),
  ...categoryItems.map((item) => ({
    label: item.name,
    meta: `${item.count} rankings`,
    type: "category",
    slug: item.name.toLowerCase().replace(/ /g, "-"),
  })),
  ...countries.map((item) => ({
    label: item[1],
    meta: `${item[2]} country rankings`,
    type: "country",
    slug: item[1].toLowerCase().replace(/ /g, "-"),
  })),
];

/* ─────────────────── Lookups used by the route files ─────────────────── */

export const toSlug = (value) => String(value).toLowerCase().replace(/ /g, "-");

/** Every category + country slug the section renders, plus the "trending" view. */
export const categorySlugs = [
  "trending",
  ...categoryItems.map((item) => toSlug(item.name)),
  ...countries.map(([, name]) => toSlug(name)),
];

export function getRanking(slug) {
  return rankings.find((item) => item.slug === slug) || null;
}

/**
 * Category, country and "trending" all render the same index view, so one
 * resolver turns any slug into a display title and a count. An unknown slug is
 * titled from its own words rather than 404ing — this view is a filtered index,
 * not a unique document.
 */
export function resolveCategory(slug) {
  if (slug === "trending") return { title: "Trending", count: "12,428" };

  const category = categoryItems.find((item) => toSlug(item.name) === slug);
  if (category) return { title: category.name, count: category.count };

  const country = countries.find(([, name]) => toSlug(name) === slug);
  if (country) return { title: country[1], count: country[2] };

  return {
    title: slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    count: "12,428",
  };
}

const SUBJECT_LABELS = {
  "Artificial Intelligence": "tools",
  Education: "institutions",
  Sport: "players",
  Travel: "cities",
  Science: "agencies",
  Automotive: "vehicles",
};

/** The noun a ranking's entries are ("tools", "players", …). */
export function getSubjectLabel(ranking) {
  return SUBJECT_LABELS[ranking?.category] || "entries";
}

/**
 * The eleven ranked entries for a ranking. The AI list is the fully written
 * one; the others reuse its scoring shape with their own subject names — which
 * is exactly why this section is not indexable (see ./indexPolicy.js).
 */
export function getRankingEntries(ranking) {
  if (!ranking) return [];
  if (ranking.slug === "ai-tools-2026") return aiEntries;

  const names = entryNamesByCategory[ranking.category] || entryNamesByCategory.Automotive;
  return aiEntries.map((entry, index) => ({
    ...entry,
    name: names[index],
    company: ranking.category,
    fact: `${names[index]} stands out for category leadership, broad influence, and a consistently excellent real-world experience.`,
  }));
}
