// Composes the pure dataset (getFestivals.js) with live upstream lookups
// (upstream.js) to resolve each festival's authoritative next-occurrence
// date. Only fetches Nager.Date once per unique (country, year) pair across
// the whole batch, however many festivals share that country/year.

import { fetchPublicHolidays } from "./upstream";
import { resolveEstimatedDate, resolveNextOccurrence } from "./dateMath";

export async function resolveLiveDates(festivals, { now = new Date() } = {}) {
  const yearsNeededByCountry = new Map();

  for (const festival of festivals) {
    if (!festival.nagerMatch) continue;
    const estimatedIso = resolveEstimatedDate(festival, { now });
    const estimatedYear = Number(estimatedIso.slice(0, 4));
    const { country } = festival.nagerMatch;
    const years = yearsNeededByCountry.get(country) || new Set();
    [estimatedYear - 1, estimatedYear, estimatedYear + 1].forEach((y) => years.add(y));
    yearsNeededByCountry.set(country, years);
  }

  const fetchTasks = [];
  for (const [country, years] of yearsNeededByCountry.entries()) {
    for (const year of years) {
      fetchTasks.push(
        fetchPublicHolidays(country, year).then((holidays) => ({ country, year, holidays })),
      );
    }
  }

  const fetchResults = await Promise.all(fetchTasks);
  const holidaysByCountry = new Map();
  for (const { country, year, holidays } of fetchResults) {
    if (!holidaysByCountry.has(country)) holidaysByCountry.set(country, {});
    holidaysByCountry.get(country)[year] = holidays;
  }

  const resolved = new Map();
  for (const festival of festivals) {
    const holidaysByYear = festival.nagerMatch ? holidaysByCountry.get(festival.nagerMatch.country) || {} : {};
    resolved.set(festival.slug, resolveNextOccurrence(festival, { now, holidaysByYear }));
  }

  return resolved;
}
