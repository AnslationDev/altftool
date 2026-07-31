const API_URL = "https://raw.githubusercontent.com/mledoze/countries/master/countries.json";

const CACHE_KEY = "altft_country_quiz_cache_v2";
const CACHE_TTL = 24 * 60 * 60 * 1000;

let memoryCache = null;

function readDiskCache() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeDiskCache(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

function flagUrl(cca2) {
  if (!cca2) return "";
  return `https://flagcdn.com/w320/${cca2.toLowerCase()}.png`;
}

function flagSvgUrl(cca2) {
  if (!cca2) return "";
  return `https://flagcdn.com/${cca2.toLowerCase()}.svg`;
}

function normalizeCountry(c) {
  const name = c.name?.common || "Unknown";
  const official = c.name?.official || name;
  const capital = Array.isArray(c.capital) ? c.capital[0] : c.capital || "";
  const region = c.region || "";
  const subregion = c.subregion || "";
  const area = c.area || 0;
  const languages = c.languages ? Object.values(c.languages) : [];
  const currencies = c.currencies
    ? Object.entries(c.currencies).map(([code, info]) => ({ code, name: info.name || code, symbol: info.symbol || "" }))
    : [];
  const borders = c.borders || [];
  const cca2 = c.cca2 || "";
  const cca3 = c.cca3 || "";
  const callingCode = c.idd?.root
    ? c.idd.root + (Array.isArray(c.idd.suffixes) ? c.idd.suffixes[0] : "")
    : "";
  const tld = c.tld || [];
  const flag = flagUrl(cca2);
  const flagSvg = flagSvgUrl(cca2);

  return { name, official, capital, region, subregion, area, languages, currencies, borders, flag, flagSvg, cca2, cca3, callingCode, tld };
}

function buildBorderLookup(countries) {
  const map = {};
  countries.forEach((c) => {
    if (c.cca3) map[c.cca3] = c.name;
  });
  return map;
}

export function getBorderLookup(countries) {
  return buildBorderLookup(countries);
}

export async function fetchCountries() {
  if (memoryCache) return memoryCache;

  const disk = readDiskCache();
  if (disk) {
    memoryCache = disk;
    refreshInBackground();
    return memoryCache;
  }

  const data = await fetchWithRetry(API_URL);
  const countries = data.map(normalizeCountry).filter((c) => c.name !== "Unknown" && c.cca2);
  memoryCache = countries;
  writeDiskCache(countries);
  return countries;
}

function refreshInBackground() {
  fetchWithRetry(API_URL)
    .then((data) => {
      const countries = data.map(normalizeCountry).filter((c) => c.name !== "Unknown" && c.cca2);
      memoryCache = countries;
      writeDiskCache(countries);
    })
    .catch(() => {});
}

async function fetchWithRetry(url, retries = 2, timeoutMs = 15000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
}

export function isOnline() {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}
