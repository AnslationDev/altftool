import assert from "node:assert/strict";
import test from "node:test";

import {
  READING_ORDER_LIMITS,
  buildCountsOnlyReadingOrderReport,
  collectBoundedTextItems,
  estimatePageReadingOrder,
  normalizePageMetadata,
  normalizeTextItem,
  summarizeReadingOrderPages,
} from "./readingOrderEstimate.mjs";
import {
  validatePdfPageCount,
  validateReadingOrderPdf,
} from "./extractPdfReadingOrder.js";

function item(str, x, y, options = {}) {
  return {
    str,
    transform: options.transform || [1, 0, 0, 10, x, y],
    width: options.width ?? 60,
    height: options.height ?? 10,
    dir: options.dir,
  };
}

function readerFor(chunks) {
  let index = 0;
  return {
    cancelCount: 0,
    async read() {
      if (index >= chunks.length) return { done: true, value: undefined };
      const value = chunks[index];
      index += 1;
      return { done: false, value: { items: value } };
    },
    async cancel() {
      this.cancelCount += 1;
    },
  };
}

test("normalizes valid geometry without trusting malformed optional values", () => {
  const normalized = normalizeTextItem(
    {
      str: "  Heading  ",
      transform: [0, 1, -12, 0, 25, 700],
      width: "bad",
      height: 0,
      dir: "rtl",
    },
    3,
  );

  assert.equal(normalized.id, "source-4");
  assert.equal(normalized.text, "Heading");
  assert.equal(normalized.x, 25);
  assert.equal(normalized.y, 700);
  assert.equal(normalized.height, 12);
  assert.equal(normalized.width, null);
  assert.equal(normalized.rotation, 90);
  assert.equal(normalized.direction, "rtl");
});

test("keeps malformed-coordinate text in source order and flags it", () => {
  const result = estimatePageReadingOrder(
    [
      item("Positioned", 20, 700),
      { str: "Unknown", transform: [1, 0, 0, 10, "x", 600] },
    ],
    { pageNumber: 1, width: 600, height: 800, rotation: 0 },
  );

  assert.deepEqual(
    result.estimatedItems.map((entry) => entry.text),
    ["Positioned", "Unknown"],
  );
  assert.equal(result.ambiguous, true);
  assert.ok(
    result.warnings.some((entry) => entry.code === "missing-coordinates"),
  );
  assert.ok(
    result.estimatedItems.every(
      (entry) =>
        entry.x === null ||
        (Number.isFinite(entry.x) && Number.isFinite(entry.y)),
    ),
  );
});

test("estimates visual order by top-to-bottom lines then left-to-right items", () => {
  const result = estimatePageReadingOrder(
    [
      item("Bottom right", 300, 100),
      item("Top right", 300, 700),
      item("Top left", 30, 702),
      item("Bottom left", 30, 98),
    ],
    { pageNumber: 2, width: 600, height: 800, rotation: 0 },
  );

  assert.deepEqual(
    result.estimatedItems.map((entry) => entry.text),
    ["Top left", "Top right", "Bottom left", "Bottom right"],
  );
  assert.equal(result.lineCount, 2);
  assert.equal(result.changedPositions, 3);
});

test("uses a height-aware tolerance for slightly misaligned same-line items", () => {
  const result = estimatePageReadingOrder(
    [item("Right", 180, 500), item("Left", 20, 503)],
    { pageNumber: 1, width: 400, height: 700, rotation: 0 },
  );

  assert.equal(result.lineCount, 1);
  assert.deepEqual(
    result.estimatedItems.map((entry) => entry.text),
    ["Left", "Right"],
  );
});

