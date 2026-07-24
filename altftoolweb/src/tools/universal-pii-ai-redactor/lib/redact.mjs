export const PII_TYPES = [
  {
    id: "name",
    label: "Labelled names",
    shortLabel: "NAME",
    group: "Personal",
    description: "Values after Name, Patient name, Customer name, or Employee name",
  },
  {
    id: "email",
    label: "Email addresses",
    shortLabel: "EMAIL",
    group: "Personal",
    description: "Standard personal and work email addresses",
  },
  {
    id: "phone",
    label: "Phone numbers",
    shortLabel: "PHONE",
    group: "Personal",
    description: "Formatted international and 10-digit Indian phone numbers",
  },
  {
    id: "address",
    label: "Labelled addresses",
    shortLabel: "ADDRESS",
    group: "Personal",
    description: "Values on lines beginning with Address or Mailing address",
  },
  {
    id: "dateOfBirth",
    label: "Dates of birth",
    shortLabel: "DOB",
    group: "Personal",
    description: "Dates explicitly labelled DOB, Date of birth, or Born",
  },
  {
    id: "aadhaar",
    label: "Aadhaar candidates",
    shortLabel: "AADHAAR",
    group: "Identity",
    description: "Plausible 12-digit Aadhaar-style identifiers",
  },
  {
    id: "pan",
    label: "Indian PAN",
    shortLabel: "PAN",
    group: "Identity",
    description: "Ten-character Indian PAN identifiers",
  },
  {
    id: "passport",
    label: "Passport numbers",
    shortLabel: "PASSPORT",
    group: "Identity",
    description: "Values explicitly labelled Passport or Passport number",
  },
  {
    id: "ssn",
    label: "US SSN",
    shortLabel: "SSN",
    group: "Identity",
    description: "Plausible US Social Security numbers",
  },
  {
    id: "creditCard",
    label: "Payment cards",
    shortLabel: "CARD",
    group: "Financial",
    description: "13–19 digit card candidates that pass the Luhn checksum",
  },
  {
    id: "bankAccount",
    label: "Bank account numbers",
    shortLabel: "BANK_ACCOUNT",
    group: "Financial",
    description: "Digits explicitly labelled Account number, A/C, or Bank account",
  },
  {
    id: "iban",
    label: "IBAN",
    shortLabel: "IBAN",
    group: "Financial",
    description: "International bank account numbers that pass MOD-97 validation",
  },
  {
    id: "ipAddress",
    label: "IP addresses",
    shortLabel: "IP_ADDRESS",
    group: "Technical",
    description: "Valid IPv4 network addresses",
  },
  {
    id: "macAddress",
    label: "MAC addresses",
    shortLabel: "MAC_ADDRESS",
    group: "Technical",
    description: "Colon- or hyphen-separated hardware addresses",
  },
  {
    id: "secret",
    label: "Keys, tokens & passwords",
    shortLabel: "SECRET",
    group: "Technical",
    description: "Private keys, API keys, JWTs, bearer tokens, and labelled credentials",
  },
];

export const DEFAULT_ENABLED_TYPES = PII_TYPES.map((type) => type.id);

const TYPE_BY_ID = new Map(PII_TYPES.map((type) => [type.id, type]));

function luhnValid(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19 || /^(\d)\1+$/.test(digits)) return false;

  let sum = 0;
  let doubleDigit = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

function ibanValid(value) {
  const compact = value.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(compact)) return false;

  const rearranged = `${compact.slice(4)}${compact.slice(0, 4)}`;
  let remainder = 0;
  for (const character of rearranged) {
    const expanded = /\d/.test(character) ? character : String(character.charCodeAt(0) - 55);
    for (const digit of expanded) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

function ipv4Valid(value) {
  const parts = value.split(".");
  return parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}

function phoneValid(value) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  if (digits.length === 10 && /^[6-9]/.test(digits)) return true;
  return trimmed.startsWith("+") || /[().\s-]/.test(trimmed);
}

