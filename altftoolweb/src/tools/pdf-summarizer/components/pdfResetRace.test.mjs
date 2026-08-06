import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("./Main.jsx", import.meta.url), "utf8");

test("PDF extraction rechecks the run token after both page awaits", () => {
  assert.match(
    source,
    /const page = await pdf\.getPage\(pageNumber\);\s*if \(token !== processingTokenRef\.current\) return;\s*const textContent = await page\.getTextContent\(\);\s*if \(token !== processingTokenRef\.current\) return;/,
  );
});
