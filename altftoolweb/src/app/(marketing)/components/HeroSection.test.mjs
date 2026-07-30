import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourcePath = new URL("./HeroSection.jsx", import.meta.url);

test("homepage keeps answer-first facts and prioritizes the desktop hero", async () => {
  const source = await readFile(sourcePath, "utf8");

  assert.match(source, /ALTFTOOL_POSITION/);
  assert.match(source, /TOOL_COUNT\.toLocaleString\(\)/);
  assert.match(source, /loading="eager"/);
  assert.match(source, /fetchPriority="high"/);
  assert.doesNotMatch(source, /loading="lazy"/);
  assert.doesNotMatch(source, /suffix:\s*"\+"/);
});
