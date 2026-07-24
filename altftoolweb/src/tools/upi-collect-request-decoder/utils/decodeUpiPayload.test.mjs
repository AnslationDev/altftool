import assert from "node:assert/strict";
import test from "node:test";

import {
  buildUpiDecodeReport,
  decodeUpiPayload,
} from "./decodeUpiPayload.js";

test("decodes a standard pay intent without changing the payload", () => {
  const payload =
    "upi://pay?pa=shop%40bank&pn=Example%20Shop&am=125.50&cu=INR&tr=ORDER-42";
  const result = decodeUpiPayload(payload);

  assert.equal(result.ok, true);
  assert.equal(result.actionInfo.kind, "pay");
  assert.equal(result.fields.payeeVpa, "shop@bank");
  assert.equal(result.fields.payeeName, "Example Shop");
  assert.equal(result.fields.amount, 125.5);
  assert.equal(result.fields.transactionReference, "ORDER-42");
});

test("labels collect requests and explains that approval can debit money", () => {
  const result = decodeUpiPayload(
    "upi://collect?pa=requester%40bank&pn=Requester&am=500&cu=INR",
  );
  const report = buildUpiDecodeReport(result);

  assert.equal(result.actionInfo.kind, "collect");
  assert.match(result.actionInfo.explanation, /debit money/i);
  assert.match(result.actionInfo.explanation, /receiving money never requires a UPI PIN/i);
  assert.match(report, /Never enter a UPI PIN to receive money/i);
});

test("rejects non-UPI URLs", () => {
  const result = decodeUpiPayload("https://example.com/pay?pa=shop@bank");

  assert.equal(result.ok, false);
  assert.ok(result.error.includes("Only upi://"));
});

test("flags duplicate fields and invalid amounts", () => {
  const result = decodeUpiPayload(
    "upi://pay?pa=first%40bank&pa=second%40bank&am=-10&cu=INR",
  );

  assert.equal(result.ok, true);
  assert.deepEqual(result.duplicateKeys, ["pa"]);
  assert.equal(result.fields.amountState, "invalid");
  assert.ok(result.warnings.some(({ code }) => code === "duplicate-parameters"));
  assert.ok(result.warnings.some(({ code }) => code === "invalid-amount"));
});

test("does not treat an unknown UPI action as pay or collect", () => {
  const result = decodeUpiPayload("upi://mystery?pa=shop%40bank&am=10&cu=INR");

  assert.equal(result.ok, true);
  assert.equal(result.actionInfo.kind, "unknown");
  assert.equal(result.actionInfo.tone, "danger");
});
