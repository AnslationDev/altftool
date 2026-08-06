import { BLOG_REMOTE_LIMIT, normalizeBlog, sortBlogsByDate } from "./blogs";
import { fetchJsonWithRetry } from "@/lib/server/resilientJsonFetch";

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";
const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36";
const PROJECT_ID = "altftool";
const FIRESTORE_PARENT = `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/projects/${PROJECT_ID}`;
const CACHE_SECONDS = 300;
const CACHE_MS = CACHE_SECONDS * 1000;
const NEGATIVE_CACHE_SECONDS = 30;
// "Not found"/empty results are cached briefly (not for the full 5 minutes):
// caching null for 300s made freshly published posts 404 for up to 5 minutes.
const NEGATIVE_CACHE_MS = NEGATIVE_CACHE_SECONDS * 1000;
const MAX_MEMORY_CACHE_ENTRIES = 200;
const LEGACY_SLUG_SCAN_LIMIT = 500;
const LEGACY_SLUG_SCAN_PAGE_SIZE = 100;
const MAX_FALLBACK_SLUG_LENGTH = 256;
// 3.5s was borderline on cold starts and flapped requests onto the static
// fallback (listing/search then silently showed stale data). 8s default,
// still overridable via env.
const FIRESTORE_TIMEOUT_MS = Number(process.env.ALTFT_FIRESTORE_REST_TIMEOUT_MS || 8000);
const FIRESTORE_MAX_ATTEMPTS = Number(
  process.env.ALTFT_FIRESTORE_REST_MAX_ATTEMPTS || 3
);

const LIST_FIELDS = [
  "heading",
  "slug",
  "category",
  "author",
  "authorRole",
  "reviewedBy",
  "editorialNote",
  "reviewedAt",
  "sources",
  "sourceNotes",
  "date",
  "seoDescription",
  "excerpt",
  "status",
  "createdAt",
  "updatedAt",
  "image",
  "imageAlt",
  "seoTitle",
  "views",
  "likesCount",
  "commentsCount",
  "feedbackCount",
  "helpfulCount",
  "notHelpfulCount",
  "toolClickCount",
  "lastToolClick",
  "tool",
  "topic",
  "readTimeMinutes",
  "tags",
];

const DETAIL_FIELDS = [...LIST_FIELDS, "description", "content", "body", "faq", "faqs", "faqItems"];
const memoryCache = new Map();
const inflightRequests = new Map();
const CACHE_MISS = Symbol("firebase-blog-cache-miss");
let legacySlugIndexRequest = null;

export function describeFirebaseBlogError(error) {
  const message = String(error?.message || error || "Firebase blog read failed.");
  const status = message.match(/failed:\s*(\d+)/i)?.[1];

  if (/timed out/i.test(message)) {
    return `${message}. Showing static blog fallback.`;
  }

  if (status) {
    return `Firestore blog read failed with HTTP ${status}. Showing static blog fallback.`;
  }

  return `${message} Showing static blog fallback.`;
}

function cacheKey(name, value = {}) {
  return `${name}:${JSON.stringify(value)}`;
}

function readCache(key) {
  const cached = memoryCache.get(key);
  if (!cached || cached.expiresAt <= Date.now()) {
    // NOTE: entry is intentionally kept so readStaleCache() can serve the
    // last known-good value when Firestore errors out.
    return CACHE_MISS;
  }
  return cached.value;
}

/** Last known-good value, even if expired — lets callers degrade to slightly
    stale LIVE data instead of the static snapshot when Firestore errors. */
function readStaleCache(key) {
  const cached = memoryCache.get(key);
  if (!cached || cached.value === null || cached.value === undefined) return null;
  if (Array.isArray(cached.value) && cached.value.length === 0) return null;
  return cached.value;
}

function writeCache(key, value) {
  const isEmpty =
    value === null ||
    value === undefined ||
    (Array.isArray(value) && value.length === 0);
  if (!memoryCache.has(key) && memoryCache.size >= MAX_MEMORY_CACHE_ENTRIES) {
    const expiredKey = [...memoryCache.entries()].find(
      ([, entry]) => entry.expiresAt <= Date.now()
    )?.[0];
    memoryCache.delete(expiredKey || memoryCache.keys().next().value);
  }

  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + (isEmpty ? NEGATIVE_CACHE_MS : CACHE_MS),
  });
  return value;
}

