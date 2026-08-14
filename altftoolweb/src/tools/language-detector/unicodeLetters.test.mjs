import assert from "node:assert/strict";
import test from "node:test";

import { detectLanguage } from "./utils/detect.js";

test("Latin Extended letters participate in script detection, scoring and stats", () => {
  const polish = detectLanguage("ąćęłńśźż");
  assert.equal(polish.scripts[0]?.name, "Latin");
  assert.equal(polish.scripts[0]?.count, 8);
  assert.equal(polish.stats.letters, 8);
  assert.equal(polish.candidates[0]?.lang, "Polish");

  const vietnamese = detectLanguage("ơưđ");
  assert.equal(vietnamese.scripts[0]?.name, "Latin");
  assert.equal(vietnamese.scripts[0]?.count, 3);
  assert.equal(vietnamese.stats.letters, 3);
  assert.equal(vietnamese.candidates[0]?.lang, "Vietnamese");
});

test("displayed letter statistics count letters from non-Latin scripts", () => {
  assert.equal(detectLanguage("हिन्दी Ελληνικά").stats.letters, 11);
});
