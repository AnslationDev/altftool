const ARCHIVE_EXTENSIONS = new Set(["7z", "gz", "rar", "tar", "tgz", "zip"]);
const SUPPORTED_EXTENSIONS = new Set(["csv", "json", "txt"]);

const DEFAULT_LIMITS = Object.freeze({
  maxDepth: 18,
  maxEvidencePerCategory: 6,
  maxNodes: 75_000,
  maxSchemaSamples: 60,
  maxTextCharacters: 8 * 1024 * 1024,
});

export const DATA_CATEGORY_RULES = Object.freeze([
  {
    id: "location",
    label: "Location",
    keywords: [
      "location",
      "location history",
      "latitude",
      "longitude",
      "geolocation",
      "geotag",
      "gps",
      "place",
      "places",
      "address",
    ],
  },
  {
    id: "contacts",
    label: "Contacts & connections",
    keywords: [
      "contact",
      "contacts",
      "phonebook",
      "connections",
      "followers",
      "following",
      "friends",
      "address book",
    ],
  },
  {
    id: "messages",
    label: "Messages & conversations",
    keywords: [
      "message",
      "messages",
      "conversation",
      "conversations",
      "chat",
      "chats",
      "inbox",
      "direct message",
      "sms",
      "thread",
    ],
  },
  {
    id: "ads-interests",
    label: "Ads & inferred interests",
    keywords: [
      "advertisement",
      "advertisements",
      "advertiser",
      "advertisers",
      "ad interest",
      "ad interests",
      "ad targeting",
      "ads",
      "interests",
      "topics",
    ],
  },
  {
    id: "searches",
    label: "Searches & activity history",
    keywords: [
      "search",
      "searches",
      "search history",
      "query",
      "queries",
      "browsing history",
      "watch history",
      "activity history",
    ],
  },
  {
    id: "devices",
    label: "Devices & network signals",
    keywords: [
      "device",
      "devices",
      "device information",
      "browser",
      "hardware",
      "ip address",
      "user agent",
      "network",
    ],
  },
  {
    id: "identifiers",
    label: "Account identifiers",
    keywords: [
      "id",
      "identifier",
      "identifiers",
      "account id",
      "profile id",
      "user id",
      "gaia id",
      "advertising id",
      "email",
      "phone",
      "username",
      "cookie",
    ],
  },
  {
    id: "security",
    label: "Security & authentication",
    keywords: [
      "login",
      "logins",
      "security",
      "password",
      "recovery",
      "session",
      "sessions",
      "token",
      "authentication",
      "auth",
      "credential",
      "credentials",
      "2fa",
      "mfa",
    ],
  },
]);

