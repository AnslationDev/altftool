import { diffArrays } from "diff";

export const MAX_SOURCE_CHARACTERS = 250_000;
export const MAX_COMPARISON_LINES = 3_000;
export const MAX_STRUCTURAL_CHANGES = 500;
const MAX_LINE_EDIT_DISTANCE = 4_000;

export const DEFAULT_COMPARISON_OPTIONS = Object.freeze({
  normalizeLineEndings: true,
  trimLineWhitespace: false,
  collapseWhitespace: false,
});

const FORMAT_VALUES = new Set(["text", "markdown", "json", "csv"]);

function normalizedOptions(input = {}) {
  return {
    normalizeLineEndings:
      input.normalizeLineEndings ??
      DEFAULT_COMPARISON_OPTIONS.normalizeLineEndings,
    trimLineWhitespace:
      input.trimLineWhitespace ?? DEFAULT_COMPARISON_OPTIONS.trimLineWhitespace,
    collapseWhitespace:
      input.collapseWhitespace ?? DEFAULT_COMPARISON_OPTIONS.collapseWhitespace,
  };
}

export function normalizationDisclosure(input = {}) {
  const options = normalizedOptions(input);
  return [
    options.normalizeLineEndings
      ? "CRLF and CR line endings are compared as LF."
      : "Line-ending differences remain observable.",
    options.trimLineWhitespace
      ? "Leading and trailing whitespace on each line is ignored."
      : "Leading and trailing line whitespace remains observable.",
    options.collapseWhitespace
      ? "Runs of spaces and tabs are compared as one space."
      : "Runs of spaces and tabs remain observable.",
  ];
}

export function normalizeComparisonText(source, input = {}) {
  const options = normalizedOptions(input);
  let text = String(source ?? "");
  if (options.normalizeLineEndings)
    text = text.replace(/\r\n?|\u2028|\u2029/gu, "\n");

  if (options.trimLineWhitespace || options.collapseWhitespace) {
    text = text
      .split("\n")
      .map((line) => {
        let next = line;
        if (options.collapseWhitespace) next = next.replace(/[ \t]+/gu, " ");
        if (options.trimLineWhitespace) next = next.trim();
        return next;
      })
      .join("\n");
  }
  return text;
}

function splitLines(source) {
  return String(source).split("\n");
}

function alignLineChanges(beforeText, afterText, options) {
  const beforeLines = splitLines(normalizeComparisonText(beforeText, options));
  const afterLines = splitLines(normalizeComparisonText(afterText, options));
  if (
    beforeLines.length > MAX_COMPARISON_LINES ||
    afterLines.length > MAX_COMPARISON_LINES
  ) {
    throw new Error(
      `Each comparison representation is limited to ${MAX_COMPARISON_LINES.toLocaleString("en-US")} lines.`,
    );
  }

  const parts = diffArrays(beforeLines, afterLines, {
    maxEditLength: MAX_LINE_EDIT_DISTANCE,
  });
  if (!parts) {
    throw new Error(
      "The versions exceed the bounded line-change distance. Compare smaller sections separately.",
    );
  }
  const rows = [];
  let beforeLine = 1;
  let afterLine = 1;

  for (let index = 0; index < parts.length;) {
    const part = parts[index];
    if (!part.added && !part.removed) {
      part.value.forEach((line) => {
        rows.push({
          type: "equal",
          before: line,
          after: line,
          beforeLine,
          afterLine,
        });
        beforeLine += 1;
        afterLine += 1;
      });
      index += 1;
      continue;
    }

    const removed = [];
    const added = [];
    while (
      index < parts.length &&
      (parts[index].added || parts[index].removed)
    ) {
      if (parts[index].removed) removed.push(...parts[index].value);
      if (parts[index].added) added.push(...parts[index].value);
      index += 1;
    }

    const length = Math.max(removed.length, added.length);
    for (let offset = 0; offset < length; offset += 1) {
      const hasBefore = offset < removed.length;
      const hasAfter = offset < added.length;
      rows.push({
        type:
          hasBefore && hasAfter ? "changed" : hasBefore ? "removed" : "added",
        before: hasBefore ? removed[offset] : "",
        after: hasAfter ? added[offset] : "",
        beforeLine: hasBefore ? beforeLine : null,
        afterLine: hasAfter ? afterLine : null,
      });
      if (hasBefore) beforeLine += 1;
      if (hasAfter) afterLine += 1;
    }
  }

  const lineStats = {
    additions: rows.filter((row) => row.type === "added").length,
    removals: rows.filter((row) => row.type === "removed").length,
    changes: rows.filter((row) => row.type === "changed").length,
    unchanged: rows.filter((row) => row.type === "equal").length,
    beforeLines: beforeLines.length,
    afterLines: afterLines.length,
  };

  return { rows, lineStats };
}

