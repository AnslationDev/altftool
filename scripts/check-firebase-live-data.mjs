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

if (failures.length) {
  console.error("Firebase live data check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error(JSON.stringify(summary, null, 2));
  process.exit(1);
}

console.log("Firebase live data check passed.");
console.log(JSON.stringify(summary, null, 2));