function normalizeTerms(value) {
  return String(value ?? "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function includesTerm(normalizedValue, term) {
  const normalizedTerm = normalizeTerms(term);
  return ` ${normalizedValue} `.includes(` ${normalizedTerm} `);
}

function sanitizeFileName(name) {
  return (
    String(name || "unnamed-file")
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .trim()
      .slice(0, 220) || "unnamed-file"
  );
}

function isValueLikeSchemaName(value) {
  const candidate = String(value ?? "").trim();
  return (
    candidate.length > 80 ||
    /@/.test(candidate) ||
    /(?:https?:\/\/|www\.)/i.test(candidate) ||
    /\b\d{8,}\b/.test(candidate) ||
    /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(candidate) ||
    /^[a-z0-9+/=_-]{36,}$/i.test(candidate)
  );
}

export function sanitizeSchemaName(value) {
  const candidate = String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim();
  if (!candidate) return "[unnamed field]";
  if (isValueLikeSchemaName(candidate)) return "[dynamic key]";
  return candidate.slice(0, 80);
}

function extensionFromName(name) {
  const match = String(name ?? "").toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
}

export function detectExportFormat(name, mimeType = "") {
  const extension = extensionFromName(name);
  const normalizedMime = String(mimeType).toLowerCase();

  if (ARCHIVE_EXTENSIONS.has(extension)) {
    return { extension, kind: "archive", label: "Archive" };
  }
  if (extension === "json" || normalizedMime.includes("json")) {
    return { extension: extension || "json", kind: "json", label: "JSON" };
  }
  if (extension === "csv" || normalizedMime.includes("csv")) {
    return { extension: extension || "csv", kind: "csv", label: "CSV" };
  }
  if (extension === "txt" || normalizedMime === "text/plain") {
    return { extension: extension || "txt", kind: "txt", label: "Text" };
  }
  return {
    extension,
    kind: SUPPORTED_EXTENSIONS.has(extension) ? extension : "unsupported",
    label: extension ? extension.toUpperCase() : "Unknown",
  };
}

function createCategoryCollector(fileName, maxEvidencePerCategory) {
  const evidence = new Map(DATA_CATEGORY_RULES.map((rule) => [rule.id, new Set()]));

  function add(candidate, displayEvidence) {
    const normalized = normalizeTerms(candidate);
    if (!normalized) return;

    DATA_CATEGORY_RULES.forEach((rule) => {
      if (!rule.keywords.some((keyword) => includesTerm(normalized, keyword))) return;
      const entries = evidence.get(rule.id);
      if (entries.size < maxEvidencePerCategory) entries.add(displayEvidence);
    });
  }

  add(fileName, `File name: ${fileName}`);

  return {
    add,
    results() {
      return DATA_CATEGORY_RULES.flatMap((rule) => {
        const entries = [...evidence.get(rule.id)];
        return entries.length
          ? [{ id: rule.id, label: rule.label, evidence: entries }]
          : [];
      });
    },
  };
}

function schemaPath(parent, key) {
  const safeKey = sanitizeSchemaName(key);
  return parent === "$" ? `$.${safeKey}` : `${parent}.${safeKey}`;
}

function analyzeJson(text, collector, limits) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      fieldCount: 0,
      parseStatus: "invalid",
      recordCount: 0,
      schemaFields: [],
      uniqueFieldCount: 0,
      warnings: ["JSON could not be parsed. No content or parser excerpt was retained."],
    };
  }

  const uniqueFields = new Set();
  const schemaFields = new Set();
  const warnings = [];
  let fieldCount = 0;
  let nodeCount = 0;
  let recordCount = 0;
  let traversalStopped = false;

  function stopTraversal(reason) {
    if (!traversalStopped) warnings.push(reason);
    traversalStopped = true;
  }

  function walk(value, path, depth, countsAsRecord) {
    if (traversalStopped) return;
    if (depth > limits.maxDepth) {
      stopTraversal(
        `Schema traversal stopped at the safe depth limit of ${limits.maxDepth}.`,
      );
      return;
    }

    nodeCount += 1;
    if (nodeCount > limits.maxNodes) {
      stopTraversal(
        `Schema traversal stopped at the safe node limit of ${limits.maxNodes.toLocaleString("en-US")}.`,
      );
      return;
    }

    if (value === null || typeof value !== "object") {
      if (countsAsRecord) recordCount += 1;
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => walk(item, `${path}[]`, depth + 1, true));
      return;
    }

    if (countsAsRecord) recordCount += 1;
    Object.keys(value).forEach((key) => {
      if (traversalStopped) return;
      fieldCount += 1;
      const safeKey = sanitizeSchemaName(key);
      const nextPath = schemaPath(path, key);
      uniqueFields.add(safeKey);
      if (schemaFields.size < limits.maxSchemaSamples) schemaFields.add(nextPath);
      collector.add(key, `Schema: ${nextPath}`);
      walk(value[key], nextPath, depth + 1, false);
    });
  }

  walk(parsed, "$", 0, true);

  return {
    fieldCount,
    parseStatus: traversalStopped ? "partial" : "analyzed",
    recordCount,
    schemaFields: [...schemaFields],
    uniqueFieldCount: uniqueFields.size,
    warnings,
  };
}

