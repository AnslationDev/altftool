import { BLOG_REMOTE_LIMIT, normalizeBlog, sortBlogsByDate } from "./blogs";

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";
const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36";
const PROJECT_ID = "altftool";
const FIRESTORE_PARENT = `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/projects/${PROJECT_ID}`;
const CACHE_SECONDS = 300;
const CACHE_MS = CACHE_SECONDS * 1000;
const FIRESTORE_TIMEOUT_MS = Number(process.env.ALTFT_FIRESTORE_REST_TIMEOUT_MS || 3500);

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
    memoryCache.delete(key);
    return null;
  }
  return cached.value;
}

function writeCache(key, value) {
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_MS,
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

async function firestorePost(endpoint, body) {
  if (!FIREBASE_API_KEY || !FIREBASE_PROJECT_ID) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FIRESTORE_TIMEOUT_MS);

  let response;

  try {
    response = await fetch(
      `https://firestore.googleapis.com/v1/${FIRESTORE_PARENT}:${endpoint}?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        next: { revalidate: CACHE_SECONDS },
        signal: controller.signal,
      }
    );
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`Firestore ${endpoint} timed out after ${FIRESTORE_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Firestore ${endpoint} failed: ${response.status}`);
  }

  return response.json();
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
  if (cached) return cached;

  const fields = includeDescription ? DETAIL_FIELDS : LIST_FIELDS;
  const filters = [
    fieldFilter("status", "EQUAL", { stringValue: "published" }),
    category && category !== "All"
      ? fieldFilter("category", "EQUAL", { stringValue: category })
      : null,
  ];

  const rows = await firestorePost("runQuery", {
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

  const posts = rows
    .filter((row) => row.document)
    .map((row, index) =>
      normalizeBlog(decodeDocument(row.document), normalizedOffset + index)
    );

  return writeCache(key, posts);
}

export async function fetchFirebaseBlogBySlug(slug) {
  if (!slug) return null;
  const key = cacheKey("blogBySlug", { slug });
  const cached = readCache(key);
  if (cached) return cached;

  const rows = await firestorePost("runQuery", {
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
  });

  const document = rows.find((row) => row.document)?.document;
  return writeCache(key, document ? normalizeBlog(decodeDocument(document)) : null);
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
  if (cached) return cached;

  const rows = await firestorePost("runQuery", {
    structuredQuery: {
      select: { fields: [{ fieldPath: "name" }] },
      from: [{ collectionId: "categories" }],
      orderBy: [{ field: { fieldPath: "name" }, direction: "ASCENDING" }],
      limit: 200,
    },
  });

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
  if (cached !== null) return cached;

  const rows = await firestorePost("runAggregationQuery", {
    structuredAggregationQuery: {
      structuredQuery: {
        from: [{ collectionId: "blogs" }],
        where: fieldFilter("status", "EQUAL", { stringValue: "published" }),
      },
      aggregations: [{ count: {}, alias: "published_count" }],
    },
  });

  const value = rows[0]?.result?.aggregateFields?.published_count;
  return writeCache(key, Number(value?.integerValue || 0));
}

export async function getFirebaseBlogCatalog() {
  const key = cacheKey("blogCatalog");
  const cached = readCache(key);
  if (cached) return cached;

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
