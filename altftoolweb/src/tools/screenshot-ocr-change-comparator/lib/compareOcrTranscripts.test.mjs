import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCountsOnlyOcrReport,
  compareOcrTranscripts,
  detectRasterImageType,
  ocrComparatorLimits,
  parseRasterImageDimensions,
  serializeCountsOnlyOcrReport,
  validateRasterImageDimensions,
} from "./compareOcrTranscripts.mjs";

function pngHeader(width, height) {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
}

function jpegHeader(width, height) {
  return Uint8Array.from([
    0xff,
    0xd8,
    0xff,
    0xe1,
    0x00,
    0x04,
    0x00,
    0x00,
    0xff,
    0xc2,
    0x00,
    0x11,
    0x08,
    (height >> 8) & 0xff,
    height & 0xff,
    (width >> 8) & 0xff,
    width & 0xff,
  ]);
}

function webpVp8xHeader(width, height) {
  const bytes = new Uint8Array(30);
  bytes.set([0x52, 0x49, 0x46, 0x46], 0);
  bytes.set([0x57, 0x45, 0x42, 0x50], 8);
  bytes.set([0x56, 0x50, 0x38, 0x58], 12);
  new DataView(bytes.buffer).setUint32(16, 10, true);
  const widthMinusOne = width - 1;
  const heightMinusOne = height - 1;
  bytes.set(
    [
      widthMinusOne & 0xff,
      (widthMinusOne >> 8) & 0xff,
      (widthMinusOne >> 16) & 0xff,
    ],
    24,
  );
  bytes.set(
    [
      heightMinusOne & 0xff,
      (heightMinusOne >> 8) & 0xff,
      (heightMinusOne >> 16) & 0xff,
    ],
    27,
  );
  return bytes;
}

test("default normalization ignores case, repeated whitespace, and blank lines", () => {
  const result = compareOcrTranscripts(
    "Account   settings\n\nSAVE",
    "account settings\nsave",
  );

  assert.equal(result.assessment.level, "same");
  assert.equal(result.line.totalChanges, 0);
  assert.equal(result.word.totalChanges, 0);
  assert.equal(result.line.similarityPercent, 100);
});

test("case-sensitive comparison reports deterministic replacements", () => {
  const result = compareOcrTranscripts("Save", "SAVE", {
    ignoreCase: false,
  });

  assert.equal(result.line.counts.replacements, 1);
  assert.equal(result.word.counts.replacements, 1);
  assert.deepEqual(result.line.details[0], {
    kind: "replacement",
    before: { key: "Save", lineNumber: 1, text: "Save" },
    after: { key: "SAVE", lineNumber: 1, text: "SAVE" },
  });
});

test("punctuation can be included or ignored", () => {
  const included = compareOcrTranscripts("Total: 20!", "Total 20", {
    ignorePunctuation: false,
  });
  const ignored = compareOcrTranscripts("Total: 20!", "Total 20", {
    ignorePunctuation: true,
  });

  assert.equal(included.word.totalChanges > 0, true);
  assert.equal(ignored.line.totalChanges, 0);
  assert.equal(ignored.word.totalChanges, 0);
});

test("reports line additions, removals, and replacements", () => {
  const result = compareOcrTranscripts(
    "Heading\nOld offer\nRemove me",
    "Heading\nNew offer\nAdd me\nExtra",
    { ignoreCase: false },
  );

  assert.equal(result.line.counts.replacements, 2);
  assert.equal(result.line.counts.additions, 1);
  assert.equal(result.line.counts.removals, 0);
  assert.equal(result.line.counts.unchanged, 1);
});

test("counts isolated removals and additions around unchanged lines", () => {
  const result = compareOcrTranscripts(
    "Keep\nRemoved\nMiddle",
    "Keep\nMiddle\nAdded",
  );

  assert.equal(result.line.counts.removals, 1);
  assert.equal(result.line.counts.additions, 1);
  assert.equal(result.line.counts.replacements, 0);
  assert.equal(result.line.changeBlocks, 2);
});

test("word comparison pairs adjacent token swaps as replacements", () => {
  const result = compareOcrTranscripts(
    "Your old plan is active",
    "Your new plan is active",
  );

  assert.equal(result.word.counts.replacements, 1);
  assert.equal(result.word.counts.additions, 0);
  assert.equal(result.word.counts.removals, 0);
  assert.equal(result.word.counts.unchanged, 4);
});

test("blank lines remain comparable when the option is disabled", () => {
  const result = compareOcrTranscripts("One\n\nTwo", "One\nTwo", {
    ignoreBlankLines: false,
  });

  assert.equal(result.line.counts.removals, 1);
  assert.equal(result.line.beforeCount, 3);
  assert.equal(result.line.afterCount, 2);
});

