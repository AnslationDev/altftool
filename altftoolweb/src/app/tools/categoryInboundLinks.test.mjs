import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const categoryPageSource = readFileSync(
  new URL("./[category]/page.jsx", import.meta.url),
  "utf8",
);

test("category pages expose crawlable links to their complete tool set", () => {
  assert.match(categoryPageSource, /function getCategoryToolIndex\(category\)/);
  assert.match(categoryPageSource, /path: `\/tools\/all\/\$\{slug\}`/);
  assert.match(categoryPageSource, /!isAll && toolIndex\.length > 0/);
  assert.match(categoryPageSource, /<nav[\s\S]*?<h2[\s\S]*?<ul/);
  assert.match(categoryPageSource, /<Link\s+href=\{tool\.path\}/);
  assert.match(categoryPageSource, /prefetch=\{false\}/);
  assert.match(categoryPageSource, /hover:text-\[var\(--primary-text\)\]/);
  assert.doesNotMatch(
    categoryPageSource,
    /!isAll[\s\S]*hover:text-\[var\(--primary\)\]/,
  );
});