test("marks repeated large horizontal gaps as ambiguous possible columns", () => {
  const result = estimatePageReadingOrder(
    [
      item("L1", 20, 700, { width: 50 }),
      item("R1", 330, 700, { width: 50 }),
      item("L2", 20, 660, { width: 50 }),
      item("R2", 330, 660, { width: 50 }),
      item("L3", 20, 620, { width: 50 }),
      item("R3", 330, 620, { width: 50 }),
    ],
    { pageNumber: 1, width: 600, height: 800, rotation: 0 },
  );

  assert.equal(result.possibleColumns, true);
  assert.equal(result.ambiguous, true);
  assert.ok(result.warnings.some((entry) => entry.code === "possible-columns"));
});

test("flags rotated text and unusual or malformed page metadata", () => {
  const rotated = estimatePageReadingOrder(
    [
      item("Vertical", 100, 200, {
        transform: [0, 1, -10, 0, 100, 200],
      }),
    ],
    { pageNumber: "bad", width: "wide", height: -1, rotation: 37 },
  );

  assert.equal(rotated.page.pageNumber, 1);
  assert.equal(rotated.page.width, null);
  assert.equal(rotated.page.height, null);
  assert.equal(rotated.page.rotation, 37);
  assert.equal(rotated.ambiguous, true);
  assert.ok(rotated.warnings.some((entry) => entry.code === "rotated-text"));
  assert.ok(rotated.warnings.some((entry) => entry.code === "page-metadata"));
  assert.ok(rotated.warnings.some((entry) => entry.code === "rotated-page"));

  const page = normalizePageMetadata({
    pageNumber: 4,
    width: 612,
    height: 792,
    rotation: null,
  });
  assert.equal(page.rotation, null);
  assert.equal(page.malformed, true);
});

test("marks right-to-left or vertical items as directionally ambiguous", () => {
  const result = estimatePageReadingOrder(
    [
      item("مرحبا", 300, 700, { dir: "rtl" }),
      item("Vertical", 100, 500, { dir: "ttb" }),
    ],
    { pageNumber: 1, width: 600, height: 800, rotation: 0 },
  );

  assert.equal(result.ambiguous, true);
  assert.ok(result.warnings.some((entry) => entry.code === "directional-text"));
});

test("enforces per-page item limits while streaming and cancels immediately", async () => {
  const reader = readerFor([
    [item("one", 0, 0), item("two", 0, 0), item("three", 0, 0)],
    [item("unread", 0, 0)],
  ]);
  const result = await collectBoundedTextItems(reader, {
    maxItems: 2,
    maxCharacters: 100,
  });

  assert.deepEqual(
    result.items.map((entry) => entry.str),
    ["one", "two"],
  );
  assert.equal(result.itemCount, 2);
  assert.equal(result.truncated, true);
  assert.equal(result.truncationReason, "item-limit");
  assert.equal(result.cancelled, true);
  assert.equal(reader.cancelCount, 1);
});

test("bounds characters during item collection and never stores the overflow", async () => {
  const reader = readerFor([[item("abcdefghij", 0, 0)]]);
  const budget = { itemsRemaining: 10, charactersRemaining: 6 };
  const result = await collectBoundedTextItems(reader, {
    maxItems: 10,
    maxCharacters: 8,
    totalBudget: budget,
  });

  assert.equal(result.items[0].str, "abcdef");
  assert.equal(result.characterCount, 6);
  assert.equal(result.truncated, true);
  assert.equal(result.truncationReason, "character-limit");
  assert.deepEqual(budget, { itemsRemaining: 9, charactersRemaining: 0 });
});

test("cancels a text-content stream when reading fails", async () => {
  const reader = {
    cancelCount: 0,
    async read() {
      throw new Error("broken stream");
    },
    async cancel() {
      this.cancelCount += 1;
    },
  };

  await assert.rejects(
    collectBoundedTextItems(reader, {
      maxItems: 10,
      maxCharacters: 100,
    }),
    /broken stream/,
  );
  assert.equal(reader.cancelCount, 1);
});

