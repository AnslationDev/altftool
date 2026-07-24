import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCountsOnlyReport,
  deidentifyMedicalText,
} from "./deidentify.mjs";

test("uses stable placeholders when an identifier repeats", () => {
  const source = "Patient name: Asha Mehta\nPatient: Asha Mehta";
  const result = deidentifyMedicalText(source);

  assert.equal(
    result.output,
    "Patient name: [PATIENT_NAME_1]\nPatient: [PATIENT_NAME_1]",
  );
  assert.equal(result.total, 2);
  assert.equal(result.uniqueValues, 1);
});

test("de-identifies common patient and contact identifiers", () => {
  const source = [
    "Patient name: Asha Mehta",
    "MRN: MH-204991",
    "DOB: 12/08/1993",
    "Phone: +91 98765 43210",
    "Email: asha@example.com",
    "Address: 14 Lake View Road, Pune 411001",
  ].join("\n");
  const result = deidentifyMedicalText(source);

  assert.match(result.output, /\[PATIENT_NAME_1\]/);
  assert.match(result.output, /\[MEDICAL_ID_1\]/);
  assert.match(result.output, /\[DOB_1\]/);
  assert.match(result.output, /\[PHONE_1\]/);
  assert.match(result.output, /\[EMAIL_1\]/);
  assert.match(result.output, /\[ADDRESS_1\]/);
  assert.equal(result.total, 6);
});

test("separates general dates, clinicians, and facilities", () => {
  const source = [
    "Visit date: 2026-07-24",
    "Physician: Dr. Nisha Rao",
    "Hospital: North Star Medical Centre",
  ].join("\n");
  const result = deidentifyMedicalText(source);

  assert.equal(
    result.output,
    [
      "Visit date: [DATE_1]",
      "Physician: [CLINICIAN_1]",
      "Hospital: [FACILITY_1]",
    ].join("\n"),
  );
});

test("honours selectable categories", () => {
  const source = "Patient name: Asha Mehta\nEmail: asha@example.com";
  const result = deidentifyMedicalText(source, {
    enabledCategories: ["email"],
  });

  assert.equal(
    result.output,
    "Patient name: Asha Mehta\nEmail: [EMAIL_1]",
  );
  assert.equal(result.total, 1);
});

test("counts-only report never includes raw report values", () => {
  const secretName = "Asha Mehta";
  const secretId = "MH-204991";
  const result = deidentifyMedicalText(
    `Patient name: ${secretName}\nMRN: ${secretId}`,
  );
  const report = JSON.stringify(
    buildCountsOnlyReport(result, { sourceKind: "DOCX" }),
  );

  assert.equal(report.includes(secretName), false);
  assert.equal(report.includes(secretId), false);
  assert.equal(report.includes("sourceText"), false);
  assert.equal(JSON.stringify(result.matches).includes(secretName), false);
  assert.equal(JSON.stringify(result.matches).includes(secretId), false);
});