function headingForLine(line, format) {
  const clean = String(line || "").trim();
  if (!clean) return null;

  const markdownHeading = clean.match(/^#{1,6}\s+(.+?)\s*#*$/u);
  if (markdownHeading) return markdownHeading[1].trim().slice(0, 100);
  if (format === "markdown") return null;

  const uppercaseHeading =
    clean.length <= 80 &&
    /\p{L}/u.test(clean) &&
    clean === clean.toLocaleUpperCase() &&
    !/[.!?]$/u.test(clean);
  const colonHeading = clean.length <= 60 && /^[^,:;.!?]+:$/u.test(clean);
  return uppercaseHeading || colonHeading
    ? clean.replace(/:$/u, "").slice(0, 100)
    : null;
}

function summarizeSections(rows, format) {
  const summaries = new Map();
  let beforeSection = "Document body";
  let afterSection = "Document body";

  rows.forEach((row) => {
    const beforeHeading = headingForLine(row.before, format);
    const afterHeading = headingForLine(row.after, format);
    if (beforeHeading) beforeSection = beforeHeading;
    if (afterHeading) afterSection = afterHeading;
    if (row.type === "equal") return;

    const section = row.type === "removed" ? beforeSection : afterSection;
    const current = summaries.get(section) || {
      section,
      additions: 0,
      removals: 0,
      changes: 0,
    };
    current[
      row.type === "added"
        ? "additions"
        : row.type === "removed"
          ? "removals"
          : "changes"
    ] += 1;
    summaries.set(section, current);
  });

  return [...summaries.values()];
}

function normalizeScalar(value, options) {
  return typeof value === "string"
    ? normalizeComparisonText(value, options)
    : value;
}

function normalizeJsonValue(value, options) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeJsonValue(item, options));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normalizeJsonValue(value[key], options)]),
    );
  }
  return normalizeScalar(value, options);
}

function jsonPath(parent, key, arrayIndex = false) {
  if (arrayIndex) return `${parent}[${key}]`;
  return /^[A-Za-z_$][\w$]*$/u.test(key)
    ? `${parent}.${key}`
    : `${parent}[${JSON.stringify(key)}]`;
}

function previewValue(value) {
  const serialized =
    typeof value === "string"
      ? JSON.stringify(value)
      : value === undefined
        ? "Missing"
        : JSON.stringify(value);
  const text = String(serialized);
  return text.length > 140 ? `${text.slice(0, 137)}...` : text;
}

function flattenJson(value, options) {
  const fields = new Map();
  let limitReached = false;
  let depthLimitReached = false;

  function visit(item, path, depth) {
    if (fields.size >= 5_000) {
      limitReached = true;
      return;
    }
    if (depth > 40) {
      depthLimitReached = true;
      return;
    }

    if (Array.isArray(item)) {
      if (!item.length) {
        fields.set(path, {
          type: "array",
          value: [],
          signature: "array:[]",
        });
        return;
      }
      item.forEach((child, index) =>
        visit(child, jsonPath(path, index, true), depth + 1),
      );
      return;
    }

    if (item && typeof item === "object") {
      const keys = Object.keys(item).sort();
      if (!keys.length) {
        fields.set(path, {
          type: "object",
          value: {},
          signature: "object:{}",
        });
        return;
      }
      keys.forEach((key) => visit(item[key], jsonPath(path, key), depth + 1));
      return;
    }

    const normalized = normalizeScalar(item, options);
    const type = item === null ? "null" : typeof item;
    fields.set(path, {
      type,
      value: normalized,
      signature: `${type}:${JSON.stringify(normalized)}`,
    });
  }

  visit(value, "$", 0);
  return { fields, limitReached, depthLimitReached };
}

