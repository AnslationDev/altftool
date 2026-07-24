import assert from "node:assert/strict";
import test from "node:test";

import { collectBoundedPdfTextItems } from "./extractDocumentText.js";

function legacyPageNormalization(items) {
  return items
    .map(
      (item) =>
        `${typeof item?.str === "string" ? item.str : ""}${
          item?.hasEOL ? "\n" : " "
        }`,
    )
    .join("")
    .replace(/[ \t]+\n/gu, "\n")
    .replace(/[ \t]{2,}/gu, " ")
    .trim();
}

test("bounded PDF item collection preserves existing page normalization", () => {
  const items = [
    { str: "  First", hasEOL: false },
    { str: "   line  ", hasEOL: true },
    { str: "\tSecond", hasEOL: false },
    { str: "line", hasEOL: false },
  ];

  const result = collectBoundedPdfTextItems(items, 1_000);

  assert.equal(result.text, legacyPageNormalization(items));
  assert.equal(result.truncated, false);
});

test("bounded PDF item collection stops inside an oversized item", () => {
  let itemsVisited = 0;
  function* items() {
    itemsVisited += 1;
    yield { str: "A".repeat(100), hasEOL: false };
    itemsVisited += 1;
    yield { str: "This item must not be visited", hasEOL: false };
  }

  const result = collectBoundedPdfTextItems(items(), 16);

  assert.equal(result.text, "A".repeat(16));
  assert.equal(result.text.length, 16);
  assert.equal(result.truncated, true);
  assert.equal(itemsVisited, 1);
});

test("trailing PDF whitespace does not create a false truncation warning", () => {
  const result = collectBoundedPdfTextItems(
    [
      { str: "Hello", hasEOL: false },
      { str: "\n".repeat(100), hasEOL: false },
    ],
    5,
  );

  assert.equal(result.text, "Hello");
  assert.equal(result.truncated, false);
});

test("internal whitespace beyond the remaining bound is truncated", () => {
  const result = collectBoundedPdfTextItems(
    [
      { str: "Hello", hasEOL: true },
      { str: "\n".repeat(20), hasEOL: false },
      { str: "World", hasEOL: false },
    ],
    8,
  );

  assert.equal(result.text.length, 8);
  assert.equal(result.truncated, true);
});
