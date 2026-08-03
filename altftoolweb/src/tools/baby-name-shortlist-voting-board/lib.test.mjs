import assert from "node:assert/strict";
import test from "node:test";

import { tallyBoard } from "./lib.js";

test("counts a cast single vote in the displayed unanimous total", () => {
  const result = tallyBoard({
    names: [
      { id: "a", label: "Aarav" },
      { id: "b", label: "Mira" },
    ],
    voters: [{ id: "parent", label: "Parent" }],
    votes: { parent: { a: 5 } },
  });

  assert.equal(result.error, undefined);
  assert.equal(result.rows.find((row) => row.id === "a").consensusBand, "Unanimous");
  assert.equal(result.unanimousCount, 1);
});

test("does not count an untouched name as unanimous", () => {
  const result = tallyBoard({
    names: [{ id: "a", label: "Aarav" }],
    voters: [{ id: "parent", label: "Parent" }],
    votes: {},
  });

  assert.equal(result.unanimousCount, 0);
});
