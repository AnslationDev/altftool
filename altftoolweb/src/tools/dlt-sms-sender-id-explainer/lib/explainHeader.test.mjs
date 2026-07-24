import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCountsOnlyHeaderReport,
  explainSenderHeader,
  explainSenderHeaders,
} from "./explainHeader.mjs";

test("explains a full current header and supported category suffix", () => {
  const result = explainSenderHeader("VD-KOTAKB-S");

  assert.equal(result.format, "prefixed-with-category");
  assert.equal(result.headerCode, "KOTAKB");
  assert.equal(result.originPrefix.provider.label, "Vodafone Idea");
  assert.equal(result.originPrefix.serviceArea.label, "Delhi");
  assert.equal(result.category.label, "Service");
  assert.equal(result.status, "explained");
});

test("marks a prefixed header without suffix as partial and category unknown", () => {
  const result = explainSenderHeader("JD-IPAYTM");

  assert.equal(result.format, "prefixed-without-category");
  assert.equal(result.originPrefix.provider.label, "Reliance Jio Infocomm");
  assert.equal(result.originPrefix.serviceArea.label, "Delhi");
  assert.equal(result.category.status, "unknown");
  assert.equal(result.status, "partial");
});

test("keeps unknown prefix codes calibrated while preserving a known category cue", () => {
  const result = explainSenderHeader("UU-ABC123-P");

  assert.equal(result.category.label, "Promotional");
  assert.equal(result.originPrefix.provider.status, "unknown");
  assert.equal(result.originPrefix.serviceArea.status, "unknown");
  assert.equal(result.status, "partial");
  assert.ok(result.notices.some((notice) => /not treated as invalid/i.test(notice)));
});

test("recognizes consent short-code family and regular phone-number shape without authenticity claims", () => {
  const shortCode = explainSenderHeader("127123");
  const number = explainSenderHeader("+91 9876543210");

  assert.equal(shortCode.format, "consent-short-code");
  assert.match(shortCode.notices.join(" "), /does not prove/i);
  assert.equal(number.format, "ten-digit-number");
  assert.match(number.notices.join(" "), /does not establish/i);
});

test("marks unknown suffixes and malformed strings unknown or partial", () => {
  const unknownSuffix = explainSenderHeader("AD-BANK01-X");
  const malformed = explainSenderHeader("click https://example.test now");

  assert.equal(unknownSuffix.category.status, "unknown");
  assert.equal(unknownSuffix.status, "partial");
  assert.equal(malformed.status, "unknown");
});

test("analyzes batches and exports only aggregate counts", () => {
  const source = [
    "VD-KOTAKB-S",
    "AD-OFFERS-P",
    "JD-LOGIN1-T",
    "127999",
    "9876543210",
    "PRIVATE-HEADER",
  ].join("\n");
  const analysis = explainSenderHeaders(source);
  const report = buildCountsOnlyHeaderReport(
    analysis,
    "2026-07-24T00:00:00.000Z",
  );

  assert.equal(analysis.summary.total, 6);
  assert.equal(analysis.summary.categoryCues, 3);
  assert.equal(analysis.summary.consentShortCodes, 1);
  assert.ok(report.includes("categoryCueCounts"));
  assert.ok(report.includes("2026-07-24T00:00:00.000Z"));
  assert.ok(!report.includes("KOTAKB"));
  assert.ok(!report.includes("OFFERS"));
  assert.ok(!report.includes("9876543210"));
  assert.ok(!report.includes("PRIVATE-HEADER"));
});

test("bounds oversized batches before parsing", () => {
  const result = explainSenderHeaders("x".repeat(10_001));

  assert.equal(result.results.length, 0);
  assert.match(result.warnings[0], /safe local limit/i);
});
