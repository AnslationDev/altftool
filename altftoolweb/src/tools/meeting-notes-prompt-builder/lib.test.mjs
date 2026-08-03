import test from "node:test";
import assert from "node:assert/strict";

import { analyseNotes } from "./lib.js";

test("pending legal sign-off is an action or question, never a decision", () => {
  const analysis = analyseNotes([
    "Legal needs to sign off by Friday",
    "Approval pending from Finance",
    "Legal signed off on the EU rollout",
  ].join("\n"));

  assert.equal(analysis.lines[0].kind, "action");
  assert.equal(analysis.lines[1].kind, "question");
  assert.equal(analysis.lines[2].kind, "decision");
  assert.equal(analysis.decisions.length, 1);
});
