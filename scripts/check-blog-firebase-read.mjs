const DEFAULT_FIREBASE_API_KEY = "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";
const DEFAULT_FIREBASE_PROJECT_ID = "altftool-bca36";
const ALTFT_PROJECT_ID = "altftool";

const args = process.argv.slice(2);
const jsonMode = args.includes("--json");
const limitArg = args.find((arg) => arg.startsWith("--limit="))?.split("=")[1];
const limit = Math.min(Math.max(Number(limitArg || process.env.ALTFT_BLOG_FIREBASE_READ_LIMIT || 5), 1), 20);
const timeoutMs = Number(process.env.ALTFT_BLOG_FIREBASE_READ_TIMEOUT_MS || 8000);
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || DEFAULT_FIREBASE_API_KEY;
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_PROJECT_ID;
const firestoreParent = `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/projects/${ALTFT_PROJECT_ID}`;

function firestoreValueToJs(value) {
  if (!value) return undefined;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return Boolean(value.booleanValue);
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(firestoreValueToJs);
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields || {}).map(([key, nestedValue]) => [
        key,
        firestoreValueToJs(nestedValue),
      ]),
    );
  }
  return undefined;
}

function decodeDocument(document) {
  return {
    id: document.name?.split("/").pop() || "",
    ...Object.fromEntries(
      Object.entries(document.fields || {}).map(([key, value]) => [
        key,
        firestoreValueToJs(value),
      ]),
    ),
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

async function runQuery(structuredQuery, label) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${firestoreParent}:runQuery?key=${apiKey}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ structuredQuery }),
      cache: "no-store",
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload?.error?.message || `${label} failed with HTTP ${response.status}`);
    }

    return Array.isArray(payload) ? payload : [];
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`${label} timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function publishedBlogQuery({ sampleLimit = limit, slug, includeDetail = false } = {}) {
  const fields = [
    "heading",
    "slug",
    "status",
    "category",
    "createdAt",
    "updatedAt",
    "commentsCount",
    "likesCount",
    ...(includeDetail ? ["description", "content", "body"] : []),
  ];

  return {
    select: {
      fields: fields.map((fieldPath) => ({ fieldPath })),
    },
    from: [{ collectionId: "blogs" }],
    where: andFilter([
      fieldFilter("status", "EQUAL", { stringValue: "published" }),
      slug ? fieldFilter("slug", "EQUAL", { stringValue: slug }) : null,
    ]),
    orderBy: slug ? undefined : [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
    limit: slug ? 1 : sampleLimit,
  };
}

function compactQuery(query) {
  return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined));
}

function validateBlogs(blogs) {
  const failures = [];
  const slugs = blogs.map((blog) => blog.slug).filter(Boolean);
  const duplicateSlugs = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);

  if (!blogs.length) failures.push("No published blog documents returned from Firebase.");
  if (blogs.some((blog) => !blog.slug || !blog.heading)) {
    failures.push("At least one sampled blog is missing heading or slug.");
  }
  if (duplicateSlugs.length) {
    failures.push(`Duplicate sampled slugs: ${[...new Set(duplicateSlugs)].join(", ")}`);
  }

  return failures;
}

const listRows = await runQuery(compactQuery(publishedBlogQuery()), "Published blog list query");
const blogs = listRows.filter((row) => row.document).map((row) => decodeDocument(row.document));
const failures = validateBlogs(blogs);
const firstBlog = blogs[0] || null;
let detail = null;

if (firstBlog?.slug) {
  const detailRows = await runQuery(
    compactQuery(publishedBlogQuery({ slug: firstBlog.slug, includeDetail: true })),
    `Published blog detail query for ${firstBlog.slug}`,
  );
  detail = detailRows.find((row) => row.document)?.document
    ? decodeDocument(detailRows.find((row) => row.document).document)
    : null;

  const detailBody = String(detail?.description || detail?.content || detail?.body || "");
  if (!detail?.slug || detail.slug !== firstBlog.slug) {
    failures.push("Detail query did not return the sampled blog slug.");
  }
  if (detailBody.replace(/<[^>]*>/g, " ").trim().length < 120) {
    failures.push("Sampled blog detail content is too short or missing.");
  }
}

const report = {
  ok: failures.length === 0,
  generatedAt: new Date().toISOString(),
  firebaseProjectId,
  altfProjectId: ALTFT_PROJECT_ID,
  sampleCount: blogs.length,
  firstBlog: firstBlog
    ? {
        heading: firstBlog.heading,
        slug: firstBlog.slug,
        category: firstBlog.category || null,
        url: `https://altftool.com/blogs/${firstBlog.slug}`,
      }
    : null,
  detailFields: detail ? Object.keys(detail).sort() : [],
  failures,
};

if (jsonMode) {
  console.log(JSON.stringify(report, null, 2));
} else if (report.ok) {
  console.log("Firebase blog read check passed.");
  console.log(
    `${report.sampleCount} published blogs sampled from ${firebaseProjectId}; first: ${report.firstBlog.heading} (/blogs/${report.firstBlog.slug}).`,
  );
} else {
  console.error("Firebase blog read check failed.");
  failures.forEach((failure) => console.error(`- ${failure}`));
}

if (!report.ok) process.exit(1);
