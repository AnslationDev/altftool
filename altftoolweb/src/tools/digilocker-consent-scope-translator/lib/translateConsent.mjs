const DEFAULT_LIMITS = Object.freeze({
  maxDepth: 10,
  maxEntries: 5_000,
  maxSourceCharacters: 120_000,
  maxValuesPerItem: 20,
});

export const SCOPE_ITEMS = Object.freeze([
  {
    key: "requester",
    label: "Requester",
    kind: "scalar",
    aliases: [
      "client name",
      "organization",
      "organization name",
      "relying party",
      "requester",
      "requester name",
      "requesting organization",
    ],
    ambiguousPatterns: [
      /\bour partners?\b/i,
      /\bthird part(?:y|ies)\b/i,
      /\bauthorized entit(?:y|ies)\b/i,
      /\bservice providers?\b/i,
    ],
  },
  {
    key: "documentTypes",
    label: "Document types",
    kind: "list",
    aliases: [
      "certificate name",
      "document",
      "document type",
      "document types",
      "documents",
      "documents requested",
      "doctype",
      "doctypes",
      "requested documents",
    ],
    ambiguousPatterns: [
      /^documents?$/i,
      /\bany document\b/i,
      /\ball documents\b/i,
      /\brelevant documents\b/i,
      /\bas required\b/i,
    ],
  },
  {
    key: "fields",
    label: "Requested fields",
    kind: "list",
    aliases: [
      "attributes",
      "claims",
      "data fields",
      "field names",
      "fields",
      "fields requested",
      "requested attributes",
      "requested fields",
    ],
    ambiguousPatterns: [
      /^details?$/i,
      /^information$/i,
      /^data$/i,
      /\bany data\b/i,
      /\ball fields\b/i,
      /\bnecessary (?:data|details|information)\b/i,
      /\bas required\b/i,
    ],
  },
  {
    key: "purpose",
    label: "Purpose",
    kind: "scalar",
    aliases: [
      "access purpose",
      "purpose",
      "purpose of access",
      "reason",
      "reason for request",
      "use case",
    ],
    ambiguousPatterns: [
      /^service$/i,
      /\bservice purposes?\b/i,
      /\bvarious purposes?\b/i,
      /\bbusiness purposes?\b/i,
      /\blegitimate purposes?\b/i,
      /\bas required\b/i,
      /\bas needed\b/i,
    ],
  },
  {
    key: "duration",
    label: "Access duration",
    kind: "scalar",
    aliases: [
      "access duration",
      "access period",
      "consent duration",
      "duration",
      "expires at",
      "expiry",
      "valid until",
    ],
    ambiguousPatterns: [
      /\bas needed\b/i,
      /\bas required\b/i,
      /\bindefinite(?:ly)?\b/i,
      /\bongoing\b/i,
      /\buntil further notice\b/i,
      /\bunspecified\b/i,
    ],
  },
  {
    key: "frequency",
    label: "Access frequency",
    kind: "scalar",
    aliases: [
      "access count",
      "access frequency",
      "fetch frequency",
      "frequency",
      "number of accesses",
      "one time",
      "one time access",
    ],
    ambiguousPatterns: [
      /\bas needed\b/i,
      /\bas required\b/i,
      /\bfrom time to time\b/i,
      /\bongoing\b/i,
      /\bperiodic(?:ally)?\b/i,
      /\bmultiple\b/i,
    ],
  },
  {
    key: "retention",
    label: "Retention",
    kind: "scalar",
    aliases: [
      "data retention",
      "retention",
      "retention period",
      "storage duration",
      "store until",
    ],
    ambiguousPatterns: [
      /\bas needed\b/i,
      /\bas required\b/i,
      /\bindefinite(?:ly)?\b/i,
      /\bnecessary\b/i,
      /\breasonable period\b/i,
      /\buntil no longer needed\b/i,
      /\bunspecified\b/i,
    ],
  },
  {
    key: "revocation",
    label: "Revocation or withdrawal",
    kind: "scalar",
    aliases: [
      "how to revoke",
      "revocable",
      "revocation",
      "revocation method",
      "revocation url",
      "revoke url",
      "withdraw consent",
      "withdrawal",
    ],
    ambiguousPatterns: [
      /^yes$/i,
      /^true$/i,
      /\bcontact us\b/i,
      /\bavailable on request\b/i,
      /\bmay revoke\b/i,
      /\bwhere applicable\b/i,
    ],
  },
]);

const APPROVAL_KEYS = new Set([
  "approval",
  "approved",
  "authorization",
  "authorized",
  "consent",
  "consent status",
  "granted",
  "permission",
]);

const SENSITIVE_KEYS = new Set([
  "aadhaar",
  "aadhaar number",
  "access token",
  "api key",
  "client secret",
  "mobile",
  "mobile number",
  "otp",
  "password",
  "refresh token",
  "secret",
  "token",
]);

