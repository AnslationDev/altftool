import assert from "node:assert/strict";
import test from "node:test";

import {
  auditFormLabels,
  buildFormLabelReport,
} from "./auditFormLabels.mjs";

test("resolves explicit and wrapping labels", () => {
  const result = auditFormLabels(`
    <label for="email">Email address</label><input id="email">
    <label>Subscribe <input type="checkbox"></label>
  `);
  assert.deepEqual(result.controls.map((control) => control.accessibleName), [
    "Email address",
    "Subscribe",
  ]);
  assert.equal(result.counts.unnamedControls, 0);
});

test("resolves aria-labelledby and reports missing references", () => {
  const result = auditFormLabels(`
    <span id="search-name">Site search</span>
    <input aria-labelledby="search-name">
    <input aria-labelledby="missing-name">
  `);
  assert.equal(result.controls[0].accessibleName, "Site search");
  assert.equal(
    result.controls[1].cueIds.includes("broken-labelledby-reference"),
    true,
  );
});

test("does not treat placeholder as an accessible name", () => {
  const result = auditFormLabels('<input placeholder="Email">');
  assert.equal(result.controls[0].accessibleName, "");
  assert.equal(result.controls[0].cueIds.includes("placeholder-only"), true);
});

test("finds duplicate IDs and labels pointing at missing controls", () => {
  const result = auditFormLabels(`
    <label for="missing">Missing</label>
    <input id="duplicate" aria-label="One">
    <input id="duplicate" aria-label="Two">
  `);
  assert.equal(result.cueCounts["duplicate-id"], 1);
  assert.equal(result.cueCounts["label-for-missing-control"], 1);
});

test("checks visible label text against the heuristic accessible name", () => {
  const result = auditFormLabels(
    '<label for="save">Save changes</label><button id="save" aria-label="Submit">Save</button>',
  );
  assert.equal(
    result.controls[0].cueIds.includes("visible-label-not-in-name"),
    true,
  );
});

test("flags radio groups in a fieldset without a legend", () => {
  const result = auditFormLabels(`
    <fieldset>
      <label><input type="radio" name="plan"> Basic</label>
      <label><input type="radio" name="plan"> Pro</label>
    </fieldset>
  `);
  assert.equal(result.cueCounts["group-without-legend"], 2);
});

test("ignores hidden inputs and aria-hidden control subtrees", () => {
  const result = auditFormLabels(`
    <input type="hidden" value="secret">
    <div aria-hidden="true"><input></div>
    <button>Continue</button>
  `);
  assert.equal(result.controls.length, 1);
  assert.equal(result.controls[0].accessibleName, "Continue");
});

test("counts-only report excludes labels, names, and source values", () => {
  const result = auditFormLabels(
    '<label for="private">PRIVATE LABEL</label><input id="private">',
  );
  const report = buildFormLabelReport(result);
  const serialized = JSON.stringify(report);
  assert.equal(serialized.includes("PRIVATE LABEL"), false);
  assert.equal(serialized.includes('"private"'), false);
  assert.equal(report.scope.sourceExecuted, false);
  assert.equal(report.scope.conformanceEstablished, false);
});
