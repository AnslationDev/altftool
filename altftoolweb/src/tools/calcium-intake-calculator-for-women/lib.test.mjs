import test from "node:test";
import assert from "node:assert/strict";

import {
  LIFE_STAGES,
  calculateCalciumPlan,
  suggestTopUps,
} from "./lib.js";

test("calcium intake compares labelled intake with the dietary intake target", () => {
  const result = calculateCalciumPlan({ age: 35, servings: { spinach: 1 } });

  assert.equal(result.error, undefined);
  assert.equal(result.intakeMg, 136);
  assert.equal(result.breakdown[0].listedMg, 136);
  assert.equal(result.breakdown[0].poorlyAbsorbed, true);
  assert.equal(suggestTopUps(200).some((item) => item.id === "spinach"), false);
});

test("pregnancy note remains available through the legacy field", () => {
  const result = calculateCalciumPlan({
    age: 30,
    lifeStage: LIFE_STAGES.PREGNANT,
    servings: {},
  });

  assert.equal(result.pregnancyNote, result.lifeStageNote);
  assert.match(result.pregnancyNote, /do not raise the calcium requirement/i);
});
