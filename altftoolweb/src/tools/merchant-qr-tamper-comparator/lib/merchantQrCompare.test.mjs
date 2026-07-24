import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCountsOnlyComparisonReport,
  compareMerchantPayloads,
  parseUpiMerchantPayload,
} from "./merchantQrCompare.mjs";

test("parses deterministic merchant UPI fields without opening the URI", () => {
  const result = parseUpiMerchantPayload(
    "upi://pay?pa=shop%40bank&pn=Example%20Shop&mid=M-42&am=125.50&cu=inr&tr=ORDER-9",
  );
  assert.equal(result.ok, true);
  assert.equal(result.action, "pay");
  assert.equal(result.fields.payeeVpa, "shop@bank");
  assert.equal(result.fields.payeeName, "Example Shop");
  assert.equal(result.fields.amount, 125.5);
  assert.equal(result.fields.currency, "INR");
});

test("rejects non-UPI links and malformed text", () => {
  assert.equal(parseUpiMerchantPayload("https://example.com/pay").ok, false);
  assert.equal(parseUpiMerchantPayload("not a uri").ok, false);
});

test("reports duplicate parameters and hidden Unicode controls", () => {
  const result = parseUpiMerchantPayload(
    "upi://pay?pa=first%40bank&pa=second%40bank&pn=Shop%E2%80%AE&cu=INR",
  );
  assert.deepEqual(result.duplicateKeys, ["pa"]);
  assert.ok(result.warnings.some((warning) => warning.code === "duplicate-keys"));
  assert.ok(result.warnings.some((warning) => warning.code === "hidden-unicode"));
});

test("normalizes VPA, name, amount, and currency before matching", () => {
  const trusted = parseUpiMerchantPayload(
    "upi://pay?pa=SHOP%40BANK&pn=Example%20Shop&am=100&cu=inr",
  );
  const current = parseUpiMerchantPayload(
    "upi://pay?pa=shop%40bank&pn=%20example%20%20shop%20&am=100.00&cu=INR",
  );
  const comparison = compareMerchantPayloads(trusted, current);
  assert.equal(comparison.state, "match");
  assert.equal(comparison.rows.find((row) => row.key === "payeeVpa").state, "match");
  assert.equal(comparison.rows.find((row) => row.key === "amount").state, "match");
});

test("highlights changed payee, action, amount, and reference values", () => {
  const trusted = parseUpiMerchantPayload(
    "upi://pay?pa=shop%40bank&pn=Shop&am=100&cu=INR&tr=ORDER-1",
  );
  const current = parseUpiMerchantPayload(
    "upi://collect?pa=other%40bank&pn=Other&am=500&cu=INR&tr=ORDER-2",
  );
  const comparison = compareMerchantPayloads(trusted, current);
  assert.equal(comparison.state, "mismatch");
  assert.ok(comparison.mismatchCount >= 4);
});

test("marks mutually absent optional fields as not checkable", () => {
  const trusted = parseUpiMerchantPayload("upi://pay?pa=shop%40bank&cu=INR");
  const current = parseUpiMerchantPayload("upi://pay?pa=shop%40bank&cu=INR");
  const comparison = compareMerchantPayloads(trusted, current);
  assert.equal(
    comparison.rows.find((row) => row.key === "reference").state,
    "not-checkable",
  );
});

test("does not claim a match for duplicated comparison fields", () => {
  const trusted = parseUpiMerchantPayload(
    "upi://pay?pa=shop%40bank&pa=other%40bank&cu=INR",
  );
  const current = parseUpiMerchantPayload("upi://pay?pa=shop%40bank&cu=INR");
  const comparison = compareMerchantPayloads(trusted, current);
  assert.equal(
    comparison.rows.find((row) => row.key === "payeeVpa").state,
    "not-checkable",
  );
});

test("counts-only report excludes merchant payload values", () => {
  const trusted = parseUpiMerchantPayload(
    "upi://pay?pa=private-shop%40bank&pn=Private%20Shop&am=100&cu=INR",
  );
  const current = parseUpiMerchantPayload(
    "upi://pay?pa=private-shop%40bank&pn=Private%20Shop&am=100&cu=INR",
  );
  const comparison = compareMerchantPayloads(trusted, current);
  const report = buildCountsOnlyComparisonReport(comparison, trusted, current, {
    trusted: "decoded",
    current: "pasted",
  });
  assert.match(report, /Matching fields/);
  assert.doesNotMatch(report, /private-shop|Private Shop|100/);
});
