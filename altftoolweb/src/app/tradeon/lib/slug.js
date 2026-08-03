// src/app/tradeon/lib/slug.js
// SEO-friendly slug helpers for Tradeon detail routes (news, predictions, weekly
// outlook). Slugs are generated from human titles and resolved back to the
// underlying record. Stock-based slugs are deterministic and unique per symbol;
// news slugs derive from the article title (matched case-insensitively).

import { OUTLOOK_STOCKS } from "./outlookStocks";

// "Reliance Industries Q1 Results!" -> "reliance-industries-q1-results"
export function slugify(text = "") {
  return String(text)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/* ---------------- News ---------------- */
export const newsSlug = (article) => slugify(article?.title || "") || (article?.id || "");
// Given a slug and the article list, find the matching article (by slugified title).
export function findNewsBySlug(articles, slug) {
  if (!slug) return null;
  const s = String(slug).toLowerCase();
  return articles.find((a) => slugify(a.title) === s) || articles.find((a) => a.id === s) || null;
}

/* ---------------- Stock-based (Predictions + Weekly Outlook) ---------------- */
// Display name for a stock symbol (falls back to the symbol).
export function stockName(symbol) {
  return OUTLOOK_STOCKS.find((s) => s.symbol === symbol)?.name || symbol;
}

// "TCS" -> "tata-consultancy-services-share-price-prediction"
export const predictionSlug = (symbol) => `${slugify(stockName(symbol))}-share-price-prediction`;
// "HDFCBANK" -> "hdfc-bank-weekly-outlook"
export const outlookSlug = (symbol) => `${slugify(stockName(symbol))}-weekly-outlook`;

// Resolve a slug back to a symbol. Works for both suffixed stock slugs and a bare
// symbol/name (so old links and hand-typed symbols still resolve).
function resolveStockSlug(slug, suffix) {
  if (!slug) return null;
  const s = String(slug).toLowerCase();
  const bare = s.replace(new RegExp(`-?${suffix}$`), "");
  // exact symbol match (e.g. someone hits /predictions/TCS)
  const bySym = OUTLOOK_STOCKS.find((x) => x.symbol.toLowerCase() === bare || x.symbol.toLowerCase() === s);
  if (bySym) return bySym.symbol;
  // by slugified name
  const byName = OUTLOOK_STOCKS.find((x) => slugify(x.name) === bare);
  return byName ? byName.symbol : null;
}
export const symbolFromPredictionSlug = (slug) => resolveStockSlug(slug, "share-price-prediction");
export const symbolFromOutlookSlug = (slug) => resolveStockSlug(slug, "weekly-outlook");
