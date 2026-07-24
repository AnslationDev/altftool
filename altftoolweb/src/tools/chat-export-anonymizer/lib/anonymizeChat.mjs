const PARTICIPANT_KEYS = new Set([
  "actor",
  "author",
  "authorname",
  "displayname",
  "from",
  "participant",
  "participantname",
  "sender",
  "sendername",
  "user",
  "username",
]);

const MESSAGE_KEYS = new Set(["body", "content", "message", "text"]);

const TIMESTAMP_KEYS = new Set([
  "created",
  "createdat",
  "date",
  "datetime",
  "sentat",
  "time",
  "timestamp",
  "updatedat",
]);

const ID_KEYS = new Set([
  "accountid",
  "chatid",
  "conversationid",
  "customerid",
  "deviceid",
  "employeeid",
  "id",
  "memberid",
  "messageid",
  "orderid",
  "participantid",
  "senderid",
  "sessionid",
  "threadid",
  "ticketid",
  "userid",
]);

const EMAIL_KEYS = new Set(["email", "emailaddress"]);
const PHONE_KEYS = new Set(["mobile", "mobilenumber", "phone", "phonenumber", "tel", "telephone"]);
const URL_KEYS = new Set(["link", "profileurl", "url", "website"]);

const NON_PARTICIPANT_LABELS = new Set([
  "account",
  "account id",
  "account number",
  "case id",
  "customer id",
  "date",
  "datetime",
  "email",
  "from",
  "id",
  "link",
  "message",
  "note",
  "order id",
  "phone",
  "status",
  "subject",
  "ticket id",
  "time",
  "timestamp",
  "to",
  "url",
  "warning",
]);

const CSV_HINT_KEYS = new Set([
  ...PARTICIPANT_KEYS,
  ...MESSAGE_KEYS,
  ...TIMESTAMP_KEYS,
  ...ID_KEYS,
  ...EMAIL_KEYS,
  ...PHONE_KEYS,
  ...URL_KEYS,
]);

const SUMMARY_META = {
  participant: { label: "Participant labels", token: "Person" },
  email: { label: "Email addresses", token: "EMAIL" },
  phone: { label: "Phone numbers", token: "PHONE" },
  url: { label: "Web links", token: "URL" },
  id: { label: "Labeled identifiers", token: "ID" },
  timestamp: { label: "Timestamps removed", token: "TIMESTAMP" },
};

function normalizeKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function normalizeLookup(kind, value) {
  const trimmed = String(value ?? "").trim();

  if (kind === "phone") {
    return trimmed.replace(/\D/g, "");
  }

  return trimmed.toLocaleLowerCase("en-US");
}

function createContext() {
  return {
    maps: {
      participant: new Map(),
      email: new Map(),
      phone: new Map(),
      url: new Map(),
      id: new Map(),
    },
    occurrences: {
      participant: 0,
      email: 0,
      phone: 0,
      url: 0,
      id: 0,
      timestamp: 0,
    },
  };
}

function replacementFor(context, kind, rawValue) {
  const lookup = normalizeLookup(kind, rawValue);
  const map = context.maps[kind];

  if (!map.has(lookup)) {
    const number = map.size + 1;
    map.set(lookup, kind === "participant" ? `Person ${number}` : `[${kind.toUpperCase()}_${number}]`);
  }

  context.occurrences[kind] += 1;
  return map.get(lookup);
}

function isTimestampKey(key) {
  const normalized = normalizeKey(key);
  return TIMESTAMP_KEYS.has(normalized) || normalized.endsWith("timestamp");
}

function isIdKey(key) {
  return ID_KEYS.has(normalizeKey(key));
}

function isParticipantKey(key, parent) {
  const normalized = normalizeKey(key);

  if (PARTICIPANT_KEYS.has(normalized)) {
    return true;
  }

  if (normalized !== "name" || !parent || Array.isArray(parent)) {
    return false;
  }

  return Object.keys(parent).some((sibling) => MESSAGE_KEYS.has(normalizeKey(sibling)));
}

function stripTrailingUrlPunctuation(value) {
  const match = value.match(/[),.;!?]+$/);
  if (!match) return [value, ""];
  return [value.slice(0, -match[0].length), match[0]];
}

