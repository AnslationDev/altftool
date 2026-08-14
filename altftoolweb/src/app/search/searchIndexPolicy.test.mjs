import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("./searchIndex.js", import.meta.url), "utf8");

test("large global search index is never serialized through Next data cache", () => {
  assert.doesNotMatch(source, /import\s+\{\s*unstable_cache\s*\}\s+from\s+["']next\/cache["']/u);
  assert.match(source, /const SEARCH_INDEX_TTL_MS = 60 \* 60 \* 1000/u);
  assert.match(source, /if \(!globalSearchIndexPromise\)/u);
  assert.match(source, /\.finally\(\(\) => \{[\s\S]*?globalSearchIndexPromise = null/u);
});
