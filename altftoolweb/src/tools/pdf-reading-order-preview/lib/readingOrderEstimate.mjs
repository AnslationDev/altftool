export const READING_ORDER_LIMITS = Object.freeze({
  maxFileBytes: 100 * 1024 * 1024,
  maxPages: 100,
  maxItemsPerPage: 3_500,
  maxCharactersPerPage: 75_000,
  maxTotalItems: 50_000,
  maxTotalCharacters: 750_000,
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
    endY: y === null ? null : y + (height || 0),
    rotation,
    type: item?.type || "text",
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

  return null;
}

function classifyItemType(item, allItems, medianHeight, pageHeight) {
  if (item.type && item.type !== "text") {
    return item.type;
  }
  const text = item.text || "";
  const h = item.height || 12;

  if (pageHeight && (item.y > pageHeight * 0.92 || item.y < pageHeight * 0.08)) {
    if (text.length < 80) return "artifact";
  }

  if (medianHeight && h >= medianHeight * 1.6 && text.length < 120) {
    return h >= medianHeight * 2.2 ? "h1" : h >= medianHeight * 1.8 ? "h2" : "h3";
  }

  const isShort = text.length < 90;
  const lower = text.toLowerCase();
  if (
    isShort &&
    (lower.startsWith("figure ") ||
      lower.startsWith("fig.") ||
      lower.startsWith("table ") ||
      lower.startsWith("photo "))
  ) {
    return "caption";
  }

  if (/^(\d+[\.\)]|•|\-|\*)\s+/.test(text)) {
    return "list";
  }

  if (text.endsWith(":") && text.length < 40) {
    return "form";
  }

  return "paragraph";
}

