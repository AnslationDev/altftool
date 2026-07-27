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

const DEFAULT_SAMPLE_LIMIT = 25;
const BLOG_CONTENT_FIELDS = ["content", "body", "html", "article", "description", "excerpt", "summary"];
const TEXT_TITLE_FIELDS = ["heading", "title", "name"];
const VALID_STATUSES = new Set(["active", "published", "draft", "inactive", "paused", "scheduled", "enabled", "disabled"]);

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

function firestoreDocumentUrl(config, documentPath) {
  return firestoreCollectionUrl(config, documentPath);
}

function firestoreParentUrl(config, parentPath, endpoint) {
  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/${parentPath}:${endpoint}`,
  );
  url.searchParams.set("key", config.apiKey);
  return url.toString();
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

function decodeDocument(document = {}) {
  return {
    id: document.name?.split("/").pop() || "",
    ...decodeFields(document.fields || {}),
  };
}

async function fetchJson(url, { fetchImpl, timeoutMs, method = "GET", body }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      body,
      cache: "no-store",
      headers: body ? { "content-type": "application/json" } : undefined,
      method,
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

async function readDocument(config, documentPath, context) {
  const payload = await fetchJson(firestoreDocumentUrl(config, documentPath), context);
  return decodeFields(payload.fields || {});
}

async function listDocuments(config, collectionPath, context, pageSize = DEFAULT_SAMPLE_LIMIT) {
  const payload = await fetchJson(
    firestoreCollectionUrl(config, collectionPath, { pageSize }),
    context,
  );

  return (payload.documents || []).map(decodeDocument);
}

async function runQuery(config, parentPath, structuredQuery, context) {
  const payload = await fetchJson(firestoreParentUrl(config, parentPath, "runQuery"), {
    ...context,
    body: JSON.stringify({ structuredQuery }),
    method: "POST",
  });

  return Array.isArray(payload) ? payload : [];
}

function cleanText(value) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function fieldText(data, fields) {
  for (const field of fields) {
    const value = cleanText(data[field]);
    if (value) return value;
  }
  return "";
}

function firstArray(data, fields) {
  for (const field of fields) {
    if (Array.isArray(data[field])) return data[field];
  }
  return [];
}

function isSlug(value) {
  return /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(cleanText(value));
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(cleanText(value));
}

function isAssetUrl(value) {
  const url = cleanText(value);
  return Boolean(url && (url.startsWith("/") || /^https?:\/\//i.test(url) || /^data:image\//i.test(url)));
}

function isInactiveLike(data = {}) {
  const status = cleanText(data.status).toLowerCase();
  return ["inactive", "disabled", "draft", "paused", "archived"].includes(status);
}

function createCheck(key, label, ok, detail, value = ok ? 1 : 0) {
  return {
    key,
    label,
    ok,
    value,
    detail,
  };
}

function createIssue(severity, section, message, extra = {}) {
  return {
    severity,
    section,
    message,
    ...extra,
  };
}

function duplicateValues(rows, getter) {
  const counts = new Map();
  for (const row of rows) {
    const value = cleanText(getter(row)).toLowerCase();
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }

  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value);
}

function summarizeRows(rows, labelFields = ["name", "slug", "heading", "title"]) {
  const first = rows[0] || {};

  return {
    sampled: rows.length,
    firstLabel: labelFields.map((field) => first[field]).find(Boolean) || first.id || null,
    firstFields: Object.keys(first).filter((field) => field !== "id").sort(),
  };
}

function validateDuplicateSlugs(rows, section, getter = (row) => row.slug) {
  return duplicateValues(rows, getter).map((slug) =>
    createIssue("failure", section, `${section}: duplicate slug/id "${slug}" found in sampled data`, { slug }),
  );
}

function validateStatus(row, section, id) {
  const status = cleanText(row.status).toLowerCase();
  if (!status) return [];
  if (VALID_STATUSES.has(status)) return [];

  return [
    createIssue("warning", section, `${section}: ${id} has unknown status "${row.status}"`, {
      id,
      field: "status",
    }),
  ];
}

async function withSectionFailure(key, label, task) {
  try {
    return await task();
  } catch (error) {
    const message = error?.name === "AbortError" ? "Timed out." : error?.message || "Read failed.";

    return {
      summary: { sampled: 0, error: message },
      checks: [createCheck(key, label, false, message, 0)],
      issues: [createIssue("failure", key, `${label}: ${message}`)],
    };
  }
}

function validateBlogRows(rows) {
  const issues = [...validateDuplicateSlugs(rows, "blogs")];

  for (const row of rows) {
    const id = cleanText(row.id || row.slug || row.heading || row.title) || "sampled blog";
    const title = fieldText(row, TEXT_TITLE_FIELDS);
    const slug = cleanText(row.slug);
    const contentText = fieldText(row, BLOG_CONTENT_FIELDS);
    const metaDescription = cleanText(row.metaDescription || row.description || row.excerpt);

    if (!title || title.length < 8) {
      issues.push(createIssue("failure", "blogs", `blogs: ${id} is missing a readable title`, { id }));
    }
    if (!slug || !isSlug(slug)) {
      issues.push(createIssue("failure", "blogs", `blogs: ${id} has an invalid slug`, { id, slug }));
    }
    if (!contentText || contentText.length < 120) {
      issues.push(createIssue("warning", "blogs", `blogs: ${id} has thin sampled article content`, { id }));
    }
    if (!metaDescription || metaDescription.length < 50) {
      issues.push(createIssue("warning", "blogs", `blogs: ${id} should have a stronger meta description/excerpt`, { id }));
    }

    issues.push(...validateStatus(row, "blogs", id));
  }

  return issues;
}

async function buildBlogsSection(config, context) {
  const rows = await runQuery(
    config,
    `projects/${ALTFT_PROJECT_ID}`,
    {
      select: {
        fields: [
          { fieldPath: "heading" },
          { fieldPath: "title" },
          { fieldPath: "slug" },
          { fieldPath: "status" },
          { fieldPath: "createdAt" },
          { fieldPath: "metaDescription" },
          { fieldPath: "description" },
          { fieldPath: "excerpt" },
          { fieldPath: "content" },
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
      limit: context.sampleLimit,
    },
    context,
  );
  const docs = rows.filter((row) => row.document).map((row) => decodeDocument(row.document));
  const issues = validateBlogRows(docs);
  const validSlugs = docs.filter((row) => isSlug(row.slug)).length;

  return {
    summary: {
      ...summarizeRows(docs, ["heading", "title", "slug"]),
      validSlugs,
      duplicateSlugs: duplicateValues(docs, (row) => row.slug),
    },
    checks: [
      createCheck("blogs-sampled", "Published blogs sampled", docs.length > 0, `${docs.length} sampled`, docs.length),
      createCheck("blogs-valid-slugs", "Published blog slugs", validSlugs === docs.length && docs.length > 0, `${validSlugs}/${docs.length} valid`, validSlugs),
    ],
    issues,
  };
}

function validateExtensionRows(rows) {
  const normalizedRows = rows.map((row) => normalizeExtension(row, row.id));
  const issues = [...validateDuplicateSlugs(normalizedRows, "extensions")];

  for (let index = 0; index < rows.length; index += 1) {
    const raw = rows[index];
    const row = normalizedRows[index];
    const id = cleanText(row.id || raw.id || row.slug) || "sampled extension";

    if (isInactiveLike(raw)) {
      issues.push(...validateStatus(raw, "extensions", id));
      continue;
    }

    if (!isDisplayableExtension(row)) {
      issues.push(createIssue("warning", "extensions", `extensions: ${id} is not displayable on public cards`, { id }));
    }
    if (!isSlug(row.slug)) {
      issues.push(createIssue("failure", "extensions", `extensions: ${id} has an invalid slug`, { id, slug: row.slug }));
    }
    if (!row.image) {
      issues.push(createIssue("warning", "extensions", `extensions: ${id} is missing an image/logo`, { id }));
    }
    if (cleanText(raw.chromeUrl || raw.chromeStoreUrl || raw.url || raw.link) && !isHttpUrl(row.chromeUrl)) {
      issues.push(createIssue("warning", "extensions", `extensions: ${id} has a non-HTTP Chrome/store URL`, { id }));
    }

    issues.push(...validateStatus(raw, "extensions", id));
  }

  return {
    normalizedRows,
    issues,
  };
}

async function buildExtensionsSection(config, context) {
  const rows = await listDocuments(config, `projects/${ALTFT_PROJECT_ID}/extensions`, context, context.sampleLimit);
  const { normalizedRows, issues } = validateExtensionRows(rows);
  const displayableCount = normalizedRows.filter(isDisplayableExtension).length;

  return {
    summary: {
      ...summarizeRows(rows, ["name", "slug"]),
      displayableCount,
      duplicateSlugs: duplicateValues(normalizedRows, (row) => row.slug),
    },
    checks: [
      createCheck("extensions-sampled", "Extensions sampled", rows.length > 0, `${rows.length} sampled`, rows.length),
      createCheck(
        "extensions-displayable",
        "Displayable extensions",
        displayableCount > 0,
        `${displayableCount}/${rows.length} displayable`,
        displayableCount,
      ),
    ],
    issues,
  };
}

function validateAcademyRows(rows) {
  const normalizedRows = rows.map((row) => normalizeAcademy(row, row.id));
  const issues = [...validateDuplicateSlugs(normalizedRows, "academy", (row) => row.id)];

  for (let index = 0; index < rows.length; index += 1) {
    const raw = rows[index];
    const row = normalizedRows[index];
    const id = cleanText(row.id || raw.id || row.name) || "sampled academy";

    if (isInactiveLike(raw)) {
      issues.push(...validateStatus(raw, "academy", id));
      continue;
    }

    if (!isDisplayableAcademy(row)) {
      issues.push(createIssue("warning", "academy", `academy: ${id} is not displayable`, { id }));
    }
    if (!row.academyUrl) {
      issues.push(createIssue("warning", "academy", `academy: ${id} is missing a destination URL`, { id }));
    }
    if (!row.image) {
      issues.push(createIssue("warning", "academy", `academy: ${id} is missing an image`, { id }));
    }

    issues.push(...validateStatus(raw, "academy", id));
  }

  return {
    normalizedRows,
    issues,
  };
}

async function buildAcademySection(config, context) {
  const rows = await listDocuments(config, `projects/${ALTFT_PROJECT_ID}/academy`, context, context.sampleLimit);
  const { normalizedRows, issues } = validateAcademyRows(rows);
  const displayableCount = normalizedRows.filter(isDisplayableAcademy).length;

  return {
    summary: {
      ...summarizeRows(rows, ["name", "academyUrl"]),
      displayableCount,
    },
    checks: [
      createCheck("academy-sampled", "Academy sampled", rows.length > 0, `${rows.length} sampled`, rows.length),
      createCheck(
        "academy-displayable",
        "Displayable academy",
        displayableCount > 0,
        `${displayableCount}/${rows.length} displayable`,
        displayableCount,
      ),
    ],
    issues,
  };
}

function validateTrendingVideoRows(rows) {
  const normalizedRows = rows.map((row) => normalizeTrendingVideo(row, row.id));
  const issues = [...validateDuplicateSlugs(normalizedRows, "trendingVideos", (row) => row.firestoreId || row.id)];

  for (let index = 0; index < rows.length; index += 1) {
    const raw = rows[index];
    const row = normalizedRows[index];
    const id = cleanText(row.firestoreId || row.id || row.name) || "sampled video";

    if (isInactiveLike(raw)) {
      issues.push(...validateStatus(raw, "trendingVideos", id));
      continue;
    }

    if (!isDisplayableTrendingVideo(row)) {
      issues.push(createIssue("warning", "trendingVideos", `trendingVideos: ${id} is missing a title or video URL`, { id }));
    }
    if (!row.thumbnail) {
      issues.push(createIssue("warning", "trendingVideos", `trendingVideos: ${id} is missing a thumbnail`, { id }));
    }
    if (raw.thumbnail && !isAssetUrl(raw.thumbnail)) {
      issues.push(createIssue("warning", "trendingVideos", `trendingVideos: ${id} has an invalid thumbnail URL`, { id }));
    }

    issues.push(...validateStatus(raw, "trendingVideos", id));
  }

  return {
    normalizedRows,
    issues,
  };
}

async function buildTrendingVideosSection(config, context) {
  const rows = await listDocuments(config, `projects/${ALTFT_PROJECT_ID}/trendingvideos`, context, context.sampleLimit);
  const { normalizedRows, issues } = validateTrendingVideoRows(rows);
  const displayableCount = normalizedRows.filter(isDisplayableTrendingVideo).length;

  return {
    summary: {
      ...summarizeRows(rows, ["name", "videoUrl"]),
      displayableCount,
      shortsCount: normalizedRows.filter((row) => row.type === "shorts").length,
      videoCount: normalizedRows.filter((row) => row.type !== "shorts").length,
    },
    checks: [
      createCheck("trending-sampled", "Trending videos sampled", rows.length > 0, `${rows.length} sampled`, rows.length),
      createCheck(
        "trending-displayable",
        "Displayable trending videos",
        displayableCount > 0,
        `${displayableCount}/${rows.length} displayable`,
        displayableCount,
      ),
    ],
    issues,
  };
}

function validateBuySmartItems(docId, items) {
  const issues = [];

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const id = `${docId}[${index}]`;
    if (!item || typeof item !== "object") continue;

    const brandDetails = Array.isArray(item.BrandDetail)
      ? item.BrandDetail
      : Array.isArray(item.brandDetail)
        ? item.brandDetail
        : [];
    const nestedLabel = brandDetails.map((entry) => fieldText(entry, ["name", "title", "heading", "brandName"])).find(Boolean) || "";
    const nestedUrl = brandDetails.map((entry) => fieldText(entry, ["url", "link", "storeUrl", "redirectUrl", "affiliateUrl"])).find(Boolean) || "";
    const nestedImage = brandDetails.map((entry) => fieldText(entry, ["image", "banner", "logo", "thumbnail"])).find(Boolean) || "";
    const label = fieldText(item, ["name", "title", "heading", "storeName", "brandName", "category", "label"]) || nestedLabel;
    const url = fieldText(item, ["url", "link", "storeUrl", "redirectUrl", "affiliateUrl"]) || nestedUrl;
    const image = fieldText(item, ["image", "banner", "logo", "thumbnail"]) || nestedImage;

    if (!label && !url && !image) {
      issues.push(createIssue("warning", "buySmart", `buySmart: ${id} is missing a label/title`, { id }));
    }
    if (url && !isHttpUrl(url) && !url.startsWith("/")) {
      issues.push(createIssue("warning", "buySmart", `buySmart: ${id} has a non-HTTP URL`, { id }));
    }
    if (image && !isAssetUrl(image)) {
      issues.push(createIssue("warning", "buySmart", `buySmart: ${id} has an invalid image URL`, { id }));
    }
  }

  return issues;
}

async function buildBuySmartSection(config, context) {
  const entries = await Promise.all(
    BUYSMART_DOCS.map(async (docConfig) => {
      const data = await readDocument(config, `projects/${ALTFT_PROJECT_ID}/buySmart/${docConfig.id}`, context);
      const items = firstArray(data, docConfig.fields);
      const issues = validateBuySmartItems(docConfig.id, items);

      return {
        id: docConfig.id,
        label: docConfig.label,
        itemCount: items.length,
        fields: Object.keys(data).sort(),
        issues,
      };
    }),
  );

  const issues = entries.flatMap((entry) => [
    ...(entry.itemCount > 0
      ? []
      : [createIssue("failure", "buySmart", `${entry.label}: no usable items found`, { id: entry.id })]),
    ...entry.issues,
  ]);

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
    checks: entries.map((entry) =>
      createCheck(
        `buySmart-${entry.id}`,
        entry.label,
        entry.itemCount > 0,
        `${entry.itemCount} items`,
        entry.itemCount,
      ),
    ),
    issues,
  };
}

function validateConsumerRows(collectionId, rows) {
  const issues = [];
  const activeCount = rows.filter((row) => cleanText(row.status).toLowerCase() === "active").length;
  const duplicateNames = duplicateValues(rows, (row) => row.name || row.title);

  for (const name of duplicateNames) {
    issues.push(createIssue("warning", "consumerRating", `consumerRating ${collectionId}: duplicate name "${name}"`, { collectionId }));
  }

  for (const row of rows) {
    const id = cleanText(row.id || row.name || row.title) || `${collectionId} sample`;
    if (!fieldText(row, ["name", "title"])) {
      issues.push(createIssue("failure", "consumerRating", `consumerRating ${collectionId}: ${id} is missing a name`, { id, collectionId }));
    }

    issues.push(...validateStatus(row, "consumerRating", id));
  }

  return {
    activeCount,
    issues,
  };
}

async function buildConsumerRatingSection(config, context) {
  const entries = await Promise.all(
    ["categories", "subcategories", "brands"].map(async (collectionId) => {
      const rows = await listDocuments(
        config,
        `projects/${ALTFT_PROJECT_ID}/consumerrating/data/${collectionId}`,
        context,
        context.sampleLimit,
      );
      const validation = validateConsumerRows(collectionId, rows);

      return {
        collectionId,
        rows,
        ...validation,
      };
    }),
  );

  return {
    summary: Object.fromEntries(
      entries.map((entry) => [
        entry.collectionId,
        {
          ...summarizeRows(entry.rows),
          activeCount: entry.activeCount,
        },
      ]),
    ),
    checks: entries.flatMap((entry) => [
      createCheck(
        `consumer-${entry.collectionId}`,
        `Consumer rating ${entry.collectionId}`,
        entry.rows.length > 0,
        `${entry.rows.length} sampled`,
        entry.rows.length,
      ),
      createCheck(
        `active-consumer-${entry.collectionId}`,
        `Active consumer rating ${entry.collectionId}`,
        entry.activeCount > 0,
        `${entry.activeCount} active`,
        entry.activeCount,
      ),
    ]),
    issues: entries.flatMap((entry) => entry.issues),
  };
}

export async function createFirebaseDataIntegrityReport(options = {}) {
  const startedAt = performance.now();
  const config = createConfig(options.env);
  const strict = Boolean(options.strict);
  const context = {
    fetchImpl: options.fetchImpl || fetch,
    sampleLimit: Math.max(1, Number(options.sampleLimit || DEFAULT_SAMPLE_LIMIT)),
    timeoutMs: Math.max(500, Number(options.timeoutMs || 8000)),
  };
  const sectionTasks = {
    buySmart: () => withSectionFailure("buySmart", "BuySmart integrity", () => buildBuySmartSection(config, context)),
    blogs: () => withSectionFailure("blogs", "Blog integrity", () => buildBlogsSection(config, context)),
    extensions: () => withSectionFailure("extensions", "Extension integrity", () => buildExtensionsSection(config, context)),
    academy: () => withSectionFailure("academy", "Academy integrity", () => buildAcademySection(config, context)),
    trendingVideos: () =>
      withSectionFailure("trendingVideos", "Trending video integrity", () =>
        buildTrendingVideosSection(config, context),
      ),
    consumerRating: () =>
      withSectionFailure("consumerRating", "Consumer rating integrity", () =>
        buildConsumerRatingSection(config, context),
      ),
  };
  const enabledSections = Array.isArray(options.sections) && options.sections.length
    ? options.sections.filter((section) => sectionTasks[section])
    : Object.keys(sectionTasks);
  const entries = await Promise.all(
    enabledSections.map(async (key) => [key, await sectionTasks[key]()]),
  );
  const sections = Object.fromEntries(entries.map(([key, result]) => [key, result.summary]));
  const checks = entries.flatMap(([, result]) => result.checks);
  const validationIssues = entries.flatMap(([, result]) => result.issues || []);
  const checkFailures = checks
    .filter((check) => !check.ok)
    .map((check) => createIssue("failure", check.key, `${check.label}: ${check.detail}`));
  const allIssues = [...validationIssues, ...checkFailures];
  const failures = allIssues.filter((issue) => issue.severity === "failure");
  const warnings = allIssues.filter((issue) => issue.severity === "warning");
  const ok = failures.length === 0 && (!strict || warnings.length === 0);
  const score = clampScore(100 - failures.length * 10 - warnings.length * (strict ? 4 : 2));

  return {
    generatedAt: new Date().toISOString(),
    durationMs: Math.round(performance.now() - startedAt),
    ok,
    strict,
    status: failures.length ? (score >= 60 ? "partial" : "blocked") : warnings.length ? "watch" : "clean",
    score,
    projectId: config.projectId,
    sampleLimit: context.sampleLimit,
    totals: {
      sections: enabledSections.length,
      checks: checks.length,
      passed: checks.filter((check) => check.ok).length,
      failed: checks.filter((check) => !check.ok).length,
      failures: failures.length,
      warnings: warnings.length,
    },
    checks,
    sections,
    failures,
    warnings,
  };
}
