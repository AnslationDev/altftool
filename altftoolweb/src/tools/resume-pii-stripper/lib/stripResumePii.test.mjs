import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCountsOnlyReport,
  DEFAULT_RESUME_PII_TYPES,
  stripResumePii,
} from "./stripResumePii.mjs";

const SAMPLE = `Aarav Mehta
Email: aarav@example.com
Phone: +91 98765 43210
Address: Flat 12, Lake View Road, Pune 411001
DOB: 12/08/1993
PAN: ABCDE1234F
Portfolio: https://aarav.example.dev
GitHub: @aarav-dev

Experience
References available at aarav@example.com`;

test("detects resume header and common personal data without exposing values in match metadata", () => {
  const result = stripResumePii(SAMPLE);

  assert.match(result.output, /\[NAME_1\]/);
  assert.match(result.output, /\[EMAIL_1\]/);
  assert.match(result.output, /\[PHONE_1\]/);
  assert.match(result.output, /\[ADDRESS_1\]/);
  assert.match(result.output, /\[DOB_1\]/);
  assert.match(result.output, /\[ID_1\]/);
  assert.match(result.output, /\[URL_1\]/);
  assert.match(result.output, /\[HANDLE_1\]/);
  assert.equal(result.output.includes("aarav@example.com"), false);
  assert.equal(Object.hasOwn(result.matches[0], "value"), false);
});

test("uses stable placeholders for repeated values", () => {
  const result = stripResumePii(
    "Mira Shah\nEmail: mira@example.com\nReference: mira@example.com",
  );
  const placeholders = result.output.match(/\[EMAIL_1\]/g);

  assert.equal(placeholders?.length, 2);
  assert.equal(result.summary.find((item) => item.type === "email")?.uniqueValues, 1);
});

test("header heuristic removes the candidate name but preserves the job title", () => {
  const result = stripResumePii("Priya Sharma\nProduct Designer\n\nExperience");

  assert.match(result.output, /^\[NAME_1\]\nProduct Designer/);
  assert.equal(result.summary.find((item) => item.type === "name")?.count, 1);
});

test("remove mode deletes detected values and preserves non-PII resume content", () => {
  const result = stripResumePii(SAMPLE, {
    enabledTypes: DEFAULT_RESUME_PII_TYPES,
    mode: "remove",
  });

  assert.equal(result.output.includes("Aarav Mehta"), false);
  assert.equal(result.output.includes("+91 98765 43210"), false);
  assert.equal(result.output.includes("[NAME_1]"), false);
  assert.match(result.output, /Experience/);
});

test("counts-only report never contains source values or output text", () => {
  const result = stripResumePii(SAMPLE);
  const report = buildCountsOnlyReport(result, "placeholder");
  const serialized = JSON.stringify(report);

  assert.equal(serialized.includes("aarav@example.com"), false);
  assert.equal(serialized.includes("Aarav Mehta"), false);
  assert.equal(Object.hasOwn(report, "output"), false);
  assert.equal(report.totalDetections, result.total);
});

test("can disable a PII category", () => {
  const result = stripResumePii("Neha Rao\nneha@example.com", {
    enabledTypes: ["email"],
  });

  assert.match(result.output, /^Neha Rao/);
  assert.match(result.output, /\[EMAIL_1\]/);
  assert.equal(result.summary.some((item) => item.type === "name"), false);
});