const DETECTORS = [
  {
    type: "secret",
    regex:
      /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
  },
  {
    type: "secret",
    regex:
      /\b(?:sk-(?:proj-)?[A-Za-z0-9_-]{16,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|gh[pousr]_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,})\b/g,
  },
  {
    type: "secret",
    regex: /\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/g,
  },
  {
    type: "secret",
    regex: /\b(?:Authorization\s*:\s*)?Bearer\s+([A-Za-z0-9._~+/-]{16,}=*)/gi,
    valueGroup: 1,
  },
  {
    type: "secret",
    regex:
      /\b(?:api[\s_-]?key|client[\s_-]?secret|access[\s_-]?token|refresh[\s_-]?token|password|passwd|pwd)\s*[:=]\s*["']?([^\s"'`,;]{6,})/gi,
    valueGroup: 1,
  },
  {
    type: "address",
    regex: /\b(?:mailing\s+address|postal\s+address|home\s+address|address|addr)\s*[:=-]\s*([^\r\n]{5,160})/gi,
    valueGroup: 1,
  },
  {
    type: "name",
    regex:
      /\b(?:full\s+name|patient\s+name|customer\s+name|employee\s+name|name)\s*[:=-]\s*([\p{L}][\p{L}.'’'-]*(?:[ \t]+[\p{L}][\p{L}.'’'-]*){0,4})(?=[ \t]*(?:$|[,;|]))/gimu,
    valueGroup: 1,
  },
  {
    type: "dateOfBirth",
    regex:
      /\b(?:date\s+of\s+birth|birth\s+date|dob|born)\s*[:=-]\s*((?:\d{1,2}[./-]){2}\d{2,4}|\d{4}-\d{2}-\d{2})\b/gi,
    valueGroup: 1,
  },
  {
    type: "passport",
    regex: /\b(?:passport(?:\s+(?:number|no\.?))?)\s*[:#=-]\s*([A-Z0-9]{6,12})\b/gi,
    valueGroup: 1,
  },
  {
    type: "bankAccount",
    regex:
      /\b(?:bank\s+account|account\s+(?:number|no\.?)|a\/c(?:\s+no\.?)?)\s*[:#=-]\s*(\d(?:[\s-]?\d){7,19})\b/gi,
    valueGroup: 1,
  },
  {
    type: "creditCard",
    regex: /\b\d(?:[ -]?\d){12,18}\b/g,
    validate: luhnValid,
  },
  {
    type: "aadhaar",
    regex: /\b[2-9]\d{3}(?:[ -]?\d{4}){2}\b/g,
  },
  {
    type: "pan",
    regex: /\b[A-Z]{5}\d{4}[A-Z]\b/gi,
  },
  {
    type: "ssn",
    regex: /\b(?!000|666|9\d{2})\d{3}[ -]?(?!00)\d{2}[ -]?(?!0000)\d{4}\b/g,
  },
  {
    type: "iban",
    regex: /\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]){11,30}\b/gi,
    validate: ibanValid,
  },
  {
    type: "email",
    regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}\b/gi,
  },
  {
    type: "ipAddress",
    regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    validate: ipv4Valid,
  },
  {
    type: "macAddress",
    regex: /\b(?:[0-9A-F]{2}[:-]){5}[0-9A-F]{2}\b/gi,
  },
  {
    type: "phone",
    regex: /(?:^|[^\w])(\+?\d[\d ().-]{7,}\d)(?=$|[^\w])/gm,
    valueGroup: 1,
    validate: phoneValid,
  },
];