test("comparison is deterministic for repeated inputs", () => {
  const first = compareOcrTranscripts("A\nB\nC", "A\nX\nC");
  const second = compareOcrTranscripts("A\nB\nC", "A\nX\nC");

  assert.deepEqual(first, second);
});

test("bounds character, line, word, and detail work", () => {
  const manyLines = Array.from(
    { length: ocrComparatorLimits.maxLines + 50 },
    (_, index) => `before-${index}`,
  ).join("\n");
  const manyOtherLines = Array.from(
    { length: ocrComparatorLimits.maxLines + 50 },
    (_, index) => `after-${index}`,
  ).join("\n");
  const result = compareOcrTranscripts(manyLines, manyOtherLines, {
    ignoreCase: false,
  });

  assert.equal(result.line.beforeCount, ocrComparatorLimits.maxLines);
  assert.equal(result.line.afterCount, ocrComparatorLimits.maxLines);
  assert.equal(result.bounds.beforeLinesTruncated, true);
  assert.equal(result.bounds.afterLinesTruncated, true);
  assert.equal(result.line.details.length, ocrComparatorLimits.maxChangeDetails);
  assert.equal(result.bounds.detailsTruncated, true);

  const longResult = compareOcrTranscripts(
    "word ".repeat(ocrComparatorLimits.maxWords + 100),
    "other ".repeat(ocrComparatorLimits.maxWords + 100),
  );
  assert.equal(longResult.word.beforeCount, ocrComparatorLimits.maxWords);
  assert.equal(longResult.bounds.beforeWordsTruncated, true);

  const characterResult = compareOcrTranscripts(
    "x".repeat(ocrComparatorLimits.maxTranscriptCharacters + 10),
    "x",
  );
  assert.equal(characterResult.bounds.beforeCharactersTruncated, true);
  assert.equal(
    characterResult.bounds.beforeCharacters,
    ocrComparatorLimits.maxTranscriptCharacters + 10,
  );
});

test("counts-only report excludes transcripts, filenames, and image content", () => {
  const privateBefore = "PRIVATE CUSTOMER niki@example.com";
  const privateAfter = "PRIVATE CUSTOMER account 7788";
  const result = compareOcrTranscripts(privateBefore, privateAfter);
  const report = serializeCountsOnlyOcrReport(result);

  assert.doesNotMatch(
    report,
    /PRIVATE CUSTOMER|niki@example|7788|before-secret\.png|after-secret\.png/iu,
  );
  assert.equal(buildCountsOnlyOcrReport(result).processing.filenamesIncluded, false);
  assert.equal(
    buildCountsOnlyOcrReport(result).processing.transcriptContentIncluded,
    false,
  );
  assert.equal(
    buildCountsOnlyOcrReport(result).processing.imagePixelsIncluded,
    false,
  );
});

test("report limitations cover OCR, visual, hidden-text, and authenticity gaps", () => {
  const report = buildCountsOnlyOcrReport(compareOcrTranscripts("A", "B"));
  const limitations = report.limitations.join(" ");

  assert.match(limitations, /OCR recognition errors/iu);
  assert.match(limitations, /layout, styling, color/iu);
  assert.match(limitations, /hidden, obscured/iu);
  assert.match(limitations, /does not authenticate/iu);
  assert.match(limitations, /tamper-free/iu);
});

test("recognizes PNG, JPEG, and WebP signatures without decoding them", () => {
  assert.equal(
    detectRasterImageType(
      Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ),
    "image/png",
  );
  assert.equal(
    detectRasterImageType(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0])),
    "image/jpeg",
  );
  assert.equal(
    detectRasterImageType(
      Uint8Array.from([
        0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
      ]),
    ),
    "image/webp",
  );
  assert.equal(detectRasterImageType(new Uint8Array([1, 2, 3])), null);
});

test("parses supported raster dimensions from headers before preview", () => {
  assert.deepEqual(parseRasterImageDimensions(pngHeader(1_280, 720)), {
    width: 1_280,
    height: 720,
    mediaType: "image/png",
  });
  assert.deepEqual(parseRasterImageDimensions(jpegHeader(1_920, 1_080)), {
    width: 1_920,
    height: 1_080,
    mediaType: "image/jpeg",
  });
  assert.deepEqual(parseRasterImageDimensions(webpVp8xHeader(800, 600)), {
    width: 800,
    height: 600,
    mediaType: "image/webp",
  });
});

test("rejects screenshot dimensions beyond preview limits", () => {
  assert.equal(
    validateRasterImageDimensions({ width: 1_920, height: 1_080 }).ok,
    true,
  );
  assert.equal(
    validateRasterImageDimensions({
      width: ocrComparatorLimits.maxImageEdge + 1,
      height: 10,
    }).code,
    "edge-limit",
  );
  assert.equal(
    validateRasterImageDimensions({ width: 4_000, height: 4_000 }).code,
    "pixel-limit",
  );
});
