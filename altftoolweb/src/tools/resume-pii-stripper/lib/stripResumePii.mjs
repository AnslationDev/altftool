export const RESUME_PII_TYPES = [
  { id: "name", label: "Names", placeholder: "NAME" },
  { id: "email", label: "Email addresses", placeholder: "EMAIL" },
  { id: "phone", label: "Phone numbers", placeholder: "PHONE" },
  { id: "address", label: "Addresses", placeholder: "ADDRESS" },
  { id: "url", label: "Profile and portfolio links", placeholder: "URL" },
  { id: "handle", label: "Social handles", placeholder: "HANDLE" },
  { id: "dateOfBirth", label: "Dates of birth", placeholder: "DOB" },
  { id: "identifier", label: "Identity and candidate identifiers", placeholder: "ID" },
];

export const DEFAULT_RESUME_PII_TYPES = RESUME_PII_TYPES.map((type) => type.id);

const TYPE_BY_ID = new Map(RESUME_PII_TYPES.map((type) => [type.id, type]));

const NAME_HEADING_WORDS = new Set([
  "about",
  "achievements",
  "certifications",
  "contact",
  "curriculum",
  "education",
  "employment",
  "experience",
  "interests",
  "languages",
  "objective",
  "portfolio",
  "profile",
  "projects",
  "references",
  "resume",
  "skills",
  "summary",
  "vitae",
  "work",
]);

