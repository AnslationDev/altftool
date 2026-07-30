import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const categoryPageSource = readFileSync(
  new URL("./[category]/page.jsx", import.meta.url),
  "utf8",
);
const microtoolClientSource = readFileSync(
  new URL("./MicrotoolClient.jsx", import.meta.url),
  "utf8",
);
const toolsClientSource = readFileSync(
  new URL("./ToolsClient.jsx", import.meta.url),
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

test("both tools-directory entrypoints receive complete category counts", () => {
  assert.match(
    categoryPageSource,
    /categoryCounts=\{getToolCategoryCounts\(\)\}/,
  );
  assert.match(
    microtoolClientSource,
    /categoryCounts=\{getToolCategoryCounts\(\)\}/,
  );
  assert.doesNotMatch(toolsClientSource, /onFocus=\{ensureCatalog\}/);
});
