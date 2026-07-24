export const IDENTIFIER_CATEGORIES = Object.freeze([
  {
    id: "patientName",
    label: "Patient names",
    placeholder: "PATIENT_NAME",
    description: "Names explicitly labelled as a patient or subject",
  },
  {
    id: "medicalId",
    label: "MRN & patient IDs",
    placeholder: "MEDICAL_ID",
    description: "MRN, UHID, patient ID, health ID, and hospital numbers",
  },
  {
    id: "dateOfBirth",
    label: "Dates of birth",
    placeholder: "DOB",
    description: "Dates explicitly labelled DOB, born, or date of birth",
  },
  {
    id: "phone",
    label: "Phone numbers",
    placeholder: "PHONE",
    description: "Labelled phone, mobile, telephone, and contact numbers",
  },
  {
    id: "email",
    label: "Email addresses",
    placeholder: "EMAIL",
    description: "Standard email addresses anywhere in the report",
  },
  {
    id: "address",
    label: "Addresses",
    placeholder: "ADDRESS",
    description: "Values on lines labelled address, residence, or location",
  },
  {
    id: "date",
    label: "Other dates",
    placeholder: "DATE",
    description: "Numeric and English-language dates, including visit dates",
  },
  {
    id: "clinician",
    label: "Clinician identifiers",
    placeholder: "CLINICIAN",
    description: "Names labelled doctor, clinician, physician, provider, or signatory",
  },
  {
    id: "facility",
    label: "Facility identifiers",
    placeholder: "FACILITY",
    description: "Names labelled hospital, clinic, laboratory, or facility",
  },
]);

export const DEFAULT_ENABLED_CATEGORIES = Object.freeze(
  IDENTIFIER_CATEGORIES.map((category) => category.id),
);

const CATEGORY_BY_ID = new Map(
  IDENTIFIER_CATEGORIES.map((category) => [category.id, category]),
);

const NUMERIC_DATE =
  String.raw`(?:\d{4}[./-]\d{1,2}[./-]\d{1,2}|\d{1,2}[./-]\d{1,2}[./-]\d{2,4})`;
const WRITTEN_DATE =
  String.raw`(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}|\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?),?\s+\d{4})`;

