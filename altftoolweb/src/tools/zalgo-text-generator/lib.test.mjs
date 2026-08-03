import test from "node:test";
import assert from "node:assert/strict";

import { generateZalgoText } from "./lib.js";

test("zalgo generation preserves code points and whitespace", () => {
  const result = generateZalgoText("A 😀\nB", {
    upCount: 1,
    midCount: 1,
    downCount: 1,
    upMarks: ["\u0301"],
    midMarks: ["\u0336"],
    downMarks: ["\u0323"],
    random: () => 0,
  });

  assert.equal(result, "A\u0301\u0336\u0323 😀\u0301\u0336\u0323\nB\u0301\u0336\u0323");
});