function firestoreValueToJs(value) {
  if (!value) return undefined;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return Boolean(value.booleanValue);
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) {
    return (value.arrayValue.values || []).map(firestoreValueToJs);
  }
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields || {}).map(([key, nestedValue]) => [
        key,
        firestoreValueToJs(nestedValue),
      ])
    );
  }
  return undefined;
}

function decodeDocument(document) {
  const data = Object.fromEntries(
    Object.entries(document.fields || {}).map(([key, value]) => [
      key,
      firestoreValueToJs(value),
    ])
  );

  return {
    id: document.name.split("/").pop(),
    ...data,
  };
}

function fieldFilter(fieldPath, op, value) {
  return {
    fieldFilter: {
      field: { fieldPath },
      op,
      value,
    },
  };
}

function andFilter(filters) {
  const activeFilters = filters.filter(Boolean);
  if (activeFilters.length === 1) return activeFilters[0];
  return {
    compositeFilter: {
      op: "AND",
      filters: activeFilters,
    },
  };
}

async function firestorePost(
  endpoint,
  body,
  { revalidate = CACHE_SECONDS } = {},
) {
  if (!FIREBASE_API_KEY || !FIREBASE_PROJECT_ID) return [];

  const requestKey = `${endpoint}:${revalidate}:${JSON.stringify(body)}`;
  const inflight = inflightRequests.get(requestKey);
  if (inflight) return inflight;

  const request = fetchJsonWithRetry(
    `https://firestore.googleapis.com/v1/${FIRESTORE_PARENT}:${endpoint}?key=${FIREBASE_API_KEY}`,
    {
      label: `Firestore ${endpoint}`,
      timeoutMs: FIRESTORE_TIMEOUT_MS,
      maxAttempts: FIRESTORE_MAX_ATTEMPTS,
      baseDelayMs: 120,
      maxDelayMs: 800,
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      next: { revalidate },
    }
  ).finally(() => {
    inflightRequests.delete(requestKey);
  });

  inflightRequests.set(requestKey, request);
  return request;
}

export async function fetchFirebaseBlogsPage({
  pageSize = BLOG_REMOTE_LIMIT,
  offset = 0,
  category,
  includeDescription = false,
} = {}) {
  const normalizedOffset = Math.max(0, Number(offset) || 0);
  const normalizedPageSize = Math.min(Math.max(1, Number(pageSize) || BLOG_REMOTE_LIMIT), 100);
  const key = cacheKey("blogsPage", {
    pageSize: normalizedPageSize,
    offset: normalizedOffset,
    category: category || "",
    includeDescription: Boolean(includeDescription),
  });
  const cached = readCache(key);
  if (cached !== CACHE_MISS) return cached;

  const fields = includeDescription ? DETAIL_FIELDS : LIST_FIELDS;
  const filters = [
    fieldFilter("status", "EQUAL", { stringValue: "published" }),
    category && category !== "All"
      ? fieldFilter("category", "EQUAL", { stringValue: category })
      : null,
  ];

  let rows;
  try {
    rows = await firestorePost("runQuery", {
      structuredQuery: {
        select: {
          fields: fields.map((fieldPath) => ({ fieldPath })),
        },
        from: [{ collectionId: "blogs" }],
        where: andFilter(filters),
        orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
        offset: normalizedOffset,
        limit: normalizedPageSize,
      },
    });
  } catch (error) {
    // Prefer slightly stale LIVE data over the static snapshot on transient
    // Firestore failures; rethrow only when we have nothing better.
    const stale = readStaleCache(key);
    if (stale) return stale;
    throw error;
  }

  const posts = rows
    .filter((row) => row.document)
    .map((row, index) =>
      normalizeBlog(decodeDocument(row.document), normalizedOffset + index)
    );

  return writeCache(key, posts);
}

function isSafeFallbackSlug(slug) {
  return (
    typeof slug === "string" &&
    slug.length > 0 &&
    slug.length <= MAX_FALLBACK_SLUG_LENGTH &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  );
}

function isSafeDocumentId(id) {
  return (
    typeof id === "string" &&
    id.length > 0 &&
    id.length <= 1_500 &&
    !id.includes("/") &&
    id !== "." &&
    id !== ".."
  );
}

