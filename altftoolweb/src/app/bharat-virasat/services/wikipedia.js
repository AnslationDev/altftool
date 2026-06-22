/** Wikipedia API integration for India's UNESCO Heritage Sites */

// ── Mapping: site id → Wikipedia page title ──────────────────────────────
const WIKI_MAP = {
  taj: "Taj_Mahal",
  ellora: "Ellora_Caves",
  ajanta: "Ajanta_Caves",
  "agra-fort": "Agra_Fort",
  konark: "Sun_Temple,_Konark",
  mahabalipuram: "Group_of_Monuments_at_Mahabalipuram",
  kaziranga: "Kaziranga_National_Park",
  manas: "Manas_National_Park",
  keoladeo: "Keoladeo_National_Park",
  "churches-goa": "Churches_and_Convents_of_Goa",
  fatehpur: "Fatehpur_Sikri",
  hampi: "Group_of_Monuments_at_Hampi",
  khajuraho: "Khajuraho_Group_of_Monuments",
  elephanta: "Elephanta_Caves",
  chola: "Great_Living_Chola_Temples",
  pattadakal: "Pattadakal",
  sundarbans: "Sundarbans_National_Park",
  "nanda-devi": "Nanda_Devi_and_Valley_of_Flowers_National_Parks",
  sanchi: "Sanchi",
  humayun: "Humayun%27s_Tomb",
  qutub: "Qutb_Minar_complex",
  darjeeling: "Mountain_Railways_of_India",
  mahabodhi: "Mahabodhi_Temple",
  bhimbetka: "Bhimbetka_rock_shelters",
  champaner: "Champaner-Pavagadh_Archaeological_Park",
  cst: "Chhatrapati_Shivaji_Maharaj_Terminus",
  "red-fort": "Red_Fort",
  jantar: "Jantar_Mantar,_Jaipur",
  ghats: "Western_Ghats",
  "hill-forts": "Hill_Forts_of_Rajasthan",
  "rani-ki-vav": "Rani_Ki_Vav",
  nalanda: "Nalanda",
  khangchendzonga: "Khangchendzonga_National_Park",
  ahmedabad: "Ahmedabad",
  "mumbai-deco": "Victorian_Gothic_and_Art_Deco_Ensembles_of_Mumbai",
  jaipur: "Jaipur",
  dholavira: "Dholavira",
  ramappa: "Ramappa_Temple",
  santiniketan: "Santiniketan",
  hoysala: "Sacred_Ensembles_of_the_Hoysalas",
  moidams: "Moidam",
  maratha: "Maratha_Military_Landscapes_of_India",
};

// ── Cache ────────────────────────────────────────────────────────────────

const CACHE_KEY = "wiki_site_cache_v4_relevant";

const TTL = 1000 * 60 * 60 * 24 * 7; // 7 days
const MAX_RELEVANT_IMAGES = 30;

const VARIANTS = {
  taj: ["taj mahal", "taj", "mumtaz mahal"],
  ellora: ["ellora", "kailasa", "kailash temple", "verul"],
  ajanta: ["ajanta", "jataka", "waghora"],
  "agra-fort": ["agra fort", "red fort of agra", "agra kila"],
  konark: ["konark", "sun temple", "surya temple"],
  mahabalipuram: ["mahabalipuram", "mamallapuram", "shore temple", "pancha rathas"],
  kaziranga: ["kaziranga", "one-horned rhinoceros", "indian rhinoceros"],
  manas: ["manas", "manas national park", "manas wildlife"],
  keoladeo: ["keoladeo", "bharatpur bird", "ghana bird sanctuary"],
  "churches-goa": ["old goa", "bom jesus", "se cathedral goa", "churches and convents of goa"],
  fatehpur: ["fatehpur sikri", "buland darwaza", "salim chishti"],
  hampi: ["hampi", "vittala", "vitthala", "virupaksha", "vijayanagara", "lotus mahal"],
  khajuraho: ["khajuraho", "kandariya", "lakshmana temple"],
  elephanta: ["elephanta", "gharapuri", "trimurti"],
  chola: ["chola", "brihadisvara", "brihadeeswarar", "thanjavur", "gangaikonda", "airavatesvara"],
  pattadakal: ["pattadakal", "virupaksha temple pattadakal", "mallikarjuna temple pattadakal"],
  sundarbans: ["sundarbans", "sunderbans", "mangrove", "bengal tiger"],
  "nanda-devi": ["nanda devi", "valley of flowers", "hemkund", "garhwal"],
  sanchi: ["sanchi", "great stupa", "sanchi stupa"],
  humayun: ["humayun", "humayun's tomb", "humayuns tomb"],
  qutub: ["qutub", "qutb", "qutub minar", "qutb minar"],
  darjeeling: ["darjeeling himalayan railway", "mountain railways of india", "toy train", "kalka shimla", "nilgiri mountain railway"],
  mahabodhi: ["mahabodhi", "bodh gaya", "bodhgaya"],
  bhimbetka: ["bhimbetka", "rock shelters", "cave painting"],
  champaner: ["champaner", "pavagadh", "jami masjid champaner"],
  cst: ["chhatrapati shivaji terminus", "victoria terminus", "cst mumbai", "csmt"],
  "red-fort": ["red fort", "lal qila", "delhi fort"],
  jantar: ["jantar mantar jaipur", "samrat yantra", "jai prakash yantra"],
  ghats: ["western ghats", "sahyadri", "shola", "nilgiri"],
  "hill-forts": ["rajasthan fort", "chittorgarh", "kumbhalgarh", "amber fort", "jaisalmer fort", "ranthambore fort", "gagron"],
  "rani-ki-vav": ["rani ki vav", "rani-ki-vav", "patan stepwell"],
  nalanda: ["nalanda", "nalanda mahavihara", "nalanda university"],
  khangchendzonga: ["khangchendzonga", "kanchenjunga", "sikkim national park"],
  ahmedabad: ["ahmedabad", "sidi saiyyed", "jama masjid ahmedabad", "pol ahmedabad"],
  "mumbai-deco": ["mumbai art deco", "victorian gothic mumbai", "marine drive art deco", "oval maidan"],
  jaipur: ["jaipur", "pink city", "hawa mahal", "city palace jaipur"],
  dholavira: ["dholavira", "harappan", "kutch"],
  ramappa: ["ramappa", "rudreshwara", "kakatiya"],
  santiniketan: ["santiniketan", "shantiniketan", "visva-bharati", "tagore"],
  hoysala: ["hoysala", "belur", "halebidu", "somanathapura", "chennakeshava", "hoysaleswara"],
  moidams: ["moidam", "moidams", "charaideo", "ahom"],
  maratha: ["maratha fort", "raigad", "rajgad", "pratapgad", "shivneri", "sindhudurg", "gingee"],
};

