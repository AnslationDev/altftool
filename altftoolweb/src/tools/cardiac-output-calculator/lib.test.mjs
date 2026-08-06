import assert from "node:assert/strict";
import test from "node:test";

import { calculateBodySurfaceArea } from "./lib.js";

test("cardiac-index body surface area requires both height and weight", () => {
  assert.match(calculateBodySurfaceArea("170", "").error, /both height/i);
  assert.match(calculateBodySurfaceArea("", "70").error, /both height/i);

  const result = calculateBodySurfaceArea("170", "70");
  assert.equal(result.error, undefined);
  assert.ok(result.bsa > 1.8 && result.bsa < 1.9);
});