function detectAccessibilityIssues(estimatedItems, pageHeight, pageWidth, columnGap) {
  const issues = [];
  let lastHeadingLevel = 0;
  const textHashes = new Set();

  for (let i = 0; i < estimatedItems.length; i++) {
    const item = estimatedItems[i];
    const prev = i > 0 ? estimatedItems[i - 1] : null;
    const next = i < estimatedItems.length - 1 ? estimatedItems[i + 1] : null;

    // 1. Wrong Column Order
    if (
      columnGap &&
      prev &&
      item.x < columnGap.center &&
      prev.x > columnGap.center &&
      Math.abs(item.y - prev.y) < (pageHeight || 800) * 0.3
    ) {
      issues.push({
        id: `issue-col-${i}`,
        code: "wrong-column-order",
        severity: "high",
        title: "Wrong Column Order",
        message: `Block #${i + 1} switches back to left column after right column content.`,
        suggestion: "Read left column completely before moving to right column.",
        blockId: item.id,
        blockIndex: i + 1,
      });
    }

    // 2. Caption Precedes Image
    if (
      item.tagType === "caption" &&
      next &&
      (next.tagType === "image" || next.tagType === "figure")
    ) {
      issues.push({
        id: `issue-cap-${i}`,
        code: "caption-before-image",
        severity: "medium",
        title: "Caption Precedes Image",
        message: `Caption block #${i + 1} ("${item.text.slice(0, 30)}...") is read before the image it describes.`,
        suggestion: "Place the image block before its caption in reading sequence.",
        blockId: item.id,
        blockIndex: i + 1,
      });
    }

    // 3. Broken Heading Hierarchy
    if (item.tagType === "h1" || item.tagType === "h2" || item.tagType === "h3") {
      const level = parseInt(item.tagType.replace("h", ""), 10);
      if (lastHeadingLevel > 0 && level > lastHeadingLevel + 1) {
        issues.push({
          id: `issue-head-${i}`,
          code: "broken-heading-hierarchy",
          severity: "medium",
          title: "Broken Heading Hierarchy",
          message: `Heading block #${i + 1} jumps from H${lastHeadingLevel} directly to H${level}.`,
          suggestion: "Use sequential heading levels (e.g., H1 -> H2 -> H3) without skipping.",
          blockId: item.id,
          blockIndex: i + 1,
        });
      }
      lastHeadingLevel = level;
    }

    // 4. Image Interrupts Paragraph
    if (
      (item.tagType === "image" || item.tagType === "figure") &&
      prev &&
      next &&
      prev.tagType === "paragraph" &&
      next.tagType === "paragraph"
    ) {
      issues.push({
        id: `issue-img-split-${i}`,
        code: "image-interrupting-paragraph",
        severity: "high",
        title: "Image Interrupts Paragraph Flow",
        message: `Image block #${i + 1} is inserted directly inside paragraph text flow.`,
        suggestion: "Anchor image before or after complete paragraphs.",
        blockId: item.id,
        blockIndex: i + 1,
      });
    }

    // 5. Overlapping Content Blocks
    if (prev && item.x !== null && prev.x !== null && item.endX !== null && prev.endX !== null) {
      const horizontalOverlap = Math.max(
        0,
        Math.min(item.endX, prev.endX) - Math.max(item.x, prev.x),
      );
      const verticalOverlap = Math.max(
        0,
        Math.min(item.endY || item.y, prev.endY || prev.y) -
          Math.max(item.y, prev.y),
      );
      if (horizontalOverlap * verticalOverlap > 120) {
        issues.push({
          id: `issue-overlap-${i}`,
          code: "text-overlap",
          severity: "high",
          title: "Overlapping Content Blocks",
          message: `Block #${i + 1} overlaps spatially with Block #${i}.`,
          suggestion: "Adjust layout containers so text boxes do not clip or overlap.",
          blockId: item.id,
          blockIndex: i + 1,
        });
      }
    }

    // 6. Header / Footer Repetition without Artifact Tag
    if (
      pageHeight &&
      (item.y > pageHeight * 0.93 || item.y < pageHeight * 0.07) &&
      item.tagType !== "artifact" &&
      item.text.length < 60
    ) {
      issues.push({
        id: `issue-header-footer-${i}`,
        code: "header-footer-repetition",
        severity: "low",
        title: "Unmarked Header / Footer",
        message: `Block #${i + 1} ("${item.text.slice(0, 25)}...") is in margin region but not tagged as artifact.`,
        suggestion: "Mark repeated headers and footers as background artifacts.",
        blockId: item.id,
        blockIndex: i + 1,
      });
    }

    // 7. Duplicate Region / Duplicate Reading
    const cleanText = item.text.trim().toLowerCase();
    if (cleanText.length > 20) {
      if (textHashes.has(cleanText)) {
        issues.push({
          id: `issue-dup-${i}`,
          code: "duplicate-region",
          severity: "medium",
          title: "Duplicate Reading Block",
          message: `Block #${i + 1} contains identical text to another block on this page.`,
          suggestion: "Remove duplicated text streams or mark non-visual copy as artifact.",
          blockId: item.id,
          blockIndex: i + 1,
        });
      } else {
        textHashes.add(cleanText);
      }
    }

    // 8. Artifact Inside Reading Path
    if (item.tagType === "artifact" && prev && next) {
      issues.push({
        id: `issue-artifact-path-${i}`,
        code: "artifact-in-path",
        severity: "low",
        title: "Artifact Inside Active Reading Path",
        message: `Decorative artifact block #${i + 1} is positioned between active content blocks.`,
        suggestion: "Exclude decorative elements from the primary screen reader tag sequence.",
        blockId: item.id,
        blockIndex: i + 1,
      });
    }
  }

  return issues;
}