function compareJson(beforeSource, afterSource, options) {
  let beforeValue;
  let afterValue;
  try {
    beforeValue = JSON.parse(beforeSource);
  } catch {
    throw new Error("The original version is not valid JSON.");
  }
  try {
    afterValue = JSON.parse(afterSource);
  } catch {
    throw new Error("The updated version is not valid JSON.");
  }

  const beforeFlat = flattenJson(beforeValue, options);
  const afterFlat = flattenJson(afterValue, options);
  if (beforeFlat.limitReached || afterFlat.limitReached) {
    throw new Error(
      "JSON structural comparison is limited to 5,000 leaf fields per version.",
    );
  }
  if (beforeFlat.depthLimitReached || afterFlat.depthLimitReached) {
    throw new Error(
      "JSON structural comparison is limited to 40 nested levels.",
    );
  }
  const changes = [];
  let additions = 0;
  let removals = 0;
  let changed = 0;

  const paths = new Set([
    ...beforeFlat.fields.keys(),
    ...afterFlat.fields.keys(),
  ]);
  [...paths].sort().forEach((path) => {
    const before = beforeFlat.fields.get(path);
    const after = afterFlat.fields.get(path);
    if (!before) {
      additions += 1;
      if (changes.length < MAX_STRUCTURAL_CHANGES) {
        changes.push({
          kind: "field",
          type: "added",
          label: path,
          beforePreview: "Missing",
          afterPreview: previewValue(after.value),
        });
      }
      return;
    }
    if (!after) {
      removals += 1;
      if (changes.length < MAX_STRUCTURAL_CHANGES) {
        changes.push({
          kind: "field",
          type: "removed",
          label: path,
          beforePreview: previewValue(before.value),
          afterPreview: "Missing",
        });
      }
      return;
    }
    if (before.signature !== after.signature) {
      changed += 1;
      if (changes.length < MAX_STRUCTURAL_CHANGES) {
        changes.push({
          kind: "field",
          type: "changed",
          label: path,
          beforePreview: previewValue(before.value),
          afterPreview: previewValue(after.value),
        });
      }
    }
  });

  const beforeRepresentation = JSON.stringify(
    normalizeJsonValue(beforeValue, options),
    null,
    2,
  );
  const afterRepresentation = JSON.stringify(
    normalizeJsonValue(afterValue, options),
    null,
    2,
  );

  return {
    beforeRepresentation,
    afterRepresentation,
    structuralChanges: changes,
    structuralStats: { additions, removals, changes: changed },
    structuralChangeCount: additions + removals + changed,
    structuralTruncated:
      additions + removals + changed > MAX_STRUCTURAL_CHANGES,
    notes: [
      "JSON is compared by normalized field paths; object key order is ignored.",
    ],
  };
}

export function parseCsv(source) {
  const text = String(source ?? "").replace(/\r\n?/gu, "\n");
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
      continue;
    }

    if (character === '"' && cell === "") {
      quoted = true;
    } else if (character === ",") {
      row.push(cell);
      cell = "";
    } else if (character === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  if (quoted) throw new Error("A CSV quoted field is not closed.");
  row.push(cell);
  rows.push(row);
  if (
    rows.length > 1 &&
    rows[rows.length - 1].length === 1 &&
    rows[rows.length - 1][0] === ""
  ) {
    rows.pop();
  }
  if (rows.length > 5_000) {
    throw new Error("CSV comparison is limited to 5,000 rows per version.");
  }
  if (rows.some((item) => item.length > 200)) {
    throw new Error("CSV comparison is limited to 200 columns per version.");
  }
  return rows;
}

function headerDescriptors(row, options) {
  const occurrences = new Map();
  return row.map((value, index) => {
    const normalized = String(normalizeScalar(value, options));
    const base = normalized.trim() || `Column ${index + 1}`;
    const occurrence = (occurrences.get(base) || 0) + 1;
    occurrences.set(base, occurrence);
    return {
      key: `${base}\u0000${occurrence}`,
      label: occurrence > 1 ? `${base} (${occurrence})` : base,
      index,
    };
  });
}