async function buildLegacySlugIndex() {
  const key = cacheKey("legacyBlogSlugIndex", {
    limit: LEGACY_SLUG_SCAN_LIMIT,
  });
  const cached = readCache(key);
  if (cached !== CACHE_MISS) return cached;
  if (legacySlugIndexRequest) return legacySlugIndexRequest;

  legacySlugIndexRequest = (async () => {
    try {
      const index = new Map();
      let offset = 0;

      while (offset < LEGACY_SLUG_SCAN_LIMIT) {
        const pageSize = Math.min(
          LEGACY_SLUG_SCAN_PAGE_SIZE,
          LEGACY_SLUG_SCAN_LIMIT - offset,
        );
        const rows = await firestorePost("runQuery", {
          structuredQuery: {
            // Do not download article bodies while recovering legacy identity.
            select: {
              fields: ["heading", "title", "slug"].map((fieldPath) => ({
                fieldPath,
              })),
            },
            from: [{ collectionId: "blogs" }],
            where: fieldFilter("status", "EQUAL", {
              stringValue: "published",
            }),
            orderBy: [
              { field: { fieldPath: "createdAt" }, direction: "DESCENDING" },
            ],
            offset,
            limit: pageSize,
          },
        });
        const documents = rows
          .filter((row) => row.document)
          .map((row) => decodeDocument(row.document));

        for (const [position, document] of documents.entries()) {
          if (!isSafeDocumentId(document.id)) continue;
          if (!document.slug && !document.heading && !document.title) continue;
          // Stored slugs let this path recover from an old cached-empty exact
          // query; missing slugs mirror list normalization and derive from title.
          const fallbackSlug =
            document.slug || normalizeBlog(document, offset + position).slug;
          if (!isSafeFallbackSlug(fallbackSlug)) continue;

          if (!index.has(fallbackSlug)) {
            index.set(fallbackSlug, document.id);
          } else if (index.get(fallbackSlug) !== document.id) {
            // Two documents resolving to one URL is ambiguous. Fail closed
            // rather than returning whichever document happened to sort first.
            index.set(fallbackSlug, null);
          }
        }

        if (documents.length < pageSize) break;
        offset += documents.length;
      }

      return writeCache(key, index);
    } catch (error) {
      const stale = readStaleCache(key);
      if (stale) return stale;
      throw error;
    }
  })().finally(() => {
    legacySlugIndexRequest = null;
  });

  return legacySlugIndexRequest;
}

async function fetchPublishedFirebaseBlogById(id) {
  if (!isSafeDocumentId(id)) return null;

  const documentName = `${FIRESTORE_PARENT}/blogs/${id}`;
  const rows = await firestorePost(
    "runQuery",
    {
      structuredQuery: {
        select: {
          fields: DETAIL_FIELDS.map((fieldPath) => ({ fieldPath })),
        },
        from: [{ collectionId: "blogs" }],
        where: andFilter([
          fieldFilter("status", "EQUAL", { stringValue: "published" }),
          fieldFilter("__name__", "EQUAL", {
            referenceValue: documentName,
          }),
        ]),
        limit: 1,
      },
    },
    { revalidate: NEGATIVE_CACHE_SECONDS },
  );

  const document = rows.find((row) => row.document)?.document;
  return document ? normalizeBlog(decodeDocument(document)) : null;
}

export async function fetchFirebaseBlogBySlug(slug) {
  if (!slug) return null;
  const key = cacheKey("blogBySlug", { slug });
  const cached = readCache(key);
  if (cached !== CACHE_MISS) return cached;

  try {
    const rows = await firestorePost(
      "runQuery",
      {
        structuredQuery: {
          select: {
            fields: DETAIL_FIELDS.map((fieldPath) => ({ fieldPath })),
          },
          from: [{ collectionId: "blogs" }],
          where: andFilter([
            fieldFilter("status", "EQUAL", { stringValue: "published" }),
            fieldFilter("slug", "EQUAL", { stringValue: slug }),
          ]),
          limit: 1,
        },
      },
      { revalidate: NEGATIVE_CACHE_SECONDS },
    );

    const exactDocument = rows.find((row) => row.document)?.document;
    if (exactDocument) {
      return writeCache(key, normalizeBlog(decodeDocument(exactDocument)));
    }

    if (!isSafeFallbackSlug(slug)) return writeCache(key, null);

    const legacyIndex = await buildLegacySlugIndex();
    const legacyDocumentId = legacyIndex.get(slug);
    const legacyBlog = legacyDocumentId
      ? await fetchPublishedFirebaseBlogById(legacyDocumentId)
      : null;
    return writeCache(key, legacyBlog);
  } catch (error) {
    const stale = readStaleCache(key);
    if (stale) return stale;
    throw error;
  }
}

