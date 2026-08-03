import { getPokeApiClient } from "./client";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toTitleCase(name) {
  return String(name || "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const STAT_LABELS = {
  hp: "HP",
  attack: "Atk",
  defense: "Def",
  "special-attack": "SpA",
  "special-defense": "SpD",
  speed: "Spd",
};

/**
 * Total Base Stats = HP + Attack + Defense + Special Attack + Special
 * Defense + Speed, summed straight from PokeAPI's own real per-stat
 * numbers — this IS the ranking metric the user asked for, not a
 * fabricated score. No genuine 0-10 rating exists for a Pokemon, so
 * `rating` stays null and the real total (plus its breakdown) is shown
 * in the description instead, same idea as CoinCap's market-cap rank.
 */
function computeTotalStats(stats) {
  return (stats || []).reduce((sum, s) => sum + (Number(s.base_stat) || 0), 0);
}

function buildDescription(pokemon, totalStats) {
  const breakdown = (pokemon.stats || [])
    .map((s) => `${STAT_LABELS[s.stat?.name] || s.stat?.name}: ${s.base_stat}`)
    .join(" · ");
  return breakdown ? `Total Base Stats: ${totalStats} (${breakdown}).` : `Total Base Stats: ${totalStats}.`;
}

/** Shapes a raw PokeAPI /pokemon/{id} record into what the UI needs. */
function normalizePokemon(pokemon) {
  const totalStats = computeTotalStats(pokemon.stats);
  const types = (pokemon.types || [])
    .sort((a, b) => a.slot - b.slot)
    .map((t) => toTitleCase(t.type?.name))
    .join(" · ");

  return {
    id: pokemon.id,
    title: toTitleCase(pokemon.name),
    subtitle: types || null,
    image: pokemon.sprites?.other?.["official-artwork"]?.front_default || pokemon.sprites?.front_default || null,
    rating: null,
    description: buildDescription(pokemon, totalStats),
    // pokemon.com's Pokedex only has pages for the base species (e.g.
    // "charizard", not "charizard-mega-x") — species.name is that clean
    // base slug, so form variants still link somewhere real instead of
    // a 404 on the raw form-variant name.
    url: `https://www.pokemon.com/us/pokedex/${pokemon.species?.name || pokemon.name}`,
    totalStats,
  };
}

/**
 * The 18 real Pokemon types — a genuine taxonomy from the games/API
 * itself, same role as TMDB's genre list or Jikan's MAL genre list.
 * "unknown" and "shadow" (non-standard, battle-only pseudo-types) are
 * deliberately excluded.
 */
const POKEMON_TYPES = [
  {
    id: "fire",
    label: "Fire",
    image: "https://images.unsplash.com/photo-1552931668-b6fedfb82b1a?w=500&q=75",
    description: "Blazing attackers, ranked by total base stats.",
  },
  {
    id: "water",
    label: "Water",
    image: "https://images.unsplash.com/photo-1543001907-bae0c9111c68?w=500&q=75",
    description: "Tide-turning Pokemon, ranked by total base stats.",
  },
  {
    id: "grass",
    label: "Grass",
    image: "https://images.unsplash.com/photo-1495584816685-4bdbf1b5057e?w=500&q=75",
    description: "Nature's own, ranked by total base stats.",
  },
  {
    id: "electric",
    label: "Electric",
    image: "https://images.unsplash.com/photo-1783700111001-3e0452cd2052?w=500&q=75",
    description: "High-voltage Pokemon, ranked by total base stats.",
  },
  {
    id: "ice",
    label: "Ice",
    image: "https://images.unsplash.com/photo-1542075986-0fe5fc539062?w=500&q=75",
    description: "Frost-powered Pokemon, ranked by total base stats.",
  },
  {
    id: "fighting",
    label: "Fighting",
    image: "https://images.unsplash.com/photo-1570442387127-66eb80e00938?w=500&q=75",
    description: "Close-combat specialists, ranked by total base stats.",
  },
  {
    id: "poison",
    label: "Poison",
    image: "https://images.unsplash.com/photo-1589560486116-5a51b3340fe8?w=500&q=75",
    description: "Toxic Pokemon, ranked by total base stats.",
  },
  {
    id: "ground",
    label: "Ground",
    image: "https://images.unsplash.com/photo-1728815235820-3a894b2f2807?w=500&q=75",
    description: "Earth-shaking Pokemon, ranked by total base stats.",
  },
  {
    id: "flying",
    label: "Flying",
    image: "https://images.unsplash.com/photo-1764624005034-77d889186ecb?w=500&q=75",
    description: "Sky-born Pokemon, ranked by total base stats.",
  },
  {
    id: "psychic",
    label: "Psychic",
    image: "https://images.unsplash.com/photo-1736210811075-7509d5023a4a?w=500&q=75",
    description: "Mind-bending Pokemon, ranked by total base stats.",
  },
  {
    id: "bug",
    label: "Bug",
    image: "https://images.unsplash.com/photo-1550103685-da83caf1f0c8?w=500&q=75",
    description: "Swarming Pokemon, ranked by total base stats.",
  },
  {
    id: "rock",
    label: "Rock",
    image: "https://images.unsplash.com/photo-1542726922-8a0a42ae764d?w=500&q=75",
    description: "Stone-solid Pokemon, ranked by total base stats.",
  },
  {
    id: "ghost",
    label: "Ghost",
    image: "https://images.unsplash.com/photo-1551147881-80391a279dce?w=500&q=75",
    description: "Haunting Pokemon, ranked by total base stats.",
  },
  {
    id: "dragon",
    label: "Dragon",
    image: "https://images.unsplash.com/photo-1773176647951-d8f618dee942?w=500&q=75",
    description: "Legendary powerhouses, ranked by total base stats.",
  },
  {
    id: "dark",
    label: "Dark",
    image: "https://images.unsplash.com/photo-1742626157111-59f3f1019a8a?w=500&q=75",
    description: "Shadow-dwelling Pokemon, ranked by total base stats.",
  },
  {
    id: "steel",
    label: "Steel",
    image: "https://images.unsplash.com/photo-1756758932992-3cac25c395f7?w=500&q=75",
    description: "Armored Pokemon, ranked by total base stats.",
  },
  {
    id: "fairy",
    label: "Fairy",
    image: "https://images.unsplash.com/photo-1461146957876-c16e4f1adc4a?w=500&q=75",
    description: "Charming Pokemon, ranked by total base stats.",
  },
  {
    id: "normal",
    label: "Normal",
    image: "https://images.unsplash.com/photo-1470299789536-c1c22e9866ed?w=500&q=75",
    description: "All-round Pokemon, ranked by total base stats.",
  },
];

export function getPokemonCategories() {
  return POKEMON_TYPES;
}

/**
 * Fetches a list of URLs with limited concurrency instead of one giant
 * Promise.all — a type roster can run to 150-200+ Pokemon, and PokeAPI's
 * own fair-use guidance asks clients to be reasonable/cache rather than
 * hammer every endpoint at once (same spirit as Jikan's rate-limit-aware
 * fetching elsewhere in this codebase, just a higher ceiling since
 * PokeAPI publishes no hard per-second limit).
 */
async function fetchWithConcurrency(urls, mapFn, concurrency = 15) {
  const client = getPokeApiClient();
  const results = [];
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((url) => client.get(url).then(mapFn).catch(() => null)),
    );
    results.push(...batchResults);
    if (i + concurrency < urls.length) await sleep(150);
  }
  return results.filter(Boolean);
}