function replaceSensitivePatterns(value, context) {
  let output = value;

  output = output.replace(/\b(?:https?:\/\/|www\.)[^\s<>"']+/giu, (match) => {
    const [url, trailing] = stripTrailingUrlPunctuation(match);
    return `${replacementFor(context, "url", url)}${trailing}`;
  });

  output = output.replace(
    /\b[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+\b/giu,
    (match) => replacementFor(context, "email", match),
  );

  output = output.replace(
    /\b((?:account|case|chat|conversation|customer|device|employee|id|member|message|order|participant|sender|session|thread|ticket|user)(?:[ \t_-]*(?:id|number|no))?(?:[ \t]*[:=#-][ \t]*|[ \t]+))([A-Z0-9][A-Z0-9._/-]{4,})\b/giu,
    (match, label, identifier) => `${label}${replacementFor(context, "id", identifier)}`,
  );

  output = output.replace(
    /(?<![\p{L}\p{N}])(?:\+?\d[\d(). \t-]{5,}\d)(?![\p{L}\p{N}])/gu,
    (match) => {
      const digits = match.replace(/\D/g, "");
      const hasInternationalOrGrouping = match.includes("+") || match.includes("(");
      const minimumDigits = hasInternationalOrGrouping ? 7 : 10;

      if (digits.length < minimumDigits || digits.length > 15) {
        return match;
      }

      return replacementFor(context, "phone", match);
    },
  );

  return output;
}

function stripTextTimestamps(value, context) {
  return value
    .split(/\r?\n/)
    .map((line) => {
      let output = line;
      const prefixPatterns = [
        /^\s*\[(?:(?:\d{1,4}[./-]\d{1,2}[./-]\d{1,4})[,\s]+)?\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?\]\s*(?:[-–]\s*)?/i,
        /^\s*(?:\d{1,4}[./-]\d{1,2}[./-]\d{1,4})[,\s]+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?\s*(?:[-–]\s*)?/i,
        /^\s*\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?\s*(?:[-–]\s*)?/i,
      ];

      for (const pattern of prefixPatterns) {
        if (pattern.test(output)) {
          output = output.replace(pattern, "");
          context.occurrences.timestamp += 1;
          break;
        }
      }

      const speakerTimestamp =
        /^(\s*[^:\r\n]{1,60}?)\s+\[(?:(?:\d{1,4}[./-]\d{1,2}[./-]\d{1,4})[,\s]+)?\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?\](\s*:)/i;

      if (speakerTimestamp.test(output)) {
        output = output.replace(speakerTimestamp, "$1$2");
        context.occurrences.timestamp += 1;
      }

      return output;
    })
    .join("\n");
}

function looksLikeParticipantLabel(value) {
  const candidate = value.trim();
  const normalized = candidate.toLocaleLowerCase("en-US").replace(/\s+/g, " ");

  if (
    candidate.length < 2 ||
    candidate.length > 60 ||
    NON_PARTICIPANT_LABELS.has(normalized) ||
    /^person\s+\d+$/i.test(candidate) ||
    /\bhttps?$/i.test(candidate) ||
    !/\p{L}/u.test(candidate) ||
    candidate.split(/\s+/).length > 5
  ) {
    return false;
  }

  return /^[\p{L}\p{N}][\p{L}\p{N} ._'@()+-]*$/u.test(candidate);
}

function replaceParticipantLabels(value, context) {
  return value
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(/^(\s*(?:[-*]\s*)?)([^:\r\n]{1,60})(:\s*)(.+)$/u);
      if (!match || !looksLikeParticipantLabel(match[2])) return line;

      const participant = replacementFor(context, "participant", match[2]);
      return `${match[1]}${participant}${match[3]}${match[4]}`;
    })
    .join("\n");
}

function anonymizeTextContent(value, context, options) {
  let output = value;

  if (options.removeTimestamps) {
    output = stripTextTimestamps(output, context);
  }

  output = replaceSensitivePatterns(output, context);

  if (options.replaceParticipants) {
    output = replaceParticipantLabels(output, context);
  }

  return output;
}

export function parseCsv(value) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];

    if (quoted) {
      if (character === '"' && value[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field || row.length || value.endsWith(",")) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  return rows;
}

export function serializeCsv(rows) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? "");
          return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(","),
    )
    .join("\n");
}

function csvHasRecognizedHeader(rows) {
  if (rows.length < 2 || rows[0].length < 2) return false;
  return rows[0].some((cell) => CSV_HINT_KEYS.has(normalizeKey(cell)));
}

export function detectChatFormat(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "text";

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // Continue: bracketed timestamps are common in plain-text chat exports.
    }
  }

  const rows = parseCsv(trimmed);
  if (csvHasRecognizedHeader(rows)) return "csv";

  return "text";
}

