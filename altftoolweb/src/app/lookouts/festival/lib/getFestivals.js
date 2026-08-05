// Pure, synchronous query helpers over the local curated dataset
// (data/festivals.js). No network calls here — see lib/upstream.js for
// live data and lib/dateMath.js for date resolution.

import { FESTIVALS, getFestivalBySlug as getFestivalBySlugFromData } from "../data/festivals";
import { RELIGIONS } from "../data/religions";
import { CATEGORIES } from "../data/categories";
import { resolveEstimatedDate } from "./dateMath";

export function getAllFestivals() {
  return FESTIVALS;
}

export function getFestivalBySlug(slug) {
  return getFestivalBySlugFromData(slug);
}

export function getFestivalsByReligion(religionSlug) {
  return FESTIVALS.filter((f) => f.religion === religionSlug);
}

export function getFestivalsByCategory(categorySlug) {
  return FESTIVALS.filter((f) => f.category === categorySlug);
}

export function getFestivalsByCountry(countryCode) {
  const upper = (countryCode || "").toUpperCase();
  return FESTIVALS.filter((f) => f.countryCodes.includes(upper));
}

export function getFestivalsByMonth(monthNumber) {
  return FESTIVALS.filter((f) => f.month === Number(monthNumber));
}

export function searchFestivals(query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return FESTIVALS;

  return FESTIVALS.filter((f) => {
    const haystack = [f.name, ...(f.altNames || []), f.regionLabel, f.religion, f.category]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function getRelatedFestivals(festival, { limit = 4 } = {}) {
  if (!festival) return [];

  const scored = FESTIVALS.filter((f) => f.slug !== festival.slug).map((f) => {
    let score = 0;
    if (f.religion === festival.religion) score += 3;
    if (f.category === festival.category) score += 2;
    if (f.countryCodes.some((c) => festival.countryCodes.includes(c))) score += 1;
    return { festival: f, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.festival);
}

// Sorted soonest-first by estimated date (local dataset only — pages can
// live-upgrade the top candidates' exact dates via lib/upstream.js).
export function getUpcomingFestivals({ now = new Date(), limit = 12 } = {}) {
  return [...FESTIVALS]
    .map((festival) => ({ festival, estimatedIso: resolveEstimatedDate(festival, { now }) }))
    .sort((a, b) => (a.estimatedIso < b.estimatedIso ? -1 : a.estimatedIso > b.estimatedIso ? 1 : 0))
    .slice(0, limit)
    .map((entry) => entry.festival);
}

export function getFeaturedFestival({ now = new Date() } = {}) {
  const [first] = getUpcomingFestivals({ now, limit: 1 });
  return first || FESTIVALS[0];
}

export function computeRealStats() {
  const countryCodes = new Set(FESTIVALS.flatMap((f) => f.countryCodes));
  const religionsUsed = new Set(FESTIVALS.map((f) => f.religion));

  return {
    festivals: FESTIVALS.length,
    countries: countryCodes.size,
    religions: religionsUsed.size,
    categories: CATEGORIES.length,
  };
}

export function getAllCountryCodesUsed() {
  return Array.from(new Set(FESTIVALS.flatMap((f) => f.countryCodes))).sort();
}

export { RELIGIONS, CATEGORIES };
