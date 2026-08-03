import test from "node:test";
import assert from "node:assert/strict";

import { parseWorkingHours } from "./lib.js";

test("working-hour input requires an explicit valid value", () => {
  assert.equal(parseWorkingHours("").ok, false);
  assert.equal(parseWorkingHours("   ").ok, false);
  assert.deepEqual(parseWorkingHours("0"), { ok: true, value: 0 });
  assert.deepEqual(parseWorkingHours("24"), { ok: true, value: 24 });
  assert.equal(parseWorkingHours("8hours").ok, false);
  assert.equal(parseWorkingHours("24.1").ok, false);
});