const DETECTORS = [
  {
    type: "dateOfBirth",
    regex:
      /\b(?:date\s+of\s+birth|birth\s+date|d\.?o\.?b\.?|born)\s*[:#=-]\s*((?:\d{1,2}[./-]){2}\d{2,4}|\d{4}-\d{2}-\d{2}|(?:\d{1,2}\s+)?[A-Z][a-z]{2,8}\s+\d{4})\b/gi,
    valueGroup: 1,
  },
  {
    type: "address",
    regex:
      /\b(?:current\s+address|permanent\s+address|mailing\s+address|postal\s+address|home\s+address|address)\s*[:#=-]\s*([^\r\n]{6,180})/gi,
    valueGroup: 1,
  },
  {
    type: "name",
    regex:
      /\b(?:candidate\s+name|applicant\s+name|full\s+name|name)\s*[:#=-]\s*([\p{L}][\p{L}.'’'-]*(?:[ \t]+[\p{L}][\p{L}.'’'-]*){0,4})(?=[ \t]*(?:$|[,;|]))/gimu,
    valueGroup: 1,
  },
  {
    type: "identifier",
    regex:
      /\b(?:passport(?:\s+(?:number|no\.?))?|employee\s+id|candidate\s+id|applicant\s+id|national\s+id|voter\s+id|driver'?s?\s+licen[cs]e(?:\s+(?:number|no\.?))?|id\s+(?:number|no\.?))\s*[:#=-]\s*([A-Z0-9][A-Z0-9 ./-]{4,24})/gi,
    valueGroup: 1,
  },
  {
    type: "identifier",
    regex: /\b[A-Z]{5}\d{4}[A-Z]\b/gi,
  },
  {
    type: "identifier",
    regex: /\b[2-9]\d{3}(?:[ -]?\d{4}){2}\b/g,
  },
  {
    type: "identifier",
    regex: /\b(?!000|666|9\d{2})\d{3}[ -]?(?!00)\d{2}[ -]?(?!0000)\d{4}\b/g,
  },
  {
    type: "email",
    regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}\b/gi,
  },
  {
    type: "url",
    regex:
      /\b(?:https?:\/\/|www\.)[^\s<>{}[\]"']+|\b(?:linkedin\.com\/in|github\.com|gitlab\.com|behance\.net|dribbble\.com)\/[A-Z0-9._~/?#=&%+-]+/gi,
  },
  {
    type: "handle",
    regex: /(^|[^\p{L}\p{N}._%+-])(@[A-Z0-9_][A-Z0-9_.-]{1,29})\b/gimu,
    valueGroup: 2,
  },
  {
    type: "phone",
    regex: /(?:^|[^\w])(\+?\d[\d ().-]{7,}\d)(?=$|[^\w])/gm,
    valueGroup: 1,
    validate(value) {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 15 || /^(\d)\1+$/.test(digits)) return false;
      return value.trim().startsWith("+") || /[().\s-]/.test(value) || /^[6-9]\d{9}$/.test(digits);
    },
  },
];

function cloneGlobalRegex(regex) {
  return new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : `${regex.flags}g`);
}

function overlaps(candidate, matches) {
  return matches.some((match) => candidate.start < match.end && candidate.end > match.start);
}

function addCandidate(matches, candidate) {
  if (!candidate.value || overlaps(candidate, matches)) return;
  matches.push(candidate);
}

function collectHeaderNameCandidates(text, matches) {
  let offset = 0;
  let nonEmptyLines = 0;

  for (const lineWithBreak of text.match(/[^\r\n]*(?:\r\n|\r|\n|$)/g) || []) {
    if (!lineWithBreak) continue;
    const line = lineWithBreak.replace(/[\r\n]+$/, "");
    const trimmed = line.trim();
    const leadingWhitespace = line.length - line.trimStart().length;

    if (trimmed) {
      nonEmptyLines += 1;
      if (nonEmptyLines <= 8 && isProbableHeaderName(trimmed)) {
        addCandidate(matches, {
          type: "name",
          label: TYPE_BY_ID.get("name").label,
          value: trimmed,
          start: offset + leadingWhitespace,
          end: offset + leadingWhitespace + trimmed.length,
        });
        return;
      }
    }

    offset += lineWithBreak.length;
    if (nonEmptyLines >= 8) break;
  }
}

function isProbableHeaderName(value) {
  if (value.length < 3 || value.length > 60) return false;
  if (/[:@/\\\d]|https?|\b(?:email|phone|mobile|tel)\b/i.test(value)) return false;

  const words = value.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 4) return false;
  if (words.some((word) => NAME_HEADING_WORDS.has(word.toLowerCase().replace(/[^\p{L}]/gu, "")))) {
    return false;
  }

  return words.every(
    (word) =>
      /^[\p{Lu}][\p{L}.'’'-]*$/u.test(word) ||
      (/^[\p{Lu}.'’'-]+$/u.test(word) && word.replace(/[^\p{L}]/gu, "").length > 1),
  );
}

function collectAddressLineCandidates(text, matches) {
  const streetHint =
    /\b(?:apartment|avenue|block|boulevard|chowk|colony|drive|flat|lane|nagar|road|sector|street|way)\b/i;
  const pinHint = /\b[1-9]\d{5}\b/;
  let offset = 0;

  for (const lineWithBreak of text.match(/[^\r\n]*(?:\r\n|\r|\n|$)/g) || []) {
    if (!lineWithBreak) continue;
    const line = lineWithBreak.replace(/[\r\n]+$/, "");
    const trimmed = line.trim();
    const leadingWhitespace = line.length - line.trimStart().length;
    const looksLikeAddress =
      trimmed.length >= 10 &&
      trimmed.length <= 180 &&
      ((/\d/.test(trimmed) && streetHint.test(trimmed)) ||
        (pinHint.test(trimmed) && /[,;]/.test(trimmed)));

    if (looksLikeAddress) {
      addCandidate(matches, {
        type: "address",
        label: TYPE_BY_ID.get("address").label,
        value: trimmed,
        start: offset + leadingWhitespace,
        end: offset + leadingWhitespace + trimmed.length,
      });
    }
    offset += lineWithBreak.length;
  }
}

function collectMatches(text, enabledTypes) {
  const enabled = new Set(enabledTypes);
  const matches = [];

  for (const detector of DETECTORS) {
    if (!enabled.has(detector.type)) continue;

    const regex = cloneGlobalRegex(detector.regex);
    for (const match of text.matchAll(regex)) {
      const value = detector.valueGroup ? match[detector.valueGroup] : match[0];
      if (!value || (detector.validate && !detector.validate(value))) continue;

      const relativeStart = detector.valueGroup ? match[0].indexOf(value) : 0;
      const start = match.index + Math.max(0, relativeStart);
      addCandidate(matches, {
        type: detector.type,
        label: TYPE_BY_ID.get(detector.type).label,
        value,
        start,
        end: start + value.length,
      });
    }
  }

  if (enabled.has("name")) collectHeaderNameCandidates(text, matches);
  if (enabled.has("address")) collectAddressLineCandidates(text, matches);

  return matches.sort((left, right) => left.start - right.start || right.end - left.end);
}

function normalizedIdentity(type, value) {
  if (["email", "url", "handle"].includes(type)) return value.toLowerCase().replace(/\s/g, "");
  if (["phone", "identifier"].includes(type)) return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return value.trim().toLocaleLowerCase("en");
}

function replacementFor(match, mode, placeholders, sequenceByType) {
  if (mode === "remove") return "";

  const identity = `${match.type}:${normalizedIdentity(match.type, match.value)}`;
  if (!placeholders.has(identity)) {
    const next = (sequenceByType.get(match.type) || 0) + 1;
    sequenceByType.set(match.type, next);
    placeholders.set(identity, `[${TYPE_BY_ID.get(match.type).placeholder}_${next}]`);
  }
  return placeholders.get(identity);
}

export function stripResumePii(source, options = {}) {
  const text = String(source || "");
  const enabledTypes = options.enabledTypes || DEFAULT_RESUME_PII_TYPES;
  const mode = options.mode === "remove" ? "remove" : "placeholder";
  const matches = collectMatches(text, enabledTypes);
  const placeholders = new Map();
  const sequenceByType = new Map();
  const safeMatches = [];

  let output = "";
  let cursor = 0;
  for (const match of matches) {
    const replacement = replacementFor(match, mode, placeholders, sequenceByType);
    output += `${text.slice(cursor, match.start)}${replacement}`;
    cursor = match.end;
    safeMatches.push({
      type: match.type,
      label: match.label,
      start: match.start,
      end: match.end,
      replacement,
    });
  }
  output += text.slice(cursor);

  if (mode === "remove") {
    output = output
      .replace(/[ \t]+(?=\r?$)/gm, "")
      .replace(/^[ \t]*[:#=-][ \t]*/gm, "")
      .replace(/\n{3,}/g, "\n\n");
  }

  const summary = RESUME_PII_TYPES.map((type) => {
    const typeMatches = matches.filter((match) => match.type === type.id);
    return {
      type: type.id,
      label: type.label,
      count: typeMatches.length,
      uniqueValues: new Set(
        typeMatches.map((match) => normalizedIdentity(match.type, match.value)),
      ).size,
    };
  }).filter((item) => item.count > 0);

  return {
    output,
    matches: safeMatches,
    summary,
    total: matches.length,
    categoryCount: summary.length,
  };
}

export function buildCountsOnlyReport(result, mode) {
  return {
    generatedAt: new Date().toISOString(),
    mode: mode === "remove" ? "remove" : "placeholder",
    totalDetections: result.total,
    categoriesDetected: result.categoryCount,
    detections: result.summary.map(({ type, label, count, uniqueValues }) => ({
      type,
      label,
      count,
      uniqueValues,
    })),
    note:
      "Counts only: this report intentionally excludes the resume text and detected values. Automated detection needs human review.",
  };
}
