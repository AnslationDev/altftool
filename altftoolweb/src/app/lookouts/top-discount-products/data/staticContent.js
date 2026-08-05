import { Flame, TrendingUp, Star, Clock, ShieldCheck, Zap, RefreshCcw, Lock } from "lucide-react";

export const DEAL_HIGHLIGHTS = [
  {
    key: "biggest-discounts",
    icon: Flame,
    title: "Biggest Discounts",
    text: "Deals slashed the deepest, ranked by discount percentage.",
    accent: "amber",
  },
  {
    key: "trending",
    icon: TrendingUp,
    title: "Trending Deals",
    text: "What everyone's buying right now, based on last month's orders.",
    accent: "rose",
  },
  {
    key: "top-rated",
    icon: Star,
    title: "Top Rated Products",
    text: "Highest-rated picks with the most trustworthy reviews.",
    accent: "violet",
  },
  {
    key: "recent",
    icon: Clock,
    title: "Recently Added",
    text: "Freshly scraped deals, updated straight from Amazon.",
    accent: "sky",
  },
];

export const FEATURED_COLLECTIONS = [
  { key: "travel", label: "Travel Deals", categoryKey: "travel", gradient: "from-sky-500 to-cyan-400" },
  { key: "electronics", label: "Electronics", categoryKey: "electronics", gradient: "from-violet-500 to-indigo-400" },
  { key: "home", label: "Home Essentials", categoryKey: "home", gradient: "from-emerald-500 to-teal-400" },
  { key: "fashion", label: "Fashion", categoryKey: "fashion", gradient: "from-rose-500 to-pink-400" },
  { key: "sports", label: "Gaming & Sports", categoryKey: "sports", gradient: "from-orange-500 to-amber-400" },
  { key: "kitchen", label: "Kitchen", categoryKey: "kitchen", gradient: "from-fuchsia-500 to-purple-400" },
];

export const WHY_CHOOSE_US = [
  {
    icon: ShieldCheck,
    title: "Verified Deals",
    text: "Every deal is pulled live from Amazon — no stale prices, no fake discounts.",
  },
  {
    icon: Flame,
    title: "Huge Discounts",
    text: "Only the steepest markdowns make the cut, so you always see real savings.",
  },
  {
    icon: RefreshCcw,
    title: "Daily Updates",
    text: "Fresh deals roll in continuously as prices and stock change on Amazon.",
  },
  {
    icon: Zap,
    title: "Fast Loading",
    text: "A lightweight, optimized grid that browses smoothly on any device.",
  },
  {
    icon: Lock,
    title: "Secure Redirects",
    text: "Every 'View Deal' click opens Amazon directly — nothing routed through us.",
  },
];

export const SORT_OPTIONS = [
  { key: "discount-desc", label: "Highest Discount" },
  { key: "price-asc", label: "Lowest Price" },
  { key: "price-desc", label: "Highest Price" },
  { key: "rating-desc", label: "Highest Rating" },
  { key: "popular", label: "Most Popular" },
  { key: "newest", label: "Newest" },
];

export const RATING_OPTIONS = [
  { key: "4", min: 4, label: "4★ & above" },
  { key: "3", min: 3, label: "3★ & above" },
];

export const DELIVERY_OPTIONS = [
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "week", label: "This Week" },
];

export const STATUS_OPTIONS = [
  { key: "trending", label: "Trending" },
  { key: "featured", label: "Featured" },
  { key: "bestseller", label: "Best Seller" },
  { key: "freeDelivery", label: "Free Delivery" },
];

export const FAQS = [
  {
    question: "Where do these deals come from?",
    answer:
      "Every product on this page is live data scraped directly from Amazon.in's today's-deals listings, refreshed regularly so prices and discounts stay current.",
  },
  {
    question: "Do you sell anything directly?",
    answer:
      "No. Clicking \"View Deal\" takes you straight to the product's Amazon page in a new tab — all purchases happen on Amazon.",
  },
  {
    question: "How often is the deal list updated?",
    answer:
      "The underlying scraper refreshes on a schedule, so new deals and price drops appear automatically without you needing to do anything.",
  },
  {
    question: "Can I filter by category, brand, or discount?",
    answer:
      "Yes — the filter sidebar supports category, brand, discount percentage, price range, rating, delivery speed, and status (trending, featured, bestseller, free delivery), all combinable.",
  },
];

export const PAGE_SIZE = 20;
