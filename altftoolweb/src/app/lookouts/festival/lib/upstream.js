// Server-only upstream data fetchers for the Festival Explorer.
//
// Every function here catches its own errors and resolves to `null` (or an
// empty array) on any failure — a flaky/unreachable upstream must never
// break a page render. Called directly from Server Components (for SSR/ISR
// caching via Next's `fetch` + `next.revalidate`) and, identically, from the
// thin proxy routes under src/app/api/lookouts/festival/* for client-side
// interactive re-fetches.
//
// Do not import this file from a "use client" component.

const DAY = 60 * 60 * 24;

async function safeFetchJson(url, { revalidate = DAY, headers = {} } = {}) {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", ...headers },
      next: { revalidate },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Nager.Date — public holidays by country/year. Keyless, public.
// https://date.nager.at/Api
export async function fetchPublicHolidays(countryCode, year) {
  if (!countryCode || !year) return [];
  const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode.toUpperCase()}`;
  const data = await safeFetchJson(url, { revalidate: DAY });
  return Array.isArray(data) ? data : [];
}

// REST Countries — country facts (region, capital, languages, currencies,
// flag). https://restcountries.com deprecated its old keyless v3.1 host in
// 2026 in favour of api.restcountries.com, which requires a registered
// Authorization key. Without RESTCOUNTRIES_API_KEY configured this always
// returns [] and callers fall back gracefully (see LocationMapSection /
// TravelInfoSection) — country facts simply don't render until a key is
// added.
export async function fetchCountryInfo(codes) {
  const list = Array.from(new Set((codes || []).filter(Boolean).map((c) => c.toUpperCase())));
  const key = process.env.RESTCOUNTRIES_API_KEY;
  if (!list.length || !key) return [];

  const fields = "name,flags,region,subregion,capital,population,languages,currencies,maps,cca2,latlng";
  const url = `https://api.restcountries.com/v3.1/alpha?codes=${list.join(",")}&fields=${fields}`;
  const data = await safeFetchJson(url, {
    revalidate: DAY * 7,
    headers: { Authorization: key },
  });
  return Array.isArray(data) ? data : [];
}

// Wikipedia REST summary — live description/history extract + thumbnail.
// Keyless, public. https://en.wikipedia.org/api/rest_v1/
export async function fetchWikiSummary(title) {
  if (!title) return null;
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const data = await safeFetchJson(url, {
    revalidate: DAY * 7,
    headers: { "Api-User-Agent": "AltFTool-FestivalExplorer/1.0" },
  });
  if (!data || data.type === "disambiguation") return null;

  return {
    title: data.title,
    extract: data.extract || null,
    description: data.description || null,
    thumbnailUrl: data.thumbnail?.source || null,
    originalImageUrl: data.originalimage?.source || null,
    pageUrl: data.content_urls?.desktop?.page || null,
  };
}

async function fetchUnsplashPhoto(query) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;

  // `content_filter=high` drops results flagged as potentially unsuitable —
  // worth it on a hub that renders whatever the first hit happens to be.
  const url =
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}` +
    `&per_page=10&orientation=landscape&content_filter=high`;
  const data = await safeFetchJson(url, {
    revalidate: DAY,
    headers: { Authorization: `Client-ID ${key}` },
  });

  const results = data?.results;
  if (!Array.isArray(results) || !results.length) return null;

  // `raw` is the un-parameterised original, so appending Imgix params builds
  // exactly the derivative we want. Unsplash's own presets are a poor fit:
  // `regular` is a fixed 1080w (soft on a 2x card, wasteful on a small one)
  // and `full` is the raw upload, routinely multiple MB.
  //
  // `fit=crop` with the default centre gravity, rather than `fit=max`, so a
  // card gets a filled frame instead of a letterboxed one — these slots are
  // fixed-aspect and a photo that doesn't fill them reads as broken.
  const derive = (photo, { w, h, q = 80, crop = true }) => {
    const raw = photo.urls?.raw;
    if (!raw) return photo.urls?.regular || photo.urls?.full || null;
    const fit = crop && h ? `&h=${h}&fit=crop&crop=entropy` : "&fit=max";
    return `${raw}&w=${w}${fit}&q=${q}&fm=jpg&auto=format`;
  };

  return results.slice(0, 10).map((photo) => ({
    // Card slots render at roughly 400×300 CSS px; 800×600 covers 2x screens.
    url: derive(photo, { w: 800, h: 600 }),
    // Hero/full-bleed: wide, uncropped, and a notch higher quality.
    fullUrl: derive(photo, { w: 1920, q: 85, crop: false }),
    thumbUrl: derive(photo, { w: 400, h: 300 }),
    alt: photo.alt_description || query,
    credit: photo.user?.name || "Unsplash",
    creditUrl: photo.user?.links?.html || "https://unsplash.com",
    source: "unsplash",
  }));
}

async function fetchPexelsPhoto(query) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return null;

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`;
  const data = await safeFetchJson(url, {
    revalidate: DAY,
    headers: { Authorization: key },
  });

  const photos = data?.photos;
  if (!Array.isArray(photos) || !photos.length) return null;

  return photos.slice(0, 10).map((photo) => ({
    url: photo.src?.large,
    fullUrl: photo.src?.large2x || photo.src?.original || photo.src?.large,
    thumbUrl: photo.src?.medium,
    alt: photo.alt || query,
    credit: photo.photographer || "Pexels",
    creditUrl: photo.photographer_url || "https://pexels.com",
    source: "pexels",
  }));
}

