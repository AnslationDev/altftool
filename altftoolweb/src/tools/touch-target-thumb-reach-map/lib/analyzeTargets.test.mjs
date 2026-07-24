import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeTargets,
  buildTargetReport,
  parseTargets,
} from "./analyzeTargets.mjs";

const viewport = { viewportWidth: 360, viewportHeight: 800, hand: "right" };

test("parses JSON arrays and CSV with a header", () => {
  const json = parseTargets('[{"label":"A","x":0,"y":0,"width":44,"height":44}]');
  const csv = parseTargets("label,x,y,width,height,exception\nA,0,0,24,24,none");
  assert.equal(json.targets.length, 1);
  assert.equal(csv.targets[0].width, 24);
});

test("classifies 44 and 24 CSS pixel rectangles separately", () => {
  const result = analyzeTargets(
    JSON.stringify([
      { label: "Enhanced", x: 0, y: 0, width: 44, height: 44 },
      { label: "Minimum", x: 100, y: 100, width: 24, height: 24 },
    ]),
    viewport,
  );
  assert.deepEqual(result.targets.map((target) => target.status), [
    "enhanced-size",
    "minimum-size",
  ]);
});

test("marks a separated undersized target as a spacing candidate", () => {
  const result = analyzeTargets(
    JSON.stringify([
      { label: "Small", x: 0, y: 0, width: 16, height: 16 },
      { label: "Far", x: 100, y: 100, width: 24, height: 24 },
    ]),
    viewport,
  );
  assert.equal(result.targets[0].status, "spacing-candidate");
});

test("detects intersecting spacing circles between undersized targets", () => {
  const result = analyzeTargets(
    JSON.stringify([
      { label: "One", x: 0, y: 0, width: 16, height: 16 },
      { label: "Two", x: 18, y: 0, width: 16, height: 16 },
    ]),
    viewport,
  );
  assert.equal(result.targets[0].status, "below-minimum");
  assert.equal(result.targets[1].spacingConflict, true);
});

test("keeps user-selected exceptions in manual review", () => {
  const result = analyzeTargets(
    JSON.stringify([
      {
        label: "Inline link",
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        exception: "inline",
      },
    ]),
    viewport,
  );
  assert.equal(result.targets[0].status, "exception-review");
  assert.match(result.targets[0].message, /manual evidence/);
});

test("flags rectangles outside the supplied viewport", () => {
  const result = analyzeTargets(
    JSON.stringify([{ label: "Outside", x: 350, y: 790, width: 44, height: 44 }]),
    viewport,
  );
  assert.equal(result.counts.outsideViewport, 1);
});

test("maps reach relative to the selected hand without calling it ergonomic proof", () => {
  const nearRight = analyzeTargets(
    JSON.stringify([{ label: "Bottom right", x: 320, y: 750, width: 24, height: 24 }]),
    viewport,
  );
  const nearLeft = analyzeTargets(
    JSON.stringify([{ label: "Bottom left", x: 0, y: 750, width: 24, height: 24 }]),
    { ...viewport, hand: "left" },
  );
  assert.equal(nearRight.targets[0].reach.id, "near");
  assert.equal(nearLeft.targets[0].reach.id, "near");
  assert.match(nearRight.limitations.join(" "), /not an ergonomic/);
});

test("counts-only report excludes labels and coordinates", () => {
  const result = analyzeTargets(
    JSON.stringify([
      { label: "PRIVATE LABEL", x: 123, y: 456, width: 44, height: 44 },
    ]),
    viewport,
  );
  const report = buildTargetReport(result);
  const serialized = JSON.stringify(report);
  assert.equal(serialized.includes("PRIVATE LABEL"), false);
  assert.equal(serialized.includes('"x":123'), false);
  assert.equal(serialized.includes('"y":456'), false);
  assert.equal(report.scope.wcagConformanceEstablished, false);
});
