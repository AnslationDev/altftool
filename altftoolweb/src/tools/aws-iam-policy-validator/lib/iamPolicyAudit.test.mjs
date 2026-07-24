import assert from "node:assert/strict";
import test from "node:test";

import {
  IAM_POLICY_LIMITATIONS,
  IAM_POLICY_LIMITS,
  analyzeIamPolicyText,
  buildIamPolicyReport,
} from "./iamPolicyAudit.mjs";

test("flags broad Allow, PassRole, privilege management, and missing condition", () => {
  const result = analyzeIamPolicyText(
    JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: ["iam:PassRole", "iam:AttachRolePolicy"],
          Resource: "*",
        },
      ],
    }),
  );

  const codes = new Set(result.findings.map((finding) => finding.code));
  assert.equal(result.valid, true);
  assert.ok(codes.has("allow-pass-role"));
  assert.ok(codes.has("allow-privilege-management"));
  assert.ok(codes.has("allow-all-resources"));
  assert.ok(codes.has("sensitive-action-without-condition"));
  assert.ok(result.counts.high >= 3);
});

test("flags Allow with NotAction and NotResource as broad selectors", () => {
  const result = analyzeIamPolicyText(
    JSON.stringify({
      Statement: {
        Effect: "Allow",
        NotAction: "iam:DeleteUser",
        NotResource: "arn:aws:s3:::example-private/*",
      },
    }),
  );
  const codes = result.findings.map((finding) => finding.code);
  assert.ok(codes.includes("allow-not-action"));
  assert.ok(codes.includes("allow-not-resource"));
});

test("distinguishes an exact action from wildcard action patterns", () => {
  const exact = analyzeIamPolicyText(
    JSON.stringify({
      Statement: {
        Effect: "Allow",
        Action: "s3:GetObject",
        Resource: "arn:aws:s3:::example/*",
        Condition: { StringEquals: { "aws:PrincipalOrgID": "o-example" } },
      },
    }),
  );
  assert.equal(exact.counts.high, 0);
  assert.equal(exact.counts.medium, 0);

  const wildcard = analyzeIamPolicyText(
    JSON.stringify({
      Statement: {
        Effect: "Allow",
        Action: "s3:Get*",
        Resource: "arn:aws:s3:::example/*",
      },
    }),
  );
  assert.ok(
    wildcard.findings.some(
      (finding) => finding.code === "allow-action-pattern",
    ),
  );
});

test("does not treat Deny wildcards as broad Allow findings", () => {
  const result = analyzeIamPolicyText(
    JSON.stringify({
      Statement: { Effect: "Deny", Action: "*", Resource: "*" },
    }),
  );
  assert.equal(result.counts.high, 0);
  assert.equal(result.counts.medium, 0);
});

test("returns a calibrated invalid-json result without echoing input", () => {
  const secret = "not-json-super-secret";
  const result = analyzeIamPolicyText(`{${secret}`);
  assert.equal(result.valid, false);
  assert.equal(result.inputError, "The pasted content is not valid JSON.");
  assert.doesNotMatch(JSON.stringify(result), new RegExp(secret));
});

test("reports unsupported statement field shapes", () => {
  const result = analyzeIamPolicyText(
    JSON.stringify({
      Statement: {
        Effect: "permit",
        Action: { service: "s3" },
        Resource: [],
        Condition: [],
      },
    }),
  );
  const codes = new Set(result.findings.map((finding) => finding.code));
  assert.ok(codes.has("invalid-effect"));
  assert.ok(codes.has("invalid-action-shape"));
  assert.ok(codes.has("invalid-resource-shape"));
  assert.ok(codes.has("empty-or-invalid-condition"));
});

test("does not render a structurally malformed statement as clear", () => {
  const result = analyzeIamPolicyText(
    JSON.stringify({ Statement: [{ Effect: "allow", Resource: "*" }] }),
  );
  assert.equal(result.valid, false);
  assert.equal(result.assessment.level, "invalid");
  assert.ok(result.counts.review > 0);
});

test("flags broad resource-policy principal selectors", () => {
  const wildcard = analyzeIamPolicyText(
    JSON.stringify({
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: "*" },
          Action: "s3:GetObject",
          Resource: "arn:aws:s3:::example/*",
        },
      ],
    }),
  );
  assert.ok(
    wildcard.findings.some(
      (finding) => finding.code === "allow-all-principals",
    ),
  );
  assert.equal(wildcard.assessment.level, "action");

  const excluded = analyzeIamPolicyText(
    JSON.stringify({
      Statement: [
        {
          Effect: "Allow",
          NotPrincipal: { AWS: "arn:aws:iam::123456789012:root" },
          Action: "s3:GetObject",
          Resource: "arn:aws:s3:::example/*",
        },
      ],
    }),
  );
  assert.ok(
    excluded.findings.some(
      (finding) => finding.code === "allow-not-principal",
    ),
  );
});

test("rejects non-object roots and missing statements", () => {
  const arrayResult = analyzeIamPolicyText("[]");
  assert.equal(arrayResult.valid, false);
  assert.equal(
    arrayResult.inputError,
    "The policy root must be a non-empty JSON object.",
  );

  const missing = analyzeIamPolicyText('{"Version":"2012-10-17"}');
  assert.equal(missing.valid, false);
  assert.ok(
    missing.findings.some((finding) => finding.code === "missing-statement"),
  );
});

test("enforces character and statement limits", () => {
  assert.throws(
    () => analyzeIamPolicyText("x".repeat(IAM_POLICY_LIMITS.maxCharacters + 1)),
    RangeError,
  );
  const statements = Array.from(
    { length: IAM_POLICY_LIMITS.maxStatements + 1 },
    () => ({ Effect: "Deny", Action: "*", Resource: "*" }),
  );
  assert.throws(
    () => analyzeIamPolicyText(JSON.stringify({ Statement: statements })),
    RangeError,
  );
});

test("builds a privacy-safe counts-only report", () => {
  const sensitiveArn = "arn:aws:iam::123456789012:role/private-role-name";
  const result = analyzeIamPolicyText(
    JSON.stringify({
      Statement: {
        Effect: "Allow",
        Action: "iam:PassRole",
        Resource: sensitiveArn,
      },
    }),
  );
  const report = buildIamPolicyReport(result);
  assert.equal(report.tool, "AWS IAM Policy Validator");
  assert.deepEqual(report.limitations, [...IAM_POLICY_LIMITATIONS]);
  assert.doesNotMatch(JSON.stringify(report), /private-role-name/);
  assert.equal(report.findingCodes["allow-pass-role"], 1);
});

test("rejects non-text input", () => {
  assert.throws(() => analyzeIamPolicyText(null), TypeError);
});
