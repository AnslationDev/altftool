import { getTrendingBooks, getBookSubjects, getBooksBySubject } from "@/lib/providers/openlibrary/books";
import { getMusicGenres, getMusicByGenre } from "@/lib/providers/itunes/music";
import { getFoodCategories, getFoodByCategory } from "@/lib/providers/themealdb/food";
import { getPlaceCategories, getPlacesByCategory } from "@/lib/providers/geoapify/places";
import { getRestaurantCategories, getRestaurantsByCategory } from "@/lib/providers/foursquare/restaurants";
import { getDrinkCategories, getDrinksByCategory } from "@/lib/providers/cocktaildb/drinks";
import { getCryptoCategories, getCryptoByCategory } from "@/lib/providers/coincap/crypto";
import { getDogCategories, getDogsByCategory } from "@/lib/providers/apininjas/dogs";
import { getCatCategories, getCatsByCategory } from "@/lib/providers/thecatapi/cats";
import { getToolCategories, getToolsByCategory } from "@/lib/providers/producthunt/products";
import { getAnimeCategories, getAnimeByCategory } from "@/lib/providers/jikan/anime";
import { getWikipediaRestClient } from "@/lib/providers/wikipedia/client";

/**
 * Shared home for "one real card per product" — originally built for the
 * homepage Trending Now strip (/api/top10/trending), now also reused by
 * the universe-highlight endpoint so both features draw on the exact same
 * real, non-fabricated trending signals instead of two divergent sources.
 *
 * Two honesty rules, per the approved hybrid design:
 *  - `trending: true` is reserved for products with a genuine, real
 *    time-varying "trending" signal — OpenLibrary's own
 *    /trending/daily endpoint, crypto's
 *    live price (inherently real-time), and Wikipedia's own real
 *    "most read today" feed (used to pick a famous person, when one
 *    appears in it).
 *  - Every other product still contributes its first real provider item,
 *    labeled as a "Top Pick" rather than "Trending" — real
 *    data either way, nothing invented, just honestly labeled.
 *
 * A provider failure drops that one card rather than failing the whole
 * response — a fussy upstream (e.g. Foursquare) shouldn't take down
 * everything built on top of this.
 */

const CARD_DEADLINE_MS = 5_000;

function safeAsync(fn) {
  let timeout;
  return Promise.race([
    Promise.resolve().then(fn).catch(() => null),
    new Promise((resolve) => {
      timeout = setTimeout(() => resolve(null), CARD_DEADLINE_MS);
    }),
  ]).finally(() => clearTimeout(timeout));
}


async function booksCard() {
  const [book] = await getTrendingBooks({ window: "daily" });
  if (book) {
    return {
      key: "books",
      label: "Books",
      title: book.title,
      subtitle: [book.author, book.year].filter(Boolean).join(" · ") || null,
      image: book.cover,
      url: book.url,
      trending: true,
    };
  }
  // Fallback to a real top-subject pick if the trending endpoint has no data today.
  const subjects = getBookSubjects();
  const { books } = await getBooksBySubject(subjects[0].id, { limit: 1 });
  const item = books[0];
  if (!item) return null;
  return {
    key: "books",
    label: "Books",
    title: item.title,
    subtitle: [item.author, item.year].filter(Boolean).join(" · ") || null,
    image: item.cover,
    url: item.url,
    trending: false,
  };
}

async function musicCard() {
  const genres = getMusicGenres();
  const { music } = await getMusicByGenre(genres[0].id, { limit: 1 });
  const track = music[0];
  if (!track) return null;
  return {
    key: "music",
    label: "Music",
    title: track.title,
    subtitle: [track.artist, track.album].filter(Boolean).join(" · ") || null,
    image: track.cover,
    url: track.url,
    trending: false,
  };
}

async function foodCard() {
  const categories = await getFoodCategories();
  const { food } = await getFoodByCategory(categories[0].id, { limit: 1 });
  const item = food[0];
  if (!item) return null;
  return { key: "food", label: "Food", ...pickCommon(item), trending: false };
}

async function placesCard() {
  const categories = getPlaceCategories();
  const { places } = await getPlacesByCategory(categories[0].id, { limit: 1 });
  const item = places[0];
  if (!item) return null;
  return { key: "places", label: "Travel", ...pickCommon(item), trending: false };
}

async function restaurantsCard() {
  const categories = getRestaurantCategories();
  const { restaurants } = await getRestaurantsByCategory(categories[0].id, { limit: 1 });
  const item = restaurants[0];
  if (!item) return null;
  return { key: "restaurants", label: "Restaurants", ...pickCommon(item), trending: false };
}

