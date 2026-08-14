import assert from "node:assert/strict";
import test from "node:test";

import { convertPitch } from "./lib.js";

test("blank optional dimensions become zero but invalid and negative values fail", () => {
  const blank = convertPitch({ mode: "riseIn12", value: 6, spanFt: "", overhangFt: null });
  assert.equal(blank.error, undefined);
  assert.equal(blank.spanFt, 0);
  assert.match(convertPitch({ mode: "riseIn12", value: 6, spanFt: NaN }).error, /valid number/iu);
  assert.match(convertPitch({ mode: "riseIn12", value: 6, spanFt: -1 }).error, /negative/iu);
  assert.match(convertPitch({ mode: "riseIn12", value: 6, overhangFt: -1 }).error, /negative/iu);
});

test("keeps the areaMultiplier compatibility alias", () => {
  const result = convertPitch({ mode: "riseIn12", value: 6, spanFt: 20 });
  assert.equal(result.areaMultiplier, result.slopeFactor);
  assert.equal(result.areaMultiplier, 1.118);
});