export function calculateAccessibilityScore(issues = [], totalBlocks = 0, pageCount = 1) {
  let score = 100;
  const highCount = issues.filter((i) => i.severity === "high").length;
  const medCount = issues.filter((i) => i.severity === "medium").length;
  const lowCount = issues.filter((i) => i.severity === "low").length;

  score -= highCount * 12;
  score -= medCount * 6;
  score -= lowCount * 2;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let rating = "Excellent";
  let badgeColor = "bg-emerald-500 text-white";
  if (score < 50) {
    rating = "Needs Work";
    badgeColor = "bg-rose-500 text-white";
  } else if (score < 75) {
    rating = "Good";
    badgeColor = "bg-amber-500 text-white";
  } else if (score < 90) {
    rating = "Very Good";
    badgeColor = "bg-blue-500 text-white";
  }

  const columnIssues = issues.filter((i) => i.code === "wrong-column-order").length;
  const headingIssues = issues.filter((i) => i.code === "broken-heading-hierarchy").length;
  const imageIssues = issues.filter((i) => i.code === "caption-before-image" || i.code === "image-interrupting-paragraph").length;
  const overlapIssues = issues.filter((i) => i.code === "text-overlap").length;
  const artifactIssues = issues.filter((i) => i.code === "header-footer-repetition" || i.code === "artifact-in-path").length;

  return {
    score,
    rating,
    badgeColor,
    highCount,
    medCount,
    lowCount,
    totalIssues: issues.length,
    breakdown: {
      readingOrder: Math.max(0, 100 - columnIssues * 25 - highCount * 10),
      structure: Math.max(0, 100 - artifactIssues * 15 - overlapIssues * 20),
      headings: Math.max(0, 100 - headingIssues * 25),
      tables: Math.max(0, 100 - issues.filter((i) => i.code === "table-reading-issue").length * 20),
      images: Math.max(0, 100 - imageIssues * 20),
      logicalFlow: Math.max(0, 100 - (highCount + medCount) * 12),
    },
  };
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
  ].map((item, estimatedIndex) => {
    const tagType = classifyItemType(item, [], 12, page.height);
    return { ...item, estimatedIndex, tagType };
  });

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

  const accessibilityIssues = detectAccessibilityIssues(
    estimatedItems,
    page.height,
    pageWidth,
    columnGap,
  );
  const scoreData = calculateAccessibilityScore(
    accessibilityIssues,
    estimatedItems.length,
    1,
  );

  const warnings = [];
  if (page.malformed) {
    warnings.push({
      code: "page-metadata",
      message:
        "Page size or rotation metadata is incomplete or unusual; coordinate comparisons may be less reliable.",
      tone: "warning",
    });
  }
  if (unpositioned.length) {
    warnings.push({
      code: "missing-coordinates",
      message: `${unpositioned.length.toLocaleString("en-US")} visible text item${unpositioned.length === 1 ? "" : "s"} had malformed or missing coordinates and were kept at the end of the estimate.`,
      tone: "warning",
    });
  }
  if (rotations.length) {
    warnings.push({
      code: "rotated-text",
      message: `${rotations.length.toLocaleString("en-US")} text item${rotations.length === 1 ? "" : "s"} appear rotated; a simple Y-then-X estimate may not reflect their intended sequence.`,
      tone: "warning",
    });
  }
  if (directionalItems.length) {
    warnings.push({
      code: "directional-text",
      message: `${directionalItems.length.toLocaleString("en-US")} text item${directionalItems.length === 1 ? "" : "s"} report right-to-left or vertical direction. The left-to-right estimate may not match the intended sequence.`,
      tone: "warning",
    });
  }
  if (page.rotation && Math.abs(page.rotation) > 0.01) {
    warnings.push({
      code: "rotated-page",
      message: `The page reports ${page.rotation}° rotation. Review both sequences manually.`,
      tone: "warning",
    });
  }
  if (columnGap) {
    warnings.push({
      code: "possible-columns",
      message:
        "Repeated horizontal gaps suggest multiple columns or side-by-side regions. The Y-then-X estimate can interleave those regions, so it is intentionally marked ambiguous.",
      tone: "warning",
    });
  }
  if (changedPositions) {
    warnings.push({
      code: "order-difference",
      message: `${changedPositions.toLocaleString("en-US")} item position${changedPositions === 1 ? "" : "s"} differ between extracted source sequence and the visual estimate.`,
      tone: "info",
    });
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
    possibleColumns: Boolean(columnGap),
    accessibilityIssues,
    scoreData,
    warnings,
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
        // Page cleanup fallback
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
  const allIssues = pages.flatMap((p) => p.estimate.accessibilityIssues || []);
  const overallScoreData = calculateAccessibilityScore(
    allIssues,
    pages.reduce((acc, p) => acc + p.itemCount, 0),
    pageCount,
  );

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
    allIssues,
    scoreData: overallScoreData,
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
