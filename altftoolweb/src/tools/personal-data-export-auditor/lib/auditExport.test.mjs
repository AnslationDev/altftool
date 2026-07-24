import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeExportFile,
  createMetadataReport,
  sanitizeSchemaName,
  summarizeExportAudit,
} from "./auditExport.mjs";

test("audits JSON keys and paths without retaining field values", () => {
  const text = JSON.stringify({
    locationHistory: [
      {
        latitude: 12.34,
        longitude: 56.78,
        accountId: "private-account-123",
        deviceInformation: { userAgent: "Secret Browser" },
      },
    ],
    security: { recoveryEmail: "alice@example.com" },
  });
  const result = analyzeExportFile({
    name: "Location History.json",
    size: text.length,
    text,
    type: "application/json",
  });

  assert.equal(result.parseStatus, "analyzed");
  assert.equal(result.recordCount, 2);
  assert.equal(result.fieldCount, 8);
  assert.deepEqual(
    result.categories.map((category) => category.id),
    ["location", "devices", "identifiers", "security"],
  );
  assert.ok(result.schemaFields.includes("$.locationHistory"));
  assert.ok(!JSON.stringify(result).includes("private-account-123"));
  assert.ok(!JSON.stringify(result).includes("Secret Browser"));
  assert.ok(!JSON.stringify(result).includes("alice@example.com"));
});

test("counts CSV records and fields while using only headers for category signals", () => {
  const text =
    "message_id,contact_email,ad_interests\nm-1,alice@example.com,travel\nm-2,bob@example.com,sports\n";
  const result = analyzeExportFile({
    name: "activity.csv",
    size: text.length,
    text,
    type: "text/csv",
  });

  assert.equal(result.recordCount, 2);
  assert.equal(result.fieldCount, 6);
  assert.equal(result.uniqueFieldCount, 3);
  assert.deepEqual(
    result.categories.map((category) => category.id),
    ["contacts", "messages", "ads-interests", "identifiers"],
  );
  assert.ok(!JSON.stringify(result).includes("alice@example.com"));
  assert.ok(!JSON.stringify(result).includes("travel"));
});

test("TXT audits only structure and filename-derived categories", () => {
  const text = "first private line\n\nsecond private line\n";
  const result = analyzeExportFile({
    name: "messages.txt",
    size: text.length,
    text,
    type: "text/plain",
  });

  assert.equal(result.recordCount, 2);
  assert.equal(result.fieldCount, 0);
  assert.deepEqual(
    result.categories.map((category) => category.id),
    ["messages"],
  );
  assert.ok(!JSON.stringify(result).includes("first private line"));
});

test("refuses archives and redacts value-like dynamic schema keys", () => {
  const archive = analyzeExportFile({
    name: "takeout.zip",
    size: 4_096,
    text: "",
    type: "application/zip",
  });

  assert.equal(archive.parseStatus, "unsupported");
  assert.match(archive.warnings[0], /not opened/i);
  assert.equal(sanitizeSchemaName("alice@example.com"), "[dynamic key]");
  assert.equal(
    sanitizeSchemaName("550e8400-e29b-41d4-a716-446655440000"),
    "[dynamic key]",
  );
});

test("creates a deterministic metadata-only aggregate report", () => {
  const jsonText = JSON.stringify({
    searches: [{ query: "do not include this search value" }],
  });
  const csvText = "device_id,login_time\nphone-1,2026-01-01\n";
  const files = [
    analyzeExportFile({
      name: "search-history.json",
      size: jsonText.length,
      text: jsonText,
    }),
    analyzeExportFile({
      name: "devices.csv",
      size: csvText.length,
      text: csvText,
    }),
  ];
  const audit = summarizeExportAudit(files);
  const report = createMetadataReport(audit, "2026-07-24T00:00:00.000Z");

  assert.equal(audit.summary.fileCount, 2);
  assert.equal(audit.summary.recordCount, 3);
  assert.ok(report.includes("2026-07-24T00:00:00.000Z"));
  assert.ok(report.includes("search-history.json"));
  assert.ok(!report.includes("do not include this search value"));
  assert.ok(!report.includes("phone-1"));
});