const DIFFERENT_MONUMENT_TERMS = [
  "taj mahal", "ellora", "ajanta", "agra fort", "konark", "qutub", "qutb", "hampi",
  "khajuraho", "humayun", "red fort", "fatehpur", "sanchi", "nalanda", "mahabodhi",
  "rani ki vav", "pattadakal", "victoria terminus", "chhatrapati shivaji terminus",
];

const GENERIC_BAD_TERMS = [
  "map", "locator", "logo", "icon", "symbol", "emblem", "seal", "coat of arms",
  "flag", "diagram", "plan", "painting of", "portrait", "stamp", "coin", "currency",
  "svg", "animated", "infographic", "route map",
];

function stripHtml(value) {
  return (value ?? "").replace(/<[^>]*>/g, " ").replace(/&[^;]+;/g, " ");
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/%27/g, "'")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function variantsFor(site, wikiTitle) {
  return Array.from(
    new Set([
      site.name,
      wikiTitle.replace(/_/g, " "),
      ...(VARIANTS[site.id] ?? []),
    ].map(normalizeText).filter(Boolean))
  );
}

function isRelevantImage(img, site, wikiTitle) {
  const variants = variantsFor(site, wikiTitle);
  const haystack = normalizeText(`${img.title} ${img.url} ${img.description ?? ""}`);

  if (GENERIC_BAD_TERMS.some((term) => haystack.includes(term))) return false;

  const matchesCurrentSite = variants.some((term) => term.length > 2 && haystack.includes(term));
  if (!matchesCurrentSite) return false;

  // Reject obvious other-monument images unless that term is an allowed variant for this site.
  for (const term of DIFFERENT_MONUMENT_TERMS) {
    const normalized = normalizeText(term);
    const allowed = variants.some((v) => v.includes(normalized) || normalized.includes(v));
    if (!allowed && haystack.includes(normalized)) return false;
  }

  return true;
}

function dedupeAndLimit(images, site, wikiTitle) {
  const seen = new Set();
  const relevant = [];

  for (const image of images) {
    if (!image.url || seen.has(image.url)) continue;
    if (!isRelevantImage(image, site, wikiTitle)) continue;
    seen.add(image.url);
    relevant.push(image);
    if (relevant.length >= MAX_RELEVANT_IMAGES) break;
  }

  return relevant;
}

