// ============================================================
// TOP8 — Data service layer (frontend-only mock data flow)
// Every page reads from here — swap these functions for real
// API calls later without touching the UI.
// ============================================================

import { ARTICLES, AUTHORS, CATEGORIES, COLLECTIONS, COUNTRIES, GUIDE_TIPS, IMGS, img as imgFn } from "./content";
import { RANKINGS } from "./rankings";

export const img = imgFn;
export const IMGS_MAP = IMGS;

// ---------- formatters ----------
export const k = (n) => (n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1).replace(".0", "")}k` : `${n}`);
export const initials = (name = "") => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

// ---------- categories ----------
export const allCategories = () => CATEGORIES;
export const getCategory = (slug) => CATEGORIES.find((c) => c.slug === slug);
export const categoryName = (slug) => getCategory(slug)?.name || slug;

// ---------- rankings ----------
export const allRankings = () => RANKINGS;
export const getRanking = (slug) => RANKINGS.find((r) => r.slug === slug);
export const rankingsByCategory = (cat) => RANKINGS.filter((r) => r.cat === cat);
export const rankingsBySub = (cat, sub) => (sub === "all" ? rankingsByCategory(cat) : rankingsByCategory(cat).filter((r) => r.sub === sub));
export const rankingScore = (r) => r.items[0]?.score || 0;

export const getTrending = (n = 6) => RANKINGS.filter((r) => r.trending).sort((a, b) => b.pop - a.pop).slice(0, n);
export const getFeatured = (n = 4) => RANKINGS.filter((r) => r.featured).slice(0, n);
export const getEditorsPicks = (n = 3) => RANKINGS.filter((r) => r.editorsPick).slice(0, n);
export const getLatest = (n = 6) => [...RANKINGS].sort((a, b) => b.ts - a.ts).slice(0, n);
export const getPopular = (n = 6) => [...RANKINGS].sort((a, b) => b.views - a.views).slice(0, n);
export const getMostSaved = (n = 4) => [...RANKINGS].sort((a, b) => b.saves - a.saves).slice(0, n);

export const getRelated = (slug, n = 3) => {
  const r = getRanking(slug);
  if (!r) return getPopular(n);
  const same = RANKINGS.filter((x) => x.cat === r.cat && x.slug !== slug);
  const rest = RANKINGS.filter((x) => x.cat !== r.cat).sort((a, b) => b.pop - a.pop);
  return [...same, ...rest].slice(0, n);
};

export const SORTS = [
  { id: "popular", label: "Most popular" },
  { id: "newest", label: "Newest" },
  { id: "rated", label: "Highest rated" },
  { id: "az", label: "A to Z" },
];
export const sortRankings = (list, mode) => {
  const l = [...list];
  if (mode === "newest") return l.sort((a, b) => b.ts - a.ts);
  if (mode === "rated") return l.sort((a, b) => rankingScore(b) - rankingScore(a));
  if (mode === "az") return l.sort((a, b) => a.title.localeCompare(b.title));
  return l.sort((a, b) => b.pop - a.pop);
};

// ---------- ranking detail helpers ----------
export const winnerOf = (r) => r.items[0];
export const buildFaqs = (r) =>
  r.faqs || [
    { q: `What is the best in ${r.title.toLowerCase().replace(/^the 8 best /, "")}?`, a: `${r.items[0].name} is our top pick for 2025, scoring ${r.items[0].score}/10 in our tests. ${r.items[0].verdict}` },
    { q: "How did TOP8 rank these?", a: `Our editors compared the full field on quality, value and real-world experience, then scored each entry out of 10. ${r.items[0].name} took the top spot, with ${r.items[1].name} close behind at ${r.items[1].score}.` },
    { q: "How often is this ranking updated?", a: `This guide was last updated on ${r.updated}. We re-test the top entries quarterly and re-rank whenever the field shifts meaningfully.` },
    { q: "Why only eight entries?", a: "A list of 25 is not a recommendation — it is homework. We research broadly and then commit to the eight options genuinely worth your attention." },
  ];
export const guideTipsFor = (r) => GUIDE_TIPS[r.cat] || GUIDE_TIPS.default;
export const whoShouldFor = (r) => r.items.slice(0, 4).map((it, i) => ({
  persona: ["If you want the safest choice", "If you want the alternative", "If you prioritise value", "If you want something different"][i],
  pick: it.name,
  why: it.best,
}));

// ---------- collections ----------
export const allCollections = () => COLLECTIONS.map((c) => ({ ...c, resolved: c.rankingSlugs.map(getRanking).filter(Boolean) }));
export const getCollection = (slug) => allCollections().find((c) => c.slug === slug);

// ---------- countries ----------
export const allCountries = () => COUNTRIES;
export const getCountry = (slug) => {
  const c = COUNTRIES.find((x) => x.slug === slug);
  return c ? { ...c, resolved: c.rankingSlugs.map(getRanking).filter(Boolean) } : undefined;
};

// ---------- authors ----------
export const allAuthors = () => AUTHORS;
export const getAuthor = (slug) => {
  const a = AUTHORS.find((x) => x.slug === slug);
  return a ? { ...a, rankings: RANKINGS.filter((r) => r.author === slug), articles: ARTICLES.filter((x) => x.author === slug) } : undefined;
};
export const authorName = (slug) => AUTHORS.find((a) => a.slug === slug);

// ---------- articles ----------
export const allArticles = () => ARTICLES;
export const latestArticles = (n = 3) => ARTICLES.slice(0, n);

// ---------- search (frontend filter over mock data) ----------
const match = (text, q) => text.toLowerCase().includes(q);
export const searchAll = (raw) => {
  const q = raw.trim().toLowerCase();
  if (q.length < 2) return null;
  const rankings = RANKINGS.filter((r) => match(r.title, q) || match(categoryName(r.cat), q) || r.items.some((i) => match(i.name, q)));
  const categories = CATEGORIES.filter((c) => match(c.name, q));
  const collections = COLLECTIONS.filter((c) => match(c.name, q));
  const articles = ARTICLES.filter((a) => match(a.title, q));
  const countries = COUNTRIES.filter((c) => match(c.name, q));
  return { q, rankings, categories, collections, articles, countries, empty: !rankings.length && !categories.length && !collections.length && !articles.length && !countries.length };
};

// ---------- bookmarks (localStorage-backed) ----------
const KEY = "top8_saved_v1";
export const loadSaved = () => { if (typeof window === "undefined") return []; try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
export const persistSaved = (ids) => { if (typeof window === "undefined") return; try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {} };
