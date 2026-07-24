const MAX_LINES = 100;
const MAX_SOURCE_CHARACTERS = 10_000;

export const CATEGORY_SUFFIXES = Object.freeze({
  P: {
    label: "Promotional",
    explanation:
      "The -P suffix is the documented category cue for a promotional commercial message.",
  },
  S: {
    label: "Service",
    explanation:
      "The -S suffix is the documented category cue for a non-promotional service message.",
  },
  T: {
    label: "Transactional",
    explanation:
      "The -T suffix is the documented category cue for a transactional message.",
  },
  G: {
    label: "Government",
    explanation:
      "The -G suffix is the documented category cue for a government message.",
  },
});

// TRAI's official “Details & explanation of Headers & Prefixes” reference
// published with its 2020 compiled header list. Codes are explanatory only:
// this tool does not use them as live routing or registration data.
export const PROVIDER_CODES = Object.freeze({
  A: "Bharti Airtel / Bharti Hexacom",
  B: "Bharat Sanchar Nigam Limited (BSNL)",
  C: "V-CON Mobile & Infra",
  D: "Aircel / Dishnet Wireless",
  E: "Reliance Telecom",
  J: "Reliance Jio Infocomm",
  M: "Mahanagar Telephone Nigam Limited (MTNL)",
  Q: "Quadrant Televentures",
  R: "Reliance Communications",
  T: "Tata Teleservices",
  V: "Vodafone Idea",
});

export const SERVICE_AREA_CODES = Object.freeze({
  A: "Andhra Pradesh",
  B: "Bihar",
  D: "Delhi",
  E: "UP-East",
  G: "Gujarat",
  H: "Haryana",
  I: "Himachal Pradesh",
  J: "Jammu & Kashmir",
  K: "Kolkata",
  L: "Kerala",
  M: "Mumbai",
  N: "North East",
  O: "Odisha",
  P: "Punjab",
  R: "Rajasthan",
  S: "Assam",
  T: "Tamil Nadu including Chennai",
  V: "West Bengal",
  W: "UP-West",
  X: "Karnataka",
  Y: "Madhya Pradesh",
  Z: "Maharashtra",
});