// Live photo search with a graceful fallback chain: Unsplash -> Pexels ->
// null (callers should fall back further to a Wikipedia thumbnail or a
// static placeholder). Returns an array of { url, thumbUrl, alt, credit,
// creditUrl, source } or null if no key is configured / no results found.
// Both providers treat extra search terms as further constraints, so the long
// descriptive queries in the catalog can over-specify themselves into zero
// results — "la tomatina tomato fight spain" returns nothing while "la
// tomatina" returns a full page. Retrying on the leading two words recovers
// those cases; anything already that short just isn't retried.
function broadenQuery(query) {
  const words = (query || "").trim().split(/\s+/).filter(Boolean);
  if (words.length <= 2) return null;
  return words.slice(0, 2).join(" ");
}

export async function fetchFestivalPhotos(query) {
  const attempts = [query, broadenQuery(query)].filter(Boolean);

  for (const attempt of attempts) {
    const unsplash = await fetchUnsplashPhoto(attempt);
    if (unsplash) return unsplash;

    const pexels = await fetchPexelsPhoto(attempt);
    if (pexels) return pexels;
  }

  return null;
}

// Single best photo for one festival, with a *keyless* last resort.
//
// Both photo providers above require an API key, so with none configured
// fetchFestivalPhotos() returns null and every caller renders an emoji
// placeholder — the whole hub ends up image-less. Wikipedia's REST summary is
// keyless and already fetched elsewhere on these pages, and its page image is
// a genuine photo of the festival, so it makes a good zero-config fallback.
// (upload.wikimedia.org is allow-listed in next.config.mjs remotePatterns, so
// next/image can optimize these too.)
//
// Returns the same shape as fetchFestivalPhotos() entries, or null.

// Wikipedia's summary endpoint hands back only two sizes: a 330px thumbnail
// (too soft for a card on a 2x screen) and the raw upload, routinely 4000px
// and several MB. Rewriting the thumbnail's `/<N>px-` segment to ask for
// something in between is not reliable — Wikimedia's on-demand thumbnailer
// caps per file, and the same rewrite that works at 500px returns HTTP 400 at
// 660px on the very next image.
//
// So this returns the original upload and lets next/image size it. It must
// return the *source* URL and nothing else: an earlier version handed back a
// pre-built `/_next/image?url=…&w=828` string, which <Image> then received as
// its own `src` and tried to optimize a second time. Next reads that as a
// local path carrying a query string, demands images.localPatterns, and fails
// the production build outright ("Image with src /_next/image?url=… is using a
// query string which is not configured"). It stayed hidden only because the
// one surface that rendered these — the related-festivals strip — was being
// passed an empty photo map. upload.wikimedia.org is allow-listed in
// next.config.mjs remotePatterns so <Image> can fetch and resize it directly.
export async function fetchFestivalPhoto({ unsplashQuery, wikipediaTitle, name } = {}) {
  const photos = await fetchFestivalPhotos(unsplashQuery);
  if (photos?.[0]) return photos[0];

  const wiki = await fetchWikiSummary(wikipediaTitle);
  const thumb = wiki?.thumbnailUrl;
  const original = wiki?.originalImageUrl;
  if (!thumb && !original) return null;

  return {
    url: original || thumb,
    fullUrl: original || thumb,
    thumbUrl: thumb || original,
    alt: name || wiki.title || "Festival photo",
    credit: "Wikipedia",
    creditUrl: wiki.pageUrl || "https://en.wikipedia.org",
    source: "wikipedia",
  };
}