function analyzeCsv(text, collector, limits) {
  let currentHeader = "";
  let currentRowHeaders = [];
  let dataFieldCount = 0;
  let dataRowCount = 0;
  let headerFields = [];
  let headerFound = false;
  let inQuotes = false;
  let rowCellCount = 0;
  let rowHasContent = false;
  let rowStarted = false;

  function finishCell() {
    rowCellCount += 1;
    if (!headerFound) currentRowHeaders.push(currentHeader.trim());
    currentHeader = "";
  }

  function resetRow() {
    currentRowHeaders = [];
    rowCellCount = 0;
    rowHasContent = false;
    rowStarted = false;
  }

  function finishRow() {
    finishCell();
    if (rowHasContent) {
      if (!headerFound) {
        headerFields = currentRowHeaders;
        headerFound = true;
      } else {
        dataRowCount += 1;
        dataFieldCount += rowCellCount;
      }
    }
    resetRow();
  }

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    rowStarted = true;

    if (character === '"') {
      if (inQuotes && text[index + 1] === '"') {
        if (!headerFound && currentHeader.length < 200) currentHeader += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && character === ",") {
      finishCell();
      continue;
    }

    if (!inQuotes && (character === "\n" || character === "\r")) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      finishRow();
      continue;
    }

    if (!/\s/.test(character)) rowHasContent = true;
    if (!headerFound && currentHeader.length < 200) currentHeader += character;
  }

  if (rowStarted || currentHeader || rowCellCount) finishRow();

  const safeHeaders = headerFields
    .filter((header) => header.trim())
    .slice(0, limits.maxSchemaSamples)
    .map((header) => sanitizeSchemaName(header));
  headerFields.forEach((header) => {
    if (!header.trim()) return;
    collector.add(header, `CSV header: ${sanitizeSchemaName(header)}`);
  });

  const warnings = [];
  if (!headerFound) warnings.push("No non-empty CSV header row was found.");
  if (inQuotes) {
    warnings.push("CSV contains an unmatched quote; structural counts may be incomplete.");
  }

  return {
    fieldCount: dataFieldCount,
    parseStatus: inQuotes ? "partial" : "analyzed",
    recordCount: dataRowCount,
    schemaFields: safeHeaders,
    uniqueFieldCount: new Set(safeHeaders).size,
    warnings,
  };
}

function analyzeText(text) {
  const lines = text.split(/\r\n|\n|\r/);
  const recordCount = lines.reduce(
    (count, line) => count + (line.trim() ? 1 : 0),
    0,
  );
  return {
    fieldCount: 0,
    parseStatus: "analyzed",
    recordCount,
    schemaFields: [],
    uniqueFieldCount: 0,
    warnings: [
      "Text contents were not classified; only non-empty line and character counts were calculated.",
    ],
  };
}

export function analyzeExportFile(file, options = {}) {
  const limits = { ...DEFAULT_LIMITS, ...options };
  const name = sanitizeFileName(file?.name);
  const mimeType = String(file?.type ?? "").slice(0, 120);
  const size = Number.isFinite(file?.size)
    ? Math.max(0, file.size)
    : String(file?.text ?? "").length;
  const text = String(file?.text ?? "");
  const format = detectExportFormat(name, mimeType);
  const collector = createCategoryCollector(name, limits.maxEvidencePerCategory);

  const base = {
    categories: [],
    characterCount: 0,
    extension: format.extension,
    fieldCount: 0,
    format: format.label,
    kind: format.kind,
    mimeType,
    name,
    parseStatus: "unsupported",
    recordCount: 0,
    schemaFields: [],
    size,
    uniqueFieldCount: 0,
    warnings: [],
  };

  if (format.kind === "archive") {
    return {
      ...base,
      categories: collector.results(),
      warnings: [
        "Archive was not opened. Extract it yourself, then select supported JSON, CSV or TXT files.",
      ],
    };
  }

  if (!SUPPORTED_EXTENSIONS.has(format.kind)) {
    return {
      ...base,
      categories: collector.results(),
      warnings: ["Unsupported file type. Only JSON, CSV and TXT are analyzed."],
    };
  }

  if (size > limits.maxTextCharacters || text.length > limits.maxTextCharacters) {
    return {
      ...base,
      categories: collector.results(),
      parseStatus: "too-large",
      warnings: [
        `File exceeds the safe per-file analysis limit of ${formatBytes(limits.maxTextCharacters)}.`,
      ],
    };
  }

  const details =
    format.kind === "json"
      ? analyzeJson(text, collector, limits)
      : format.kind === "csv"
        ? analyzeCsv(text, collector, limits)
        : analyzeText(text);

  return {
    ...base,
    ...details,
    categories: collector.results(),
    characterCount: text.length,
  };
}

