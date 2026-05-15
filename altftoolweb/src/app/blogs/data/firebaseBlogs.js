import { BLOG_REMOTE_LIMIT, normalizeBlog, sortBlogsByDate } from "./blogs";

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";
const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36";
const PROJECT_ID = "altftool";
const FIRESTORE_PARENT = `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/projects/${PROJECT_ID}`;
const CACHE_SECONDS = 300;

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

  const response = await fetch(
    `https://firestore.googleapis.com/v1/${FIRESTORE_PARENT}:${endpoint}?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      next: { revalidate: CACHE_SECONDS },
    }
  );

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
      offset: Math.max(0, Number(offset) || 0),
      limit: Math.min(Math.max(1, Number(pageSize) || BLOG_REMOTE_LIMIT), 100),
    },
  });

  return rows
    .filter((row) => row.document)
    .map((row, index) =>
      normalizeBlog(decodeDocument(row.document), offset + index)
    );
}

export async function fetchFirebaseBlogBySlug(slug) {
  if (!slug) return null;

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
  return document ? normalizeBlog(decodeDocument(document)) : null;
}

export async function fetchFirebaseRelatedBlogs(category, excludeSlug, limit = 6) {
  if (!category) return [];

  const posts = await fetchFirebaseBlogsPage({
    pageSize: Math.min(limit + 4, 20),
    category,
  });

  return posts.filter((post) => post.slug !== excludeSlug).slice(0, limit);
}

export async function fetchFirebaseBlogCount() {
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
  return Number(value?.integerValue || 0);
}

export async function getFirebaseBlogCatalog() {
  const [posts, count] = await Promise.all([
    fetchFirebaseBlogsPage({ pageSize: BLOG_REMOTE_LIMIT }),
    fetchFirebaseBlogCount().catch(() => 0),
  ]);

  return {
    posts: sortBlogsByDate(posts),
    count: Math.max(count, posts.length),
    offset: posts.length,
  };
}