function compareCsv(beforeSource, afterSource, options) {
  const beforeRows = parseCsv(beforeSource);
  const afterRows = parseCsv(afterSource);
  if (!beforeRows.length || !beforeRows[0].some((cell) => cell.trim())) {
    throw new Error("The original CSV needs a header row.");
  }
  if (!afterRows.length || !afterRows[0].some((cell) => cell.trim())) {
    throw new Error("The updated CSV needs a header row.");
  }

  const beforeHeaders = headerDescriptors(beforeRows[0], options);
  const afterHeaders = headerDescriptors(afterRows[0], options);
  const beforeHeaderMap = new Map(
    beforeHeaders.map((header) => [header.key, header]),
  );
  const afterHeaderMap = new Map(
    afterHeaders.map((header) => [header.key, header]),
  );
  const beforeData = beforeRows.slice(1);
  const afterData = afterRows.slice(1);
  const structuralChanges = [];
  let additions = 0;
  let removals = 0;
  let changed = 0;

  afterHeaders.forEach((header) => {
    if (beforeHeaderMap.has(header.key)) return;
    additions += 1;
    if (structuralChanges.length < MAX_STRUCTURAL_CHANGES) {
      structuralChanges.push({
        kind: "column",
        type: "added",
        label: header.label,
        beforePreview: "Missing column",
        afterPreview: "Column present",
      });
    }
  });
  beforeHeaders.forEach((header) => {
    if (afterHeaderMap.has(header.key)) return;
    removals += 1;
    if (structuralChanges.length < MAX_STRUCTURAL_CHANGES) {
      structuralChanges.push({
        kind: "column",
        type: "removed",
        label: header.label,
        beforePreview: "Column present",
        afterPreview: "Missing column",
      });
    }
  });

  const pairedRows = Math.min(beforeData.length, afterData.length);
  const commonHeaders = beforeHeaders.filter((header) =>
    afterHeaderMap.has(header.key),
  );
  for (let rowIndex = 0; rowIndex < pairedRows; rowIndex += 1) {
    commonHeaders.forEach((beforeHeader) => {
      const afterHeader = afterHeaderMap.get(beforeHeader.key);
      const beforeValue = normalizeScalar(
        beforeData[rowIndex]?.[beforeHeader.index] ?? "",
        options,
      );
      const afterValue = normalizeScalar(
        afterData[rowIndex]?.[afterHeader.index] ?? "",
        options,
      );
      if (beforeValue === afterValue) return;
      changed += 1;
      if (structuralChanges.length < MAX_STRUCTURAL_CHANGES) {
        structuralChanges.push({
          kind: "cell",
          type: "changed",
          label: `Row ${rowIndex + 2} · ${beforeHeader.label}`,
          beforePreview: previewValue(beforeValue),
          afterPreview: previewValue(afterValue),
        });
      }
    });
  }

  if (afterData.length > beforeData.length) {
    for (let index = beforeData.length; index < afterData.length; index += 1) {
      additions += 1;
      if (structuralChanges.length < MAX_STRUCTURAL_CHANGES) {
        structuralChanges.push({
          kind: "row",
          type: "added",
          label: `Row ${index + 2}`,
          beforePreview: "Missing row",
          afterPreview: "Row present",
        });
      }
    }
  }
  if (beforeData.length > afterData.length) {
    for (let index = afterData.length; index < beforeData.length; index += 1) {
      removals += 1;
      if (structuralChanges.length < MAX_STRUCTURAL_CHANGES) {
        structuralChanges.push({
          kind: "row",
          type: "removed",
          label: `Row ${index + 2}`,
          beforePreview: "Row present",
          afterPreview: "Missing row",
        });
      }
    }
  }

  const inconsistentRows =
    beforeData.filter((row) => row.length !== beforeHeaders.length).length +
    afterData.filter((row) => row.length !== afterHeaders.length).length;
  return {
    beforeRepresentation: normalizeComparisonText(beforeSource, options),
    afterRepresentation: normalizeComparisonText(afterSource, options),
    structuralChanges,
    structuralStats: { additions, removals, changes: changed },
    structuralChangeCount: additions + removals + changed,
    structuralTruncated:
      additions + removals + changed > MAX_STRUCTURAL_CHANGES,
    notes: [
      "CSV rows are paired by position and common columns are paired by normalized header name.",
      ...(inconsistentRows
        ? [
            `${inconsistentRows} data row(s) have a different field count from their header.`,
          ]
        : []),
    ],
  };
}

