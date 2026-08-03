/**
 * Static page furniture for the /top10 landing page: which category chips
 * the hero marquee offers, which "Popular:" tags it shows, and how the five
 * Explore Universe tiles group the products. No rankings or item data lives
 * here — every list on the page is fetched at request time from that
 * product's own /api/top10/<product> route (see data/productRegistry.js).
 *
 * Every id below must match a PRODUCT_REGISTRY entry's categoryId. A chip
 * pointing at a product that does not exist is inert: Top10Client's
 * handleCategorySelect returns early when no product matches.
 */

export const CATEGORY_STRIP = [
  { id: "books", label: "Books", icon: "BookOpen" },
  { id: "music", label: "Music", icon: "Music4" },
  { id: "ai-tools", label: "AI Tools", icon: "Bot" },
  { id: "travel", label: "Travel", icon: "Plane" },
  { id: "anime", label: "Anime", icon: "Tv" },
  { id: "restaurants", label: "Restaurants", icon: "UtensilsCrossed" },
  { id: "food", label: "Food", icon: "ChefHat" },
  { id: "drinks", label: "Top Drinks", icon: "Martini" },
  { id: "crypto", label: "Crypto", icon: "Bitcoin" },
  { id: "dogs", label: "Dogs", icon: "Dog" },
  { id: "cats", label: "Cats", icon: "Cat" },
  { id: "pokemon", label: "Pokemon", icon: "Zap" },
  { id: "famous-people", label: "Famous People", icon: "Users" },
];

export const POPULAR_SEARCHES = [
  "Best AI Tools",
  "Travel Destinations",
  "Top Anime",
  "Famous People",
];

// Each "Popular:" tag names a real category, not a free-text phrase — so
// clicking one should jump straight to that product (same as a hero chip),
// not run it through the generic multi-category search (whose live search
// APIs often don't match a marketing-style phrase like "Best AI Tools"
// verbatim, surfacing an unrelated category instead). Every tag here maps
// to a product that exists; a tag with no entry would still fall through
// to a normal global search rather than doing nothing.
export const POPULAR_SEARCH_CATEGORY = {
  "Best AI Tools": "ai-tools",
  "Travel Destinations": "travel",
  "Top Anime": "anime",
  "Famous People": "famous-people",
};

/**
 * Which real products belong to each "universe" tile — shared between the
 * client (Top10Client) and server (the universe-highlight API route) so
 * both agree on the exact same grouping. Not a strict partition (a product
 * could arguably fit two universes); each one just gets a single primary home.
 */
export const UNIVERSE_PRODUCT_KEYS = {
  entertainment: ["anime", "music"],
  technology: ["ai-tools", "crypto", "pokemon"],
  lifestyle: ["places", "food", "restaurants", "drinks", "dogs", "cats"],
  knowledge: ["books"],
  "people-culture": ["famous-people"],
};

export const UNIVERSES = [
  {
    id: "entertainment",
    title: "Entertainment",
    description: "Anime, Music & More",
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80",
    icon: "Clapperboard",
  },
  {
    id: "technology",
    title: "Technology",
    description: "Gadgets, Tools, Software",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    icon: "Cpu",
  },
  {
    id: "lifestyle",
    title: "Lifestyle",
    description: "Travel, Food, Health, Fashion",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80",
    icon: "Plane",
  },
  {
    id: "knowledge",
    title: "Knowledge",
    description: "Books, Education, Facts",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80",
    icon: "BookOpen",
  },
  {
    id: "people-culture",
    title: "People & Culture",
    description: "Influencers, Creators, History",
    image:
      "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=600&q=80",
    icon: "Users",
  },
];