export function summarizeExportAudit(files = []) {
  const categoryMap = new Map(
    DATA_CATEGORY_RULES.map((rule) => [
      rule.id,
      { id: rule.id, label: rule.label, evidence: new Set(), files: new Set() },
    ]),
  );

  files.forEach((file) => {
    file.categories.forEach((category) => {
      const aggregate = categoryMap.get(category.id);
      aggregate.files.add(file.name);
      category.evidence.forEach((entry) => {
        if (aggregate.evidence.size < 10) {
          aggregate.evidence.add(`${file.name} — ${entry}`);
        }
      });
    });
  });

  return {
    categories: [...categoryMap.values()].flatMap((category) =>
      category.files.size
        ? [
            {
              evidence: [...category.evidence],
              fileCount: category.files.size,
              id: category.id,
              label: category.label,
            },
          ]
        : [],
    ),
    files,
    summary: {
      analyzedFiles: files.filter((file) =>
        ["analyzed", "partial"].includes(file.parseStatus),
      ).length,
      detectedCategories: [...categoryMap.values()].filter(
        (category) => category.files.size,
      ).length,
      fieldCount: files.reduce((total, file) => total + file.fieldCount, 0),
      fileCount: files.length,
      partialFiles: files.filter((file) => file.parseStatus === "partial").length,
      recordCount: files.reduce((total, file) => total + file.recordCount, 0),
      totalBytes: files.reduce((total, file) => total + file.size, 0),
      unsupportedFiles: files.filter((file) =>
        ["too-large", "unsupported"].includes(file.parseStatus),
      ).length,
    },
  };
}

export function createMetadataReport(audit, generatedAt = new Date().toISOString()) {
  const report = {
    reportType: "ALTFTool personal data export metadata audit",
    generatedAt,
    privacyNotice:
      "This report contains file inventory and schema-derived signals only. Source field values and text lines are excluded.",
    interpretationLimits: [
      "Category matches are keyword-based indicators, not proof of how a service uses or protects data.",
      "JSON detection uses property names; CSV detection assumes the first non-empty row is a comma-delimited header.",
      "TXT bodies are not classified. Archives, encrypted files and binary files are not opened.",
      "Large or deeply nested inputs can be only partially counted because safe browser limits apply.",
    ],
    summary: audit.summary,
    categories: audit.categories,
    files: audit.files.map((file) => ({
      categories: file.categories,
      characterCount: file.characterCount,
      fieldCount: file.fieldCount,
      format: file.format,
      mimeType: file.mimeType,
      name: file.name,
      parseStatus: file.parseStatus,
      recordCount: file.recordCount,
      schemaFields: file.schemaFields,
      size: file.size,
      uniqueFieldCount: file.uniqueFieldCount,
      warnings: file.warnings,
    })),
  };

  return JSON.stringify(report, null, 2);
}

export function formatBytes(bytes = 0) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(index === 0 || value >= 10 ? 0 : 1)} ${units[index]}`;
}
