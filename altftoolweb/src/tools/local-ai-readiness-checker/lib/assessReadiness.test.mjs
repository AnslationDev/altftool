import assert from "node:assert/strict";
import test from "node:test";

import {
  assessReadiness,
  buildReadinessReport,
  normalizeHardware,
  WORKLOAD_PROFILES,
} from "./assessReadiness.mjs";

const capable = {
  ramGb: 32,
  vramGb: 12,
  freeDiskGb: 100,
  logicalCores: 12,
  acceleration: "cuda",
};

test("validates bounded manually entered specifications", () => {
  assert.equal(normalizeHardware(capable).ok, true);
  const invalid = normalizeHardware({ ...capable, ramGb: -1 });
  assert.equal(invalid.ok, false);
  assert.match(invalid.errors.join(" "), /system memory/);
});

test("compares every illustrative workload by default", () => {
  const result = assessReadiness(capable);
  assert.equal(result.ok, true);
  assert.equal(result.assessments.length, WORKLOAD_PROFILES.length);
  assert.equal(result.counts.meetsThresholds, WORKLOAD_PROFILES.length);
});

test("reports exact numeric shortfalls", () => {
  const result = assessReadiness(
    {
      ramGb: 12,
      vramGb: 4,
      freeDiskGb: 18,
      logicalCores: 4,
      acceleration: "none",
    },
    ["routine-text"],
  );
  assert.equal(result.assessments[0].status, "below-thresholds");
  assert.deepEqual(
    result.assessments[0].gaps.map((gap) => [gap.field, gap.shortfall]),
    [
      ["ramGb", 4],
      ["freeDiskGb", 2],
      ["logicalCores", 2],
    ],
  );
});

test("uses a calibrated close status for one small numeric gap", () => {
  const result = assessReadiness(
    { ...capable, ramGb: 14 },
    ["routine-text"],
  );
  assert.equal(result.assessments[0].status, "close-to-thresholds");
});

test("does not treat unknown acceleration as meeting an accelerated profile", () => {
  const result = assessReadiness(
    { ...capable, acceleration: "unknown" },
    ["accelerated-text"],
  );
  assert.equal(result.assessments[0].status, "below-thresholds");
  assert.equal(result.assessments[0].gaps.at(-1).field, "acceleration");
});

test("rejects unknown profile identifiers when none remain", () => {
  const result = assessReadiness(capable, ["future-unlisted-profile"]);
  assert.equal(result.ok, false);
  assert.match(result.errors[0], /known workload/);
});

test("counts-only report excludes entered hardware values", () => {
  const result = assessReadiness(capable);
  const report = buildReadinessReport(result);
  const serialized = JSON.stringify(report);
  assert.equal(report.scope.deviceWasScanned, false);
  assert.equal(serialized.includes('"ramGb":32'), false);
  assert.equal(serialized.includes('"vramGb":12'), false);
});
