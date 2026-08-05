// Lookouts product registry.
//
// This is the single source of truth for the /lookouts dashboard.
// To add a new lookout product, create its folder under src/app/lookouts/<slug>/
// and append one entry here.
//
// Fields:
//   slug        folder name under src/app/lookouts/ (also the React key)
//   name        display name
//   tagline     one short line shown under the name
//   description 1–2 sentences describing what the product does
//   href        route to open
//   status      "live" | "beta" | "planned"
//   accent      icon tile colour: sky | amber | violet | emerald | rose
//   icon        key resolved to a lucide icon

export const LOOKOUTS_PRODUCTS = [
  {
    slug: "festival",
    name: "Festival",
    tagline: "Discover festivals worldwide",
    description:
      "Explore and discover festivals from around the world. Find events by category, location, and date to plan your next adventure.",
    href: "/lookouts/festival",
    status: "live",
    accent: "sky",
    icon: "music",
  },
  {
    slug: "top-discount-products",
    name: "Top Discount Products",
    tagline: "Best deals and discounts",
    description:
      "Find and compare the best discount products and deals across multiple categories. Save money on everything you need.",
    href: "/lookouts/top-discount-products",
    status: "live",
    accent: "amber",
    icon: "tags",
  },
  {
    slug: "ai-prompt-studio",
    name: "AI Prompt Studio",
    tagline: "Create with AI prompts",
    description:
      "Design and generate creative content with AI-powered prompt templates. Perfect for artists, writers, and creators.",
    href: "/imgprompt",
    status: "live",
    accent: "violet",
    icon: "sparkles",
  },
  {
    slug: "ai-bundles",
    name: "AI Bundle",
    tagline: "AI tools collection",
    description:
      "Access a comprehensive bundle of AI tools designed to boost productivity. All your AI needs in one place.",
    href: "/lookouts/ai-bundles",
    status: "live",
    accent: "emerald",
    icon: "package",
  },
  {
    slug: "free-ai-tool",
    name: "Free AI Tool",
    tagline: "Free AI utilities",
    description:
      "Explore our collection of free AI-powered tools for everyday tasks. No subscription required — start using them now.",
    href: "/lookouts/free-ai-tool",
    status: "live",
    accent: "rose",
    icon: "bot",
  },
];

export const STATUS_META = {
  live: { label: "Live", tone: "live" },
  beta: { label: "Beta", tone: "beta" },
  planned: { label: "In development", tone: "planned" },
};

export function getLookupsStats(products = LOOKOUTS_PRODUCTS) {
  const live = products.filter((p) => p.status === "live").length;
  const beta = products.filter((p) => p.status === "beta").length;
  const planned = products.filter((p) => p.status === "planned").length;

  return { total: products.length, live, beta, planned };
}