const TEXT_LABELS = {
  requester:
    /^(?:requester|requester name|requesting organization|organization|client name|relying party)\s*[:=-]\s*(.+)$/i,
  documentTypes:
    /^(?:document types?|documents requested|requested documents|certificate name|doctypes?)\s*[:=-]\s*(.+)$/i,
  fields:
    /^(?:requested fields?|fields requested|data fields|attributes|claims)\s*[:=-]\s*(.+)$/i,
  purpose:
    /^(?:purpose|purpose of access|access purpose|reason for request|use case)\s*[:=-]\s*(.+)$/i,
  duration:
    /^(?:duration|access duration|access period|consent duration|valid until|expires at|expiry)\s*[:=-]\s*(.+)$/i,
  frequency:
    /^(?:frequency|access frequency|fetch frequency|number of accesses|access count)\s*[:=-]\s*(.+)$/i,
  retention:
    /^(?:retention|retention period|data retention|storage duration|store until)\s*[:=-]\s*(.+)$/i,
  revocation:
    /^(?:revocation|revocation method|how to revoke|withdrawal|withdraw consent|revocation url|revoke url)\s*[:=-]\s*(.+)$/i,
};

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeKey(value) {
  return String(value ?? "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function cleanValue(value) {
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

function scalarValues(value) {
  if (Array.isArray(value)) return value.flatMap(scalarValues);
  const cleaned = cleanValue(value);
  return cleaned ? [cleaned] : [];
}

function splitExplicitList(value) {
  const cleaned = cleanValue(value);
  if (!cleaned) return [];
  return cleaned
    .split(/\s*(?:,|;|\|)\s*/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function createCollector() {
  return new Map(SCOPE_ITEMS.map((item) => [item.key, []]));
}

function addValues(collector, item, value, maxValuesPerItem) {
  const values =
    item.kind === "list"
      ? scalarValues(value).flatMap(splitExplicitList)
      : scalarValues(value);
  const current = collector.get(item.key);
  values.forEach((entry) => {
    if (
      current.length < maxValuesPerItem &&
      !current.some((existing) => existing.toLowerCase() === entry.toLowerCase())
    ) {
      current.push(entry);
    }
  });
}

function itemFromAlias(normalizedKey) {
  return SCOPE_ITEMS.find((item) =>
    item.aliases.some((alias) => normalizeKey(alias) === normalizedKey),
  );
}

function extractJson(parsed, limits) {
  const collector = createCollector();
  const warnings = [];
  let approvalIndicatorPresent = false;
  let sensitiveKeyPresent = false;
  let scopeTokenPresent = false;
  let entryCount = 0;
  let stopped = false;

  function stop(message) {
    if (!stopped) warnings.push(message);
    stopped = true;
  }

  function walk(value, depth) {
    if (stopped || value === null || value === undefined) return;
    if (depth > limits.maxDepth) {
      stop(`JSON review stopped at the safe depth limit of ${limits.maxDepth}.`);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((entry) => walk(entry, depth + 1));
      return;
    }
    if (!isObject(value)) return;

    Object.entries(value).forEach(([key, nested]) => {
      if (stopped) return;
      entryCount += 1;
      if (entryCount > limits.maxEntries) {
        stop(
          `JSON review stopped at the safe field limit of ${limits.maxEntries.toLocaleString("en-US")}.`,
        );
        return;
      }

      const normalized = normalizeKey(key);
      if (APPROVAL_KEYS.has(normalized)) approvalIndicatorPresent = true;
      if (SENSITIVE_KEYS.has(normalized)) sensitiveKeyPresent = true;
      if (normalized === "scope" || normalized === "scopes") scopeTokenPresent = true;

      const item = itemFromAlias(normalized);
      if (item) addValues(collector, item, nested, limits.maxValuesPerItem);
      if (Array.isArray(nested) || isObject(nested)) walk(nested, depth + 1);
    });
  }

  walk(parsed, 0);
  return {
    approvalIndicatorPresent,
    collector,
    scopeTokenPresent,
    sensitiveKeyPresent,
    warnings,
  };
}

function extractText(source, limits) {
  const collector = createCollector();
  const warnings = [];
  let approvalIndicatorPresent = false;
  let sensitiveKeyPresent = false;
  let scopeTokenPresent = false;

  String(source)
    .split(/\r\n|\n|\r/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const normalizedLine = normalizeKey(line.split(/[:=-]/, 1)[0]);
      if (APPROVAL_KEYS.has(normalizedLine)) approvalIndicatorPresent = true;
      if (SENSITIVE_KEYS.has(normalizedLine)) sensitiveKeyPresent = true;
      if (normalizedLine === "scope" || normalizedLine === "scopes") {
        scopeTokenPresent = true;
      }

      SCOPE_ITEMS.forEach((item) => {
        const match = line.match(TEXT_LABELS[item.key]);
        if (match) addValues(collector, item, match[1], limits.maxValuesPerItem);
      });
    });

  return {
    approvalIndicatorPresent,
    collector,
    scopeTokenPresent,
    sensitiveKeyPresent,
    warnings,
  };
}

function describeItem(item, values) {
  if (!values.length) {
    return {
      explanation: `${item.label} is not explicitly stated in the supplied request.`,
      key: item.key,
      label: item.label,
      status: "missing",
      values: [],
    };
  }

  const ambiguousByWording = values.some((value) =>
    item.ambiguousPatterns.some((pattern) => pattern.test(value)),
  );
  const conflictingScalarValues =
    item.kind === "scalar" &&
    new Set(values.map((value) => value.toLowerCase())).size > 1;
  const ambiguous = ambiguousByWording || conflictingScalarValues;

  return {
    explanation: ambiguous
      ? `${item.label} wording is present, but it is broad, conditional, or has more than one value and needs clarification.`
      : `${item.label} is explicitly stated in the supplied request.`,
    key: item.key,
    label: item.label,
    status: ambiguous ? "ambiguous" : "explicit",
    values,
  };
}

export function translateConsentScope(source, options = {}) {
  const limits = { ...DEFAULT_LIMITS, ...options };
  const text = String(source ?? "");
  if (!text.trim()) {
    return {
      format: "empty",
      items: SCOPE_ITEMS.map((item) => describeItem(item, [])),
      notices: ["Paste consent or request JSON/text before reviewing its scope."],
      summary: { ambiguous: 0, explicit: 0, missing: SCOPE_ITEMS.length, total: SCOPE_ITEMS.length },
    };
  }
  if (text.length > limits.maxSourceCharacters) {
    return {
      format: "too-large",
      items: SCOPE_ITEMS.map((item) => describeItem(item, [])),
      notices: [
        `Input exceeds the safe local limit of ${limits.maxSourceCharacters.toLocaleString("en-US")} characters.`,
      ],
      summary: { ambiguous: 0, explicit: 0, missing: SCOPE_ITEMS.length, total: SCOPE_ITEMS.length },
    };
  }

  const trimmed = text.trim();
  let extracted;
  let format = "text";
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      extracted = extractJson(JSON.parse(trimmed), limits);
      format = "json";
    } catch {
      extracted = extractText(text, limits);
      extracted.warnings.unshift(
        "Input looked like JSON but could not be parsed; labeled-text review was used instead.",
      );
    }
  } else {
    extracted = extractText(text, limits);
  }

  const items = SCOPE_ITEMS.map((item) =>
    describeItem(item, extracted.collector.get(item.key)),
  );
  const count = (status) => items.filter((item) => item.status === status).length;
  const notices = [...extracted.warnings];
  if (extracted.approvalIndicatorPresent) {
    notices.push(
      "A consent, approval, authorization, or permission indicator is present. This tool does not treat it as valid consent or proof of approval.",
    );
  }
  if (extracted.scopeTokenPresent) {
    notices.push(
      "A generic scope token is present. It is not translated into documents or fields unless those details are separately and explicitly labeled.",
    );
  }
  if (extracted.sensitiveKeyPresent) {
    notices.push(
      "A credential or sensitive-identifier key appears to be present. Remove secrets and unnecessary identifiers before further sharing.",
    );
  }

  return {
    format,
    items,
    notices,
    summary: {
      ambiguous: count("ambiguous"),
      explicit: count("explicit"),
      missing: count("missing"),
      total: items.length,
    },
  };
}

export function buildCountsOnlyScopeReport(
  result,
  generatedAt = new Date().toISOString(),
) {
  return JSON.stringify(
    {
      reportType: "ALTFTool consent-scope coverage counts",
      generatedAt,
      inputFormat: result.format,
      summary: result.summary,
      noticeCount: result.notices.length,
      privacyNotice:
        "Counts only: requester names, documents, fields, purposes, dates, URLs, identifiers, credentials and source text are excluded.",
      interpretation:
        "Explicit means labeled text was found in the supplied input. It does not mean the request is authentic, approved, lawful, complete or issued by DigiLocker.",
      limitations: [
        "This is a local label-based explainer, not an official DigiLocker consent screen, validator or account connection.",
        "Unlabeled prose and generic OAuth scope tokens are not interpreted as document or field permissions.",
        "Missing information may exist elsewhere in a linked policy, app screen, contract or later workflow.",
        "Ambiguous language requires clarification from the requester before making a decision.",
        "The tool cannot verify requester identity, document authenticity, consent validity, revocation operation or actual data handling.",
      ],
    },
    null,
    2,
  );
}
