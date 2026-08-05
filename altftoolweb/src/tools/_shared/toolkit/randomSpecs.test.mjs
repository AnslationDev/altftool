import assert from "node:assert/strict";
import test from "node:test";

import { spec as bandName } from "../../band-name-generator/spec.js";
import { spec as blogIdeas } from "../../blog-post-ideas/spec.js";
import { spec as blogTitle } from "../../blog-title-generator/spec.js";
import { spec as callToAction } from "../../call-to-action-generator/spec.js";
import { spec as coinToss } from "../../coin-toss-streak-game/spec.js";
import { spec as diceRoller } from "../../d-d-dice-roller/spec.js";
import { spec as domainNames } from "../../domain-name-ideas-generator/spec.js";
import { spec as fantasyNames } from "../../fantasy-character-name-generator/spec.js";
import { spec as magicEightBall } from "../../magic-8-ball/spec.js";
import { spec as randomDecision } from "../../random-decision-maker/spec.js";
import { createSeededRandom } from "./runtimeHelpers.js";

const RANDOM_SPECS = [
  bandName,
  blogIdeas,
  blogTitle,
  callToAction,
  coinToss,
  diceRoller,
  domainNames,
  fantasyNames,
  magicEightBall,
  randomDecision,
];

function defaults(spec) {
  return Object.fromEntries(spec.fields.map((field) => [field.key, field.default]));
}

function compute(spec, seed) {
  return spec.compute(defaults(spec), "", createSeededRandom(seed));
}

test("random tool output stays stable until the regenerate seed changes", () => {
  for (const spec of RANDOM_SPECS) {
    assert.deepEqual(compute(spec, 42), compute(spec, 42), spec.slug);
  }
});

test("regenerate advances random tools to a new deterministic sequence", () => {
  const changed = RANDOM_SPECS.filter(
    (spec) => JSON.stringify(compute(spec, 42)) !== JSON.stringify(compute(spec, 43)),
  );
  assert.equal(changed.length, RANDOM_SPECS.length);
});
