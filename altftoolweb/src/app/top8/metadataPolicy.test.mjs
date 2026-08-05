import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const rootLayoutSource = fs.readFileSync(
  new URL("./layout.jsx", import.meta.url),
  "utf8",
);
const catchAllLayoutSource = fs.readFileSync(
  new URL("./[...slug]/layout.jsx", import.meta.url),
  "utf8",
);

test("top8 root owns a noindex self-canonical", () => {
  assert.match(rootLayoutSource, /path:\s*["']\/top8["']/u);
  assert.match(rootLayoutSource, /noindex:\s*true/u);
  assert.match(rootLayoutSource, /follow:\s*true/u);
});

test("top8 nested routes build path-specific canonicals", () => {
  assert.match(catchAllLayoutSource, /`\/top8\/\$\{suffix\}`/u);
  assert.match(catchAllLayoutSource, /noindex:\s*true/u);
  assert.match(catchAllLayoutSource, /follow:\s*true/u);
});