export async function fetchFirebaseRelatedBlogs(category, excludeSlug, limit = 6) {
  if (!category) return [];

  const posts = await fetchFirebaseBlogsPage({
    pageSize: Math.min(limit + 4, 20),
    category,
  });

  return posts.filter((post) => post.slug !== excludeSlug).slice(0, limit);
}

// Admin-managed blog categories (projects/altftool/categories). Used so the
// frontend category list stays in sync with Admin CRUD automatically.
export async function fetchFirebaseBlogCategories() {
  const key = cacheKey("blogCategories");
  const cached = readCache(key);
  if (cached !== CACHE_MISS) return cached;

  let rows;
  try {
    rows = await firestorePost("runQuery", {
      structuredQuery: {
        select: { fields: [{ fieldPath: "name" }] },
        from: [{ collectionId: "categories" }],
        orderBy: [{ field: { fieldPath: "name" }, direction: "ASCENDING" }],
        limit: 200,
      },
    });
  } catch (error) {
    const stale = readStaleCache(key);
    if (stale) return stale;
    throw error;
  }

  const names = rows
    .filter((row) => row.document)
    .map((row) => decodeDocument(row.document).name)
    .filter((name) => typeof name === "string" && name.trim().length > 0)
    .map((name) => name.trim());

  return writeCache(key, names);
}

export async function fetchFirebaseBlogCount() {
  const key = cacheKey("blogCount");
  const cached = readCache(key);
  if (cached !== CACHE_MISS) return cached;

  let rows;
  try {
    rows = await firestorePost("runAggregationQuery", {
      structuredAggregationQuery: {
        structuredQuery: {
          from: [{ collectionId: "blogs" }],
          where: fieldFilter("status", "EQUAL", { stringValue: "published" }),
        },
        aggregations: [{ count: {}, alias: "published_count" }],
      },
    });
  } catch (error) {
    const stale = readStaleCache(key);
    if (stale !== null) return stale;
    throw error;
  }

  const value = rows[0]?.result?.aggregateFields?.published_count;
  return writeCache(key, Number(value?.integerValue || 0));
}

export async function getFirebaseBlogCatalog() {
  const key = cacheKey("blogCatalog");
  const cached = readCache(key);
  if (cached !== CACHE_MISS) return cached;

  const [posts, count] = await Promise.all([
    fetchFirebaseBlogsPage({ pageSize: BLOG_REMOTE_LIMIT }),
    fetchFirebaseBlogCount().catch(() => 0),
  ]);

  return writeCache(key, {
    posts: sortBlogsByDate(posts),
    count: Math.max(count, posts.length),
    offset: posts.length,
  });
}

/**
 * Paginated full-catalog fetch for crawlable server-rendered archives (blog
 * category/tag hubs, HTML index).
 *
 * `getFirebaseBlogCatalog()` only returns the most-recent BLOG_REMOTE_LIMIT
 * (≤100) posts, so hub pages whose posts fall outside that recent slice
 * server-rendered an empty "No articles found" state and offered Googlebot ZERO
 * crawlable links to those posts — which is why hundreds of blog URLs sat in
 * Search Console as "Discovered – currently not indexed" (in the sitemap, but
 * never crawled because nothing linked to them). This loops pages the same way
 * the sitemap does so a hub renders EVERY relevant post as a real <a href>.
 * Optionally filtered by `category` (Firestore field match). Never throws.
 */
export async function fetchAllFirebaseBlogs({ maxPosts = 500, category } = {}) {
  const pageSize = 100;
  const all = [];
  let offset = 0;

  while (all.length < maxPosts) {
    const rows = await fetchFirebaseBlogsPage({
      pageSize: Math.min(pageSize, maxPosts - all.length),
      offset,
      category,
    }).catch(() => []);

    if (!rows.length) break;
    all.push(...rows);
    if (rows.length < pageSize) break;
    offset += rows.length;
  }

  return all;
}
