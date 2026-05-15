import {
  isDisplayableAcademy,
  isDisplayableExtension,
  isDisplayableTrendingVideo,
  normalizeAcademy,
  normalizeExtension,
  normalizeTrendingVideo,
} from "./firebaseContent.js";

const DEFAULT_FIREBASE_API_KEY = "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";
const DEFAULT_FIREBASE_PROJECT_ID = "altftool-bca36";
const ALTFT_PROJECT_ID = "altftool";

const BUYSMART_DOCS = [
  { id: "hero", label: "BuySmart hero", fields: ["banner"] },
  { id: "categories", label: "BuySmart categories", fields: ["banner"] },
  { id: "store", label: "BuySmart stores", fields: ["banner"] },
  { id: "trending", label: "BuySmart trending", fields: ["banner"] },
  { id: "featurebrand", label: "BuySmart feature brands", fields: ["features", "banner"] },
  { id: "ruleSet", label: "BuySmart rule set", fields: ["banner"] },
];

function clampScore(score) {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function envValue(env, name) {
  return typeof env?.[name] === "string" ? env[name].trim() : "";
}

function createConfig(env = process.env) {
  return {
    apiKey: envValue(env, "NEXT_PUBLIC_FIREBASE_API_KEY") || DEFAULT_FIREBASE_API_KEY,
    projectId: envValue(env, "NEXT_PUBLIC_FIREBASE_PROJECT_ID") || DEFAULT_FIREBASE_PROJECT_ID,
  };
}

function firestoreUrl(config, path) {
  return `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/${path}?key=${config.apiKey}`;
}

function firestoreCollectionUrl(config, path, params = {}) {
  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/${path}`,
  );
  url.searchParams.set("key", config.apiKey);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }

  return url.toString();
}

function firestoreParentUrl(config, parentPath, endpoint) {
  return `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/${parentPath}:${endpoint}?key=${config.apiKey}`;
}

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

function decodeFields(fields = {}) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, firestoreValueToJs(value)]),
  );
}

function countArray(data, fields) {
  for (const field of fields) {
    if (Array.isArray(data[field])) return data[field].length;
  }
  return 0;
}

function summarizeRows(rows, fieldCandidates = ["name", "slug", "heading", "title"]) {
  const first = rows[0] || {};

  return {
    firstPageCount: rows.length,
    firstLabel: fieldCandidates.map((field) => first[field]).find(Boolean) || first.id || null,
    firstFields: Object.keys(first).filter((field) => field !== "id").sort(),
  };
}

function summarizeStatusRows(rows) {
  const activeCount = rows.filter((row) => String(row.status || "").toLowerCase() === "active").length;

  return {
    ...summarizeRows(rows),
    activeCount,
  };
}

function createCheck(key, label, value, minimum = 1) {
  const ok = value >= minimum;

  return {
    key,
    label,
    ok,
    value,
    detail: ok ? `${value} sampled` : `Expected at least ${minimum}, got ${value}`,
  };
}

async function fetchJson(url, { fetchImpl, timeoutMs }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      cache: "no-store",
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload?.error?.message || `HTTP ${response.status}`);
    }

    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

async function readDocument(config, path, context) {
  const payload = await fetchJson(firestoreUrl(config, path), context);
  return decodeFields(payload.fields || {});
}

async function listDocuments(config, path, context, pageSize = 10) {
  const payload = await fetchJson(firestoreCollectionUrl(config, path, { pageSize }), context);

  return (payload.documents || []).map((document) => ({
    id: document.name?.split("/").pop() || "",
    ...decodeFields(document.fields || {}),
  }));
}

async function runQuery(config, parentPath, structuredQuery, context) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), context.timeoutMs);

  try {
    const response = await context.fetchImpl(firestoreParentUrl(config, parentPath, "runQuery"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ structuredQuery }),
      cache: "no-store",
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload?.error?.message || `HTTP ${response.status}`);
    }

    return Array.isArray(payload) ? payload : [];
  } finally {
    clearTimeout(timeout);
  }
}

async function withSectionFailure(key, label, task) {
  try {
    return await task();
  } catch (error) {
    const message = error?.name === "AbortError" ? "Timed out." : error?.message || "Read failed.";

    return {
      summary: {},
      checks: [
        {
          key,
          label,
          ok: false,
          value: 0,
          detail: message,
          error: message,
        },
      ],
    };
  }
}

async function buildBuySmartSection(config, context) {
  const entries = await Promise.all(
    BUYSMART_DOCS.map(async (docConfig) => {
      const path = `projects/${ALTFT_PROJECT_ID}/buySmart/${docConfig.id}`;
      const data = await readDocument(config, path, context);
      const itemCount = countArray(data, docConfig.fields);

      return {
        id: docConfig.id,
        label: docConfig.label,
        itemCount,
        fields: Object.keys(data).sort(),
      };
    }),
  );

  return {
    summary: Object.fromEntries(
      entries.map((entry) => [
        entry.id,
        {
          itemCount: entry.itemCount,
          fields: entry.fields,
        },
      ]),
    ),
    checks: entries.map((entry) => createCheck(`buySmart-${entry.id}`, entry.label, entry.itemCount)),
  };
}

async function buildBlogsSection(config, context) {
  const rows = await runQuery(
    config,
    `projects/${ALTFT_PROJECT_ID}`,
    {
      select: {
        fields: [
          { fieldPath: "heading" },
          { fieldPath: "slug" },
          { fieldPath: "status" },
          { fieldPath: "createdAt" },
        ],
      },
      from: [{ collectionId: "blogs" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "status" },
          op: "EQUAL",
          value: { stringValue: "published" },
        },
      },
      orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
      limit: 5,
    },
    context,
  );
  const docs = rows.filter((row) => row.document);
  const firstDoc = docs[0] ? decodeFields(docs[0].document.fields || {}) : {};

  return {
    summary: {
      firstPageCount: docs.length,
      firstSlug: firstDoc.slug || null,
    },
    checks: [createCheck("publishedBlogs", "Published blogs", docs.length)],
  };
}

async function buildExtensionsSection(config, context) {
  const rows = await listDocuments(config, `projects/${ALTFT_PROJECT_ID}/extensions`, context, 10);
  const displayable = rows.map((row) => normalizeExtension(row, row.id)).filter(isDisplayableExtension);

  return {
    summary: {
      ...summarizeRows(rows, ["name", "slug"]),
      displayableCount: displayable.length,
    },
    checks: [
      createCheck("extensions", "Extensions first page", rows.length),
      createCheck("displayableExtensions", "Displayable extensions", displayable.length),
    ],
  };
}

async function buildAcademySection(config, context) {
  const rows = await listDocuments(config, `projects/${ALTFT_PROJECT_ID}/academy`, context, 10);
  const displayable = rows.map((row) => normalizeAcademy(row, row.id)).filter(isDisplayableAcademy);

  return {
    summary: {
      ...summarizeRows(rows, ["name", "academyUrl"]),
      displayableCount: displayable.length,
    },
    checks: [
      createCheck("academy", "Academy first page", rows.length),
      createCheck("displayableAcademy", "Displayable academy", displayable.length),
    ],
  };
}

async function buildTrendingVideosSection(config, context) {
  const rows = await listDocuments(config, `projects/${ALTFT_PROJECT_ID}/trendingvideos`, context, 10);
  const displayable = rows.map((row) => normalizeTrendingVideo(row, row.id)).filter(isDisplayableTrendingVideo);

  return {
    summary: {
      ...summarizeRows(rows, ["name", "videoUrl"]),
      videoCount: rows.filter((row) => String(row.type || "").toLowerCase() !== "shorts").length,
      shortsCount: rows.filter((row) => String(row.type || "").toLowerCase() === "shorts").length,
      displayableCount: displayable.length,
    },
    checks: [
      createCheck("trendingVideos", "Trending videos first page", rows.length),
      createCheck("displayableTrendingVideos", "Displayable trending videos", displayable.length),
    ],
  };
}

async function buildConsumerRatingSection(config, context) {
  const entries = await Promise.all(
    ["categories", "subcategories", "brands"].map(async (collectionId) => {
      const rows = await listDocuments(
        config,
        `projects/${ALTFT_PROJECT_ID}/consumerrating/data/${collectionId}`,
        context,
        20,
      );
      const summary = summarizeStatusRows(rows);

      return {
        collectionId,
        summary,
        checks: [
          createCheck(`consumerRating-${collectionId}`, `Consumer rating ${collectionId}`, rows.length),
          createCheck(
            `activeConsumerRating-${collectionId}`,
            `Active consumer rating ${collectionId}`,
            summary.activeCount,
          ),
        ],
      };
    }),
  );

  return {
    summary: Object.fromEntries(entries.map((entry) => [entry.collectionId, entry.summary])),
    checks: entries.flatMap((entry) => entry.checks),
  };
}

export async function createFirebaseLiveDataReport(options = {}) {
  const config = createConfig(options.env);
  const context = {
    fetchImpl: options.fetchImpl || fetch,
    timeoutMs: options.timeoutMs || 5000,
  };
  const sectionTasks = {
    buySmart: () => withSectionFailure("buySmart", "BuySmart live data", () => buildBuySmartSection(config, context)),
    blogs: () => withSectionFailure("blogs", "Published blogs", () => buildBlogsSection(config, context)),
    extensions: () => withSectionFailure("extensions", "Extensions live data", () => buildExtensionsSection(config, context)),
    academy: () => withSectionFailure("academy", "Academy live data", () => buildAcademySection(config, context)),
    trendingVideos: () =>
      withSectionFailure("trendingVideos", "Trending videos live data", () =>
        buildTrendingVideosSection(config, context),
      ),
    consumerRating: () =>
      withSectionFailure("consumerRating", "Consumer rating live data", () =>
        buildConsumerRatingSection(config, context),
      ),
  };
  const entries = await Promise.all(
    Object.entries(sectionTasks).map(async ([key, task]) => [key, await task()]),
  );
  const sections = Object.fromEntries(entries.map(([key, result]) => [key, result.summary]));
  const checks = entries.flatMap(([, result]) => result.checks);
  const failures = checks
    .filter((check) => !check.ok)
    .map((check) => `${check.label}: ${check.error || check.detail}`);
  const score = clampScore((checks.filter((check) => check.ok).length / checks.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    ok: failures.length === 0,
    status: failures.length === 0 ? "live" : score >= 60 ? "partial" : "unavailable",
    score,
    projectId: config.projectId,
    checks,
    sections,
    failures,
  };
}