function cleanLine(value) {
  return String(value ?? "")
    .replace(/^[\s"'`]+|[\s"'`]+$/g, "")
    .replace(/^(?:from|header|sender|sender id)\s*[:=]\s*/i, "")
    .replace(/[‐‑‒–—―]/g, "-")
    .trim()
    .slice(0, 200);
}

function component(code, table, type) {
  const value = table[code];
  return {
    code,
    explanation: value
      ? `The official 2020 prefix reference maps ${type} code ${code} to ${value}.`
      : `Code ${code} is not present in the official 2020 prefix reference used by this explainer.`,
    label: value || "Unknown in reference",
    status: value ? "known" : "unknown",
  };
}

function resultBase(input) {
  return {
    category: {
      code: "",
      explanation:
        "No supported category suffix was found, so message category is not determined.",
      label: "Unknown",
      status: "unknown",
    },
    format: "unrecognized",
    headerCode: "",
    input,
    normalized: input.toUpperCase(),
    notices: [],
    originPrefix: null,
    status: "unknown",
  };
}

export function explainSenderHeader(rawInput) {
  const input = cleanLine(rawInput);
  const normalized = input.toUpperCase();
  const base = resultBase(input);
  base.normalized = normalized;

  if (!input) {
    return {
      ...base,
      notices: ["No sender or header text was supplied."],
    };
  }

  if (/^127\d{3}$/.test(normalized)) {
    return {
      ...base,
      format: "consent-short-code",
      status: "explained",
      notices: [
        "The 127xxx pattern matches the short-code family prescribed for consent-seeking messages.",
        "This format cue does not prove that this specific message, request, consent record, or sender is authentic.",
      ],
    };
  }

  if (/^\+?91[- ]?\d{10}$/.test(normalized) || /^\d{10}$/.test(normalized)) {
    return {
      ...base,
      format: "ten-digit-number",
      status: "partial",
      notices: [
        "This is a regular phone-number shape, not the documented alphanumeric commercial SMS header structure.",
        "A number shape alone does not establish whether the message is personal, commercial, registered, unsolicited, safe, or malicious.",
      ],
    };
  }

  const fullWithSuffix = normalized.match(
    /^([A-Z])([A-Z])-([A-Z0-9]{6})-([PSTG])$/,
  );
  if (fullWithSuffix) {
    const [, providerCode, serviceAreaCode, headerCode, suffix] = fullWithSuffix;
    const provider = component(providerCode, PROVIDER_CODES, "provider");
    const serviceArea = component(
      serviceAreaCode,
      SERVICE_AREA_CODES,
      "service-area",
    );
    const category = CATEGORY_SUFFIXES[suffix];
    const unknownPrefix = [provider, serviceArea].some(
      (entry) => entry.status === "unknown",
    );

    return {
      ...base,
      category: { code: suffix, status: "known", ...category },
      format: "prefixed-with-category",
      headerCode,
      notices: [
        "The six-character middle segment has the shape of a Principal Entity header code.",
        ...(unknownPrefix
          ? [
              "At least one prefix character is absent from the historical reference; it is not treated as invalid because assignments can change.",
            ]
          : []),
      ],
      originPrefix: { provider, serviceArea },
      status: unknownPrefix ? "partial" : "explained",
    };
  }

  const fullWithoutSuffix = normalized.match(/^([A-Z])([A-Z])-([A-Z0-9]{6})$/);
  if (fullWithoutSuffix) {
    const [, providerCode, serviceAreaCode, headerCode] = fullWithoutSuffix;
    const provider = component(providerCode, PROVIDER_CODES, "provider");
    const serviceArea = component(
      serviceAreaCode,
      SERVICE_AREA_CODES,
      "service-area",
    );
    return {
      ...base,
      format: "prefixed-without-category",
      headerCode,
      notices: [
        "This matches the documented XY-ABCDEF prefix/header shape but has no current -P, -S, -T, or -G category cue.",
        "Absence of a recognized suffix does not by itself establish that the message is invalid, old, spoofed, or unregistered.",
      ],
      originPrefix: { provider, serviceArea },
      status: "partial",
    };
  }

  const baseWithSuffix = normalized.match(/^([A-Z0-9]{6})-([PSTG])$/);
  if (baseWithSuffix) {
    const [, headerCode, suffix] = baseWithSuffix;
    return {
      ...base,
      category: {
        code: suffix,
        status: "known",
        ...CATEGORY_SUFFIXES[suffix],
      },
      format: "header-with-category-no-prefix",
      headerCode,
      notices: [
        "A six-character header and category suffix are visible, but the two-character provider/service-area prefix is absent.",
      ],
      status: "partial",
    };
  }

  if (/^[A-Z0-9]{6}$/.test(normalized)) {
    return {
      ...base,
      format: "header-only",
      headerCode: normalized,
      notices: [
        "This has the six-character shape historically used for a Principal Entity header, but no provider/service-area prefix or category suffix is present.",
      ],
      status: "partial",
    };
  }

  const unknownSuffix = normalized.match(
    /^([A-Z])([A-Z])-([A-Z0-9]{6})-([A-Z0-9])$/,
  );
  if (unknownSuffix) {
    const [, providerCode, serviceAreaCode, headerCode, suffix] = unknownSuffix;
    return {
      ...base,
      category: {
        code: suffix,
        explanation: `Suffix -${suffix} is not one of the documented -P, -S, -T, or -G category cues.`,
        label: "Unknown suffix",
        status: "unknown",
      },
      format: "prefixed-unknown-category",
      headerCode,
      notices: [
        "The surrounding header structure is recognizable, but its suffix is unknown to this rule set.",
      ],
      originPrefix: {
        provider: component(providerCode, PROVIDER_CODES, "provider"),
        serviceArea: component(
          serviceAreaCode,
          SERVICE_AREA_CODES,
          "service-area",
        ),
      },
      status: "partial",
    };
  }

  return {
    ...base,
    notices: [
      "This input does not match a supported full header, partial header, 127xxx consent short code, or regular ten-digit number shape.",
      "No conclusion about sender identity, registration, authenticity, safety, consent, or message category can be drawn.",
    ],
  };
}

export function explainSenderHeaders(source) {
  const text = String(source ?? "");
  if (text.length > MAX_SOURCE_CHARACTERS) {
    return {
      results: [],
      summary: {
        categoryCues: 0,
        consentShortCodes: 0,
        explained: 0,
        partial: 0,
        tenDigitNumbers: 0,
        total: 0,
        unknown: 0,
      },
      warnings: [
        `Input exceeds the safe local limit of ${MAX_SOURCE_CHARACTERS.toLocaleString("en-US")} characters.`,
      ],
    };
  }

  const inputLines = text
    .split(/\r\n|\n|\r/)
    .map(cleanLine)
    .filter(Boolean);
  const boundedLines = inputLines.slice(0, MAX_LINES);
  const results = boundedLines.map(explainSenderHeader);
  const count = (predicate) => results.filter(predicate).length;

  return {
    results,
    summary: {
      categoryCues: count((result) => result.category.status === "known"),
      consentShortCodes: count(
        (result) => result.format === "consent-short-code",
      ),
      explained: count((result) => result.status === "explained"),
      partial: count((result) => result.status === "partial"),
      tenDigitNumbers: count(
        (result) => result.format === "ten-digit-number",
      ),
      total: results.length,
      unknown: count((result) => result.status === "unknown"),
    },
    warnings:
      inputLines.length > MAX_LINES
        ? [`Only the first ${MAX_LINES} non-empty lines were explained.`]
        : [],
  };
}

export function buildCountsOnlyHeaderReport(
  analysis,
  generatedAt = new Date().toISOString(),
) {
  const formatCounts = {};
  const categoryCounts = { G: 0, P: 0, S: 0, T: 0, unknown: 0 };
  analysis.results.forEach((result) => {
    formatCounts[result.format] = (formatCounts[result.format] ?? 0) + 1;
    const categoryKey =
      result.category.status === "known" ? result.category.code : "unknown";
    categoryCounts[categoryKey] += 1;
  });

  return JSON.stringify(
    {
      reportType: "ALTFTool Indian commercial SMS header format counts",
      generatedAt,
      summary: analysis.summary,
      formatCounts,
      categoryCueCounts: categoryCounts,
      warningCount: analysis.warnings.length,
      privacyNotice:
        "Counts only: entered sender IDs, header codes, phone numbers, provider codes, service areas and message content are excluded.",
      interpretation:
        "Recognized structure and suffixes are format cues only. They do not verify live DLT registration, sender identity, routing, consent, content-template matching, authenticity, link safety, or message legitimacy.",
      limitations: [
        "Provider and service-area explanations use TRAI's official 2020 prefix reference and may not reflect later assignments or network changes.",
        "No live Header Information Portal or DLT lookup is performed.",
        "Message bodies, links, phone numbers and attachments are never opened or contacted.",
        "A registered-looking header can be misused or visually imitated, and an unfamiliar format is not proof of fraud.",
      ],
    },
    null,
    2,
  );
}
