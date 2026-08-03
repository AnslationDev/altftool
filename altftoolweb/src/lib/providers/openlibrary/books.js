import { getOpenLibraryClient, openLibraryCoverUrl } from "./client";
import { cleanDescription, enrichTopItems, sortByRatingDesc } from "@/lib/providers/_shared/normalize";

/** Shapes a raw OpenLibrary "trending" work into what the UI needs. */
function normalizeTrendingWork(work) {
  return {
    id: work.key,
    title: work.title,
    author: (work.author_name || [])[0] || null,
    // The trending endpoint doesn't return a rating — leave it out rather
    // than inventing one.
    rating: null,
    year: work.first_publish_year || null,
    cover: openLibraryCoverUrl(work.cover_i, "M"),
    url: work.key ? `https://openlibrary.org${work.key}` : null,
  };
}

/** Shapes a raw OpenLibrary search result doc into the same shape. */
function normalizeSearchDoc(doc) {
  return {
    id: doc.key,
    title: doc.title,
    author: (doc.author_name || [])[0] || null,
    rating: typeof doc.ratings_average === "number" ? Math.round(doc.ratings_average * 10) / 10 : null,
    year: doc.first_publish_year || null,
    cover: openLibraryCoverUrl(doc.cover_i, "M"),
    url: doc.key ? `https://openlibrary.org${doc.key}` : null,
  };
}

/**
 * OpenLibrary has no "list all subjects" endpoint, so this is a curated
 * set of well-populated subject slugs (verified against /subjects/<id>.json)
 * — a fixed navigation list, same idea as TMDB's genre IDs. The BOOKS
 * themselves are always real, live-fetched; this only decides which
 * category buttons the "browse by category" grid offers.
 */
const BOOK_SUBJECTS = [
  {
    id: "fiction",
    label: "Fiction",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=500&q=75",
    description: "Novels and short stories across every style. Made-up worlds, real emotions.",
  },
  {
    id: "fantasy",
    label: "Fantasy",
    image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&q=75",
    description: "Magic, myth, and worlds beyond our own. Epic quests and imagined kingdoms.",
  },
  {
    id: "mystery_and_detective_stories",
    label: "Mystery",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&q=75",
    description: "Clues, red herrings, and clever detectives. Page-turners built on suspense.",
  },
  {
    id: "science_fiction",
    label: "Science Fiction",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&q=75",
    description: "Future worlds, bold ideas, and technology that reshapes what's possible.",
  },
  {
    id: "romance",
    label: "Romance",
    image: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1589208070i/53375726.jpg",
    description: "Love stories in every form — sweeping, slow-burn, or bittersweet.",
  },
  {
    id: "biography",
    label: "Biography",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=75",
    description: "Real lives, told in full. Memoirs and biographies worth knowing.",
  },
  {
    id: "history",
    label: "History",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=75",
    description: "The past, examined closely. Eras, events, and the people who shaped them.",
  },
  {
    id: "self-help",
    label: "Self-Help",
    image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=500&q=75",
    description: "Practical guidance for growth, habits, and getting a little better each day.",
  },
  {
    id: "business_and_economics",
    label: "Business",
    image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=500&q=75",
    description: "Strategy, money, and how markets actually work. Lessons from the field.",
  },
  {
    id: "poetry",
    label: "Poetry",
    image: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=500&q=75",
    description: "Language distilled. Verse, rhythm, and feeling in fewer words.",
  },
];

export function getBookSubjects() {
  return BOOK_SUBJECTS;
}

/**
 * OpenLibrary's list/subject endpoints don't return a description — only
 * the single-work endpoint does. This is the books-specific "how to fetch
 * one item's extra detail" plugged into the generic enrichTopItems
 * helper — any future provider whose list endpoint is missing a field
 * follows the same shape: write one `fetchOne(item)` function, hand it
 * to enrichTopItems.
 */
async function fetchBookDescription(client, work) {
  const workId = bookWorkId(work.id);
  if (!workId) return { ...work, description: null };
  const data = await client.get(`/works/${workId}.json`);
  const raw = typeof data.description === "string" ? data.description : data.description?.value || null;
  return { ...work, description: cleanDescription(raw) };
}

/** Shapes a raw OpenLibrary "subject" work into the same shape as the others. */
function normalizeSubjectWork(work) {
  return {
    id: work.key,
    title: work.title,
    author: work.authors?.[0]?.name || null,
    rating: null,
    year: work.first_publish_year || null,
    cover: openLibraryCoverUrl(work.cover_id, "M"),
    url: work.key ? `https://openlibrary.org${work.key}` : null,
  };
}

/**
 * Books within a single subject/category, highest-rated first, with
 * descriptions. Paginated — not capped to a fixed top N; the caller
 * requests the next `page` as the user scrolls, until `hasMore` is false.
 */
export async function getBooksBySubject(subjectId, { limit = 10, page = 1 } = {}) {
  const client = getOpenLibraryClient();
  const offset = (page - 1) * limit;
  const data = await client.get(`/subjects/${subjectId}.json`, { params: { limit, offset } });
  const works = sortByRatingDesc((data.works || []).map(normalizeSubjectWork));
  const books = await enrichTopItems(works, works.length, (work) => fetchBookDescription(client, work));
  return { books, hasMore: offset + works.length < (data.work_count || 0) };
}

/** Trending books — daily/weekly/monthly/yearly window. */
export async function getTrendingBooks({ window = "daily" } = {}) {
  const client = getOpenLibraryClient();
  const data = await client.get(`/trending/${window}.json`);
  return (data.works || []).map(normalizeTrendingWork);
}

/**
 * Free-text book search, paginated the same way as getBooksBySubject —
 * the caller requests the next `page` as the user scrolls.
 */
export async function searchBooks(query, { limit = 10, page = 1 } = {}) {
  const trimmed = String(query || "").trim();
  if (!trimmed) return { books: [], hasMore: false };

  const client = getOpenLibraryClient();
  const data = await client.get("/search.json", { params: { q: trimmed, limit, page } });
  const docs = sortByRatingDesc((data.docs || []).map(normalizeSearchDoc));
  const books = await enrichTopItems(docs, docs.length, (doc) => fetchBookDescription(client, doc));
  return { books, hasMore: page * limit < (data.numFound || 0) };
}

/** Strips a work key ("/works/OL123W") down to the bare ID ("OL123W") for use in URLs. */
export function bookWorkId(key) {
  return key ? key.replace("/works/", "") : null;
}

/** Full details for a single book — powers /top10/book-<workId>. */
export async function getBookDetails(workId) {
  const client = getOpenLibraryClient();
  const work = await client.get(`/works/${workId}.json`);

  const authorKey = work.authors?.[0]?.author?.key;
  let author = null;
  if (authorKey) {
    try {
      const authorData = await client.get(`${authorKey}.json`);
      author = authorData.name || null;
    } catch {
      author = null;
    }
  }

  const rawDescription = typeof work.description === "string" ? work.description : work.description?.value || null;
  const description = cleanDescription(rawDescription);

  return {
    id: workId,
    title: work.title,
    author,
    description,
    year: work.first_publish_date || null,
    subjects: (work.subjects || []).slice(0, 6),
    cover: openLibraryCoverUrl(work.covers?.[0], "L"),
    url: `https://openlibrary.org/works/${workId}`,
  };
}
