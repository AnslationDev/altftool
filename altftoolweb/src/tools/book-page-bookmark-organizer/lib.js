/**
 * Bookmark page organiser for books.
 *
 * Builds a back-of-book style topic index across MULTIPLE books: entries are
 * grouped by topic, and within a topic sorted by book title then first page —
 * the same ordering convention a printed subject index uses.
 */

/** Practical upper bound so a typo like 100000 is caught; longest common textbooks stay under this. */
export const MAX_PAGE = 20000;

/**
 * Validate and normalise one bookmark row.
 * @param {object} input
 * @param {string} input.topic
 * @param {string} input.book
 * @param {number|string} input.pageFrom
 * @param {number|string} [input.pageTo]   Optional range end; blank = single page.
 * @param {string} [input.note]
 * @returns {object} cleaned bookmark or { error }
 */
export function validateBookmark({ topic, book, pageFrom, pageTo, note }) {
  const cleanTopic = typeof topic === "string" ? topic.trim() : "";
  const cleanBook = typeof book === "string" ? book.trim() : "";
  if (cleanTopic === "") return { error: "Every bookmark needs a topic." };
  if (cleanBook === "") return { error: `"${cleanTopic}": name the book the page is in.` };

  const from = Number(pageFrom);
  if (!Number.isInteger(from) || from < 1 || from > MAX_PAGE) {
    return { error: `"${cleanTopic}" in ${cleanBook}: start page must be a whole number between 1 and ${MAX_PAGE}.` };
  }

  const hasTo = pageTo !== undefined && pageTo !== null && String(pageTo).trim() !== "";
  let to = from;
  if (hasTo) {
    to = Number(pageTo);
    if (!Number.isInteger(to) || to < 1 || to > MAX_PAGE) {
      return { error: `"${cleanTopic}" in ${cleanBook}: end page must be a whole number between 1 and ${MAX_PAGE}.` };
    }
    if (to < from) {
      return { error: `"${cleanTopic}" in ${cleanBook}: end page (${to}) is before start page (${from}).` };
    }
  }

  return {
    topic: cleanTopic,
    book: cleanBook,
    pageFrom: from,
    pageTo: to,
    pages: to - from + 1,
    note: typeof note === "string" ? note.trim() : "",
  };
}

/**
 * Group bookmarks into a sorted topic index.
 * @param {object} input
 * @param {Array<object>} input.bookmarks
 * @returns {object} { groups, totalBookmarks, topicCount, bookCount, biggestTopic, totalPages } or { error }
 */
export function buildIndex({ bookmarks }) {
  if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
    return { error: "Add at least one page reference to build the index." };
  }

  const cleaned = [];
  for (const raw of bookmarks) {
    const entry = validateBookmark(raw);
    if (entry.error) return { error: entry.error };
    cleaned.push(entry);
  }

  // Group case-insensitively by topic so "Federalism" and "federalism" merge.
  const byTopic = new Map();
  for (const entry of cleaned) {
    const key = entry.topic.toLowerCase();
    if (!byTopic.has(key)) byTopic.set(key, { topic: entry.topic, entries: [] });
    byTopic.get(key).entries.push(entry);
  }

  const groups = [...byTopic.values()]
    .map((group) => ({
      topic: group.topic,
      entries: [...group.entries].sort(
        (a, b) => a.book.localeCompare(b.book) || a.pageFrom - b.pageFrom,
      ),
      totalPages: group.entries.reduce((sum, e) => sum + e.pages, 0),
    }))
    .sort((a, b) => a.topic.localeCompare(b.topic));

  const books = new Set(cleaned.map((entry) => entry.book.toLowerCase()));
  const biggestTopic = groups.reduce((big, group) => (group.entries.length > big.entries.length ? group : big));

  return {
    groups,
    totalBookmarks: cleaned.length,
    topicCount: groups.length,
    bookCount: books.size,
    biggestTopic: biggestTopic.topic,
    totalPages: cleaned.reduce((sum, entry) => sum + entry.pages, 0),
  };
}

/** Render the index as plain text, one topic block per group, for copying into notes. */
export function formatIndexText(index) {
  if (!index || !Array.isArray(index.groups)) return "";
  return index.groups
    .map((group) => {
      const lines = group.entries.map((entry) => {
        const range = entry.pageFrom === entry.pageTo ? `p. ${entry.pageFrom}` : `pp. ${entry.pageFrom}-${entry.pageTo}`;
        return `  ${entry.book} — ${range}${entry.note ? ` (${entry.note})` : ""}`;
      });
      return [`${group.topic}:`, ...lines].join("\n");
    })
    .join("\n\n");
}