function transformStructured(value, context, options, key = "", parent = null) {
  if (Array.isArray(value)) {
    return value.map((item) => transformStructured(item, context, options, key, value));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        transformStructured(childValue, context, options, childKey, value),
      ]),
    );
  }

  if (value === null || value === undefined) return value;

  if (options.removeTimestamps && isTimestampKey(key)) {
    context.occurrences.timestamp += 1;
    return typeof value === "number" ? null : "[TIMESTAMP_REMOVED]";
  }

  if (options.replaceParticipants && isParticipantKey(key, parent)) {
    return replacementFor(context, "participant", value);
  }

  if (isIdKey(key)) {
    return replacementFor(context, "id", value);
  }

  if (EMAIL_KEYS.has(normalizeKey(key))) {
    return replacementFor(context, "email", value);
  }

  if (PHONE_KEYS.has(normalizeKey(key))) {
    return replacementFor(context, "phone", value);
  }

  if (URL_KEYS.has(normalizeKey(key))) {
    return replacementFor(context, "url", value);
  }

  if (typeof value === "string") {
    return anonymizeTextContent(value, context, options);
  }

  return value;
}

function anonymizeCsv(value, context, options) {
  const rows = parseCsv(value);
  if (!rows.length) return "";

  const hasHeader = csvHasRecognizedHeader(rows);
  const headers = hasHeader ? rows[0].map(normalizeKey) : [];
  const firstDataRow = hasHeader ? 1 : 0;
  const transformed = rows.map((row) => [...row]);

  for (let rowIndex = firstDataRow; rowIndex < transformed.length; rowIndex += 1) {
    transformed[rowIndex] = transformed[rowIndex].map((cell, columnIndex) => {
      const key = headers[columnIndex] ?? "";

      if (options.removeTimestamps && isTimestampKey(key) && cell.trim()) {
        context.occurrences.timestamp += 1;
        return "";
      }

      if (options.replaceParticipants && PARTICIPANT_KEYS.has(key) && cell.trim()) {
        return replacementFor(context, "participant", cell);
      }

      if (isIdKey(key) && cell.trim()) {
        return replacementFor(context, "id", cell);
      }

      return anonymizeTextContent(cell, context, options);
    });
  }

  return serializeCsv(transformed);
}

function buildSummary(context) {
  return Object.entries(SUMMARY_META).map(([kind, meta]) => ({
    kind,
    label: meta.label,
    token: meta.token,
    count: context.occurrences[kind],
    unique: kind === "timestamp" ? context.occurrences.timestamp : context.maps[kind].size,
  }));
}

export function anonymizeChat(
  source,
  { format = "auto", removeTimestamps = true, replaceParticipants = true } = {},
) {
  if (typeof source !== "string") {
    throw new TypeError("Chat input must be text.");
  }

  const resolvedFormat = format === "auto" ? detectChatFormat(source) : format;
  if (!["text", "json", "csv"].includes(resolvedFormat)) {
    throw new Error("Choose TXT, JSON, CSV, or automatic format detection.");
  }

  const context = createContext();
  const options = { removeTimestamps, replaceParticipants };
  let output;

  if (resolvedFormat === "json") {
    let parsed;
    try {
      parsed = JSON.parse(source);
    } catch {
      throw new Error("The selected input does not contain valid JSON.");
    }
    output = JSON.stringify(transformStructured(parsed, context, options), null, 2);
  } else if (resolvedFormat === "csv") {
    output = anonymizeCsv(source, context, options);
  } else {
    output = anonymizeTextContent(source, context, options);
  }

  const summary = buildSummary(context);

  return {
    format: resolvedFormat,
    output,
    summary,
    totalChanges: summary.reduce((total, item) => total + item.count, 0),
  };
}

export function buildPrivacyReport(result) {
  return {
    format: result.format,
    totalChanges: result.totalChanges,
    detections: result.summary.map(({ kind, label, count, unique }) => ({
      kind,
      label,
      count,
      unique,
    })),
    containsRawChat: false,
  };
}

export function buildLinePreview(source, output, limit = 120) {
  const originalLines = String(source ?? "").split(/\r?\n/);
  const anonymizedLines = String(output ?? "").split(/\r?\n/);
  const totalLines = Math.max(originalLines.length, anonymizedLines.length);
  const shownLines = Math.min(totalLines, limit);

  return {
    rows: Array.from({ length: shownLines }, (_, index) => ({
      number: index + 1,
      original: originalLines[index] ?? "",
      anonymized: anonymizedLines[index] ?? "",
      changed: (originalLines[index] ?? "") !== (anonymizedLines[index] ?? ""),
    })),
    totalLines,
    truncated: totalLines > shownLines,
  };
}
