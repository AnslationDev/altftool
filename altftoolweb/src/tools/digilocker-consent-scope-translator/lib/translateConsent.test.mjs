import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCountsOnlyScopeReport,
  translateConsentScope,
} from "./translateConsent.mjs";

test("extracts only explicitly labeled JSON scope details", () => {
  const source = JSON.stringify({
    requesterName: "Example Bank",
    requestedDocuments: ["Driving Licence", "PAN Verification Record"],
    requestedFields: ["name", "date of birth"],
    purposeOfAccess: "Account opening KYC",
    accessDuration: "15 minutes",
    accessFrequency: "One time",
    retentionPeriod: "30 days",
    revocationMethod: "Open app settings and select Revoke",
  });
  const result = translateConsentScope(source);

  assert.equal(result.format, "json");
  assert.equal(result.summary.explicit, 8);
  assert.equal(result.items.find((item) => item.key === "requester").values[0], "Example Bank");
  assert.deepEqual(
    result.items.find((item) => item.key === "fields").values,
    ["name", "date of birth"],
  );
});

test("marks broad or conflicting scalar wording ambiguous and absent items missing", () => {
  const source = JSON.stringify({
    organizationName: "Our partners",
    purpose: "Various business purposes",
    accessDuration: "As needed",
    duration: "30 days",
    documents: "Relevant documents",
  });
  const result = translateConsentScope(source);

  assert.equal(result.items.find((item) => item.key === "requester").status, "ambiguous");
  assert.equal(result.items.find((item) => item.key === "purpose").status, "ambiguous");
  assert.equal(result.items.find((item) => item.key === "duration").status, "ambiguous");
  assert.equal(result.items.find((item) => item.key === "fields").status, "missing");
});

test("supports conservative labeled text extraction", () => {
  const source = `Requester: Example University
Documents requested: Degree Certificate; Marksheet
Requested fields: name, registration number
Purpose: Admission verification
Duration: One session
Frequency: One time
Retention: Not stored
How to revoke: Use the consent dashboard`;
  const result = translateConsentScope(source);

  assert.equal(result.format, "text");
  assert.equal(result.summary.explicit, 8);
  assert.deepEqual(
    result.items.find((item) => item.key === "documentTypes").values,
    ["Degree Certificate", "Marksheet"],
  );
});

test("does not infer approval or permissions from generic scope and consent flags", () => {
  const source = JSON.stringify({
    consent: true,
    scope: "openid profile documents.read",
    message: "We need your documents for verification.",
  });
  const result = translateConsentScope(source);

  assert.equal(result.summary.explicit, 0);
  assert.equal(result.summary.missing, 8);
  assert.ok(result.notices.some((notice) => /does not treat it as valid consent/i.test(notice)));
  assert.ok(result.notices.some((notice) => /generic scope token/i.test(notice)));
});

test("creates a counts-only report without requester or scope values", () => {
  const source = JSON.stringify({
    requester: "Private Requester Name",
    documents: ["Income Certificate"],
    fields: ["account number"],
    purpose: "Confidential loan review",
    revocationUrl: "https://private.example/revoke/secret-id",
    clientSecret: "do-not-export-this",
  });
  const result = translateConsentScope(source);
  const report = buildCountsOnlyScopeReport(
    result,
    "2026-07-24T00:00:00.000Z",
  );

  assert.ok(report.includes("2026-07-24T00:00:00.000Z"));
  assert.ok(report.includes('"explicit"'));
  assert.ok(!report.includes("Private Requester Name"));
  assert.ok(!report.includes("Income Certificate"));
  assert.ok(!report.includes("account number"));
  assert.ok(!report.includes("Confidential loan review"));
  assert.ok(!report.includes("private.example"));
  assert.ok(!report.includes("do-not-export-this"));
});

test("bounds oversized and deeply nested inputs", () => {
  const oversized = translateConsentScope("x".repeat(101), {
    maxSourceCharacters: 100,
  });
  const nested = translateConsentScope(
    JSON.stringify({ a: { b: { c: { requester: "Hidden requester" } } } }),
    { maxDepth: 1 },
  );

  assert.equal(oversized.format, "too-large");
  assert.match(oversized.notices[0], /safe local limit/i);
  assert.ok(nested.notices.some((notice) => /safe depth limit/i.test(notice)));
});