async function drinksCard() {
  const categories = getDrinkCategories();
  const { drinks } = await getDrinksByCategory(categories[0].id, { limit: 1 });
  const item = drinks[0];
  if (!item) return null;
  return { key: "drinks", label: "Top Drinks", ...pickCommon(item), trending: false };
}

async function cryptoCard() {
  const categories = getCryptoCategories();
  const { crypto } = await getCryptoByCategory(categories[0].id, { limit: 1 });
  const item = crypto[0];
  if (!item) return null;
  // Crypto prices are live/real-time by nature — a genuine "trending" signal, not fabricated.
  return { key: "crypto", label: "Crypto", ...pickCommon(item), trending: true };
}

async function dogsCard() {
  const categories = getDogCategories();
  const { dogs } = await getDogsByCategory(categories[0].id, { limit: 1 });
  const item = dogs[0];
  if (!item) return null;
  return { key: "dogs", label: "Dogs", ...pickCommon(item), trending: false };
}

async function catsCard() {
  const categories = getCatCategories();
  const { cats } = await getCatsByCategory(categories[0].id, { limit: 1 });
  const item = cats[0];
  if (!item) return null;
  return { key: "cats", label: "Cats", ...pickCommon(item), trending: false };
}

async function aiToolsCard() {
  const categories = getToolCategories();
  const { tools } = await getToolsByCategory(categories[0].id, { limit: 1 });
  const item = tools[0];
  if (!item) return null;
  return { key: "ai-tools", label: "AI Tools", ...pickCommon(item), trending: false };
}

async function animeCard() {
  const categories = getAnimeCategories();
  const { anime } = await getAnimeByCategory(categories[0].id, { limit: 1 });
  const item = anime[0];
  if (!item) return null;
  return { key: "anime", label: "Anime", ...pickCommon(item), trending: false };
}


/** Common {title, subtitle, image, url} shape shared by most providers' normalized items. */
function pickCommon(item) {
  return { title: item.title, subtitle: item.subtitle || null, image: item.image || null, url: item.url || null };
}

const PERSON_DESCRIPTION_HINTS =
  /\b(actor|actress|singer|politician|athlete|scientist|author|businessman|businesswoman|footballer|president|entrepreneur|writer|director|musician|rapper|golfer|cricketer|tennis|boxer|physicist|chemist|novelist|activist|journalist|comedian|CEO|footballer|wrestler|model|philanthropist)\b/i;

/**
 * Wikipedia's own real "most read today" feed — a genuine trending
 * signal (real view counts, real rank), not a fabricated one. Scans it
 * for the first article whose real Wikipedia description reads like a
 * person (not a film/event/place), so a "Famous People" trending card
 * only appears when the day's most-read list actually surfaces one.
 */
async function famousPeopleMostReadCard() {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const y = yesterday.getUTCFullYear();
  const m = String(yesterday.getUTCMonth() + 1).padStart(2, "0");
  const d = String(yesterday.getUTCDate()).padStart(2, "0");

  const client = getWikipediaRestClient();
  const feed = await client.get(`/feed/featured/${y}/${m}/${d}`);
  const articles = feed?.mostread?.articles || [];
  const person = articles.find((a) => PERSON_DESCRIPTION_HINTS.test(a.description || ""));
  if (!person) return null;

  return {
    key: "famous-people",
    label: "Famous People",
    title: person.titles?.normalized || person.title,
    subtitle: person.description || null,
    image: person.thumbnail?.source || null,
    url: person.content_urls?.desktop?.page || null,
    trending: true,
  };
}

const CARD_BUILDERS = [
  booksCard,
  musicCard,
  foodCard,
  placesCard,
  restaurantsCard,
  drinksCard,
  cryptoCard,
  dogsCard,
  catsCard,
  aiToolsCard,
  animeCard,
  famousPeopleMostReadCard,
];

/** Same fetch-heavy-fan-out-once-and-cache pattern used across this feature — refreshed hourly. */
let cachedTrending = null;
let cachedAt = 0;
let pendingTrending = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function getTrendingCards() {
  const now = Date.now();
  if (cachedTrending && now - cachedAt < CACHE_TTL_MS) return cachedTrending;
  if (pendingTrending) return pendingTrending;

  pendingTrending = Promise.all(CARD_BUILDERS.map((build) => safeAsync(build)))
    .then((results) => {
      const cards = results.filter(Boolean);
      cachedTrending = cards;
      cachedAt = Date.now();
      return cards;
    })
    .finally(() => {
      pendingTrending = null;
    });

  return pendingTrending;
}