export function compareDocumentVersions(
  beforeSource,
  afterSource,
  config = {},
) {
  const before = String(beforeSource ?? "");
  const after = String(afterSource ?? "");
  if (!before && !after) {
    return { ok: false, error: "Add both document versions before comparing." };
  }
  if (!before)
    return { ok: false, error: "Add the original document version." };
  if (!after) return { ok: false, error: "Add the updated document version." };
  if (
    before.length > MAX_SOURCE_CHARACTERS ||
    after.length > MAX_SOURCE_CHARACTERS
  ) {
    return {
      ok: false,
      error: `Each extracted or pasted version is limited to ${MAX_SOURCE_CHARACTERS.toLocaleString("en-US")} characters.`,
    };
  }

  const format = FORMAT_VALUES.has(config.format) ? config.format : "text";
  const options = normalizedOptions(config.options);

  try {
    let formatResult;
    if (format === "json") {
      formatResult = compareJson(before, after, options);
    } else if (format === "csv") {
      formatResult = compareCsv(before, after, options);
    } else {
      formatResult = {
        beforeRepresentation: normalizeComparisonText(before, options),
        afterRepresentation: normalizeComparisonText(after, options),
        structuralChanges: [],
        structuralStats: null,
        structuralChangeCount: 0,
        structuralTruncated: false,
        notes: [
          format === "markdown"
            ? "Section summaries use Markdown headings."
            : "Section summaries use short uppercase or colon-ended heading heuristics.",
        ],
      };
    }

    const { rows, lineStats } = alignLineChanges(
      formatResult.beforeRepresentation,
      formatResult.afterRepresentation,
      {
        normalizeLineEndings: false,
        trimLineWhitespace: false,
        collapseWhitespace: false,
      },
    );
    const structuralFormat = format === "json" || format === "csv";
    const summary = structuralFormat
      ? { ...formatResult.structuralStats }
      : {
          additions: lineStats.additions,
          removals: lineStats.removals,
          changes: lineStats.changes,
        };
    const sectionSummaries = structuralFormat
      ? []
      : summarizeSections(rows, format);

    return {
      ok: true,
      format,
      comparisonUnit: structuralFormat ? "fields / rows" : "lines",
      options,
      normalization: normalizationDisclosure(options),
      rows,
      lineStats,
      summary,
      identical:
        summary.additions === 0 &&
        summary.removals === 0 &&
        summary.changes === 0,
      sectionSummaries,
      structuralChanges: formatResult.structuralChanges,
      structuralTruncated: formatResult.structuralTruncated,
      notes: formatResult.notes,
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "The document versions could not be compared.",
    };
  }
}

export function buildCountsOnlyVersionReport(
  result,
  generatedAt = new Date().toISOString(),
) {
  if (!result?.ok) return null;
  return {
    reportType: "document-version-comparison-counts-only",
    generatedAt,
    format: result.format,
    comparisonUnit: result.comparisonUnit,
    identicalUnderSelectedComparison: result.identical,
    summary: { ...result.summary },
    lineStats: { ...result.lineStats },
    changedSectionCount: result.sectionSummaries.length,
    listedStructuralChangeCount: result.structuralChanges.length,
    structuralListTruncated: result.structuralTruncated,
    normalization: { ...result.options },
    privacy:
      "This report contains counts and comparison settings only. It excludes document text, field paths, section names, values, filenames, source timestamps, and extracted PDF content.",
    interpretation:
      "A match or difference under these settings does not prove authenticity, authorship, completeness, provenance, or semantic equivalence.",
  };
}
