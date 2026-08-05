import assert from "node:assert/strict";
import test from "node:test";

import spec from "./spec.js";

test("uses the correct ordinal suffix for the default percentile", () => {
  const result = spec.compute({
    sex: "male",
    age_months: 6,
    weight: 7.5,
  });

  assert.equal(result.result, "~31st percentile");
});
