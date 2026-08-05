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

test("dice fields publish and enforce exact integer bounds", () => {
  const sides = diceRoller.fields.find((field) => field.key === "sides");
  const count = diceRoller.fields.find((field) => field.key === "count");
  assert.deepEqual(
    { min: sides.min, max: sides.max, step: sides.step },
    { min: 2, max: 1000, step: 1 },
  );
  assert.deepEqual(
    { min: count.min, max: count.max, step: count.step },
    { min: 1, max: 10, step: 1 },
  );

  for (const values of [
    { sides: 6.9, count: 2 },
    { sides: 6, count: 2.9 },
    { sides: 1, count: 2 },
    { sides: 1001, count: 2 },
    { sides: 6, count: 0 },
    { sides: 6, count: 11 },
    { sides: Number.NaN, count: 2 },
    { sides: 6, count: Number.POSITIVE_INFINITY },
  ]) {
    const result = diceRoller.compute(values, "", createSeededRandom(42));
    assert.equal(result.result, "", JSON.stringify(values));
    assert.match(result.error, /whole number/u);
  }
});

test("dice accepts both valid boundaries with deterministic rolls", () => {
  const low = diceRoller.compute(
    { sides: 2, count: 1 },
    "",
    createSeededRandom(42),
  );
  const highA = diceRoller.compute(
    { sides: 1000, count: 10 },
    "",
    createSeededRandom(42),
  );
  const highB = diceRoller.compute(
    { sides: 1000, count: 10 },
    "",
    createSeededRandom(42),
  );

  assert.match(low.result, /^[12] = [12]$/u);
  assert.equal(highA.result.split(" + ").length, 10);
  assert.deepEqual(highA, highB);
});
