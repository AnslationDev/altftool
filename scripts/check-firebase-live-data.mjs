import {
  isDisplayableAcademy,
  isDisplayableExtension,
  isDisplayableTrendingVideo,
  normalizeAcademy,
  normalizeExtension,
  normalizeTrendingVideo,
} from "@altftool/core/firebaseContent";

const DEFAULT_FIREBASE_API_KEY = "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";
const DEFAULT_FIREBASE_PROJECT_ID = "altftool-bca36";
const ALTFT_PROJECT_ID = "altftool";

const firebaseApiKey =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY || DEFAULT_FIREBASE_API_KEY;
const firebaseProjectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_PROJECT_ID;

function firestoreUrl(path) {
  return `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/${path}?key=${firebaseApiKey}`;
}

function firestoreCollectionUrl(path, params = {}) {
  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/${path}`,
  );
  url.searchParams.set("key", firebaseApiKey);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }

  return url.toString();
}

function firestoreParentUrl(parentPath, endpoint) {
  return `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/${parentPath}:${endpoint}?key=${firebaseApiKey}`;
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

async function readDocument(path) {
  const response = await fetch(firestoreUrl(path));
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`${path} read failed with HTTP ${response.status}`);
  }

  return decodeFields(payload.fields || {});
}

async function listDocuments(path, pageSize = 10) {
  const response = await fetch(firestoreCollectionUrl(path, { pageSize }));
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`${path} list failed with HTTP ${response.status}`);
  }

  return (payload.documents || []).map((document) => ({
    id: document.name?.split("/").pop() || "",
    ...decodeFields(document.fields || {}),
  }));
}

async function runQuery(parentPath, structuredQuery) {
  const response = await fetch(firestoreParentUrl(parentPath, "runQuery"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ structuredQuery }),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`${parentPath}:runQuery failed with HTTP ${response.status}`);
  }

  return Array.isArray(payload) ? payload : [];
}

function countArray(data, fields) {
  for (const field of fields) {
    if (Array.isArray(data[field])) return data[field].length;
  }
  return 0;
}

function assertMinimum(failures, label, value, minimum = 1) {
  if (value < minimum) {
    failures.push(`${label} expected >= ${minimum}, got ${value}`);
  }
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

const buySmartDocs = [
  { id: "hero", fields: ["banner"] },
  { id: "categories", fields: ["banner"] },
  { id: "store", fields: ["banner"] },
  { id: "trending", fields: ["banner"] },
  { id: "featurebrand", fields: ["features", "banner"] },
  { id: "ruleSet", fields: ["banner"] },
];

const failures = [];
const summary = {
  projectId: firebaseProjectId,
  buySmart: {},
  blogs: {},
  extensions: {},
  academy: {},
  trendingVideos: {},
  consumerRating: {},
};

for (const docConfig of buySmartDocs) {
  const path = `projects/${ALTFT_PROJECT_ID}/buySmart/${docConfig.id}`;
  const data = await readDocument(path);
  const itemCount = countArray(data, docConfig.fields);

  summary.buySmart[docConfig.id] = {
    itemCount,
    fields: Object.keys(data).sort(),
  };

  assertMinimum(failures, `BuySmart ${docConfig.id}`, itemCount);
}

const blogRows = await runQuery(`projects/${ALTFT_PROJECT_ID}`, {
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
});

const blogDocs = blogRows.filter((row) => row.document);
summary.blogs.firstPageCount = blogDocs.length;
summary.blogs.firstSlug = blogDocs[0]
  ? decodeFields(blogDocs[0].document.fields || {}).slug || null
  : null;

assertMinimum(failures, "published blogs first page", blogDocs.length);

const extensionRows = await listDocuments(`projects/${ALTFT_PROJECT_ID}/extensions`, 10);
const displayableExtensions = extensionRows
  .map((row) => normalizeExtension(row, row.id))
  .filter(isDisplayableExtension);
summary.extensions = {
  ...summarizeRows(extensionRows, ["name", "slug"]),
  displayableCount: displayableExtensions.length,
};
assertMinimum(failures, "extensions first page", extensionRows.length);
assertMinimum(failures, "displayable extensions first page", displayableExtensions.length);

const academyRows = await listDocuments(`projects/${ALTFT_PROJECT_ID}/academy`, 10);
const displayableAcademies = academyRows
  .map((row) => normalizeAcademy(row, row.id))
  .filter(isDisplayableAcademy);
summary.academy = {
  ...summarizeRows(academyRows, ["name", "academyUrl"]),
  displayableCount: displayableAcademies.length,
};
assertMinimum(failures, "academy first page", academyRows.length);
assertMinimum(failures, "displayable academy first page", displayableAcademies.length);

const trendingVideoRows = await listDocuments(`projects/${ALTFT_PROJECT_ID}/trendingvideos`, 10);
const displayableTrendingVideos = trendingVideoRows
  .map((row) => normalizeTrendingVideo(row, row.id))
  .filter(isDisplayableTrendingVideo);
summary.trendingVideos = {
  ...summarizeRows(trendingVideoRows, ["name", "videoUrl"]),
  videoCount: trendingVideoRows.filter((row) => String(row.type || "").toLowerCase() !== "shorts").length,
  shortsCount: trendingVideoRows.filter((row) => String(row.type || "").toLowerCase() === "shorts").length,
  displayableCount: displayableTrendingVideos.length,
};
assertMinimum(failures, "trending videos first page", trendingVideoRows.length);
assertMinimum(failures, "displayable trending videos first page", displayableTrendingVideos.length);

for (const collectionId of ["categories", "subcategories", "brands"]) {
  const rows = await listDocuments(
    `projects/${ALTFT_PROJECT_ID}/consumerrating/data/${collectionId}`,
    20,
  );

  summary.consumerRating[collectionId] = summarizeStatusRows(rows);
  assertMinimum(failures, `consumer rating ${collectionId}`, rows.length);
  assertMinimum(
    failures,
    `active consumer rating ${collectionId}`,
    summary.consumerRating[collectionId].activeCount,
  );
}

if (failures.length) {
  console.error("Firebase live data check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error(JSON.stringify(summary, null, 2));
  process.exit(1);
}

console.log("Firebase live data check passed.");
console.log(JSON.stringify(summary, null, 2));