function cloneGlobalRegex(regex) {
  const flags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`;
  return new RegExp(regex.source, flags);
}

function overlaps(candidate, accepted) {
  return accepted.some((match) => candidate.start < match.end && candidate.end > match.start);
}

function collectMatches(text, enabledTypes) {
  const enabled = new Set(enabledTypes);
  const accepted = [];

  for (const detector of DETECTORS) {
    if (!enabled.has(detector.type)) continue;

    const regex = cloneGlobalRegex(detector.regex);
    for (const match of text.matchAll(regex)) {
      const value = detector.valueGroup ? match[detector.valueGroup] : match[0];
      if (!value || (detector.validate && !detector.validate(value))) continue;

      const offset = detector.valueGroup ? match[0].indexOf(value) : 0;
      const start = match.index + Math.max(0, offset);
      const candidate = {
        type: detector.type,
        label: TYPE_BY_ID.get(detector.type)?.label || detector.type,
        value,
        start,
        end: start + value.length,
      };

      if (!overlaps(candidate, accepted)) accepted.push(candidate);
    }
  }

  return accepted.sort((left, right) => left.start - right.start || right.end - left.end);
}

function normalizedIdentity(type, value) {
  if (["email", "pan", "iban", "macAddress"].includes(type)) return value.toLowerCase().replace(/\s/g, "");
  if (["phone", "aadhaar", "ssn", "creditCard", "bankAccount"].includes(type)) return value.replace(/\D/g, "");
  return value.trim().toLowerCase();
}

function maskAlphaNumeric(value, keepEnd = 2) {
  const visibleIndexes = [];
  for (let index = 0; index < value.length; index += 1) {
    if (/[\p{L}\p{N}]/u.test(value[index])) visibleIndexes.push(index);
  }

  const keep = new Set(visibleIndexes.slice(-keepEnd));
  return [...value]
    .map((character, index) => (/[\p{L}\p{N}]/u.test(character) && !keep.has(index) ? "•" : character))
    .join("");
}

function partiallyMask(type, value) {
  if (type === "name") {
    return value
      .split(/(\s+)/)
      .map((part) => (/\s+/.test(part) ? part : `${part.slice(0, 1)}${"•".repeat(Math.max(0, part.length - 1))}`))
      .join("");
  }
  if (type === "email") {
    const [local, domain = ""] = value.split("@");
    const [host, ...suffix] = domain.split(".");
    const maskedLocal = `${local.slice(0, 1)}${"•".repeat(Math.max(1, local.length - 1))}`;
    const maskedHost = `${host.slice(0, 1)}${"•".repeat(Math.max(1, host.length - 1))}`;
    return `${maskedLocal}@${maskedHost}${suffix.length ? `.${suffix.join(".")}` : ""}`;
  }
  if (type === "secret" || type === "address") return `[MASKED_${TYPE_BY_ID.get(type)?.shortLabel || "VALUE"}]`;
  return maskAlphaNumeric(value, ["phone", "creditCard", "bankAccount"].includes(type) ? 4 : 2);
}

function replacementFor(match, mode, placeholders, sequenceByType) {
  if (mode === "remove") return "[REDACTED]";
  if (mode === "partial") return partiallyMask(match.type, match.value);

  const identity = `${match.type}:${normalizedIdentity(match.type, match.value)}`;
  if (!placeholders.has(identity)) {
    const next = (sequenceByType.get(match.type) || 0) + 1;
    sequenceByType.set(match.type, next);
    const shortLabel = TYPE_BY_ID.get(match.type)?.shortLabel || "PII";
    placeholders.set(identity, `[${shortLabel}_${next}]`);
  }
  return placeholders.get(identity);
}

export function redactText(source, options = {}) {
  const text = String(source || "");
  const enabledTypes = options.enabledTypes || DEFAULT_ENABLED_TYPES;
  const mode = ["label", "partial", "remove"].includes(options.mode) ? options.mode : "label";
  const matches = collectMatches(text, enabledTypes);
  const placeholders = new Map();
  const sequenceByType = new Map();

  let output = "";
  let cursor = 0;
  const safeMatches = matches.map((match) => {
    const replacement = replacementFor(match, mode, placeholders, sequenceByType);
    output += `${text.slice(cursor, match.start)}${replacement}`;
    cursor = match.end;
    return {
      type: match.type,
      label: match.label,
      start: match.start,
      end: match.end,
      replacement,
    };
  });
  output += text.slice(cursor);

  const summary = PII_TYPES.map((type) => {
    const typeMatches = matches.filter((match) => match.type === type.id);
    const uniqueValues = new Set(typeMatches.map((match) => normalizedIdentity(match.type, match.value))).size;
    return {
      type: type.id,
      label: type.label,
      count: typeMatches.length,
      uniqueValues,
    };
  }).filter((item) => item.count > 0);
  const uniqueValues = new Set(
    matches.map((match) => `${match.type}:${normalizedIdentity(match.type, match.value)}`),
  ).size;

  return {
    output,
    matches: safeMatches,
    summary,
    total: matches.length,
    uniqueValues,
  };
}

export function buildSafeReport(result, mode) {
  return {
    generatedAt: new Date().toISOString(),
    mode,
    totalDetections: result.total,
    categoriesDetected: result.summary.length,
    detections: result.summary.map(({ type, label, count, uniqueValues }) => ({
      type,
      label,
      count,
      uniqueValues,
    })),
    note: "This report contains counts only. Review the redacted text before sharing it.",
  };
}