/**
 * Pokemon stats never change once published, so each type's full,
 * stat-sorted roster is cached at module scope for a long time rather
 * than re-fetched (and re-summed) on every request.
 */
const typeRosterCache = new Map();
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

async function getSortedTypeRoster(typeId) {
  const cached = typeRosterCache.get(typeId);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) return cached.roster;

  const client = getPokeApiClient();
  const typeData = await client.get(`/type/${typeId}`);
  const entries = typeData.pokemon || [];
  const urls = entries.map((e) => e.pokemon.url).filter(Boolean);

  const detailed = await fetchWithConcurrency(urls, (detail) => normalizePokemon(detail));
  const roster = detailed.sort((a, b) => b.totalStats - a.totalStats);

  typeRosterCache.set(typeId, { roster, cachedAt: Date.now() });
  return roster;
}

/** Top Pokemon within a type, ranked by real total base stats (highest first). */
export async function getPokemonByCategory(categoryId, { page = 1, limit = 10 } = {}) {
  if (!categoryId) return { pokemon: [], hasMore: false };
  const roster = await getSortedTypeRoster(categoryId);

  const start = (page - 1) * limit;
  const pokemon = roster.slice(start, start + limit);
  return { pokemon, hasMore: start + limit < roster.length };
}

/**
 * Free-text Pokemon search by name. PokeAPI has no full-text search
 * endpoint, so the full ~1350-name master list is fetched once (cached),
 * filtered by substring, then only the matches actually get their stats
 * fetched (capped, so a broad query can't trigger hundreds of detail
 * fetches at once).
 */
let masterNameListCache = null;
let masterNameListCachedAt = 0;
const MAX_SEARCH_DETAIL_FETCHES = 20;

async function getMasterNameList() {
  if (masterNameListCache && Date.now() - masterNameListCachedAt < CACHE_TTL_MS) return masterNameListCache;

  const client = getPokeApiClient();
  const data = await client.get("/pokemon", { params: { limit: 2000, offset: 0 } });
  masterNameListCache = data.results || [];
  masterNameListCachedAt = Date.now();
  return masterNameListCache;
}

export async function searchPokemon(query, { page = 1, limit = 10 } = {}) {
  const trimmed = String(query || "").trim().toLowerCase();
  if (!trimmed) return { pokemon: [], hasMore: false };

  const all = await getMasterNameList();
  const matches = all.filter((p) => p.name.includes(trimmed)).slice(0, MAX_SEARCH_DETAIL_FETCHES);

  const detailed = await fetchWithConcurrency(
    matches.map((m) => m.url),
    (detail) => normalizePokemon(detail),
  );
  const sorted = detailed.sort((a, b) => b.totalStats - a.totalStats);

  const start = (page - 1) * limit;
  const pokemon = sorted.slice(start, start + limit);
  return { pokemon, hasMore: start + limit < sorted.length };
}