function getCache(id) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    const entry = map[id];
    if (!entry) return null;
    if (Date.now() - entry.ts > TTL) {
      delete map[id];
      localStorage.setItem(CACHE_KEY, JSON.stringify(map));
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function setCache(id, data) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[id] = { data, ts: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {
    // quota exceeded – silently ignore
  }
}

// ── API calls ────────────────────────────────────────────────────────────

async function fetchSummary(pageTitle) {
  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`
  );
  if (!res.ok) return null;
  return res.json();
}

async function fetchImageList(pageTitle, limit = 100) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=images&format=json&origin=*&pilimit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const pages = data.query?.pages ?? {};
  const page = Object.values(pages)[0];
  return (page?.images ?? [])
    .map((img) => img.title ?? "")
    .filter((t) => /\.(jpe?g|png|JPE?G|PNG)$/i.test(t))
    .slice(0, limit);
}

async function fetchImageUrls(fileTitles, batchSize = 50) {
  if (!fileTitles.length) return [];

  const results = [];
  // Use Commons API as it has fewer CORS restrictions and better image info for shared files
  for (let i = 0; i < fileTitles.length; i += batchSize) {
    const batch = fileTitles.slice(i, i + batchSize);
    // Remove "File:" prefix if present, we'll add it back
    const titles = batch.map((f) => `File:${f.replace(/^File:/i, '')}`).join("|");
    const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url|size|mime|extmetadata&format=json&origin=*`;

    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const pages = data.query?.pages ?? {};

      for (const page of Object.values(pages)) {
        const p = page;
        const info = p.imageinfo?.[0];
        if (info && info.url && /image\/(jpeg|png)/i.test(info.mime ?? "")) {
          results.push({
            title: p.title,
            url: info.url,
            width: info.width,
            height: info.height,
            description: stripHtml(`${info.extmetadata?.ImageDescription?.value ?? ""} ${info.extmetadata?.ObjectName?.value ?? ""} ${info.extmetadata?.Categories?.value ?? ""}`),
          });
        }
      }
    } catch {
      continue;
    }
  }

  return results;
}

async function fetchCommonsSearchImages(query, limit = 100) {
  const search = query.replace(/_/g, " ");
  // Search Wikimedia Commons directly for 100 images
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(search)}&gsrnamespace=6&gsrlimit=${limit}&prop=imageinfo&iiprop=url|size|mime|extmetadata&format=json&origin=*`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const pages = data.query?.pages ?? {};
    
    const results = [];
    for (const page of Object.values(pages)) {
      const p = page;
      const info = p.imageinfo?.[0];
      if (info && info.url && /image\/(jpeg|png)/i.test(info.mime ?? "")) {
        results.push({
          title: p.title,
          url: info.url,
          width: info.width,
          height: info.height,
          description: stripHtml(`${info.extmetadata?.ImageDescription?.value ?? ""} ${info.extmetadata?.ObjectName?.value ?? ""} ${info.extmetadata?.Categories?.value ?? ""}`),
        });
      }
    }
    return results;
  } catch {
    return [];
  }
}

// ── Main fetch with cache ────────────────────────────────────────────────

const pendingRequests = new Map();

export async function fetchSiteWikiData(site) {
  const id = site.id;

  // Return already-pending request
  if (pendingRequests.has(id)) {
    return pendingRequests.get(id);
  }

  // Return cached data
  const cached = getCache(id);
  if (cached) {
    const data = { summary: cached.data.summary, images: cached.data.images, loading: false, error: null };
    return data;
  }

  const wikiTitle = site.wikiTitle || WIKI_MAP[id] || site.name.replace(/\s+/g, "_");

  const promise = (async () => {
    try {
      const searchQueries = Array.from(
        new Set([site.name, wikiTitle.replace(/_/g, " "), ...variantsFor(site, wikiTitle).slice(0, 4)])
      );

      // 1. Fetch summary from Wikipedia
      // 2. Fetch specific images used on the Wikipedia article
      // 3. Search Wikimedia Commons with strict site-name variants
      const [summary, imageTitles, ...commonsGroups] = await Promise.all([
        fetchSummary(wikiTitle),
        fetchImageList(wikiTitle, 80),
        ...searchQueries.map((query) => fetchCommonsSearchImages(query, 50)),
      ]);

      // Get actual URLs for article images
      const articleImages = await fetchImageUrls(imageTitles, 50);
      const combinedImages = dedupeAndLimit([...articleImages, ...commonsGroups.flat()], site, wikiTitle);

      const result = {
        summary: summary?.extract ? summary : null,
        images: combinedImages,
        loading: false,
        error: null,
      };

      // Cache it
      setCache(id, { summary: result.summary, images: result.images });

      return result;
    } catch (err) {
      return {
        summary: null,
        images: [],
        loading: false,
        error: err?.message ?? "Failed to load Wikipedia data",
      };
    }
  })();

  pendingRequests.set(id, promise);
  promise.finally(() => pendingRequests.delete(id));

  return promise;
}

// ── React hook ───────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

export function useWikiData(site) {
  const [data, setData] = useState({
    summary: null,
    images: [],
    loading: false,
    error: null,
  });

  const load = async () => {
    if (!site) return;

    // Check cache synchronously first
    const cached = getCache(site.id);
    if (cached) {
      setData({ summary: cached.data.summary, images: cached.data.images, loading: false, error: null });
      return;
    }

    // Set loading state
    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fetchSiteWikiData(site);
      setData(result);
    } catch {
      setData((prev) => ({ ...prev, loading: false, error: "Failed to load data" }));
    }
  };

  useEffect(() => {
    load();
  }, [site?.id]);

  return { ...data, triggerFetch: load };
}
