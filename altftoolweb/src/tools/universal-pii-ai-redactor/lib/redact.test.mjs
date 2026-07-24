import assert from "node:assert/strict";
import test from "node:test";

import { buildSafeReport, redactText } from "./redact.mjs";

test("uses stable placeholders for repeated values", () => {
  const result = redactText("Email: asha@example.com\nAgain: asha@example.com");

  assert.equal(result.total, 2);
  assert.equal(result.output, "Email: [EMAIL_1]\nAgain: [EMAIL_1]");
  assert.equal(result.summary[0].uniqueValues, 1);
});

test("detects strict financial and Indian identity patterns without overlapping phone matches", () => {
  const result = redactText(
    "Card: 4111 1111 1111 1111\nPAN: ABCDE1234F\nAadhaar: 2345 6789 0124\nPhone: +91 98765 43210",
  );

  assert.match(result.output, /\[CARD_1\]/);
  assert.match(result.output, /\[PAN_1\]/);
  assert.match(result.output, /\[AADHAAR_1\]/);
  assert.match(result.output, /\[PHONE_1\]/);
  assert.equal(result.summary.find((item) => item.type === "phone")?.count, 1);
});

test("redacts labelled names, addresses, dates, and account identifiers", () => {
  const result = redactText(
    "Name: Asha Mehta\nDOB: 12/08/1993\nAddress: 14 Lake View Road, Pune 411001\nAccount number: 12345678901",
  );

  assert.equal(
    result.output,
    "Name: [NAME_1]\nDOB: [DOB_1]\nAddress: [ADDRESS_1]\nAccount number: [BANK_ACCOUNT_1]",
  );
});

test("honours enabled detector selection", () => {
  const result = redactText("Email asha@example.com or call +91 98765 43210", {
    enabledTypes: ["email"],
  });

  assert.equal(result.output, "Email [EMAIL_1] or call +91 98765 43210");
  assert.equal(result.total, 1);
});

test("detects common secrets and never includes raw values in a safe report", () => {
  const secret = "sk-proj-example1234567890ABCDEFG";
  const result = redactText(`API key: ${secret}`);
  const report = JSON.stringify(buildSafeReport(result, "label"));

  assert.equal(result.output, "API key: [SECRET_1]");
  assert.equal(JSON.stringify(result.matches).includes(secret), false);
  assert.equal(report.includes(secret), false);
});

test("partial and remove modes produce safe deterministic replacements", () => {
  const source = "Email: asha@example.com";

  assert.equal(redactText(source, { mode: "partial" }).output, "Email: a•••@e••••••.com");
  assert.equal(redactText(source, { mode: "remove" }).output, "Email: [REDACTED]");
});