test("shares a strict document-wide budget across page collectors", async () => {
  const budget = { itemsRemaining: 3, charactersRemaining: 100 };
  const first = await collectBoundedTextItems(
    readerFor([[item("a", 0, 0), item("b", 0, 0)]]),
    { maxItems: 10, maxCharacters: 100, totalBudget: budget },
  );
  const second = await collectBoundedTextItems(
    readerFor([[item("c", 0, 0), item("d", 0, 0)]]),
    { maxItems: 10, maxCharacters: 100, totalBudget: budget },
  );

  assert.equal(first.itemCount, 2);
  assert.equal(second.itemCount, 1);
  assert.equal(second.truncationReason, "item-limit");
  assert.deepEqual(budget, { itemsRemaining: 0, charactersRemaining: 97 });
});

test("summarizes image-only pages honestly", () => {
  const emptyEstimate = estimatePageReadingOrder([], {
    pageNumber: 1,
    width: 600,
    height: 800,
    rotation: 0,
  });
  const summary = summarizeReadingOrderPages(
    [
      {
        itemCount: 0,
        characterCount: 0,
        truncated: false,
        estimate: emptyEstimate,
      },
    ],
    1,
  );

  assert.equal(summary.imageOnly, true);
  assert.equal(summary.processedPages, 1);
  assert.equal(summary.itemCount, 0);
});

test("preflights file bytes, PDF header, and page count", async () => {
  const validFile = new File(["%PDF-1.7\nminimal"], "sample.pdf", {
    type: "application/pdf",
  });
  await assert.doesNotReject(validateReadingOrderPdf(validFile));

  const wrongHeader = new File(["not a pdf"], "sample.pdf", {
    type: "application/pdf",
  });
  await assert.rejects(
    validateReadingOrderPdf(wrongHeader),
    /valid PDF header/,
  );
  await assert.rejects(
    validateReadingOrderPdf({
      name: "oversized.pdf",
      type: "application/pdf",
      size: READING_ORDER_LIMITS.maxFileBytes + 1,
    }),
    new RegExp(`no larger than ${READING_ORDER_LIMITS.maxFileBytes / (1024 * 1024)} MB`),
  );

  assert.equal(validatePdfPageCount(READING_ORDER_LIMITS.maxPages), READING_ORDER_LIMITS.maxPages);
  assert.throws(() => validatePdfPageCount(0), new RegExp(`1 to ${READING_ORDER_LIMITS.maxPages} pages`));
  assert.throws(() => validatePdfPageCount(READING_ORDER_LIMITS.maxPages + 1), new RegExp(`1 to ${READING_ORDER_LIMITS.maxPages} pages`));
  assert.throws(() => validatePdfPageCount(Number.NaN), new RegExp(`1 to ${READING_ORDER_LIMITS.maxPages} pages`));
});

test("counts-only report excludes filename and all extracted strings", () => {
  const estimate = estimatePageReadingOrder(
    [item("TOP SECRET CUSTOMER NAME", 20, 700)],
    { pageNumber: 1, width: 600, height: 800, rotation: 0 },
  );
  const result = {
    fileName: "private-client-record.pdf",
    summary: {
      ...summarizeReadingOrderPages(
        [
          {
            itemCount: 1,
            characterCount: 24,
            truncated: false,
            estimate,
          },
        ],
        1,
      ),
    },
    pages: [
      {
        pageNumber: 1,
        itemCount: 1,
        characterCount: 24,
        truncated: false,
        truncationReason: null,
        estimate,
        warnings: estimate.warnings,
      },
    ],
  };
  const report = buildCountsOnlyReadingOrderReport(
    result,
    new Date("2026-07-24T00:00:00.000Z"),
  );
  const serialized = JSON.stringify(report);

  assert.equal(report.limits.maxPages, READING_ORDER_LIMITS.maxPages);
  assert.equal(report.generatedAt, "2026-07-24T00:00:00.000Z");
  assert.ok(!serialized.includes("TOP SECRET"));
  assert.ok(!serialized.includes("private-client-record.pdf"));
  assert.ok(!Object.hasOwn(report.pages[0], "sourceItems"));
  assert.ok(!Object.hasOwn(report.pages[0], "estimatedItems"));
});
