export const READING_ORDER_LIMITS = Object.freeze({
  maxFileBytes: 12 * 1024 * 1024,
  maxPages: 40,
  maxItemsPerPage: 2_500,
  maxCharactersPerPage: 50_000,
  maxTotalItems: 20_000,
  maxTotalCharacters: 300_000,
});

const SOURCE_REFERENCES = Object.freeze([
  Object.freeze({
    title: "W3C Technique PDF3: Correct tab and reading order",
    url: "https://www.w3.org/WAI/WCAG22/Techniques/pdf/PDF3",
  }),
  Object.freeze({
    title: "W3C Understanding SC 1.3.2: Meaningful Sequence",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence",
  }),
  Object.freeze({
    title: "W3C Technique PDF7: OCR for scanned PDFs",
    url: "https://www.w3.org/WAI/WCAG22/Techniques/pdf/PDF7",
  }),
  Object.freeze({
    title: "W3C WCAG2ICT overview",
    url: "https://www.w3.org/WAI/standards-guidelines/wcag/non-web-ict/",
  }),
]);

function finiteNumber(value) {
  if (
    value === null ||
    value === undefined ||
    typeof value === "boolean" ||
    (typeof value === "string" && !value.trim())
  ) {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function positiveInteger(value, fallback) {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function normalizeAngle(value) {
  const angle = finiteNumber(value);
  if (angle === null) return null;
  const normalized = ((angle % 360) + 360) % 360;
  return normalized > 180 ? normalized - 360 : normalized;
}

function safeText(value) {
  return typeof value === "string" ? value.replace(/\u0000/gu, "").trim() : "";
}

function boundedSafeText(value, maximumCharacters) {
  if (typeof value !== "string" || maximumCharacters <= 0) {
    return {
      text: "",
      overflow: typeof value === "string" && value.length > 0,
    };
  }
  const probe = value.slice(0, maximumCharacters + 1);
  const cleaned = probe.replace(/\u0000/gu, "").trim();
  return {
    text: cleaned.slice(0, maximumCharacters),
    overflow: value.length > probe.length || cleaned.length > maximumCharacters,
  };
}

function warning(code, message, tone = "warning") {
  return { code, message, tone };
}

export function normalizePageMetadata(metadata = {}) {
  const rawWidth = finiteNumber(metadata.width);
  const rawHeight = finiteNumber(metadata.height);
  const rawRotation = normalizeAngle(metadata.rotation);
  const width = rawWidth !== null && rawWidth > 0 ? rawWidth : null;
  const height = rawHeight !== null && rawHeight > 0 ? rawHeight : null;
  const rotation =
    rawRotation !== null && Math.abs(rawRotation) <= 180 ? rawRotation : null;

  return {
    pageNumber: positiveInteger(metadata.pageNumber, 1),
    width,
    height,
    rotation,
    malformed:
      width === null ||
      height === null ||
      rotation === null ||
      ![0, 90, -90, 180, -180].some(
        (candidate) => Math.abs(candidate - rotation) < 0.01,
      ),
  };
}

export function normalizeTextItem(item, sourceIndex = 0) {
  const transform = Array.isArray(item?.transform) ? item.transform : null;
  const transformValues =
    transform?.length >= 6 ? transform.slice(0, 6).map(finiteNumber) : null;
  const hasCoordinates =
    Boolean(transformValues) &&
    transformValues.every((value) => value !== null);
  const x = hasCoordinates ? transformValues[4] : null;
  const y = hasCoordinates ? transformValues[5] : null;
  const explicitWidth = finiteNumber(item?.width);
  const explicitHeight = finiteNumber(item?.height);
  const derivedHeight = hasCoordinates
    ? Math.hypot(transformValues[2], transformValues[3])
    : null;
  const width =
    explicitWidth !== null && explicitWidth >= 0 ? explicitWidth : null;
  const height =
    explicitHeight !== null && explicitHeight > 0
      ? explicitHeight
      : derivedHeight && derivedHeight > 0
        ? derivedHeight
        : null;
  const rotation =
    hasCoordinates &&
    (Math.abs(transformValues[0]) > Number.EPSILON ||
      Math.abs(transformValues[1]) > Number.EPSILON)
      ? normalizeAngle(
          (Math.atan2(transformValues[1], transformValues[0]) * 180) / Math.PI,
        )
      : null;

  return {
    id: `source-${sourceIndex + 1}`,
    sourceIndex,
    text: safeText(item?.str),
    x,
    y,
    width,
    height,
    endX: x === null ? null : x + (width || 0),
    rotation,
    direction: item?.dir === "rtl" || item?.dir === "ttb" ? item.dir : "ltr",
    hasCoordinates,
  };
}

function lineTolerance(items, pageHeight) {
  const typicalHeight = median(
    items
      .map((item) => item.height)
      .filter((height) => height !== null && height > 0),
  );
  const fallback = pageHeight ? pageHeight * 0.006 : 4;
  return Math.min(18, Math.max(2, (typicalHeight || fallback) * 0.45));
}

function groupIntoLines(items, tolerance) {
  const sorted = [...items].sort(
    (left, right) =>
      right.y - left.y ||
      left.x - right.x ||
      left.sourceIndex - right.sourceIndex,
  );
  const lines = [];

  for (const item of sorted) {
    const currentLine = lines.at(-1);
    if (!currentLine || Math.abs(currentLine.y - item.y) > tolerance) {
      lines.push({ y: item.y, items: [item] });
      continue;
    }

    currentLine.items.push(item);
    currentLine.y =
      currentLine.items.reduce((sum, candidate) => sum + candidate.y, 0) /
      currentLine.items.length;
  }

  return lines
    .sort((left, right) => right.y - left.y)
    .map((line, lineIndex) => ({
      lineIndex,
      y: line.y,
      items: line.items
        .sort(
          (left, right) =>
            left.x - right.x || left.sourceIndex - right.sourceIndex,
        )
        .map((item) => ({ ...item, lineIndex })),
    }));
}

function inferPageWidth(items) {
  if (!items.length) return null;
  const minimum = Math.min(...items.map((item) => item.x));
  const maximum = Math.max(
    ...items.map((item) => (item.endX ?? item.x) || item.x),
  );
  const width = maximum - minimum;
  return width > 0 ? width : null;
}

function findRecurringColumnGap(lines, pageWidth) {
  if (!pageWidth || lines.length < 2) return null;
  const minimumGap = Math.max(40, pageWidth * 0.14);
  const centers = [];

  for (const line of lines) {
    for (let index = 1; index < line.items.length; index += 1) {
      const previous = line.items[index - 1];
      const current = line.items[index];
      const gap = current.x - (previous.endX ?? previous.x);
      if (gap >= minimumGap) {
        centers.push({
          center: ((previous.endX ?? previous.x) + current.x) / 2,
          gap,
        });
      }
    }
  }

  const clusterTolerance = pageWidth * 0.08;
  for (const candidate of centers) {
    const cluster = centers.filter(
      (other) => Math.abs(candidate.center - other.center) <= clusterTolerance,
    );
    if (cluster.length >= 2) {
      return {
        repeatedLines: cluster.length,
        center: median(cluster.map((item) => item.center)),
      };
    }
  }

  const starts = lines
    .map((line) => line.items[0]?.x)
    .filter((value) => value !== undefined)
    .sort((left, right) => left - right);
  if (starts.length < 4) return null;

  let largest = null;
  for (let index = 1; index < starts.length; index += 1) {
    const gap = starts[index] - starts[index - 1];
    if (
      gap >= pageWidth * 0.2 &&
      index >= 2 &&
      starts.length - index >= 2 &&
      (!largest || gap > largest.gap)
    ) {
      largest = {
        gap,
        center: (starts[index] + starts[index - 1]) / 2,
        repeatedLines: Math.min(index, starts.length - index),
      };
    }
  }
  return largest;
}

export function estimatePageReadingOrder(rawItems = [], metadata = {}) {
  const page = normalizePageMetadata(metadata);
  const sourceItems = rawItems
    .map((item, sourceIndex) => normalizeTextItem(item, sourceIndex))
    .filter((item) => item.text);
  const positioned = sourceItems.filter((item) => item.hasCoordinates);
  const unpositioned = sourceItems.filter((item) => !item.hasCoordinates);
  const tolerance = lineTolerance(positioned, page.height);
  const lines = groupIntoLines(positioned, tolerance);
  const estimatedItems = [
    ...lines.flatMap((line) => line.items),
    ...unpositioned.map((item) => ({ ...item, lineIndex: null })),
  ].map((item, estimatedIndex) => ({ ...item, estimatedIndex }));
  const changedPositions = estimatedItems.reduce(
    (count, item, estimatedIndex) =>
      count + (item.sourceIndex === estimatedIndex ? 0 : 1),
    0,
  );
  const rotations = positioned.filter(
    (item) => item.rotation !== null && Math.abs(item.rotation) > 8,
  );
  const directionalItems = sourceItems.filter(
    (item) => item.direction !== "ltr",
  );
  const pageWidth = page.width || inferPageWidth(positioned);
  const columnGap = findRecurringColumnGap(lines, pageWidth);
  const warnings = [];

  if (page.malformed) {
    warnings.push(
      warning(
        "page-metadata",
        "Page size or rotation metadata is incomplete or unusual; coordinate comparisons may be less reliable.",
      ),
    );
  }
  if (unpositioned.length) {
    warnings.push(
      warning(
        "missing-coordinates",
        `${unpositioned.length.toLocaleString("en-US")} visible text item${unpositioned.length === 1 ? "" : "s"} had malformed or missing coordinates and were kept at the end of the estimate.`,
      ),
    );
  }
  if (rotations.length) {
    warnings.push(
      warning(
        "rotated-text",
        `${rotations.length.toLocaleString("en-US")} text item${rotations.length === 1 ? "" : "s"} appear rotated; a simple Y-then-X estimate may not reflect their intended sequence.`,
      ),
    );
  }
  if (directionalItems.length) {
    warnings.push(
      warning(
        "directional-text",
        `${directionalItems.length.toLocaleString("en-US")} text item${directionalItems.length === 1 ? "" : "s"} report right-to-left or vertical direction. The left-to-right estimate may not match the intended sequence.`,
      ),
    );
  }
  if (page.rotation && Math.abs(page.rotation) > 0.01) {
    warnings.push(
      warning(
        "rotated-page",
        `The page reports ${page.rotation}° rotation. Review both sequences manually.`,
      ),
    );
  }
  if (columnGap) {
    warnings.push(
      warning(
        "possible-columns",
        "Repeated horizontal gaps suggest multiple columns or side-by-side regions. The Y-then-X estimate can interleave those regions, so it is intentionally marked ambiguous.",
      ),
    );
  }
  if (changedPositions) {
    warnings.push(
      warning(
        "order-difference",
        `${changedPositions.toLocaleString("en-US")} item position${changedPositions === 1 ? "" : "s"} differ between extracted source sequence and the visual estimate.`,
        "info",
      ),
    );
  }

  return {
    page,
    sourceItems,
    estimatedItems,
    lineCount: lines.length,
    tolerance,
    changedPositions,
    ambiguous:
      Boolean(columnGap) ||
      Boolean(unpositioned.length) ||
      Boolean(rotations.length) ||
      Boolean(directionalItems.length) ||
      page.malformed,
    warnings,
    possibleColumns: Boolean(columnGap),
  };
}

export async function collectBoundedTextItems(
  reader,
  {
    maxItems = READING_ORDER_LIMITS.maxItemsPerPage,
    maxCharacters = READING_ORDER_LIMITS.maxCharactersPerPage,
    totalBudget,
  } = {},
) {
  if (!reader || typeof reader.read !== "function") {
    throw new TypeError("A readable PDF text-content reader is required.");
  }

  const localItemLimit = positiveInteger(
    maxItems,
    READING_ORDER_LIMITS.maxItemsPerPage,
  );
  const localCharacterLimit = positiveInteger(
    maxCharacters,
    READING_ORDER_LIMITS.maxCharactersPerPage,
  );
  const totalItems =
    totalBudget && Number.isFinite(totalBudget.itemsRemaining)
      ? Math.max(0, Math.floor(totalBudget.itemsRemaining))
      : localItemLimit;
  const totalCharacters =
    totalBudget && Number.isFinite(totalBudget.charactersRemaining)
      ? Math.max(0, Math.floor(totalBudget.charactersRemaining))
      : localCharacterLimit;
  const itemLimit = Math.min(localItemLimit, totalItems);
  const characterLimit = Math.min(localCharacterLimit, totalCharacters);
  const items = [];
  let characterCount = 0;
  let stopped = itemLimit === 0 || characterLimit === 0;
  let reason = stopped
    ? itemLimit === 0
      ? "item-limit"
      : "character-limit"
    : null;
  let cancelled = false;
  let failed = false;

  try {
    while (!stopped) {
      const { value, done } = await reader.read();
      if (done) break;

      for (const item of value?.items || []) {
        if (items.length >= itemLimit) {
          stopped = true;
          reason = "item-limit";
          break;
        }

        const remainingCharacters = characterLimit - characterCount;
        if (remainingCharacters <= 0) {
          stopped = true;
          reason = "character-limit";
          break;
        }

        const bounded = boundedSafeText(item?.str, remainingCharacters);
        if (!bounded.text) {
          if (bounded.overflow) {
            stopped = true;
            reason = "character-limit";
            break;
          }
          continue;
        }
        items.push({ ...item, str: bounded.text });
        characterCount += bounded.text.length;

        if (bounded.overflow) {
          stopped = true;
          reason = "character-limit";
          break;
        }
        if (items.length >= itemLimit) {
          stopped = true;
          reason = "item-limit";
          break;
        }
        if (characterCount >= characterLimit) {
          stopped = true;
          reason = "character-limit";
          break;
        }
      }
    }
  } catch (error) {
    failed = true;
    throw error;
  } finally {
    if ((stopped || failed) && typeof reader.cancel === "function") {
      try {
        await reader.cancel();
        cancelled = true;
      } catch {
        // Page cleanup still runs in the caller if the stream is already closed.
      }
    }
  }

  if (totalBudget) {
    totalBudget.itemsRemaining = Math.max(
      0,
      Math.floor(Number(totalBudget.itemsRemaining) || 0) - items.length,
    );
    totalBudget.charactersRemaining = Math.max(
      0,
      Math.floor(Number(totalBudget.charactersRemaining) || 0) - characterCount,
    );
  }

  return {
    items,
    itemCount: items.length,
    characterCount,
    truncated: stopped,
    truncationReason: reason,
    cancelled,
  };
}

export function summarizeReadingOrderPages(
  pages = [],
  pageCount = pages.length,
) {
  const totals = pages.reduce(
    (summary, page) => ({
      itemCount: summary.itemCount + page.itemCount,
      characterCount: summary.characterCount + page.characterCount,
      changedPositions:
        summary.changedPositions + page.estimate.changedPositions,
      ambiguousPages:
        summary.ambiguousPages + (page.estimate.ambiguous ? 1 : 0),
      truncatedPages: summary.truncatedPages + (page.truncated ? 1 : 0),
    }),
    {
      itemCount: 0,
      characterCount: 0,
      changedPositions: 0,
      ambiguousPages: 0,
      truncatedPages: 0,
    },
  );

  return {
    ...totals,
    pageCount,
    processedPages: pages.length,
    imageOnly: totals.itemCount === 0,
  };
}

export function buildCountsOnlyReadingOrderReport(result, now = new Date()) {
  if (!result?.pages || !result?.summary) return null;
  return {
    reportType: "PDF reading-order estimate — counts and findings only",
    generatedAt: now.toISOString(),
    privacy:
      "Extracted text and the local filename are deliberately excluded from this report.",
    method:
      "Compares PDF.js text-content source sequence with a coordinate-based page Y-then-X estimate. It does not inspect the PDF tag tree or predict assistive-technology behavior.",
    scope:
      "Manual review aid only; not an accessibility, WCAG, legal, or certification result.",
    limits: { ...READING_ORDER_LIMITS },
    summary: { ...result.summary },
    pages: result.pages.map((page) => ({
      pageNumber: page.pageNumber,
      itemCount: page.itemCount,
      characterCount: page.characterCount,
      lineCount: page.estimate.lineCount,
      changedPositions: page.estimate.changedPositions,
      ambiguous: page.estimate.ambiguous,
      possibleColumns: page.estimate.possibleColumns,
      truncated: page.truncated,
      truncationReason: page.truncationReason,
      warningCodes: page.warnings.map((item) => item.code),
    })),
    referencesAccessed: "2026-07-24",
    references: SOURCE_REFERENCES.map((reference) => ({ ...reference })),
  };
}

export function getReadingOrderReferences() {
  return SOURCE_REFERENCES.map((reference) => ({ ...reference }));
}