const DETECTORS = [
  {
    category: "medicalId",
    regex:
      /\b(?:medical\s+record(?:\s+(?:number|no\.?))?|mrn|patient\s+(?:id|identifier|number|no\.?)|uhid|health\s+id|hospital\s+(?:number|no\.?))\s*[:#=-]\s*([A-Z0-9][A-Z0-9./_-]{2,31})\b/gi,
    valueGroup: 1,
  },
  {
    category: "patientName",
    regex:
      /\b(?:patient(?:'s)?\s+(?:full\s+)?name|name\s+of\s+(?:the\s+)?patient|patient)\s*[:#=-]\s*([\p{L}][\p{L}\p{M}.'’ -]{1,78})(?=\s*(?:$|[,;|]))/gimu,
    valueGroup: 1,
  },
  {
    category: "dateOfBirth",
    regex: new RegExp(
      String.raw`\b(?:date\s+of\s+birth|birth\s+date|dob|born)\s*[:#=-]\s*(${NUMERIC_DATE}|${WRITTEN_DATE})\b`,
      "gi",
    ),
    valueGroup: 1,
  },
  {
    category: "clinician",
    regex:
      /\b(?:attending(?:\s+(?:doctor|physician))?|physician|doctor|clinician|provider|consultant|referring(?:\s+(?:doctor|physician))?|signed\s+by|reported\s+by)\s*[:#=-]\s*((?:Dr\.?\s+)?[\p{L}][\p{L}\p{M}.'’ -]{1,78})(?=\s*(?:$|[,;|]))/gimu,
    valueGroup: 1,
  },
  {
    category: "facility",
    regex:
      /\b(?:healthcare\s+facility|medical\s+facility|facility|hospital|clinic|laboratory|lab|medical\s+cent(?:er|re)|institution)\s*[:#=-]\s*([\p{L}\p{N}][\p{L}\p{N}\p{M}.'’&() -]{1,118})(?=\s*(?:$|[,;|]))/gimu,
    valueGroup: 1,
  },
  {
    category: "address",
    regex:
      /\b(?:patient\s+address|home\s+address|residential\s+address|mailing\s+address|residence|address|location)\s*[:#=-]\s*([^\r\n]{5,180})/gi,
    valueGroup: 1,
  },
  {
    category: "phone",
    regex:
      /\b(?:patient\s+phone|phone|telephone|mobile|contact(?:\s+(?:number|no\.?))?)\s*[:#=-]\s*(\+?\d(?:[\d ().-]{7,}\d))/gi,
    valueGroup: 1,
    validate: validPhone,
  },
  {
    category: "email",
    regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}\b/gi,
  },
  {
    category: "date",
    regex: new RegExp(String.raw`\b(?:${NUMERIC_DATE}|${WRITTEN_DATE})\b`, "gi"),
  },
];

function validPhone(value) {
  const digits = String(value).replace(/\D/g, "");
  return (
    digits.length >= 10 &&
    digits.length <= 15 &&
    !/^(\d)\1+$/.test(digits)
  );
}

function cleanCapturedValue(value) {
  return String(value)
    .replace(/^[\s:=#-]+/, "")
    .replace(/[\s,;|]+$/, "");
}

function normalizedIdentity(value) {
  return cleanCapturedValue(value)
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("en");
}

function collectCandidates(source, enabledSet) {
  const candidates = [];

  DETECTORS.forEach((detector, priority) => {
    if (!enabledSet.has(detector.category)) return;

    const regex = new RegExp(detector.regex.source, detector.regex.flags);
    for (const match of source.matchAll(regex)) {
      const rawValue = detector.valueGroup ? match[detector.valueGroup] : match[0];
      if (!rawValue || (detector.validate && !detector.validate(rawValue))) continue;

      const value = cleanCapturedValue(rawValue);
      if (!value) continue;

      const rawOffset = match[0].indexOf(rawValue);
      const trimmedOffset = rawValue.indexOf(value);
      const start = match.index + Math.max(0, rawOffset) + Math.max(0, trimmedOffset);
      const end = start + value.length;

      candidates.push({
        category: detector.category,
        end,
        priority,
        start,
        value,
      });
    }
  });

  return candidates.sort(
    (left, right) =>
      left.start - right.start ||
      left.priority - right.priority ||
      right.end - right.start - (left.end - left.start),
  );
}

function removeOverlaps(candidates) {
  const accepted = [];

  for (const candidate of candidates) {
    if (
      accepted.some(
        (existing) =>
          candidate.start < existing.end && candidate.end > existing.start,
      )
    ) {
      continue;
    }
    accepted.push(candidate);
  }

  return accepted.sort((left, right) => left.start - right.start);
}

export function deidentifyMedicalText(
  input,
  { enabledCategories = DEFAULT_ENABLED_CATEGORIES } = {},
) {
  const source = String(input ?? "");
  const enabledSet = new Set(
    Array.isArray(enabledCategories)
      ? enabledCategories.filter((id) => CATEGORY_BY_ID.has(id))
      : [],
  );
  const matches = removeOverlaps(collectCandidates(source, enabledSet));
  const counters = new Map();
  const replacements = new Map();

  const safeMatches = matches.map((match) => {
    const category = CATEGORY_BY_ID.get(match.category);
    const normalized = normalizedIdentity(match.value);
    let categoryValues = replacements.get(match.category);
    if (!categoryValues) {
      categoryValues = new Map();
      replacements.set(match.category, categoryValues);
    }

    let replacement = categoryValues.get(normalized);
    if (!replacement) {
      const sequence = (counters.get(match.category) || 0) + 1;
      counters.set(match.category, sequence);
      replacement = `[${category.placeholder}_${sequence}]`;
      categoryValues.set(normalized, replacement);
    }

    return {
      category: match.category,
      end: match.end,
      replacement,
      start: match.start,
    };
  });

  let cursor = 0;
  let output = "";
  for (const match of safeMatches) {
    output += source.slice(cursor, match.start);
    output += match.replacement;
    cursor = match.end;
  }
  output += source.slice(cursor);

  const summary = IDENTIFIER_CATEGORIES.map((category) => {
    const categoryMatches = safeMatches.filter(
      (match) => match.category === category.id,
    );
    return {
      category: category.id,
      count: categoryMatches.length,
      label: category.label,
      uniqueValues: new Set(
        categoryMatches.map((match) => match.replacement),
      ).size,
    };
  }).filter((item) => item.count > 0);

  return {
    matches: safeMatches,
    output,
    summary,
    total: safeMatches.length,
    uniqueValues: summary.reduce(
      (total, item) => total + item.uniqueValues,
      0,
    ),
  };
}

export function buildCountsOnlyReport(
  result,
  { enabledCategories = DEFAULT_ENABLED_CATEGORIES, sourceKind = "pasted text" } = {},
) {
  return {
    reportType: "counts-only",
    sourceKind: String(sourceKind || "pasted text"),
    totalReplacements: Number(result?.total || 0),
    totalUniqueValues: Number(result?.uniqueValues || 0),
    categories: Array.isArray(result?.summary)
      ? result.summary.map(({ category, count, label, uniqueValues }) => ({
          category,
          count,
          label,
          uniqueValues,
        }))
      : [],
    enabledCategories: Array.isArray(enabledCategories)
      ? enabledCategories.filter((id) => CATEGORY_BY_ID.has(id))
      : [],
    containsSourceText: false,
    containsDetectedValues: false,
  };
}
