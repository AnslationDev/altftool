import { getItunesRssClient, getItunesSearchClient, itunesArtworkUrl } from "./client";

/** Builds a real, track-derived description — no invented bio text, since Apple's feeds don't provide one. */
function buildTrackDescription({ artist, album, genre, year }) {
  const parts = [];
  if (artist && album) parts.push(`By ${artist}, from the album "${album}".`);
  else if (artist) parts.push(`By ${artist}.`);
  if (genre) parts.push(`Genre: ${genre}.`);
  if (year) parts.push(`Released ${year}.`);
  return parts.join(" ") || null;
}

function findAlternateLink(linkField) {
  const links = Array.isArray(linkField) ? linkField : [linkField];
  return links.find((l) => l?.attributes?.rel === "alternate")?.attributes?.href || null;
}

/** Shapes one entry from the iTunes top-songs RSS feed into what the UI needs. */
function normalizeChartEntry(entry) {
  const images = entry["im:image"] || [];
  const rawImage = images[images.length - 1]?.label || null;
  const releaseLabel = entry["im:releaseDate"]?.attributes?.label || null;
  const year = releaseLabel ? releaseLabel.match(/\d{4}/)?.[0] : null;

  return {
    id: entry.id?.attributes?.["im:id"] || entry.id?.label,
    title: entry["im:name"]?.label || null,
    artist: entry["im:artist"]?.label || null,
    album: entry["im:collection"]?.["im:name"]?.label || null,
    cover: itunesArtworkUrl(rawImage),
    // Apple's chart order already IS the ranking — there's no separate
    // numeric score to attach, so no star badge shows for these (same as
    // OpenLibrary's trending books, which also have no rating field).
    rating: null,
    description: buildTrackDescription({
      artist: entry["im:artist"]?.label,
      album: entry["im:collection"]?.["im:name"]?.label,
      genre: entry.category?.attributes?.label,
      year,
    }),
    url: findAlternateLink(entry.link),
  };
}

/** Shapes one iTunes Search API track result into the same shape. */
function normalizeSearchResult(track) {
  const year = track.releaseDate ? track.releaseDate.match(/\d{4}/)?.[0] : null;
  return {
    id: track.trackId,
    title: track.trackName,
    artist: track.artistName || null,
    album: track.collectionName || null,
    cover: itunesArtworkUrl(track.artworkUrl100),
    rating: null,
    description: buildTrackDescription({
      artist: track.artistName,
      album: track.collectionName,
      genre: track.primaryGenreName,
      year,
    }),
    url: track.trackViewUrl || null,
  };
}

/**
 * A curated set of Apple Music's own genre IDs (from its public genre
 * tree at itunes.apple.com/.../ws/genres) — powers the "browse by
 * category" grid. The tracks themselves are always real, live-fetched
 * from Apple's charts; this only decides which category buttons the
 * grid offers, same idea as TMDB's curated genre list.
 */
const MUSIC_GENRES = [
  {
    id: "14",
    label: "Pop",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&q=75",
    description: "Chart-topping hits and radio-ready hooks — the most popular sound right now.",
  },
  {
    id: "18",
    label: "Hip-Hop/Rap",
    image: "https://images.unsplash.com/photo-1508973379184-7517410fb0bc?w=500&q=75",
    description: "Beats, bars, and bold storytelling from the biggest voices in hip hop.",
  },
  {
    id: "21",
    label: "Rock",
    image: "https://images.unsplash.com/photo-1484876065684-b683cf17d276?w=500&q=75",
    description: "Guitars, energy, and decades of anthems — from classic to modern rock.",
  },
  {
    id: "15",
    label: "R&B/Soul",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500&q=75",
    description: "Smooth grooves and soulful vocals, built for late-night listening.",
  },
  {
    id: "17",
    label: "Dance",
    image: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=500&q=75",
    description: "Four-on-the-floor beats made for the club and the playlist.",
  },
  {
    id: "7",
    label: "Electronic",
    image: "https://images.unsplash.com/photo-1461784180009-21121b2f204c?w=500&q=75",
    description: "Synths, drops, and production built for the dancefloor.",
  },
  {
    id: "20",
    label: "Alternative",
    image: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=500&q=75",
    description: "Genre-bending tracks from artists who don't play by the rules.",
  },
  {
    id: "12",
    label: "Latin",
    image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=500&q=75",
    description: "Reggaeton, salsa, and Latin pop — rhythm-first hits from across Latin America.",
  },
  {
    id: "11",
    label: "Jazz",
    image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=500&q=75",
    description: "Improvisation, swing, and the sound of musicians talking to each other.",
  },
  {
    id: "5",
    label: "Classical",
    image: "https://images.unsplash.com/photo-1508997449629-303059a039c0?w=500&q=75",
    description: "Orchestral and chamber works from across the classical canon.",
  },
  {
    id: "6",
    label: "Country",
    image: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=500&q=75",
    description: "Storytelling, twang, and heartland anthems.",
  },
  {
    id: "1289",
    label: "Folk",
    image: "https://images.unsplash.com/photo-1521337581100-8ca9a73a5f79?w=500&q=75",
    description: "Acoustic, intimate, and rooted in tradition — songs built to be sung together.",
  },
];

export function getMusicGenres() {
  return MUSIC_GENRES;
}

/**
 * Top tracks within a single genre, in Apple's own chart order. The
 * classic iTunes RSS charts feed has no offset param, so one request
 * fetches a generous batch and pagination slices it client-side — same
 * infinite-scroll contract ({ music, hasMore }) as movies/books.
 */
export async function getMusicByGenre(genreId, { page = 1, limit = 10 } = {}) {
  const client = getItunesRssClient();
  const fetchLimit = 50;
  const data = await client.get(`/topsongs/limit=${fetchLimit}/genre=${genreId}/json`);
  const allTracks = (data.feed?.entry || []).map(normalizeChartEntry);

  const start = (page - 1) * limit;
  const music = allTracks.slice(start, start + limit);
  return { music, hasMore: start + limit < allTracks.length };
}

/**
 * Free-text track search, paginated via the iTunes Search API's real
 * offset param. Apple's response has no total-count field, so "a full
 * page came back" is the standard heuristic for whether more exist.
 */
export async function searchMusic(query, { page = 1, limit = 10 } = {}) {
  const trimmed = String(query || "").trim();
  if (!trimmed) return { music: [], hasMore: false };

  const client = getItunesSearchClient();
  const offset = (page - 1) * limit;
  const data = await client.get("/search", {
    params: { term: trimmed, media: "music", entity: "song", limit, offset },
  });
  const music = (data.results || []).map(normalizeSearchResult);
  return { music, hasMore: music.length === limit };
}
